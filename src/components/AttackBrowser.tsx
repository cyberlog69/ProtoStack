'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { ATTACKS } from '@/data/attacks';
import { ATTACK_CATEGORIES, type AttackCategory } from '@/data/attackCategories';
import { PROTOCOLS } from '@/data/protocols';
import { ArrowRight, Search, X, CheckCircle2 } from 'lucide-react';

type SortOption = 'default' | 'difficulty-asc' | 'difficulty-desc' | 'cvss-desc';

interface ProtocolOption {
  slug: string;
  name: string;
}

const PROTOCOL_BY_SLUG = new Map(PROTOCOLS.map((protocol) => [protocol.slug, protocol.name]));

const PROTOCOL_OPTIONS: ProtocolOption[] = Array.from(
  new Set(ATTACKS.map((attack) => attack.protocolSlug)),
)
  .map((slug) => ({ slug, name: PROTOCOL_BY_SLUG.get(slug) ?? slug }))
  .sort((a, b) => a.name.localeCompare(b.name));

export default function AttackBrowser() {
  const [category, setCategory] = useState<AttackCategory | 'all'>('all');
  const [protocol, setProtocol] = useState<string>('all');
  const [difficulty, setDifficulty] = useState<1 | 2 | 3 | 'all'>('all');
  const [sortBy, setSortBy] = useState<'default' | 'difficulty-asc' | 'difficulty-desc' | 'cvss-desc'>('default');
  const [query, setQuery] = useState('');
  const [completedScores, setCompletedScores] = useState<Record<string, number>>({});

  // Read completed challenge scores from localStorage
  useEffect(() => {
    try {
      const scores: Record<string, number> = {};
      ATTACKS.forEach((attack) => {
        const val = localStorage.getItem(`defender-score-${attack.id}`);
        if (val !== null) {
          scores[attack.id] = parseInt(val, 10);
        }
      });
      setCompletedScores(scores);
    } catch {
      // ignore
    }
  }, []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return ATTACKS.filter((attack) => {
      if (category !== 'all' && attack.category !== category) return false;
      if (protocol !== 'all' && attack.protocolSlug !== protocol) return false;
      if (difficulty !== 'all' && attack.difficulty !== difficulty) return false;
      if (!normalized) return true;

      const protocolName = PROTOCOL_BY_SLUG.get(attack.protocolSlug) ?? '';
      return (
        attack.name.toLowerCase().includes(normalized) ||
        attack.summary.toLowerCase().includes(normalized) ||
        protocolName.toLowerCase().includes(normalized) ||
        (attack.mitreIds && attack.mitreIds.some((id) => id.toLowerCase().includes(normalized)))
      );
    }).sort((a, b) => {
      if (sortBy === 'difficulty-asc') {
        return a.difficulty - b.difficulty;
      }
      if (sortBy === 'difficulty-desc') {
        return b.difficulty - a.difficulty;
      }
      if (sortBy === 'cvss-desc') {
        return (b.cvssScore ?? 0) - (a.cvssScore ?? 0);
      }
      const left = `${PROTOCOL_BY_SLUG.get(a.protocolSlug) ?? a.protocolSlug} ${a.name}`;
      const right = `${PROTOCOL_BY_SLUG.get(b.protocolSlug) ?? b.protocolSlug} ${b.name}`;
      return left.localeCompare(right);
    });
  }, [category, protocol, difficulty, sortBy, query]);

  return (
    <div className="space-y-6">
      {/* Search, Filter & Sort Controls */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <label htmlFor="attack-search" className="sr-only">
              Search attacks
            </label>
            <Search
              className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              id="attack-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search an attack, protocol, CVE or MITRE ID (e.g. T1498, DNS, ARP)"
              autoComplete="off"
              spellCheck={false}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors font-mono"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear attack search"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <div>
              <label htmlFor="attack-protocol" className="sr-only">
                Filter by protocol
              </label>
              <select
                id="attack-protocol"
                value={protocol}
                onChange={(event) => setProtocol(event.target.value)}
                className="w-full sm:w-48 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
              >
                <option value="all">All protocols</option>
                {PROTOCOL_OPTIONS.map((option) => (
                  <option key={option.slug} value={option.slug}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="attack-sort" className="sr-only">
                Sort attacks
              </label>
              <select
                id="attack-sort"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as SortOption)}
                className="w-full sm:w-44 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
              >
                <option value="default">Sort: Protocol</option>
                <option value="difficulty-asc">Difficulty: Easy first</option>
                <option value="difficulty-desc">Difficulty: Hard first</option>
                <option value="cvss-desc">CVSS: Highest first</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by attack category">
          <button
            type="button"
            onClick={() => setCategory('all')}
            aria-pressed={category === 'all'}
            className={`px-2.5 py-1 rounded-md text-[11px] font-mono border transition-colors ${
              category === 'all'
                ? 'bg-rose-600 text-white border-rose-400'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            All categories
          </button>
          {ATTACK_CATEGORIES.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => setCategory(entry.id)}
              aria-pressed={category === entry.id}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono border transition-colors ${
                category === entry.id
                  ? 'bg-rose-600 text-white border-rose-400'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {entry.label}
            </button>
          ))}
        </div>

        {/* Phase 7: Difficulty Filter Row */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] font-mono uppercase text-slate-500 mr-1 font-bold">Difficulty:</span>
          {(['all', 1, 2, 3] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDifficulty(d)}
              aria-pressed={difficulty === d}
              className={`px-2.5 py-0.5 rounded-md text-[11px] font-mono border transition-all ${
                difficulty === d
                  ? 'bg-amber-600 text-white border-amber-400 shadow-sm'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
              }`}
            >
              {d === 'all'
                ? 'All tiers'
                : d === 1
                ? '★ Beginner'
                : d === 2
                ? '★★ Intermediate'
                : '★★★ Advanced'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 font-mono" aria-live="polite">
        <span>
          Showing {filtered.length} of {ATTACKS.length} scenarios
        </span>
        {Object.keys(completedScores).length > 0 && (
          <span className="text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{Object.keys(completedScores).length} challenges completed</span>
          </span>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-10 text-center space-y-2">
          <p className="text-sm font-semibold text-white">No attacks match those filters</p>
          <p className="text-xs text-slate-400">Clear the search or reset difficulty/category filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((attack) => {
            const categoryMeta = ATTACK_CATEGORIES.find((entry) => entry.id === attack.category);
            const protocolName = PROTOCOL_BY_SLUG.get(attack.protocolSlug) ?? attack.protocolSlug;
            const score = completedScores[attack.id];

            return (
              <article
                key={attack.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-3.5 hover:border-rose-500/40 transition-all flex flex-col justify-between group shadow-sm hover:shadow-rose-950/20"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white group-hover:text-rose-200 transition-colors">
                          {attack.name}
                        </h3>
                        {score !== undefined && (
                          <span
                            className="inline-flex items-center text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            title={`Challenge passed: score ${score}/2`}
                          >
                            ✓ {score}/2
                          </span>
                        )}
                      </div>
                      <Link
                        href={`/protocols/${attack.protocolSlug}#attacks`}
                        className="text-[11px] font-mono text-cyan-300 hover:underline"
                      >
                        {protocolName}
                      </Link>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {categoryMeta && (
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${categoryMeta.color}`}>
                          {categoryMeta.label}
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-amber-400" title={`Tier ${attack.difficulty}`}>
                        {'★'.repeat(attack.difficulty)}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{attack.summary}</p>
                </div>

                <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
                  {/* Badges row: CVSS & MITRE */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[9px] font-mono">
                    {attack.cvssScore !== undefined && (
                      <span
                        className={`px-1.5 py-0.5 rounded border ${
                          attack.cvssScore >= 9
                            ? 'border-red-500/40 text-red-300 bg-red-500/10'
                            : attack.cvssScore >= 7
                            ? 'border-orange-500/40 text-orange-300 bg-orange-500/10'
                            : 'border-amber-500/40 text-amber-300 bg-amber-500/10'
                        }`}
                      >
                        CVSS {attack.cvssScore.toFixed(1)}
                      </span>
                    )}

                    {attack.mitreIds &&
                      attack.mitreIds.slice(0, 2).map((mid) => (
                        <span
                          key={mid}
                          className="px-1.5 py-0.5 rounded border border-violet-500/40 bg-violet-500/10 text-violet-300"
                        >
                          MITRE {mid}
                        </span>
                      ))}

                    <span className="text-slate-500 ml-auto">{attack.steps.length} steps</span>
                  </div>

                  {/* Open simulation action link */}
                  <div className="flex items-center justify-between gap-2 text-[11px] pt-1">
                    <span className="text-[10px] font-mono text-slate-500">
                      Phase: {attack.steps[attack.steps.length - 1]?.phase ?? 'impact'}
                    </span>
                    <Link
                      href={`/protocols/${attack.protocolSlug}#attacks`}
                      className="inline-flex items-center gap-1 font-semibold text-rose-300 hover:text-rose-200 font-mono text-xs"
                    >
                      <span>Simulate Attack</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
