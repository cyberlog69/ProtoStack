'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { attackCategory } from '@/data/attackCategories';
import type { AttackScenario } from '@/data/attacks';
import KillChainBar from './KillChainBar';
import PacketFlowAnimation from './PacketFlowAnimation';
import StepHexViewer from './StepHexViewer';
import DefenderChallenge from './DefenderChallenge';
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Shield,
  Play,
  Pause,
  ExternalLink,
  Keyboard,
} from 'lucide-react';

interface AttackLabProps {
  protocolName: string;
  attacks: AttackScenario[];
}

export default function AttackLab({ protocolName, attacks }: AttackLabProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [mitigated, setMitigated] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [challengeScore, setChallengeScore] = useState<number | null>(null);

  const attack = attacks[selectedIndex] ?? attacks[0];
  const totalSteps = attack?.steps.length ?? 0;

  const selectAttack = (index: number) => {
    setSelectedIndex(index);
    setStepIndex(0);
    setMitigated(false);
    setAutoPlay(false);
    setChallengeScore(null);
  };

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      if (event.key === 'ArrowRight' || event.key === ' ') {
        event.preventDefault();
        setStepIndex((curr) => Math.min(totalSteps - 1, curr + 1));
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        setStepIndex((curr) => Math.max(0, curr - 1));
      } else if (event.key === 'm' || event.key === 'M') {
        event.preventDefault();
        setMitigated((prev) => !prev);
      } else if (event.key === 'r' || event.key === 'R') {
        event.preventDefault();
        setStepIndex(0);
      } else if (event.key >= '1' && event.key <= '9') {
        const targetIndex = parseInt(event.key, 10) - 1;
        if (targetIndex < attacks.length) {
          event.preventDefault();
          selectAttack(targetIndex);
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalSteps, attacks.length]);

  // Auto-play timer
  useEffect(() => {
    if (!autoPlay || totalSteps === 0) return;

    const timer = setInterval(() => {
      setStepIndex((curr) => {
        if (curr >= totalSteps - 1) {
          setAutoPlay(false);
          return curr;
        }
        return curr + 1;
      });
    }, 2800);

    return () => clearInterval(timer);
  }, [autoPlay, totalSteps]);

  if (!attack) return null;

  const category = attackCategory(attack.category);
  const step = attack.steps[stepIndex] ?? attack.steps[0];
  const isLast = stepIndex >= attack.steps.length - 1;

  if (!step) return null;

  return (
    <div className="rounded-2xl border border-rose-500/30 bg-slate-900/70 overflow-hidden shadow-xl shadow-rose-950/10">
      {/* Header bar */}
      <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/70 flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-pulse" aria-hidden="true" />
            <h3 className="text-base font-bold text-white">Threat model &amp; attack simulation</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Interactive
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Defensive education. Real-time animated packet flow, kill-chain phases, and verification challenge.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-slate-500 border border-slate-800 rounded-lg px-2.5 py-1 bg-slate-950">
            <Keyboard className="w-3 h-3 text-slate-400" />
            <span>Shortcuts: ← / → / M / R</span>
          </div>
          <Link
            href="/attacks"
            className="text-[11px] font-semibold text-rose-300 hover:text-rose-200 inline-flex items-center gap-1"
          >
            Attack library
            <ArrowRight className="w-3 h-3" aria-hidden="true" />
          </Link>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-5">
        {/* Scenario Selector Pills */}
        {attacks.length > 1 && (
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Choose an attack scenario">
            {attacks.map((entry, index) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => selectAttack(index)}
                aria-pressed={index === selectedIndex}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all ${
                  index === selectedIndex
                    ? 'bg-rose-600 text-white border-rose-400 shadow-md shadow-rose-900/30'
                    : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-600'
                }`}
              >
                <span className="opacity-60 mr-1.5 font-mono">{index + 1}.</span>
                {entry.name}
              </button>
            ))}
          </div>
        )}

        {/* Title, Category, CVSS, Difficulty, and MITRE badges */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-base font-bold text-white">{attack.name}</h4>
            {category && (
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${category.color}`}>
                {category.label}
              </span>
            )}

            {/* Difficulty stars */}
            <span
              className="text-[11px] font-mono text-amber-300 ml-1"
              title={`Difficulty: ${attack.difficulty} of 3`}
            >
              {'★'.repeat(attack.difficulty)}{'☆'.repeat(3 - attack.difficulty)}
            </span>

            {/* CVSS Score badge */}
            {attack.cvssScore !== undefined && (
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${
                  attack.cvssScore >= 9
                    ? 'border-red-500/40 text-red-300 bg-red-500/15'
                    : attack.cvssScore >= 7
                    ? 'border-orange-500/40 text-orange-300 bg-orange-500/15'
                    : attack.cvssScore >= 4
                    ? 'border-amber-500/40 text-amber-300 bg-amber-500/15'
                    : 'border-slate-700 text-slate-300 bg-slate-800'
                }`}
              >
                CVSS {attack.cvssScore.toFixed(1)}
              </span>
            )}
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">{attack.summary}</p>

          {/* MITRE ATT&CK badges */}
          {attack.mitreIds && attack.mitreIds.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] font-mono uppercase text-slate-500">MITRE ATT&CK®:</span>
              {attack.mitreIds.map((id) => (
                <a
                  key={id}
                  href={`https://attack.mitre.org/techniques/${id.replace('.', '/')}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[9px] font-mono px-2 py-0.5 rounded border border-violet-500/40 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20 transition-colors"
                >
                  <span>{id}</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Phase 2: Animated Packet-Flow Visualizer */}
        <PacketFlowAnimation step={step} mitigated={mitigated} protocolName={protocolName} />

        {/* Step runner */}
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-4" aria-live="polite">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-850 pb-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Step {stepIndex + 1} of {attack.steps.length} —{' '}
              <span className="text-rose-300 font-bold">{step.title}</span>
            </span>

            {/* Step Controls */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setAutoPlay((prev) => !prev)}
                className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold flex items-center gap-1 transition-colors ${
                  autoPlay
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
                title={autoPlay ? 'Pause auto-advance' : 'Auto-play attack steps'}
              >
                {autoPlay ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                <span>{autoPlay ? 'Pause' : 'Auto-play'}</span>
              </button>

              <button
                type="button"
                onClick={() => setStepIndex((current) => Math.max(0, current - 1))}
                disabled={stepIndex === 0}
                aria-label="Previous attack step"
                className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() => setStepIndex((current) => Math.min(attack.steps.length - 1, current + 1))}
                disabled={isLast}
                aria-label="Next attack step"
                className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setStepIndex(0);
                  setAutoPlay(false);
                }}
                aria-label="Restart attack steps"
                className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Reset to step 1"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <h5 className="text-xs font-bold text-white flex items-center gap-2">
              <span>{step.title}</span>
            </h5>
            <p className="text-xs text-slate-300 leading-relaxed">{step.description}</p>
          </div>

          {/* Phase 5: Hex Viewer if packetHex exists */}
          {step.packetHex && (
            <StepHexViewer hexString={step.packetHex} label="Captured Wire Frame Payload" />
          )}

          {/* Defender Detection Telemetry */}
          <div className="rounded-lg border border-cyan-500/25 bg-cyan-950/20 p-3">
            <span className="block text-[10px] font-mono uppercase tracking-wider text-cyan-300 mb-1 font-bold">
              Defender Telemetry &amp; Detection Signal
            </span>
            <p className="text-[11px] text-slate-200 leading-relaxed font-mono">{step.detection}</p>
          </div>

          {/* Phase 3: Kill-Chain Timeline Bar */}
          <KillChainBar steps={attack.steps} currentIndex={stepIndex} onJump={setStepIndex} />
        </div>

        {/* Outcome and mitigation toggle */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div
            className={`flex-1 rounded-xl border p-4 transition-all ${
              mitigated ? 'border-emerald-500/40 bg-emerald-950/20' : 'border-rose-500/30 bg-rose-950/20'
            }`}
          >
            <span
              className={`block text-[10px] font-mono uppercase tracking-wider mb-1 font-bold ${
                mitigated ? 'text-emerald-300' : 'text-rose-300'
              }`}
            >
              {mitigated ? 'Security Status: Mitigations Applied' : 'Impact if Unmitigated'}
            </span>
            <p className="text-xs text-slate-200 leading-relaxed">
              {mitigated
                ? `Protected & Contained. ${attack.mitigations[0]} neutralizes the primary vector required for this attack.`
                : attack.impact}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setMitigated((current) => !current)}
            aria-pressed={mitigated}
            className={`rounded-xl border px-4 py-3 text-xs font-bold font-mono transition-all shrink-0 flex items-center justify-center gap-2 ${
              mitigated
                ? 'border-emerald-500/50 bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-900/30'
                : 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
            }`}
          >
            {mitigated ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Mitigations Active</span>
              </>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                <span>Apply Mitigations (M)</span>
              </>
            )}
          </button>
        </div>

        {/* Defenses list */}
        <div>
          <h5 className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-2">
            Verified Defense Controls
          </h5>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {attack.mitigations.map((mitigation) => (
              <li
                key={mitigation}
                className={`flex items-start gap-2 text-[11px] leading-relaxed p-2 rounded-lg border transition-all ${
                  mitigated
                    ? 'border-emerald-500/30 bg-emerald-950/10 text-emerald-200'
                    : 'border-slate-800 bg-slate-950/60 text-slate-300'
                }`}
              >
                {mitigated ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" aria-hidden="true" />
                ) : (
                  <Shield className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" aria-hidden="true" />
                )}
                <span>{mitigation}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Real-World Incidents ("In the wild") */}
        {attack.realWorldExamples && attack.realWorldExamples.length > 0 && (
          <details className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden text-xs">
            <summary className="px-3.5 py-2.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 cursor-pointer hover:text-white transition-colors select-none">
              In the wild — known historical campaigns &amp; incidents ({attack.realWorldExamples.length})
            </summary>
            <ul className="px-4 pb-3 space-y-1.5 border-t border-slate-850 pt-2.5">
              {attack.realWorldExamples.map((incident, idx) => (
                <li key={idx} className="text-[11px] text-slate-300 flex items-start gap-2">
                  <span className="text-rose-400 font-bold">•</span>
                  <span>{incident}</span>
                </li>
              ))}
            </ul>
          </details>
        )}

        {/* Phase 4: Defender Challenge (Gamification) */}
        <DefenderChallenge attack={attack} onComplete={setChallengeScore} />
        {challengeScore !== null && (
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-300 bg-emerald-950/20 border border-emerald-500/30 p-2.5 rounded-xl">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Evaluation complete — Score: {challengeScore} / 2 recorded in your browser session.</span>
          </div>
        )}

        <p className="text-[10px] text-slate-500 border-t border-slate-800 pt-3">
          This is an educational threat model and conceptual simulation designed exclusively for security engineers
          and defensive practitioners. No live exploit payloads or scanning code are included.
        </p>
      </div>
    </div>
  );
}
