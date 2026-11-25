'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { GLOSSARY, glossaryLetters } from '@/data/glossary';
import { slugify } from '@/lib/slug';
import { ArrowUpRight, Search, X } from 'lucide-react';

const LETTERS = glossaryLetters();

export default function GlossaryBrowser() {
  const [query, setQuery] = useState('');
  const [letter, setLetter] = useState<string>('all');

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return GLOSSARY.filter((entry) => {
      if (letter !== 'all' && entry.term[0].toUpperCase() !== letter) return false;
      if (!normalized) return true;
      return (
        entry.term.toLowerCase().includes(normalized) || entry.definition.toLowerCase().includes(normalized)
      );
    }).sort((a, b) => a.term.localeCompare(b.term));
  }, [letter, query]);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="relative">
          <label htmlFor="glossary-search" className="sr-only">
            Search the glossary
          </label>
          <Search
            className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2"
            aria-hidden="true"
          />
          <input
            id="glossary-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search a term or a definition (e.g. MTU, retransmission, jitter)"
            autoComplete="off"
            spellCheck={false}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors font-mono"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear glossary search"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by first letter">
          <button
            type="button"
            onClick={() => setLetter('all')}
            aria-pressed={letter === 'all'}
            className={`px-2.5 py-1 rounded-md text-[11px] font-mono border transition-colors ${
              letter === 'all'
                ? 'bg-indigo-600 text-white border-indigo-400'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            All
          </button>
          {LETTERS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setLetter(value)}
              aria-pressed={letter === value}
              className={`w-8 py-1 rounded-md text-[11px] font-mono border transition-colors ${
                letter === value
                  ? 'bg-indigo-600 text-white border-indigo-400'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-slate-400 font-mono" aria-live="polite">
        Showing {filtered.length} of {GLOSSARY.length} terms
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-10 text-center space-y-2">
          <p className="text-sm font-semibold text-white">No terms match &quot;{query}&quot;</p>
          <p className="text-xs text-slate-400">
            Try a shorter fragment, or clear the search to browse the full list.
          </p>
        </div>
      ) : (
        <dl className="rounded-2xl border border-slate-800 bg-slate-900/40 divide-y divide-slate-800 overflow-hidden">
          {filtered.map((entry) => (
            <div
              key={entry.term}
              id={`term-${slugify(entry.term)}`}
              className="p-4 sm:p-5 hover:bg-slate-900/60 transition-colors scroll-mt-24"
            >
              <dt className="flex flex-wrap items-baseline gap-2">
                <span className="text-sm font-bold text-white font-mono">{entry.term}</span>
                {entry.see && (
                  <Link
                    href={entry.see.href}
                    className="text-[11px] font-semibold text-cyan-300 hover:text-cyan-200 inline-flex items-center gap-0.5"
                  >
                    {entry.see.label}
                    <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
                  </Link>
                )}
              </dt>
              <dd className="mt-1 text-xs text-slate-300 leading-relaxed">{entry.definition}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
