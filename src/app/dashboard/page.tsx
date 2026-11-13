'use client';

import React from 'react';
import Link from 'next/link';
import { PROTOCOLS } from '@/data/protocols';
import { useProgress } from '@/context/ProgressContext';
import { Award, Bookmark, CheckCircle2, BookOpen, ArrowRight, Play, Sparkles, Layers, Cpu, Shield, Globe, Terminal } from 'lucide-react';

export default function DashboardPage() {
  const { learnedProtocols, bookmarkedProtocols, quizScores, toggleLearned, toggleBookmark } = useProgress();

  const totalProtocols = PROTOCOLS.length;
  const learnedCount = learnedProtocols.length;
  const progressPercent = Math.round((learnedCount / totalProtocols) * 100);

  const bookmarkedItems = PROTOCOLS.filter((p) => bookmarkedProtocols.includes(p.id));
  const learnedItems = PROTOCOLS.filter((p) => learnedProtocols.includes(p.id));

  // Curated Learning Paths
  const LEARNING_PATHS = [
    {
      id: 'web',
      title: 'Web & API Protocols',
      description: 'Master the core protocols powering web browsers, APIs, and microservices.',
      icon: <Globe className="w-5 h-5 text-indigo-400" />,
      slugs: ['http', 'dns', 'websocket', 'grpc', 'tls'],
      color: 'border-indigo-500/30'
    },
    {
      id: 'iot',
      title: 'IoT & Smart Home Masterclass',
      description: 'Learn pub/sub messaging, low-power mesh, and industrial automation.',
      icon: <Cpu className="w-5 h-5 text-amber-400" />,
      slugs: ['mqtt', 'coap', 'zigbee', 'lorawan', 'matter', 'modbus', 'opc-ua', 'ble', 'zwave', 'canbus', 'bacnet'],
      color: 'border-amber-500/30'
    },
    {
      id: 'network',
      title: 'Core Internet & Routing',
      description: 'Understand packet switching, routing algorithms, and reliable byte transport.',
      icon: <Layers className="w-5 h-5 text-emerald-400" />,
      slugs: ['tcp', 'udp', 'ipv4', 'ipv6', 'icmp', 'arp', 'dhcp', 'bgp', 'ospf', 'ntp'],
      color: 'border-emerald-500/30'
    },
    {
      id: 'security',
      title: 'Security, Identity & VPN',
      description: 'Deep dive into transport encryption, VPN tunneling, and auth delegation.',
      icon: <Shield className="w-5 h-5 text-rose-400" />,
      slugs: ['tls', 'ipsec', 'wireguard', 'oauth2', 'ssh', 'kerberos', 'saml'],
      color: 'border-rose-500/30'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Top Header */}
      <div className="space-y-4 pt-4 border-b border-slate-800 pb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-medium">
          <Award className="w-3.5 h-3.5 text-cyan-400" />
          <span>Student & Engineer Mastery Dashboard</span>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Your Learning Journey
            </h1>
            <p className="text-sm text-slate-300 mt-1">
              Track protocols learned, bookmarked references, and curated study roadmaps.
            </p>
          </div>

          {/* Quick Mastery Stat */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-4 min-w-[240px]">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center font-bold text-lg font-mono">
              {progressPercent}%
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono block">Overall Mastery</span>
              <span className="text-sm font-bold text-white font-mono">
                {learnedCount} of {totalProtocols} Protocols
              </span>
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 transition-all duration-500"
            style={{ width: `${Math.max(progressPercent, 4)}%` }}
          />
        </div>
      </div>

      {/* SECTION 1: Curated Learning Paths */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            Curated Protocol Learning Paths
          </h2>
          <p className="text-xs text-slate-400">Step-by-step roadmaps designed for specialized engineering roles.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {LEARNING_PATHS.map((path) => {
            const pathProtocols = PROTOCOLS.filter((p) => path.slugs.includes(p.slug));
            const pathLearnedCount = pathProtocols.filter((p) => learnedProtocols.includes(p.id)).length;
            const pathPercent = Math.round((pathLearnedCount / pathProtocols.length) * 100);

            return (
              <div
                key={path.id}
                className={`rounded-2xl border ${path.color} bg-slate-900/80 p-6 space-y-4 hover:bg-slate-900 transition-all shadow-lg`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center">
                      {path.icon}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">{path.title}</h3>
                      <p className="text-xs text-slate-400 line-clamp-1">{path.description}</p>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-bold text-indigo-300 shrink-0">
                    {pathLearnedCount}/{pathProtocols.length}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 transition-all duration-300"
                    style={{ width: `${pathPercent}%` }}
                  />
                </div>

                {/* Protocol Chips */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {pathProtocols.map((proto) => {
                    const isDone = learnedProtocols.includes(proto.id);
                    return (
                      <Link
                        key={proto.id}
                        href={`/protocols/${proto.slug}`}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 border ${
                          isDone
                            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {isDone && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                        <span>{proto.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 2: Bookmarked Protocols */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-amber-400" />
            Bookmarked for Reference ({bookmarkedItems.length})
          </h2>
          <p className="text-xs text-slate-400">Quickly access protocols saved for study or documentation.</p>
        </div>

        {bookmarkedItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookmarkedItems.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-white text-sm">{p.name}</h4>
                  <p className="text-xs text-slate-400 font-mono truncate max-w-[180px]">{p.fullName}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleBookmark(p.id)}
                    className="p-1.5 rounded-lg text-amber-400 hover:bg-slate-800"
                    title="Remove Bookmark"
                  >
                    <Bookmark className="w-4 h-4 fill-current" />
                  </button>
                  <Link
                    href={`/protocols/${p.slug}`}
                    className="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl border border-dashed border-slate-800 text-center text-slate-500 text-xs">
            No bookmarked protocols yet. Click the &quot;Bookmark&quot; button on any protocol page to save it here.
          </div>
        )}
      </section>
    </div>
  );
}
