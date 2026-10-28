'use client';

import React from 'react';
import { PenTool, Cpu, Copy, ArrowRight, Check } from 'lucide-react';

export default function HowItWorksSection() {
  const steps = [
    {
      step: '01',
      title: 'Describe',
      subtitle: 'Plain English Intent',
      description: 'Tell SQLFLOW what you need in plain English. Provide optional schema definitions or table DDL for pin-point accuracy.',
      icon: PenTool
    },
    {
      step: '02',
      title: 'Generate',
      subtitle: 'Dialect Synthesis',
      description: 'The AI interprets your request, maps tables and columns, respects dialect-specific clauses (e.g. LIMIT vs TOP), and produces SQL.',
      icon: Cpu
    },
    {
      step: '03',
      title: 'Review & Copy',
      subtitle: 'Inspect & Deploy',
      description: 'Inspect the generated query, review safety warnings and assumptions, edit if desired, and copy or download the .sql file.',
      icon: Copy
    }
  ];

  return (
    <section id="how-it-works" className="py-16 lg:py-24 border-t border-[#22252B] bg-[#08090C] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-blue-400 px-3 py-1 rounded-full bg-[#111318] border border-[#22252B]">
            WORKFLOW
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#F5F7FA] mt-3">
            Three simple steps to clean SQL
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#9CA3AF]">
            Streamline your database workflow without wrestling with complex query syntax.
          </p>
        </div>

        {/* Timeline (Horizontal on desktop, vertical on mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          
          {/* Connecting line on desktop */}
          <div 
            className="hidden md:block absolute top-12 left-1/6 right-1/6 h-[1px] bg-gradient-to-r from-transparent via-[#0047AB] to-transparent z-0 opacity-40" 
            aria-hidden="true" 
          />

          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="relative z-10 flex flex-col items-center text-center p-6 rounded-2xl border border-[#22252B] bg-[#0D0D0D] shadow-xl hover:border-[#0047AB]/60 transition-all"
              >
                {/* Step number badge */}
                <div className="w-14 h-14 rounded-2xl bg-[#111318] border border-[#22252B] shadow-inner flex items-center justify-center mb-6 group-hover:border-[#0047AB]">
                  <Icon className="w-6 h-6 text-blue-400" />
                </div>

                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#161920] border border-[#22252B] text-[11px] font-mono text-blue-400 mb-2">
                  <span>STEP {item.step}</span>
                </div>

                <h3 className="text-lg font-bold text-[#F5F7FA] mb-1">
                  {item.title}
                </h3>
                
                <span className="text-xs font-mono text-gray-500 mb-3">
                  {item.subtitle}
                </span>

                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed max-w-xs">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
