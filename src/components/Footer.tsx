'use client';

import React from 'react';
import { Database, Terminal, Shield, Heart } from 'lucide-react';

interface FooterProps {
  onOpenDocs: () => void;
  onOpenSettings: () => void;
  onScrollToTop: () => void;
}

export default function Footer({ onOpenDocs, onOpenSettings, onScrollToTop }: FooterProps) {
  return (
    <footer className="border-t border-[#22252B] bg-[#050505] text-xs text-gray-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Col 1: Brand */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#0047AB]/20 border border-[#0047AB]">
                <Database className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-base font-bold text-[#F5F7FA]">
                SQL<span className="text-blue-500">FLOW</span>
              </span>
            </div>
            <p className="text-gray-500 text-xs leading-relaxed">
              Premium natural language to SQL workspace. Designed with developer-first precision, multi-dialect support, and safety guardrails.
            </p>
          </div>

          {/* Col 2: Dialects */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-300 mb-3">
              Supported Dialects
            </h4>
            <ul className="space-y-1.5 text-xs text-gray-400">
              <li>PostgreSQL 16</li>
              <li>MySQL 8.0+</li>
              <li>SQLite 3</li>
              <li>Microsoft SQL Server (T-SQL)</li>
              <li>Oracle Database</li>
            </ul>
          </div>

          {/* Col 3: Product */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-300 mb-3">
              Navigation
            </h4>
            <ul className="space-y-1.5 text-xs text-gray-400">
              <li>
                <a href="#generator" className="hover:text-blue-400 transition-colors">
                  Workspace
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-blue-400 transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-blue-400 transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#examples" className="hover:text-blue-400 transition-colors">
                  Examples
                </a>
              </li>
              <li>
                <button onClick={onOpenDocs} className="hover:text-blue-400 transition-colors">
                  Documentation Guide
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Safety & Principles */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-300 mb-3 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              Safe by Design
            </h4>
            <p className="text-gray-500 text-[11px] leading-relaxed">
              SQLFLOW generates code purely for inspection and manual deployment. It never executes SQL against databases automatically.
            </p>
            <div className="pt-2">
              <button
                onClick={onOpenSettings}
                className="text-[11px] text-blue-400 hover:text-blue-300 underline"
              >
                Configure API & Providers
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-[#1C1F26] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-gray-500 font-mono">
          <div>
            &copy; 2026 SQLFLOW Inc. Built for developers, analysts, and data teams.
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={onScrollToTop}
              className="hover:text-gray-300 transition-colors"
            >
              Back to top ↑
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
