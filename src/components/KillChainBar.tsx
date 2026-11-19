'use client';

import React from 'react';
import type { AttackStep } from '@/data/attacks';

const PHASE_META: Record<
  AttackStep['phase'],
  { label: string; short: string; color: string; bg: string; activeBg: string }
> = {
  recon: { label: 'Reconnaissance', short: 'Recon', color: 'text-sky-300', bg: 'bg-sky-500/20 border-sky-500/40', activeBg: 'bg-sky-500 text-white' },
  weaponize: { label: 'Weaponize', short: 'Weapon', color: 'text-amber-300', bg: 'bg-amber-500/20 border-amber-500/40', activeBg: 'bg-amber-500 text-white' },
  deliver: { label: 'Delivery', short: 'Deliver', color: 'text-orange-300', bg: 'bg-orange-500/20 border-orange-500/40', activeBg: 'bg-orange-500 text-white' },
  exploit: { label: 'Exploit', short: 'Exploit', color: 'text-rose-300', bg: 'bg-rose-500/20 border-rose-500/40', activeBg: 'bg-rose-500 text-white' },
  install: { label: 'Installation', short: 'Install', color: 'text-fuchsia-300', bg: 'bg-fuchsia-500/20 border-fuchsia-500/40', activeBg: 'bg-fuchsia-500 text-white' },
  command: { label: 'Command & Control', short: 'C2', color: 'text-purple-300', bg: 'bg-purple-500/20 border-purple-500/40', activeBg: 'bg-purple-500 text-white' },
  impact: { label: 'Impact', short: 'Impact', color: 'text-red-300', bg: 'bg-red-500/20 border-red-500/40', activeBg: 'bg-red-600 text-white' },
};

interface KillChainBarProps {
  steps: AttackStep[];
  currentIndex: number;
  onJump: (index: number) => void;
}

export default function KillChainBar({ steps, currentIndex, onJump }: KillChainBarProps) {
  return (
    <div className="space-y-1.5" role="region" aria-label="Kill chain phase timeline">
      <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-500">
        <span>Kill-chain progress</span>
        <span>
          Step {currentIndex + 1} of {steps.length}: {PHASE_META[steps[currentIndex]?.phase ?? 'exploit']?.label}
        </span>
      </div>
      <div className="flex gap-1 rounded-lg overflow-hidden p-0.5 bg-slate-950 border border-slate-800" role="tablist">
        {steps.map((step, index) => {
          const meta = PHASE_META[step.phase] ?? PHASE_META.exploit;
          const isActive = index === currentIndex;
          const isPast = index < currentIndex;
          return (
            <button
              key={index}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onJump(index)}
              title={`Step ${index + 1}: ${meta.label} - ${step.title}`}
              className={`flex-1 py-1.5 px-1 text-[10px] font-mono font-bold uppercase tracking-wider transition-all rounded text-center truncate ${
                isActive
                  ? `${meta.activeBg} shadow-sm shadow-black/40`
                  : isPast
                  ? `${meta.bg} ${meta.color} border hover:brightness-125`
                  : 'bg-slate-900/80 text-slate-500 hover:bg-slate-800 hover:text-slate-300'
              }`}
            >
              <span className="hidden sm:inline">{meta.short}</span>
              <span className="sm:hidden">{index + 1}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
