'use client';

import React from 'react';
import { X, BookOpen, ShieldAlert, Database, CheckCircle, Code2, AlertTriangle } from 'lucide-react';

interface DocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DocumentationModal({ isOpen, onClose }: DocumentationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="w-full max-w-3xl bg-[#0D0D0D] border border-[#22252B] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#22252B] bg-[#111318]">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <div>
              <h2 className="text-base font-bold text-[#F5F7FA]">SQLFLOW Documentation & Dialect Guide</h2>
              <p className="text-xs text-gray-400">Architecture, prompt design guidelines, and dialect differences</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-[#1A1D24] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-gray-300">
          
          {/* Section 1: Core Principles */}
          <div>
            <h3 className="text-base font-semibold text-[#F5F7FA] mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              1. Prompt Best Practices
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed mb-3">
              SQLFLOW translates natural language intent into deterministic SQL. For best results, follow these recommendations:
            </p>
            <ul className="space-y-2 text-xs list-disc list-inside text-gray-300 bg-[#111318] p-3.5 rounded-xl border border-[#22252B]">
              <li><strong>Be specific with attributes:</strong> Instead of &ldquo;find good customers&rdquo;, specify &ldquo;find customers who spent over $500 in 2024&rdquo;.</li>
              <li><strong>Handling Missing Values:</strong> When asking to delete or filter missing values, specify which columns count as missing (e.g. &ldquo;Delete students where email or age is null&rdquo;). If unspecified, SQLFLOW targets primary identifying columns and explicitly states the assumption.</li>
              <li><strong>Provide Database Schema:</strong> Opening the Schema drawer and providing table definitions allows the generator to use your exact table names and data types rather than generic inferences.</li>
            </ul>
          </div>

          {/* Section 2: Dialect Syntax Cheat Sheet */}
          <div>
            <h3 className="text-base font-semibold text-[#F5F7FA] mb-2 flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-400" />
              2. Supported SQL Dialects & Variations
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-[#22252B] rounded-xl overflow-hidden">
                <thead className="bg-[#111318] text-gray-300 font-mono">
                  <tr>
                    <th className="p-2.5 border-b border-[#22252B]">Dialect</th>
                    <th className="p-2.5 border-b border-[#22252B]">Row Limit Syntax</th>
                    <th className="p-2.5 border-b border-[#22252B]">Current Timestamp</th>
                    <th className="p-2.5 border-b border-[#22252B]">Identifiers</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1C1F26] font-mono text-[11px] text-gray-400">
                  <tr>
                    <td className="p-2.5 text-blue-400 font-semibold">PostgreSQL</td>
                    <td className="p-2.5">LIMIT 10</td>
                    <td className="p-2.5">NOW() / CURRENT_TIMESTAMP</td>
                    <td className="p-2.5">&quot;identifier&quot;</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-blue-400 font-semibold">MySQL</td>
                    <td className="p-2.5">LIMIT 10</td>
                    <td className="p-2.5">NOW()</td>
                    <td className="p-2.5">`identifier`</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-blue-400 font-semibold">SQLite</td>
                    <td className="p-2.5">LIMIT 10</td>
                    <td className="p-2.5">CURRENT_TIMESTAMP</td>
                    <td className="p-2.5">&quot;identifier&quot;</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-blue-400 font-semibold">SQL Server (T-SQL)</td>
                    <td className="p-2.5">SELECT TOP (10)</td>
                    <td className="p-2.5">GETDATE()</td>
                    <td className="p-2.5">[identifier]</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-blue-400 font-semibold">Oracle</td>
                    <td className="p-2.5">FETCH FIRST 10 ROWS ONLY</td>
                    <td className="p-2.5">SYSDATE</td>
                    <td className="p-2.5">&quot;identifier&quot;</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Safety Guardrails */}
          <div>
            <h3 className="text-base font-semibold text-[#F5F7FA] mb-2 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              3. Built-In Query Safety Guardrails
            </h3>
            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40 text-xs text-amber-200/90 space-y-2">
              <p>
                <strong>Destructive Operations:</strong> Any query containing <code>DELETE</code>, <code>UPDATE</code>, <code>DROP</code>, or <code>TRUNCATE</code> is prominently tagged with a safety warning.
              </p>
              <p>
                <strong>No Automatic Execution:</strong> SQLFLOW is designed purely as an intelligent generation tool. Generated SQL is never executed against live databases, preventing unintentional data destruction.
              </p>
              <p>
                <strong>Explicit Assumptions:</strong> When column conditions or joins are not explicitly given, SQLFLOW clearly enumerates its assumptions instead of masquerading them as facts.
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#111318] border-t border-[#22252B] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#0047AB] hover:bg-[#0056d6] text-white text-xs font-medium transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
