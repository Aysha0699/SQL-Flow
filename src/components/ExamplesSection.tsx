'use client';

import React from 'react';
import { EXAMPLE_PROMPTS } from '@/lib/constants';
import { ExamplePrompt, SQLDialect } from '@/types/sqlflow';
import { ArrowUpRight, Terminal, ShieldAlert, Sparkles } from 'lucide-react';

interface ExamplesSectionProps {
  onSelectPrompt: (prompt: string, dialect: SQLDialect, schemaId?: string) => void;
}

export default function ExamplesSection({ onSelectPrompt }: ExamplesSectionProps) {
  const [activeCategory, setActiveCategory] = React.useState<string>('All');

  const categories = ['All', 'Reporting', 'Analytics', 'Clean-up', 'Updates', 'Joins'];

  const filteredExamples = activeCategory === 'All'
    ? EXAMPLE_PROMPTS
    : EXAMPLE_PROMPTS.filter(ex => ex.category === activeCategory);

  return (
    <section id="examples" className="py-16 lg:py-24 border-t border-[#22252B] bg-[#08090C] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-blue-400">
                Library of Queries
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F5F7FA]">
              Interactive Example Prompts
            </h2>
            <p className="text-sm text-[#9CA3AF] mt-1">
              Select any prompt below to populate the workspace and generate dialect-specific SQL.
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-[#111318] border border-[#22252B]">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeCategory === cat
                    ? 'bg-[#0047AB] text-white shadow-sm'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#161920]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Examples Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredExamples.map((ex) => (
            <div
              key={ex.id}
              onClick={() => onSelectPrompt(ex.prompt, ex.dialect, ex.schemaContext)}
              className="group cursor-pointer rounded-2xl border border-[#22252B] hover:border-[#0047AB] bg-[#0D0D0D] p-5 shadow-lg hover:shadow-[0_0_25px_rgba(0,71,171,0.2)] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#161920] text-gray-300 border border-[#22252B]">
                    {ex.category}
                  </span>
                  {ex.isDestructive && (
                    <span className="flex items-center gap-1 text-[10px] font-mono text-amber-400 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-800/40">
                      <ShieldAlert className="w-3 h-3" />
                      Destructive
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-semibold text-[#F5F7FA] mb-2 group-hover:text-blue-400 transition-colors">
                  {ex.title}
                </h3>

                <p className="text-xs text-gray-400 leading-relaxed italic">
                  &ldquo;{ex.prompt}&rdquo;
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-[#1C1F26] flex items-center justify-between text-xs text-blue-400 font-medium">
                <span>Use in workspace</span>
                <ArrowUpRight className="w-4 h-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
