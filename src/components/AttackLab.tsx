'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { attackCategory } from '@/data/attackCategories';
import type { AttackScenario } from '@/data/attacks';
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Shield,
  ShieldCheck,
  Skull,
} from 'lucide-react';

interface AttackLabProps {
  protocolName: string;
  attacks: AttackScenario[];
}

export default function AttackLab({ protocolName, attacks }: AttackLabProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [mitigated, setMitigated] = useState(false);

  const attack = attacks[selectedIndex] ?? attacks[0];
  if (!attack) return null;

  const category = attackCategory(attack.category);
  const step = attack.steps[stepIndex] ?? attack.steps[0];
  const isLast = stepIndex >= attack.steps.length - 1;

  const selectAttack = (index: number) => {
    setSelectedIndex(index);
    setStepIndex(0);
    setMitigated(false);
  };

  return (
    <div className="rounded-2xl border border-rose-500/30 bg-slate-900/70 overflow-hidden">
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
            Defensive education. Every step runs in this page; no traffic is generated or sent.
          </p>
        </div>

        <Link
          href="/attacks"
          className="text-[11px] font-semibold text-rose-300 hover:text-rose-200 inline-flex items-center gap-1"
        >
          Attack library
          <ArrowRight className="w-3 h-3" aria-hidden="true" />
        </Link>
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
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors ${
                  index === selectedIndex
                    ? 'bg-rose-600 text-white border-rose-400'
                    : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-600'
                }`}
              >
                {entry.name}
              </button>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-bold text-white">{attack.name}</h4>
            {category && (
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${category.color}`}>
                {category.label}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{attack.summary}</p>
        </div>

        {/* Attacker -> target diagram */}
        <div
          className={`rounded-xl border p-4 flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors ${
            mitigated ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-rose-500/30 bg-rose-500/5'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-xl border border-rose-500/40 bg-slate-950 flex items-center justify-center">
              <Skull className="w-5 h-5 text-rose-400" aria-hidden="true" />
            </span>
            <div className="text-center sm:text-left">
              <span className="block text-xs font-bold text-white">Attacker</span>
              <span className="block text-[10px] font-mono text-slate-400">simulated</span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-1 justify-center" aria-hidden="true">
            <span className={`h-px flex-1 max-w-[90px] ${mitigated ? 'bg-emerald-500/40' : 'bg-rose-500/40'}`} />
            {mitigated ? (
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            ) : (
              <ArrowRight className="w-6 h-6 text-rose-400" />
            )}
            <span className={`h-px flex-1 max-w-[90px] ${mitigated ? 'bg-emerald-500/40' : 'bg-rose-500/40'}`} />
          </div>

          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-xl border border-indigo-500/40 bg-slate-950 flex items-center justify-center">
              <Shield className="w-5 h-5 text-indigo-400" aria-hidden="true" />
            </span>
            <div className="text-center sm:text-left">
              <span className="block text-xs font-bold text-white">{protocolName}</span>
              <span className="block text-[10px] font-mono text-slate-400">
                {mitigated ? 'protected' : 'target'}
              </span>
            </div>
          </div>
        </div>

        {/* Step runner */}
        <div
          className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3"
          aria-live="polite"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
              Attack step {stepIndex + 1} of {attack.steps.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setStepIndex((current) => Math.max(0, current - 1))}
                disabled={stepIndex === 0}
                aria-label="Previous attack step"
                className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white"
              >
                <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setStepIndex((current) => Math.min(attack.steps.length - 1, current + 1))}
                disabled={isLast}
                aria-label="Next attack step"
                className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white"
              >
                <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setStepIndex(0)}
                aria-label="Restart attack steps"
                className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <h5 className="text-xs font-bold text-white">{step.title}</h5>
            <p className="text-xs text-slate-300 leading-relaxed">{step.description}</p>
          </div>

          <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-2.5">
            <span className="block text-[10px] font-mono uppercase tracking-wider text-cyan-300 mb-0.5">
              What a defender can see
            </span>
            <p className="text-[11px] text-slate-300 leading-relaxed">{step.detection}</p>
          </div>

          <div className="flex gap-1" aria-hidden="true">
            {attack.steps.map((entry, index) => (
              <span
                key={entry.title}
                className={`h-1 flex-1 rounded-full ${index <= stepIndex ? 'bg-rose-500' : 'bg-slate-800'}`}
              />
            ))}
          </div>
        </div>

        {/* Outcome and mitigation toggle */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div
            className={`flex-1 rounded-xl border p-4 ${
              mitigated ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-rose-500/30 bg-rose-500/5'
            }`}
          >
            <span className={`block text-[10px] font-mono uppercase tracking-wider mb-1 ${
              mitigated ? 'text-emerald-300' : 'text-rose-300'
            }`}>
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
            onClick={() => setMitigated((current) => !current)}
            aria-pressed={mitigated}
            className={`rounded-xl border px-4 py-3 text-xs font-bold transition-colors shrink-0 ${
              mitigated
                ? 'border-emerald-500/50 bg-emerald-600 text-white hover:bg-emerald-500'
                : 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
            }`}
          >
            {mitigated ? 'Mitigations applied' : 'Apply mitigations'}
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
                className={`flex items-start gap-2 text-[11px] leading-relaxed ${
                  mitigated ? 'text-emerald-200' : 'text-slate-300'
                }`}
              >
                {mitigated ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" aria-hidden="true" />
                ) : (
                  <Shield className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" aria-hidden="true" />
                )}
                {mitigation}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-[10px] text-slate-500 border-t border-slate-800 pt-3">
          This is a conceptual model for defenders, not an exploit toolkit. It contains no payloads, tooling or
          instructions for attacking systems you do not own.
        </p>
      </div>
    </div>
  );
}
