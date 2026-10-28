'use client';

import React, { useState } from 'react';
import { Check, Copy, Download, Edit3, Eye, Sparkles } from 'lucide-react';
import { format as formatSql } from 'sql-formatter';
import { SQLDialect } from '@/types/sqlflow';

interface SqlCodeViewerProps {
  sql: string;
  dialect: SQLDialect;
  onSqlChange?: (newSql: string) => void;
  onRegenerate?: () => void;
  isGenerating?: boolean;
}

export default function SqlCodeViewer({
  sql,
  dialect,
  onSqlChange,
  onRegenerate,
  isGenerating = false
}: SqlCodeViewerProps) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editableSql, setEditableSql] = useState(sql);

  // Sync state if sql prop changes
  React.useEffect(() => {
    setEditableSql(sql);
  }, [sql]);

  // Copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(isEditing ? editableSql : sql);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy SQL:', err);
    }
  };

  // Download .sql file
  const handleDownload = () => {
    const textToDownload = isEditing ? editableSql : sql;
    const blob = new Blob([textToDownload], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `query_${dialect}_${Date.now()}.sql`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Format SQL
  const handleFormat = () => {
    try {
      const languageMap: Record<SQLDialect, any> = {
        postgresql: 'postgresql',
        mysql: 'mysql',
        sqlite: 'sqlite',
        sqlserver: 'transactsql',
        oracle: 'plsql'
      };

      const formatted = formatSql(isEditing ? editableSql : sql, {
        language: languageMap[dialect] || 'sql',
        keywordCase: 'upper',
        tabWidth: 2
      });

      if (isEditing) {
        setEditableSql(formatted);
      }
      if (onSqlChange) {
        onSqlChange(formatted);
      }
    } catch (err) {
      console.warn('SQL formatting error:', err);
    }
  };

  const currentText = isEditing ? editableSql : sql;
  const lines = currentText.split('\n');

  // Syntax highlighter tokenizer
  const highlightLine = (line: string): React.ReactNode => {
    if (line.trim().startsWith('--')) {
      return <span className="text-gray-500 italic">{line}</span>;
    }

    // Simple token regex for SQL syntax
    const tokenRegex = /(--[^\n]*)|('(?:''|[^'])*')|(\b(?:SELECT|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|OUTER|CROSS|ON|GROUP\s+BY|ORDER\s+BY|HAVING|LIMIT|OFFSET|INSERT\s+INTO|VALUES|UPDATE|SET|DELETE\s+FROM|DELETE|DROP\s+TABLE|DROP|CREATE\s+TABLE|CREATE|ALTER\s+TABLE|ALTER|TRUNCATE|AND|OR|NOT|IN|IS|NULL|LIKE|ILIKE|AS|CASE|WHEN|THEN|ELSE|END|UNION|ALL|EXISTS|BETWEEN|FETCH\s+FIRST|ROWS\s+ONLY|TOP)\b)|(\b(?:COUNT|SUM|AVG|MIN|MAX|COALESCE|NOW|CURRENT_TIMESTAMP|CONCAT|LOWER|UPPER|ROUND|DATE|GETDATE|SYSDATE)\b)|(\b\d+(?:\.\d+)?\b)|([a-zA-Z_][a-zA-Z0-9_]*)|([(),;.*=><!+\-\/])/gi;

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = tokenRegex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push(line.substring(lastIndex, match.index));
      }

      const [full, comment, str, keyword, func, num, ident, symbol] = match;

      if (comment) {
        parts.push(<span key={match.index} className="text-gray-500 italic">{comment}</span>);
      } else if (str) {
        parts.push(<span key={match.index} className="text-emerald-400">{str}</span>);
      } else if (keyword) {
        parts.push(<span key={match.index} className="text-blue-400 font-semibold tracking-wide">{keyword}</span>);
      } else if (func) {
        parts.push(<span key={match.index} className="text-purple-400 font-medium">{func}</span>);
      } else if (num) {
        parts.push(<span key={match.index} className="text-amber-400">{num}</span>);
      } else if (ident) {
        parts.push(<span key={match.index} className="text-gray-200">{ident}</span>);
      } else {
        parts.push(<span key={match.index} className="text-gray-400">{symbol}</span>);
      }

      lastIndex = tokenRegex.lastIndex;
    }

    if (lastIndex < line.length) {
      parts.push(line.substring(lastIndex));
    }

    return parts;
  };

  return (
    <div className="flex flex-col h-full rounded-xl border border-[#22252B] bg-[#0D0D0D] overflow-hidden">
      {/* Top action header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#111318] border-b border-[#22252B] text-xs">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
          <span className="font-mono text-gray-400 text-[11px]">
            {isEditing ? 'Editing Mode' : 'Read-Only Mode'} • {lines.length} lines
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Format button */}
          <button
            onClick={handleFormat}
            type="button"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#161920] hover:bg-[#1E222D] text-gray-300 hover:text-white border border-[#22252B] transition-colors"
            title="Prettify and format SQL"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Format</span>
          </button>

          {/* Edit toggle */}
          <button
            onClick={() => {
              if (isEditing && onSqlChange) {
                onSqlChange(editableSql);
              }
              setIsEditing(!isEditing);
            }}
            type="button"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition-colors ${
              isEditing
                ? 'bg-[#0047AB]/20 border-[#0047AB] text-blue-400'
                : 'bg-[#161920] hover:bg-[#1E222D] text-gray-300 hover:text-white border-[#22252B]'
            }`}
            title={isEditing ? 'Switch to highlight view' : 'Tweak SQL directly'}
          >
            {isEditing ? (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Preview</span>
              </>
            ) : (
              <>
                <Edit3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Edit SQL</span>
              </>
            )}
          </button>

          {/* Copy button */}
          <button
            onClick={handleCopy}
            type="button"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition-all ${
              copied
                ? 'bg-emerald-950/60 border-emerald-600 text-emerald-300'
                : 'bg-[#161920] hover:bg-[#1E222D] text-gray-300 hover:text-white border-[#22252B]'
            }`}
            title="Copy SQL to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-gray-400" />
                <span className="hidden sm:inline">Copy</span>
              </>
            )}
          </button>

          {/* Download button */}
          <button
            onClick={handleDownload}
            type="button"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#161920] hover:bg-[#1E222D] text-gray-300 hover:text-white border border-[#22252B] transition-colors"
            title="Download .sql file"
          >
            <Download className="w-3.5 h-3.5 text-gray-400" />
            <span className="hidden sm:inline">Download</span>
          </button>
        </div>
      </div>

      {/* Editor / Code Container */}
      <div className="relative flex-1 overflow-auto p-4 font-mono text-[13.5px] leading-relaxed select-text min-h-[220px]">
        {isEditing ? (
          <textarea
            value={editableSql}
            onChange={(e) => {
              setEditableSql(e.target.value);
              if (onSqlChange) {
                onSqlChange(e.target.value);
              }
            }}
            spellCheck="false"
            className="w-full h-full min-h-[220px] bg-transparent text-gray-200 outline-none resize-none font-mono focus:ring-0 border-0 p-0"
            placeholder="Type or edit SQL here..."
          />
        ) : (
          <div className="table w-full border-collapse">
            {lines.map((line, idx) => (
              <div key={idx} className="table-row hover:bg-white/[0.02]">
                <div className="table-cell pr-4 text-right select-none text-gray-600 font-mono text-xs w-8">
                  {idx + 1}
                </div>
                <div className="table-cell whitespace-pre font-mono text-gray-200 pl-2">
                  {highlightLine(line)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
