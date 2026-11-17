import type { Metadata } from 'next';
import Link from 'next/link';
import { REFERENCE_ENTRIES, REFERENCE_FAMILIES, countByFamily } from '@/data/reference';
import ReferenceBrowser from '@/components/ReferenceBrowser';
import { ArrowRight, Library } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Protocol reference registry',
  description: `${REFERENCE_ENTRIES.length} compact reference cards for networking standards that do not yet have a full lesson: routing, telecom, storage, industrial, management and legacy protocols.`,
  alternates: { canonical: '/reference' },
};

export default function ReferencePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <header className="space-y-4 border-b border-slate-800 pb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono">
          <Library className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{REFERENCE_ENTRIES.length} reference cards</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
          Protocol{' '}
          <span className="bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            reference registry
          </span>
        </h1>

        <p className="text-base text-slate-300 max-w-3xl leading-relaxed">
          Standards that are worth recognising but do not have a full guided lesson yet. Each card gives the layer, the
          authoritative specification, the usual port and one accurate summary — enough to place the protocol, not
          enough to implement it.
        </p>

        <p className="text-xs text-slate-400 max-w-3xl">
          These are reference entries, not lessons: they count toward the reference tier only, never the core or
          professional lesson tiers. When a card is promoted to a lesson it gains the animated flow, sandbox and quiz.
        </p>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {REFERENCE_FAMILIES.map((family) => (
            <span
              key={family.id}
              className="text-[10px] font-mono px-2 py-0.5 rounded border bg-slate-900 text-slate-400 border-slate-800"
            >
              {family.label}: {countByFamily(family.id)}
            </span>
          ))}
        </div>
      </header>

      <ReferenceBrowser />

      <div className="flex flex-wrap gap-4 pt-2 text-xs">
        <Link href="/coverage" className="inline-flex items-center gap-1 font-semibold text-cyan-300 hover:text-cyan-200">
          See how these fit into total coverage
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>
        <Link href="/start" className="inline-flex items-center gap-1 font-semibold text-indigo-300 hover:text-indigo-200">
          Start with the beginner path instead
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
