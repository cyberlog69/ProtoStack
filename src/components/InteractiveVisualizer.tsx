'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Protocol } from '@/types/protocol';
import { crc32Hex, hexDump } from '@/lib/hex';
import {
  Play, Pause, RotateCcw, ChevronRight, ChevronLeft,
  Laptop, Server, Globe, Database, ShieldCheck, Cpu,
  Smartphone, Network, Radio, CheckCircle2,
  Clock, CreditCard, Zap, Eye
} from 'lucide-react';

interface VisualizerProps {
  protocol: Protocol;
}

function isInteractiveTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    Boolean(target.closest('input, textarea, select, button, a, [contenteditable="true"], [role="textbox"]'))
  );
}

export default function InteractiveVisualizer({ protocol }: VisualizerProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<0.5 | 1 | 2>(1);
  const [activeTab, setActiveTab] = useState<'explanation' | 'packet' | 'hex' | 'nodes'>('explanation');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [packetProgress, setPacketProgress] = useState(0); // 0 to 100% animation progress
  const shouldReduceMotion = useReducedMotion();

  const steps = protocol.interactiveSteps;
  const currentStep = steps[currentStepIndex] || steps[0];

  // Base duration in ms per step divided by playback speed
  const stepDuration = 3200 / speed;

  useEffect(() => {
    let animTimer: NodeJS.Timeout;
    let progressTimer: NodeJS.Timeout;

    if (isPlaying) {
      setPacketProgress(0);
      const intervalMs = 30;
      const stepIncrement = 100 / (stepDuration / intervalMs);

      progressTimer = setInterval(() => {
        setPacketProgress((prev) => {
          if (prev >= 100) return 100;
          return prev + stepIncrement;
        });
      }, intervalMs);

      animTimer = setTimeout(() => {
        if (currentStepIndex < steps.length - 1) {
          setCurrentStepIndex((prev) => prev + 1);
          setPacketProgress(0);
        } else {
          setIsPlaying(false);
          setPacketProgress(100);
        }
      }, stepDuration);
    } else {
      setPacketProgress(100);
    }

    return () => {
      clearTimeout(animTimer);
      clearInterval(progressTimer);
    };
  }, [isPlaying, currentStepIndex, steps.length, stepDuration]);

  const handlePlayToggle = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }

    if (currentStepIndex >= steps.length - 1) {
      setCurrentStepIndex(0);
      setPacketProgress(0);
    }
    setIsPlaying(true);
  }, [currentStepIndex, isPlaying, steps.length]);

  const handleNext = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      setPacketProgress(0);
      setIsPlaying(false);
    }
  }, [currentStepIndex, steps.length]);

  const handlePrev = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      setPacketProgress(0);
      setIsPlaying(false);
    }
  }, [currentStepIndex]);

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
    setPacketProgress(0);
  }, []);

  // Keyboard navigation. Handlers are declared above so this effect always
  // subscribes to the current versions.
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

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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

  const packetText =
    currentStep.packetInfo
      ? JSON.stringify(currentStep.packetInfo.payload)
      : currentStep.codeSnippet || currentStep.description;
  const packetHexLines = hexDump(packetText);
  const packetChecksum = crc32Hex(packetText);

  const getActorIcon = (iconName: string) => {
    switch (iconName) {
      case 'Laptop': return <Laptop className="w-5 h-5 text-indigo-400" />;
      case 'Server': return <Server className="w-5 h-5 text-cyan-400" />;
      case 'Globe': return <Globe className="w-5 h-5 text-amber-400" />;
      case 'Database': return <Database className="w-5 h-5 text-emerald-400" />;
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5 text-rose-400" />;
      case 'Cpu': return <Cpu className="w-5 h-5 text-emerald-400" />;
      case 'Smartphone': return <Smartphone className="w-5 h-5 text-amber-400" />;
      case 'Network': return <Network className="w-5 h-5 text-blue-400" />;
      case 'Clock': return <Clock className="w-5 h-5 text-emerald-400" />;
      case 'CreditCard': return <CreditCard className="w-5 h-5 text-rose-400" />;
      default: return <Radio className="w-5 h-5 text-indigo-400" />;
    }
  };

  const sourceActorIndex = protocol.actors.findIndex(a => a.id === currentStep.actorSource);
  const targetActorIndex = protocol.actors.findIndex(a => a.id === currentStep.actorTarget);
  const sourceActor = protocol.actors[sourceActorIndex];
  const targetActor = protocol.actors[targetActorIndex];

  // Calculate packet position in percentage between source and target index
  const numActors = protocol.actors.length;
  const getActorPositionPercent = (idx: number) => {
    if (numActors <= 1) return 50;
    return (idx / (numActors - 1)) * 100;
  };

  const sourceX = sourceActorIndex >= 0 ? getActorPositionPercent(sourceActorIndex) : 10;
  const targetX = targetActorIndex >= 0 ? getActorPositionPercent(targetActorIndex) : 90;
  const currentPacketX = sourceX + (targetX - sourceX) * (packetProgress / 100);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 backdrop-blur-md overflow-hidden shadow-2xl">
      {/* Top Header & Simulation Controls */}
      <div className="px-6 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-slate-950/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Interactive Packet Flow Simulation
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Animated Model
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Step {currentStepIndex + 1} of {steps.length}: <span className="text-slate-200 font-semibold">{currentStep.title}</span>
          </p>
        </div>

        {/* Playback Controls & Speed Toggle */}
        <div className="flex items-center gap-2">
          {/* Speed Selector */}
          <div className="flex rounded-lg bg-slate-900 border border-slate-800 p-0.5 mr-1 text-xs font-mono">
            {([0.5, 1, 2] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSpeed(s)}
                aria-pressed={speed === s}
                aria-label={`Playback speed ${s}x`}
                className={`px-2 py-1 rounded text-[10px] font-bold transition-colors ${
                  speed === s ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title={`Speed ${s}x`}
              >
                {s}x
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            aria-label="Previous step"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs transition-colors"
            title="Previous step (Left Arrow)"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={handlePlayToggle}
            aria-label={isPlaying ? 'Pause animation' : 'Play animation'}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md shadow-indigo-600/30"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                <span>{currentStepIndex === steps.length - 1 ? 'Replay' : 'Auto Play'}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={currentStepIndex === steps.length - 1}
            aria-label="Next step"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs transition-colors"
            title="Next step (Right Arrow)"
          >
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={handleReset}
            aria-label="Reset to first step"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors ml-1"
            title="Reset to Step 1"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Network Topology & Visualizer Canvas */}
      <div className="p-6 md:p-10 bg-slate-950 relative overflow-hidden min-h-[300px] flex flex-col justify-center select-none">
        {/* Ambient Grid Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

        {/* In-Flight Transmission Bus Wire */}
        <div className="relative z-0 w-full mb-12 mt-6">
          {/* Main Background Wire */}
          <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 bg-slate-800 rounded-full" />

          {/* Active Highlighted Wire between Source and Target */}
          <div 
            className="absolute top-1/2 h-1.5 -translate-y-1/2 bg-gradient-to-r from-indigo-500 via-cyan-400 to-indigo-500 shadow-lg shadow-cyan-500/50 rounded-full transition-all duration-300"
            style={{
              left: `${Math.min(sourceX, targetX)}%`,
              width: `${Math.abs(targetX - sourceX)}%`
            }}
          />

          {/* Real-Time Travelling Packet Orb */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 pointer-events-none flex flex-col items-center"
            style={{ left: `${currentPacketX}%` }}
            animate={shouldReduceMotion ? undefined : { scale: [1, 1.15, 1] }}
            transition={shouldReduceMotion ? undefined : { repeat: Infinity, duration: 1.2 }}
          >
            {/* Glowing Packet Capsule */}
            <div className="px-2.5 py-1 rounded-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 text-white font-mono text-[10px] font-black shadow-xl shadow-cyan-500/50 flex items-center gap-1.5 border border-white/40">
              <Zap className="w-3 h-3 text-yellow-300 animate-pulse fill-current" aria-hidden="true" />
              <span>{currentStep.packetInfo?.type.split(' ')[0] || 'PACKET'}</span>
            </div>

            {/* Downward Pointer Triangle */}
            <div className="w-2 h-2 bg-indigo-500 rotate-45 -mt-1 shadow-sm" />
          </motion.div>
        </div>

        {/* Network Nodes (Actors) */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 items-center">
          {protocol.actors.map((actor) => {
            const isSource = actor.id === currentStep.actorSource;
            const isTarget = actor.id === currentStep.actorTarget;
            const isActive = isSource || isTarget;
            const isSelected = selectedNodeId === actor.id;

            return (
              <motion.button
                key={actor.id}
                type="button"
                onClick={() => setSelectedNodeId(actor.id === selectedNodeId ? null : actor.id)}
                aria-pressed={isSelected}
                aria-label={`${actor.label} (${actor.id})`}
                whileHover={shouldReduceMotion ? undefined : { scale: 1.04 }}
                className={`relative cursor-pointer text-left flex flex-col items-center text-center p-4 rounded-2xl border transition-all duration-300 ${
                  isActive
                    ? isSource
                      ? 'bg-indigo-950/70 border-indigo-400 shadow-xl shadow-indigo-500/30 ring-2 ring-indigo-500/40'
                      : 'bg-cyan-950/70 border-cyan-400 shadow-xl shadow-cyan-500/30 ring-2 ring-cyan-500/40'
                    : isSelected
                    ? 'bg-slate-900 border-indigo-400 shadow-md'
                    : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700 opacity-80'
                }`}
              >
                {/* Active Indicator Badges */}
                <AnimatePresence>
                  {isSource && (
                    <motion.span 
                      initial={{ opacity: 0, y: -5 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0 }}
                      className="absolute -top-3 px-2 py-0.5 rounded-full text-[9px] font-black bg-indigo-500 text-white uppercase tracking-wider shadow-md"
                    >
                      TRANSMITTING
                    </motion.span>
                  )}
                  {isTarget && (
                    <motion.span 
                      initial={{ opacity: 0, y: -5 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0 }}
                      className="absolute -top-3 px-2 py-0.5 rounded-full text-[9px] font-black bg-cyan-400 text-slate-950 uppercase tracking-wider shadow-md animate-bounce"
                    >
                      RECEIVING
                    </motion.span>
                  )}
                </AnimatePresence>

                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-2.5 border transition-all ${
                  isActive
                    ? 'border-indigo-400 bg-slate-900 shadow-inner'
                    : 'border-slate-800 bg-slate-950'
                }`}>
                  {getActorIcon(actor.icon)}
                </div>

                <span className="text-xs font-bold text-white mb-0.5">{actor.label}</span>
                <span className="text-[10px] text-slate-400 font-mono">ID: {actor.id}</span>

                {/* Node arrival ripple pulse */}
                {isTarget && packetProgress > 85 && (
                  <span className="absolute inset-0 rounded-2xl border-2 border-cyan-400 animate-ping pointer-events-none opacity-40" />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Active Packet Transmission Banner */}
        {currentStep.packetInfo && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 relative z-10 bg-slate-900/90 border border-indigo-500/40 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-4 shadow-xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-indigo-300">
                    {currentStep.packetInfo.type}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                    {sourceActor?.label} ➔ {targetActor?.label}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                    [Progress: {Math.round(packetProgress)}%]
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-mono truncate max-w-lg mt-0.5">
                  {currentStep.packetInfo.summary}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('packet')}
                className="text-xs font-mono px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 flex items-center gap-1.5 transition-colors border border-slate-700"
              >
                <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Wireshark View</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Step Indicators / Interactive Timeline */}
      <div className="px-6 py-3 bg-slate-950 border-t border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto">
        {steps.map((s, idx) => (
          <button
            key={s.step}
            type="button"
            onClick={() => {
              setIsPlaying(false);
              setCurrentStepIndex(idx);
              setPacketProgress(0);
            }}
            aria-current={idx === currentStepIndex ? 'step' : undefined}
            aria-label={`Go to step ${s.step}`}
            className={`px-3 py-1 rounded-md text-xs font-mono transition-all shrink-0 flex items-center gap-1.5 ${
              idx === currentStepIndex
                ? 'bg-indigo-600 text-white font-bold shadow-md'
                : idx < currentStepIndex
                ? 'bg-slate-800/80 text-emerald-400 hover:bg-slate-800'
                : 'bg-slate-900/50 text-slate-500 hover:bg-slate-800/50'
            }`}
          >
            {idx < currentStepIndex && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
            <span>Step {s.step}</span>
          </button>
        ))}
      </div>

      {/* Detail & Multi-Tab Inspector Panel */}
      <div className="p-6 bg-slate-900/70">
        <div className="flex items-center gap-4 border-b border-slate-800 pb-3 mb-4 overflow-x-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('explanation')}
            className={`pb-1 transition-colors border-b-2 shrink-0 ${
              activeTab === 'explanation'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Protocol Flow Explanation
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('packet')}
            className={`pb-1 transition-colors border-b-2 shrink-0 ${
              activeTab === 'packet'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Wireshark Packet Inspector
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('hex')}
            className={`pb-1 transition-colors border-b-2 shrink-0 ${
              activeTab === 'hex'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Hex Stream View
          </button>
          {currentStep.codeSnippet && (
            <button
              type="button"
              onClick={() => setActiveTab('nodes')}
              className={`pb-1 transition-colors border-b-2 shrink-0 ${
                activeTab === 'nodes'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Raw Frame / Syntax
            </button>
          )}
        </div>

        {/* Tab 1: Flow Explanation */}
        {activeTab === 'explanation' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-xs font-mono">
                {currentStep.step}
              </span>
              {currentStep.title}
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              {currentStep.description}
            </p>
            <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 text-xs text-indigo-200 leading-relaxed font-mono">
              💡 <strong className="text-indigo-300">Under the Hood:</strong> {currentStep.explanation}
            </div>
          </div>
        )}

        {/* Tab 2: Wireshark Packet Inspector */}
        {activeTab === 'packet' && currentStep.packetInfo && (
          <div className="space-y-4 animate-in fade-in duration-200 font-mono text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase">PROTOCOL FRAME</span>
                <span className="text-indigo-400 font-bold">{currentStep.packetInfo.type}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase">TRANSMITTER</span>
                <span className="text-cyan-400 truncate block">{currentStep.packetInfo.source}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase">RECEIVER</span>
                <span className="text-emerald-400 truncate block">{currentStep.packetInfo.destination}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase">TRANSMISSION ID</span>
                <span className="text-slate-300">{currentStep.packetInfo.id}</span>
              </div>
            </div>

            <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 overflow-x-auto">
              <div className="text-slate-500 text-[11px] mb-2 flex items-center justify-between">
                <span>{'// Decoded from the current step payload'}</span>
                <span className="text-emerald-400">CRC32: {packetChecksum}</span>
              </div>
              <pre className="text-slate-300 leading-relaxed">
                {JSON.stringify(currentStep.packetInfo.payload, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Tab 3: Hex Dump Stream */}
        {activeTab === 'hex' && (
          <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs space-y-2 animate-in fade-in duration-200">
            <div className="flex flex-wrap items-center justify-between gap-2 text-slate-500 text-[11px]">
              <span>{'// Hexadecimal dump generated from this step’s payload'}</span>
              <span className="text-emerald-400">CRC32: {packetChecksum}</span>
            </div>
            <div className="text-slate-400 leading-loose select-all overflow-x-auto">
              {packetHexLines.length > 0 ? (
                packetHexLines.map((line) => (
                  <div key={line.offset} className="whitespace-pre">
                    <span className="text-indigo-400">{line.offset}</span>
                    {'  '}
                    {line.hex}
                    {'  '}
                    <span className="text-slate-500">{line.ascii}</span>
                  </div>
                ))
              ) : (
                <p className="text-slate-500">{'// This step has no payload to encode.'}</p>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Raw Code / Syntax */}
        {activeTab === 'nodes' && currentStep.codeSnippet && (
          <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs overflow-x-auto animate-in fade-in duration-200">
            <pre className="text-emerald-400 leading-relaxed">{currentStep.codeSnippet}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
