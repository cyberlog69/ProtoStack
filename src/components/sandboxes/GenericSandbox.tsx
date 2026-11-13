'use client';

import React, { useState } from 'react';
import { Protocol } from '@/types/protocol';
import { Terminal, Play, RotateCcw, CheckCircle2 } from 'lucide-react';

export default function GenericSandbox({ protocol }: { protocol: Protocol }) {
  const [activeLog, setActiveLog] = useState<string[]>([
    `[INFO] Initialized virtual protocol runner for ${protocol.name} (${protocol.fullName})`,
    `[INFO] Listening on ${protocol.port ? `Port ${protocol.port}` : 'Layer 2 / Subnet'}`
  ]);
  const [isRunning, setIsRunning] = useState(false);

  const handleSimulate = () => {
    setIsRunning(true);
    const newLogs = [...activeLog];
    
    protocol.interactiveSteps.forEach((step, idx) => {
      setTimeout(() => {
        setActiveLog((prev) => [
          ...prev,
          `[STEP ${step.step}] ${step.actorSource.toUpperCase()} -> ${step.actorTarget.toUpperCase()}: ${step.title}`,
          `    Packet: ${step.packetInfo?.summary || 'Transmission completed'}`
        ]);
        if (idx === protocol.interactiveSteps.length - 1) {
          setIsRunning(false);
        }
      }, (idx + 1) * 800);
    });
  };

  const handleClear = () => {
    setActiveLog([
      `[INFO] Session reset for ${protocol.name}`
    ]);
    setIsRunning(false);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-indigo-400" />
            {protocol.name} Interactive Protocol Sandbox
          </h3>
          <p className="text-xs text-slate-400">
            Execute a live wire exchange simulation adhering to {protocol.rfc || 'IETF specifications'}.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleClear}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={handleSimulate}
            disabled={isRunning}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/30"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isRunning ? 'Simulating...' : 'Execute Protocol Sequence'}</span>
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs h-[240px] overflow-y-auto space-y-1.5">
        {activeLog.map((log, i) => (
          <div key={i} className={log.startsWith('[STEP') ? 'text-indigo-400 font-semibold' : 'text-slate-300'}>
            {log}
          </div>
        ))}
      </div>
    </div>
  );
}

