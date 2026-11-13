'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ComparisonView from '@/components/ComparisonView';
import { ArrowLeftRight } from 'lucide-react';

export default function CompareSlugPage() {
  const params = useParams();
  const slugA = (params?.a as string) || 'tcp';
  const slugB = (params?.b as string) || 'udp';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="text-center space-y-3 pt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-medium">
          <ArrowLeftRight className="w-3.5 h-3.5 text-cyan-400" />
          <span>Architectural Protocol Comparison Engine</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight uppercase">
          {slugA} <span className="text-slate-500 lowercase">vs</span> {slugB}
        </h1>

        <p className="text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Evaluate performance trade-offs, packet overhead, reliability guarantees, and deployment use cases side-by-side.
        </p>
      </div>

      <ComparisonView initialSlugA={slugA} initialSlugB={slugB} />
    </div>
  );
}
