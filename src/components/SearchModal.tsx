'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PROTOCOLS } from '@/data/protocols';
import { getCategoryBadge, getLayerColor } from '@/lib/utils';
import { Search, X, CornerDownLeft, Terminal } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const router = useRouter();

  const filtered = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    if (!normalized) return PROTOCOLS.slice(0, 8);

    return PROTOCOLS.filter((protocol) => {
      const port = protocol.port ? protocol.port.toString().toLowerCase() : '';
      const rfc = protocol.rfc ? protocol.rfc.toLowerCase() : '';
      return (
        protocol.name.toLowerCase().includes(normalized) ||
        protocol.fullName.toLowerCase().includes(normalized) ||
        protocol.shortSummary.toLowerCase().includes(normalized) ||
        protocol.description.toLowerCase().includes(normalized) ||
        port.includes(normalized) ||
        rfc.includes(normalized) ||
        protocol.category.toLowerCase().includes(normalized) ||
        protocol.osiLayer.toLowerCase().includes(normalized) ||
        protocol.keyFeatures.some((feature) => feature.toLowerCase().includes(normalized)) ||
        protocol.useCases.some((useCase) => useCase.toLowerCase().includes(normalized))
      );
    });
  }, [query]);

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
    if (selectedIndex > filtered.length - 1) {
      setSelectedIndex(Math.max(0, filtered.length - 1));
    }
  }, [filtered.length, selectedIndex]);

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
        setSelectedIndex((previous) => (previous < filtered.length - 1 ? previous + 1 : previous));
        return;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setSelectedIndex((previous) => (previous > 0 ? previous - 1 : 0));
        return;
      }

      if (event.key === 'Enter') {
        const selected = filtered[selectedIndex];
        if (!selected) return;
        event.preventDefault();
        router.push(`/protocols/${selected.slug}`);
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
  }, [close, filtered, isOpen, router, selectedIndex]);

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
          Search protocols
        </h2>

        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 bg-slate-950/90 gap-3">
          <Search className="w-5 h-5 text-indigo-400 shrink-0" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search all protocols by name, RFC, port number (e.g. 53, 1883), layer..."
            className="flex-1 bg-transparent border-0 text-white placeholder-slate-400 text-sm focus:outline-none font-mono"
            aria-label="Search protocols"
            autoComplete="off"
            spellCheck={false}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-white"
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
          {filtered.length > 0 ? (
            filtered.map((protocol, index) => {
              const selected = index === selectedIndex;
              const categoryBadge = getCategoryBadge(protocol.category);
              const layerBadge = getLayerColor(protocol.osiLayer);

              return (
                <Link
                  key={protocol.id}
                  href={`/protocols/${protocol.slug}`}
                  onClick={close}
                  onMouseEnter={() => setSelectedIndex(index)}
                  aria-current={selected ? 'true' : undefined}
                  className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                    selected
                      ? 'bg-indigo-600/20 border border-indigo-500/40 text-white'
                      : 'hover:bg-slate-800/50 text-slate-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-4">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
                        selected
                          ? 'bg-indigo-600 text-white border-indigo-400'
                          : 'bg-slate-950 text-indigo-400 border-slate-800'
                      }`}
                    >
                      <Terminal className="w-4 h-4" aria-hidden="true" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-white">{protocol.name}</span>
                        <span className="text-xs text-slate-400 font-mono truncate hidden sm:inline">
                          — {protocol.fullName}
                        </span>
                        {protocol.port && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                            Port {protocol.port}
                          </span>
                        )}
                        {protocol.rfc && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 truncate max-w-[120px]">
                            {protocol.rfc.split(',')[0]}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{protocol.shortSummary}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border hidden md:inline ${layerBadge}`}
                    >
                      {protocol.osiLayer}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border hidden lg:inline ${categoryBadge.color}`}>
                      {categoryBadge.label}
                    </span>
                    <CornerDownLeft
                      className={`w-3.5 h-3.5 ${selected ? 'text-indigo-400 opacity-100' : 'opacity-0'}`}
                      aria-hidden="true"
                    />
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="py-12 text-center space-y-2">
              <Search className="w-8 h-8 text-slate-500 mx-auto" aria-hidden="true" />
              <p className="text-sm font-semibold text-slate-300">
                No protocols matching &quot;{query}&quot;
              </p>
              <p className="text-xs text-slate-400">
                Try searching for a port number (e.g. 53, 443, 1883), an RFC, or a category.
              </p>
            </div>
          )}
        </div>

        <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="bg-slate-800 px-1 rounded text-slate-300">↑↓</kbd> navigate
            </span>
            <span>
              <kbd className="bg-slate-800 px-1 rounded text-slate-300">↵</kbd> select
            </span>
          </div>
          <span>Showing {filtered.length} protocols</span>
        </div>
      </div>
    </div>
  );
}
