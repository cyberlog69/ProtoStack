'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { ATTACKS } from '@/data/attacks';
import { ATTACK_CATEGORIES, type AttackCategory } from '@/data/attackCategories';
import { PROTOCOLS } from '@/data/protocols';
import { ArrowRight, Search, X } from 'lucide-react';

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
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return ATTACKS.filter((attack) => {
      if (category !== 'all' && attack.category !== category) return false;
      if (protocol !== 'all' && attack.protocolSlug !== protocol) return false;
      if (!normalized) return true;

      const protocolName = PROTOCOL_BY_SLUG.get(attack.protocolSlug) ?? '';
      return (
        attack.name.toLowerCase().includes(normalized) ||
        attack.summary.toLowerCase().includes(normalized) ||
        protocolName.toLowerCase().includes(normalized)
      );
    }).sort((a, b) => {
      const left = `${PROTOCOL_BY_SLUG.get(a.protocolSlug) ?? a.protocolSlug} ${a.name}`;
      const right = `${PROTOCOL_BY_SLUG.get(b.protocolSlug) ?? b.protocolSlug} ${b.name}`;
      return left.localeCompare(right);
    });
  }, [category, protocol, query]);

  return (
    <div className="space-y-6">
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
              placeholder="Search an attack, protocol or keyword (e.g. spoofing, BGP, token)"
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

          <div>
            <label htmlFor="attack-protocol" className="sr-only">
              Filter by protocol
            </label>
            <select
              id="attack-protocol"
              value={protocol}
              onChange={(event) => setProtocol(event.target.value)}
              className="w-full sm:w-56 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500 font-mono"
            >
              <option value="all">All protocols</option>
              {PROTOCOL_OPTIONS.map((option) => (
                <option key={option.slug} value={option.slug}>
                  {option.name}
                </option>
              ))}
            </select>
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
      </div>

      <p className="text-xs text-slate-400 font-mono" aria-live="polite">
        Showing {filtered.length} of {ATTACKS.length} attack scenarios
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-10 text-center space-y-2">
          <p className="text-sm font-semibold text-white">No attacks match those filters</p>
          <p className="text-xs text-slate-400">Clear the search or choose another category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((attack) => {
            const categoryMeta = ATTACK_CATEGORIES.find((entry) => entry.id === attack.category);
            const protocolName = PROTOCOL_BY_SLUG.get(attack.protocolSlug) ?? attack.protocolSlug;

            return (
              <article
                key={attack.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-3 hover:border-rose-500/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white">{attack.name}</h3>
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
