'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  Database,
  Layers,
  ChevronDown,
  ChevronUp,
  FileCode,
  ShieldAlert,
  Loader2,
  Trash2
} from 'lucide-react';
import { SQL_DIALECTS, SCHEMA_PRESETS, EXAMPLE_PROMPTS } from '@/lib/constants';
import { GenerateResponse, HistoryItem, SQLDialect } from '@/types/sqlflow';
import SqlCodeViewer from '@/components/SqlCodeViewer';

interface GeneratorWorkspaceProps {
  initialPrompt?: string;
  initialDialect?: SQLDialect;
  onSaveToHistory: (item: HistoryItem) => void;
  apiKey?: string;
  provider?: 'gemini' | 'openai' | 'auto';
  onOpenSettings?: () => void;
}

export default function GeneratorWorkspace({
  initialPrompt = '',
  initialDialect = 'postgresql',
  onSaveToHistory,
  apiKey,
  provider = 'auto',
  onOpenSettings
}: GeneratorWorkspaceProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [dialect, setDialect] = useState<SQLDialect>(initialDialect);
  const [schemaText, setSchemaText] = useState('');
  const [selectedSchemaPreset, setSelectedSchemaPreset] = useState<string>('students');
  const [isSchemaOpen, setIsSchemaOpen] = useState(false);

  // Generation status
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateResponse | null>(null);

  // Sync initial prompt if passed
  useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
    }
  }, [initialPrompt]);

  useEffect(() => {
    if (initialDialect) {
      setDialect(initialDialect);
    }
  }, [initialDialect]);

  // Set default schema
  useEffect(() => {
    const preset = SCHEMA_PRESETS.find(p => p.id === selectedSchemaPreset);
    if (preset) {
      setSchemaText(preset.ddl);
    }
  }, [selectedSchemaPreset]);

  // Handle generation
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please provide a plain-English query instruction.');
      return;
    }

    setLoading(true);
    setError(null);
    setLoadingStep('Interpreting natural language intent...');

    const stepTimer1 = setTimeout(() => {
      setLoadingStep('Mapping tables, columns, and relations...');
    }, 450);

    const stepTimer2 = setTimeout(() => {
      setLoadingStep(`Synthesizing ${dialect.toUpperCase()} dialect query...`);
    }, 900);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          dialect,
          schema: isSchemaOpen ? schemaText : '',
          apiKey,
          provider
        })
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}));
        throw new Error(errorJson.error || `Server responded with status ${res.status}`);
      }

      const data: GenerateResponse = await res.json();
      setResult(data);

      // Save to query history
      const historyItem: HistoryItem = {
        id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        timestamp: Date.now(),
        prompt: prompt.trim(),
        sql: data.sql,
        dialect: data.dialect,
        isDestructive: data.isDestructive,
        explanation: data.explanation,
        schemaSnippet: isSchemaOpen ? schemaText.slice(0, 80) : undefined
      };
      onSaveToHistory(historyItem);

    } catch (err: any) {
      setError(err?.message || 'Failed to generate SQL query.');
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  // Keyboard shortcut Ctrl+Enter or Cmd+Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleGenerate();
    }
  };

  // Quick prompt chip click
  const handleChipClick = (examplePrompt: string, suggestedDialect?: SQLDialect, schemaId?: string) => {
    setPrompt(examplePrompt);
    if (suggestedDialect) {
      setDialect(suggestedDialect);
    }
    if (schemaId) {
      setSelectedSchemaPreset(schemaId);
      setIsSchemaOpen(true);
    }
    setError(null);
  };

  const currentDialectInfo = SQL_DIALECTS.find(d => d.id === dialect) || SQL_DIALECTS[0];

  return (
    <section id="generator" className="py-12 lg:py-16 bg-[#050505] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-[#22252B] gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-blue-400">
                Core Workspace
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F5F7FA]">
              Natural Language to SQL Generator
            </h2>
            <p className="text-sm text-[#9CA3AF] mt-1">
              Formulate your query in standard English. SQLFLOW handles syntax, dialects, and safety guards.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-gray-400">Target Dialect:</span>
            <select
              value={dialect}
              onChange={(e) => setDialect(e.target.value as SQLDialect)}
              className="bg-[#111318] text-[#F5F7FA] text-xs font-medium px-3 py-1.5 rounded-lg border border-[#22252B] hover:border-[#333842] focus:outline-none focus:border-[#0047AB] transition-colors"
            >
              {SQL_DIALECTS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.version})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Two-Panel Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ========================================= */}
          {/* LEFT PANEL: Natural Language Input        */}
          {/* ========================================= */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            <div className="rounded-2xl border border-[#22252B] bg-[#0D0D0D] p-5 shadow-xl flex flex-col">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#22252B] mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-[#161920] border border-[#22252B]">
                    <FileCode className="w-4 h-4 text-blue-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-[#F5F7FA]">Describe your query</h3>
                </div>
                
                {prompt.length > 0 && (
                  <button
                    onClick={() => setPrompt('')}
                    className="text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1"
                    title="Clear prompt"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                )}
              </div>

              {/* Multiline Input */}
              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g. Find the top 10 students with the highest marks..."
                  rows={5}
                  maxLength={1000}
                  className="w-full bg-[#111318] text-[#F5F7FA] placeholder-gray-500 rounded-xl p-3.5 text-sm border border-[#22252B] focus:border-[#0047AB] focus:ring-1 focus:ring-[#0047AB] outline-none transition-all resize-y min-h-[120px]"
                />

                {/* Character Counter & Keyboard Hint */}
                <div className="flex items-center justify-between mt-1.5 px-1 text-[11px] font-mono text-gray-500">
                  <span>Press <kbd className="px-1 py-0.5 rounded bg-[#161920] border border-[#22252B] text-gray-400">Ctrl</kbd> + <kbd className="px-1 py-0.5 rounded bg-[#161920] border border-[#22252B] text-gray-400">Enter</kbd></span>
                  <span>{prompt.length} / 1000</span>
                </div>
              </div>

              {/* Example Prompt Chips */}
              <div className="mt-4 pt-3 border-t border-[#1C1F26]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-400">Quick Prompts</span>
                  <span className="text-[10px] text-gray-500">Click to populate</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {EXAMPLE_PROMPTS.slice(0, 4).map((ex) => (
                    <button
                      key={ex.id}
                      type="button"
                      onClick={() => handleChipClick(ex.prompt, ex.dialect, ex.schemaContext)}
                      className="px-2.5 py-1 rounded-lg text-xs bg-[#14171F] hover:bg-[#1E2330] text-gray-300 hover:text-[#F5F7FA] border border-[#22252B] transition-all text-left truncate max-w-full"
                    >
                      {ex.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Schema & Context Accordion */}
              <div className="mt-4 pt-3 border-t border-[#1C1F26]">
                <button
                  type="button"
                  onClick={() => setIsSchemaOpen(!isSchemaOpen)}
                  className="w-full flex items-center justify-between p-2 rounded-lg bg-[#111318] hover:bg-[#161920] text-xs font-medium text-gray-300 border border-[#22252B] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Database className="w-3.5 h-3.5 text-blue-400" />
                    <span>Database Schema Context</span>
                    {isSchemaOpen && (
                      <span className="px-1.5 py-0.2 rounded bg-blue-950/70 text-blue-300 text-[10px] border border-blue-800/50">
                        Active
                      </span>
                    )}
                  </div>
                  {isSchemaOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>

                {isSchemaOpen && (
                  <div className="mt-2.5 p-3 rounded-xl bg-[#08090C] border border-[#22252B] space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] text-gray-400">
                      <span>Select Schema Preset:</span>
                      <div className="flex gap-1">
                        {SCHEMA_PRESETS.map((preset) => (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => {
                              setSelectedSchemaPreset(preset.id);
                              setSchemaText(preset.ddl);
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                              selectedSchemaPreset === preset.id
                                ? 'bg-[#0047AB]/20 border-[#0047AB] text-blue-300'
                                : 'bg-[#111318] border-[#22252B] text-gray-400 hover:text-gray-200'
                            }`}
                          >
                            {preset.name.split(' ')[0]}
                          </button>
                        ))}
                      </div>
                    </div>

                    <textarea
                      value={schemaText}
                      onChange={(e) => setSchemaText(e.target.value)}
                      rows={5}
                      spellCheck="false"
                      placeholder="Paste CREATE TABLE DDL or column definitions..."
                      className="w-full bg-[#050505] text-gray-300 font-mono text-xs p-2.5 rounded-lg border border-[#22252B] focus:border-[#0047AB] outline-none"
                    />
                    <div className="text-[10px] text-gray-500">
                      Supplying schemas guides table and column mapping, preventing hallucinations.
                    </div>
                  </div>
                )}
              </div>

              {/* Dialect Selector Chips */}
              <div className="mt-4 pt-3 border-t border-[#1C1F26]">
                <div className="text-xs font-medium text-gray-400 mb-2">Target SQL Dialect</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {SQL_DIALECTS.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDialect(d.id)}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all border ${
                        dialect === d.id
                          ? 'bg-[#0047AB]/20 border-[#0047AB] text-blue-300 shadow-[0_0_10px_rgba(0,71,171,0.2)]'
                          : 'bg-[#111318] border-[#22252B] text-gray-400 hover:text-gray-200 hover:border-[#333842]'
                      }`}
                    >
                      <span className="font-sans font-medium">{d.name.split(' ')[0]}</span>
                      <span className="text-[10px] opacity-75">{d.badge}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <div className="mt-5">
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={loading || !prompt.trim()}
                  className={`w-full py-3.5 px-4 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                    loading || !prompt.trim()
                      ? 'bg-[#161920] text-gray-500 border border-[#22252B] cursor-not-allowed'
                      : 'bg-[#0047AB] hover:bg-[#0056d6] text-white shadow-[0_0_25px_rgba(0,71,171,0.35)] hover:shadow-[0_0_35px_rgba(0,71,171,0.5)] active:scale-[0.98]'
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-blue-300" />
                      <span>{loadingStep || 'Generating SQL...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-blue-200" />
                      <span>Generate SQL</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Error Message if any */}
              {error && (
                <div className="mt-3 p-3 rounded-lg bg-red-950/40 border border-red-800/40 text-red-300 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold">Generation Failed</div>
                    <div className="text-red-300/90 mt-0.5">{error}</div>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* ========================================= */}
          {/* RIGHT PANEL: Generated SQL & Breakdown   */}
          {/* ========================================= */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            <div className="rounded-2xl border border-[#22252B] bg-[#0D0D0D] p-5 shadow-xl flex flex-col min-h-[500px]">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#22252B] mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-[#161920] border border-[#22252B]">
                    <Database className="w-4 h-4 text-blue-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-[#F5F7FA]">Generated SQL</h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#161920] text-gray-300 border border-[#22252B]">
                    {currentDialectInfo.name} ({currentDialectInfo.version})
                  </span>

                  {result && (
                    <button
                      onClick={handleGenerate}
                      disabled={loading}
                      className="p-1.5 rounded-md bg-[#161920] hover:bg-[#1E222D] text-gray-400 hover:text-white border border-[#22252B] transition-colors"
                      title="Regenerate query"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Safety Warning Banner if destructive */}
              {result?.isDestructive && (
                <div className="mb-4 p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/40 text-amber-300 flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-bold text-amber-200 uppercase tracking-wide">
                      Safety Warning: {result.destructiveAction || 'Destructive'} Operation
                    </span>
                    <p className="mt-0.5 text-amber-300/90 leading-relaxed">
                      This query can modify or permanently delete data. Review it carefully before running on production databases.
                    </p>
                  </div>
                </div>
              )}

              {/* Main Content States: Loading, Result, or Empty */}
              {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4 rounded-xl border border-[#22252B] bg-[#0A0B0E]">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin" />
                    <Sparkles className="w-5 h-5 text-blue-400 absolute inset-0 m-auto" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-200">
                      {loadingStep || 'Synthesizing query...'}
                    </p>
                    <p className="text-xs text-gray-500 font-mono">
                      Target: {currentDialectInfo.name}
                    </p>
                  </div>
                </div>
              ) : result ? (
                <div className="flex flex-col gap-4">
                  
                  {/* Code Viewer component */}
                  <SqlCodeViewer
                    sql={result.sql}
                    dialect={dialect}
                    onSqlChange={(newSql) => {
                      setResult({ ...result, sql: newSql });
                    }}
                    onRegenerate={handleGenerate}
                    isGenerating={loading}
                  />

                  {/* Engine attribution banner */}
                  <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#111318] border border-[#22252B] text-[11px] font-mono text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                      <span>
                        Generated via:{' '}
                        <strong className="text-gray-200">
                          {result.engine === 'gemini'
                            ? 'Google Gemini 2.5 Flash'
                            : result.engine === 'openai'
                            ? 'OpenAI GPT-4o'
                            : 'SQLFLOW Smart Heuristic Engine (Demo Mode)'}
                        </strong>
                      </span>
                    </div>

                    {result.engine === 'heuristic-engine' && onOpenSettings && (
                      <button
                        onClick={onOpenSettings}
                        className="text-blue-400 hover:text-blue-300 underline font-sans text-xs"
                      >
                        Add API Key
                      </button>
                    )}
                  </div>

                  {/* Query Explanation Section */}
                  <div className="space-y-3 pt-2">
                    {/* What this query does */}
                    <div className="p-4 rounded-xl bg-[#111318] border border-[#22252B]">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                        What this query does
                      </h4>
                      <p className="text-sm text-gray-300 leading-relaxed">
                        {result.explanation}
                      </p>
                    </div>

                    {/* Assumptions */}
                    {result.assumptions && result.assumptions.length > 0 && (
                      <div className="p-4 rounded-xl bg-[#111318] border border-[#22252B]">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 flex items-center gap-1.5">
                          <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
                          Assumptions & Schema Inferences
                        </h4>
                        <ul className="list-disc list-inside space-y-1 text-xs text-gray-300">
                          {result.assumptions.map((assumption, idx) => (
                            <li key={idx} className="leading-relaxed">
                              {assumption}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Potential Risks */}
                    {result.risks && result.risks.length > 0 && (
                      <div className="p-4 rounded-xl bg-[#111318] border border-[#22252B]">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                          Potential Risks & Performance Notes
                        </h4>
                        <ul className="list-disc list-inside space-y-1 text-xs text-gray-300">
                          {result.risks.map((risk, idx) => (
                            <li key={idx} className="leading-relaxed">
                              {risk}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                </div>
              ) : (
                /* Empty state */
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-[#22252B] bg-[#08090C] text-gray-500">
                  <div className="w-12 h-12 rounded-xl bg-[#111318] border border-[#22252B] flex items-center justify-center mb-3">
                    <Database className="w-6 h-6 text-gray-500" />
                  </div>
                  <h4 className="text-sm font-semibold text-gray-300">Ready to synthesize SQL</h4>
                  <p className="text-xs text-gray-500 max-w-sm mt-1">
                    Describe your required query on the left or click an example prompt chip to generate an optimized, dialect-specific query.
                  </p>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
