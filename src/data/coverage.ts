import { PROTOCOLS } from '@/data/protocols';

export type ProtocolTier = 'core' | 'professional' | 'reference';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface ProtocolCoverage {
  tier: ProtocolTier;
  difficulty: Difficulty;
  /** Slugs that are worth reading first. Must already exist in the catalog. */
  prerequisites: string[];
  /** Date of the last content review, ISO 8601. */
  lastReviewed: string;
}

export interface TierMeta {
  id: ProtocolTier;
  label: string;
  shortLabel: string;
  description: string;
  /** How many entries this tier should hold when the catalog is complete. */
  target: number;
}

export const TIER_ORDER: ProtocolTier[] = ['core', 'professional', 'reference'];

export const TIER_META: TierMeta[] = [
  {
    id: 'core',
    label: 'Core study',
    shortLabel: 'Core',
    description:
      'The protocols every networking beginner should meet first, with a full guided walkthrough and the on-ramp to everything else.',
    target: 20,
  },
  {
    id: 'professional',
    label: 'Professional working knowledge',
    shortLabel: 'Professional',
    description:
      'Protocols you are expected to recognise and reason about on the job, including the trade-offs that decide real deployments.',
    target: 60,
  },
  {
    id: 'reference',
    label: 'Reference registry',
    shortLabel: 'Reference',
    description:
      'Compact cards for narrower or legacy standards: what it is, where it lives in the stack, and the official specification. Reference, not a lesson.',
    target: 80,
  },
];

const REVIEWED = '2026-11-18';

function coverage(
  tier: ProtocolTier,
  difficulty: Difficulty,
  prerequisites: string[] = [],
): ProtocolCoverage {
  return { tier, difficulty, prerequisites, lastReviewed: REVIEWED };
}

/**
 * Tier, difficulty and prerequisite map for the catalog.
 *
 * Prerequisites describe the reading order, not a strict technical dependency:
 * you can understand DNS without knowing TCP first, but TCP makes the
 * transport behaviour clearer. The graph is validated in tests (no cycles).
 */
