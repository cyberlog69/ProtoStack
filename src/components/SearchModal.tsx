'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { searchContent, type SearchKind } from '@/lib/search';
import {
  BookMarked,
  BookOpen,
  Compass,
  CornerDownLeft,
  Library,
  Search,
  ShieldAlert,
  X,
} from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const KIND_STYLES: Record<SearchKind, { label: string; icon: React.ComponentType<{ className?: string }>; badge: string }> = {
  lesson: {
    label: 'Lesson',
    icon: BookOpen,
    badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  },
  reference: {
    label: 'Reference',
    icon: Library,
    badge: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  },
  glossary: {
    label: 'Term',
    icon: BookMarked,
    badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  },
  attack: {
    label: 'Attack',
    icon: ShieldAlert,
    badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  },
  page: {
    label: 'Page',
    icon: Compass,
    badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  },
};

const MAX_RESULTS = 30;

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const router = useRouter();

  const results = useMemo(() => searchContent(query, MAX_RESULTS), [query]);
  const resultCountLabel = query.trim()
    ? `${results.length}${results.length === MAX_RESULTS ? '+' : ''} result${results.length === 1 ? '' : 's'}`
    : 'Quick links';

  const close = useCallback(() => {
    onClose();
    previouslyFocused.current?.focus();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    setQuery('');
    setSelectedIndex(0);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 30);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      previouslyFocused.current?.focus();
    };
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (selectedIndex > results.length - 1) {
      setSelectedIndex(Math.max(0, results.length - 1));
    }
  }, [results.length, selectedIndex]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        return;
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setSelectedIndex((previous) => (previous < results.length - 1 ? previous + 1 : previous));
        return;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setSelectedIndex((previous) => (previous > 0 ? previous - 1 : 0));
        return;
      }

      if (event.key === 'Enter') {
        const selected = results[selectedIndex];
        if (!selected) return;
        event.preventDefault();
        router.push(selected.href);
        close();
        return;
      }

      if (event.key === 'Tab') {
        const dialog = dialogRef.current;
        if (!dialog) return;
        const focusable = Array.from(
          dialog.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])'),
        ).filter((element) => element.offsetParent !== null);
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [close, isOpen, results, router, selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <button
        type="button"
        className="fixed inset-0 cursor-default"
        onClick={close}
        aria-label="Close search dialog"
        tabIndex={-1}
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="spotlight-title"
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl shadow-indigo-500/10 overflow-hidden flex flex-col z-10 max-h-[80vh]"
      >
        <h2 id="spotlight-title" className="sr-only">
          Search lessons, reference cards, glossary terms and attacks
        </h2>

        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 bg-slate-950/90 gap-3">
          <Search className="w-5 h-5 text-indigo-400 shrink-0" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search lessons, glossary, attacks, RFCs, ports..."
            className="flex-1 bg-transparent border-0 text-white placeholder-slate-400 text-sm focus:outline-none font-mono min-w-0"
            aria-label="Search all learning content"
            autoComplete="off"
            spellCheck={false}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1.5 rounded-md text-slate-400 hover:text-white"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
          <kbd className="hidden sm:inline-block text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700 px-1.5 py-0.5 rounded">
            ESC
          </kbd>
        </div>

        <div className="overflow-y-auto p-2 divide-y divide-slate-800/40">
          {results.length > 0 ? (
            results.map((entry, index) => {
              const selected = index === selectedIndex;
              const kind = KIND_STYLES[entry.kind];
              const Icon = kind.icon;

              return (
                <Link
                  key={entry.id}
                  href={entry.href}
                  onClick={close}
                  onMouseEnter={() => setSelectedIndex(index)}
                  aria-current={selected ? 'true' : undefined}
                  className={`flex items-center justify-between gap-3 p-3 rounded-xl transition-all ${
                    selected
                      ? 'bg-indigo-600/20 border border-indigo-500/40 text-white'
                      : 'hover:bg-slate-800/50 text-slate-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
                        selected
                          ? 'bg-indigo-600 text-white border-indigo-400'
                          : 'bg-slate-950 text-indigo-400 border-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-white break-anywhere">{entry.title}</span>
                        <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border ${kind.badge}`}>
                          {kind.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{entry.subtitle}</p>
                    </div>
                  </div>

                  <CornerDownLeft
                    className={`w-3.5 h-3.5 shrink-0 ${selected ? 'text-indigo-400 opacity-100' : 'opacity-0'}`}
                    aria-hidden="true"
                  />
                </Link>
              );
            })
          ) : (
            <div className="py-12 text-center space-y-2">
              <Search className="w-8 h-8 text-slate-500 mx-auto" aria-hidden="true" />
              <p className="text-sm font-semibold text-slate-300">
                Nothing matches &quot;{query}&quot;
              </p>
              <p className="text-xs text-slate-400">
                Try a protocol name, a port (53, 443), an RFC, a glossary term, or an attack category.
              </p>
            </div>
          )}
        </div>

        <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="bg-slate-800 px-1 rounded text-slate-300">↑↓</kbd> navigate
            </span>
            <span>
              <kbd className="bg-slate-800 px-1 rounded text-slate-300">↵</kbd> open
            </span>
          </div>
          <span>{resultCountLabel}</span>
        </div>
      </div>
    </div>
  );
}
