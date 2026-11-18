export type AttackCategory =
  | 'spoofing'
  | 'interception'
  | 'injection'
  | 'denial-of-service'
  | 'credential'
  | 'downgrade'
  | 'abuse'
  | 'reconnaissance';

export const ATTACK_CATEGORIES: {
  id: AttackCategory;
  label: string;
  description: string;
  color: string;
}[] = [
  {
    id: 'spoofing',
    label: 'Spoofing',
    description: 'Pretending to be another device, server or network.',
    color: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  },
  {
    id: 'interception',
    label: 'Interception',
    description: 'Placing the attacker between two parties to read or alter traffic.',
    color: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  },
  {
    id: 'injection',
    label: 'Injection',
    description: 'Inserting data, commands or messages the protocol did not intend.',
    color: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  },
  {
    id: 'denial-of-service',
    label: 'Denial of service',
    description: 'Exhausting resources so legitimate users cannot be served.',
    color: 'bg-red-500/15 text-red-300 border-red-500/30',
  },
  {
    id: 'credential',
    label: 'Credential attack',
    description: 'Stealing, guessing or replaying authentication material.',
    color: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30',
  },
  {
    id: 'downgrade',
    label: 'Downgrade',
    description: 'Forcing a weaker version or configuration than the peers support.',
    color: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
  },
  {
    id: 'abuse',
    label: 'Feature abuse',
    description: 'Using legitimate protocol features for an unintended purpose.',
    color: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  },
  {
    id: 'reconnaissance',
    label: 'Reconnaissance',
    description: 'Learning topology, identities or versions without yet attacking.',
    color: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  },
];

export function attackCategory(id: AttackCategory) {
  return ATTACK_CATEGORIES.find((category) => category.id === id);
}
