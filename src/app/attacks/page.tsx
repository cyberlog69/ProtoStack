import type { Metadata } from 'next';
import Link from 'next/link';
import { ATTACKS } from '@/data/attacks';
import { ATTACK_CATEGORIES } from '@/data/attackCategories';
import AttackBrowser from '@/components/AttackBrowser';
import { ArrowRight, BookOpen, ShieldAlert, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Attack library',
  description: `${ATTACKS.length} simulated cyber-attack scenarios mapped to networking protocols, with attacker steps, detection signals and mitigations.`,
  alternates: { canonical: '/attacks' },
};

const protocolCount = new Set(ATTACKS.map((attack) => attack.protocolSlug)).size;

export default function AttacksPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <header className="space-y-4 border-b border-slate-800 pb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
          <ShieldAlert className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{ATTACKS.length} simulated attack scenarios</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
          Attack{' '}
          <span className="bg-gradient-to-r from-rose-400 via-orange-400 to-amber-400 bg-clip-text text-transparent">
            library
          </span>
        </h1>

        <p className="text-base text-slate-300 max-w-3xl leading-relaxed">
          Every protocol in the catalog has a threat model: how it is attacked in practice, what the defender can
          observe, and which control removes the precondition. Scenarios are conceptual and run entirely in the
          browser.
        </p>

        <div className="grid grid-cols-3 gap-3 max-w-xl">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
            <span className="block text-[10px] font-mono uppercase text-slate-500">Scenarios</span>
            <span className="text-xl font-black font-mono text-rose-300">{ATTACKS.length}</span>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
            <span className="block text-[10px] font-mono uppercase text-slate-500">Protocols</span>
            <span className="text-xl font-black font-mono text-cyan-300">{protocolCount}</span>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
            <span className="block text-[10px] font-mono uppercase text-slate-500">Categories</span>
            <span className="text-xl font-black font-mono text-amber-300">{ATTACK_CATEGORIES.length}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-xs text-slate-300 leading-relaxed">
            <strong className="text-amber-200">Defensive education only.</strong> These are conceptual models for
            defenders: no exploit code, payloads or tooling. Never test attacks against systems you do not own or have
            explicit written permission to assess.
          </p>
        </div>
      </header>

      <AttackBrowser />

      <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-3">
        <h2 className="text-sm font-bold text-white">How to use this library</h2>
        <ol className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300">
          <li className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
            <span className="block font-mono text-[10px] uppercase text-rose-300 mb-1">1. Read the steps</span>
            Each scenario shows the precondition, the attack sequence and the impact.
          </li>
          <li className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
            <span className="block font-mono text-[10px] uppercase text-cyan-300 mb-1">2. Look for detection</span>
            Every step lists what a defender or monitoring tool could observe.
          </li>
          <li className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
            <span className="block font-mono text-[10px] uppercase text-emerald-300 mb-1">3. Apply mitigations</span>
            Toggle the defences to see which precondition the control removes.
          </li>
        </ol>
        <div className="flex flex-wrap gap-4 pt-1 text-xs">
          <Link href="/start" className="inline-flex items-center gap-1 font-semibold text-indigo-300 hover:text-indigo-200">
            <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
            Start with the protocol path
            <ArrowRight className="w-3 h-3" aria-hidden="true" />
          </Link>
          <Link href="/glossary" className="inline-flex items-center gap-1 font-semibold text-cyan-300 hover:text-cyan-200">
            Look up a term
            <ArrowRight className="w-3 h-3" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
