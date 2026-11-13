'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PROTOCOLS } from '@/data/protocols';
import { Protocol } from '@/types/protocol';
import { getCategoryBadge, getLayerColor } from '@/lib/utils';
import { Search, X, ArrowRight, CornerDownLeft, Sparkles, Terminal, Activity, Layers, Cpu, Globe } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global keydown listeners for Escape and Arrows
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          router.push(`/protocols/${filtered[selectedIndex].slug}`);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex]);

  const filtered = React.useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return PROTOCOLS.slice(0, 8); // show popular initial items

    return PROTOCOLS.filter((p) => {
      const portStr = p.port ? p.port.toString().toLowerCase() : '';
      const rfcStr = p.rfc ? p.rfc.toLowerCase() : '';
      return (
        p.name.toLowerCase().includes(q) ||
        p.fullName.toLowerCase().includes(q) ||
        p.shortSummary.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        portStr.includes(q) ||
        rfcStr.includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.osiLayer.toLowerCase().includes(q) ||
        p.keyFeatures.some((f) => f.toLowerCase().includes(q)) ||
        p.useCases.some((u) => u.toLowerCase().includes(q))
      );
    });
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
        aria-hidden="true" 
      />

      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl shadow-indigo-500/10 overflow-hidden flex flex-col z-10 max-h-[80vh]">
        {/* Search Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 bg-slate-950/90 gap-3">
          <Search className="w-5 h-5 text-indigo-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search all protocols by name, RFC, port number (e.g. 53, 1883), layer..."
            className="flex-1 bg-transparent border-0 text-white placeholder-slate-500 text-sm focus:outline-none font-mono"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700 px-1.5 py-0.5 rounded">
            ESC
          </kbd>
        </div>

        {/* Search Results List */}
        <div className="overflow-y-auto p-2 divide-y divide-slate-800/40">
          {filtered.length > 0 ? (
            filtered.map((protocol, idx) => {
              const isSelected = idx === selectedIndex;
              const catBadge = getCategoryBadge(protocol.category);
              const layerBadge = getLayerColor(protocol.osiLayer);

              return (
                <Link
                  key={protocol.id}
                  href={`/protocols/${protocol.slug}`}
                  onClick={onClose}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                    isSelected
                      ? 'bg-indigo-600/20 border border-indigo-500/40 text-white'
                      : 'hover:bg-slate-800/50 text-slate-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-4">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-400'
                        : 'bg-slate-950 text-indigo-400 border-slate-800'
                    }`}>
                      <Terminal className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-white">{protocol.name}</span>
                        <span className="text-xs text-slate-400 font-mono truncate hidden sm:inline">
                          — {protocol.fullName}
                        </span>
                        {protocol.port && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                            Port {protocol.port}
                          </span>
                        )}
                        {protocol.rfc && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 truncate max-w-[120px]">
                            {protocol.rfc.split(',')[0]}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {protocol.shortSummary}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border hidden md:inline ${layerBadge}`}>
                      {protocol.osiLayer}
                    </span>
                    <CornerDownLeft className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-400 opacity-100' : 'opacity-0'}`} />
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="py-12 text-center space-y-2">
              <Search className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">
                No protocols matching &quot;{query}&quot;
              </p>
              <p className="text-xs text-slate-500">
                Try searching for a port number (e.g. 53, 443, 1883), an RFC, or a category.
              </p>
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <div className="flex items-center gap-3">
            <span><kbd className="bg-slate-800 px-1 rounded text-slate-400">↑↓</kbd> to navigate</span>
            <span><kbd className="bg-slate-800 px-1 rounded text-slate-400">↵</kbd> to select</span>
          </div>
          <span>Showing {filtered.length} protocols</span>
        </div>
      </div>
    </div>
  );
}

