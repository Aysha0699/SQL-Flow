'use client';

import React, { useState } from 'react';
import { HistoryItem, SQLDialect } from '@/types/sqlflow';
import { History, X, Trash2, ArrowUpRight, Copy, Check, ShieldAlert, Clock } from 'lucide-react';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onRestore: (item: HistoryItem) => void;
  onClearHistory: () => void;
  onDeleteHistoryItem: (id: string) => void;
}

export default function HistoryDrawer({
  isOpen,
  onClose,
  history,
  onRestore,
  onClearHistory,
  onDeleteHistoryItem
}: HistoryDrawerProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = async (id: string, sql: string) => {
    try {
      await navigator.clipboard.writeText(sql);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const formatTimestamp = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end">
      <div 
        className="w-full max-w-md bg-[#0D0D0D] border-l border-[#22252B] h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#22252B] bg-[#111318]">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-[#F5F7FA]">Query History</h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#161920] text-gray-400 border border-[#22252B]">
              {history.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="text-xs text-gray-400 hover:text-red-400 p-1.5 rounded hover:bg-[#1A1D24] transition-colors"
                title="Clear all history"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1.5 rounded hover:bg-[#1A1D24] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center text-gray-500">
              <Clock className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm font-medium">No previous queries yet</p>
              <p className="text-xs text-gray-600 mt-1">Generated queries will be saved locally here for quick access.</p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-[#111318] border border-[#22252B] hover:border-[#333842] transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between text-[11px] font-mono text-gray-400">
                  <span className="px-1.5 py-0.2 rounded bg-[#161920] text-blue-400 border border-[#22252B]">
                    {item.dialect.toUpperCase()}
                  </span>
                  <span>{formatTimestamp(item.timestamp)}</span>
                </div>

                <div className="text-xs text-gray-200 font-medium line-clamp-2">
                  &ldquo;{item.prompt}&rdquo;
                </div>

                {/* SQL preview snippet */}
                <pre className="p-2 rounded bg-[#08090C] border border-[#1A1D24] text-[11px] font-mono text-gray-300 overflow-x-auto max-h-24">
                  <code>{item.sql}</code>
                </pre>

                {item.isDestructive && (
                  <div className="flex items-center gap-1 text-[10px] text-amber-400 font-mono">
                    <ShieldAlert className="w-3 h-3" />
                    <span>Destructive query</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-1 border-t border-[#1C1F26]">
                  <button
                    onClick={() => onRestore(item)}
                    className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-medium"
                  >
                    <span>Restore into workspace</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopy(item.id, item.sql)}
                      className="p-1 rounded text-gray-400 hover:text-white hover:bg-[#1A1D24] transition-colors"
                      title="Copy SQL"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => onDeleteHistoryItem(item.id)}
                      className="p-1 rounded text-gray-500 hover:text-red-400 hover:bg-[#1A1D24] transition-colors"
                      title="Delete from history"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-[#111318] border-t border-[#22252B] text-[11px] text-gray-500 text-center font-mono">
          Stored locally in your browser • Never sent to external tracking
        </div>
      </div>
    </div>
  );
}
