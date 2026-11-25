'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import {
  Layers,
  Search,
  BookOpen,
  ArrowLeftRight,
  Brain,
  Award,
  Compass,
  ShieldAlert,
  Menu,
  ScrollText,
  X,
} from 'lucide-react';

const SearchModal = dynamic(() => import('./SearchModal'), { ssr: false });

const NAV_ITEMS = [
  { href: '/start', label: 'Start', icon: Compass, color: 'text-emerald-400' },
  { href: '/#protocols', label: 'Protocols', icon: BookOpen, color: 'text-indigo-400' },
  { href: '/layers', label: 'Layers', icon: Layers, color: 'text-purple-400' },
  { href: '/compare', label: 'Compare', icon: ArrowLeftRight, color: 'text-cyan-400' },
  { href: '/attacks', label: 'Attacks', icon: ShieldAlert, color: 'text-rose-400' },
  { href: '/quiz', label: 'Quizzes', icon: Brain, color: 'text-amber-400' },
  { href: '/dashboard', label: 'Dashboard', icon: Award, color: 'text-emerald-400' },
];

const MOBILE_ONLY_ITEMS = [
  { href: '/record', label: 'My record', icon: ScrollText, color: 'text-cyan-400' },
];

export default function Navbar({ attackCount }: { attackCount: number }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  // The search dialog is a separate chunk. Mount it only after the first open so
  // the home page does not pay for it during the initial load.
  const [hasOpenedSearch, setHasOpenedSearch] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const openSearch = () => {
    setHasOpenedSearch(true);
    setIsSearchOpen(true);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        if (isSearchOpen) {
          setIsSearchOpen(false);
          return;
        }
        setHasOpenedSearch(true);
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isMobileMenuOpen]);

  const isActive = (href: string) =>
    href !== '/#protocols' && (pathname === href || pathname.startsWith(`${href}/`));

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group" aria-label="ProtoStack home">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all">
              <div className="w-full h-full bg-slate-950 rounded-xl flex items-center justify-center">
                <Layers className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" aria-hidden="true" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  ProtoStack
                </span>
                <span className="text-[10px] uppercase font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  v0.1
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Interactive Protocol Visualizer</p>
            </div>
          </Link>

          <nav aria-label="Primary" className="hidden lg:flex items-center gap-0.5 text-[13px] font-medium text-slate-300">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                    active ? 'bg-slate-800/80 text-white' : 'hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${item.color}`} aria-hidden="true" />
                  <span className="relative inline-flex items-center gap-1.5">
                    {item.label}
                    {item.href === '/attacks' && (
                      <span className="text-[9px] font-mono px-1 rounded bg-slate-800 border border-slate-700 text-slate-300">
                        {attackCount}
                      </span>
                    )}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openSearch}
              className="text-xs font-mono px-2.5 sm:px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/50 flex items-center gap-2 transition-all cursor-pointer shadow-sm min-h-[40px]"
              title="Search lessons, glossary, attacks and reference (Ctrl+K)"
              aria-label="Search all learning content"
            >
              <Search className="w-3.5 h-3.5 text-indigo-400" aria-hidden="true" />
              <span className="hidden xl:inline">Search everything...</span>
              <kbd className="hidden md:inline text-[10px] bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded text-slate-400">
                Ctrl K
              </kbd>
            </button>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((previous) => !previous)}
              className="lg:hidden p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
              aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <nav
            id="mobile-navigation"
            aria-label="Mobile"
            className="lg:hidden border-t border-slate-800 bg-slate-950/95 px-4 py-3 max-h-[calc(100dvh-4rem)] overflow-y-auto"
          >
            <ul className="grid grid-cols-2 gap-1.5">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      aria-current={active ? 'page' : undefined}
                      className={`flex items-center gap-2.5 px-3 py-3 rounded-lg text-sm transition-colors min-h-[44px] ${
                        active ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${item.color}`} aria-hidden="true" />
                      <span className="relative inline-flex items-center gap-1.5 min-w-0">
                        <span className="truncate">{item.label}</span>
                        {item.href === '/attacks' && (
                          <span className="text-[9px] font-mono px-1 rounded bg-slate-800 border border-slate-700 text-slate-300">
                            {attackCount}
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                );
              })}
              {MOBILE_ONLY_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      aria-current={active ? 'page' : undefined}
                      className={`flex items-center gap-2.5 px-3 py-3 rounded-lg text-sm transition-colors min-h-[44px] ${
                        active ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${item.color}`} aria-hidden="true" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}
      </header>

      {hasOpenedSearch && (
        <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      )}
    </>
  );
}
