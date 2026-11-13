'use client';

import React, { useEffect, useState } from 'react';
import { ENCAPSULATION_STEPS } from '@/data/layers';
import { crc32Hex, hexDump, toBitString } from '@/lib/hex';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  ArrowDown,
  ArrowUp,
} from 'lucide-react';

type Direction = 'encapsulate' | 'decapsulate';

const STEP_DURATION_MS = 3000;

export default function EncapsulationSimulator() {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [direction, setDirection] = useState<Direction>('encapsulate');
  const [isPlaying, setIsPlaying] = useState(false);
  const [customPayload, setCustomPayload] = useState('{"sensor": "temp-01", "val": 24.5, "unit": "C"}');

  const steps = ENCAPSULATION_STEPS;
  const lastIndex = steps.length - 1;

  // The data set is ordered L7 (index 0) to L1 (last index).
  const activeStep =
    direction === 'encapsulate' ? steps[currentStepIdx] : steps[lastIndex - currentStepIdx];

  useEffect(() => {
    if (!isPlaying) return;
    if (currentStepIdx >= lastIndex) {
      setIsPlaying(false);
      return;
    }

    const timer = setTimeout(() => {
      setCurrentStepIdx((previous) => Math.min(previous + 1, lastIndex));
    }, STEP_DURATION_MS);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIdx, lastIndex]);

  const handleNext = () => {
    setCurrentStepIdx((previous) => Math.min(previous + 1, lastIndex));
  };

  const handlePrev = () => {
    setCurrentStepIdx((previous) => Math.max(previous - 1, 0));
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIdx(0);
  };

  const handlePlayToggle = () => {
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }

    if (currentStepIdx >= lastIndex) setCurrentStepIdx(0);
    setIsPlaying(true);
  };

  const toggleDirection = (next: Direction) => {
    setIsPlaying(false);
    setDirection(next);
    setCurrentStepIdx(0);
  };

  if (!activeStep) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-10 text-center text-sm text-slate-300">
        Encapsulation steps are not available.
      </div>
    );
  }

  const checksum = crc32Hex(customPayload);
  const bitString = toBitString(customPayload, 12);
  const payloadDump = hexDump(customPayload, 32);
  const payloadBytes = new TextEncoder().encode(customPayload).byteLength;
  const showDataLink = activeStep.layerNumber <= 2;
  const showNetwork = activeStep.layerNumber <= 3;
  const showTransport = activeStep.layerNumber <= 4;
  const showPresentation = activeStep.layerNumber <= 6;
  const showPhysical = activeStep.layerNumber === 1;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-2xl">
      <div className="p-6 border-b border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse" aria-hidden="true" />
            <h3 className="text-base font-bold text-white">
              Encapsulation &amp; Decapsulation Model
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Simulated
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Header labels are illustrative; the payload, hex dump, bit string, and CRC-32 are computed from your input.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-1 rounded-xl bg-slate-900 border border-slate-800 flex items-center" role="group" aria-label="Simulation direction">
            <button
              type="button"
              onClick={() => toggleDirection('encapsulate')}
              aria-pressed={direction === 'encapsulate'}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                direction === 'encapsulate'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowDown className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Encapsulation</span>
            </button>
            <button
              type="button"
              onClick={() => toggleDirection('decapsulate')}
              aria-pressed={direction === 'decapsulate'}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                direction === 'decapsulate'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowUp className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Decapsulation</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center gap-3" aria-live="polite">
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
                {direction === 'encapsulate'
                  ? `➔ Adding: ${activeStep.headerAdded}`
                  : `➔ Stripping & verifying: ${activeStep.headerAdded}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentStepIdx === 0}
              aria-label="Previous layer"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs transition-colors"
              title="Previous Layer"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={handlePlayToggle}
              aria-label={isPlaying ? 'Pause auto step' : 'Start auto step'}
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
                  <span>{currentStepIdx === lastIndex ? 'Replay' : 'Auto Step'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={currentStepIdx === lastIndex}
              aria-label="Next layer"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs transition-colors"
              title="Next Layer"
            >
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={handleReset}
              aria-label="Reset simulation"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors ml-1"
              title="Reset"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1.5 font-mono text-xs">
          {steps.map((step, index) => {
            const position = direction === 'encapsulate' ? index : lastIndex - index;
            const isCurrent = position === currentStepIdx;
            const isCompleted = position <= currentStepIdx;

            return (
              <button
                key={step.layerNumber}
                type="button"
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentStepIdx(position);
                }}
                aria-current={isCurrent ? 'step' : undefined}
                aria-label={`Jump to layer ${step.layerNumber} ${step.layerName}`}
                className={`py-2 px-1 text-center rounded-lg border transition-all ${
                  isCurrent
                    ? 'bg-indigo-600 text-white font-bold border-indigo-400 shadow-lg shadow-indigo-500/20 scale-105 z-10'
                    : isCompleted
                      ? 'bg-slate-900 border-indigo-500/30 text-indigo-300'
                      : 'bg-slate-950/60 border-slate-800 text-slate-600'
                }`}
              >
                <div className="text-[10px] text-slate-400">L{step.layerNumber}</div>
                <div className="truncate text-[11px] font-semibold">{step.layerName.split(' ')[0]}</div>
              </button>
            );
          })}
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800 pb-3">
            <span>
              PACKET STRUCTURE AT LAYER {activeStep.layerNumber} ({activeStep.pduName.toUpperCase()})
            </span>
            <span className="text-emerald-400 font-semibold">{activeStep.action}</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3 font-mono text-xs">
            <div className="flex flex-wrap items-center gap-2">
              {showDataLink && (
                <div className="px-3 py-2 rounded-lg bg-amber-950/60 border border-amber-500/50 text-amber-300 animate-in fade-in zoom-in-95">
                  <span className="block text-[10px] text-amber-400/80 font-bold">L2 ETHERNET HEADER</span>
                  <span>Src MAC ➔ Dst MAC</span>
                </div>
              )}

              {showNetwork && (
                <div className="px-3 py-2 rounded-lg bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 animate-in fade-in zoom-in-95">
                  <span className="block text-[10px] text-emerald-400/80 font-bold">L3 IP HEADER</span>
                  <span>192.0.2.10 ➔ 198.51.100.24</span>
                </div>
              )}

              {showTransport && (
                <div className="px-3 py-2 rounded-lg bg-cyan-950/60 border border-cyan-500/50 text-cyan-300 animate-in fade-in zoom-in-95">
                  <span className="block text-[10px] text-cyan-400/80 font-bold">L4 TCP HEADER</span>
                  <span>Port 54321 ➔ 443 [ACK]</span>
                </div>
              )}

              {showPresentation && (
                <div className="px-3 py-2 rounded-lg bg-indigo-950/60 border border-indigo-500/50 text-indigo-300 animate-in fade-in zoom-in-95">
                  <span className="block text-[10px] text-indigo-400/80 font-bold">L6 TLS 1.3 RECORD</span>
                  <span>Encrypted payload (AES-GCM)</span>
                </div>
              )}

              <div className="flex-1 min-w-[200px] px-3.5 py-2 rounded-lg bg-purple-950/60 border border-purple-500/50 text-purple-200">
                <span className="block text-[10px] text-purple-400/80 font-bold">L7 APPLICATION DATA</span>
                <span className="truncate block font-mono text-[11px]">{customPayload || '(empty payload)'}</span>
              </div>

              {showDataLink && (
                <div className="px-3 py-2 rounded-lg bg-amber-950/60 border border-amber-500/50 text-amber-300 animate-in fade-in zoom-in-95">
                  <span className="block text-[10px] text-amber-400/80 font-bold">L2 TRAILER</span>
                  <span>FCS (CRC-32): {checksum}</span>
                </div>
              )}

              {showPhysical && (
                <div className="w-full mt-2 p-3 rounded-lg bg-rose-950/60 border border-rose-500/50 text-rose-300 font-mono text-[11px] break-all">
                  <span className="block text-[10px] text-rose-400/80 font-bold mb-1">
                    L1 PHYSICAL TRANSMISSION BITS (first 12 bytes of payload)
                  </span>
                  {bitString || '00000000'}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-800/80">
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                <span>{`// Payload byte dump (${payloadBytes} bytes, CRC-32 ${checksum})`}</span>
                <span>{customPayload.length} characters</span>
              </div>
              <div className="mt-1 text-slate-400 select-all overflow-x-auto">
                {payloadDump.length > 0 ? (
                  payloadDump.map((line) => (
                    <div key={line.offset} className="whitespace-pre">
                      <span className="text-indigo-400">{line.offset}</span>
                      {'  '}
                      {line.hex}
                      {'  '}
                      <span className="text-slate-500">{line.ascii}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-slate-500">{'// Empty payload'}</span>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-1.5 font-mono" aria-live="polite">
            <span className="text-indigo-400 font-bold block">What happens at Layer {activeStep.layerNumber}:</span>
            <p>{activeStep.explanation}</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <label htmlFor="encapsulation-payload" className="text-slate-400 font-mono shrink-0">
            Simulated payload:
          </label>
          <input
            id="encapsulation-payload"
            type="text"
            value={customPayload}
            onChange={(event) => setCustomPayload(event.target.value)}
            maxLength={512}
            className="w-full sm:w-2/3 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 font-mono text-emerald-400 text-xs focus:outline-none focus:border-indigo-500"
            placeholder="Type any message or JSON payload..."
          />
        </div>
      </div>
    </div>
  );
}
