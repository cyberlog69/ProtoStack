import { Protocol } from '@/types/protocol';
import { NETWORK_PROTOCOLS } from './protocols/network';
import { TRANSPORT_PROTOCOLS } from './protocols/transport';
import { APPLICATION_PROTOCOLS } from './protocols/application';
import { IOT_PROTOCOLS } from './protocols/iot';
import { SECURITY_PROTOCOLS } from './protocols/security';
import { WIRELESS_PROTOCOLS } from './protocols/wireless';
import { CLOUD_PROTOCOLS } from './protocols/cloud';

export const PROTOCOLS: Protocol[] = [
  ...NETWORK_PROTOCOLS,
  ...TRANSPORT_PROTOCOLS,
  ...APPLICATION_PROTOCOLS,
  ...IOT_PROTOCOLS,
  ...SECURITY_PROTOCOLS,
  ...WIRELESS_PROTOCOLS,
  ...CLOUD_PROTOCOLS,
];

export const CATEGORIES_META = [
  { id: 'all', label: 'All Protocols', count: PROTOCOLS.length, color: 'text-white' },
  { id: 'network', label: 'Network & Internet', count: PROTOCOLS.filter(p => p.category === 'network').length, color: 'text-blue-400' },
  { id: 'application', label: 'Application Layer', count: PROTOCOLS.filter(p => p.category === 'application').length, color: 'text-emerald-400' },
  { id: 'iot', label: 'Internet of Things (IoT)', count: PROTOCOLS.filter(p => p.category === 'iot').length, color: 'text-amber-400' },
  { id: 'security', label: 'Security & Auth', count: PROTOCOLS.filter(p => p.category === 'security').length, color: 'text-rose-400' },
  { id: 'wireless', label: 'Wireless & Radio', count: PROTOCOLS.filter(p => p.category === 'wireless').length, color: 'text-cyan-400' },
  { id: 'cloud', label: 'Cloud & Messaging', count: PROTOCOLS.filter(p => p.category === 'cloud').length, color: 'text-purple-400' },
];
