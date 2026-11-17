import { Protocol } from '@/types/protocol';

export const CORE_EXTRA_PROTOCOLS: Protocol[] = [
    {
        id: 'http2',
        slug: 'http2',
        name: 'HTTP/2',
        fullName: 'Hypertext Transfer Protocol Version 2',
        category: 'application',
        osiLayer: 'Application',
        port: 443,
        rfc: 'RFC 9113',
        yearIntroduced: 2015,
        shortSummary: 'Binary, multiplexed evolution of HTTP that carries many concurrent streams over a single TCP connection with header compression.',
        description: 'HTTP/2 keeps the same request and response semantics as HTTP/1.1 but replaces the text protocol with a binary framing layer. One TCP connection carries concurrent streams identified by stream IDs, and the HPACK algorithm compresses header fields that HTTP/1.1 repeated in full on every request.',
        keyFeatures: [
            'Binary framing layer with typed frames (HEADERS, DATA, SETTINGS, WINDOW_UPDATE)',
            'Stream multiplexing over a single TCP connection',
            'HPACK header compression with a dynamic table (RFC 7541)',
            'Per-stream and connection-level flow control',
            'Stream prioritisation and PING for keepalive and RTT probing'
        ],
        useCases: ['Modern web browsing over HTTPS', 'REST and gRPC style API traffic', 'Asset-heavy sites that issue dozens of parallel requests'],
        pros: ['Removes HTTP/1.1 head-of-line blocking at the request level', 'Far fewer TCP connections and less header overhead per request'],
        cons: ['A single lost TCP segment still stalls every multiplexed stream', 'HPACK state makes implementations more complex to debug'],
        actors: [
            { id: 'browser', label: 'Web Browser (Client)', icon: 'Globe', color: '#6366f1' },
            { id: 'edge', label: 'CDN Edge / Origin Server', icon: 'Server', color: '#10b981' }
        ],
        interactiveSteps: [
            {
                step: 1,
                title: 'Step 1: Connection Preface and SETTINGS',
                description: 'After the TCP and TLS handshake, the browser sends the HTTP/2 connection preface followed by its SETTINGS frame.',
                actorSource: 'browser',
                actorTarget: 'edge',
                explanation: 'The preface is the fixed octet string PRI * HTTP/2.0 followed by CRLF, CRLF, SM, CRLF, which guards against a client accidentally talking HTTP/1.1 to an HTTP/2 server. SETTINGS then advertises limits such as MAX_CONCURRENT_STREAMS and INITIAL_WINDOW_SIZE.',
                packetInfo: {
                    id: 'http2-pkt-1',
                    source: '192.168.1.20:51234',
                    destination: '93.184.216.34:443',
                    type: 'HTTP/2 SETTINGS',
                    summary: 'Preface sent | SETTINGS: MAX_CONCURRENT_STREAMS=100, INITIAL_WINDOW_SIZE=65535',
                    payload: { preface: 'PRI * HTTP/2.0', frameType: '0x4', maxConcurrentStreams: 100, initialWindowSize: 65535 }
                }
            },
            {
                step: 2,
                title: 'Step 2: HPACK-Compressed HEADERS on Stream 1',
                description: 'The browser opens stream 1 and sends the request headers as a single HEADERS frame with HPACK-encoded name and value pairs.',
                actorSource: 'browser',
                actorTarget: 'edge',
                explanation: 'HPACK replaces repeated header names with indexes into a static table of 61 well-known entries and a per-connection dynamic table, so a second request for the same origin transmits only a few bytes instead of the full header block.',
                packetInfo: {
                    id: 'http2-pkt-2',
                    source: '192.168.1.20:51234',
                    destination: '93.184.216.34:443',
                    type: 'HTTP/2 HEADERS',
                    summary: 'Stream 1 | :method GET | :path /index.html | END_HEADERS, END_STREAM=0',
                    payload: { streamId: 1, frameType: '0x1', method: 'GET', path: '/index.html', flags: 'END_HEADERS' }
                }
            },
            {
                step: 3,
                title: 'Step 3: Interleaved Response Frames and WINDOW_UPDATE',
                description: 'The server answers on stream 1 and stream 3 at the same time, and both sides top up flow-control credit with WINDOW_UPDATE frames.',
                actorSource: 'edge',
                actorTarget: 'browser',
                explanation: 'Frames from different streams can be interleaved freely, so a large image on stream 3 does not delay a small script on stream 1. Because stream IDs are odd for client-initiated streams, 1 and 3 both belong to the browser.',
                packetInfo: {
                    id: 'http2-pkt-3',
                    source: '93.184.216.34:443',
                    destination: '192.168.1.20:51234',
                    type: 'HTTP/2 HEADERS + DATA',
                    summary: 'Stream 1: 200 OK | Stream 3: DATA 16 KB | WINDOW_UPDATE +65535',
                    payload: { streamId: 3, frameTypes: ['HEADERS', 'DATA', 'WINDOW_UPDATE'], status: 200, dataLength: 16384, windowIncrement: 65535 }
                }
            }
        ],
        liveSandboxType: 'generic-simulator',
        quiz: [
            {
                id: 'http2-q1',
                question: 'Which header compression scheme is defined for HTTP/2?',
                options: ['HPACK', 'QPACK', 'Brotli', 'LZW'],
                correctAnswer: 0,
                explanation: 'HTTP/2 uses HPACK (RFC 7541), which combines a static table, a dynamic table and Huffman coding to shrink header blocks.'
            },
            {
                id: 'http2-q2',
                question: 'Why can an HTTP/2 connection still stall when a single TCP segment is lost?',
                options: ['HPACK tables desynchronise and must be rebuilt', 'All multiplexed streams share one TCP connection, so TCP head-of-line blocking delays every stream', 'The server must renegotiate TLS for each stream', 'WINDOW_UPDATE frames are only sent once per second'],
                correctAnswer: 1,
                explanation: 'TCP delivers bytes in order, so a missing segment holds back every HTTP/2 stream carried by that connection until the retransmission arrives.'
            }
        ]
    },
    {
        id: 'http3',
        slug: 'http3',
        name: 'HTTP/3',
        fullName: 'Hypertext Transfer Protocol Version 3',
        category: 'application',
        osiLayer: 'Application',
        port: '443 (UDP)',
        rfc: 'RFC 9114',
        yearIntroduced: 2022,
        shortSummary: 'HTTP mapping onto QUIC that removes TCP head-of-line blocking and folds the TLS 1.3 handshake into the transport.',
        description: 'HTTP/3 keeps the familiar request and response model but runs it over QUIC instead of TCP. Every stream is independent at the transport layer, so a lost datagram only stalls the stream it belonged to, and encryption is built in because QUIC always carries TLS 1.3.',
        keyFeatures: [
            'Runs over QUIC, which is carried in UDP datagrams',
            'Independent streams with no cross-stream head-of-line blocking',
            'QPACK header compression (RFC 9204) designed for out-of-order delivery',
            'Unidirectional control streams for SETTINGS and QPACK state',
            '0-RTT resumption for repeat visitors'
        ],
        useCases: ['Low-latency web delivery on lossy mobile networks', 'Video streaming and large asset downloads', 'Any HTTPS service already fronted by a QUIC-capable CDN'],
        pros: ['No transport-level head-of-line blocking between streams', 'Faster connection setup with 1-RTT and 0-RTT handshakes', 'Survives client IP changes through QUIC connection migration'],
        cons: ['Some enterprise firewalls still throttle or block UDP 443', 'Higher CPU cost for user-space QUIC processing'],
        actors: [
            { id: 'browser', label: 'Web Browser (Client)', icon: 'Laptop', color: '#6366f1' },
            { id: 'edge', label: 'QUIC Edge Server', icon: 'Server', color: '#06b6d4' }
        ],
        interactiveSteps: [
            {
                step: 1,
                title: 'Step 1: QUIC Initial Carries the TLS 1.3 ClientHello',
                description: 'The browser sends a QUIC Initial packet whose CRYPTO frame already contains the TLS 1.3 ClientHello and the transport parameters.',
                actorSource: 'browser',
                actorTarget: 'edge',
                explanation: 'QUIC merges transport and cryptographic setup, so one round trip both proves the server identity and establishes keys. The Initial packet is protected with keys derived from the destination connection ID.',
                packetInfo: {
                    id: 'http3-pkt-1',
                    source: '192.168.1.20:61000 (UDP)',
                    destination: '93.184.216.34:443 (UDP)',
                    type: 'QUIC Initial',
                    summary: 'DCID=0x7f3a91c2 | CRYPTO: ClientHello | ALPN=h3',
                    payload: { dcid: '0x7f3a91c2', scid: '0x1b04de55', frameType: 'CRYPTO', alpn: 'h3', tlsVersion: 'TLS 1.3' }
                }
            },
            {
                step: 2,
                title: 'Step 2: Server Opens Its Control Stream and Sends SETTINGS',
                description: 'The server completes the handshake and opens a unidirectional control stream with SETTINGS, including QPACK limits and its maximum field section size.',
                actorSource: 'edge',
                actorTarget: 'browser',
                explanation: 'HTTP/3 control messages travel on unidirectional streams identified by a stream type prefix, where 0x00 marks the control stream and 0x02 and 0x03 mark the QPACK encoder and decoder streams.',
                packetInfo: {
                    id: 'http3-pkt-2',
                    source: '93.184.216.34:443 (UDP)',
                    destination: '192.168.1.20:61000 (UDP)',
                    type: 'QUIC 1-RTT (HTTP/3 SETTINGS)',
                    summary: 'Control stream 0x00 | SETTINGS: QPACK_MAX_TABLE_CAPACITY=4096',
                    payload: { streamType: '0x00', frameType: '0x4', qpackMaxTableCapacity: 4096, maxFieldSectionSize: 65536 }
                }
            },
            {
                step: 3,
                title: 'Step 3: First Request on a Bidirectional Stream',
                description: 'The browser opens a client-initiated bidirectional stream and sends QPACK-encoded HEADERS, then DATA for the request body.',
                actorSource: 'browser',
                actorTarget: 'edge',
                explanation: 'Each HTTP/3 exchange owns a stream, so the QUIC layer can deliver other streams immediately even if this one loses a datagram. The stream is closed with a FIN when the sender has no more body bytes.',
                packetInfo: {
                    id: 'http3-pkt-3',
                    source: '192.168.1.20:61000 (UDP)',
                    destination: '93.184.216.34:443 (UDP)',
                    type: 'HTTP/3 HEADERS + DATA',
                    summary: 'Bidi stream 0 | :method GET | :path /app.js | FIN',
                    payload: { streamId: 0, frameTypes: ['HEADERS', 'DATA'], method: 'GET', path: '/app.js', fin: true }
                }
            }
        ],
        liveSandboxType: 'generic-simulator',
        quiz: [
            {
                id: 'http3-q1',
                question: 'Which transport does HTTP/3 use?',
                options: ['TCP with TLS 1.3', 'QUIC, which runs over UDP', 'SCTP', 'Plain UDP without encryption'],
                correctAnswer: 1,
                explanation: 'HTTP/3 is defined on top of QUIC, and QUIC itself is carried in UDP datagrams with mandatory TLS 1.3 encryption.'
            },
            {
                id: 'http3-q2',
                question: 'Which header compression scheme was designed specifically for HTTP/3?',
                options: ['HPACK', 'QPACK', 'gzip', 'SDCH'],
                correctAnswer: 1,
                explanation: 'QPACK (RFC 9204) adapts HPACK concepts to QUIC streams so header decoding never blocks on a missing packet from another stream.'
            }
        ]
    },
    {
        id: 'vlan',
        slug: 'vlan',
        name: 'VLAN',
        fullName: 'IEEE 802.1Q Virtual Local Area Network Tagging',
        category: 'network',
        osiLayer: 'Data Link',
        rfc: 'IEEE 802.1Q',
        yearIntroduced: 1998,
        shortSummary: 'Layer 2 tagging standard that inserts a 4-byte VLAN identifier into Ethernet frames to segment one physical switch into isolated broadcast domains.',
        description: 'IEEE 802.1Q defines how an Ethernet frame carries a VLAN identifier so that a single physical infrastructure can host many logically separate Layer 2 networks. Access ports strip the tag for end devices, while trunk ports keep it so switches can carry several VLANs between each other.',
        keyFeatures: [
            '4-byte tag with TPID 0x8100, PCP, DEI and a 12-bit VID',
            'Access ports carry one untagged VLAN, trunk ports carry many tagged VLANs',
            'Native VLAN on a trunk is sent untagged for backward compatibility',
            'Per-VLAN broadcast domains and Layer 2 isolation',
            'Priority Code Point bits allow basic QoS classification'
        ],
        useCases: ['Separating voice, user and guest traffic on one switch', 'Carrying multiple customer networks across a shared uplink', 'Isolating servers, management and storage networks'],
        pros: ['Segmentation without extra cabling or switch ports', 'Small fixed overhead of only 4 bytes per frame'],
        cons: ['Misconfigured native VLANs can leak traffic between segments', 'VLANs alone provide no routing and no security boundary without ACLs'],
        actors: [
            { id: 'host', label: 'Workstation (Access Port)', icon: 'Laptop', color: '#6366f1' },
            { id: 'switch', label: 'Access Switch', icon: 'Network', color: '#10b981' },
            { id: 'router', label: 'Layer 3 Gateway', icon: 'Server', color: '#06b6d4' }
        ],
        interactiveSteps: [
            {
                step: 1,
                title: 'Step 1: Untagged Frame Arrives on an Access Port',
                description: 'The workstation sends an ordinary Ethernet II frame with no tag, and the switch associates it with the access port PVID of 10.',
                actorSource: 'host',
                actorTarget: 'switch',
                explanation: 'End devices normally know nothing about VLANs, so the access port acts as the boundary where untagged traffic is classified into a VLAN by its configured port VLAN ID.',
                packetInfo: {
                    id: 'vlan-pkt-1',
                    source: 'aa:bb:cc:00:11:22',
                    destination: '11:22:33:44:55:66',
                    type: 'Ethernet II (untagged)',
                    summary: 'EtherType 0x0800 | port Gi1/0/5 PVID=10',
                    payload: { srcMac: 'aa:bb:cc:00:11:22', dstMac: '11:22:33:44:55:66', etherType: '0x0800', pvid: 10 }
                }
            },
            {
                step: 2,
                title: 'Step 2: Switch Inserts the 802.1Q Tag on the Trunk',
                description: 'Before forwarding toward the gateway the switch inserts a 4-byte tag with VID 10 and a PCP of 0, then sends the frame out the trunk port.',
                actorSource: 'switch',
                actorTarget: 'router',
                explanation: 'The tag begins with the TPID 0x8100, which tells the receiver that the next two bytes are tag control information. Without the tag the upstream device could not tell which VLAN the frame belongs to.',
                packetInfo: {
                    id: 'vlan-pkt-2',
                    source: '11:22:33:44:55:66',
                    destination: '66:77:88:99:aa:bb',
                    type: 'IEEE 802.1Q tagged frame',
                    summary: 'TPID=0x8100 | PCP=0 | DEI=0 | VID=10',
                    payload: { tpid: '0x8100', pcp: 0, dei: 0, vid: 10, trunkPort: 'Gi0/1' }
                }
            },
            {
                step: 3,
                title: 'Step 3: Gateway Strips the Tag and Routes Between VLANs',
                description: 'The gateway receives the tagged frame on a subinterface for VLAN 10, removes the tag, performs the Layer 3 lookup and forwards the packet toward the destination subnet.',
                actorSource: 'router',
                actorTarget: 'host',
                explanation: 'Routing between VLANs requires a Layer 3 device with one subinterface per VLAN, which is the classic router-on-a-stick design. The returning frame is tagged again on the trunk and untagged by the access switch before it reaches the host.',
                packetInfo: {
                    id: 'vlan-pkt-3',
                    source: '66:77:88:99:aa:bb (VLAN 10 gateway)',
                    destination: 'aa:bb:cc:00:11:22',
                    type: 'IPv4 (tag removed, routed)',
                    summary: 'Ingress VID=10 -> egress VID=20 | TTL decremented',
                    payload: { ingressVid: 10, egressVid: 20, action: 'route', ttl: 63 }
                }
            }
        ],
        liveSandboxType: 'generic-simulator',
        quiz: [
            {
                id: 'vlan-q1',
                question: 'How many bytes does an IEEE 802.1Q tag add to an Ethernet frame?',
                options: ['2 bytes', '4 bytes', '8 bytes', '12 bytes'],
                correctAnswer: 1,
                explanation: 'The tag is 4 bytes: a 2-byte TPID of 0x8100 plus 2 bytes of tag control information holding PCP, DEI and the 12-bit VID.'
            },
            {
                id: 'vlan-q2',
                question: 'How many VLAN IDs can be used to tag traffic?',
                options: ['1024', '4094', '4096', '65535'],
                correctAnswer: 1,
                explanation: 'The VID field is 12 bits wide for 4096 values, but 0 and 4095 are reserved, leaving 4094 usable VLAN IDs.'
            }
        ]
    },
    {
        id: 'stp',
        slug: 'stp',
        name: 'STP',
        fullName: 'Spanning Tree Protocol (IEEE 802.1D)',
        category: 'network',
        osiLayer: 'Data Link',
        rfc: 'IEEE 802.1D',
        yearIntroduced: 1990,
        shortSummary: 'Loop-prevention protocol that elects a root bridge and blocks redundant Layer 2 paths so Ethernet frames cannot circulate forever.',
        description: 'Ethernet has no TTL field, so a redundant path between switches would make broadcast frames loop and multiply until the network collapses. STP builds a loop-free tree by electing one root bridge, choosing the best path to it from every other bridge, and placing all remaining ports in a blocking state.',
        keyFeatures: [
            'Root bridge election by lowest bridge ID (priority plus MAC address)',
            'Configuration BPDUs exchanged every 2 seconds by default',
            'Port roles of root port, designated port and blocked alternate port',
            'Listening, learning and forwarding state transitions guarded by timers',
            'Topology Change Notification BPDUs to flush stale MAC tables'
        ],
        useCases: ['Preventing broadcast storms in redundant switch topologies', 'Campus and data centre access layer loop protection', 'Failover when a primary uplink fails'],
        pros: ['Keeps a redundant topology usable without Layer 2 loops', 'Vendor-neutral and enabled by default on most switches'],
        cons: ['Slow convergence, typically 30 to 50 seconds with classic timers', 'Blocked links waste available bandwidth until a failure occurs'],
        actors: [
            { id: 'sw1', label: 'Core Switch A (Root)', icon: 'Network', color: '#6366f1' },
            { id: 'sw2', label: 'Distribution Switch B', icon: 'Network', color: '#10b981' },
            { id: 'sw3', label: 'Access Switch C', icon: 'Network', color: '#06b6d4' }
        ],
        interactiveSteps: [
            {
                step: 1,
                title: 'Step 1: Every Bridge Starts Advertising Itself as Root',
                description: 'Each switch sends Configuration BPDUs every 2 seconds, initially claiming itself as both root bridge and designated bridge with a path cost of 0.',
                actorSource: 'sw1',
                actorTarget: 'sw2',
                explanation: 'A Configuration BPDU carries the root bridge ID, the root path cost, the sender bridge ID and the sender port ID. Until a better BPDU arrives every bridge believes it is the root.',
                packetInfo: {
                    id: 'stp-pkt-1',
                    source: '00:1a:2b:00:00:01 (Bridge A)',
                    destination: '01:80:c2:00:00:00 (STP multicast)',
                    type: 'STP Configuration BPDU',
                    summary: 'Root ID=32768/00:1a:2b:00:00:01 | Cost=0 | Hello=2s | MaxAge=20s',
                    payload: { protocolId: '0x0000', rootPriority: 32768, rootMac: '00:1a:2b:00:00:01', rootPathCost: 0, helloTime: 2, maxAge: 20, forwardDelay: 15 }
                }
            },
            {
                step: 2,
                title: 'Step 2: Lowest Bridge ID Wins the Root Election',
                description: 'Switch B compares its own bridge ID with the advertised root and relays the superior information toward switch C, which accepts switch A as root.',
                actorSource: 'sw2',
                actorTarget: 'sw3',
                explanation: 'Superiority is decided first by the 2-byte bridge priority, which defaults to 32768, and then by the lowest MAC address as a tie-breaker. Only the root keeps sending BPDUs with a cost of 0.',
                packetInfo: {
                    id: 'stp-pkt-2',
                    source: '00:1a:2b:00:00:02 (Bridge B)',
                    destination: '01:80:c2:00:00:00 (STP multicast)',
                    type: 'STP Configuration BPDU (relayed)',
                    summary: 'Root ID=32768/00:1a:2b:00:00:01 | Cost=4 | Sender=B',
                    payload: { rootMac: '00:1a:2b:00:00:01', rootPathCost: 4, senderMac: '00:1a:2b:00:00:02', senderPort: 'Gi0/2' }
                }
            },
            {
                step: 3,
                title: 'Step 3: Redundant Port Moves to Blocking',
                description: 'Switch C finds two paths to the root, keeps the lower-cost port as its root port and places the other port in blocking state so the loop is broken.',
                actorSource: 'sw3',
                actorTarget: 'sw1',
                explanation: 'A blocking port still listens to BPDUs but forwards no user traffic, so if the active path fails it can move through listening and learning into forwarding after the timers expire and restore connectivity.',
                packetInfo: {
                    id: 'stp-pkt-3',
                    source: '00:1a:2b:00:00:03 (Bridge C)',
                    destination: '00:1a:2b:00:00:01 (Root Bridge A)',
                    type: 'STP Topology Change Notification',
                    summary: 'Port Gi0/2 -> BLOCKING | Port Gi0/1 -> FORWARDING (root port)',
                    payload: { rootPort: 'Gi0/1', blockedPort: 'Gi0/2', rootPathCost: 8, state: 'BLOCKING', tcnSent: true }
                }
            }
        ],
        liveSandboxType: 'generic-simulator',
        quiz: [
            {
                id: 'stp-q1',
                question: 'What problem does Spanning Tree Protocol solve?',
                options: ['Layer 2 loops and broadcast storms caused by redundant switch paths', 'Duplicate IPv4 addresses on a subnet', 'Packet loss on congested WAN links', 'VLAN tag mismatches on trunk ports'],
                correctAnswer: 0,
                explanation: 'STP removes loops by blocking redundant ports, which stops Ethernet frames without a TTL from circulating and multiplying forever.'
            },
            {
                id: 'stp-q2',
                question: 'Which value determines the STP root bridge?',
                options: ['The highest MAC address on the network', 'The lowest bridge ID, which is priority followed by MAC address', 'The switch with the most active ports', 'The switch with the lowest port number on VLAN 1'],
                correctAnswer: 1,
                explanation: 'The bridge with the numerically lowest bridge ID wins, comparing the 2-byte priority first (default 32768) and the MAC address only as a tie-breaker.'
            }
        ]
    },
    {
        id: 'lacp',
        slug: 'lacp',
        name: 'LACP',
        fullName: 'Link Aggregation Control Protocol (IEEE 802.1AX)',
        category: 'network',
        osiLayer: 'Data Link',
        rfc: 'IEEE 802.1AX',
        yearIntroduced: 2000,
        shortSummary: 'Standards-based control protocol that negotiates and maintains a bundle of parallel Ethernet links as one logical high-bandwidth link.',
        description: 'LACP exchanges control frames between two directly connected devices so they agree on which physical ports belong to the same aggregation group. Once the bundle is formed, traffic is distributed across member links by a hash of the frame headers, and a failed member is removed without breaking the logical link.',
        keyFeatures: [
            'LACPDUs sent as Slow Protocol frames with EtherType 0x8809 and subtype 0x01',
            'Actor and partner system information with operational keys per port',
            'Active and passive modes for controlled negotiation',
            'Automatic removal of failed member links from the bundle',
            'Per-flow load balancing based on a configurable hash'
        ],
        useCases: ['Switch-to-switch uplinks that need more than one link of bandwidth', 'Server-to-switch bonds for throughput and redundancy', 'Redundant paths that must not be blocked by STP'],
        pros: ['Increases capacity while keeping a single logical interface', 'Detects miswired or half-configured links and keeps them out of the bundle'],
        cons: ['A single traffic flow cannot exceed the bandwidth of one member link', 'Both ends must use compatible hashing or traffic may become unbalanced'],
        actors: [
            { id: 'switchA', label: 'Switch A (Actor)', icon: 'Network', color: '#6366f1' },
            { id: 'switchB', label: 'Switch B (Partner)', icon: 'Network', color: '#10b981' }
        ],
        interactiveSteps: [
            {
                step: 1,
                title: 'Step 1: LACPDUs Advertise Actor State',
                description: 'Switch A sends a LACPDU out each candidate port declaring its system ID, aggregation key, port priority and an ACTIVE and AGGREGATABLE state.',
                actorSource: 'switchA',
                actorTarget: 'switchB',
                explanation: 'LACPDUs are Slow Protocol frames addressed to 01:80:C2:00:00:02 with EtherType 0x8809 and subtype 0x01. They are not bridged, so only directly connected partners ever see them.',
                packetInfo: {
                    id: 'lacp-pkt-1',
                    source: '00:1a:2b:00:00:0a (Switch A)',
                    destination: '01:80:c2:00:00:02 (Slow Protocols)',
                    type: 'LACPDU',
                    summary: 'EtherType 0x8809 | subtype 0x01 | actor key=100 | port Gi0/1 | state=ACTIVE,AGGREGATABLE',
                    payload: { etherType: '0x8809', subtype: '0x01', actorSystem: '00:1a:2b:00:00:0a', actorKey: 100, actorPort: 'Gi0/1', actorState: 'ACTIVE, AGGREGATABLE' }
                }
            },
            {
                step: 2,
                title: 'Step 2: Partner Replies and Ports Become Selected',
                description: 'Switch B answers with its own LACPDU carrying the same operational key, and both sides mark the port SELECTED and COLLECTING and DISTRIBUTING.',
                actorSource: 'switchB',
                actorTarget: 'switchA',
                explanation: 'Matching operational keys and compatible system priorities confirm the two ports belong to the same aggregation group. A mismatch in key, speed, duplex or VLAN configuration keeps the port out of the bundle.',
                packetInfo: {
                    id: 'lacp-pkt-2',
                    source: '00:1a:2b:00:00:0b (Switch B)',
                    destination: '01:80:c2:00:00:02 (Slow Protocols)',
                    type: 'LACPDU',
                    summary: 'partner key=100 | port Gi2/1 | state=ACTIVE,AGGREGATABLE,SELECTED',
                    payload: { partnerSystem: '00:1a:2b:00:00:0b', partnerKey: 100, partnerPort: 'Gi2/1', selected: true, collecting: true, distributing: true }
                }
            },
            {
                step: 3,
                title: 'Step 3: Aggregated Link Carries Hashed Flows',
                description: 'The bundle is up as one logical interface, and each frame is placed on a member link by hashing source and destination addresses and ports.',
                actorSource: 'switchA',
                actorTarget: 'switchB',
                explanation: 'Hashing keeps a given conversation on one member link so frames stay in order. LACP only negotiates membership, while the hashing algorithm decides placement and is local to each device.',
                packetInfo: {
                    id: 'lacp-pkt-3',
                    source: '00:1a:2b:00:00:0a (LAG Po1)',
                    destination: '00:1a:2b:00:00:0b (LAG Po1)',
                    type: 'Ethernet II (LAG member)',
                    summary: 'Hash selects Gi0/2 | LAG Po1 up with 2 members',
                    payload: { lagInterface: 'Po1', members: ['Gi0/1', 'Gi0/2'], hashFields: ['srcMac', 'dstMac', 'srcIp', 'dstIp'], selectedMember: 'Gi0/2' }
                }
            }
        ],
        liveSandboxType: 'generic-simulator',
        quiz: [
            {
                id: 'lacp-q1',
                question: 'What does LACP negotiate between two directly connected devices?',
                options: ['A single logical link made from several physical links', 'VLAN membership on trunk ports', 'The spanning tree root bridge', 'IP addresses for the management interface'],
                correctAnswer: 0,
                explanation: 'LACP verifies that both ends agree on the aggregation key and port state, then forms a link aggregation group that behaves as one interface.'
            },
            {
                id: 'lacp-q2',
                question: 'Which destination MAC address do LACPDUs use?',
                options: ['01:80:C2:00:00:02', '01:80:C2:00:00:0E', '01:00:5E:00:00:01', 'FF:FF:FF:FF:FF:FF'],
                correctAnswer: 0,
                explanation: 'LACP frames are Slow Protocol frames sent to the reserved link-local multicast address 01:80:C2:00:00:02, which compliant bridges do not forward.'
            }
        ]
    },
    {
        id: 'lldp',
        slug: 'lldp',
        name: 'LLDP',
        fullName: 'Link Layer Discovery Protocol (IEEE 802.1AB)',
        category: 'network',
        osiLayer: 'Data Link',
        rfc: 'IEEE 802.1AB',
        yearIntroduced: 2005,
        shortSummary: 'Vendor-neutral neighbour discovery protocol that advertises chassis, port, system and capability details as TLVs to directly connected devices.',
        description: 'LLDP lets each device describe itself to its directly connected neighbours without any negotiation or configuration on the far end. Every 30 seconds a device transmits an LLDPDU built from type-length-value elements, and neighbours store what they learn in a management database used for topology maps and fault isolation.',
        keyFeatures: [
            'TLV structure starting with Chassis ID, Port ID and Time To Live',
            'Default transmit interval of 30 seconds with a TTL of 120 seconds',
            'One-way advertisement, so no reply or agreement is required',
            'Optional LLDP-MED TLVs for voice VLAN, power and inventory data',
            'Frames sent to 01:80:C2:00:00:0E with EtherType 0x88CC'
        ],
        useCases: ['Automatic network topology discovery for monitoring tools', 'Identifying which switch port a workstation or phone is plugged into', 'LLDP-MED voice VLAN assignment for IP phones'],
        pros: ['Works across multiple vendors instead of a single proprietary protocol', 'Needs no addressing or routing and is safe to leave enabled'],
        cons: ['Reveals device names and port details to anyone on the segment', 'Learned information is limited to direct neighbours only'],
        actors: [
            { id: 'core', label: 'Core Switch', icon: 'Network', color: '#6366f1' },
            { id: 'access', label: 'Access Switch', icon: 'Network', color: '#10b981' },
            { id: 'phone', label: 'IP Phone (LLDP-MED)', icon: 'Smartphone', color: '#06b6d4' }
        ],
        interactiveSteps: [
            {
                step: 1,
                title: 'Step 1: LLDPDU Advertised Every 30 Seconds',
                description: 'The core switch transmits an LLDPDU out its downlink, starting with Chassis ID, Port ID and TTL TLVs followed by system name and capabilities.',
                actorSource: 'core',
                actorTarget: 'access',
                explanation: 'The TTL TLV tells the receiver how long to keep the data, and it is normally three times the transmit interval. Because the frame is link-local multicast, it never crosses a router.',
                packetInfo: {
                    id: 'lldp-pkt-1',
                    source: '00:1a:2b:00:00:01 (Core Switch)',
                    destination: '01:80:c2:00:00:0e (LLDP multicast)',
                    type: 'LLDPDU',
                    summary: 'EtherType 0x88CC | Chassis ID, Port ID Gi0/1, TTL=120, System Name=core-1',
                    payload: { etherType: '0x88CC', chassisId: '00:1a:2b:00:00:01', portId: 'Gi0/1', ttl: 120, systemName: 'core-1', capabilities: ['bridge', 'router'] }
                }
            },
            {
                step: 2,
                title: 'Step 2: Neighbour Stores the Data in Its LLDP MIB',
                description: 'The access switch parses each TLV into its LLDP remote systems MIB and publishes the entry through SNMP, while sending its own LLDPDU back.',
                actorSource: 'access',
                actorTarget: 'core',
                explanation: 'Unknown TLV types are skipped using the length field, which is what keeps the protocol extensible. Because both sides advertise independently, each ends up with a one-way view of the other.',
                packetInfo: {
                    id: 'lldp-pkt-2',
                    source: '00:1a:2b:00:00:02 (Access Switch)',
                    destination: '01:80:c2:00:00:0e (LLDP multicast)',
                    type: 'LLDPDU',
                    summary: 'Chassis ID, Port ID Gi1/0/24, TTL=120, System Name=access-1',
                    payload: { chassisId: '00:1a:2b:00:00:02', portId: 'Gi1/0/24', ttl: 120, systemName: 'access-1', mibTable: 'lldpRemTable' }
                }
            },
            {
                step: 3,
                title: 'Step 3: LLDP-MED Extends Discovery to the IP Phone',
                description: 'The access switch sends LLDP-MED TLVs to the phone including its voice VLAN ID and network policy, so the phone can tag its own traffic correctly.',
                actorSource: 'access',
                actorTarget: 'phone',
                explanation: 'LLDP-MED adds media-specific TLVs on top of 802.1AB, letting the phone learn the voice VLAN, DSCP marking and Power over Ethernet requirements before it even has an IP address.',
                packetInfo: {
                    id: 'lldp-pkt-3',
                    source: '00:1a:2b:00:00:02 (Access Switch)',
                    destination: '00:1a:2b:00:00:99 (IP Phone)',
                    type: 'LLDPDU (LLDP-MED)',
                    summary: 'MED Network Policy | voice VLAN=20 | DSCP=46 | PoE 15.4 W',
                    payload: { medTlv: 'Network Policy', voiceVlan: 20, dscp: 46, poeWatts: 15.4, capabilities: ['telephone'] }
                }
            }
        ],
        liveSandboxType: 'generic-simulator',
        quiz: [
            {
                id: 'lldp-q1',
                question: 'What is the default LLDP transmit interval?',
                options: ['5 seconds', '15 seconds', '30 seconds', '60 seconds'],
                correctAnswer: 2,
                explanation: 'IEEE 802.1AB defaults to one LLDPDU every 30 seconds, with a Time To Live of 120 seconds so an entry expires after four missed advertisements.'
            },
            {
                id: 'lldp-q2',
                question: 'How does LLDP differ from Cisco Discovery Protocol?',
                options: ['LLDP is a vendor-neutral IEEE standard, while CDP is Cisco proprietary', 'LLDP runs over TCP port 2000 while CDP uses UDP', 'LLDP negotiates link aggregation while CDP does not', 'LLDP is encrypted while CDP is sent in clear text'],
                correctAnswer: 0,
                explanation: 'LLDP is defined by IEEE 802.1AB and works between equipment from different vendors, whereas CDP is owned and implemented by Cisco.'
            }
        ]
    },
    {
        id: 'igmp',
        slug: 'igmp',
        name: 'IGMP',
        fullName: 'Internet Group Management Protocol',
        category: 'network',
        osiLayer: 'Network',
        rfc: 'RFC 1112, RFC 3376 (IGMPv3)',
        yearIntroduced: 1989,
        shortSummary: 'IPv4 signalling protocol that lets hosts join and leave multicast groups so routers know which groups to forward onto a subnet.',
        description: 'Multicast routers need to know whether any host on a LAN still wants a given group before they keep forwarding its traffic. IGMP provides that dialogue: routers send membership queries, hosts answer with reports for the groups they want, and the router installs or removes forwarding state per interface.',
        keyFeatures: [
            'Querier election so only one router per subnet sends General Queries',
            'Membership Reports sent to the group being joined',
            'IGMPv3 adds source filtering with INCLUDE and EXCLUDE modes (RFC 3376)',
            'Report suppression in IGMPv1 and IGMPv2 to reduce duplicate traffic',
            'Carried directly in IPv4 with protocol number 2'
        ],
        useCases: ['IPTV and live video distribution to many viewers', 'Multicast routing with PIM in enterprise networks', 'Market data feeds delivered to trading desks'],
        pros: ['Keeps multicast traffic scoped to subnets that actually requested it', 'Simple and lightweight, with only a few message types'],
        cons: ['Only covers IPv4, since IPv6 uses MLD instead', 'IGMP snooping must be configured on switches or traffic floods every port'],
        actors: [
            { id: 'host', label: 'Multicast Receiver', icon: 'Laptop', color: '#6366f1' },
            { id: 'router', label: 'Multicast Router (Querier)', icon: 'Server', color: '#10b981' }
        ],
        interactiveSteps: [
            {
                step: 1,
                title: 'Step 1: General Query From the Querier',
                description: 'The designated multicast router sends a General Membership Query to the all-hosts group 224.0.0.1 asking which groups are still wanted on the segment.',
                actorSource: 'router',
                actorTarget: 'host',
                explanation: 'A General Query has a group address of 0.0.0.0, which means every group. Queries also carry a Max Response Time that tells hosts how long they may spread their replies to avoid a burst.',
                packetInfo: {
                    id: 'igmp-pkt-1',
                    source: '10.0.0.1',
                    destination: '224.0.0.1 (all hosts)',
                    type: 'IGMPv3 Membership Query',
                    summary: 'Type 0x11 | group 0.0.0.0 (general) | Max Resp Time=100 (10 s)',
                    payload: { type: '0x11', groupAddress: '0.0.0.0', maxRespCode: 100, suppress: false, version: 3 }
                }
            },
            {
                step: 2,
                title: 'Step 2: Host Sends a Membership Report',
                description: 'The receiver replies with an IGMPv3 report for 239.1.1.1 in EXCLUDE mode with no sources, meaning it wants the group from every source.',
                actorSource: 'host',
                actorTarget: 'router',
                explanation: 'IGMPv3 reports are sent to 224.0.0.22, the all-IGMPv3-routers address, rather than to the group itself, so routers can see source lists. Each group record carries a filter mode plus include or exclude source addresses.',
                packetInfo: {
                    id: 'igmp-pkt-2',
                    source: '10.0.0.50',
                    destination: '224.0.0.22 (all IGMPv3 routers)',
                    type: 'IGMPv3 Membership Report',
                    summary: 'Type 0x22 | group 239.1.1.1 | mode=EXCLUDE | sources=0',
                    payload: { type: '0x22', groupAddress: '239.1.1.1', recordType: 'MODE_IS_EXCLUDE', sources: [], version: 3 }
                }
            },
            {
                step: 3,
                title: 'Step 3: Router Installs State and Forwards the Stream',
                description: 'The router adds an outgoing interface entry for 239.1.1.1, joins the group upstream with PIM and starts forwarding the multicast stream onto the LAN.',
                actorSource: 'router',
                actorTarget: 'host',
                explanation: 'Forwarding state lives per interface and per group, so the router only replicates the stream onto segments with at least one member. When the last host leaves, the state is removed and the upstream join is pruned.',
                packetInfo: {
                    id: 'igmp-pkt-3',
                    source: '10.0.0.5:5004 (multicast source)',
                    destination: '239.1.1.1:5004',
                    type: 'IPv4 Multicast (UDP)',
                    summary: 'Group 239.1.1.1 active on VLAN 20 | forwarding RTP stream',
                    payload: { group: '239.1.1.1', source: '10.0.0.5', protocol: 'UDP', port: 5004, outgoingInterface: 'VLAN 20', state: 'forwarding' }
                }
            }
        ],
        liveSandboxType: 'generic-simulator',
        quiz: [
            {
                id: 'igmp-q1',
                question: 'Which IPv4 address do IGMPv3 membership reports use as their destination?',
                options: ['224.0.0.1', '224.0.0.2', '224.0.0.22', '239.255.255.250'],
                correctAnswer: 2,
                explanation: 'IGMPv3 reports go to 224.0.0.22, the all-IGMPv3-routers group, so every multicast router on the segment can read the source lists.'
            },
            {
                id: 'igmp-q2',
                question: 'What does IGMPv3 add compared with IGMPv2?',
                options: ['Source-specific multicast filtering with include and exclude lists', 'Encryption of group traffic', 'Support for IPv6 multicast groups', 'Reliable retransmission of reports'],
                correctAnswer: 0,
                explanation: 'IGMPv3 lets a host request a group from specific sources or from all but specific sources, which is the basis of source-specific multicast.'
            }
        ]
    },
    {
        id: 'mdns',
        slug: 'mdns',
        name: 'mDNS',
        fullName: 'Multicast Domain Name System',
        category: 'network',
        osiLayer: 'Application',
        port: 5353,
        rfc: 'RFC 6762',
        yearIntroduced: 2013,
        shortSummary: 'DNS-compatible protocol that resolves .local hostnames over link-local multicast so devices can find each other without a DNS server.',
        description: 'Multicast DNS reuses the DNS message format and record types but sends queries to the multicast group 224.0.0.251 and to ff02::fb on port 5353. Every device acts as its own authoritative name server for names ending in .local, which is why printers, speakers and laptops can be discovered on a network with no configuration.',
        keyFeatures: [
            'DNS wire format with the same record types (A, AAAA, PTR, SRV, TXT)',
            'Queries and responses sent to 224.0.0.251 and ff02::fb on UDP 5353',
            'Probing and announcing to detect and defend name conflicts',
            'Cache-flush bit and a default TTL of 120 seconds for host records',
            'Often paired with DNS-SD for service instance discovery'
        ],
        useCases: ['Zero-configuration discovery of printers and file shares', 'AirPlay, Chromecast and smart home device discovery', 'Resolving hostname.local on a home or lab network'],
        pros: ['No server, no configuration and no DHCP option required', 'Works across operating systems and is built into most platforms'],
        cons: ['Traffic stays on the local link and does not cross routers', 'Chatty on large networks and reveals device names to the segment'],
        actors: [
            { id: 'laptop', label: 'Laptop (Resolver)', icon: 'Laptop', color: '#6366f1' },
            { id: 'printer', label: 'Network Printer (Responder)', icon: 'Server', color: '#10b981' }
        ],
        interactiveSteps: [
            {
                step: 1,
                title: 'Step 1: Multicast Query for a .local Name',
                description: 'The laptop sends a one-shot mDNS query for printer.local of type A to 224.0.0.251:5353, with the unicast-response bit set.',
                actorSource: 'laptop',
                actorTarget: 'printer',
                explanation: 'Because the QU bit is set the responder may answer directly by unicast, which avoids forcing every device on the link to process the reply. The query ID is usually zero since mDNS matches on the question, not the transaction ID.',
                packetInfo: {
                    id: 'mdns-pkt-1',
                    source: '192.168.1.20:5353',
                    destination: '224.0.0.251:5353',
                    type: 'mDNS Query',
                    summary: 'QNAME=printer.local | QTYPE=A | QU bit set | ID=0',
                    payload: { qname: 'printer.local', qtype: 'A', quBit: true, transactionId: 0, multicastAddress: '224.0.0.251' }
                }
            },
            {
                step: 2,
                title: 'Step 2: Responder Answers With the A Record',
                description: 'The printer replies with an authoritative A record for printer.local pointing at 192.168.1.60, setting the cache-flush bit and a 120-second TTL.',
                actorSource: 'printer',
                actorTarget: 'laptop',
                explanation: 'The cache-flush bit tells resolvers to discard older records of the same name and type, which keeps a device that changed its address from leaving stale entries behind. TTL 120 is the recommended default for records containing host names.',
                packetInfo: {
                    id: 'mdns-pkt-2',
                    source: '192.168.1.60:5353',
                    destination: '192.168.1.20:5353',
                    type: 'mDNS Response',
                    summary: 'printer.local A 192.168.1.60 | TTL=120 | cache-flush=1',
                    payload: { name: 'printer.local', recordType: 'A', address: '192.168.1.60', ttl: 120, cacheFlush: true }
                }
            },
            {
                step: 3,
                title: 'Step 3: Probing and Announcing Defends the Name',
                description: 'Before claiming a name the printer sends three probe queries 250 ms apart, then announces the record unsolicited twice so caches are refreshed.',
                actorSource: 'printer',
                actorTarget: 'laptop',
                explanation: 'Probing uses a query with the proposed record in the authority section, and any conflicting answer forces the device to pick another name. Only after the probes go unanswered does the device announce itself as authoritative for printer.local.',
                packetInfo: {
                    id: 'mdns-pkt-3',
                    source: '192.168.1.60:5353',
                    destination: '224.0.0.251:5353',
                    type: 'mDNS Probe / Announcement',
                    summary: '3 probes at 250 ms intervals | no conflict | announcement x2',
                    payload: { probes: 3, probeIntervalMs: 250, conflict: false, announcements: 2, claimedName: 'printer.local' }
                }
            }
        ],
        liveSandboxType: 'generic-simulator',
        quiz: [
            {
                id: 'mdns-q1',
                question: 'Which UDP port does mDNS use?',
                options: ['53', '5353', '5355', '1900'],
                correctAnswer: 1,
                explanation: 'mDNS listens on UDP port 5353, while unicast DNS uses 53, LLMNR uses 5355 and SSDP uses 1900.'
            },
            {
                id: 'mdns-q2',
                question: 'Which IPv4 multicast address carries mDNS queries?',
                options: ['224.0.0.251', '239.255.255.250', '224.0.0.22', '224.0.0.1'],
                correctAnswer: 0,
                explanation: 'mDNS uses 224.0.0.251 and its IPv6 counterpart ff02::fb, both on port 5353 and both scoped to the local link.'
            }
        ]
    }
];
