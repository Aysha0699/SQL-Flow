export type SQLDialect = 'postgresql' | 'mysql' | 'sqlite' | 'sqlserver' | 'oracle';

export interface DialectInfo {
  id: SQLDialect;
  name: string;
  version: string;
  description: string;
  badge: string;
}

export interface GenerateRequest {
  prompt: string;
  dialect: SQLDialect;
  schema?: string;
  apiKey?: string;
  provider?: 'gemini' | 'openai' | 'auto';
}

export interface GenerateResponse {
  sql: string;
  explanation: string;
  assumptions: string[];
  risks?: string[];
  isDestructive: boolean;
  destructiveAction?: string;
  dialect: SQLDialect;
  engine: 'gemini' | 'openai' | 'heuristic-engine';
  executionPlanSummary?: string;
  tableReferences?: string[];
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  prompt: string;
  sql: string;
  dialect: SQLDialect;
  isDestructive: boolean;
  explanation: string;
  schemaSnippet?: string;
}

export interface ExamplePrompt {
  id: string;
  category: 'Clean-up' | 'Analytics' | 'Reporting' | 'Joins' | 'Updates';
  title: string;
  prompt: string;
  dialect: SQLDialect;
  schemaContext?: string;
  isDestructive?: boolean;
}

export interface SchemaPreset {
  id: string;
  name: string;
  description: string;
  ddl: string;
}
