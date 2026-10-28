'use client';

import React, { useState } from 'react';
import { X, Settings, Key, Cpu, ShieldCheck, Check } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
  provider: 'gemini' | 'openai' | 'auto';
  onSaveProvider: (provider: 'gemini' | 'openai' | 'auto') => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey,
  provider,
  onSaveProvider
}: SettingsModalProps) {
  const [tempKey, setTempKey] = useState(apiKey);
  const [tempProvider, setTempProvider] = useState<'gemini' | 'openai' | 'auto'>(provider);
  const [savedNotice, setSavedNotice] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveApiKey(tempKey.trim());
    onSaveProvider(tempProvider);
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="w-full max-w-md bg-[#0D0D0D] border border-[#22252B] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#22252B] bg-[#111318]">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-[#F5F7FA]">AI Engine Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded hover:bg-[#1A1D24] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4 text-xs text-gray-300">
          <div>
            <label className="block text-gray-300 font-medium mb-1.5 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-blue-400" />
              <span>AI Provider Mode</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTempProvider('auto')}
                className={`py-2 px-2.5 rounded-lg border text-center transition-all ${
                  tempProvider === 'auto'
                    ? 'bg-[#0047AB]/20 border-[#0047AB] text-blue-300 font-semibold'
                    : 'bg-[#111318] border-[#22252B] text-gray-400 hover:text-gray-200'
                }`}
              >
                Auto / Hybrid
              </button>
              <button
                type="button"
                onClick={() => setTempProvider('gemini')}
                className={`py-2 px-2.5 rounded-lg border text-center transition-all ${
                  tempProvider === 'gemini'
                    ? 'bg-[#0047AB]/20 border-[#0047AB] text-blue-300 font-semibold'
                    : 'bg-[#111318] border-[#22252B] text-gray-400 hover:text-gray-200'
                }`}
              >
                Gemini 2.5
              </button>
              <button
                type="button"
                onClick={() => setTempProvider('openai')}
                className={`py-2 px-2.5 rounded-lg border text-center transition-all ${
                  tempProvider === 'openai'
                    ? 'bg-[#0047AB]/20 border-[#0047AB] text-blue-300 font-semibold'
                    : 'bg-[#111318] border-[#22252B] text-gray-400 hover:text-gray-200'
                }`}
              >
                OpenAI
              </button>
            </div>
            <p className="mt-1.5 text-[11px] text-gray-500">
              If no API key is provided, SQLFLOW operates in built-in offline smart heuristic mode.
            </p>
          </div>

          <div>
            <label className="block text-gray-300 font-medium mb-1.5 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-blue-400" />
              <span>Custom API Key (Optional)</span>
            </label>
            <input
              type="password"
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              placeholder="e.g. AIzaSy... or sk-..."
              className="w-full bg-[#111318] border border-[#22252B] rounded-lg px-3 py-2 text-gray-200 font-mono text-xs focus:border-[#0047AB] focus:ring-1 focus:ring-[#0047AB] outline-none"
            />
            <p className="mt-1 text-[11px] text-gray-500">
              Never exposed to the public. Only transmitted to the server route during your active session.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-[#111318] border border-[#22252B] flex items-start gap-2 text-[11px] text-gray-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              Production deployments can also set <code>GEMINI_API_KEY</code> or <code>OPENAI_API_KEY</code> in server environment variables.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-[#111318] border-t border-[#22252B] flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setTempKey('');
              onSaveApiKey('');
            }}
            className="text-xs text-gray-400 hover:text-gray-200 transition-colors"
          >
            Reset to Demo Mode
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0047AB] hover:bg-[#0056d6] text-white text-xs font-medium transition-colors"
          >
            {savedNotice ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span>Saved!</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
