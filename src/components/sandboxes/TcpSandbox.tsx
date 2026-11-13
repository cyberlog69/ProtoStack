'use client';

import React, { useState } from 'react';
import { Terminal, ArrowRight, RefreshCw } from 'lucide-react';

function createIsn(): number {
  const range = 1_000_000;
  if (typeof crypto !== 'undefined') {
    if ('randomInt' in crypto && typeof crypto.randomInt === 'function') {
      return crypto.randomInt(range);
    }
    if ('getRandomValues' in crypto) {
      const maxUint32PlusOne = 0x1_0000_0000;
      const limit = Math.floor(maxUint32PlusOne / range) * range;
      const buffer = new Uint32Array(1);
      while (true) {
        crypto.getRandomValues(buffer);
        const value = buffer[0];
        if (value < limit) {
          return value % range;
        }
      }
    }
  }
  return Math.floor(Math.random() * range);
}

export default function TcpSandbox() {
  const [clientSeq, setClientSeq] = useState(createIsn);
  const [serverSeq, setServerSeq] = useState(createIsn);
  const [handshakeStep, setHandshakeStep] = useState<0 | 1 | 2 | 3>(0);

  const handleNextHandshake = () => {
    setHandshakeStep((previous) => (previous < 3 ? ((previous + 1) as 0 | 1 | 2 | 3) : previous));
  };

  const handleReset = () => {
    setHandshakeStep(0);
    setClientSeq(createIsn());
    setServerSeq(createIsn());
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-indigo-400" aria-hidden="true" />
            TCP 3-Way Handshake State Machine
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Simulated
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            Sequence numbers are generated per session and are illustrative, not captured packets. Each step shows the
            resulting TCP state on both endpoints.
          </p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Reset Session</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider font-mono">
              CLIENT (Initiator)
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
              192.0.2.104:54321
            </span>
          </div>
          <div className="text-sm font-mono text-white font-bold">
            State:{' '}
            <span className={handshakeStep === 3 ? 'text-emerald-400' : 'text-amber-400'}>
              {handshakeStep === 0 && 'CLOSED'}
              {handshakeStep === 1 && 'SYN_SENT'}
              {handshakeStep === 2 && 'SYN_SENT (waiting ACK)'}
              {handshakeStep === 3 && 'ESTABLISHED'}
            </span>
          </div>
          <div className="text-xs font-mono text-slate-400 mt-1">
            Initial Seq (ISN): <span className="text-white">{clientSeq}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider font-mono">
              SERVER (Listener)
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
              198.51.100.34:80
            </span>
          </div>
          <div className="text-sm font-mono text-white font-bold">
            State:{' '}
            <span className={handshakeStep === 3 ? 'text-emerald-400' : 'text-amber-400'}>
              {handshakeStep === 0 && 'LISTEN'}
              {handshakeStep === 1 && 'LISTEN'}
              {handshakeStep === 2 && 'SYN_RECEIVED'}
              {handshakeStep === 3 && 'ESTABLISHED'}
            </span>
          </div>
          <div className="text-xs font-mono text-slate-400 mt-1">
            Initial Seq (ISN): <span className="text-white">{serverSeq}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3 font-mono text-xs" aria-live="polite">
        {handshakeStep === 0 && (
          <p className="text-slate-500">No segments sent yet. The client is closed and the server is listening.</p>
        )}

        {handshakeStep >= 1 && (
          <div className="p-3.5 rounded-xl bg-slate-950 border border-indigo-500/40 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 font-bold">1</span>
              <div>
                <span className="text-white font-bold">[SYN]</span>
                <span className="text-slate-400 ml-2">Client ➔ Server</span>
              </div>
            </div>
            <div className="text-indigo-300 font-semibold">
              Seq={clientSeq}, Ack=0, Flags=SYN
            </div>
          </div>
        )}

        {handshakeStep >= 2 && (
          <div className="p-3.5 rounded-xl bg-slate-950 border border-cyan-500/40 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-bold">2</span>
              <div>
                <span className="text-white font-bold">[SYN, ACK]</span>
                <span className="text-slate-400 ml-2">Server ➔ Client</span>
              </div>
            </div>
            <div className="text-cyan-300 font-semibold">
              Seq={serverSeq}, Ack={clientSeq + 1}, Flags=SYN+ACK
            </div>
          </div>
        )}

        {handshakeStep >= 3 && (
          <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/40 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">3</span>
              <div>
                <span className="text-white font-bold">[ACK]</span>
                <span className="text-slate-400 ml-2">Client ➔ Server</span>
              </div>
            </div>
            <div className="text-emerald-300 font-semibold">
              Seq={clientSeq + 1}, Ack={serverSeq + 1}, Flags=ACK
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <div className="text-xs text-slate-400">
          {handshakeStep === 0 && 'Ready to begin the 3-way handshake.'}
          {handshakeStep === 1 && 'SYN dispatched. Waiting for the server SYN-ACK.'}
          {handshakeStep === 2 && 'Server responded. The client must ACK the server sequence number.'}
          {handshakeStep === 3 && 'Connection ESTABLISHED. Full-duplex byte stream ready for application data.'}
        </div>

        <button
          type="button"
          onClick={handleNextHandshake}
          disabled={handshakeStep === 3}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-md shadow-indigo-600/30"
        >
          <span>
            {handshakeStep === 0
              ? 'Send SYN (Initiate)'
              : handshakeStep === 1
                ? 'Server Reply SYN-ACK'
                : handshakeStep === 2
                  ? 'Send Final ACK'
                  : 'Handshake Complete'}
          </span>
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
