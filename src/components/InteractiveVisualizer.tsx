'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { Protocol } from '@/types/protocol';
import { crc32Hex, hexDump, toBitString } from '@/lib/hex';
import {
  getHeaderLayer,
  getProtocolLayout,
  type HeaderField,
  type HeaderLayer,
} from '@/data/headerLayouts';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Laptop,
  Server,
  Globe,
  Database,
  ShieldCheck,
  Cpu,
  Smartphone,
  Network,
  Radio,
  CheckCircle2,
  Clock,
  CreditCard,
  Zap,
  Terminal,
  ListOrdered,
  Table2,
  Binary,
  Boxes,
  Code2,
} from 'lucide-react';

type TabId = 'process' | 'tree' | 'bytes' | 'nodes' | 'syntax';

const ACTOR_ICONS: Record<string, React.ReactNode> = {
  Laptop: <Laptop className="w-5 h-5 text-indigo-400" aria-hidden="true" />,
  Server: <Server className="w-5 h-5 text-cyan-400" aria-hidden="true" />,
  Globe: <Globe className="w-5 h-5 text-amber-400" aria-hidden="true" />,
  Database: <Database className="w-5 h-5 text-emerald-400" aria-hidden="true" />,
  ShieldCheck: <ShieldCheck className="w-5 h-5 text-rose-400" aria-hidden="true" />,
  Cpu: <Cpu className="w-5 h-5 text-emerald-400" aria-hidden="true" />,
  Smartphone: <Smartphone className="w-5 h-5 text-amber-400" aria-hidden="true" />,
  Network: <Network className="w-5 h-5 text-blue-400" aria-hidden="true" />,
  Clock: <Clock className="w-5 h-5 text-emerald-400" aria-hidden="true" />,
  CreditCard: <CreditCard className="w-5 h-5 text-rose-400" aria-hidden="true" />,
  Terminal: <Terminal className="w-5 h-5 text-slate-300" aria-hidden="true" />,
};

function actorIcon(name: string) {
  return ACTOR_ICONS[name] ?? <Radio className="w-5 h-5 text-indigo-400" aria-hidden="true" />;
}

function isInteractiveTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    Boolean(target.closest('input, textarea, select, button, a, [contenteditable="true"], [role="textbox"]'))
  );
}

/** Turns `sequenceNumber` into `Sequence Number` and expands common acronyms. */
function humanize(key: string): string {
  return key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim()
    .replace(
      /\b(id|ip|ttl|tcp|udp|tls|dns|mac|ack|syn|fin|rst|url|uri|json|http|https|api|qos|mss|mtu|crc|uuid|cid|vn|vni|vlan|ttl)\b/gi,
      (match) => match.toUpperCase(),
    )
    .replace(/^./, (character) => character.toUpperCase());
}

function formatValue(value: unknown): string {
  if (value === null) return 'null';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return JSON.stringify(value);
}

function describeType(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return `array[${value.length}]`;
  return typeof value;
}

/** Removes a redundant "Step 2:" prefix from titles shown next to a step number. */
function stepLabel(title: string): string {
  return title.replace(/^step\s*\d+\s*[:.\-–]\s*/i, '').trim() || title;
}

const normaliseKey = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

function withFieldOffsets(fields: HeaderField[]): { field: HeaderField; bitStart: number }[] {
  const rows: { field: HeaderField; bitStart: number }[] = [];
  let cursor = 0;

  for (const field of fields) {
    rows.push({ field, bitStart: cursor });
    if (field.bits !== null) cursor += field.bits;
  }

  return rows;
}

