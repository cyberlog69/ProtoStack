'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { ATTACKS } from '@/data/attacks';
import { ATTACK_CATEGORIES, type AttackCategory } from '@/data/attackCategories';
import { PROTOCOLS } from '@/data/protocols';
import { useProgress } from '@/context/ProgressContext';
import { ArrowRight, CheckCircle2, Search, X } from 'lucide-react';

type SortOption = 'default' | 'difficulty-asc' | 'difficulty-desc';
type CompletionFilter = 'all' | 'unfinished' | 'completed';

const PROTOCOL_BY_SLUG = new Map(PROTOCOLS.map((protocol) => [protocol.slug, protocol.name]));

const PROTOCOL_OPTIONS = Array.from(new Set(ATTACKS.map((attack) => attack.protocolSlug)))
  .map((slug) => ({ slug, name: PROTOCOL_BY_SLUG.get(slug) ?? slug }))
  .sort((a, b) => a.name.localeCompare(b.name));

export default function AttackBrowser() {
  const { attackScores } = useProgress();
  const [category, setCategory] = useState<AttackCategory | 'all'>('all');
  const [protocol, setProtocol] = useState<string>('all');
  const [difficulty, setDifficulty] = useState<1 | 2 | 3 | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [completion, setCompletion] = useState<CompletionFilter>('all');
  const [query, setQuery] = useState('');

  const completedIds = useMemo(() => {
    const ids = new Set<string>();
    for (const attack of ATTACKS) {
      const score = attackScores[attack.id];
      if (score && score.total > 0 && score.score === score.total) ids.add(attack.id);
    }
    return ids;
  }, [attackScores]);

  const isComplete = (id: string) => completedIds.has(id);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return ATTACKS.filter((attack) => {
      if (category !== 'all' && attack.category !== category) return false;
      if (protocol !== 'all' && attack.protocolSlug !== protocol) return false;
      if (difficulty !== 'all' && attack.difficulty !== difficulty) return false;
      if (completion === 'completed' && !completedIds.has(attack.id)) return false;
      if (completion === 'unfinished' && completedIds.has(attack.id)) return false;
      if (!normalized) return true;

      const protocolName = PROTOCOL_BY_SLUG.get(attack.protocolSlug) ?? '';
      return (
        attack.name.toLowerCase().includes(normalized) ||
        attack.summary.toLowerCase().includes(normalized) ||
        protocolName.toLowerCase().includes(normalized) ||
        attack.mitreIds.some((id) => id.toLowerCase().includes(normalized))
      );
    }).sort((a, b) => {
      if (sortBy === 'difficulty-asc') return a.difficulty - b.difficulty;
      if (sortBy === 'difficulty-desc') return b.difficulty - a.difficulty;
      const left = `${PROTOCOL_BY_SLUG.get(a.protocolSlug) ?? a.protocolSlug} ${a.name}`;
      const right = `${PROTOCOL_BY_SLUG.get(b.protocolSlug) ?? b.protocolSlug} ${b.name}`;
      return left.localeCompare(right);
    });
  }, [completedIds, category, completion, difficulty, protocol, query, sortBy]);

  const completedCount = ATTACKS.filter((attack) => completedIds.has(attack.id)).length;

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <label htmlFor="attack-search" className="sr-only">
              Search attacks
            </label>
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              id="attack-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search an attack, protocol or MITRE ID (e.g. T1498, DNS, ARP)"
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
              <label htmlFor="attack-protocol" className="sr-only">Filter by protocol</label>
              <select
                id="attack-protocol"
                value={protocol}
                onChange={(event) => setProtocol(event.target.value)}
                className="w-full sm:w-48 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
              >
                <option value="all">All protocols</option>
                {PROTOCOL_OPTIONS.map((option) => (
                  <option key={option.slug} value={option.slug}>{option.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="attack-sort" className="sr-only">Sort attacks</label>
              <select
                id="attack-sort"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as SortOption)}
                className="w-full sm:w-44 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
              >
                <option value="default">Sort: Protocol</option>
                <option value="difficulty-asc">Difficulty: Easy first</option>
                <option value="difficulty-desc">Difficulty: Hard first</option>
              </select>
            </div>

            <div>
              <label htmlFor="attack-completion" className="sr-only">Filter by completion</label>
              <select
                id="attack-completion"
                value={completion}
                onChange={(event) => setCompletion(event.target.value as CompletionFilter)}
                className="w-full sm:w-40 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
              >
                <option value="all">All scenarios</option>
                <option value="unfinished">Unfinished only</option>
                <option value="completed">Completed only</option>
              </select>
            </div>
          </div>
        </div>

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

        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] font-mono uppercase text-slate-500 mr-1 font-bold">Difficulty:</span>
          {(['all', 1, 2, 3] as const).map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setDifficulty(level)}
              aria-pressed={difficulty === level}
              className={`px-2.5 py-0.5 rounded-md text-[11px] font-mono border transition-all ${
                difficulty === level
                  ? 'bg-amber-600 text-white border-amber-400'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {level === 'all' ? 'All tiers' : `${'★'.repeat(level)}${'☆'.repeat(3 - level)}`}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 font-mono" aria-live="polite">
        <span>Showing {filtered.length} of {ATTACKS.length} scenarios</span>
        {completedCount > 0 && (
          <span className="text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
            {completedCount} completed
          </span>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-10 text-center space-y-2">
          <p className="text-sm font-semibold text-white">No attacks match those filters</p>
          <p className="text-xs text-slate-400">Clear the search or reset the category, difficulty and completion filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((attack) => {
            const categoryMeta = ATTACK_CATEGORIES.find((entry) => entry.id === attack.category);
            const protocolName = PROTOCOL_BY_SLUG.get(attack.protocolSlug) ?? attack.protocolSlug;
            const complete = completedIds.has(attack.id);

            return (
              <article
                key={attack.id}
                id={attack.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-3.5 hover:border-rose-500/40 transition-all flex flex-col justify-between scroll-mt-24"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white">{attack.name}</h3>
                        {complete && (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            title="Defender challenge passed"
                          >
                            <CheckCircle2 className="w-3 h-3" aria-hidden="true" /> 2/2
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
                    {categoryMeta && (
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border shrink-0 ${categoryMeta.color}`}>
                        {categoryMeta.label}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{attack.summary}</p>

                  <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-slate-500">
                    <span className="text-amber-400" aria-label={`Difficulty ${attack.difficulty} of 3`}>
                      {'★'.repeat(attack.difficulty)}{'☆'.repeat(3 - attack.difficulty)}
                    </span>
                    {attack.mitreIds.length > 0 && <span>{attack.mitreIds.join(' · ')}</span>}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="text-slate-500 font-mono">{attack.steps.length} steps</span>
                  <Link
                    href={`/protocols/${attack.protocolSlug}#attacks`}
                    className="inline-flex items-center gap-1 font-semibold text-rose-300 hover:text-rose-200"
                  >
                    Open simulation
                    <ArrowRight className="w-3 h-3" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
