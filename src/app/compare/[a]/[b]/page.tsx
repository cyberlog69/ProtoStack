import type { Metadata } from 'next';
import React from 'react';
import { notFound } from 'next/navigation';
import ComparisonView from '@/components/ComparisonView';
import { PROTOCOLS } from '@/data/protocols';
import { COMPARISON_PRESETS } from '@/data/comparisons';
import { ArrowLeftRight } from 'lucide-react';

interface CompareSlugPageProps {
  params: Promise<{ a: string; b: string }>;
}

export function generateStaticParams() {
  return COMPARISON_PRESETS.map((preset) => ({ a: preset.slugA, b: preset.slugB }));
}

export async function generateMetadata({ params }: CompareSlugPageProps): Promise<Metadata> {
  const { a, b } = await params;
  const protocolA = PROTOCOLS.find((protocol) => protocol.slug === a);
  const protocolB = PROTOCOLS.find((protocol) => protocol.slug === b);

  if (!protocolA || !protocolB) {
    return { title: 'Protocol comparison not found' };
  }

  const title = `${protocolA.name} vs ${protocolB.name}`;
  return {
    title,
    description: `Compare ${protocolA.name} (${protocolA.fullName}) and ${protocolB.name} (${protocolB.fullName}) side-by-side: layer, port, standards, strengths, and limitations.`,
    alternates: { canonical: `/compare/${protocolA.slug}/${protocolB.slug}` },
  };
}

export default async function CompareSlugPage({ params }: CompareSlugPageProps) {
  const { a, b } = await params;
  const protocolA = PROTOCOLS.find((protocol) => protocol.slug === a);
  const protocolB = PROTOCOLS.find((protocol) => protocol.slug === b);

  if (!protocolA || !protocolB) notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="text-center space-y-3 pt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-medium">
          <ArrowLeftRight className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
          <span>Architectural Protocol Comparison Engine</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
          {protocolA.name} <span className="text-slate-500 lowercase">vs</span> {protocolB.name}
        </h1>

        <p className="text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Evaluate performance trade-offs, packet overhead, reliability guarantees, and deployment use cases side-by-side.
        </p>
      </div>

      <ComparisonView initialSlugA={protocolA.slug} initialSlugB={protocolB.slug} />
    </div>
  );
}
