import type { Metadata } from 'next';
import React from 'react';
import ComparisonView from '@/components/ComparisonView';
import { ArrowLeftRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Compare Protocols Side-by-Side',
  description:
    'Compare any two networking protocols by OSI layer, standard port, RFC, reliability, and deployment trade-offs.',
  alternates: { canonical: '/compare' },
};

export default function ComparePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="text-center space-y-3 pt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-medium">
          <ArrowLeftRight className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
          <span>Architectural Protocol Comparison Engine</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
          Compare Protocols —{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            Side-by-Side
          </span>
        </h1>

        <p className="text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Evaluate performance trade-offs, packet overhead, reliability guarantees, and deployment use cases between any
          two protocols.
        </p>
      </div>

      <ComparisonView initialSlugA="tcp" initialSlugB="udp" />
    </div>
  );
}
