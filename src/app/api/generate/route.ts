import { NextRequest, NextResponse } from 'next/server';
import { GenerateRequest, GenerateResponse, SQLDialect } from '@/types/sqlflow';
import { detectDestructiveOperation, generateHeuristicSql } from '@/lib/sqlEngine';


export async function POST(req: NextRequest) {
  try {
    const body: GenerateRequest = await req.json();
    const { prompt, dialect = 'postgresql', schema = '', apiKey, provider } = body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'Prompt is required and cannot be empty.' },
        { status: 400 }
      );
    }

    // Determine API Key and active provider
    const geminiKey = apiKey || process.env.GEMINI_API_KEY;
    const openaiKey = apiKey || process.env.OPENAI_API_KEY;

    const useGemini = Boolean(geminiKey && (provider === 'gemini' || !provider || provider === 'auto'));
    const useOpenAI = Boolean(openaiKey && (provider === 'openai' || (!useGemini && provider === 'auto')));

    // 1. If Gemini key is available, call Gemini API
    if (useGemini && geminiKey) {
      try {
        const response = await callGeminiApi(prompt, dialect, schema, geminiKey);
        return NextResponse.json(response);
      } catch (geminiError: any) {
        console.warn('Gemini API call failed, falling back to heuristic engine:', geminiError?.message);
        // Fall back gracefully with clear attribution
      }
    }

    // 2. If OpenAI key is available, call OpenAI API
    if (useOpenAI && openaiKey) {
      try {
        const response = await callOpenAiApi(prompt, dialect, schema, openaiKey);
        return NextResponse.json(response);
      } catch (openaiError: any) {
        console.warn('OpenAI API call failed, falling back to heuristic engine:', openaiError?.message);
      }
    }

    // 3. Fallback: Demo / Heuristic rule engine with explicit label
    const heuristicResult = generateHeuristicSql(prompt, dialect, schema);
    return NextResponse.json(heuristicResult);

  } catch (error: any) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: error?.message || 'An error occurred during SQL generation.' },
      { status: 500 }
    );
  }
}

// Gemini API integration
async function callGeminiApi(
  prompt: string,
  dialect: SQLDialect,
  schema: string,
  apiKey: string
): Promise<GenerateResponse> {
  const systemInstruction = `You are SQLFLOW, an expert principal database architect.
Your mission is to generate clean, highly readable, syntactically accurate SQL tailored to the specified database dialect.

DIALECT: ${dialect.toUpperCase()}
${schema ? `DATABASE SCHEMA:\n${schema}\n` : 'NO EXPLICIT SCHEMA PROVIDED. Derive reasonable table & column names, and explicitly declare your assumptions.'}

RULES:
1. Output MUST be a single valid JSON object with these exact keys:
   - "sql": string (indented, beautiful SQL query)
   - "explanation": string (plain language explanation of what the query accomplishes)
   - "assumptions": array of strings (every assumed table name, column, nullability check, or filter)
   - "risks": array of strings (performance risks like full table scans, or data loss hazards)
   - "isDestructive": boolean (true if query modifies or deletes data: DELETE, UPDATE, DROP, TRUNCATE, ALTER)
   - "destructiveAction": string or null (e.g. "DELETE", "UPDATE", "DROP")
   - "tableReferences": array of table names involved
2. IMPORTANT REGARDING MISSING VALUES: Do NOT assume every column is missing. If the user asks to delete or filter missing values without specifying columns, pick only the most critical identifier/contact columns or schema attributes, and state this clearly in "assumptions".
3. DIALECT SPECIFICS:
   - PostgreSQL: use LIMIT, standard ANSI quotes, ILIKE for case-insensitive
   - MySQL: use LIMIT, backticks if quoted, CONCAT()
   - SQLite: use LIMIT, standard syntax
   - Microsoft SQL Server: use TOP (N) or OFFSET/FETCH, square brackets if quoted
   - Oracle: use FETCH FIRST N ROWS ONLY, SYSDATE, double quotes
4. Format the SQL with uppercase keywords (SELECT, FROM, WHERE, JOIN, GROUP BY, etc.) and clean 2-space indentation.`;

  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [{ text: `User request: ${prompt}` }]
      }
    ],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: 'application/json'
    },
    systemInstruction: {
      parts: [{ text: systemInstruction }]
    }
  };

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
    signal: AbortSignal.timeout(15000)
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Gemini API returned status ${res.status}: ${errorText}`);
  }

  const data = await res.json();
  const rawJson = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawJson) {
    throw new Error('Empty response from Gemini API');
  }

  const parsed = JSON.parse(rawJson);
  const destructionCheck = detectDestructiveOperation(parsed.sql || '');

  return {
    sql: parsed.sql || '',
    explanation: parsed.explanation || '',
    assumptions: parsed.assumptions || [],
    risks: parsed.risks || [],
    isDestructive: parsed.isDestructive || destructionCheck.isDestructive,
    destructiveAction: parsed.destructiveAction || destructionCheck.action,
    dialect,
    engine: 'gemini',
    tableReferences: parsed.tableReferences || []
  };
}

// OpenAI API integration
async function callOpenAiApi(
  prompt: string,
  dialect: SQLDialect,
  schema: string,
  apiKey: string
): Promise<GenerateResponse> {
  const systemPrompt = `You are SQLFLOW, an expert database architect.
Generate dialect-specific SQL (${dialect.toUpperCase()}) for the user's request.
${schema ? `Schema:\n${schema}` : ''}
Respond ONLY with a JSON object:
{
  "sql": "string",
  "explanation": "string",
  "assumptions": ["string"],
  "risks": ["string"],
  "isDestructive": boolean,
  "destructiveAction": "DELETE" | "UPDATE" | "DROP" | null,
  "tableReferences": ["string"]
}`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1
    }),
    signal: AbortSignal.timeout(15000)
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`OpenAI API returned status ${res.status}: ${errorText}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  const parsed = JSON.parse(content);
  const destructionCheck = detectDestructiveOperation(parsed.sql || '');

  return {
    sql: parsed.sql || '',
    explanation: parsed.explanation || '',
    assumptions: parsed.assumptions || [],
    risks: parsed.risks || [],
    isDestructive: parsed.isDestructive || destructionCheck.isDestructive,
    destructiveAction: parsed.destructiveAction || destructionCheck.action,
    dialect,
    engine: 'openai',
    tableReferences: parsed.tableReferences || []
  };
}
