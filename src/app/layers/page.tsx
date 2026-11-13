'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { OSI_LAYERS, TCPIP_LAYERS, LayerInfo } from '@/data/layers';
import EncapsulationSimulator from '@/components/EncapsulationSimulator';
import QuizSection from '@/components/QuizSection';
import { QuizQuestion } from '@/types/protocol';
import { Layers, ArrowRight, ArrowDown, Shield, Server, Network, Cpu, Terminal, CheckCircle2, BookOpen, Sparkles, HelpCircle } from 'lucide-react';

export default function LayersPage() {
  const [selectedLayerNumber, setSelectedLayerNumber] = useState<number>(7);

  const activeLayer = OSI_LAYERS.find((l) => l.number === selectedLayerNumber) || OSI_LAYERS[0];

  const LAYER_QUIZ: QuizQuestion[] = [
    {
      id: 'osi-q1',
      question: 'What is the Protocol Data Unit (PDU) called at the Network Layer (Layer 3)?',
      options: ['Frame', 'Packet', 'Segment', 'Bit'],
      correctAnswer: 1,
      explanation: 'At Layer 3 (Network), the PDU is a Packet. At Layer 4 it is a Segment, at Layer 2 it is a Frame, and at Layer 1 it is Bits.'
    },
    {
      id: 'osi-q2',
      question: 'Which OSI layers are merged into the single "Application Layer" in the practical TCP/IP 4-layer model?',
      options: [
        'Layers 1, 2, and 3',
        'Layers 4, 5, and 6',
        'Layers 7, 6, and 5 (Application, Presentation, Session)',
        'Layers 3 and 4 only'
      ],
      correctAnswer: 2,
      explanation: 'The TCP/IP model simplifies the stack by combining OSI Layers 7 (Application), 6 (Presentation), and 5 (Session) into a single Application layer.'
    },
    {
      id: 'osi-q3',
      question: 'At which OSI layer do physical MAC hardware addresses and Ethernet switching operate?',
      options: ['Physical Layer (Layer 1)', 'Data Link Layer (Layer 2)', 'Network Layer (Layer 3)', 'Transport Layer (Layer 4)'],
      correctAnswer: 1,
      explanation: 'Layer 2 (Data Link) manages MAC hardware addressing, Ethernet framing, and local switch forwarding.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Hero Banner */}
      <section className="text-center space-y-4 pt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-medium">
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span>ISO/OSI 7-Layer Reference Model & TCP/IP Architecture</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
          How Network Layers Work —{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            OSI & TCP/IP
          </span>
        </h1>

        <p className="text-base text-slate-300 max-w-3xl mx-auto leading-relaxed">
          Explore the theoretical 7-layer OSI model and the practical 4-layer TCP/IP stack. Learn how data transforms through <strong>encapsulation</strong> down the wire and <strong>decapsulation</strong> back up to application code.
        </p>
      </section>

      {/* SECTION 1: Interactive Encapsulation / Decapsulation Simulator */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
            <Terminal className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Interactive Encapsulation Simulator</h2>
            <p className="text-xs text-slate-400">Step through headers added at each layer down to the physical wire.</p>
          </div>
        </div>

        <EncapsulationSimulator />
      </section>

      {/* SECTION 2: OSI vs TCP/IP Side-by-Side Model Comparison */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center">
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">OSI 7-Layer vs. TCP/IP Architecture Comparison</h2>
            <p className="text-xs text-slate-400">Click any layer to inspect its PDU, core hardware, and protocol mappings.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: The OSI 7 Layers Interactive Stack (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-2 pb-1">
              <span>OSI 7-LAYER MODEL</span>
              <span>PDU (DATA UNIT)</span>
            </div>

            <div className="space-y-2">
              {OSI_LAYERS.map((layer) => {
                const isSelected = layer.number === selectedLayerNumber;

                return (
                  <button
                    key={layer.number}
                    onClick={() => setSelectedLayerNumber(layer.number)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between group ${
                      isSelected
                        ? 'bg-indigo-950/70 border-indigo-500 shadow-lg shadow-indigo-500/20 scale-[1.02]'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs border ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-400'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}>
                        {layer.number}
                      </span>
                      <div>
                        <div className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors">
                          {layer.name}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {layer.tcpIpEquivalent}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                        {layer.pdu}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Mapping Legend to TCP/IP */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-2 font-mono">
              <span className="text-slate-300 font-bold block">TCP/IP Mapping Summary:</span>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-purple-400">Layers 7, 6, 5 (App, Pres, Sess)</span>
                <span className="text-slate-300">➔ TCP/IP Application</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-cyan-400">Layer 4 (Transport)</span>
                <span className="text-slate-300">➔ TCP/IP Transport</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-emerald-400">Layer 3 (Network)</span>
                <span className="text-slate-300">➔ TCP/IP Internet</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-amber-400">Layers 2 & 1 (Data Link, Physical)</span>
                <span className="text-slate-300">➔ TCP/IP Network Access</span>
              </div>
            </div>
          </div>

          {/* Right Column: Active Layer Deep Dive Card (lg:col-span-7) */}
          <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-900/90 p-6 md:p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-indigo-400 block uppercase">
                  OSI Layer {activeLayer.number} • {activeLayer.tcpIpEquivalent}
                </span>
                <h3 className="text-2xl font-bold text-white mt-1">
                  {activeLayer.name}
                </h3>
              </div>

              <div className="text-right font-mono">
                <span className="text-[10px] text-slate-500 block uppercase">Protocol Data Unit</span>
                <span className="text-sm font-bold text-emerald-400">{activeLayer.pdu}</span>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              {activeLayer.description}
            </p>

            {/* Analogy Card */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/90 text-xs text-indigo-200 font-mono leading-relaxed">
              <span className="text-indigo-400 font-bold block mb-1">📬 Real-World Analogy:</span>
              {activeLayer.analogy}
            </div>

            {/* Key Functions */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Key Layer Functions
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeLayer.functions.map((func, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                    <span>{func}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hardware & Devices */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Associated Devices & Hardware
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {activeLayer.devices.map((device, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
                    {device}
                  </span>
                ))}
              </div>
            </div>

            {/* Protocols Operating at this Layer */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Protocols at Layer {activeLayer.number}
                </h4>
                <span className="text-[11px] text-slate-500">Click to launch interactive session</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {activeLayer.protocols.map((proto, i) => (
                  proto.slug ? (
                    <Link
                      key={i}
                      href={`/protocols/${proto.slug}`}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600/15 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600 hover:text-white text-xs font-mono transition-all flex items-center gap-1.5"
                    >
                      <span>{proto.name}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  ) : (
                    <span
                      key={i}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 text-xs font-mono"
                    >
                      {proto.name}
                    </span>
                  )
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Knowledge Quiz */}
      <section>
        <QuizSection questions={LAYER_QUIZ} protocolName="OSI 7-Layer & TCP/IP Model" />
      </section>
    </div>
  );
}

