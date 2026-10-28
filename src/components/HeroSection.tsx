'use client';

import React from 'react';
import { ArrowRight, Sparkles, Terminal, Copy, Check, ShieldCheck, Zap } from 'lucide-react';
import { SQLDialect } from '@/types/sqlflow';

interface HeroSectionProps {
  onStartGenerating: () => void;
  onExploreExamples: () => void;
  onTrySamplePrompt: (prompt: string, dialect: SQLDialect) => void;
}

export default function HeroSection({
  onStartGenerating,
  onExploreExamples,
  onTrySamplePrompt
}: HeroSectionProps) {
  const [copied, setCopied] = React.useState(false);

  const samplePrompt = "Find the top 5 highest spending customers who ordered in 2024";
  const sampleSql = `SELECT 
  c.customer_id,
  c.first_name,
  c.last_name,
  SUM(o.total_amount) AS total_spent
FROM customers c
INNER JOIN orders o ON c.customer_id = o.customer_id
WHERE o.order_date >= '2024-01-01'
  AND o.status = 'completed'
GROUP BY c.customer_id, c.first_name, c.last_name
ORDER BY total_spent DESC
LIMIT 5;`;

  const copySample = async () => {
    try {
      await navigator.clipboard.writeText(sampleSql);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-[#22252B]">
      {/* Background radial glow */}
      <div 
        className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#0047AB]/15 blur-[120px] rounded-full" 
        aria-hidden="true"
      />
      <div 
        className="pointer-events-none absolute inset-0 hydra-grid opacity-40" 
        aria-hidden="true" 
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-6">
          
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111318] border border-[#22252B] shadow-inner text-xs font-mono text-gray-300">
            <span className="flex h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="tracking-widest uppercase text-[11px] font-semibold text-blue-400">
              AI-POWERED SQL WORKSPACE
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#F5F7FA] leading-[1.15]">
            From plain English to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-400 drop-shadow-[0_0_25px_rgba(0,71,171,0.4)]">
              powerful SQL.
            </span>
          </h1>

          {/* Supporting text */}
          <p className="text-lg sm:text-xl text-[#9CA3AF] max-w-2xl leading-relaxed">
            Describe what you want to do with your data. Get clean, readable, dialect-optimized SQL in seconds.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={onStartGenerating}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#0047AB] hover:bg-[#0056d6] text-white font-medium text-base transition-all shadow-[0_0_30px_rgba(0,71,171,0.4)] hover:shadow-[0_0_40px_rgba(0,71,171,0.6)] active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4 text-blue-200" />
              <span>Generate SQL</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onExploreExamples}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#111318] hover:bg-[#161920] text-gray-200 hover:text-white font-medium text-base border border-[#22252B] hover:border-[#333842] transition-all"
            >
              <span>Explore Examples</span>
            </button>
          </div>

          {/* Trust line */}
          <div className="flex items-center gap-2 pt-2 text-xs text-gray-500 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Built for developers, analysts, students, and data teams.</span>
          </div>
        </div>

        {/* Visual Preview of the Application */}
        <div className="mt-12 lg:mt-16 max-w-4xl mx-auto">
          <div className="relative rounded-2xl border border-[#22252B] bg-[#0D0D0D] shadow-2xl overflow-hidden blue-glow-subtle group">
            {/* Top terminal bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#111318] border-b border-[#22252B]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#2A2E38]" />
                <span className="w-3 h-3 rounded-full bg-[#2A2E38]" />
                <span className="w-3 h-3 rounded-full bg-[#2A2E38]" />
                <span className="ml-2 font-mono text-xs text-gray-400 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-blue-400" />
                  sqlflow-workspace.preview
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#0047AB]/20 text-blue-400 border border-[#0047AB]/40">
                  PostgreSQL 16
                </span>
                <button
                  onClick={() => onTrySamplePrompt(samplePrompt, 'postgresql')}
                  className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded text-xs bg-[#1E222D] hover:bg-blue-900/40 text-blue-300 hover:text-blue-200 border border-[#2A2E38] transition-colors"
                >
                  <Zap className="w-3 h-3 text-blue-400" />
                  <span>Try in Editor</span>
                </button>
              </div>
            </div>

            {/* Simulated Two-panel display */}
            <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-[#22252B]">
              {/* Natural language query prompt */}
              <div className="md:col-span-5 p-5 bg-[#0D0D0D] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase tracking-wider font-semibold text-gray-400">
                      User Prompt
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/40">
                      Analyzed
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#111318] border border-[#22252B] text-sm text-[#F5F7FA] font-medium leading-relaxed">
                    &ldquo;{samplePrompt}&rdquo;
                  </div>
                  <div className="mt-4 space-y-2 text-xs text-gray-400">
                    <div className="flex items-center justify-between text-[11px] py-1 border-b border-[#1A1D24]">
                      <span>Target Entity:</span>
                      <span className="font-mono text-gray-200">customers, orders</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] py-1 border-b border-[#1A1D24]">
                      <span>Operation:</span>
                      <span className="font-mono text-blue-400">Aggregated INNER JOIN</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] py-1">
                      <span>Safety Assessment:</span>
                      <span className="font-mono text-emerald-400">Safe (Read-Only SELECT)</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => onTrySamplePrompt(samplePrompt, 'postgresql')}
                    className="w-full py-2 px-3 rounded-lg bg-[#111318] hover:bg-[#161920] border border-[#22252B] hover:border-[#0047AB] text-xs font-medium text-gray-300 hover:text-white transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Load prompt into workspace</span>
                    <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
                  </button>
                </div>
              </div>

              {/* Generated SQL snippet */}
              <div className="md:col-span-7 p-5 bg-[#090A0D] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase tracking-wider font-semibold text-blue-400 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3" />
                      Generated Output
                    </span>
                    <button
                      onClick={copySample}
                      className="flex items-center gap-1 text-[11px] font-mono text-gray-400 hover:text-white transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy SQL</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#050505] border border-[#22252B] font-mono text-xs text-gray-300 leading-relaxed overflow-x-auto">
                    <pre className="text-gray-200">
                      <code>
                        <span className="text-blue-400 font-semibold">SELECT</span>{"\n"}
                        {"  "}c.customer_id,{"\n"}
                        {"  "}c.first_name,{"\n"}
                        {"  "}c.last_name,{"\n"}
                        {"  "}<span className="text-purple-400 font-medium">SUM</span>(o.total_amount) <span className="text-blue-400 font-semibold">AS</span> total_spent{"\n"}
                        <span className="text-blue-400 font-semibold">FROM</span> customers c{"\n"}
                        <span className="text-blue-400 font-semibold">INNER JOIN</span> orders o <span className="text-blue-400 font-semibold">ON</span> c.customer_id = o.customer_id{"\n"}
                        <span className="text-blue-400 font-semibold">WHERE</span> o.order_date {'>'}= <span className="text-emerald-400">'2024-01-01'</span>{"\n"}
                        {"  "}<span className="text-blue-400 font-semibold">AND</span> o.status = <span className="text-emerald-400">'completed'</span>{"\n"}
                        <span className="text-blue-400 font-semibold">GROUP BY</span> c.customer_id, c.first_name, c.last_name{"\n"}
                        <span className="text-blue-400 font-semibold">ORDER BY</span> total_spent <span className="text-blue-400 font-semibold">DESC</span>{"\n"}
                        <span className="text-blue-400 font-semibold">LIMIT</span> <span className="text-amber-400">5</span>;
                      </code>
                    </pre>
                  </div>
                </div>

                <div className="pt-3 text-[11px] text-gray-500 font-mono flex items-center justify-between">
                  <span>Latency: ~340ms</span>
                  <span className="text-gray-400">100% ANSI / PostgreSQL Compliant</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