export const PROTOCOL_COVERAGE: Record<string, ProtocolCoverage> = {
  // Foundation
  ethernet: coverage('core', 'beginner'),
  ipv4: coverage('core', 'beginner', ['ethernet']),
  ipv6: coverage('core', 'intermediate', ['ipv4']),
  arp: coverage('core', 'beginner', ['ethernet', 'ipv4']),
  icmp: coverage('core', 'intermediate', ['ipv4']),
  udp: coverage('core', 'beginner', ['ipv4']),
  tcp: coverage('core', 'intermediate', ['ipv4']),
  dhcp: coverage('core', 'intermediate', ['ethernet', 'ipv4', 'udp']),
  dns: coverage('core', 'intermediate', ['udp', 'tcp']),
  http: coverage('core', 'beginner', ['tcp', 'dns']),
  tls: coverage('core', 'advanced', ['tcp']),
  wifi: coverage('core', 'beginner', ['ethernet']),

  // Routing, transport and time
  bgp: coverage('professional', 'advanced', ['tcp', 'ipv4']),
  ospf: coverage('professional', 'advanced', ['ipv4', 'ethernet']),
  ntp: coverage('professional', 'intermediate', ['udp']),
  quic: coverage('professional', 'advanced', ['udp', 'tls']),
  sctp: coverage('professional', 'advanced', ['ipv4']),

  // Application and web
  websocket: coverage('professional', 'intermediate', ['http']),
  ssh: coverage('professional', 'intermediate', ['tcp']),
  grpc: coverage('professional', 'advanced', ['http', 'tls']),
  snmp: coverage('professional', 'intermediate', ['udp']),
  smtp: coverage('professional', 'intermediate', ['tcp', 'dns']),
  ftp: coverage('professional', 'beginner', ['tcp']),
  sftp: coverage('professional', 'intermediate', ['ssh']),
  imap: coverage('professional', 'intermediate', ['tcp', 'tls']),
  pop3: coverage('professional', 'beginner', ['tcp']),
  ldap: coverage('professional', 'advanced', ['tcp', 'tls']),
  telnet: coverage('professional', 'beginner', ['tcp']),

  // IoT and industrial
  mqtt: coverage('professional', 'intermediate', ['tcp']),
  coap: coverage('professional', 'intermediate', ['udp']),
  zigbee: coverage('professional', 'advanced'),
  lorawan: coverage('professional', 'advanced'),
  matter: coverage('professional', 'advanced', ['ipv6', 'wifi']),
  modbus: coverage('professional', 'intermediate', ['tcp']),
  'opc-ua': coverage('professional', 'advanced', ['tcp', 'tls']),
  ble: coverage('professional', 'advanced'),
  zwave: coverage('professional', 'advanced'),
  canbus: coverage('professional', 'advanced'),
  bacnet: coverage('professional', 'advanced', ['udp', 'ipv4']),

  // Security and identity
  ipsec: coverage('professional', 'advanced', ['ipv4', 'ipv6']),
  wireguard: coverage('professional', 'advanced', ['udp', 'ipv4']),
  oauth2: coverage('professional', 'advanced', ['http', 'tls']),
  kerberos: coverage('professional', 'advanced', ['udp', 'tcp']),
  saml: coverage('professional', 'advanced', ['http', 'tls']),

  // Wireless and radio
  nfc: coverage('professional', 'intermediate'),
  '5g-nr': coverage('professional', 'advanced', ['ipv6']),

  // Cloud and event streaming
  amqp: coverage('professional', 'advanced', ['tcp', 'tls']),
  kafka: coverage('professional', 'advanced', ['tcp']),
  resp: coverage('professional', 'beginner', ['tcp']),
  webrtc: coverage('professional', 'advanced', ['udp', 'tls', 'http']),
  nats: coverage('professional', 'intermediate', ['tcp']),
  stomp: coverage('professional', 'intermediate', ['tcp']),

  // Second batch: core web, switching and naming lessons
  http2: coverage('core', 'intermediate', ['http', 'tcp']),
  http3: coverage('core', 'intermediate', ['http2', 'quic']),
  vlan: coverage('core', 'beginner', ['ethernet']),
  stp: coverage('core', 'intermediate', ['ethernet', 'vlan']),
  lacp: coverage('core', 'intermediate', ['ethernet']),
  lldp: coverage('core', 'beginner', ['ethernet']),
  igmp: coverage('core', 'intermediate', ['ipv4']),
  mdns: coverage('core', 'beginner', ['dns', 'udp']),

  // Second batch: professional routing, security and application lessons
  rip: coverage('professional', 'intermediate', ['ipv4', 'udp']),
  isis: coverage('professional', 'advanced', ['ethernet']),
  vrrp: coverage('professional', 'intermediate', ['ipv4']),
  bfd: coverage('professional', 'intermediate', ['udp', 'ipv4']),
  vxlan: coverage('professional', 'advanced', ['udp', 'ethernet']),
  mpls: coverage('professional', 'advanced', ['ethernet', 'ipv4']),
  webdav: coverage('professional', 'intermediate', ['http']),
  acme: coverage('professional', 'advanced', ['http', 'tls']),
  oidc: coverage('professional', 'advanced', ['oauth2', 'http']),
  radius: coverage('professional', 'intermediate', ['udp']),
  dot1x: coverage('professional', 'advanced', ['ethernet']),
  dnssec: coverage('professional', 'advanced', ['dns']),
  spf: coverage('professional', 'intermediate', ['smtp', 'dns']),
  dkim: coverage('professional', 'intermediate', ['smtp', 'dns']),
  dmarc: coverage('professional', 'intermediate', ['spf', 'dkim']),
  rtp: coverage('professional', 'intermediate', ['udp']),
  sip: coverage('professional', 'advanced', ['udp', 'tcp', 'rtp']),
  nfs: coverage('professional', 'intermediate', ['tcp']),
  smb: coverage('professional', 'intermediate', ['tcp']),
  netconf: coverage('professional', 'advanced', ['ssh', 'tcp']),
};

export function getCoverage(slug: string): ProtocolCoverage | undefined {
  return PROTOCOL_COVERAGE[slug];
}

export function getTierMeta(tier: ProtocolTier): TierMeta {
  const meta = TIER_META.find((entry) => entry.id === tier);
  if (!meta) throw new Error(`Unknown coverage tier: ${tier}`);
  return meta;
}

export function countByTier(tier: ProtocolTier): number {
  return PROTOCOLS.filter((protocol) => PROTOCOL_COVERAGE[protocol.slug]?.tier === tier).length;
}

export function totalPlannedEntries(): number {
  return TIER_META.reduce((total, tier) => total + tier.target, 0);
}

export interface PlannedFamily {
  id: string;
  label: string;
  description: string;
  /** Examples of specific entries still to be written. */
  examples: string[];
  approximateEntries: number;
}

/**
 * Family targets for entries that do not have a full guided lesson. Some of
 * these are already published as reference cards on /reference; the rest are
 * still to be written.
 */
