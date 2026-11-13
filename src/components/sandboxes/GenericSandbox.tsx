'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Protocol } from '@/types/protocol';
import { Terminal, Play, RotateCcw } from 'lucide-react';

function initialLog(protocol: Protocol): string[] {
  return [
    `[INFO] Simulated protocol runner for ${protocol.name} (${protocol.fullName})`,
    `[INFO] Illustrative endpoint: ${protocol.port ? `port ${protocol.port}` : 'Layer 2 / local segment'}`,
  ];
}

export default function GenericSandbox({ protocol }: { protocol: Protocol }) {
  const [activeLog, setActiveLog] = useState<string[]>(() => initialLog(protocol));
  const [isRunning, setIsRunning] = useState(false);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      for (const timer of timersRef.current) window.clearTimeout(timer);
      timersRef.current = [];
    };
  }, []);

  const clearTimers = () => {
    for (const timer of timersRef.current) window.clearTimeout(timer);
    timersRef.current = [];
  };

  const handleSimulate = () => {
    if (isRunning) return;

    clearTimers();
    setIsRunning(true);
    setActiveLog([...initialLog(protocol), '[RUN] Walking the stored step sequence. Nothing is sent on the network.']);

    protocol.interactiveSteps.forEach((step, index) => {
      const timer = window.setTimeout(() => {
        setActiveLog((previous) => [
          ...previous,
          `[STEP ${step.step}] ${step.actorSource.toUpperCase()} -> ${step.actorTarget.toUpperCase()}: ${step.title}`,
          `    Packet: ${step.packetInfo?.summary || 'No packet summary in the data set.'}`,
        ]);

        if (index === protocol.interactiveSteps.length - 1) {
          setActiveLog((previous) => [...previous, '[DONE] Simulation complete.']);
          setIsRunning(false);
        }
      }, (index + 1) * 800);

      timersRef.current.push(timer);
    });
  };

  const handleClear = () => {
    clearTimers();
    setActiveLog([`[INFO] Session reset for ${protocol.name}`]);
    setIsRunning(false);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-indigo-400" aria-hidden="true" />
            {protocol.name} Step Runner
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Simulated
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            Replays the stored {protocol.name} interaction steps in the browser. No packets leave this page.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear simulation log"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={handleSimulate}
            disabled={isRunning}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/30"
          >
            <Play className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
            <span>{isRunning ? 'Simulating…' : 'Run Step Sequence'}</span>
          </button>
        </div>
      </div>

      <div
        className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs h-[240px] overflow-y-auto space-y-1.5"
        aria-live="polite"
      >
        {activeLog.map((log, index) => (
          <div key={`${index}-${log.slice(0, 24)}`} className={log.startsWith('[STEP') ? 'text-indigo-400 font-semibold' : 'text-slate-300'}>
            {log}
          </div>
        ))}
      </div>
    </div>
  );
}
