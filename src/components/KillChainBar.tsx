'use client';

import React from 'react';
import type { AttackStep } from '@/data/attacks';
import { attackPhase } from '@/data/attackPhases';

interface KillChainBarProps {
  steps: AttackStep[];
  currentIndex: number;
  onJump: (index: number) => void;
}

export default function KillChainBar({ steps, currentIndex, onJump }: KillChainBarProps) {
  const currentPhase = attackPhase(steps[currentIndex]?.phase ?? 'precondition');

  return (
    <div className="space-y-1.5" role="group" aria-label="Attack phase timeline">
      <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-500">
        <span>Attack progression</span>
        <span>
          Step {currentIndex + 1} of {steps.length}: {currentPhase?.label ?? 'Phase'}
        </span>
      </div>

      <div className="flex gap-1 rounded-lg overflow-hidden p-0.5 bg-slate-950 border border-slate-800">
        {steps.map((step, index) => {
          const phase = attackPhase(step.phase);
          const active = index === currentIndex;
          const past = index < currentIndex;

          return (
            <button
              key={`${step.title}-${index}`}
              type="button"
              onClick={() => onJump(index)}
              aria-current={active ? 'step' : undefined}
              aria-label={`Step ${index + 1}: ${phase?.label ?? step.phase} — ${step.title}`}
              title={`Step ${index + 1}: ${phase?.label ?? step.phase} — ${step.title}`}
              className={`flex-1 py-1.5 px-1 text-[10px] font-mono font-bold uppercase tracking-wider transition-all rounded text-center truncate ${
                active
                  ? `${phase?.barColor ?? 'bg-rose-500'} text-white shadow-sm shadow-black/40`
                  : past
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    : 'bg-slate-900/80 text-slate-500 hover:bg-slate-800 hover:text-slate-300'
              }`}
            >
              <span className="hidden sm:inline">{phase?.label ?? step.phase}</span>
              <span className="sm:hidden">{index + 1}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
