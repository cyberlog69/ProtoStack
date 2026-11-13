'use client';

import React, { useState, useEffect } from 'react';
import { ENCAPSULATION_STEPS } from '@/data/layers';
import { Play, Pause, RotateCcw, ChevronRight, ChevronLeft, ArrowDown, ArrowUp, Send, CheckCircle2, Shield, Laptop, Server, Radio, Terminal } from 'lucide-react';

export default function EncapsulationSimulator() {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [direction, setDirection] = useState<'encapsulate' | 'decapsulate'>('encapsulate');
  const [isPlaying, setIsPlaying] = useState(false);
  const [customPayload, setCustomPayload] = useState('{"sensor": "temp-01", "val": 24.5, "unit": "C"}');

  const steps = ENCAPSULATION_STEPS;
  // Encapsulation goes Layer 7 down to Layer 1 (0 to 6)
  // Decapsulation goes Layer 1 up to Layer 7 (6 down to 0)

  const activeStep = direction === 'encapsulate' ? steps[currentStepIdx] : steps[6 - currentStepIdx];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStepIdx((prev) => {
          if (prev >= 6) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 3000);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const handleNext = () => {
    if (currentStepIdx < 6) setCurrentStepIdx(currentStepIdx + 1);
  };

  const handlePrev = () => {
    if (currentStepIdx > 0) setCurrentStepIdx(currentStepIdx - 1);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIdx(0);
  };

  const toggleDirection = (dir: 'encapsulate' | 'decapsulate') => {
    setIsPlaying(false);
    setDirection(dir);
    setCurrentStepIdx(0);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-2xl">
      {/* Top Header */}
      <div className="p-6 border-b border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse" />
            <h3 className="text-base font-bold text-white">
              Live Encapsulation & Decapsulation Interactive Sandbox
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Watch protocol headers get wrapped layer-by-layer as data travels down the stack, and stripped on receipt.
          </p>
        </div>

        {/* Direction Switcher (Encapsulate vs Decapsulate) */}
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-xl bg-slate-900 border border-slate-800 flex items-center">
            <button
              onClick={() => toggleDirection('encapsulate')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                direction === 'encapsulate'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowDown className="w-3.5 h-3.5" />
              <span>Encapsulation (Sender ➔ Wire)</span>
            </button>
            <button
              onClick={() => toggleDirection('decapsulate')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                direction === 'decapsulate'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span>Decapsulation (Wire ➔ Receiver)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="p-6 md:p-8 space-y-8">
        {/* Playback & Step Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono font-bold text-xs flex items-center justify-center">
              L{activeStep.layerNumber}
            </span>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>{activeStep.layerName}</span>
                <span className="text-xs text-slate-400 font-mono font-normal">
                  — PDU: <strong className="text-indigo-400">{activeStep.pduName}</strong>
                </span>
              </div>
              <p className="text-xs text-emerald-400 font-mono">
                {direction === 'encapsulate' ? `➔ Adding: ${activeStep.headerAdded}` : `➔ Stripping & Verifying: ${activeStep.headerAdded}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentStepIdx === 0}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs transition-colors"
              title="Previous Layer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md shadow-indigo-600/30"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Auto Step</span>
                </>
              )}
            </button>

            <button
              onClick={handleNext}
              disabled={currentStepIdx === 6}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs transition-colors"
              title="Next Layer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleReset}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors ml-1"
              title="Reset"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Visual Layer Breadcrumb Bar */}
        <div className="grid grid-cols-7 gap-1.5 font-mono text-xs">
          {steps.map((s, idx) => {
            const stepNumber = direction === 'encapsulate' ? idx : 6 - idx;
            const isCompleted = direction === 'encapsulate' ? idx <= currentStepIdx : (6 - idx) <= currentStepIdx;
            const isCurrent = direction === 'encapsulate' ? idx === currentStepIdx : (6 - idx) === currentStepIdx;

            return (
              <button
                key={s.layerNumber}
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentStepIdx(direction === 'encapsulate' ? idx : 6 - idx);
                }}
                className={`py-2 px-1 text-center rounded-lg border transition-all ${
                  isCurrent
                    ? 'bg-indigo-600 text-white font-bold border-indigo-400 shadow-lg shadow-indigo-500/20 scale-105 z-10'
                    : isCompleted
                    ? 'bg-slate-900 border-indigo-500/30 text-indigo-300'
                    : 'bg-slate-950/60 border-slate-800 text-slate-600'
                }`}
              >
                <div className="text-[10px] text-slate-400">L{s.layerNumber}</div>
                <div className="truncate text-[11px] font-semibold">{s.layerName.split(' ')[0]}</div>
              </button>
            );
          })}
        </div>

        {/* The Visual Nested Packet (Russian Doll / Enclosed Frame) */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800 pb-3">
            <span>PACKET STRUCTURE AT LAYER {activeStep.layerNumber} ({activeStep.pduName.toUpperCase()})</span>
            <span className="text-emerald-400 font-semibold">{activeStep.action}</span>
          </div>

          {/* Graphical Frame Rendering */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3 font-mono text-xs">
            <div className="flex flex-wrap items-center gap-2">
              {/* Data Link Header */}
              {activeStep.layerNumber <= 2 && (
                <div className="px-3 py-2 rounded-lg bg-amber-950/60 border border-amber-500/50 text-amber-300 animate-in fade-in zoom-in-95">
                  <span className="block text-[10px] text-amber-400/80 font-bold">L2 ETHERNET HEADER</span>
                  <span>Src MAC ➔ Dst MAC</span>
                </div>
              )}

              {/* Network Header */}
              {activeStep.layerNumber <= 3 && (
                <div className="px-3 py-2 rounded-lg bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 animate-in fade-in zoom-in-95">
                  <span className="block text-[10px] text-emerald-400/80 font-bold">L3 IP HEADER</span>
                  <span>192.168.1.100 ➔ 104.16.132.229</span>
                </div>
              )}

              {/* Transport Header */}
              {activeStep.layerNumber <= 4 && (
                <div className="px-3 py-2 rounded-lg bg-cyan-950/60 border border-cyan-500/50 text-cyan-300 animate-in fade-in zoom-in-95">
                  <span className="block text-[10px] text-cyan-400/80 font-bold">L4 TCP HEADER</span>
                  <span>Port 54321 ➔ 443 [ACK]</span>
                </div>
              )}

              {/* Presentation / Security Header */}
              {activeStep.layerNumber <= 6 && (
                <div className="px-3 py-2 rounded-lg bg-indigo-950/60 border border-indigo-500/50 text-indigo-300 animate-in fade-in zoom-in-95">
                  <span className="block text-[10px] text-indigo-400/80 font-bold">L6 TLS 1.3 RECORD</span>
                  <span>Encrypted Payload (AES-GCM)</span>
                </div>
              )}

              {/* Core Application Payload */}
              <div className="flex-1 min-w-[200px] px-3.5 py-2 rounded-lg bg-purple-950/60 border border-purple-500/50 text-purple-200">
                <span className="block text-[10px] text-purple-400/80 font-bold">L7 APPLICATION DATA</span>
                <span className="truncate block font-mono text-[11px]">{customPayload}</span>
              </div>

              {/* Data Link Trailer (FCS / CRC-32) */}
              {activeStep.layerNumber <= 2 && (
                <div className="px-3 py-2 rounded-lg bg-amber-950/60 border border-amber-500/50 text-amber-300 animate-in fade-in zoom-in-95">
                  <span className="block text-[10px] text-amber-400/80 font-bold">L2 TRAILER</span>
                  <span>FCS (CRC-32)</span>
                </div>
              )}

              {/* Physical Layer Bit Stream Representation */}
              {activeStep.layerNumber === 1 && (
                <div className="w-full mt-2 p-3 rounded-lg bg-rose-950/60 border border-rose-500/50 text-rose-300 font-mono text-[11px] break-all">
                  <span className="block text-[10px] text-rose-400/80 font-bold mb-1">L1 PHYSICAL TRANSMISSION BITS</span>
                  10101010 10101011 00000000 00000000 01011110 00000000 01010011 00000001 11000100 10110011 00000001 00011010 00001000 00000000 01000101
                </div>
              )}
            </div>
          </div>

          {/* Plain English Explanation */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-1.5 font-mono">
            <span className="text-indigo-400 font-bold block">💡 What happens at Layer {activeStep.layerNumber}:</span>
            <p>{activeStep.explanation}</p>
          </div>
        </div>

        {/* Custom Payload Form */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-slate-400 font-mono shrink-0">Customize Simulated Payload:</span>
          <input
            type="text"
            value={customPayload}
            onChange={(e) => setCustomPayload(e.target.value)}
            className="w-full sm:w-2/3 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 font-mono text-emerald-400 text-xs focus:outline-none focus:border-indigo-500"
            placeholder="Type any message or JSON payload..."
          />
        </div>
      </div>
    </div>
  );
}

