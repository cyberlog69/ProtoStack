export type AttackPhase = 'precondition' | 'action' | 'impact';

export const ATTACK_PHASES: {
  id: AttackPhase;
  label: string;
  description: string;
  color: string;
  barColor: string;
}[] = [
  {
    id: 'precondition',
    label: 'Precondition',
    description: 'What the attacker needs before the attack can start.',
    color: 'text-sky-300 border-sky-500/30 bg-sky-500/5',
    barColor: 'bg-sky-500',
  },
  {
    id: 'action',
    label: 'Action',
    description: 'The protocol exchange that carries out the attack.',
    color: 'text-rose-300 border-rose-500/30 bg-rose-500/5',
    barColor: 'bg-rose-500',
  },
  {
    id: 'impact',
    label: 'Impact',
    description: 'What the victim or network experiences as a result.',
    color: 'text-red-300 border-red-500/30 bg-red-500/5',
    barColor: 'bg-red-500',
  },
];

export function attackPhase(id: AttackPhase) {
  return ATTACK_PHASES.find((phase) => phase.id === id);
}

export function phaseForStep(index: number): AttackPhase {
  return ATTACK_PHASES[Math.min(index, ATTACK_PHASES.length - 1)].id;
}
