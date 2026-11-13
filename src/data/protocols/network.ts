import { Protocol } from '@/types/protocol';

export const NETWORK_PROTOCOLS: Protocol[] = [
  {
    id: 'dns',
    slug: 'dns',
    name: 'DNS',
    fullName: 'Domain Name System',
    category: 'network',
    osiLayer: 'Application',
    port: 53,
    rfc: 'RFC 1034, RFC 1035',
    yearIntroduced: 1983,
    shortSummary: 'The phonebook of the Internet. Resolves human-readable domain names into machine-readable IP addresses.',
    description: 'The Domain Name System (DNS) translates human-friendly hostnames like "google.com" into numerical IP addresses like "142.250.190.46", which computers use to identify each other on the network. Without DNS, users would need to memorize IP addresses for every website.',
    keyFeatures: [
      'Hierarchical, distributed database structure',
      'Uses UDP port 53 for standard queries and TCP for zone transfers/large responses',
      'Recursive vs. Iterative query resolution',
      'TTL (Time-To-Live) caching to reduce global network traffic'
    ],
    useCases: [
      'Web browser address resolution',
      'Mail server routing via MX records',
      'Service discovery via SRV records',
      'Domain ownership verification via TXT records'
    ],
    pros: [
      'Transparent to end-users',
      'Extensible with DNSSEC for cryptographically validated lookups',
      'Distributed resilience across 13 root server clusters globally'
    ],
    cons: [
      'Traditional DNS traffic is unencrypted (mitigated by DoH/DoT)',
      'Cache poisoning and DNS spoofing vulnerabilities if DNSSEC is absent',
      'Propagation delays when TTLs are set high'
    ],
    actors: [
      { id: 'client', label: 'Client Device', icon: 'Laptop', color: '#6366f1' },
      { id: 'resolver', label: 'Recursive Resolver', icon: 'Server', color: '#06b6d4' },
      { id: 'root', label: 'Root Nameserver (.)', icon: 'Globe', color: '#f59e0b' },
      { id: 'tld', label: 'TLD Nameserver (.com)', icon: 'Database', color: '#10b981' },
      { id: 'authoritative', label: 'Authoritative Server', icon: 'ShieldCheck', color: '#a855f7' }
    ],
    interactiveSteps: [
      {
        step: 1,
        title: 'User Requests Domain Name',
        description: 'You type "example.com" into your browser address bar. The browser and OS check their local DNS caches.',
        actorSource: 'client',
        actorTarget: 'resolver',
        explanation: 'If the IP address is not cached locally on your device, the OS sends a UDP query to your configured recursive resolver (e.g., 1.1.1.1 or 8.8.8.8).',
        packetInfo: {
          id: 'pkt-1',
          source: '192.168.1.104',
          destination: '8.8.8.8:53',
          type: 'DNS Query (UDP)',
          summary: 'Standard query 0x1a2b A example.com',
          payload: { transactionId: '0x1a2b', flags: 'Standard Query', queryType: 'A', name: 'example.com' }
        }
      },
      {
        step: 2,
        title: 'Querying Root Nameserver',
        description: 'The recursive resolver asks one of the 13 worldwide root server clusters (.) for the TLD.',
        actorSource: 'resolver',
        actorTarget: 'root',
        explanation: 'Root servers do not know the exact IP of "example.com", but they reply with the address of the .com TLD servers.',
        packetInfo: {
          id: 'pkt-2',
          source: '8.8.8.8',
          destination: '198.41.0.4:53 (Root)',
          type: 'DNS Referral',
          summary: 'Referral to .com TLD servers',
          payload: { referral: 'a.gtld-servers.net (192.5.6.30)' }
        }
      },
      {
        step: 3,
        title: 'Querying TLD Nameserver',
        description: 'The resolver contacts the .com TLD nameserver seeking the authoritative nameserver for "example.com".',
        actorSource: 'resolver',
        actorTarget: 'tld',
        explanation: 'The TLD server knows which authoritative name servers manage "example.com" and hands those NS records back to the resolver.',
        packetInfo: {
          id: 'pkt-3',
          source: '8.8.8.8',
          destination: '192.5.6.30:53 (TLD)',
          type: 'DNS Referral',
          summary: 'Referral to ns1.example.com',
          payload: { authNS: ['ns1.example.com'], ttl: 86400 }
        }
      },
      {
        step: 4,
        title: 'Querying Authoritative Nameserver',
        description: 'The resolver queries the authoritative nameserver which holds the official A record for "example.com".',
        actorSource: 'resolver',
        actorTarget: 'authoritative',
        explanation: 'The authoritative nameserver has the definitive record and replies with its actual IP address (93.184.216.34).',
        packetInfo: {
          id: 'pkt-4',
          source: '8.8.8.8',
          destination: '93.184.216.34:53',
          type: 'Authoritative Answer',
          summary: 'A record: 93.184.216.34 (TTL: 3600)',
          payload: { recordType: 'A', address: '93.184.216.34', ttl: 3600 }
        }
      },
      {
        step: 5,
        title: 'Response Returned & Cached',
        description: 'The resolver caches the IP address and forwards the final answer back to the client device.',
        actorSource: 'resolver',
        actorTarget: 'client',
        explanation: 'The client receives the IP 93.184.216.34, saves it locally, and begins establishing a TCP connection.',
        packetInfo: {
          id: 'pkt-5',
          source: '8.8.8.8:53',
          destination: '192.168.1.104',
          type: 'DNS Response',
          summary: 'Standard query response 0x1a2b A 93.184.216.34',
          payload: { status: 'NOERROR', answers: ['93.184.216.34'], responseTimeMs: 18 }
        }
      }
    ],
    liveSandboxType: 'dns-resolver',
    quiz: [
      {
        id: 'dns-q1',
        question: 'Which DNS record type maps a domain name directly to an IPv4 address?',
        options: ['AAAA record', 'A record', 'CNAME record', 'MX record'],
        correctAnswer: 1,
        explanation: 'An A record maps a hostname to an IPv4 address, whereas an AAAA record maps to an IPv6 address.'
      }
    ]
  },
  {
    id: 'ipv4',
    slug: 'ipv4',
    name: 'IPv4',
    fullName: 'Internet Protocol version 4',
    category: 'network',
    osiLayer: 'Network',
    port: 'N/A (Layer 3)',
    rfc: 'RFC 791',
    yearIntroduced: 1981,
    shortSummary: 'The dominant packet routing protocol providing 32-bit logical addressing across global interconnected networks.',
    description: 'IPv4 is the fourth version of the Internet Protocol and one of the core protocols of standards-based internetworking methods. It routes packets across network boundaries using 32-bit addresses formatted as dotted-decimal notation (e.g. 192.0.2.1).',
    keyFeatures: [
      '32-bit address space yielding ~4.29 billion unique addresses',
      'Best-effort, connectionless packet delivery',
      'Packet fragmentation and reassembly mechanism',
      'Time-To-Live (TTL) hop count preventing infinite routing loops'
    ],
    useCases: ['Global Internet packet routing', 'Enterprise LAN addressing', 'VPN tunneling'],
    pros: ['Ubiquitous universal hardware & software compatibility', 'Well-understood routing architectures'],
    cons: ['Address exhaustion requires NAT workarounds', 'No built-in encryption (requires IPSec)'],
    actors: [
      { id: 'hostA', label: 'Source Host', icon: 'Laptop', color: '#6366f1' },
      { id: 'router1', label: 'Gateway Router', icon: 'Network', color: '#06b6d4' },
      { id: 'hostB', label: 'Destination Host', icon: 'Server', color: '#10b981' }
    ],
    interactiveSteps: [
      {
        step: 1,
        title: 'Packet Construction & Header Encapsulation',
        description: 'Source host prepares payload, sets TTL=64, Protocol=6 (TCP), and Source/Destination IPs.',
        actorSource: 'hostA',
        actorTarget: 'router1',
        explanation: 'The IP layer adds a 20-byte IPv4 header containing version (4), IHL (5), total length, identification, flags, TTL, protocol, header checksum, and IP addresses.',
        packetInfo: {
          id: 'ipv4-pkt-1',
          source: '192.168.1.10',
          destination: '142.250.190.46',
          type: 'IPv4 Datagram',
          summary: 'Version 4, Len=60, TTL=64, Protocol=TCP',
          payload: { version: 4, ihl: 5, ttl: 64, protocol: 'TCP (6)', checksum: '0x3a4b' }
        }
      },
      {
        step: 2,
        title: 'Router Inspection & TTL Decrement',
        description: 'Router checks routing table, decrements TTL to 63, recalculates header checksum, and forwards.',
        actorSource: 'router1',
        actorTarget: 'hostB',
        explanation: 'If TTL hits 0, the router drops the packet and responds with an ICMP Time Exceeded message.',
        packetInfo: {
          id: 'ipv4-pkt-2',
          source: 'Router Outbound',
          destination: '142.250.190.46',
          type: 'IPv4 Forward',
          summary: 'TTL decremented to 63, Checksum updated',
          payload: { ttl: 63, nextHop: '142.250.190.46' }
        }
      }
    ],
    liveSandboxType: 'generic-simulator',
    quiz: [
      {
        id: 'ipv4-q1',
        question: 'How many bits are in an IPv4 address?',
        options: ['16 bits', '32 bits', '64 bits', '128 bits'],
        correctAnswer: 1,
        explanation: 'IPv4 addresses are 32 bits long, typically divided into four 8-bit octets.'
      }
    ]
  },
  {
    id: 'ipv6',
    slug: 'ipv6',
    name: 'IPv6',
    fullName: 'Internet Protocol version 6',
    category: 'network',
    osiLayer: 'Network',
    port: 'N/A (Layer 3)',
    rfc: 'RFC 8200',
    yearIntroduced: 1998,
    shortSummary: 'Next-generation IP protocol offering a massive 128-bit address space, stateless auto-configuration, and simplified headers.',
    description: 'IPv6 was designed by the IETF to replace IPv4. With 128-bit addresses (approx. 3.4 x 10^38 unique addresses), IPv6 eliminates the need for Network Address Translation (NAT) and enables true end-to-end connectivity for billions of IoT and computing devices.',
    keyFeatures: [
      '128-bit hexadecimal addressing (e.g. 2001:0db8:85a3::8a2e:0370:7334)',
      'Fixed 40-byte base header for faster hardware processing',
      'Stateless Address Autoconfiguration (SLAAC)',
      'Eliminated broadcast traffic in favor of efficient multicast'
    ],
    useCases: ['Mobile carrier 5G/LTE networks', 'Massive IoT device addressing', 'Modern cloud infrastructure'],
    pros: ['Virtually infinite address supply', 'Built-in support for IPSec', 'Simplified routing headers'],
    cons: ['Incompatible with pure IPv4 without dual-stack or NAT64 transition mechanisms'],
    actors: [
      { id: 'node', label: 'IPv6 IoT Device', icon: 'Cpu', color: '#10b981' },
      { id: 'router', label: 'IPv6 Gateway', icon: 'Network', color: '#6366f1' }
    ],
    interactiveSteps: [
      {
        step: 1,
        title: 'Router Solicitation (RS)',
        description: 'New node boots up and sends an ICMPv6 Router Solicitation to the all-routers multicast address (ff02::2).',
        actorSource: 'node',
        actorTarget: 'router',
        explanation: 'Node uses link-local address (fe80::) to ask routers on the segment for network prefix configuration.',
        packetInfo: {
          id: 'ipv6-pkt-1',
          source: 'fe80::1a2b:3c4d:5e6f',
          destination: 'ff02::2 (All Routers Multicast)',
          type: 'ICMPv6 (Type 133)',
          summary: 'Router Solicitation',
          payload: { nextHeader: 'ICMPv6 (58)', hopLimit: 255 }
        }
      },
      {
        step: 2,
        title: 'Router Advertisement & SLAAC Auto-Config',
        description: 'Router responds with prefix (2001:db8:1::/64). Device automatically creates its global IP address.',
        actorSource: 'router',
        actorTarget: 'node',
        explanation: 'SLAAC eliminates the requirement for a DHCP server for basic network connectivity.',
        packetInfo: {
          id: 'ipv6-pkt-2',
          source: 'fe80::1',
          destination: 'ff02::1 (All Nodes)',
          type: 'ICMPv6 (Type 134)',
          summary: 'Router Advertisement: Prefix 2001:db8:1::/64',
          payload: { prefix: '2001:db8:1::/64', validLifetime: 86400 }
        }
      }
    ],
    liveSandboxType: 'generic-simulator',
    quiz: [
      {
        id: 'ipv6-q1',
        question: 'What is the bit length of an IPv6 address?',
        options: ['32 bits', '64 bits', '128 bits', '256 bits'],
        correctAnswer: 2,
        explanation: 'IPv6 uses 128-bit addresses, written in 8 groups of 4 hexadecimal digits.'
      }
    ]
  },
  {
    id: 'icmp',
    slug: 'icmp',
    name: 'ICMP',
    fullName: 'Internet Control Message Protocol',
    category: 'network',
    osiLayer: 'Network',
    port: 'N/A (Layer 3)',
    rfc: 'RFC 792',
    yearIntroduced: 1981,
    shortSummary: 'Supporting protocol used by network devices to send error messages and operational information (powers ping and traceroute).',
    description: 'ICMP is part of the Internet protocol suite used by network devices, like routers, to communicate network issues (e.g. Destination Host Unreachable, Time Exceeded) and diagnostic data (Echo Request/Reply for ping).',
    keyFeatures: [
      'Error reporting for undeliverable IP datagrams',
      'Diagnostic Echo Request (Type 8) and Echo Reply (Type 0)',
      'Time Exceeded (Type 11) for TTL expiration analysis in traceroute',
      'Redirect messages for routing path optimization'
    ],
    useCases: ['Network latency testing (Ping)', 'Path discovery & hop analysis (Traceroute)', 'MTU path discovery'],
    pros: ['Essential for diagnosing network outages and measuring round-trip latency'],
    cons: ['Can be weaponized for Ping of Death and ICMP flood denial-of-service attacks'],
    actors: [
      { id: 'client', label: 'Admin Terminal', icon: 'Laptop', color: '#6366f1' },
      { id: 'target', label: 'Remote Server', icon: 'Server', color: '#10b981' }
    ],
    interactiveSteps: [
      {
        step: 1,
        title: 'ICMP Echo Request (Ping)',
        description: 'Client terminal issues `ping 8.8.8.8`. OS transmits ICMP Type 8 Code 0 packet.',
        actorSource: 'client',
        actorTarget: 'target',
        explanation: 'Packet includes sequence number and timestamp in data payload to calculate exact round-trip latency.',
        packetInfo: {
          id: 'icmp-pkt-1',
          source: '192.168.1.50',
          destination: '8.8.8.8',
          type: 'ICMP Echo Request',
          summary: 'Type=8, Code=0, Seq=1, ID=0x4a12',
          payload: { type: 8, code: 0, sequence: 1, identifier: '0x4a12' }
        }
      },
      {
        step: 2,
        title: 'ICMP Echo Reply (Pong)',
        description: 'Remote host receives request and immediately echoes the exact payload back as Type 0 Code 0.',
        actorSource: 'target',
        actorTarget: 'client',
        explanation: 'Client subtracts original timestamp from arrival time to display "time=14.2 ms".',
        packetInfo: {
          id: 'icmp-pkt-2',
          source: '8.8.8.8',
          destination: '192.168.1.50',
          type: 'ICMP Echo Reply',
          summary: 'Type=0, Code=0, Seq=1, RTT=14ms',
          payload: { type: 0, code: 0, sequence: 1, rttMs: 14 }
        }
      }
    ],
    liveSandboxType: 'generic-simulator',
    quiz: [
      {
        id: 'icmp-q1',
        question: 'What ICMP Type code represents an Echo Request (Ping)?',
        options: ['Type 0', 'Type 3', 'Type 8', 'Type 11'],
        correctAnswer: 2,
        explanation: 'ICMP Type 8 represents an Echo Request, and Type 0 represents the Echo Reply.'
      }
    ]
  },
  {
    id: 'arp',
    slug: 'arp',
    name: 'ARP',
    fullName: 'Address Resolution Protocol',
    category: 'network',
    osiLayer: 'Data Link',
    port: 'N/A (Layer 2)',
    rfc: 'RFC 826',
    yearIntroduced: 1982,
    shortSummary: 'Maps dynamic IP network addresses to physical MAC hardware addresses on a local subnet.',
    description: 'When device A wants to talk to device B on the same local network, it knows B\'s IP address, but network switches and Ethernet cards only deliver frames using physical MAC addresses. ARP bridges this gap by broadcasting a query: "Who has IP X? Tell IP Y".',
    keyFeatures: [
      'Layer 2 broadcast request (FF:FF:FF:FF:FF:FF) and unicast reply',
      'Local ARP cache table with timeout entries',
      'Gratuitous ARP for IP conflict detection',
      'Hardware and protocol address length mapping'
    ],
    useCases: ['LAN frame delivery', 'Default gateway MAC resolution', 'Virtual IP failover'],
    pros: ['Completely automatic and transparent to operating systems'],
    cons: ['Vulnerable to ARP spoofing/poisoning without dynamic ARP inspection (DAI)'],
    actors: [
      { id: 'hostA', label: 'Host A (192.168.1.10)', icon: 'Laptop', color: '#6366f1' },
      { id: 'broadcast', label: 'Local LAN (Broadcast)', icon: 'Network', color: '#f59e0b' },
      { id: 'hostB', label: 'Host B (192.168.1.20)', icon: 'Server', color: '#10b981' }
    ],
    interactiveSteps: [
      {
        step: 1,
        title: 'ARP Request (Broadcast)',
        description: 'Host A broadcasts an Ethernet frame asking who owns 192.168.1.20.',
        actorSource: 'hostA',
        actorTarget: 'broadcast',
        explanation: 'Target MAC is set to FF:FF:FF:FF:FF:FF so every machine on the switch receives and examines the frame.',
        packetInfo: {
          id: 'arp-pkt-1',
          source: 'aa:bb:cc:11:22:33',
          destination: 'ff:ff:ff:ff:ff:ff',
          type: 'ARP Request (Broadcast)',
          summary: 'Who has 192.168.1.20? Tell 192.168.1.10',
          payload: { senderIp: '192.168.1.10', targetIp: '192.168.1.20' }
        }
      },
      {
        step: 2,
        title: 'ARP Reply (Unicast)',
        description: 'Only Host B recognizes its own IP and replies directly to Host A with its hardware MAC address.',
        actorSource: 'hostB',
        actorTarget: 'hostA',
        explanation: 'Host B sends a unicast reply: "192.168.1.20 is at dd:ee:ff:44:55:66". Both hosts update their local ARP caches.',
        packetInfo: {
          id: 'arp-pkt-2',
          source: 'dd:ee:ff:44:55:66',
          destination: 'aa:bb:cc:11:22:33',
          type: 'ARP Reply (Unicast)',
          summary: '192.168.1.20 is at dd:ee:ff:44:55:66',
          payload: { senderMac: 'dd:ee:ff:44:55:66', senderIp: '192.168.1.20' }
        }
      }
    ],
    liveSandboxType: 'generic-simulator',
    quiz: [
      {
        id: 'arp-q1',
        question: 'What destination MAC address is used in an ARP Request frame to reach all devices on a subnet?',
        options: ['00:00:00:00:00:00', 'FF:FF:FF:FF:FF:FF', '255.255.255.255', 'AA:BB:CC:DD:EE:FF'],
        correctAnswer: 1,
        explanation: 'FF:FF:FF:FF:FF:FF is the Ethernet Layer 2 broadcast MAC address.'
      }
    ]
  },
  {
    id: 'dhcp',
    slug: 'dhcp',
    name: 'DHCP',
    fullName: 'Dynamic Host Configuration Protocol',
    category: 'network',
    osiLayer: 'Application',
    port: '67 / 68',
    rfc: 'RFC 2131',
    yearIntroduced: 1993,
    shortSummary: 'Automates IP address assignment, subnet masks, default gateways, and DNS servers to client devices.',
    description: 'DHCP automatically assigns IP addresses and other communication parameters to devices joining a network via the 4-step DORA process (Discover, Offer, Request, Acknowledge).',
    keyFeatures: [
      '4-step DORA handshake: Discover, Offer, Request, Acknowledge',
      'Lease-based address pool allocation',
      'Distribution of gateway routers, subnet masks, and DNS resolvers',
      'MAC address reservation for static device addressing'
    ],
    useCases: ['Home Wi-Fi plug-and-play network access', 'Corporate office laptop subnet management', 'Virtual machine IP leasing'],
    pros: ['Eliminates manual IP configuration conflicts', 'Efficient reuse of limited IP addresses via leases'],
    cons: ['Rogue DHCP servers can perform Man-In-The-Middle attacks (mitigated by DHCP snooping)'],
    actors: [
      { id: 'client', label: 'Client (No IP)', icon: 'Laptop', color: '#6366f1' },
      { id: 'dhcpServer', label: 'DHCP Server', icon: 'Server', color: '#10b981' }
    ],
    interactiveSteps: [
      {
        step: 1,
        title: 'DHCP Discover (Broadcast)',
        description: 'New client boots without an IP and broadcasts a UDP packet to port 67 asking for an IP address.',
        actorSource: 'client',
        actorTarget: 'dhcpServer',
        explanation: 'Source IP is 0.0.0.0 and destination is 255.255.255.255 (Layer 2 broadcast).',
        packetInfo: {
          id: 'dhcp-pkt-1',
          source: '0.0.0.0:68',
          destination: '255.255.255.255:67',
          type: 'DHCP DISCOVER',
          summary: 'Client requesting IP assignment',
          payload: { xid: '0x39a2c10b', clientMac: '00:1e:67:89:ab:cd' }
        }
      },
      {
        step: 2,
        title: 'DHCP Offer',
        description: 'DHCP Server reserves an available IP and replies with an offer including lease duration.',
        actorSource: 'dhcpServer',
        actorTarget: 'client',
        explanation: 'Offers IP 192.168.1.150, Subnet 255.255.255.0, Gateway 192.168.1.1, DNS 1.1.1.1, and Lease 86400s.',
        packetInfo: {
          id: 'dhcp-pkt-2',
          source: '192.168.1.1:67',
          destination: '255.255.255.255:68',
          type: 'DHCP OFFER',
          summary: 'Offered IP: 192.168.1.150 (Lease 24h)',
          payload: { offeredIp: '192.168.1.150', router: '192.168.1.1', dns: ['1.1.1.1'] }
        }
      },
      {
        step: 3,
        title: 'DHCP Request',
        description: 'Client formally requests the offered IP address so other potential DHCP servers know it was accepted.',
        actorSource: 'client',
        actorTarget: 'dhcpServer',
        explanation: 'Broadcasts acceptance of 192.168.1.150 from server 192.168.1.1.',
        packetInfo: {
          id: 'dhcp-pkt-3',
          source: '0.0.0.0:68',
          destination: '255.255.255.255:67',
          type: 'DHCP REQUEST',
          summary: 'Client accepting 192.168.1.150',
          payload: { requestedIp: '192.168.1.150', serverId: '192.168.1.1' }
        }
      },
      {
        step: 4,
        title: 'DHCP ACK (Acknowledgment)',
        description: 'Server confirms the lease. Client configures its network interface and begins internet communication.',
        actorSource: 'dhcpServer',
        actorTarget: 'client',
        explanation: 'The IP lease is committed to the server database.',
        packetInfo: {
          id: 'dhcp-pkt-4',
          source: '192.168.1.1:67',
          destination: '192.168.1.150:68',
          type: 'DHCP ACK',
          summary: 'IP lease committed: 192.168.1.150',
          payload: { assignedIp: '192.168.1.150', leaseDurationSeconds: 86400 }
        }
      }
    ],
    liveSandboxType: 'generic-simulator',
    quiz: [
      {
        id: 'dhcp-q1',
        question: 'What acronym represents the 4-packet exchange of standard DHCP address assignment?',
        options: ['ACID', 'DORA', 'REST', 'CRUD'],
        correctAnswer: 1,
        explanation: 'DORA stands for Discover, Offer, Request, and Acknowledge.'
      }
    ]
  },
  {
    id: 'bgp',
    slug: 'bgp',
    name: 'BGP',
    fullName: 'Border Gateway Protocol',
    category: 'network',
    osiLayer: 'Application',
    port: 179,
    rfc: 'RFC 4271',
    yearIntroduced: 1989,
    shortSummary: 'The routing protocol that binds the global Internet together by directing traffic between Autonomous Systems (AS).',
    description: 'BGP is the postal service of the Internet. When traffic travels across different Internet Service Providers (ISPs), BGP evaluates all paths and determines the most efficient route using Autonomous System Paths (AS_PATH).',
    keyFeatures: [
      'Path-vector routing algorithm',
      'Runs over reliable TCP port 179',
      'Inter-domain Autonomous System (AS) policy routing',
      'eBGP (external) vs iBGP (internal) peering'
    ],
    useCases: ['Internet core routing between ISPs', 'Multi-homed enterprise network load-balancing', 'Anycast CDN traffic steering'],
    pros: ['Scales to global Internet routing tables (>900,000 routes)', 'Granular administrative route policy control'],
    cons: ['Slow route convergence times', 'Vulnerable to BGP route hijacking without RPKI route origin validation'],
    actors: [
      { id: 'as1', label: 'ISP Alpha (AS 15169)', icon: 'Globe', color: '#6366f1' },
      { id: 'as2', label: 'ISP Bravo (AS 13335)', icon: 'Server', color: '#10b981' }
    ],
    interactiveSteps: [
      {
        step: 1,
        title: 'BGP OPEN Message',
        description: 'Two BGP peers establish a TCP connection on port 179 and exchange OPEN messages with their AS numbers.',
        actorSource: 'as1',
        actorTarget: 'as2',
        explanation: 'Peers exchange BGP version (4), Autonomous System number (ASN), and Hold Time interval (180s).',
        packetInfo: {
          id: 'bgp-pkt-1',
          source: '198.51.100.1:179',
          destination: '198.51.100.2:179',
          type: 'BGP OPEN',
          summary: 'My ASN: 15169 | Hold Time: 180s',
          payload: { version: 4, myAsn: 15169, holdTime: 180, bgpIdentifier: '198.51.100.1' }
        }
      },
      {
        step: 2,
        title: 'BGP UPDATE (Route Advertisement)',
        description: 'Peer announces reachable IP prefixes along with path attributes like AS_PATH and NEXT_HOP.',
        actorSource: 'as2',
        actorTarget: 'as1',
        explanation: 'AS 13335 advertises prefix 1.1.1.0/24 with AS_PATH [13335].',
        packetInfo: {
          id: 'bgp-pkt-2',
          source: '198.51.100.2:179',
          destination: '198.51.100.1:179',
          type: 'BGP UPDATE',
          summary: 'Prefix: 1.1.1.0/24 | AS_PATH: [13335]',
          payload: { nlri: ['1.1.1.0/24'], asPath: [13335], nextHop: '198.51.100.2' }
        }
      }
    ],
    liveSandboxType: 'generic-simulator',
    quiz: [
      {
        id: 'bgp-q1',
        question: 'What underlying transport layer protocol and port does BGP use?',
        options: ['UDP port 53', 'TCP port 179', 'SCTP port 3868', 'IP protocol 89'],
        correctAnswer: 1,
        explanation: 'BGP establishes peer connections over TCP port 179 to ensure reliable packet delivery of route updates.'
      }
    ]
  },
  {
    id: 'ospf',
    slug: 'ospf',
    name: 'OSPF',
    fullName: 'Open Shortest Path First',
    category: 'network',
    osiLayer: 'Network',
    port: 'IP Protocol 89',
    rfc: 'RFC 2328',
    yearIntroduced: 1989,
    shortSummary: 'Interior gateway routing protocol using Dijkstra algorithm to compute the shortest loop-free network paths.',
    description: 'OSPF is a link-state routing protocol used within an internal corporate or campus network (Interior Gateway). Routers build a complete topology map of the network and run Dijkstra shortest path first algorithm to determine optimal forwarding paths.',
    keyFeatures: [
      'Link-state database (LSDB) synchronization',
      'Dijkstra Shortest Path First (SPF) calculation',
      'Hierarchical area design (Area 0 backbone)',
      'Fast convergence and loop-free routing'
    ],
    useCases: ['Enterprise campus core routing', 'Data center spine-and-leaf internal routing'],
    pros: ['Rapid convergence when links change', 'Supports Equal-Cost Multi-Path (ECMP)'],
    cons: ['High memory and CPU overhead for large single-area link-state databases'],
    actors: [
      { id: 'r1', label: 'Router 1 (Area 0)', icon: 'Network', color: '#6366f1' },
      { id: 'r2', label: 'Router 2 (Area 0)', icon: 'Network', color: '#10b981' }
    ],
    interactiveSteps: [
      {
        step: 1,
        title: 'OSPF Hello Packet Exchange',
        description: 'Routers discover neighbors by sending periodic Hello packets to multicast address 224.0.0.5.',
        actorSource: 'r1',
        actorTarget: 'r2',
        explanation: 'Routers verify matching Area IDs, Hello/Dead intervals, and authentication to form adjacency.',
        packetInfo: {
          id: 'ospf-pkt-1',
          source: '10.0.0.1',
          destination: '224.0.0.5 (AllSPFRouters)',
          type: 'OSPF Hello',
          summary: 'RouterID: 1.1.1.1, Area: 0.0.0.0',
          payload: { routerId: '1.1.1.1', areaId: '0.0.0.0', helloInterval: 10, deadInterval: 40 }
        }
      },
      {
        step: 2,
        title: 'Link State Update (LSU / LSA)',
        description: 'Routers exchange Link State Advertisements (LSAs) containing connected interfaces and link costs.',
        actorSource: 'r2',
        actorTarget: 'r1',
        explanation: 'Each router updates its Link State Database and computes the shortest path tree using Dijkstra algorithm.',
        packetInfo: {
          id: 'ospf-pkt-2',
          source: '10.0.0.2',
          destination: '224.0.0.5',
          type: 'OSPF LSU (Link State Update)',
          summary: 'LSA Type 1 (Router LSA) Cost=10',
          payload: { lsaType: 'Router LSA', linkId: '10.0.2.0', metricCost: 10 }
        }
      }
    ],
    liveSandboxType: 'generic-simulator',
    quiz: [
      {
        id: 'ospf-q1',
        question: 'What mathematical algorithm does OSPF use to calculate the shortest path tree?',
        options: ['Bellman-Ford algorithm', 'Dijkstra algorithm', 'Floyd-Warshall algorithm', 'Kruskal algorithm'],
        correctAnswer: 1,
        explanation: 'OSPF uses Dijkstra Shortest Path First (SPF) algorithm to calculate loop-free lowest-cost paths.'
      }
    ]
  },
  {
    id: 'ntp',
    slug: 'ntp',
    name: 'NTP',
    fullName: 'Network Time Protocol',
    category: 'network',
    osiLayer: 'Application',
    port: 123,
    rfc: 'RFC 5905',
    yearIntroduced: 1985,
    shortSummary: 'Synchronizes computer clocks over variable-latency packet-switched networks to millisecond precision.',
    description: 'NTP synchronizes computer system clocks to coordinated universal time (UTC) across variable latency IP networks using a hierarchical system of time sources called clock strata (Stratum 0 atomic clocks down to Stratum 3 servers).',
    keyFeatures: [
      'Hierarchical stratum clock model (Stratum 0 to 15)',
      'Uses UDP port 123',
      'Jitter and network delay jitter compensation filters',
      'Slews clock frequency smoothly without sudden time jumps'
    ],
    useCases: ['Financial transaction timestamping', 'Distributed database log ordering', 'TLS certificate validity checks'],
    pros: ['Sub-millisecond accuracy over local LANs', 'Robust against packet jitter'],
    cons: ['Unauthenticated NTP is vulnerable to amplification denial-of-service attacks'],
    actors: [
      { id: 'client', label: 'Local Server', icon: 'Server', color: '#6366f1' },
      { id: 'stratum1', label: 'Stratum 1 Time Server', icon: 'Clock', color: '#10b981' }
    ],
    interactiveSteps: [
      {
        step: 1,
        title: 'Client Transmits NTP Request',
        description: 'Client records local departure timestamp (T1) and sends a UDP packet to NTP server on port 123.',
        actorSource: 'client',
        actorTarget: 'stratum1',
        explanation: 'Timestamp T1 is embedded into the originate timestamp field.',
        packetInfo: {
          id: 'ntp-pkt-1',
          source: '192.168.1.50:123',
          destination: 'time.google.com:123',
          type: 'NTP Client Request',
          summary: 'Mode: 3 (Client), Originate Time: T1',
          payload: { leap: 0, version: 4, mode: 3, stratum: 0, t1: '1699900000.123456' }
        }
      },
      {
        step: 2,
        title: 'Server Timestamps & Replies',
        description: 'Server notes arrival time (T2), adds departure time (T3), and returns the packet.',
        actorSource: 'stratum1',
        actorTarget: 'client',
        explanation: 'Client receives packet at T4, and computes clock offset = ((T2 - T1) + (T3 - T4)) / 2.',
        packetInfo: {
          id: 'ntp-pkt-2',
          source: 'time.google.com:123',
          destination: '192.168.1.50:123',
          type: 'NTP Server Reply',
          summary: 'Stratum 1 (GPS Atomic Clock) Offset: -2.3ms',
          payload: { stratum: 1, referenceId: 'GPS', offsetMs: -2.3, roundTripMs: 18.4 }
        }
      }
    ],
    liveSandboxType: 'generic-simulator',
    quiz: [
      {
        id: 'ntp-q1',
        question: 'Which stratum level in NTP represents atomic clocks, GPS, or radio clocks directly attached to time servers?',
        options: ['Stratum 0', 'Stratum 1', 'Stratum 2', 'Stratum 16'],
        correctAnswer: 0,
        explanation: 'Stratum 0 devices are high-precision reference timekeeping devices like atomic clocks or GPS receivers.'
      }
    ]
  }
];