export default function InteractiveVisualizer({ protocol }: { protocol: Protocol }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<0.5 | 1 | 2>(1);
  const [activeTab, setActiveTab] = useState<TabId>('process');
  const [packetProgress, setPacketProgress] = useState(0);
  const shouldReduceMotion = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);

  const steps = protocol.interactiveSteps;
  const currentStep = steps[currentStepIndex] ?? steps[0];
  const previousStep = currentStepIndex > 0 ? steps[currentStepIndex - 1] : null;
  const nextStep = currentStepIndex < steps.length - 1 ? steps[currentStepIndex + 1] : null;

  const stepDuration = 3200 / speed;

  useEffect(() => {
    if (!isPlaying) return;

    const intervalMs = 30;
    const progressTimer = window.setInterval(() => {
      setPacketProgress((previous) => Math.min(100, previous + (100 * intervalMs) / stepDuration));
    }, intervalMs);

    const advanceTimer = window.setTimeout(() => {
      if (currentStepIndex < steps.length - 1) {
        setCurrentStepIndex((previous) => previous + 1);
        setPacketProgress(0);
      } else {
        setIsPlaying(false);
        setPacketProgress(100);
      }
    }, stepDuration);

    return () => {
      window.clearTimeout(advanceTimer);
      window.clearInterval(progressTimer);
    };
  }, [isPlaying, currentStepIndex, steps.length, stepDuration]);

  const goToStep = useCallback((index: number) => {
    setIsPlaying(false);
    setCurrentStepIndex(index);
    setPacketProgress(0);
  }, []);

  const handlePlayToggle = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }

    if (currentStepIndex >= steps.length - 1) {
      setCurrentStepIndex(0);
    }
    setPacketProgress(0);
    setIsPlaying(true);
  }, [currentStepIndex, isPlaying, steps.length]);

  const handleNext = useCallback(() => {
    if (currentStepIndex < steps.length - 1) goToStep(currentStepIndex + 1);
  }, [currentStepIndex, goToStep, steps.length]);

  const handlePrev = useCallback(() => {
    if (currentStepIndex > 0) goToStep(currentStepIndex - 1);
  }, [currentStepIndex, goToStep]);

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
    setPacketProgress(0);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isInteractiveTarget(event.target)) return;

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        handleNext();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        handlePrev();
      } else if (event.key === ' ') {
        event.preventDefault();
        handlePlayToggle();
      }
    };

    const panel = panelRef.current;
    if (!panel) return;
    panel.addEventListener('keydown', handleKeyDown);
    return () => panel.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, handlePlayToggle]);

  if (!currentStep) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-10 text-center space-y-2">
        <p className="text-sm font-semibold text-white">No packet steps are available for this protocol yet.</p>
        <p className="text-xs text-slate-400">
          The animated flow is generated from the protocol data set and this entry has no steps.
        </p>
      </div>
    );
  }

  const actors = protocol.actors;
  const actorCount = actors.length;
  const sourceIndex = actors.findIndex((actor) => actor.id === currentStep.actorSource);
  const targetIndex = actors.findIndex((actor) => actor.id === currentStep.actorTarget);
  const sourceActor = sourceIndex >= 0 ? actors[sourceIndex] : null;
  const targetActor = targetIndex >= 0 ? actors[targetIndex] : null;

  // Nodes are centred in equal grid columns, so the wire uses the same centres.
  const centrePercent = (index: number) => (actorCount > 0 ? ((index + 0.5) / actorCount) * 100 : 50);
  const sourceX = sourceIndex >= 0 ? centrePercent(sourceIndex) : 12;
  const targetX = targetIndex >= 0 ? centrePercent(targetIndex) : 88;
  const movingRight = targetX >= sourceX;
  const shownProgress = shouldReduceMotion ? 100 : packetProgress;
  const shownPacketX = sourceX + (targetX - sourceX) * (shownProgress / 100);

  const payload = currentStep.packetInfo?.payload ?? {};
  const payloadEntries = Object.entries(payload);
  const payloadJson = JSON.stringify(payload);
  const payloadBytes = new TextEncoder().encode(payloadJson).byteLength;
  const checksum = crc32Hex(payloadJson);
  const hexLines = hexDump(payloadJson);
  const bitString = toBitString(payloadJson, 16);
  const packetType = currentStep.packetInfo?.type ?? 'Protocol message';

  const layout = getProtocolLayout(protocol.slug);
  const layerStack = (layout?.layers ?? [])
    .map((id) => getHeaderLayer(id))
    .filter((layer): layer is HeaderLayer => Boolean(layer));

  // Many payloads describe endpoints as "address:port". Derive those fields so
  // the port and address rows in the tree are populated even when the model
  // payload only carries the endpoint string.
  const parseEndpoint = (value?: string) => {
    if (!value) return null;
    const match = value.trim().match(/^(.*?):(\d{1,5})$/);
    if (!match) return null;
    return { host: match[1].replace(/^\[|\]$/g, '').trim(), port: match[2] };
  };
  const isIpAddress = (host: string) => /^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.includes(':');

  const sourceEndpoint = parseEndpoint(currentStep.packetInfo?.source);
  const targetEndpoint = parseEndpoint(currentStep.packetInfo?.destination);
  const derived = new Map<string, unknown>();
  if (sourceEndpoint) derived.set('sourceport', sourceEndpoint.port);
  if (targetEndpoint) derived.set('destinationport', targetEndpoint.port);
  if (sourceEndpoint && isIpAddress(sourceEndpoint.host)) {
    derived.set('sourceaddress', sourceEndpoint.host);
    derived.set('srcip', sourceEndpoint.host);
    derived.set('source', sourceEndpoint.host);
    derived.set('src', sourceEndpoint.host);
  }
  if (targetEndpoint && isIpAddress(targetEndpoint.host)) {
    derived.set('destinationaddress', targetEndpoint.host);
    derived.set('dstip', targetEndpoint.host);
    derived.set('destination', targetEndpoint.host);
    derived.set('dst', targetEndpoint.host);
  }

  const payloadLookup = new Map(payloadEntries.map(([key, value]) => [normaliseKey(key), value]));
  for (const [key, value] of derived) payloadLookup.set(key, value);
  const resolveValue = (field: HeaderField) => {
    // 1-bit flags are often summarised in a single comma-separated "flags"
    // string; match whole tokens so "STANDARD" cannot match "RD".
    if (field.bits === 1 && payloadLookup.has('flags')) {
      const flags = payloadLookup.get('flags');
      if (typeof flags === 'string') {
        const tokens = flags
          .split(/[,\s+/]+/)
          .map((token) => token.trim().toUpperCase())
          .filter(Boolean);
        return {
          found: true,
          value: tokens.includes(field.name.toUpperCase()) ? 'set' : 'not set',
        };
      }
    }

    // Explicit aliases win; an empty list means the field is not bound by name
    // (prevents generic names such as "Flags" or "ACK" matching another layer).
    const candidates = field.aliases ?? [field.name];
    for (const candidate of candidates) {
      const key = normaliseKey(candidate);
      if (payloadLookup.has(key)) return { found: true, value: payloadLookup.get(key) };
    }
    return { found: false, value: undefined };
  };

  const layerRows: { layer: HeaderLayer; start: number | null }[] = [];
  let headerOffset = 0;
  for (const layer of layerStack) {
    layerRows.push({ layer, start: layer.bytes === null ? null : headerOffset });
    if (layer.bytes !== null) headerOffset += layer.bytes;
  }
  const fixedHeaderBytes = headerOffset;

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'process', label: 'Process', icon: <ListOrdered className="w-3.5 h-3.5" aria-hidden="true" /> },
    { id: 'tree', label: 'Protocol tree', icon: <Table2 className="w-3.5 h-3.5" aria-hidden="true" /> },
    { id: 'bytes', label: 'Bytes', icon: <Binary className="w-3.5 h-3.5" aria-hidden="true" /> },
    { id: 'nodes', label: 'Nodes', icon: <Boxes className="w-3.5 h-3.5" aria-hidden="true" /> },
    ...(currentStep.codeSnippet
      ? [{ id: 'syntax' as TabId, label: 'Syntax', icon: <Code2 className="w-3.5 h-3.5" aria-hidden="true" /> }]
      : []),
  ];

  return (
    <div
      ref={panelRef}
      tabIndex={0}
      aria-label={`${protocol.name} interactive packet flow`}
      className="rounded-2xl border border-slate-800 bg-slate-900/90 backdrop-blur-md overflow-hidden shadow-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60"
    >
      {/* Controls */}
      <div className="px-4 sm:px-6 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 sm:gap-4 bg-slate-950/80">
        <div className="min-w-0 flex-1 basis-56">
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
            <h3 className="text-base font-bold text-white">Interactive Packet Flow</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Animated model
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5" aria-live="polite">
            Step {currentStepIndex + 1} of {steps.length}:{' '}
            <span className="text-slate-200 font-semibold">{currentStep.title}</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Field values come from the protocol model, not from a live capture.
            <span className="hidden sm:inline"> Focus panel: ← → Space.</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-1.5 sm:gap-2 w-full sm:w-auto">
          <div className="flex rounded-lg bg-slate-900 border border-slate-800 p-0.5 mr-1 text-xs font-mono">
            {([0.5, 1, 2] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setSpeed(value)}
                aria-pressed={speed === value}
                aria-label={`Playback speed ${value}x`}
                className={`px-2 py-1.5 rounded text-[10px] font-bold transition-colors ${
                  speed === value ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title={`Speed ${value}x`}
              >
                {value}x
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            aria-label="Previous step"
            className="p-2.5 sm:p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
            title="Previous step (Left Arrow)"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={handlePlayToggle}
            aria-label={isPlaying ? 'Pause animation' : 'Play animation'}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md shadow-indigo-600/30 min-h-[40px]"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                <span>{currentStepIndex === steps.length - 1 ? 'Replay' : 'Play'}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={currentStepIndex === steps.length - 1}
            aria-label="Next step"
            className="p-2.5 sm:p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
            title="Next step (Right Arrow)"
          >
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={handleReset}
            aria-label="Reset to first step"
            className="p-2.5 sm:p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
            title="Reset to step 1"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Stage */}
      <div className="px-4 sm:px-6 md:px-8 pt-8 pb-5 bg-slate-950 relative overflow-hidden select-none">
        <div className="absolute inset-0 bg-grid-pattern opacity-25 pointer-events-none" aria-hidden="true" />

        <div className="relative z-10">
          <div className="relative h-[44px]" aria-hidden="true">
            <div className="absolute left-0 right-0 top-[22px] h-px bg-slate-800" />
            <div
              className="absolute top-[20px] h-1.5 rounded-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-indigo-500 shadow-lg shadow-cyan-500/40 transition-all duration-300"
              style={{
                left: `${Math.min(sourceX, targetX)}%`,
                width: `${Math.abs(targetX - sourceX)}%`,
              }}
            />
            <ChevronRight
              className="absolute top-[12px] w-5 h-5 text-cyan-300"
              style={{
                left: `${targetX}%`,
                transform: movingRight ? 'translateX(-50%)' : 'translateX(-50%) rotate(180deg)',
              }}
              aria-hidden="true"
            />
          </div>

          <div
            className="absolute z-30 pointer-events-none"
            style={{
              left: `clamp(58px, ${shownPacketX}%, calc(100% - 58px))`,
              top: 22,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <div className="flex flex-col items-center">
              <div className="px-2.5 py-1 rounded-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 text-white font-mono text-[10px] font-black shadow-xl shadow-cyan-500/40 flex items-center gap-1.5 border border-white/40 whitespace-nowrap max-w-[110px] sm:max-w-[150px]">
                <Zap className="w-3 h-3 text-yellow-300 fill-current shrink-0" aria-hidden="true" />
                <span className="truncate">{packetType}</span>
              </div>
              <div className="w-2 h-2 bg-indigo-500 rotate-45 -mt-1 shadow-sm" />
            </div>
          </div>

          <div
            className="grid items-start gap-1"
            style={{ gridTemplateColumns: `repeat(${Math.max(actorCount, 1)}, minmax(0, 1fr))` }}
          >
            {actors.map((actor, index) => {
              const isSource = index === sourceIndex;
              const isTarget = index === targetIndex;
              const active = isSource || isTarget;
              const address = isSource
                ? currentStep.packetInfo?.source
                : isTarget
                  ? currentStep.packetInfo?.destination
                  : null;

              return (
                <div key={actor.id} className="relative flex flex-col items-center text-center px-0.5">
                  {isSource && (
                    <span className="mb-1 px-1.5 py-0.5 rounded-full text-[9px] font-black bg-indigo-500 text-white uppercase tracking-wider">
                      Sends
                    </span>
                  )}
                  {isTarget && (
                    <span className="mb-1 px-1.5 py-0.5 rounded-full text-[9px] font-black bg-cyan-400 text-slate-950 uppercase tracking-wider">
                      Receives
                    </span>
                  )}
                  {!active && <span className="mb-1 h-[18px]" aria-hidden="true" />}

                  <div
                    className={`relative z-10 w-11 h-11 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center border-2 bg-slate-950 transition-all ${
                      isSource
                        ? 'border-indigo-400 shadow-lg shadow-indigo-500/30 ring-2 ring-indigo-500/30'
                        : isTarget
                          ? 'border-cyan-400 shadow-lg shadow-cyan-500/30 ring-2 ring-cyan-500/30'
                          : 'border-slate-800 opacity-75'
                    }`}
                  >
                    {actorIcon(actor.icon)}
                  </div>

                  <span className="mt-2 text-[10px] sm:text-xs font-bold text-white leading-tight max-w-full truncate">{actor.label}</span>
                  <span className="text-[9px] text-slate-500 font-mono max-w-full truncate">{actor.id}</span>
                  <span className="text-[9px] text-slate-400 font-mono max-w-full truncate min-h-[12px]">
                    {address ?? ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mechanism strip */}
        <div className="relative z-10 mt-5 rounded-xl border border-slate-800 bg-slate-900/80 p-3 space-y-2">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-mono">
            <span className="text-slate-500">Direction</span>
            <span className="text-cyan-300 inline-flex flex-wrap items-center gap-1">
              {sourceActor?.label ?? currentStep.actorSource}
              {currentStep.packetInfo?.source && (
                <span className="text-slate-500">({currentStep.packetInfo.source})</span>
              )}
              <ArrowRight className="w-3 h-3" aria-hidden="true" />
              {targetActor?.label ?? currentStep.actorTarget}
              {currentStep.packetInfo?.destination && (
                <span className="text-slate-500">({currentStep.packetInfo.destination})</span>
              )}
            </span>
            <span className="text-slate-500">Frame</span>
            <span className="text-indigo-300">{packetType}</span>
            <span className="text-slate-500">Payload</span>
            <span className="text-slate-300">{payloadBytes} B</span>
            {isPlaying ? (
              <span className="text-emerald-400">in transit {Math.round(packetProgress)}%</span>
            ) : (
              <span className="text-slate-500">
                {packetProgress === 0 ? 'ready — press Play' : 'paused'}
              </span>
            )}
          </div>

          {payloadEntries.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {payloadEntries.slice(0, 6).map(([key, value]) => (
                <span
                  key={key}
                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300"
                >
                  <span className="text-slate-500">{humanize(key)}=</span>
                  <span className="text-emerald-300">{formatValue(value)}</span>
                </span>
              ))}
              {payloadEntries.length > 6 && (
                <span className="text-[10px] font-mono text-slate-500 self-center">
                  +{payloadEntries.length - 6} more fields
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="px-4 sm:px-6 py-3 bg-slate-950 border-t border-b border-slate-800 flex flex-wrap items-center gap-1.5">
        {steps.map((step, index) => {
          const active = index === currentStepIndex;
          const complete = index < currentStepIndex;
          return (
            <button
              key={step.step}
              type="button"
              onClick={() => goToStep(index)}
              aria-current={active ? 'step' : undefined}
              aria-label={`Go to step ${step.step}: ${step.title}`}
              title={step.title}
              className={`px-3 py-1.5 rounded-md text-xs font-mono transition-all shrink-0 flex items-center gap-1.5 ${
                active
                  ? 'bg-indigo-600 text-white font-bold shadow-md'
                  : complete
                    ? 'bg-slate-800/80 text-emerald-400 hover:bg-slate-800'
                    : 'bg-slate-900/50 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              {complete ? (
                <CheckCircle2 className="w-3 h-3 text-emerald-400" aria-hidden="true" />
              ) : (
                <span className="text-[10px] opacity-70">{step.step}</span>
              )}
              <span className="max-w-[220px] sm:max-w-[150px] truncate">{stepLabel(step.title)}</span>
            </button>
          );
        })}
      </div>

      {/* Inspector */}
      <div className="p-4 sm:p-6 bg-slate-900/70">
        <div className="flex flex-wrap items-center gap-1 border-b border-slate-800 pb-3 mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              aria-pressed={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors ${
                activeTab === tab.id
                  ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/40'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'process' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-xs font-mono">
                  {currentStep.step}
                </span>
                {currentStep.title}
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed">{currentStep.description}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 text-xs text-indigo-200 leading-relaxed">
              <span className="font-bold text-indigo-300">What the protocol is doing: </span>
              {currentStep.explanation}
            </div>

            {previousStep && (
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-2 items-center text-xs">
                <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                  <span className="text-[10px] uppercase text-slate-500 block">Previous</span>
                  <span className="text-slate-300">{previousStep.packetInfo?.type ?? previousStep.title}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600 mx-auto hidden sm:block" aria-hidden="true" />
                <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-3">
                  <span className="text-[10px] uppercase text-indigo-400 block">Now</span>
                  <span className="text-white">{packetType}</span>
                </div>
              </div>
            )}

            <div>
              <h5 className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-2">
                Sequence so far
              </h5>
              <ol className="rounded-xl border border-slate-800 bg-slate-950/60 divide-y divide-slate-800 overflow-hidden">
                {steps.map((step, index) => {
                  const active = index === currentStepIndex;
                  const complete = index < currentStepIndex;
                  return (
                    <li key={step.step}>
                      <button
                        type="button"
                        onClick={() => goToStep(index)}
                        className={`w-full text-left px-3 py-2 flex items-start gap-3 transition-colors ${
                          active ? 'bg-indigo-500/10' : 'hover:bg-slate-900/70'
                        }`}
                      >
                        <span
                          className={`mt-0.5 w-5 h-5 shrink-0 rounded-full border flex items-center justify-center text-[10px] font-mono ${
                            active
                              ? 'border-indigo-400 text-indigo-300'
                              : complete
                                ? 'border-emerald-500/50 text-emerald-400'
                                : 'border-slate-700 text-slate-500'
                          }`}
                        >
                          {complete ? <CheckCircle2 className="w-3 h-3" aria-hidden="true" /> : step.step}
                        </span>
                        <span className="min-w-0">
                          <span className={`block text-xs ${active ? 'text-white font-semibold' : 'text-slate-300'}`}>
                            {stepLabel(step.title)}
                          </span>
                          <span className="block text-[10px] font-mono text-slate-500 truncate">
                            {step.packetInfo?.type ?? 'no frame'} · {step.actorSource} → {step.actorTarget}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>

            {nextStep && (
              <p className="text-xs text-slate-400">
                <span className="text-slate-500">Next: </span>
                {nextStep.title}
              </p>
            )}
          </div>
        )}

        {activeTab === 'tree' && (
          <div className="space-y-4 animate-in fade-in duration-200 text-xs font-mono">
            {layerStack.length > 0 ? (
              <>
                <div className="flex flex-wrap items-center gap-1.5">
                  {layerRows.map(({ layer, start }, index) => (
                    <span
                      key={`${layer.id}-${index}`}
                      className="text-[10px] px-2 py-0.5 rounded border bg-slate-950 text-slate-300 border-slate-800"
                    >
                      <span className="text-indigo-300">{layer.name}</span>
                      <span className="text-slate-500">
                        {' '}
                        · {layer.bytes === null ? 'var' : `${layer.bytes} B`}
                        {start !== null ? ` @${start}` : ''}
                      </span>
                    </span>
                  ))}
                  <span className="text-[10px] px-2 py-0.5 rounded border bg-slate-950 text-slate-400 border-slate-800">
                    payload · {payloadBytes} B
                  </span>
                </div>

                {layerRows.map(({ layer, start }, layerIndex) => {
                  return (
                    <details
                      key={`${layer.id}-${layerIndex}`}
                      open={layerIndex === layerRows.length - 1}
                      className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden"
                    >
                      <summary className="px-3 py-2 bg-slate-900 cursor-pointer flex flex-wrap items-center justify-between gap-2 text-[11px]">
                        <span className="text-slate-200 font-bold">{layer.name}</span>
                        <span className="text-slate-500">
                          {start === null ? 'variable offset' : `offset ${start} B`} ·{' '}
                          {layer.bytes === null ? 'variable length' : `${layer.bytes} bytes`}
                        </span>
                      </summary>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <caption className="sr-only">{layer.name} fields</caption>
                          <thead className="text-slate-500 text-[10px] uppercase border-b border-slate-800">
                            <tr>
                              <th scope="col" className="px-3 py-1.5 font-semibold">Field</th>
                              <th scope="col" className="px-3 py-1.5 font-semibold">Bits</th>
                              <th scope="col" className="px-3 py-1.5 font-semibold hidden sm:table-cell">Offset</th>
                              <th scope="col" className="px-3 py-1.5 font-semibold">Value</th>
                              <th scope="col" className="px-3 py-1.5 font-semibold hidden lg:table-cell">Meaning</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/70">
                            {withFieldOffsets(layer.fields).map(({ field, bitStart }) => {
                              const { found, value } = resolveValue(field);
                              const bits = field.bits;
                              const byteStart = start === null ? null : start + Math.floor(bitStart / 8);

                              return (
                                <tr key={field.name} className={found ? 'bg-emerald-500/[0.04]' : ''}>
                                  <th scope="row" className="px-3 py-2 font-normal text-slate-300 whitespace-nowrap">
                                    {field.name}
                                  </th>
                                  <td className="px-3 py-2 text-slate-500">{bits === null ? 'var' : bits}</td>
                                  <td className="px-3 py-2 text-slate-500 hidden sm:table-cell whitespace-nowrap">
                                    {byteStart === null ? '—' : `${byteStart} B`}
                                    {bits !== null && (
                                      <span className="text-slate-600"> · {bitStart}–{bitStart + bits - 1}</span>
                                    )}
                                  </td>
                                  <td className="px-3 py-2">
                                    {found ? (
                                      <span className="text-emerald-300 break-all">{formatValue(value)}</span>
                                    ) : (
                                      <span className="text-slate-600">not in this step</span>
                                    )}
                                  </td>
                                  <td className="px-3 py-2 text-slate-500 hidden lg:table-cell">{field.description}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {layer.note && (
                        <p className="px-3 py-2 border-t border-slate-800 text-[10px] text-slate-500">{layer.note}</p>
                      )}
                    </details>
                  );
                })}

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-[11px] text-slate-400 space-y-1">
                  <p>
                    Fixed headers <span className="text-slate-200">{fixedHeaderBytes} B</span> · decoded payload{' '}
                    <span className="text-slate-200">{payloadBytes} B</span>
                    {fixedHeaderBytes > 0 && (
                      <>
                        {' '}· model size ≈ <span className="text-slate-200">{fixedHeaderBytes + payloadBytes} B</span>
                      </>
                    )}
                  </p>
                  <p>
                    Bit ranges describe the standard header layout. Values are bound from this step&apos;s model
                    payload; fields without a matching value stay blank.
                  </p>
                </div>
              </>
            ) : (
              <>
                <p className="text-[11px] text-slate-500">
                  No byte-level layout is defined for {protocol.name}; showing the decoded model fields for this step.
                </p>
                <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
                  <div className="px-3 py-2 border-b border-slate-800 bg-slate-900 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Decoded fields</span>
                    <span className="text-emerald-400">CRC32 {checksum}</span>
                  </div>
                  {payloadEntries.length > 0 ? (
                    <table className="w-full text-left">
                      <caption className="sr-only">Decoded payload fields for this step</caption>
                      <thead className="text-slate-500 text-[10px] uppercase">
                        <tr>
                          <th scope="col" className="px-3 py-1.5 font-semibold">Field</th>
                          <th scope="col" className="px-3 py-1.5 font-semibold">Value</th>
                          <th scope="col" className="px-3 py-1.5 font-semibold hidden sm:table-cell">Type</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/70">
                        {payloadEntries.map(([key, value]) => (
                          <tr key={key} className="align-top">
                            <th scope="row" className="px-3 py-2 font-normal text-slate-400 whitespace-nowrap">
                              {humanize(key)}
                            </th>
                            <td className="px-3 py-2 text-slate-200 break-all">{formatValue(value)}</td>
                            <td className="px-3 py-2 text-slate-500 hidden sm:table-cell">{describeType(value)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="p-4 text-slate-500">This step carries no decoded payload fields.</p>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'bytes' && (
          <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs space-y-3 animate-in fade-in duration-200">
            <div className="flex flex-wrap items-center justify-between gap-2 text-slate-500 text-[11px]">
              <span>Hexadecimal dump of this step&apos;s decoded payload</span>
              <span className="text-emerald-400">CRC32 {checksum} · {payloadBytes} B</span>
            </div>

            {hexLines.length > 0 ? (
              <div className="text-slate-400 leading-loose select-all overflow-x-auto text-[10px] sm:text-xs">
                {hexLines.map((line) => (
                  <div key={line.offset} className="whitespace-pre">
                    <span className="text-indigo-400">{line.offset}</span>
                    {'  '}
                    {line.hex}
                    {'  '}
                    <span className="text-slate-500">{line.ascii}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500">This step has no payload to encode.</p>
            )}

            {bitString && (
              <div className="border-t border-slate-800 pt-3">
                <span className="block text-[10px] uppercase text-slate-500 mb-1">First bytes as bits</span>
                <p className="text-slate-400 break-all leading-relaxed">{bitString}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'nodes' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <p className="text-xs text-slate-400">
              Who participates in this step. The highlighted roles change as the sequence progresses.
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {actors.map((actor) => {
                const isSource = actor.id === currentStep.actorSource;
                const isTarget = actor.id === currentStep.actorTarget;
                return (
                  <li
                    key={actor.id}
                    className={`rounded-xl border p-3 flex items-start gap-3 ${
                      isSource
                        ? 'border-indigo-500/40 bg-indigo-500/5'
                        : isTarget
                          ? 'border-cyan-500/40 bg-cyan-500/5'
                          : 'border-slate-800 bg-slate-950/60'
                    }`}
                  >
                    <span className="w-9 h-9 rounded-lg border border-slate-800 bg-slate-950 flex items-center justify-center shrink-0">
                      {actorIcon(actor.icon)}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xs font-bold text-white">{actor.label}</span>
                      <span className="block text-[10px] font-mono text-slate-500">{actor.id}</span>
                      <span className="block text-[10px] mt-0.5">
                        {isSource ? (
                          <span className="text-indigo-300">transmits this frame</span>
                        ) : isTarget ? (
                          <span className="text-cyan-300">receives this frame</span>
                        ) : (
                          <span className="text-slate-500">not involved in this step</span>
                        )}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {activeTab === 'syntax' && currentStep.codeSnippet && (
          <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs overflow-x-auto animate-in fade-in duration-200">
            <div className="text-slate-500 text-[11px] mb-2">Illustrative syntax for this step</div>
            <pre className="text-emerald-400 leading-relaxed">{currentStep.codeSnippet}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

