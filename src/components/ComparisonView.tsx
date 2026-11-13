'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PROTOCOLS } from '@/data/protocols';
import { COMPARISON_PRESETS } from '@/data/comparisons';
import { getCategoryBadge } from '@/lib/utils';
import { Check, X, Play, ArrowLeftRight, Sparkles, AlertTriangle } from 'lucide-react';

interface ComparisonViewProps {
  initialSlugA?: string;
  initialSlugB?: string;
}

export default function ComparisonView({ initialSlugA = 'tcp', initialSlugB = 'udp' }: ComparisonViewProps) {
  const router = useRouter();
  const [slugA, setSlugA] = useState(initialSlugA);
  const [slugB, setSlugB] = useState(initialSlugB);

  const protocolA = PROTOCOLS.find((p) => p.slug === slugA);
  const protocolB = PROTOCOLS.find((p) => p.slug === slugB);

  if (!protocolA || !protocolB) {
    return (
      <div className="rounded-2xl border border-amber-500/40 bg-amber-950/20 p-8 text-center space-y-2">
        <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" aria-hidden="true" />
        <h2 className="text-base font-bold text-white">Unknown protocol in this comparison</h2>
        <p className="text-xs text-slate-300">
          One of the requested slugs does not exist. Pick two protocols from the selectors above.
        </p>
        <Link href="/compare" className="inline-block text-xs font-semibold text-indigo-300 hover:underline">
          Reset comparison
        </Link>
      </div>
    );
  }

  const presetMatch = COMPARISON_PRESETS.find(
    (p) => (p.slugA === slugA && p.slugB === slugB) || (p.slugA === slugB && p.slugB === slugA)
  );

  const handleSelectPreset = (pA: string, pB: string) => {
    setSlugA(pA);
    setSlugB(pB);
    router.push(`/compare/${pA}/${pB}`);
  };

  const handleSwap = () => {
    const temp = slugA;
    setSlugA(slugB);
    setSlugB(temp);
    router.push(`/compare/${slugB}/${temp}`);
  };

  const badgeA = getCategoryBadge(protocolA.category);
  const badgeB = getCategoryBadge(protocolB.category);

  return (
    <div className="space-y-10">
      {/* Popular Comparison Chips */}
      <div className="space-y-2">
        <span className="text-xs font-mono text-slate-400 block">POPULAR COMPARISONS:</span>
        <div className="flex flex-wrap gap-2">
          {COMPARISON_PRESETS.map((p) => {
            const isActive = (p.slugA === slugA && p.slugB === slugB) || (p.slugA === slugB && p.slugB === slugA);
            return (
              <button
                key={p.title}
                type="button"
                onClick={() => handleSelectPreset(p.slugA, p.slugB)}
                aria-pressed={isActive}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all border ${
                  isActive
                    ? 'bg-indigo-600 text-white border-indigo-400 font-bold shadow-md shadow-indigo-600/30'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                {p.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* Protocol Selectors Bar */}
      <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center bg-slate-950/80 p-5 rounded-2xl border border-slate-800">
        {/* Selector A */}
        <div className="md:col-span-5 space-y-1.5">
          <label htmlFor="compare-protocol-a" className="text-[11px] font-mono text-indigo-400 font-bold block uppercase">
            PROTOCOL A
          </label>
          <select
            id="compare-protocol-a"
            value={slugA}
            onChange={(e) => {
              setSlugA(e.target.value);
              router.push(`/compare/${e.target.value}/${slugB}`);
            }}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-mono text-white font-bold focus:outline-none focus:border-indigo-500"
          >
            {PROTOCOLS.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name} — {p.fullName} ({p.osiLayer})
              </option>
            ))}
          </select>
        </div>

        {/* Swap Button */}
        <div className="md:col-span-1 flex justify-center pt-4 md:pt-0">
          <button
            type="button"
            onClick={handleSwap}
            className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-slate-300 transition-colors"
            title="Swap Protocols"
            aria-label="Swap protocol A and B"
          >
            <ArrowLeftRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Selector B */}
        <div className="md:col-span-5 space-y-1.5">
          <label htmlFor="compare-protocol-b" className="text-[11px] font-mono text-cyan-400 font-bold block uppercase">
            PROTOCOL B
          </label>
          <select
            id="compare-protocol-b"
            value={slugB}
            onChange={(e) => {
              setSlugB(e.target.value);
              router.push(`/compare/${slugA}/${e.target.value}`);
            }}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-mono text-white font-bold focus:outline-none focus:border-cyan-500"
          >
            {PROTOCOLS.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name} — {p.fullName} ({p.osiLayer})
              </option>
            ))}
          </select>
        </div>
      </div>

      {slugA === slugB && (
        <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
          <span>Both selectors point at the same protocol. Pick two different protocols to see a comparison.</span>
        </div>
      )}

      {/* Preset Verdict Banner */}
      {presetMatch && (
        <div className="p-5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-indigo-300 uppercase">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Architectural Summary: {presetMatch.tagline}</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-mono">
            {presetMatch.verdict}
          </p>
        </div>
      )}

      {/* Side-by-Side Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Protocol A Card */}
        <div className="rounded-2xl border border-indigo-500/30 bg-slate-900/90 p-6 space-y-6 shadow-xl">
          <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${badgeA.color}`}>
                {badgeA.label}
              </span>
              <h3 className="text-3xl font-extrabold text-white mt-2">
                {protocolA.name}
              </h3>
              <p className="text-xs text-indigo-300 font-mono mt-0.5">
                {protocolA.fullName}
              </p>
            </div>

            <Link
              href={`/protocols/${protocolA.slug}`}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Open Protocol</span>
            </Link>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">
            {protocolA.shortSummary}
          </p>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-500">OSI LAYER</span>
              <span className="text-white font-bold">{protocolA.osiLayer}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-500">STANDARD PORT</span>
              <span className="text-cyan-400 font-bold">{protocolA.port ? `Port ${protocolA.port}` : 'Layer-Specific'}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-500">RFC STANDARD</span>
              <span className="text-slate-300 truncate max-w-[200px]">{protocolA.rfc || 'Not listed'}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-500">YEAR INTRODUCED</span>
              <span className="text-emerald-400 font-bold">{protocolA.yearIntroduced || 'N/A'}</span>
            </div>
          </div>

          {/* Pros */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              Key Strengths
            </h4>
            <ul className="space-y-1.5">
              {protocolA.pros.map((p, i) => (
                <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Cons */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
              <X className="w-3.5 h-3.5 text-rose-400" />
              Limitations
            </h4>
            <ul className="space-y-1.5">
              {protocolA.cons.map((c, i) => (
                <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Protocol B Card */}
        <div className="rounded-2xl border border-cyan-500/30 bg-slate-900/90 p-6 space-y-6 shadow-xl">
          <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${badgeB.color}`}>
                {badgeB.label}
              </span>
              <h3 className="text-3xl font-extrabold text-white mt-2">
                {protocolB.name}
              </h3>
              <p className="text-xs text-cyan-300 font-mono mt-0.5">
                {protocolB.fullName}
              </p>
            </div>

            <Link
              href={`/protocols/${protocolB.slug}`}
              className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Open Protocol</span>
            </Link>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">
            {protocolB.shortSummary}
          </p>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-500">OSI LAYER</span>
              <span className="text-white font-bold">{protocolB.osiLayer}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-500">STANDARD PORT</span>
              <span className="text-cyan-400 font-bold">{protocolB.port ? `Port ${protocolB.port}` : 'Layer-Specific'}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-500">RFC STANDARD</span>
              <span className="text-slate-300 truncate max-w-[200px]">{protocolB.rfc || 'Not listed'}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-500">YEAR INTRODUCED</span>
              <span className="text-emerald-400 font-bold">{protocolB.yearIntroduced || 'N/A'}</span>
            </div>
          </div>

          {/* Pros */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              Key Strengths
            </h4>
            <ul className="space-y-1.5">
              {protocolB.pros.map((p, i) => (
                <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Cons */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
              <X className="w-3.5 h-3.5 text-rose-400" />
              Limitations
            </h4>
            <ul className="space-y-1.5">
              {protocolB.cons.map((c, i) => (
                <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
