import { Protocol } from '@/types/protocol';

export const PROF_ROUTING_PROTOCOLS: Protocol[] = [
  {
    id: 'rip',
    slug: 'rip',
    name: 'RIP',
    fullName: 'Routing Information Protocol',
    category: 'network',
    osiLayer: 'Network',
    port: 520,
    rfc: 'RFC 2453',
    yearIntroduced: 1998,
    shortSummary: 'Distance-vector interior gateway protocol that measures reachability in hop counts and learns routes from neighbor gossip.',
    description: 'RIP is a distance-vector interior gateway protocol that measures reachability in hop counts rather than link cost. RIPv2 (RFC 2453) adds classless prefixes, a next-hop field, and MD5 authentication to the original design, and it caps usable paths at 15 hops because a metric of 16 is defined as unreachable.',
    keyFeatures: [
      'Distance-vector algorithm derived from the Bellman-Ford computation',
      'UDP port 520 with multicast updates to 224.0.0.9',
      'Maximum usable metric of 15 hops, with 16 meaning unreachable',
      'Classless prefixes, next-hop field, and MD5 authentication in RIPv2',
      'Loop prevention through split horizon, poison reverse, and hold-down timers'
    ],
    useCases: [
      'Small branch and campus networks with simple flat topologies',
      'Legacy equipment that supports no newer routing protocol',
      'Lab and certification practice for distance-vector concepts'
    ],
    pros: [
      'Very simple to configure and easy to reason about',
      'Low memory and CPU footprint on small routers'
    ],
    cons: [
      'Hop count ignores bandwidth and latency, so it can pick a slow path',
      'Slow convergence and a hard 15-hop diameter limit its scalability'
    ],
    actors: [
      { id: 'r1', label: 'Router A (RIPv2)', icon: 'Network', color: '#6366f1' },
      { id: 'r2', label: 'Router B (RIPv2)', icon: 'Network', color: '#10b981' }
    ],
    interactiveSteps: [
      {
        step: 1,
        title: 'RIP Request on Startup',
        description: 'Router A enables RIP and sends a Request message to the multicast group 224.0.0.9 asking every neighbor for its complete routing table.',
        actorSource: 'r1',
        actorTarget: 'r2',
        explanation: 'RIP runs over UDP port 520, so the Request is a small UDP datagram with command 1. Sending it to the multicast address reaches all RIP speakers on the segment in one packet instead of one unicast per neighbor.',
        packetInfo: {
          id: 'rip-pkt-1',
          source: '10.0.0.1:520',
          destination: '224.0.0.9:520',
          type: 'RIP Request (Command 1)',
          summary: 'Request the full routing table from all RIP neighbors',
          payload: { command: 1, version: 2, routeEntries: 0, addressFamily: 'Unspecified (0xFFFF)' }
        }
      },
      {
        step: 2,
        title: 'RIP Response with Route Entries',
        description: 'Router B answers with a Response message carrying up to 25 route entries, each holding a prefix, a next hop, and a hop-count metric.',
        actorSource: 'r2',
        actorTarget: 'r1',
        explanation: 'A single RIP datagram can hold at most 25 route entries so the message fits the classic 512-byte UDP payload limit. Router A installs 10.0.2.0/24 with metric 1, then adds its own hop when re-advertising it.',
        packetInfo: {
          id: 'rip-pkt-2',
          source: '10.0.0.2:520',
          destination: '224.0.0.9:520',
          type: 'RIP Response (Command 2)',
          summary: '10.0.2.0/24 via 10.0.0.2, metric 1',
          payload: { command: 2, version: 2, routeEntries: 1, prefix: '10.0.2.0/24', metric: 1, nextHop: '10.0.0.2' }
        }
      },
      {
        step: 3,
        title: 'Route Timeout and Poisoned Metric',
        description: 'Router B stops advertising, so after 180 seconds without an update Router A marks the route invalid and floods it onward with metric 16 before removing it 120 seconds later.',
        actorSource: 'r1',
        actorTarget: 'r2',
        explanation: 'RFC 2453 uses a 180-second timeout and a 120-second garbage-collection timer. Advertising the dead prefix with metric 16 (infinity) tells every neighbor to drop it immediately instead of waiting for its own timer to expire.',
        packetInfo: {
          id: 'rip-pkt-3',
          source: '10.0.0.1:520',
          destination: '224.0.0.9:520',
          type: 'RIP Response (Poisoned Route)',
          summary: '10.0.2.0/24 unreachable, metric 16',
          payload: { prefix: '10.0.2.0/24', metric: 16, infinityMetric: 16, timeoutSeconds: 180, garbageCollectionSeconds: 120 }
        }
      }
    ],
    liveSandboxType: 'generic-simulator',
    quiz: [
      {
        id: 'rip-q1',
        question: 'What is the longest usable path length in a RIP-routed network?',
        options: ['8 hops', '15 hops', '16 hops', '32 hops'],
        correctAnswer: 1,
        explanation: 'RIP defines 16 as infinity, so a destination may be at most 15 hops away and anything beyond that is considered unreachable.'
      },
      {
        id: 'rip-q2',
        question: 'Which transport does RIPv2 use to exchange its Request and Response messages?',
        options: ['TCP port 520', 'UDP port 520', 'UDP port 521', 'IP protocol 89'],
        correctAnswer: 1,
        explanation: 'RIPv2 sends each message as a single UDP datagram to port 520, using multicast 224.0.0.9 for normal updates.'
      }
    ]
  },
  {
    id: 'isis',
    slug: 'isis',
    name: 'IS-IS',
    fullName: 'Intermediate System to Intermediate System',
    category: 'network',
    osiLayer: 'Network',
    rfc: 'ISO/IEC 10589',
    yearIntroduced: 1992,
    shortSummary: 'Link-state interior gateway protocol that floods TLV-encoded topology data and runs directly inside Layer 2 frames.',
    description: 'IS-IS is a link-state interior gateway protocol originally built for the OSI CLNS stack and later extended to carry IPv4 and IPv6 reachability. Routers flood Link State PDUs until every node holds an identical database, then run Dijkstra SPF to compute shortest paths inside a Level 1 area or across the Level 2 backbone.',
    keyFeatures: [
      'Runs directly over Layer 2, so it needs no IP address or transport port of its own',
      'Two-level hierarchy: Level 1 intra-area routing and Level 2 inter-area backbone',
      'TLV encoding makes the protocol easy to extend with new address families and metrics',
      'A single Designated Intermediate System (DIS) per broadcast link, with no backup DIS',
      'Fast SPF convergence with partial route calculation for changed prefixes'
    ],
    useCases: [
      'Large service provider backbones that need fast, stable convergence',
      'Data center underlays that pair IS-IS with BGP for host routing',
      'Networks mixing OSI and IP addressing during migration'
    ],
    pros: [
      'Extremely stable and scalable in very large topologies',
      'TLV design accepts new capabilities without rewriting the base protocol',
      'Keeps working as a control plane even when IP addressing on a link is broken'
    ],
    cons: [
      'Configuration and troubleshooting assume familiarity with CLNS and NSAP addresses',
      'Far less common than OSPF in enterprises, so trained staff are harder to find'
    ],
    actors: [
      { id: 'r1', label: 'Level 1-2 Router', icon: 'Network', color: '#6366f1' },
      { id: 'r2', label: 'Level 2 Backbone Router', icon: 'Network', color: '#10b981' }
    ],
    interactiveSteps: [
      {
        step: 1,
        title: 'LAN Hello Elects the DIS',
        description: 'Router A multicasts a Level 1 LAN IS-IS Hello PDU and advertises its priority so the segment can elect a Designated Intermediate System.',
        actorSource: 'r1',
        actorTarget: 'r2',
        explanation: 'PDUs go to the multicast MAC address 01:80:C2:00:00:14 for Level 1 (01:80:C2:00:00:15 for Level 2), so no IP header is involved. The highest priority wins the DIS role, with the highest source MAC breaking a tie, and the DIS then owns pseudonode LSP generation for the link.',
        packetInfo: {
          id: 'isis-pkt-1',
          source: '00:11:22:33:44:55 (System ID 1921.6800.1001)',
          destination: '01:80:C2:00:00:14 (All Level 1 ISs)',
          type: 'IS-IS Level 1 LAN IIH',
          summary: 'Hello with priority 64, holding timer 30s',
          payload: { pduType: 'L1 LAN IIH', priority: 64, holdingTimerSeconds: 30, systemId: '1921.6800.1001', areaAddress: '49.0001' }
        }
      },
      {
        step: 2,
        title: 'Link State PDU Flooding',
        description: 'Router B floods a Link State PDU describing its neighbors and attached IP prefixes, and Router A stores it in its link-state database.',
        actorSource: 'r2',
        actorTarget: 'r1',
        explanation: 'Each LSP is identified by a system ID plus pseudonode and fragment numbers and is versioned by a sequence number. Flooding only replaces an older copy when the received LSP has a higher sequence number, a longer remaining lifetime, or a better checksum, which stops stale information from looping.',
        packetInfo: {
          id: 'isis-pkt-2',
          source: '1921.6800.2002.00-01',
          destination: '01:80:C2:00:00:14 (All Level 1 ISs)',
          type: 'IS-IS LSP (Link State PDU)',
          summary: 'LSP 1921.6800.2002.00-01, sequence 0x00000005',
          payload: { lspId: '1921.6800.2002.00-01', sequenceNumber: '0x00000005', remainingLifetimeSeconds: 1198, tlvs: ['Extended IS Reachability (22)', 'IPv4 Interface Address (6)'] }
        }
      },
      {
        step: 3,
        title: 'CSNP Synchronizes the Database',
        description: 'The DIS sends a Complete Sequence Number PDU listing every LSP it holds with its sequence number, so Router A can spot and request anything missing.',
        actorSource: 'r1',
        actorTarget: 'r2',
        explanation: 'On a broadcast link the DIS transmits a CSNP every 10 seconds. A router compares the summary against its own database and asks for absent or newer LSPs with a Partial Sequence Number PDU, after which the two databases match and SPF produces the same tree on both sides.',
        packetInfo: {
          id: 'isis-pkt-3',
          source: '1921.6800.2002.00',
          destination: '01:80:C2:00:00:14 (All Level 1 ISs)',
          type: 'IS-IS CSNP',
          summary: 'Complete sequence numbers, 1 LSP listed',
          payload: { pduType: 'CSNP', lspEntries: 1, startLspId: '1921.6800.2002.00-00', endLspId: '1921.6800.2002.00-ff' }
        }
      }
    ],
    liveSandboxType: 'generic-simulator',
    quiz: [
      {
        id: 'isis-q1',
        question: 'How does IS-IS transport its own protocol data units across a link?',
        options: ['Over TCP port 179', 'Over UDP port 520', 'Directly inside Layer 2 frames', 'Inside IP protocol 89 packets'],
        correctAnswer: 2,
        explanation: 'IS-IS PDUs are carried straight in link-layer frames with no IP header, which is why the protocol has no TCP or UDP port number.'
      },
      {
        id: 'isis-q2',
        question: 'Which IS-IS PDU actually carries the link-state information about routers and prefixes?',
        options: ['IIH (Hello PDU)', 'CSNP', 'LSP (Link State PDU)', 'PSNP'],
        correctAnswer: 2,
        explanation: 'The Link State PDU holds the router and prefix TLVs, while Hello PDUs form adjacencies and the CSNP and PSNP PDUs only synchronize databases.'
      }
    ]
  },
  {
    id: 'vrrp',
    slug: 'vrrp',
    name: 'VRRP',
    fullName: 'Virtual Router Redundancy Protocol',
    category: 'network',
    osiLayer: 'Network',
    port: 'IP Protocol 112',
    rfc: 'RFC 5798',
    yearIntroduced: 1998,
    shortSummary: 'Election protocol that shares one virtual IP and MAC address so a standby router can take over a failed default gateway.',
    description: 'VRRP groups two or more routers on a LAN into one virtual router. The elected Master answers all traffic sent to the shared virtual IP and virtual MAC address, while the remaining routers stay on hot standby and promote themselves within seconds when advertisements stop arriving.',
    keyFeatures: [
      'Master election by highest priority, with 255 reserved for the address owner',
      'Shared virtual MAC address 00:00:5E:00:01:{VRID} for the whole group',
      'Advertisements every 1 second by default, carried in IP protocol 112',
      'Preemption lets a recovered higher-priority router reclaim the Master role',
      'VRRPv3 supports IPv4 and IPv6 with a simplified single advertisement format'
    ],
    useCases: [
      'Default gateway redundancy for office and campus VLANs',
      'First-hop redundancy for server racks and hypervisor hosts',
      'High-availability pairs of firewalls or load balancers'
    ],
    pros: [
      'Failover in roughly three seconds with default timers and no host reconfiguration',
      'Vendor-neutral and implemented by nearly every Layer 3 switch and router'
    ],
    cons: [
      'Provides redundancy only, so the standby router capacity sits idle',
      'Unauthenticated advertisements can be spoofed to hijack the virtual address'
    ],
    actors: [
      { id: 'master', label: 'Master Router (priority 200)', icon: 'Network', color: '#6366f1' },
      { id: 'backup', label: 'Backup Router (priority 100)', icon: 'Network', color: '#10b981' },
      { id: 'host', label: 'LAN Host', icon: 'Laptop', color: '#f59e0b' }
    ],
    interactiveSteps: [
      {
        step: 1,
        title: 'Master Sends Advertisements',
        description: 'The Master router advertises its priority for VRID 1 every second so the backup routers know the virtual router is healthy.',
        actorSource: 'master',
        actorTarget: 'backup',
        explanation: 'Advertisements are sent to 224.0.0.18 with IP protocol number 112 and a TTL of 255. The packet carries the VRID, priority, and advertisement interval, and its source address is always the real interface address, never the virtual one.',
        packetInfo: {
          id: 'vrrp-pkt-1',
          source: '10.0.0.2',
          destination: '224.0.0.18',
          type: 'VRRP Advertisement',
          summary: 'VRID 1, priority 200, advertisement interval 1s',
          payload: { version: 3, type: 1, vrid: 1, priority: 200, advertIntervalSeconds: 1, ipProtocol: 112 }
        }
      },
      {
        step: 2,
        title: 'Backup Promotes Itself',
        description: 'The Master goes silent, so after the Master_Down_Interval the backup router with priority 100 becomes the new Master and starts advertising.',
        actorSource: 'backup',
        actorTarget: 'master',
        explanation: 'The Master_Down_Interval is three advertisement intervals plus a skew time of (256 minus priority) divided by 256 seconds, which is about 3.6 seconds here. That skew keeps the highest-priority backup from waiting as long as lower-priority peers.',
        packetInfo: {
          id: 'vrrp-pkt-2',
          source: '10.0.0.3',
          destination: '224.0.0.18',
          type: 'VRRP Advertisement (New Master)',
          summary: 'VRID 1, priority 100, takeover after a 3.6s master-down interval',
          payload: { version: 3, type: 1, vrid: 1, priority: 100, masterDownIntervalSeconds: 3.6, preempt: true }
        }
      },
      {
        step: 3,
        title: 'Gratuitous ARP Redirects the Gateway',
        description: 'The new Master broadcasts a gratuitous ARP so hosts and switches map the virtual IP to the virtual MAC address now owned by this router.',
        actorSource: 'backup',
        actorTarget: 'host',
        explanation: 'Hosts keep using the same virtual IP and virtual MAC throughout the failover, so no host configuration changes. The gratuitous ARP simply refreshes stale forwarding entries in switches and ARP caches, and it repeats a few times because a single broadcast can be lost.',
        packetInfo: {
          id: 'vrrp-pkt-3',
          source: '10.0.0.1 (virtual IP)',
          destination: '255.255.255.255 (broadcast)',
          type: 'Gratuitous ARP',
          summary: '10.0.0.1 is at 00:00:5e:00:01:01',
          payload: { senderIp: '10.0.0.1', senderMac: '00:00:5e:00:01:01', targetIp: '10.0.0.1', vrid: 1 }
        }
      }
    ],
    liveSandboxType: 'generic-simulator',
    quiz: [
      {
        id: 'vrrp-q1',
        question: 'Which IP protocol number identifies VRRP advertisements?',
        options: ['6', '17', '112', '89'],
        correctAnswer: 2,
        explanation: 'VRRP is carried directly in IP with protocol number 112, not in TCP or UDP.'
      },
      {
        id: 'vrrp-q2',
        question: 'Which virtual MAC address does VRRP use for VRID 1?',
        options: ['00:00:5e:00:01:01', '00:00:0c:07:ac:01', '01:00:5e:00:00:01', '00:00:5e:01:00:01'],
        correctAnswer: 0,
        explanation: 'VRRP builds the virtual MAC as 00:00:5E:00:01:{VRID} in hexadecimal, so VRID 1 maps to 00:00:5e:00:01:01, while 00:00:0c:07:ac:xx belongs to HSRP version 1.'
      }
    ]
  },
  {
    id: 'bfd',
    slug: 'bfd',
    name: 'BFD',
    fullName: 'Bidirectional Forwarding Detection',
    category: 'network',
    osiLayer: 'Network',
    port: 3784,
    rfc: 'RFC 5880',
    yearIntroduced: 2010,
    shortSummary: 'Lightweight hello protocol that detects path failures in milliseconds and hands the news to routing protocols.',
    description: 'Bidirectional Forwarding Detection provides a fast, protocol-independent failure signal. Two systems negotiate a transmit interval and a detection multiplier, then exchange small control packets over UDP; when the agreed number of packets goes missing, BFD declares the path down long before a routing protocol hello timer would expire.',
    keyFeatures: [
      'Asynchronous control packets over UDP port 3784, with echo mode on port 3785',
      'Detection time equals the negotiated transmit interval multiplied by the detection multiplier',
      'Discriminator values demultiplex sessions independently of interface addresses',
      'Single-hop and multi-hop modes with optional authentication',
      'Routing protocols and static routes register as clients to receive state changes'
    ],
    useCases: [
      'Sub-second failover for OSPF, IS-IS, or BGP peering sessions',
      'Monitoring MPLS label-switched paths and static routes',
      'Detecting failures across Layer 2 transport that hides a link-down event'
    ],
    pros: [
      'Millisecond detection that is independent of routing protocol timers',
      'Very low bandwidth and CPU cost per monitored session'
    ],
    cons: [
      'Aggressive timers can produce false positives during congestion or microbursts',
      'Requires support on both endpoints and careful tuning over long paths'
    ],
    actors: [
      { id: 'r1', label: 'BFD Peer A (10.0.0.1)', icon: 'Network', color: '#6366f1' },
      { id: 'r2', label: 'BFD Peer B (10.0.0.2)', icon: 'Network', color: '#10b981' }
    ],
    interactiveSteps: [
      {
        step: 1,
        title: 'Down State Session Request',
        description: 'Peer A opens a BFD session in the Down state, proposing a 50 ms transmit interval and a detection multiplier of 3.',
        actorSource: 'r1',
        actorTarget: 'r2',
        explanation: 'The first control packet carries My Discriminator, which uniquely identifies the session at the sender, plus the desired minimum transmit and receive intervals in microseconds. Port 3784 is the destination for single-hop control packets, while the source port is chosen from the ephemeral range.',
        packetInfo: {
          id: 'bfd-pkt-1',
          source: '10.0.0.1:49152',
          destination: '10.0.0.2:3784',
          type: 'BFD Control (State: Down)',
          summary: 'My Discriminator 0x0A0B0C0D, desired 50ms, multiplier 3',
          payload: { version: 1, state: 'Down', myDiscriminator: '0x0A0B0C0D', desiredMinTxIntervalUs: 50000, requiredMinRxIntervalUs: 50000, detectMult: 3 }
        }
      },
      {
        step: 2,
        title: 'Init Then Up Handshake',
        description: 'Peer B answers in the Init state, echoing the discriminator it just learned, and the session only reaches Up after each side has seen the other discriminator.',
        actorSource: 'r2',
        actorTarget: 'r1',
        explanation: 'RFC 5880 uses a three-way handshake: Down, Init, Up. Requiring both directions to confirm the peer discriminator prevents a one-way link from being declared healthy just because packets flow in a single direction.',
        packetInfo: {
          id: 'bfd-pkt-2',
          source: '10.0.0.2:49153',
          destination: '10.0.0.1:3784',
          type: 'BFD Control (State: Init)',
          summary: 'Your Discriminator 0x0A0B0C0D, My Discriminator 0x1B2C3D4E',
          payload: { state: 'Init', myDiscriminator: '0x1B2C3D4E', yourDiscriminator: '0x0A0B0C0D', negotiatedTxIntervalUs: 50000, negotiatedDetectMult: 3 }
        }
      },
      {
        step: 3,
        title: 'Detection Timer Expires',
        description: 'The link fails, three consecutive control packets are lost at 50 ms spacing, and Peer A marks the session Down and notifies its routing client.',
        actorSource: 'r1',
        actorTarget: 'r2',
        explanation: 'Detection time is 50 ms times 3, so 150 ms of silence is enough. BFD reports the failure to the registered client, which tears down the adjacency and installs a backup path immediately instead of waiting for a 10-second or 40-second routing hello timer.',
        packetInfo: {
          id: 'bfd-pkt-3',
          source: '10.0.0.1:49152',
          destination: '10.0.0.2:3784',
          type: 'BFD Control (State: Down)',
          summary: 'Detection timer expired after 3 missed packets (150ms)',
          payload: { state: 'Down', detectionTimeMs: 150, missedPackets: 3, detectMult: 3, negotiatedTxIntervalMs: 50 }
        }
      }
    ],
    liveSandboxType: 'generic-simulator',
    quiz: [
      {
        id: 'bfd-q1',
        question: 'Which UDP destination port carries single-hop BFD control packets?',
        options: ['3784', '3785', '520', '4789'],
        correctAnswer: 0,
        explanation: 'Single-hop BFD control packets use UDP port 3784, while 3785 is reserved for BFD echo packets.'
      },
      {
        id: 'bfd-q2',
        question: 'With a negotiated 50 ms transmit interval and a detection multiplier of 3, how long does BFD wait before declaring a session down?',
        options: ['50 ms', '100 ms', '150 ms', '300 ms'],
        correctAnswer: 2,
        explanation: 'The detection time is the negotiated interval multiplied by the detection multiplier, so 50 ms times 3 gives 150 ms of allowed silence.'
      }
    ]
  },
  {
    id: 'vxlan',
    slug: 'vxlan',
    name: 'VXLAN',
    fullName: 'Virtual Extensible LAN',
    category: 'cloud',
    osiLayer: 'Data Link',
    port: 4789,
    rfc: 'RFC 7348',
    yearIntroduced: 2014,
    shortSummary: 'MAC-in-UDP overlay that stretches Layer 2 segments across a routed Layer 3 underlay using 24-bit network identifiers.',
    description: 'VXLAN encapsulates whole Ethernet frames inside UDP and IP so one Layer 2 segment can span a routed data center fabric. Each segment is identified by a 24-bit VXLAN Network Identifier, and tunnel endpoints add or remove the 8-byte VXLAN header, delivering far more isolated segments than the 4094 available to 802.1Q VLANs.',
    keyFeatures: [
      '8-byte VXLAN header carrying a 24-bit VNI, giving 16,777,216 possible segments',
      'MAC-in-UDP encapsulation with destination port 4789',
      'VTEPs implemented in hypervisors or on top-of-rack switches',
      'BUM traffic replicated by underlay multicast or by head-end replication',
      'Outer IP header lets the underlay route and ECMP-hash encapsulated traffic'
    ],
    useCases: [
      'Layer 2 extension across a Layer 3 spine-and-leaf data center fabric',
      'Multi-tenant isolation in private and public clouds',
      'Live VM migration between racks without readdressing guests'
    ],
    pros: [
      'Segment scale far beyond the 4094 limit of VLAN IDs',
      'No spanning tree in the underlay, so every uplink can be used',
      'Tenant segment identity is decoupled from physical switch configuration'
    ],
    cons: [
      'Adds 50 bytes of overhead over IPv4, so the underlay MTU must grow or the inner MTU must shrink',
      'Troubleshooting is harder because the underlay cannot see the encapsulated frame'
    ],
    actors: [
      { id: 'vtepA', label: 'Ingress VTEP (192.0.2.1)', icon: 'Server', color: '#6366f1' },
      { id: 'vtepB', label: 'Egress VTEP (192.0.2.2)', icon: 'Server', color: '#10b981' },
      { id: 'hostB', label: 'Remote VM on VLAN 10', icon: 'Laptop', color: '#f59e0b' }
    ],
    interactiveSteps: [
      {
        step: 1,
        title: 'Ingress VTEP Encapsulates the Frame',
        description: 'A local VM emits a frame on VLAN 10, and the ingress VTEP maps that VLAN to VNI 10100 and wraps the frame in UDP, IP, and an outer Ethernet header.',
        actorSource: 'vtepA',
        actorTarget: 'vtepB',
        explanation: 'The VTEP keeps a mapping of local VLANs to VNIs and of remote MAC addresses to remote VTEP IPs. The inner Ethernet frame is copied unchanged after the 8-byte VXLAN header, and the outer addresses belong entirely to the underlay, so the inner MAC and IP are never examined by transit routers.',
        packetInfo: {
          id: 'vxlan-pkt-1',
          source: '192.0.2.1:51820',
          destination: '192.0.2.2:4789',
          type: 'VXLAN Encapsulated Frame',
          summary: 'VNI 10100, inner destination 00:aa:bb:cc:dd:ee',
          payload: { vni: 10100, outerSrcIp: '192.0.2.1', outerDstIp: '192.0.2.2', udpDstPort: 4789, innerSrcMac: 'aa:bb:cc:00:11:22', innerDstMac: '00:aa:bb:cc:dd:ee' }
        }
      },
      {
        step: 2,
        title: 'Underlay Routes the Outer Packet',
        description: 'Spine and leaf routers forward the encapsulated packet using only the outer IP header, load-balancing it across equal-cost paths.',
        actorSource: 'vtepA',
        actorTarget: 'vtepB',
        explanation: 'The underlay is a normal routed fabric, so it can use every available link without spanning tree. ECMP hashing over the outer five-tuple spreads large flows across spines, and a hop-by-hop MTU of at least 1550 bytes is normally required to avoid fragmenting the extra 50 bytes of header.',
        packetInfo: {
          id: 'vxlan-pkt-2',
          source: '192.0.2.1',
          destination: '192.0.2.2',
          type: 'VXLAN over UDP/IP (Transit)',
          summary: 'Outer IP 192.0.2.1 to 192.0.2.2, TTL decremented to 63',
          payload: { outerTtl: 63, ecmpHash: 'Outer 5-tuple', innerFrameVisibleToUnderlay: false, mtuBytes: 1550 }
        }
      },
      {
        step: 3,
        title: 'Egress VTEP Decapsulates and Learns',
        description: 'The egress VTEP strips the outer headers, delivers the frame to the local VM on VLAN 10, and records the inner source MAC against the remote VTEP.',
        actorSource: 'vtepB',
        actorTarget: 'vtepA',
        explanation: 'Decapsulation validates the VNI, then forwards the original frame onto the mapped local VLAN. Learning the inner source MAC against the outer source IP and VNI lets the return traffic be unicast straight back, which is why flooded traffic is only needed for broadcast, unknown unicast, and multicast frames.',
        packetInfo: {
          id: 'vxlan-pkt-3',
          source: '192.0.2.2',
          destination: '192.0.2.1:4789',
          type: 'VXLAN Return Frame (Unicast)',
          summary: 'VNI 10100 return path, MAC 00:aa:bb:cc:dd:ee learned at 192.0.2.2',
          payload: { vni: 10100, learnedMac: '00:aa:bb:cc:dd:ee', remoteVtep: '192.0.2.2', floodRequired: false }
        }
      }
    ],
    liveSandboxType: 'generic-simulator',
    quiz: [
      {
        id: 'vxlan-q1',
        question: 'How many bits long is the VXLAN Network Identifier in the VXLAN header?',
        options: ['12 bits', '16 bits', '24 bits', '32 bits'],
        correctAnswer: 2,
        explanation: 'The VNI is 24 bits, which allows 16,777,216 segments compared with the 12-bit VLAN ID space.'
      },
      {
        id: 'vxlan-q2',
        question: 'Which UDP destination port does RFC 7348 assign to VXLAN?',
        options: ['4789', '4790', '8472', '6633'],
        correctAnswer: 0,
        explanation: 'RFC 7348 standardizes UDP port 4789, although some early Linux implementations defaulted to 8472 before the standard was published.'
      }
    ]
  },
  {
    id: 'mpls',
    slug: 'mpls',
    name: 'MPLS',
    fullName: 'Multiprotocol Label Switching',
    category: 'network',
    osiLayer: 'Data Link',
    rfc: 'RFC 3031',
    yearIntroduced: 2001,
    shortSummary: 'Label-switching transport that forwards packets by short fixed-length labels instead of longest-prefix IP lookups.',
    description: 'Multiprotocol Label Switching sits between Layers 2 and 3, inserting a 4-byte shim header in front of each packet. Edge routers classify traffic into a Forwarding Equivalence Class and push a label, while core routers swap labels from a label forwarding table without inspecting the IP header, enabling fast forwarding, traffic engineering, and VPN services.',
    keyFeatures: [
      '4-byte shim header with a 20-bit label, 3-bit EXP field, 1-bit bottom-of-stack, and 8-bit TTL',
      'Label stacks allow nested services such as Layer 3 VPNs and fast reroute',
      'Push, swap, and pop operations performed by ingress, transit, and egress routers',
      'Label bindings distributed by LDP (RFC 5036), RSVP-TE, or BGP',
      'Penultimate hop popping removes the final label one hop before the egress router'
    ],
    useCases: [
      'Service provider core transport for many customers over one infrastructure',
      'Layer 3 VPNs that keep customer routing separate on a shared core',
      'Traffic engineering and fast reroute for mission-critical paths'
    ],
    pros: [
      'Fixed-length label lookup replaces a longest-prefix match at every core hop',
      'VPN and traffic engineering services share one converged packet core',
      'Independent of the payload protocol, so it can carry IPv4, IPv6, or Ethernet'
    ],
    cons: [
      'Label distribution and fault isolation demand specialist operational skills',
      'The extra header eats MTU and adds a control plane that must be maintained'
    ],
    actors: [
      { id: 'ingress', label: 'Ingress LER (PE1)', icon: 'Network', color: '#6366f1' },
      { id: 'core', label: 'Core LSR (P)', icon: 'Server', color: '#06b6d4' },
      { id: 'egress', label: 'Egress LER (PE2)', icon: 'Network', color: '#10b981' }
    ],
    interactiveSteps: [
      {
        step: 1,
        title: 'Ingress LER Pushes a Label',
        description: 'The ingress label edge router classifies the packet into the FEC for 203.0.113.0/24 and pushes label 16001 before sending it into the core.',
        actorSource: 'ingress',
        actorTarget: 'core',
        explanation: 'The ingress router combines the destination prefix with its own next hop to select a label, then writes the 4-byte shim between the Layer 2 header and the IP packet. Because the label already encodes the path, core routers never need to look at the destination IP address.',
        packetInfo: {
          id: 'mpls-pkt-1',
          source: '192.0.2.1',
          destination: '192.0.2.9',
          type: 'MPLS Label Push',
          summary: 'Push label 16001, EXP 0, bottom-of-stack 1, TTL 64',
          payload: { operation: 'push', label: 16001, exp: 0, bottomOfStack: 1, ttl: 64, fec: '203.0.113.0/24' }
        }
      },
      {
        step: 2,
        title: 'Core LSR Swaps the Label',
        description: 'The core label switch router looks up incoming label 16001 in its label forwarding table, swaps it for 16002, decrements the shim TTL, and forwards the packet.',
        actorSource: 'core',
        actorTarget: 'egress',
        explanation: 'A swap is a single table lookup on a fixed 20-bit value, which is cheaper than matching a variable-length prefix. The TTL inside the shim header is decremented so traceroute still works across the label-switched path.',
        packetInfo: {
          id: 'mpls-pkt-2',
          source: '192.0.2.5',
          destination: '192.0.2.9',
          type: 'MPLS Label Swap',
          summary: 'Incoming label 16001 swapped to 16002, TTL 63',
          payload: { operation: 'swap', incomingLabel: 16001, outgoingLabel: 16002, ttl: 63, nextHop: '192.0.2.9' }
        }
      },
      {
        step: 3,
        title: 'Penultimate Hop Pop Delivers the Packet',
        description: 'The egress router has advertised the implicit-null label for its connected prefix, so the core router pops the last label and sends a plain IP packet to the egress LER.',
        actorSource: 'core',
        actorTarget: 'egress',
        explanation: 'Implicit null is label value 3 and is never actually carried on the wire: the router before the egress simply removes the top label. This penultimate hop popping saves the egress router one label lookup and one pass through the forwarding pipeline.',
        packetInfo: {
          id: 'mpls-pkt-3',
          source: '192.0.2.5',
          destination: '192.0.2.9',
          type: 'MPLS Penultimate Hop Pop',
          summary: 'Pop label 16002, implicit-null label 3 advertised by PE2',
          payload: { operation: 'pop', poppedLabel: 16002, advertisedLabel: 3, ttl: 62, remainingLabels: 0 }
        }
      }
    ],
    liveSandboxType: 'generic-simulator',
    quiz: [
      {
        id: 'mpls-q1',
        question: 'How many bits long is the label field in the MPLS shim header?',
        options: ['8 bits', '16 bits', '20 bits', '24 bits'],
        correctAnswer: 2,
        explanation: 'The MPLS label is 20 bits, and it shares the 4-byte shim with a 3-bit EXP field, a 1-bit bottom-of-stack flag, and an 8-bit TTL.'
      },
      {
        id: 'mpls-q2',
        question: 'Which protocol distributes label bindings in a conventional, non-traffic-engineered MPLS network?',
        options: ['LDP', 'BGP', 'OSPF', 'RADIUS'],
        correctAnswer: 0,
        explanation: 'Label Distribution Protocol, standardized in RFC 5036, maps forwarding equivalence classes to labels between adjacent label switch routers.'
      }
    ]
  }
];
