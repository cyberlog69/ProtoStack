'use client';

import React from 'react';
import Link from 'next/link';
import { PROTOCOLS } from '@/data/protocols';
import { useProgress } from '@/context/ProgressContext';
import {
  Award,
  Bookmark,
  CheckCircle2,
  BookOpen,
  Play,
  Layers,
  Cpu,
  Shield,
  Globe,
  Brain,
} from 'lucide-react';

const CATEGORY_LABELS: Record<string, string> = {
  all: 'All Protocols',
  network: 'Network & Internet',
  transport: 'Transport Layer',
  application: 'Application Layer',
  iot: 'IoT & SCADA',
  security: 'Security & Auth',
  wireless: 'Wireless & Radio',
  cloud: 'Cloud & Messaging',
};

export default function DashboardPage() {
  const { learnedProtocols, bookmarkedProtocols, quizScores, toggleLearned, toggleBookmark } = useProgress();

  const totalProtocols = PROTOCOLS.length;
  const learnedCount = learnedProtocols.length;
  const progressPercent = totalProtocols > 0 ? Math.round((learnedCount / totalProtocols) * 100) : 0;

  const bookmarkedItems = PROTOCOLS.filter((protocol) => bookmarkedProtocols.includes(protocol.id));

  const quizEntries = Object.entries(quizScores)
    .map(([id, value]) => {
      const categoryId = id.startsWith('quiz-') ? id.slice('quiz-'.length) : null;
      const protocol = categoryId ? null : PROTOCOLS.find((entry) => entry.id === id);
      return {
        id,
        label: categoryId ? CATEGORY_LABELS[categoryId] || categoryId : protocol?.name || id,
        score: value.score,
        total: value.total,
        percent: Math.round((value.score / value.total) * 100),
        updatedAt: value.updatedAt,
      };
    })
    .sort((a, b) => b.percent - a.percent);

  const averageQuizPercent =
    quizEntries.length > 0
      ? Math.round(quizEntries.reduce((total, entry) => total + entry.percent, 0) / quizEntries.length)
      : 0;

  const LEARNING_PATHS = [
    {
      id: 'web',
      title: 'Web & API Protocols',
      description: 'Master the core protocols powering web browsers, APIs, and microservices.',
      icon: <Globe className="w-5 h-5 text-indigo-400" aria-hidden="true" />,
      slugs: ['http', 'dns', 'websocket', 'grpc', 'tls'],
      color: 'border-indigo-500/30',
    },
    {
      id: 'iot',
      title: 'IoT & Smart Home Masterclass',
      description: 'Learn pub/sub messaging, low-power mesh, and industrial automation.',
      icon: <Cpu className="w-5 h-5 text-amber-400" aria-hidden="true" />,
      slugs: ['mqtt', 'coap', 'zigbee', 'lorawan', 'matter', 'modbus', 'opc-ua', 'ble', 'zwave', 'canbus', 'bacnet'],
      color: 'border-amber-500/30',
    },
    {
      id: 'network',
      title: 'Core Internet & Routing',
      description: 'Understand packet switching, routing algorithms, and reliable byte transport.',
      icon: <Layers className="w-5 h-5 text-emerald-400" aria-hidden="true" />,
      slugs: ['tcp', 'udp', 'ipv4', 'ipv6', 'icmp', 'arp', 'dhcp', 'bgp', 'ospf', 'ntp'],
      color: 'border-emerald-500/30',
    },
    {
      id: 'security',
      title: 'Security, Identity & VPN',
      description: 'Deep dive into transport encryption, VPN tunnelling, and auth delegation.',
      icon: <Shield className="w-5 h-5 text-rose-400" aria-hidden="true" />,
      slugs: ['tls', 'ipsec', 'wireguard', 'oauth2', 'ssh', 'kerberos', 'saml'],
      color: 'border-rose-500/30',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <div className="space-y-4 pt-4 border-b border-slate-800 pb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-medium">
          <Award className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
          <span>Student &amp; Engineer Mastery Dashboard</span>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Your Learning Journey
            </h1>
            <p className="text-sm text-slate-300 mt-1">
              Track protocols learned, quiz results, bookmarked references, and curated study roadmaps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-auto">
            <StatCard label="Overall Mastery" value={`${progressPercent}%`} detail={`${learnedCount} of ${totalProtocols}`} />
            <StatCard label="Quiz Average" value={`${averageQuizPercent}%`} detail={`${quizEntries.length} saved`} />
            <StatCard label="Bookmarks" value={String(bookmarkedItems.length)} detail="Saved references" />
          </div>
        </div>

        <div
          className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progressPercent}
          aria-label="Overall protocol mastery"
        >
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" aria-hidden="true" />
            Curated Protocol Learning Paths
          </h2>
          <p className="text-xs text-slate-400">Step-by-step roadmaps designed for specialised engineering roles.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {LEARNING_PATHS.map((path) => {
            const pathProtocols = PROTOCOLS.filter((protocol) => path.slugs.includes(protocol.slug));
            const pathLearnedCount = pathProtocols.filter((protocol) => learnedProtocols.includes(protocol.id)).length;
            const pathPercent =
              pathProtocols.length > 0 ? Math.round((pathLearnedCount / pathProtocols.length) * 100) : 0;

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

                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 transition-all duration-300"
                    style={{ width: `${pathPercent}%` }}
                  />
                </div>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {pathProtocols.map((protocol) => {
                    const isDone = learnedProtocols.includes(protocol.id);
                    return (
                      <Link
                        key={protocol.id}
                        href={`/protocols/${protocol.slug}`}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 border ${
                          isDone
                            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {isDone && <CheckCircle2 className="w-3 h-3 text-emerald-400" aria-hidden="true" />}
                        <span>{protocol.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-amber-400" aria-hidden="true" />
            Quiz Results ({quizEntries.length})
          </h2>
          <p className="text-xs text-slate-400">
            Best result per protocol or category is kept in local storage. Nothing is uploaded.
          </p>
        </div>

        {quizEntries.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {quizEntries.map((entry) => {
              const tone =
                entry.percent >= 80
                  ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300'
                  : entry.percent >= 50
                    ? 'border-amber-500/40 bg-amber-950/20 text-amber-300'
                    : 'border-rose-500/40 bg-rose-950/20 text-rose-300';

              return (
                <div key={entry.id} className={`rounded-xl border ${tone} p-4 space-y-2`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-white truncate">{entry.label}</span>
                    <span className="text-xs font-mono font-bold">{entry.percent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-950/60 rounded-full overflow-hidden">
                    <div className="h-full bg-current" style={{ width: `${entry.percent}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono opacity-80">
                    <span>
                      {entry.score}/{entry.total} correct
                    </span>
                    <time dateTime={entry.updatedAt}>
                      {new Date(entry.updatedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </time>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 rounded-2xl border border-dashed border-slate-800 text-center text-slate-400 text-xs">
            No quiz attempts yet.{' '}
            <Link href="/quiz" className="text-indigo-400 hover:underline">
              Start a challenge
            </Link>{' '}
            or take the quiz on any protocol page.
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-amber-400" aria-hidden="true" />
            Bookmarked for Reference ({bookmarkedItems.length})
          </h2>
          <p className="text-xs text-slate-400">Quickly access protocols saved for study or documentation.</p>
        </div>

        {bookmarkedItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookmarkedItems.map((protocol) => {
              const isLearned = learnedProtocols.includes(protocol.id);
              return (
                <div
                  key={protocol.id}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between"
                >
                  <div className="min-w-0">
                    <h3 className="font-bold text-white text-sm">{protocol.name}</h3>
                    <p className="text-xs text-slate-400 font-mono truncate max-w-[180px]">{protocol.fullName}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleBookmark(protocol.id)}
                      className="p-1.5 rounded-lg text-amber-400 hover:bg-slate-800"
                      title="Remove bookmark"
                      aria-label={`Remove bookmark for ${protocol.name}`}
                    >
                      <Bookmark className="w-4 h-4 fill-current" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleLearned(protocol.id)}
                      className="p-1.5 rounded-lg text-emerald-400 hover:bg-slate-800"
                      title={isLearned ? 'Mark as not learned' : 'Mark as learned'}
                      aria-label={isLearned ? `Mark ${protocol.name} as not learned` : `Mark ${protocol.name} as learned`}
                    >
                      <CheckCircle2 className={`w-4 h-4 ${isLearned ? 'fill-current' : ''}`} aria-hidden="true" />
                    </button>
                    <Link
                      href={`/protocols/${protocol.slug}`}
                      className="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white transition-colors"
                      aria-label={`Open ${protocol.name}`}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 rounded-2xl border border-dashed border-slate-800 text-center text-slate-400 text-xs">
            No bookmarked protocols yet. Click the &quot;Bookmark&quot; button on any protocol page to save it here.
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono block">{label}</span>
      <span className="text-2xl font-black text-white font-mono mt-0.5 block">{value}</span>
      <span className="text-[11px] text-slate-400 font-mono">{detail}</span>
    </div>
  );
}
