'use client';

import React, { useMemo, useState } from 'react';
import {
  REFERENCE_ENTRIES,
  REFERENCE_FAMILIES,
  REFERENCE_STATUS_META,
  type ReferenceStatus,
} from '@/data/reference';
import { getCategoryBadge, getLayerColor } from '@/lib/utils';
import { ArrowUpRight, Search, X } from 'lucide-react';

const STATUS_FILTERS: (ReferenceStatus | 'all')[] = ['all', 'active', 'legacy', 'deprecated'];

export default function ReferenceBrowser() {
  const [query, setQuery] = useState('');
  const [family, setFamily] = useState<string>('all');
  const [status, setStatus] = useState<ReferenceStatus | 'all'>('all');

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return REFERENCE_ENTRIES.filter((entry) => {
      if (family !== 'all' && entry.family !== family) return false;
      if (status !== 'all' && entry.status !== status) return false;
      if (!normalized) return true;

      return (
        entry.name.toLowerCase().includes(normalized) ||
        entry.fullName.toLowerCase().includes(normalized) ||
        entry.summary.toLowerCase().includes(normalized) ||
        entry.standard.toLowerCase().includes(normalized) ||
        (entry.port ?? '').toLowerCase().includes(normalized)
      );
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [family, query, status]);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="relative">
          <label htmlFor="reference-search" className="sr-only">
            Search reference entries
          </label>
          <Search
            className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2"
            aria-hidden="true"
          />
          <input
            id="reference-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search a protocol, RFC, port or keyword"
            autoComplete="off"
            spellCheck={false}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors font-mono"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear reference search"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by family">
          <FilterChip active={family === 'all'} onClick={() => setFamily('all')}>
            All families
          </FilterChip>
          {REFERENCE_FAMILIES.map((entry) => (
            <FilterChip key={entry.id} active={family === entry.id} onClick={() => setFamily(entry.id)}>
              {entry.label}
            </FilterChip>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by status">
          {STATUS_FILTERS.map((value) => (
            <FilterChip key={value} active={status === value} onClick={() => setStatus(value)}>
              {value === 'all' ? 'Any status' : REFERENCE_STATUS_META[value].label}
            </FilterChip>
          ))}
        </div>
      </div>

      <p className="text-xs text-slate-400 font-mono" aria-live="polite">
        Showing {filtered.length} of {REFERENCE_ENTRIES.length} reference entries
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-10 text-center space-y-2">
          <p className="text-sm font-semibold text-white">Nothing matches those filters</p>
          <p className="text-xs text-slate-400">Clear the search or pick a different family.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((entry) => {
            const statusMeta = REFERENCE_STATUS_META[entry.status];
            const category = getCategoryBadge(entry.category);
            const familyLabel = REFERENCE_FAMILIES.find((item) => item.id === entry.family)?.label ?? entry.family;

            return (
              <article
                key={entry.id}
                id={entry.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-3 hover:border-slate-700 transition-colors scroll-mt-24"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-white">{entry.name}</h3>
                    <p className="text-xs text-slate-400 font-mono">{entry.fullName}</p>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border shrink-0 ${statusMeta.color}`}>
                    {statusMeta.label}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${getLayerColor(entry.osiLayer)}`}>
                    {entry.osiLayer}
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${category.color}`}>
                    {category.label}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded border bg-slate-800/70 text-slate-300 border-slate-700">
                    {familyLabel}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{entry.summary}</p>

                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                  <div className="flex gap-1.5 min-w-0">
                    <dt className="text-slate-500 shrink-0">Standard:</dt>
                    <dd className="text-slate-300 font-mono truncate" title={entry.standard}>
                      {entry.standard}
                    </dd>
                  </div>
                  {entry.port && (
                    <div className="flex gap-1.5 min-w-0">
                      <dt className="text-slate-500 shrink-0">Port:</dt>
                      <dd className="text-slate-300 font-mono truncate">{entry.port}</dd>
                    </div>
                  )}
                </dl>

                {entry.specUrl && (
                  <a
                    href={entry.specUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-300 hover:text-cyan-200"
                  >
                    Read the specification
                    <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
                  </a>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`px-2.5 py-1 rounded-md text-[11px] font-mono border transition-colors ${
        active
          ? 'bg-indigo-600 text-white border-indigo-400'
          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}
