'use client';

import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Protocol } from '@/types/protocol';
import { getLayerColor, getCategoryBadge } from '@/lib/utils';
import { useProgress } from '@/context/ProgressContext';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Activity,
  Terminal,
  Check,
  X,
  Globe,
  Bookmark,
  CheckCircle2,
} from 'lucide-react';

const InteractiveVisualizer = dynamic(() => import('@/components/InteractiveVisualizer'), {
  loading: () => <div className="h-72 rounded-2xl border border-slate-800 bg-slate-900/60 animate-pulse" />,
});

const DnsSandbox = dynamic(() => import('@/components/sandboxes/DnsSandbox'), {
  loading: () => <SandboxSkeleton />,
});
const MqttSandbox = dynamic(() => import('@/components/sandboxes/MqttSandbox'), {
  loading: () => <SandboxSkeleton />,
});
const TcpSandbox = dynamic(() => import('@/components/sandboxes/TcpSandbox'), {
  loading: () => <SandboxSkeleton />,
});
const HttpSandbox = dynamic(() => import('@/components/sandboxes/HttpSandbox'), {
  loading: () => <SandboxSkeleton />,
});
const WebSocketSandbox = dynamic(() => import('@/components/sandboxes/WebSocketSandbox'), {
  loading: () => <SandboxSkeleton />,
});
const GenericSandbox = dynamic(() => import('@/components/sandboxes/GenericSandbox'), {
  loading: () => <SandboxSkeleton />,
});
const QuizSection = dynamic(() => import('@/components/QuizSection'), {
  loading: () => <div className="h-48 rounded-2xl border border-slate-800 bg-slate-900/60 animate-pulse" />,
});

function SandboxSkeleton() {
  return <div className="h-64 rounded-2xl border border-slate-800 bg-slate-900/60 animate-pulse" />;
}

interface ProtocolDetailProps {
  protocol: Protocol;
  previousProtocol: { slug: string; name: string } | null;
  nextProtocol: { slug: string; name: string } | null;
}

export default function ProtocolDetail({ protocol, previousProtocol, nextProtocol }: ProtocolDetailProps) {
  const { toggleLearned, toggleBookmark, isLearned, isBookmarked } = useProgress();

  const learned = isLearned(protocol.id);
  const bookmarked = isBookmarked(protocol.id);
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
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Back to all protocols</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => toggleBookmark(protocol.id)}
            aria-pressed={bookmarked}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-all ${
              bookmarked
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Bookmark this protocol"
          >
            <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-current' : ''}`} aria-hidden="true" />
            <span>{bookmarked ? 'Bookmarked' : 'Bookmark'}</span>
          </button>

          <button
            type="button"
            onClick={() => toggleLearned(protocol.id)}
            aria-pressed={learned}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-all ${
              learned
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Mark as learned"
          >
            <CheckCircle2 className={`w-3.5 h-3.5 ${learned ? 'text-emerald-400' : ''}`} aria-hidden="true" />
            <span>{learned ? 'Learned' : 'Mark Learned'}</span>
          </button>

          {previousProtocol && (
            <Link
              href={`/protocols/${previousProtocol.slug}`}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:border-slate-700 flex items-center gap-1 font-mono"
            >
              <ArrowLeft className="w-3 h-3" aria-hidden="true" />
              <span>{previousProtocol.name}</span>
            </Link>
          )}
          {nextProtocol && (
            <Link
              href={`/protocols/${nextProtocol.slug}`}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:border-slate-700 flex items-center gap-1 font-mono"
            >
              <span>{nextProtocol.name}</span>
              <ArrowRight className="w-3 h-3" aria-hidden="true" />
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
          <div className="flex flex-wrap items-baseline gap-3">
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
        <SectionHeading
          icon={<Activity className="w-4 h-4 text-indigo-400" aria-hidden="true" />}
          iconClassName="bg-indigo-600/20 border-indigo-500/30"
          title={`Interactive Session: How ${protocol.name} Works`}
          subtitle="Step through the packet exchange sequence between nodes."
        />
        <InteractiveVisualizer protocol={protocol} />
      </section>

      {/* SECTION 2: Live Sandbox Example */}
      <section className="space-y-4">
        <SectionHeading
          icon={<Terminal className="w-4 h-4 text-emerald-400" aria-hidden="true" />}
          iconClassName="bg-emerald-600/20 border-emerald-500/30"
          title="Interactive Execution Sandbox"
          subtitle={`Interact with a live or clearly-labelled simulated instance of ${protocol.name}.`}
        />
        {renderSandbox()}
      </section>

      {/* SECTION 3: Deep Dive Theory & Specs */}
      <section className="space-y-6">
        <SectionHeading
          icon={<BookOpen className="w-4 h-4 text-cyan-400" aria-hidden="true" />}
          iconClassName="bg-cyan-600/20 border-cyan-500/30"
          title="Protocol Specification & Architecture"
          subtitle="Key characteristics, real-world deployment patterns, and trade-offs."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoList title="Core Technical Features" icon={<Check className="w-4 h-4 text-emerald-400" aria-hidden="true" />} items={protocol.keyFeatures} dotClassName="bg-indigo-500" />
          <InfoList title="Real-World Use Cases" icon={<Globe className="w-4 h-4 text-cyan-400" aria-hidden="true" />} items={protocol.useCases} dotClassName="bg-cyan-500" />
          <InfoList title="Advantages & Strengths" icon={<Check className="w-4 h-4 text-emerald-400" aria-hidden="true" />} items={protocol.pros} dotClassName="bg-emerald-400" />
          <InfoList title="Limitations & Vulnerabilities" icon={<X className="w-4 h-4 text-rose-400" aria-hidden="true" />} items={protocol.cons} dotClassName="bg-rose-400" />
        </div>
      </section>

      {/* SECTION 4: Quiz & Knowledge Check */}
      <section>
        <QuizSection questions={protocol.quiz} protocolName={protocol.name} protocolId={protocol.id} />
      </section>
    </div>
  );
}

function SectionHeading({
  icon,
  iconClassName,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  iconClassName: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-7 h-7 rounded-lg border flex items-center justify-center ${iconClassName}`}>
        {icon}
      </div>
      <div>
        <h2 className="text-lg font-bold text-white">{title}</h2>
        <p className="text-xs text-slate-400">{subtitle}</p>
      </div>
    </div>
  );
}

function InfoList({
  title,
  icon,
  items,
  dotClassName,
}: {
  title: string;
  icon: React.ReactNode;
  items: string[];
  dotClassName: string;
}) {
  return (
    <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
      <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
        {icon}
        {title}
      </h3>
      <ul className="space-y-2.5">
        {items.map((item, index) => (
          <li key={index} className="text-xs text-slate-300 flex items-start gap-2.5">
            <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${dotClassName}`} />
            <span className="leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
