'use client';

import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Skull, Shield, ShieldCheck, ShieldAlert } from 'lucide-react';
import type { AttackStep } from '@/data/attacks';
import { attackPhase } from '@/data/attackPhases';

interface PacketFlowAnimationProps {
  step: AttackStep;
  mitigated: boolean;
  protocolName: string;
}

export default function PacketFlowAnimation({ step, mitigated, protocolName }: PacketFlowAnimationProps) {
  const reduceMotion = useReducedMotion();
  const direction = step.trafficDirection ?? 'attacker-to-target';
  const isTargetSender = direction === 'target-to-attacker';
  const isBroadcast = direction === 'broadcast';

  return (
    <div
      className={`rounded-2xl border p-4 sm:p-5 transition-all duration-300 ${
        mitigated
          ? 'border-emerald-500/40 bg-gradient-to-r from-emerald-950/20 via-slate-900/60 to-emerald-950/20 shadow-[0_0_20px_-8px_rgba(16,185,129,0.25)]'
          : 'border-rose-500/30 bg-gradient-to-r from-rose-950/20 via-slate-900/60 to-indigo-950/20 shadow-[0_0_20px_-8px_rgba(244,63,94,0.25)]'
      }`}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative">
        {/* Attacker Node */}
        <div className="flex items-center sm:flex-col gap-2.5 shrink-0 text-center">
          <div className="relative">
            <span
              className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all ${
                mitigated
                  ? 'border-slate-850 bg-slate-950 text-slate-500'
                  : 'border-rose-500/50 bg-rose-500/10 text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.3)] animate-pulse'
              }`}
            >
              <Skull className="w-6 h-6" aria-hidden="true" />
            </span>
            {!mitigated && (
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 border-2 border-slate-950" />
            )}
          </div>
          <div>
            <span className="block text-xs font-bold text-white">Attacker</span>
            <span className="block text-[10px] font-mono text-rose-400/80">
              {(attackPhase(step.phase)?.label ?? step.phase).toUpperCase()}
            </span>
          </div>
        </div>

        {/* Animated Wire / Channel */}
        <div className="flex-1 w-full max-w-md relative py-4 sm:py-0">
          {/* Wire Background Line */}
          <div
            className={`h-1.5 w-full rounded-full transition-colors ${
              mitigated ? 'bg-slate-800' : 'bg-slate-800/80'
            }`}
          >
            {/* Active wire progress bar */}
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                mitigated
                  ? 'bg-emerald-500/40 w-1/2'
                  : isTargetSender
                  ? 'bg-gradient-to-l from-indigo-500 to-rose-500 w-full'
                  : 'bg-gradient-to-r from-rose-500 to-indigo-500 w-full'
              }`}
            />
          </div>

          {/* Firewall Barrier in the middle when mitigated */}
          <AnimatePresence>
            {mitigated && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={reduceMotion ? { duration: 0 } : { type: 'spring', damping: 15 }}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center"
              >
                <div className="px-3 py-1.5 rounded-full bg-emerald-500 border border-emerald-300 text-slate-950 font-mono text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                  <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Blocked</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Animated Pulsing Packet */}
          {!mitigated && (
            <motion.div
              key={`${step.title}-${direction}`}
              className="absolute top-1/2 -translate-y-1/2 z-10"
              initial={{
                left: isTargetSender ? '85%' : '10%',
                opacity: 0,
                scale: 0.8,
              }}
              animate={reduceMotion ? { left: '50%', opacity: 1, scale: 1 } : {
                left: isTargetSender ? ['85%', '15%'] : ['10%', '85%'],
                opacity: [0, 1, 1, 0.2],
                scale: [0.8, 1.2, 1, 0.8],
              }}
              transition={reduceMotion ? { duration: 0 } : {
                duration: 1.8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <div className="px-2 py-0.5 rounded-md bg-rose-500 text-white font-mono text-[9px] font-bold shadow-[0_0_12px_rgba(244,63,94,0.8)] border border-rose-300 flex items-center gap-1">
                <ShieldAlert className="w-2.5 h-2.5" />
                <span>{attackPhase(step.phase)?.label ?? step.phase}</span>
              </div>
            </motion.div>
          )}

          {/* Channel Label */}
          <div className="text-center mt-2.5">
            <span
              className={`text-[10px] font-mono tracking-wider uppercase px-2.5 py-0.5 rounded-full border ${
                mitigated
                  ? 'border-emerald-500/30 text-emerald-300 bg-emerald-500/10'
                  : 'border-slate-800 text-slate-400 bg-slate-950'
              }`}
            >
              {mitigated
                ? 'Traffic filtered by security control'
                : isBroadcast
                ? 'Broadcast across segment'
                : isTargetSender
                ? 'Target response captured'
                : 'Malicious payload in transit'}
            </span>
          </div>
        </div>

        {/* Target Node */}
        <div className="flex items-center sm:flex-col gap-2.5 shrink-0 text-center">
          <div className="relative">
            <span
              className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all ${
                mitigated
                  ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                  : 'border-indigo-500/50 bg-slate-950 text-indigo-400'
              }`}
            >
              {mitigated ? (
                <ShieldCheck className="w-6 h-6 text-emerald-400" aria-hidden="true" />
              ) : (
                <Shield className="w-6 h-6 text-indigo-400" aria-hidden="true" />
              )}
            </span>
          </div>
          <div>
            <span className="block text-xs font-bold text-white">{protocolName}</span>
            <span
              className={`block text-[10px] font-mono ${
                mitigated ? 'text-emerald-400' : 'text-slate-400'
              }`}
            >
              {mitigated ? 'Protected' : 'Target Host'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
