'use client';

import React from 'react';
import Link from 'next/link';
import { Protocol } from '@/types/protocol';
import { getLayerColor, getCategoryBadge } from '@/lib/utils';
import { ArrowRight, Play, Terminal, Shield, Cpu, Network, Globe } from 'lucide-react';

interface ProtocolCardProps {
  protocol: Protocol;
}

export default function ProtocolCard({ protocol }: ProtocolCardProps) {
  const catBadge = getCategoryBadge(protocol.category);
  const layerBadge = getLayerColor(protocol.osiLayer);

  const getCategoryIcon = () => {
    switch (protocol.category) {
      case 'iot':
        return <Cpu className="w-4 h-4 text-amber-400" />;
      case 'security':
        return <Shield className="w-4 h-4 text-rose-400" />;
      case 'network':
        return <Network className="w-4 h-4 text-blue-400" />;
      default:
        return <Globe className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="glow-card group flex flex-col justify-between rounded-2xl bg-slate-900/60 border border-slate-800/80 p-6 hover:border-indigo-500/50 hover:bg-slate-900/90 transition-all duration-300">
      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${catBadge.color} flex items-center gap-1.5`}>
              {getCategoryIcon()}
              {catBadge.label}
            </span>
          </div>

          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${layerBadge}`}>
            {protocol.osiLayer}
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-1">
          <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">
            {protocol.name}
          </h3>
          {protocol.port && (
            <span className="text-xs font-mono text-slate-400">
              Port {protocol.port}
            </span>
          )}
        </div>

        <p className="text-xs font-medium text-indigo-300/80 mb-3 font-mono">
          {protocol.fullName}
        </p>

        <p className="text-sm text-slate-300/90 leading-relaxed mb-6 line-clamp-2">
          {protocol.shortSummary}
        </p>

        <div className="space-y-1.5 mb-6">
          {protocol.keyFeatures.slice(0, 2).map((feat, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
              <span className="truncate">{feat}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
        <span className="text-xs text-slate-400 flex items-center gap-1">
          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
          {protocol.interactiveSteps.length} interactive steps
        </span>

        <Link
          href={`/protocols/${protocol.slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm"
        >
          <Play className="w-3 h-3 fill-current" />
          <span>Launch Session</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}

