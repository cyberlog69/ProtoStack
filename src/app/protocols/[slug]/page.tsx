'use client';

import React from 'react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { PROTOCOLS } from '@/data/protocols';
import { getLayerColor, getCategoryBadge } from '@/lib/utils';
import InteractiveVisualizer from '@/components/InteractiveVisualizer';
import DnsSandbox from '@/components/sandboxes/DnsSandbox';
import MqttSandbox from '@/components/sandboxes/MqttSandbox';
import TcpSandbox from '@/components/sandboxes/TcpSandbox';
import HttpSandbox from '@/components/sandboxes/HttpSandbox';
import WebSocketSandbox from '@/components/sandboxes/WebSocketSandbox';
import GenericSandbox from '@/components/sandboxes/GenericSandbox';
import QuizSection from '@/components/QuizSection';
import { useProgress } from '@/context/ProgressContext';
import { ArrowLeft, ArrowRight, BookOpen, Activity, Terminal, Shield, Check, X, Layers, Cpu, Globe, Bookmark, CheckCircle2 } from 'lucide-react';

export default function ProtocolDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const protocolIndex = PROTOCOLS.findIndex((p) => p.slug === slug);
  const protocol = PROTOCOLS[protocolIndex];
  const { toggleLearned, toggleBookmark, isLearned, isBookmarked } = useProgress();

  if (!protocol) {
    notFound();
  }

  const learned = isLearned(protocol.id);
  const bookmarked = isBookmarked(protocol.id);

  const prevProtocol = protocolIndex > 0 ? PROTOCOLS[protocolIndex - 1] : null;
  const nextProtocol = protocolIndex < PROTOCOLS.length - 1 ? PROTOCOLS[protocolIndex + 1] : null;

  const catBadge = getCategoryBadge(protocol.category);
  const layerBadge = getLayerColor(protocol.osiLayer);

  const renderSandbox = () => {
    switch (protocol.liveSandboxType) {
      case 'dns-resolver':
        return <DnsSandbox />;
      case 'mqtt-broker':
        return <MqttSandbox />;
      case 'tcp-handshake':
        return <TcpSandbox />;
      case 'http-client':
        return <HttpSandbox />;
      case 'websocket-chat':
        return <WebSocketSandbox />;
      default:
        return <GenericSandbox protocol={protocol} />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <Link
          href="/#protocols"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to all protocols</span>
        </Link>

        {/* Quick Prev / Next Navigator & Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleBookmark(protocol.id)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-all ${
              bookmarked
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Bookmark this protocol"
          >
            <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-current' : ''}`} />
            <span>{bookmarked ? 'Bookmarked' : 'Bookmark'}</span>
          </button>

          <button
            onClick={() => toggleLearned(protocol.id)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-all ${
              learned
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Mark as learned"
          >
            <CheckCircle2 className={`w-3.5 h-3.5 ${learned ? 'text-emerald-400' : ''}`} />
            <span>{learned ? 'Learned' : 'Mark Learned'}</span>
          </button>

          {prevProtocol && (
            <Link
              href={`/protocols/${prevProtocol.slug}`}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:border-slate-700 flex items-center gap-1 font-mono"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>{prevProtocol.name}</span>
            </Link>
          )}
          {nextProtocol && (
            <Link
              href={`/protocols/${nextProtocol.slug}`}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:border-slate-700 flex items-center gap-1 font-mono"
            >
              <span>{nextProtocol.name}</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>
      </div>

      {/* Protocol Header Banner */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${catBadge.color}`}>
            {catBadge.label}
          </span>
          <span className={`text-xs font-mono px-2.5 py-1 rounded-md border ${layerBadge}`}>
            OSI: {protocol.osiLayer} Layer
          </span>
          {protocol.port && (
            <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
              Default Port: {protocol.port}
            </span>
          )}
          {protocol.rfc && (
            <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-400">
              Standard: {protocol.rfc}
            </span>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline gap-3">
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              {protocol.name}
            </h1>
            <span className="text-base sm:text-lg text-indigo-400 font-mono font-medium">
              — {protocol.fullName}
            </span>
          </div>
          <p className="text-base text-slate-300 max-w-3xl leading-relaxed">
            {protocol.description}
          </p>
        </div>
      </div>

      {/* SECTION 1: Interactive Animated Visualizer */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Interactive Session: How {protocol.name} Works</h2>
            <p className="text-xs text-slate-400">Step through the packet exchange sequence between nodes.</p>
          </div>
        </div>

        <InteractiveVisualizer protocol={protocol} />
      </section>

      {/* SECTION 2: Live Sandbox Example */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center">
            <Terminal className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Live Execution Sandbox</h2>
            <p className="text-xs text-slate-400">Interact with a live or simulated instance of {protocol.name}.</p>
          </div>
        </div>

        {renderSandbox()}
      </section>

      {/* SECTION 3: Deep Dive Theory & Specs */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Protocol Specification & Architecture</h2>
            <p className="text-xs text-slate-400">Key characteristics, real-world deployment patterns, and trade-offs.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Key Features */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              Core Technical Features
            </h3>
            <ul className="space-y-2.5">
              {protocol.keyFeatures.map((feat, i) => (
                <li key={i} className="text-xs text-slate-300 flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Use Cases */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              Real-World Use Cases
            </h3>
            <ul className="space-y-2.5">
              {protocol.useCases.map((useCase, i) => (
                <li key={i} className="text-xs text-slate-300 flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{useCase}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pros */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              Advantages & Strengths
            </h3>
            <ul className="space-y-2.5">
              {protocol.pros.map((pro, i) => (
                <li key={i} className="text-xs text-slate-300 flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{pro}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Cons */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <X className="w-4 h-4 text-rose-400" />
              Limitations & Vulnerabilities
            </h3>
            <ul className="space-y-2.5">
              {protocol.cons.map((con, i) => (
                <li key={i} className="text-xs text-slate-300 flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{con}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* SECTION 4: Quiz & Knowledge Check */}
      <section>
        <QuizSection questions={protocol.quiz} protocolName={protocol.name} />
      </section>
    </div>
  );
}

