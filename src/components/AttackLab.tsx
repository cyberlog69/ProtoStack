'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { attackCategory } from '@/data/attackCategories';
import { attackPhase } from '@/data/attackPhases';
import { mitreTechnique } from '@/data/mitre';
import type { AttackScenario } from '@/data/attacks';
import KillChainBar from './KillChainBar';
import PacketFlowAnimation, { type SimulationState } from './PacketFlowAnimation';
import AttackFrameAnatomy from './AttackFrameAnatomy';
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
  protocolSlug: string;
  attacks: AttackScenario[];
  distractors: string[];
}

export default function AttackLab({ protocolName, protocolSlug, attacks, distractors }: AttackLabProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [mitigated, setMitigated] = useState(false);
  const [simulationState, setSimulationState] = useState<SimulationState>('idle');

  const attack = attacks[selectedIndex] ?? attacks[0];
  const totalSteps = attack?.steps.length ?? 0;

  const selectAttack = (index: number) => {
    setSelectedIndex(index);
    setStepIndex(0);
    setMitigated(false);
    setSimulationState('idle');
  };

  const goToStep = (index: number) => {
    setStepIndex(Math.max(0, Math.min(totalSteps - 1, index)));
    setSimulationState('paused');
  };

  const startSimulation = () => {
    setMitigated(false);
    setStepIndex(0);
    setSimulationState('running');
  };

  const toggleSimulation = () => {
    if (simulationState === 'running') {
      setSimulationState('paused');
      return;
    }
    if (simulationState === 'complete') {
      startSimulation();
      return;
    }
    if (simulationState === 'idle') {
      startSimulation();
      return;
    }
    setSimulationState('running');
  };

  // Advance one step at a time only after the user starts the simulation.
  useEffect(() => {
    if (simulationState !== 'running' || totalSteps === 0) return;

    const timer = window.setTimeout(() => {
      if (stepIndex < totalSteps - 1) {
        setStepIndex((current) => current + 1);
      } else {
        setSimulationState('complete');
      }
    }, 2600);

    return () => window.clearTimeout(timer);
  }, [simulationState, stepIndex, totalSteps]);

  if (!attack) return null;

  const category = attackCategory(attack.category);
  const step = attack.steps[stepIndex] ?? attack.steps[0];
  if (!step) return null;

  const phase = attackPhase(step.phase);
  const isLast = stepIndex >= attack.steps.length - 1;
  const showChallenge = isLast && !mitigated && simulationState !== 'running';

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest('input, textarea, select, button, a, [contenteditable="true"]')) return;

    if (event.key === 'ArrowRight' || event.key === ' ') {
      event.preventDefault();
      goToStep(stepIndex + 1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goToStep(stepIndex - 1);
    } else if (event.key.toLowerCase() === 'm') {
      event.preventDefault();
      setMitigated((current) => !current);
      setSimulationState('paused');
    } else if (event.key.toLowerCase() === 'r') {
      event.preventDefault();
      setStepIndex(0);
      setMitigated(false);
      setSimulationState('idle');
    } else if (event.key.toLowerCase() === 's') {
      event.preventDefault();
      toggleSimulation();
    }
  };

  return (
    <div
      className="rounded-2xl border border-rose-500/30 bg-slate-900/70 overflow-hidden shadow-xl shadow-rose-950/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/60"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label={`${protocolName} attack simulation`}
    >
      <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/70 flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400" aria-hidden="true" />
            <h3 className="text-base font-bold text-white">Threat model &amp; attack simulation</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Simulated
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Defensive education. Conceptual steps and animation; no packets are generated or sent.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-slate-500 border border-slate-800 rounded-lg px-2.5 py-1 bg-slate-950">
            <Keyboard className="w-3 h-3 text-slate-400" aria-hidden="true" />
            <span>Focus panel: S ← → M R</span>
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

        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-base font-bold text-white">{attack.name}</h4>
            {category && (
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${category.color}`}>
                {category.label}
              </span>
            )}
            <span
              className="text-[11px] font-mono text-amber-300"
              title={`Difficulty ${attack.difficulty} of 3`}
              aria-label={`Difficulty ${attack.difficulty} of 3`}
            >
              {'★'.repeat(attack.difficulty)}
              {'☆'.repeat(3 - attack.difficulty)}
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">{attack.summary}</p>

          {attack.mitreIds.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] font-mono uppercase text-slate-500">MITRE ATT&amp;CK®</span>
              {attack.mitreIds.map((id) => (
                <a
                  key={id}
                  href={`https://attack.mitre.org/techniques/${id.replace('.', '/')}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[9px] font-mono px-2 py-0.5 rounded border border-violet-500/40 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20 transition-colors"
                  title={mitreTechnique(id)?.name ?? id}
                >
                  <span>{id}</span>
                  {mitreTechnique(id) && <span className="text-violet-200/80">{mitreTechnique(id)?.name}</span>}
                  <ExternalLink className="w-2.5 h-2.5 opacity-60" aria-hidden="true" />
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/70 p-3">
          <button
            type="button"
            onClick={toggleSimulation}
            className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs font-bold text-white transition-colors ${
              simulationState === 'running'
                ? 'bg-amber-600 hover:bg-amber-500'
                : simulationState === 'complete'
                  ? 'bg-slate-700 hover:bg-slate-600'
                  : 'bg-rose-600 hover:bg-rose-500'
            }`}
          >
            {simulationState === 'running' ? (
              <Pause className="w-4 h-4" aria-hidden="true" />
            ) : simulationState === 'complete' ? (
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Play className="w-4 h-4" aria-hidden="true" />
            )}
            <span>
              {simulationState === 'running'
                ? 'Pause simulation'
                : simulationState === 'paused'
                  ? 'Resume simulation'
                  : simulationState === 'complete'
                    ? 'Replay simulation'
                    : 'Simulate attack'}
            </span>
          </button>

          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400">
            <span
              className={`w-2 h-2 rounded-full ${
                simulationState === 'running'
                  ? 'bg-rose-500'
                  : simulationState === 'complete'
                    ? 'bg-emerald-500'
                    : simulationState === 'paused'
                      ? 'bg-amber-500'
                      : 'bg-slate-600'
              }`}
              aria-hidden="true"
            />
            {simulationState === 'running'
              ? 'running'
              : simulationState === 'paused'
                ? 'paused'
                : simulationState === 'complete'
                  ? 'complete'
                  : 'idle'}
          </span>

          {simulationState !== 'idle' && (
            <button
              type="button"
              onClick={() => {
                setSimulationState('idle');
                setStepIndex(0);
                setMitigated(false);
              }}
              className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-white"
            >
              <RotateCcw className="w-3 h-3" aria-hidden="true" />
              Reset
            </button>
          )}

          <span className="text-[11px] text-slate-500 sm:ml-auto">
            Manual control — nothing runs until you start it.
          </span>
        </div>

        <PacketFlowAnimation
          step={step}
          mitigated={mitigated}
          protocolName={protocolName}
          state={simulationState}
        />

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-4" aria-live="polite">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Step {stepIndex + 1} of {attack.steps.length} —{' '}
              <span className="text-rose-300 font-bold">{step.title}</span>
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => goToStep(stepIndex - 1)}
                disabled={stepIndex === 0}
                aria-label="Previous attack step"
                className="p-2.5 rounded-md bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
              >
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() => goToStep(stepIndex + 1)}
                disabled={isLast}
                aria-label="Next attack step"
                className="p-2.5 rounded-md bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
              >
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setStepIndex(0);
                  setMitigated(false);
                  setSimulationState('idle');
                }}
                aria-label="Restart attack steps"
                className="p-2.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                title="Reset simulation"
              >
                <RotateCcw className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h5 className="text-xs font-bold text-white">{step.title}</h5>
              {phase && (
                <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border ${phase.color}`}>
                  {phase.label}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{step.description}</p>
          </div>

          <div className="rounded-lg border border-cyan-500/25 bg-cyan-950/20 p-3">
            <span className="block text-[10px] font-mono uppercase tracking-wider text-cyan-300 mb-1 font-bold">
              Defender telemetry &amp; detection signal
            </span>
            <p className="text-[11px] text-slate-200 leading-relaxed font-mono">{step.detection}</p>
          </div>

          <KillChainBar steps={attack.steps} currentIndex={stepIndex} onJump={goToStep} />
        </div>

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
              {mitigated ? 'Outcome with mitigations' : 'Impact if unmitigated'}
            </span>
            <p className="text-xs text-slate-200 leading-relaxed">
              {mitigated
                ? `Blocked or contained. ${attack.mitigations[0]} removes the precondition this attack depends on.`
                : attack.impact}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setMitigated((current) => !current);
              setSimulationState('paused');
            }}
            aria-pressed={mitigated}
            className={`rounded-xl border px-4 py-3 text-xs font-bold font-mono transition-all shrink-0 flex items-center justify-center gap-2 ${
              mitigated
                ? 'border-emerald-500/50 bg-emerald-600 text-white hover:bg-emerald-500'
                : 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
            }`}
          >
            {mitigated ? (
              <>
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                <span>Mitigations applied</span>
              </>
            ) : (
              <>
                <Shield className="w-4 h-4" aria-hidden="true" />
                <span>Apply mitigations (M)</span>
              </>
            )}
          </button>
        </div>

        <div>
          <h5 className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-2">
            Defences that matter
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

        <AttackFrameAnatomy protocolSlug={protocolSlug} protocolName={protocolName} />

        {showChallenge && <DefenderChallenge attack={attack} distractors={distractors} />}

        <p className="text-[10px] text-slate-500 border-t border-slate-800 pt-3">
          Conceptual threat model for defenders. No exploit payloads, scanning code or live traffic are included.
          Test attacks only against systems you own or have explicit written permission to assess.
        </p>
      </div>
    </div>
  );
}
