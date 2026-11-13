import { Protocol } from '@/types/protocol';

export const TRANSPORT_PROTOCOLS: Protocol[] = [
  {
    id: 'tcp',
    slug: 'tcp',
    name: 'TCP',
    fullName: 'Transmission Control Protocol',
    category: 'network',
    osiLayer: 'Transport',
    port: 'Variable',
    rfc: 'RFC 793, RFC 9293',
    yearIntroduced: 1974,
    shortSummary: 'Connection-oriented, reliable byte-stream protocol providing guaranteed delivery, error checking, and flow control.',
    description: 'TCP is the core transport protocol powering the World Wide Web, email, and file transfers. It provides reliable, ordered, and error-checked delivery of a stream of bytes between computers connected to an IP network.',
    keyFeatures: [
      '3-Way Handshake (SYN, SYN-ACK, ACK) for connection setup',
      'Sequence and Acknowledgement numbers for in-order reassembly',
      'Sliding Window algorithm for dynamic flow control',
      'Congestion control algorithms (Cubic, BBR, Reno)',
      'Connection teardown via FIN and ACK flags'
    ],
    useCases: ['Web browsing (HTTP/1.1 and HTTP/2)', 'SSH Remote Shell', 'Database connections', 'File transfers (FTP/SFTP)'],
    pros: ['Guaranteed packet delivery with automated retransmission', 'Prevents network congestion and buffer overflow'],
    cons: ['Head-of-Line (HoL) blocking if a packet is lost', 'Connection setup requires at least 1-RTT'],
    actors: [
      { id: 'client', label: 'Client (Initiator)', icon: 'Laptop', color: '#6366f1' },
      { id: 'server', label: 'Server (Listener)', icon: 'Server', color: '#10b981' }
    ],
    interactiveSteps: [
      {
        step: 1,
        title: 'Step 1: SYN (Synchronize)',
        description: 'Client chooses Initial Sequence Number (ISN=1000) and sends a SYN packet to initiate connection.',
        actorSource: 'client',
        actorTarget: 'server',
        explanation: 'The client informs the server that it wants to establish a connection and synchronizes sequence numbers.',
        packetInfo: {
          id: 'tcp-pkt-1',
          source: '192.168.1.50:54321',
          destination: '93.184.216.34:80',
          type: 'TCP [SYN]',
          summary: 'Seq=1000, Ack=0, Flags=[SYN], Win=65535, MSS=1460',
          payload: { flags: 'SYN', seq: 1000, ack: 0, windowSize: 65535, mss: 1460 }
        }
      },
      {
        step: 2,
        title: 'Step 2: SYN-ACK (Synchronize + Acknowledge)',
        description: 'Server accepts request, acknowledges client ISN (Ack=1001), and sends its own ISN (Seq=5000).',
        actorSource: 'server',
        actorTarget: 'client',
        explanation: 'Server allocates buffer resources and transitions to SYN_RECEIVED state.',
        packetInfo: {
          id: 'tcp-pkt-2',
          source: '93.184.216.34:80',
          destination: '192.168.1.50:54321',
          type: 'TCP [SYN, ACK]',
          summary: 'Seq=5000, Ack=1001, Flags=[SYN, ACK], Win=65535',
          payload: { flags: 'SYN, ACK', seq: 5000, ack: 1001, windowSize: 65535 }
        }
      },
      {
        step: 3,
        title: 'Step 3: ACK (Connection Established)',
        description: 'Client acknowledges server sequence number (Ack=5001). Connection transitions to ESTABLISHED.',
        actorSource: 'client',
        actorTarget: 'server',
        explanation: 'Both sides are synchronized and ready to exchange application payload data.',
        packetInfo: {
          id: 'tcp-pkt-3',
          source: '192.168.1.50:54321',
          destination: '93.184.216.34:80',
          type: 'TCP [ACK]',
          summary: 'Seq=1001, Ack=5001, Flags=[ACK] -> ESTABLISHED',
          payload: { flags: 'ACK', seq: 1001, ack: 5001, state: 'ESTABLISHED' }
        }
      }
    ],
    liveSandboxType: 'tcp-handshake',
    quiz: [
      {
        id: 'tcp-q1',
        question: 'What are the three packets in the standard TCP connection establishment handshake?',
        options: ['PING, PONG, ACK', 'SYN, SYN-ACK, ACK', 'HELLO, ACCEPT, READY', 'REQ, RES, ACK'],
        correctAnswer: 1,
        explanation: 'The 3-way handshake consists of SYN, SYN-ACK, and ACK.'
      }
    ]
  },
  {
    id: 'udp',
    slug: 'udp',
    name: 'UDP',
    fullName: 'User Datagram Protocol',
    category: 'network',
    osiLayer: 'Transport',
    port: 'Variable',
    rfc: 'RFC 768',
    yearIntroduced: 1980,
    shortSummary: 'Minimalist, connectionless transport protocol prioritizing low latency over guaranteed reliability.',
    description: 'UDP sends independent packets (datagrams) without establishing a prior connection, acknowledging receipt, or guaranteeing packet arrival order. This minimal overhead makes UDP the default choice for real-time gaming, live audio/video streaming, VoIP, and DNS.',
    keyFeatures: [
      'Connectionless datagram delivery with no handshake latency',
      'Tiny 8-byte header footprint (Source Port, Dest Port, Length, Checksum)',
      'No retransmissions, acknowledgment waits, or flow control delays',
      'Native broadcast and multicast support'
    ],
    useCases: ['Live video/audio streaming (WebRTC, IPTV)', 'Multiplayer gaming networking', 'DNS queries', 'DHCP and NTP services'],
    pros: ['Zero connection establishment latency', 'Lowest possible CPU and memory overhead'],
    cons: ['Unreliable: packets can be dropped, duplicated, or arrive out-of-order'],
    actors: [
      { id: 'gamer', label: 'Gaming Client', icon: 'Laptop', color: '#6366f1' },
      { id: 'server', label: 'Game Server', icon: 'Server', color: '#10b981' }
    ],
    interactiveSteps: [
      {
        step: 1,
        title: 'Immediate Datagram Transmission',
        description: 'Client sends player position updates immediately without waiting for any connection handshake.',
        actorSource: 'gamer',
        actorTarget: 'server',
        explanation: 'UDP simply prepends an 8-byte header and passes the datagram directly to the IP layer.',
        packetInfo: {
          id: 'udp-pkt-1',
          source: '192.168.1.10:27015',
          destination: '104.28.16.5:27015',
          type: 'UDP Datagram',
          summary: 'Len=48 bytes, Checksum=0x8f2a',
          payload: { length: 48, payload: 'player_pos: {x: 142.5, y: 92.1, z: 12.0}' }
        }
      },
      {
        step: 2,
        title: 'Server Broadcasts State',
        description: 'Server calculates world state and blasts update packets to all connected clients.',
        actorSource: 'server',
        actorTarget: 'gamer',
        explanation: 'If a packet is lost in transit, subsequent packets contain newer state, making retransmissions unnecessary.',
        packetInfo: {
          id: 'udp-pkt-2',
          source: '104.28.16.5:27015',
          destination: '192.168.1.10:27015',
          type: 'UDP Datagram',
          summary: 'Tick 64 World Snapshot',
          payload: { tick: 64, playersCount: 16 }
        }
      }
    ],
    liveSandboxType: 'generic-simulator',
    quiz: [
      {
        id: 'udp-q1',
        question: 'What is the size of the standard UDP header?',
        options: ['4 bytes', '8 bytes', '20 bytes', '32 bytes'],
        correctAnswer: 1,
        explanation: 'The UDP header is exactly 8 bytes (4 fields of 2 bytes each: Source Port, Dest Port, Length, Checksum).'
      }
    ]
  },
  {
    id: 'quic',
    slug: 'quic',
    name: 'QUIC',
    fullName: 'Quick UDP Internet Connections',
    category: 'cloud',
    osiLayer: 'Transport',
    port: '443 (over UDP)',
    rfc: 'RFC 9000',
    yearIntroduced: 2021,
    shortSummary: 'Multiplexed, encrypted transport protocol built on UDP that serves as the foundation for HTTP/3.',
    description: 'QUIC replaces TCP+TLS at the transport layer. Built directly on top of UDP, QUIC solves TCP Head-of-Line blocking by treating multiplexed streams independently, integrates TLS 1.3 encryption natively into the handshake (0-RTT or 1-RTT), and supports seamless connection migration when switching between Wi-Fi and mobile networks.',
    keyFeatures: [
      'Independent multiplexed streams (no Head-of-Line blocking across streams)',
      'Integrated TLS 1.3 encryption inside the transport header',
      '0-RTT connection establishment for returning clients',
      'Connection IDs allow seamless network migration (Wi-Fi to 5G without socket drop)'
    ],
    useCases: ['HTTP/3 web traffic', 'YouTube, Netflix and high-speed video streaming', 'Mobile apps with frequent network changes'],
    pros: ['Eliminates TCP HoL blocking', 'Extremely fast 0-RTT reconnects', 'Immune to mobile IP handoff drops'],
    cons: ['Higher server CPU utilization for user-space UDP packet processing'],
    actors: [
      { id: 'phone', label: 'Mobile Phone', icon: 'Smartphone', color: '#6366f1' },
      { id: 'edge', label: 'Cloudflare / Google Edge', icon: 'Server', color: '#06b6d4' }
    ],
    interactiveSteps: [
      {
        step: 1,
        title: 'QUIC Initial + TLS 1.3 Handshake (1-RTT)',
        description: 'Client combines transport setup and cryptographic key exchange in the very first UDP datagram.',
        actorSource: 'phone',
        actorTarget: 'edge',
        explanation: 'QUIC achieves transport connection and TLS 1.3 encryption in a single round-trip.',
        packetInfo: {
          id: 'quic-pkt-1',
          source: 'Mobile (UDP 443)',
          destination: 'Edge Server:443',
          type: 'QUIC Initial',
          summary: 'CID=0x4a12.. | Crypto: ClientHello (X25519)',
          payload: { dcid: '0x4a123bc4', scid: '0x10ef9a82', packetNumber: 0 }
        }
      },
      {
        step: 2,
        title: 'Connection Established & Stream Multiplexing',
        description: 'Server returns ServerHello + Finished. Multiple HTTP/3 request streams begin in parallel.',
        actorSource: 'edge',
        actorTarget: 'phone',
        explanation: 'If packet on Stream 1 is lost, Stream 2 and Stream 3 continue uninterrupted without delay.',
        packetInfo: {
          id: 'quic-pkt-2',
          source: 'Edge Server:443',
          destination: 'Mobile Phone',
          type: 'QUIC Handshake / 1-RTT',
          summary: 'Handshake Done | Stream ID 0, Stream ID 4 active',
          payload: { handshakeConfirmed: true, streams: [0, 4] }
        }
      }
    ],
    liveSandboxType: 'generic-simulator',
    quiz: [
      {
        id: 'quic-q1',
        question: 'What underlying transport protocol does QUIC run on top of?',
        options: ['TCP', 'UDP', 'SCTP', 'Raw Ethernet'],
        correctAnswer: 1,
        explanation: 'QUIC runs in user space on top of UDP to bypass legacy middlebox restrictions that only recognize TCP and UDP.'
      }
    ]
  },
  {
    id: 'sctp',
    slug: 'sctp',
    name: 'SCTP',
    fullName: 'Stream Control Transmission Protocol',
    category: 'network',
    osiLayer: 'Transport',
    port: 'Variable (Protocol 132)',
    rfc: 'RFC 9260',
    yearIntroduced: 2000,
    shortSummary: 'Reliable, message-oriented transport protocol supporting multi-streaming and multi-homing for telecom and WebRTC.',
    description: 'SCTP combines the message-oriented nature of UDP with the reliability and congestion control of TCP. Crucially, it introduces native multi-homing (binding a connection to multiple IP addresses) and multi-streaming. It is heavily utilized in cellular 4G/5G signaling (Diameter) and WebRTC data channels.',
    keyFeatures: [
      'Native multi-homing for high-availability carrier failover',
      'Multi-streaming without Head-of-Line blocking',
      '4-Way handshake with Cookie mechanism preventing SYN flood attacks',
      'Message-oriented framing preserving application message boundaries'
    ],
    useCases: ['Telecom SS7 & 4G/5G mobile core signaling', 'WebRTC Data Channels', 'Mission-critical air traffic control systems'],
    pros: ['Immune to SYN flood attacks due to signed cookie handshake', 'Fault tolerance across redundant IP links'],
    cons: ['Limited native OS stack support and poor NAT middlebox traversal'],
    actors: [
      { id: 'ep1', label: 'Telecom Node A (Multi-IP)', icon: 'Radio', color: '#6366f1' },
      { id: 'ep2', label: 'Telecom Node B (Multi-IP)', icon: 'Server', color: '#10b981' }
    ],
    interactiveSteps: [
      {
        step: 1,
        title: 'SCTP INIT (Initiate Association)',
        description: 'Node A transmits INIT packet declaring outbound stream count and list of supported IP addresses.',
        actorSource: 'ep1',
        actorTarget: 'ep2',
        explanation: 'Node A specifies multiple IP addresses for link redundancy.',
        packetInfo: {
          id: 'sctp-pkt-1',
          source: '10.1.1.1 (and 10.1.2.1)',
          destination: '10.2.1.1:3868',
          type: 'SCTP INIT',
          summary: 'Initiate Tag: 0x3fa9, Inbound Streams: 16',
          payload: { tag: '0x3fa9', numOutboundStreams: 16, ipList: ['10.1.1.1', '10.1.2.1'] }
        }
      },
      {
        step: 2,
        title: 'SCTP INIT-ACK with State Cookie',
        description: 'Node B replies with INIT-ACK containing an encrypted HMAC State Cookie without allocating memory.',
        actorSource: 'ep2',
        actorTarget: 'ep1',
        explanation: 'Because Node B allocates zero state before cookie return, SCTP is immune to SYN-flood denial of service.',
        packetInfo: {
          id: 'sctp-pkt-2',
          source: '10.2.1.1:3868',
          destination: '10.1.1.1',
          type: 'SCTP INIT-ACK',
          summary: 'State Cookie: 0x8a92... (Signed)',
          payload: { stateCookie: 'HMAC_SHA256(...)', expires: '60s' }
        }
      }
    ],
    liveSandboxType: 'generic-simulator',
    quiz: [
      {
        id: 'sctp-q1',
        question: 'How does the SCTP 4-way handshake prevent SYN flood denial-of-service attacks?',
        options: [
          'By using a signed State Cookie instead of allocating memory upon INIT',
          'By blocking all incoming UDP packets',
          'By requiring pre-shared TLS certificates',
          'By limiting connection attempts to 1 per second'
        ],
        correctAnswer: 0,
        explanation: 'The server returns a signed State Cookie in the INIT-ACK and allocates zero local memory state until the client returns the cookie in COOKIE-ECHO.'
      }
    ]
  }
];