export const PLANNED_FAMILIES: PlannedFamily[] = [
  {
    id: 'routing-switching',
    label: 'Routing, switching & traffic engineering',
    description: 'Interior gateway protocols, first-hop redundancy, loop prevention and tunnelling underlays.',
    examples: ['RIP', 'IS-IS', 'EIGRP', 'VRRP', 'HSRP', 'STP / RSTP / MSTP', 'LACP', 'LLDP', 'MPLS & LDP', 'BFD', 'PIM', 'IGMP', 'VXLAN', 'GRE'],
    approximateEntries: 8,
  },
  {
    id: 'web-api',
    label: 'Web, API & document protocols',
    description: 'Versioned HTTP semantics, RPC styles and the document protocols that ride on HTTP.',
    examples: ['HTTP/2', 'HTTP/3', 'JSON-RPC', 'SOAP', 'GraphQL over HTTP', 'WebDAV', 'CalDAV', 'WebSub', 'CloudEvents'],
    approximateEntries: 6,
  },
  {
    id: 'security-identity',
    label: 'Security, identity & network access control',
    description: 'Certificate lifecycle, federated identity, 802.1X access control and DNSSEC.',
    examples: ['ACME', 'OpenID Connect', 'SCIM', 'RADIUS', 'TACACS+', '802.1X', 'EAP', 'DNSSEC', 'DoH', 'DoT', 'OCSP', 'WebAuthn / FIDO2'],
    approximateEntries: 10,
  },
  {
    id: 'email-messaging',
    label: 'Email & messaging standards',
    description: 'The anti-abuse and formatting standards that decide whether mail is delivered at all.',
    examples: ['SPF', 'DKIM', 'DMARC', 'MIME', 'XMPP', 'NNTP', 'SIP', 'MSRP'],
    approximateEntries: 5,
  },
  {
    id: 'real-time-media',
    label: 'Real-time media',
    description: 'Media transport, control and adaptive streaming.',
    examples: ['RTP', 'RTCP', 'RTSP', 'SRTP', 'HLS', 'MPEG-DASH'],
    approximateEntries: 5,
  },
  {
    id: 'telecom-mobile',
    label: 'Telecom & mobile core',
    description: 'Mobile signalling and the packet core behind 4G and 5G.',
    examples: ['Diameter', 'GTP-C / GTP-U', 'M3UA / SIGTRAN', 'NAS', 'NGAP', 'S1AP', 'SUCI'],
    approximateEntries: 6,
  },
  {
    id: 'storage',
    label: 'Storage & file systems',
    description: 'Block, file and object access protocols used by servers and SANs.',
    examples: ['NFS', 'SMB / CIFS', 'iSCSI', 'Fibre Channel', 'NVMe-oF', 'rsync'],
    approximateEntries: 6,
  },
  {
    id: 'industrial',
    label: 'Industrial & building automation',
    description: 'Fieldbus and building standards beyond Modbus, OPC-UA and BACnet.',
    examples: ['PROFINET', 'EtherCAT', 'PROFIBUS', 'DNP3', 'IEC 61850', 'EtherNet/IP', 'KNX', 'DALI', 'HART-IP', 'IO-Link'],
    approximateEntries: 10,
  },
  {
    id: 'management-observability',
    label: 'Management & observability',
    description: 'Model-driven configuration, telemetry export and flow accounting.',
    examples: ['NETCONF', 'RESTCONF', 'gNMI', 'YANG', 'syslog', 'NetFlow / IPFIX', 'sFlow', 'OTLP'],
    approximateEntries: 8,
  },
  {
    id: 'discovery',
    label: 'Discovery & local networking',
    description: 'How devices find each other on a LAN without a directory server.',
    examples: ['mDNS', 'DNS-SD', 'SSDP / UPnP', 'WS-Discovery', 'LLMNR', 'SLP'],
    approximateEntries: 5,
  },
  {
    id: 'tunnelling',
    label: 'Tunnelling & VPN',
    description: 'Encapsulation protocols that carry one network inside another.',
    examples: ['L2TP', 'OpenVPN', 'SSTP', 'IP-in-IP', 'SOCKS5', 'PPTP (legacy)'],
    approximateEntries: 6,
  },
  {
    id: 'legacy',
    label: 'Legacy & historical',
    description: 'Retired protocols still worth recognising when reading old captures and documentation.',
    examples: ['AppleTalk', 'IPX/SPX', 'NetBIOS', 'DECnet', 'X.25', 'Frame Relay', 'ATM', 'Token Ring'],
    approximateEntries: 5,
  },
];

export function coverageStatus() {
  const written = PROTOCOLS.length;
  const planned = totalPlannedEntries();
  return {
    written,
    planned,
    percent: planned > 0 ? Math.round((written / planned) * 100) : 0,
    lastReviewed: REVIEWED,
  };
}
