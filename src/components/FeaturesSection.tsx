'use client';

import React from 'react';
import { MessageSquareCode, Globe2, Code2, ShieldCheck, Sparkles } from 'lucide-react';

export default function FeaturesSection() {
  const features = [
    {
      icon: MessageSquareCode,
      title: 'Natural Language Processing',
      description: 'Turn everyday instructions into understandable, production-grade SQL with zero prompt engineering required.',
      badge: 'Intent Parser'
    },
    {
      icon: Globe2,
      title: 'Multi-Dialect Support',
      description: 'Generate queries for popular relational databases including PostgreSQL, MySQL, SQLite, Microsoft SQL Server, and Oracle.',
      badge: '5 Dialects'
    },
    {
      icon: Code2,
      title: 'Readable SQL',
      description: 'Produce consistently formatted SQL with syntax highlighting, clean indentation, and line numbers ready for production use.',
      badge: 'Zero Clutter'
    },
    {
      icon: ShieldCheck,
      title: 'Safer Query Generation',
      description: 'Highlight destructive operations (DELETE, DROP, UPDATE) and surface explicit assumptions before queries are copied or executed.',
      badge: 'Guardrails'
    }
  ];

  return (
    <section id="features" className="py-16 lg:py-24 border-t border-[#22252B] bg-[#050505] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111318] border border-[#22252B] mb-3 text-xs font-mono text-gray-400">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>CAPABILITIES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#F5F7FA]">
            Built for modern engineering standards
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#9CA3AF]">
            Engineered from the ground up for precision, safety, and multi-database compatibility.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={idx}
                className="group relative rounded-2xl border border-[#22252B] hover:border-[#0047AB] bg-[#0D0D0D] p-6 shadow-xl hover:shadow-[0_0_30px_rgba(0,71,171,0.2)] transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-10 h-10 rounded-xl bg-[#111318] border border-[#22252B] group-hover:border-[#0047AB] flex items-center justify-center transition-colors">
                      <IconComponent className="w-5 h-5 text-blue-400 group-hover:text-blue-300 transition-colors" />
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[#161920] text-gray-400 border border-[#22252B]">
                      {feature.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-[#F5F7FA] mb-2 group-hover:text-blue-400 transition-colors">
                    {feature.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-[#1C1F26] flex items-center text-[11px] font-mono text-gray-500">
                  <span>Engineered with strict safety</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
