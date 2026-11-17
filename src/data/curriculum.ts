export interface CurriculumLesson {
  /** Protocol slug, must exist in PROTOCOLS. */
  slug: string;
  /** One sentence explaining why this lesson sits at this point in the path. */
  why: string;
}

export interface CurriculumModule {
  id: string;
  title: string;
  summary: string;
  lessons: CurriculumLesson[];
  /** Optional supporting page for this module. */
  resource?: { label: string; href: string };
}

/**
 * The beginner on-ramp. Order matters: each module only relies on ideas
 * introduced earlier, and every slug is validated against the catalog in
 * tests along with its prerequisites.
 */
export const START_HERE_PATH: CurriculumModule[] = [
  {
    id: 'frames',
    title: '1. Bits, frames and addresses',
    summary: 'Start at the wire: how bits become frames, how frames find a neighbour, and how IP addresses describe a network.',
    lessons: [
      {
        slug: 'ethernet',
        why: 'Every protocol above this one assumes a frame can already move between two network cards.',
      },
      {
        slug: 'wifi',
        why: 'The same frame problem solved over radio, where you cannot hear while you transmit.',
      },
      {
        slug: 'ipv4',
        why: 'The addressing and forwarding model the internet was built on.',
      },
      {
        slug: 'arp',
        why: 'How a host turns an IP address into a MAC address on the local segment.',
      },
    ],
    resource: { label: 'See how the OSI and TCP/IP layers line up', href: '/layers' },
  },
  {
    id: 'conversations',
    title: '2. Conversations',
    summary: 'Two ways to move data between programs: fire-and-forget datagrams, or an ordered reliable stream.',
    lessons: [
      {
        slug: 'udp',
        why: 'The minimal datagram: no connection, no retransmission, no waiting.',
      },
      {
        slug: 'tcp',
        why: 'Ordered, reliable bytes built on top of an unreliable network.',
      },
    ],
    resource: { label: 'Compare TCP and UDP side by side', href: '/compare/tcp/udp' },
  },
  {
    id: 'finding-the-way',
    title: '3. Finding the way',
    summary: 'Devices need an address, a name service and a way to report problems before useful traffic can flow.',
    lessons: [
      {
        slug: 'dhcp',
        why: 'How a device gets an address before it can talk to anything else.',
      },
      {
        slug: 'dns',
        why: 'How names become addresses — the first lookup behind almost every connection.',
      },
      {
        slug: 'icmp',
        why: 'The control channel behind ping, traceroute and "destination unreachable".',
      },
    ],
    resource: { label: 'Try a real DNS lookup', href: '/protocols/dns' },
  },
  {
    id: 'web',
    title: '4. The web and its lock',
    summary: 'The request/response model that carries the web, and the encryption layer that makes it safe to use.',
    lessons: [
      {
        slug: 'http',
        why: 'Methods, status codes, headers and the keep-alive connection model.',
      },
      {
        slug: 'tls',
        why: 'Turning an open byte stream into an authenticated, encrypted channel.',
      },
    ],
    resource: { label: 'Send a request against the local echo endpoint', href: '/protocols/http' },
  },
  {
    id: 'scale',
    title: '5. Networks at scale',
    summary: 'How separate networks agree on routes, how addressing scales past 32 bits, and why clocks matter.',
    lessons: [
      {
        slug: 'ipv6',
        why: 'The same forwarding idea with 128-bit addresses and a simpler fixed header.',
      },
      {
        slug: 'ospf',
        why: 'How routers inside one organisation agree on a shortest-path tree.',
      },
      {
        slug: 'bgp',
        why: 'How independent networks agree on routes between each other.',
      },
      {
        slug: 'ntp',
        why: 'Why distributed systems need a shared clock, and how it is disciplined.',
      },
    ],
    resource: { label: 'Check your knowledge across all modules', href: '/quiz' },
  },
];

export function curriculumSlugs(): string[] {
  return START_HERE_PATH.flatMap((module) => module.lessons.map((lesson) => lesson.slug));
}
