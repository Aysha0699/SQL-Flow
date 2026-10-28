'use client';

import React, { useState } from 'react';
import { Database, Terminal, Settings, BookOpen, Layers, Zap, Menu, X, ArrowRight } from 'lucide-react';

interface NavbarProps {
  onOpenDocs: () => void;
  onOpenSettings: () => void;
  onScrollToGenerator: () => void;
  engineMode?: 'gemini' | 'openai' | 'heuristic-engine';
}

export default function Navbar({
  onOpenDocs,
  onOpenSettings,
  onScrollToGenerator,
  engineMode = 'heuristic-engine'
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getEngineBadge = () => {
    if (engineMode === 'gemini') {
      return (
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-950/60 text-blue-300 border border-blue-800/60">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
          Gemini 2.5 Active
        </span>
      );
    }
    if (engineMode === 'openai') {
      return (
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          GPT-4o Active
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#161920] text-gray-300 border border-[#22252B]">
        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
        Smart Engine
      </span>
    );
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-[#22252B] bg-[#050505]/90 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-2.5 group text-left focus:outline-none"
            >
              <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-[#0047AB]/20 border border-[#0047AB] group-hover:blue-border-glow transition-all">
                <Database className="w-5 h-5 text-blue-400 absolute" />
                <Terminal className="w-3 h-3 text-white absolute bottom-1 right-1" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-bold tracking-tight text-[#F5F7FA]">
                    SQL<span className="text-blue-500">FLOW</span>
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#161920] text-gray-400 border border-[#22252B]">
                    v1.0
                  </span>
                </div>
              </div>
            </button>
          </div>

          {/* Center Links (Desktop) */}
          <div className="hidden md:flex items-center gap-7 text-sm font-medium text-gray-400">
            <a
              href="#generator"
              className="hover:text-[#F5F7FA] transition-colors"
            >
              Workspace
            </a>
            <a
              href="#features"
              className="hover:text-[#F5F7FA] transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="hover:text-[#F5F7FA] transition-colors"
            >
              How it works
            </a>
            <a
              href="#examples"
              className="hover:text-[#F5F7FA] transition-colors"
            >
              Examples
            </a>
            <button
              onClick={onOpenDocs}
              className="flex items-center gap-1 hover:text-[#F5F7FA] transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Docs
            </button>
          </div>

          {/* Right: Actions */}
          <div className="hidden md:flex items-center gap-3">
            {getEngineBadge()}

            <button
              onClick={onOpenSettings}
              className="p-2 rounded-lg bg-[#111318] hover:bg-[#161920] text-gray-300 hover:text-white border border-[#22252B] transition-colors"
              title="API Key & Engine Settings"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              onClick={onScrollToGenerator}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0047AB] hover:bg-[#0056d6] text-white text-sm font-medium transition-all shadow-[0_0_20px_rgba(0,71,171,0.35)] hover:shadow-[0_0_25px_rgba(0,71,171,0.5)] active:scale-[0.98]"
            >
              <span>Start Generating</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-lg bg-[#111318] text-gray-300 border border-[#22252B]"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-[#111318] text-gray-300 border border-[#22252B]"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#22252B] bg-[#0D0D0D] px-4 pt-3 pb-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#22252B]">
            <span className="text-xs text-gray-400 font-mono">Status:</span>
            {getEngineBadge()}
          </div>
          <div className="flex flex-col space-y-2 text-sm text-gray-300">
            <a
              href="#generator"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-[#161920]"
            >
              Workspace
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-[#161920]"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-[#161920]"
            >
              How it works
            </a>
            <a
              href="#examples"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-[#161920]"
            >
              Examples
            </a>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenDocs();
              }}
              className="text-left px-3 py-2 rounded-md hover:bg-[#161920] flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Documentation
            </button>
          </div>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onScrollToGenerator();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#0047AB] text-white text-sm font-medium"
          >
            <span>Start Generating</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </nav>
  );
}
