'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { PROTOCOLS, CATEGORIES_META } from '@/data/protocols';
import { Protocol } from '@/types/protocol';
import { ATTACKS } from '@/data/attacks';
import ProtocolCard from '@/components/ProtocolCard';
import ContinueLearning from '@/components/ContinueLearning';
import { Search, Layers, Cpu, Terminal, Sparkles, Activity, X, ShieldAlert, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLayer, setSelectedLayer] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [featuredIndex, setFeaturedIndex] = useState(0);

  useEffect(() => {
    setFeaturedIndex(Math.floor(Date.now() / 86400000) % ATTACKS.length);
  }, []);

  const OSI_LAYERS = [
    'all',
    'Application',
    'Presentation',
    'Session',
    'Transport',
    'Network',
    'Data Link',
    'Physical',
  ];

  const POPULAR_SEARCHES = ['DNS', 'MQTT', '53', '443', '1883', 'TLS', 'TCP', 'IoT', 'RFC 791'];

  // Global search matcher across all protocol attributes
  const matchesSearch = (protocol: Protocol, query: string) => {
    if (!query) return true;
    const q = query.toLowerCase().trim();
    const portStr = protocol.port ? protocol.port.toString().toLowerCase() : '';
    const rfcStr = protocol.rfc ? protocol.rfc.toLowerCase() : '';

    return (
      protocol.name.toLowerCase().includes(q) ||
      protocol.fullName.toLowerCase().includes(q) ||
      protocol.shortSummary.toLowerCase().includes(q) ||
      protocol.description.toLowerCase().includes(q) ||
      portStr.includes(q) ||
      rfcStr.includes(q) ||
      protocol.category.toLowerCase().includes(q) ||
      protocol.osiLayer.toLowerCase().includes(q) ||
      protocol.keyFeatures.some((f) => f.toLowerCase().includes(q)) ||
      protocol.useCases.some((u) => u.toLowerCase().includes(q))
    );
  };

  const { filteredProtocols, isSearchingGlobally } = useMemo(() => {
    const query = searchQuery.trim();

    // First attempt: match category, layer, and search query
    let filtered = PROTOCOLS.filter((protocol) => {
      const matchesCategory =
        selectedCategory === 'all' || protocol.category === selectedCategory;
      const matchesLayer =
        selectedLayer === 'all' || protocol.osiLayer === selectedLayer;
      return matchesCategory && matchesLayer && matchesSearch(protocol, query);
    });

    let searchingGlobally = false;

    // If the query has no matches in the active category/layer but matches globally, widen the search.
    if (query && filtered.length === 0 && (selectedCategory !== 'all' || selectedLayer !== 'all')) {
      const globalMatches = PROTOCOLS.filter((protocol) => matchesSearch(protocol, query));
      if (globalMatches.length > 0) {
        filtered = globalMatches;
        searchingGlobally = true;
      }
    }

    return { filteredProtocols: filtered, isSearchingGlobally: searchingGlobally };
  }, [selectedCategory, selectedLayer, searchQuery]);

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden border-b border-slate-800/80 bg-gradient-to-b from-slate-900/60 via-slate-950 to-slate-950">
        <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
        
        {/* Ambient Glow Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[220px] sm:w-[550px] sm:h-[350px] bg-indigo-600/15 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[220px] h-[160px] sm:w-[350px] sm:h-[250px] bg-cyan-500/10 rounded-full blur-[70px] sm:blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-medium shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>{PROTOCOLS.length} interactive networking, internet &amp; IoT protocols</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1] text-balance">
            See How Protocols Work —{' '}
            <span className="inline-block whitespace-nowrap bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              Step-by-Step
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed text-pretty">
            Click any protocol to launch an <strong>animated step-by-step session</strong>. Watch packets travel between clients, servers, and IoT brokers with sandboxes that are explicitly labelled live or simulated.
          </p>

          {/* Quick CTA Pill Bar */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/layers"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-purple-500/40 text-purple-300 text-xs font-mono hover:bg-purple-500/10 transition-colors"
            >
              <Layers className="w-4 h-4 text-purple-400" />
              <span>OSI & TCP/IP Layers</span>
            </Link>
            <Link
              href="/protocols/dns"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-cyan-500/40 text-cyan-300 text-xs font-mono hover:bg-cyan-500/10 transition-colors"
            >
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>DNS Resolver Bench</span>
            </Link>
            <Link
              href="/protocols/mqtt"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-300 text-xs font-mono hover:bg-amber-500/10 transition-colors"
            >
              <Cpu className="w-4 h-4 text-amber-400" />
              <span>MQTT Pub/Sub Simulator</span>
            </Link>
            <Link
              href="/protocols/tcp"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-indigo-500/40 text-indigo-300 text-xs font-mono hover:bg-indigo-500/10 transition-colors"
            >
              <Terminal className="w-4 h-4 text-indigo-400" />
              <span>TCP 3-Way Handshake</span>
            </Link>
          </div>

          <p className="text-[11px] font-mono text-slate-500 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <span className="text-emerald-400">Free and open source</span>
            <span aria-hidden="true">·</span>
            <span>No account</span>
            <span aria-hidden="true">·</span>
            <span>No ads or tracking</span>
            <span aria-hidden="true">·</span>
            <Link href="/record" className="text-indigo-300 hover:text-indigo-200 underline underline-offset-2">
              Progress stays in your browser
            </Link>
          </p>
        </div>
      </section>

      <ContinueLearning />

      {/* Main Protocol Catalog & Interactive Explorer */}
      <section id="protocols" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Controls Bar: Search & Categories */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-lg">
              <Search className="w-4 h-4 text-indigo-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by protocol (DNS), port (53, 1883), RFC, or layer..."
                aria-label="Search protocols"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors font-mono shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white p-1"
                  title="Clear search"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              )}
            </div>

            {/* OSI Layer Selector */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-500 text-xs font-mono flex items-center gap-1 shrink-0">
                <Layers className="w-3.5 h-3.5" />
                OSI Layer:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {OSI_LAYERS.map((layer) => (
                  <button
                    key={layer}
                    type="button"
                    onClick={() => setSelectedLayer(layer)}
                    aria-pressed={selectedLayer === layer}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                      selectedLayer === layer
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {layer === 'all' ? 'All' : layer}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick search suggestions */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
            <span className="font-mono text-[11px] mr-1">Quick search:</span>
            {POPULAR_SEARCHES.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => setSearchQuery(term)}
                className="px-2 py-1 rounded-md bg-slate-900 border border-slate-800 hover:border-slate-700 hover:text-indigo-300 font-mono text-[11px] text-slate-400 transition-colors"
              >
                {term}
              </button>
            ))}
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {CATEGORIES_META.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.id);
                  // if searching globally, reset view to this category
                }}
                aria-pressed={selectedCategory === cat.id && !isSearchingGlobally}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                  selectedCategory === cat.id && !isSearchingGlobally
                    ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/30'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  selectedCategory === cat.id && !isSearchingGlobally ? 'bg-indigo-800 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {cat.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Search feedback banner if searching across all categories */}
        {isSearchingGlobally && (
          <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200 flex items-center justify-between gap-3">
            <span>
              💡 No protocols in &quot;{selectedCategory}&quot; matched &quot;{searchQuery}&quot;, showing <strong>{filteredProtocols.length} matches</strong> found across all categories:
            </span>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                setSelectedLayer('all');
              }}
              className="text-xs font-bold text-cyan-400 hover:underline shrink-0"
            >
              Reset category filter
            </button>
          </div>
        )}

        {/* Results Counter */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 font-mono border-b border-slate-800 pb-2">
          <span>
            Showing <strong className="text-white">{filteredProtocols.length}</strong> of {PROTOCOLS.length} protocols
          </span>
          {(searchQuery || selectedCategory !== 'all' || selectedLayer !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedLayer('all');
              }}
              className="text-indigo-400 hover:underline flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset all filters</span>
            </button>
          )}
        </div>

        {/* Protocol Grid */}
        {filteredProtocols.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProtocols.map((protocol) => (
              <ProtocolCard key={protocol.id} protocol={protocol} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 space-y-3">
            <Layers className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No matching protocols found for &quot;{searchQuery}&quot;</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              We couldn&apos;t find any protocols matching your query. Try searching by protocol name (e.g. DNS, MQTT, TCP), standard port (e.g. 53, 443, 1883), or RFC.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                setSelectedLayer('all');
                setSearchQuery('');
              }}
              className="text-xs text-indigo-400 font-semibold hover:underline"
            >
              Reset all filters
            </button>
          </div>
        )}
      </section>

      {/* Daily Threat Radar / Threat of the Week */}
      {(() => {
        const featured = ATTACKS[featuredIndex] ?? ATTACKS[0];
        if (!featured) return null;

        return (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-rose-500/30 bg-gradient-to-r from-rose-950/30 via-slate-900/80 to-slate-950 p-6 sm:p-8 space-y-4 shadow-xl shadow-rose-950/10">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
                  <ShieldAlert className="w-3.5 h-3.5 animate-pulse" aria-hidden="true" />
                  <span>Threat Radar — Threat of the Day</span>
                </div>
                <Link
                  href="/attacks"
                  className="text-xs font-mono font-bold text-rose-300 hover:text-rose-200 inline-flex items-center gap-1.5"
                >
                  Explore All {ATTACKS.length} Scenarios
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">{featured.name}</h3>
                  <span className="text-xs font-mono text-amber-400">
                    {'★'.repeat(featured.difficulty)}{'☆'.repeat(3 - featured.difficulty)}
                  </span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">{featured.summary}</p>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  href={`/protocols/${featured.protocolSlug}#attacks`}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold transition-all shadow-md shadow-rose-900/30 inline-flex items-center gap-2"
                >
                  <span>Launch Threat Simulation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/attacks"
                  className="px-4 py-2 rounded-xl border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white font-mono text-xs transition-colors"
                >
                  Browse Attack Taxonomy
                </Link>
              </div>
            </div>
          </section>
        );
      })()}
    </div>
  );
}
