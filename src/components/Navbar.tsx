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
  Menu,
  X,
} from 'lucide-react';

const SearchModal = dynamic(() => import('./SearchModal'), { ssr: false });

const NAV_ITEMS = [
  { href: '/#protocols', label: 'Protocols', icon: BookOpen, color: 'text-indigo-400' },
  { href: '/layers', label: 'OSI & TCP/IP', icon: Layers, color: 'text-purple-400' },
  { href: '/compare', label: 'Compare', icon: ArrowLeftRight, color: 'text-cyan-400' },
  { href: '/quiz', label: 'Quizzes', icon: Brain, color: 'text-amber-400' },
  { href: '/dashboard', label: 'Dashboard', icon: Award, color: 'text-emerald-400' },
];

export default function Navbar() {
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

          <nav aria-label="Primary" className="hidden lg:flex items-center gap-1 text-sm font-medium text-slate-300">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                    active ? 'bg-slate-800/80 text-white' : 'hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${item.color}`} aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openSearch}
              className="text-xs font-mono px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/50 flex items-center gap-2 transition-all cursor-pointer shadow-sm"
              title="Search all protocols (Ctrl+K)"
              aria-label="Search all protocols"
            >
              <Search className="w-3.5 h-3.5 text-indigo-400" aria-hidden="true" />
              <span className="hidden sm:inline">Search protocols...</span>
              <span className="sm:hidden">Search</span>
              <kbd className="hidden md:inline text-[10px] bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded text-slate-400">
                Ctrl K
              </kbd>
            </button>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((previous) => !previous)}
              className="lg:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
              aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <nav id="mobile-navigation" aria-label="Mobile" className="lg:hidden border-t border-slate-800 bg-slate-950/95 px-4 py-3">
            <ul className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      aria-current={active ? 'page' : undefined}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                        active ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${item.color}`} aria-hidden="true" />
                      {item.label}
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
