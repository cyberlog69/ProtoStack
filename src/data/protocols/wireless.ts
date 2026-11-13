import { Protocol } from '@/types/protocol';

export const WIRELESS_PROTOCOLS: Protocol[] = [
  {
    id: 'wifi',
    slug: 'wifi',
    name: 'Wi-Fi (802.11)',
    fullName: 'IEEE 802.11 Wireless LAN',
    category: 'wireless',
    osiLayer: 'Data Link',
    port: '2.4 / 5 / 6 GHz Radio',
    rfc: 'IEEE 802.11ax / 802.11be',
    yearIntroduced: 1997,
    shortSummary: 'Ubiquitous wireless local area network technology connecting computers, phones, and smart devices via radio waves.',
    description: 'IEEE 802.11 (commercially branded as Wi-Fi 6, 6E, and 7) specifies over-the-air modulation, CSMA/CA collision avoidance, and WPA3 security protocols that enable wireless networking over 2.4 GHz, 5 GHz, and 6 GHz spectrum bands.',
    keyFeatures: [
      'CSMA/CA (Carrier Sense Multiple Access with Collision Avoidance)',
      'OFDMA (Orthogonal Frequency-Division Multiple Access) dividing channels into resource units',
      'MU-MIMO (Multi-User Multiple-Input Multiple-Output) concurrent beamforming',
      'WPA3-SAE (Simultaneous Authentication of Equals) handshake'
    ],
    useCases: ['Home and office high-speed wireless connectivity', 'Campus enterprise roaming', 'Public municipal Wi-Fi hotspots'],
    pros: ['Multi-gigabit wireless speeds', 'Universal compatibility across every consumer electronics device'],
    cons: ['Radio interference in congested 2.4 GHz bands', 'Physical walls and obstacles attenuate higher frequency 5/6 GHz signals'],
    actors: [
      { id: 'laptop', label: 'Laptop Client (STA)', icon: 'Laptop', color: '#6366f1' },
      { id: 'ap', label: 'Wireless Access Point (AP)', icon: 'Radio', color: '#10b981' }
    ],
    interactiveSteps: [
      {
        step: 1,
        title: '802.11 Probe Request & Beacon Frame',
        description: 'AP periodically broadcasts Beacon frames with SSID and supported data rates. Client responds with Probe Request.',
        actorSource: 'laptop',
        actorTarget: 'ap',
        explanation: 'Frames include BSSID (AP MAC address), signal strength (RSSI), and WPA3 security capabilities.',
        packetInfo: {
          id: 'wifi-pkt-1',
          source: 'STA (c4:b3:01:..)',
          destination: 'AP (e0:d5:5e:..)',
          type: '802.11 Probe Request',
          summary: 'SSID: "ProtoNet-5G" | Band: 5 GHz (Ch 36) | RSSI: -48dBm',
          payload: { frameControl: '0x0040', supportedRates: ['6.0', '54.0', 'HE-MCS 11'] }
        }
      },
      {
        step: 2,
        title: 'WPA3 SAE (Dragonfly) 4-Way Handshake',
        description: 'Client and AP execute Simultaneous Authentication of Equals to derive Pairwise Master Key (PMK).',
        actorSource: 'ap',
        actorTarget: 'laptop',
        explanation: 'WPA3 protects against offline dictionary password attacks even if a user chooses a weak password.',
        packetInfo: {
          id: 'wifi-pkt-2',
          source: 'Access Point',
          destination: 'Laptop',
          type: 'EAPOL 4-Way Handshake',
          summary: 'Message 3/4: PTK Derived, GTK Encrypted (AES-CCMP-256)',
          payload: { ptkDerived: true, keyDescriptorVersion: 'WPA3-SAE' }
        }
      },
      {
        step: 3,
        title: 'Encrypted QoS Data (A-MPDU) with Block ACK',
        description: 'Client encrypts QoS Data frames with the derived pairwise key, aggregates them into an A-MPDU, and the AP returns a Block ACK.',
        actorSource: 'laptop',
        actorTarget: 'ap',
        explanation: 'AES-CCMP/GCMP encryption protects each MPDU, and block acknowledgment confirms every subframe without a separate ACK per frame.',
        packetInfo: {
          id: 'wifi-pkt-3',
          source: 'STA (c4:b3:01:..)',
          destination: 'AP (e0:d5:5e:..)',
          type: '802.11 QoS Data (A-MPDU)',
          summary: 'TID: 6 (Voice) | MPDUs: 8 | Length: 31,896 bytes | Block ACK: Received',
          payload: { cipher: 'GCMP-256', tid: 6, mpduCount: 8, blockAck: true }
        }
      }
    ],
    liveSandboxType: 'generic-simulator',
    quiz: [
      {
        id: 'wifi-q1',
        question: 'Which collision mechanism does Wi-Fi 802.11 use because wireless transmitters cannot listen while transmitting?',
        options: ['CSMA/CD (Collision Detection)', 'CSMA/CA (Collision Avoidance)', 'Token Ring', 'ALOHA'],
        correctAnswer: 1,
        explanation: 'Wi-Fi uses CSMA/CA (Collision Avoidance) with Request to Send / Clear to Send (RTS/CTS) and random backoff.'
      },
      {
        id: 'wifi-q2',
        question: 'Which frequency band did Wi-Fi 6E add for 802.11ax operation?',
        options: ['2.4 GHz', '5 GHz', '6 GHz', '60 GHz'],
        correctAnswer: 2,
        explanation: 'Wi-Fi 6E extends 802.11ax into the 6 GHz band, which adds up to 1,200 MHz of relatively clean spectrum and many more non-overlapping channels.'
      }
    ]
  },
  {
    id: 'nfc',
    slug: 'nfc',
    name: 'NFC',
    fullName: 'Near Field Communication',
    category: 'wireless',
    osiLayer: 'Physical',
    port: '13.56 MHz Radio',
    rfc: 'ISO/IEC 18092 / NFC Forum',
    yearIntroduced: 2004,
    shortSummary: 'Ultra-short range high-frequency wireless standard enabling contactless tap payments and identity card reading.',
    description: 'NFC operates at 13.56 MHz over distances of 4 centimeters or less. Using magnetic inductive coupling, an active device (like an iPhone or Android phone) can wirelessly power an unpowered passive tag to process Apple Pay / Google Pay transactions, transit passes, or building door access.',
    keyFeatures: [
      'Operating distance: under 4 centimeters (inherent physical proximity security)',
      'Three modes: Card Emulation (payments), Reader/Writer (tags), and Peer-to-Peer',
      'Electromagnetic induction powers battery-less passive cards and stickers',
      'Fast coupling in under 100 milliseconds'
    ],
    useCases: ['Contactless tap-to-pay (Apple Pay, Google Pay, Visa payWave)', 'Public subway and bus transit smartcards (Oyster, Suica)', 'Hotel keycard door access'],
    pros: ['Near-impossible to eavesdrop remotely without physical proximity', 'Passive tags require zero battery and cost pennies'],
    cons: ['Requires contact or close tap (~2–4 cm)', 'Maximum transfer speed limited to 424 kbps'],
    actors: [
      { id: 'phone', label: 'Smartphone (Active Initiator)', icon: 'Smartphone', color: '#6366f1' },
      { id: 'pos', label: 'Payment POS Terminal (Reader)', icon: 'CreditCard', color: '#10b981' }
    ],
    interactiveSteps: [
      {
        step: 1,
        title: 'Magnetic Inductive Field Coupling',
        description: 'User taps phone within 2 cm of terminal. 13.56 MHz magnetic field energizes secure element antenna.',
        actorSource: 'phone',
        actorTarget: 'pos',
        explanation: 'Card Emulation mode initiates ISO 14443-A communication in 30ms.',
        packetInfo: {
          id: 'nfc-pkt-1',
          source: 'Phone Secure Element',
          destination: 'POS Antenna',
          type: 'ISO 14443-A REQA',
          summary: 'ATQA: 0x0004 | SAK: 0x20 | UID: 0x3a19b2',
          payload: { modulation: '100% ASK', speed: '424 kbps', standard: 'ISO/IEC 14443-4' }
        }
      },
      {
        step: 2,
        title: 'Tokenized EMV Payment Cryptogram Exchange',
        description: 'Secure Element releases encrypted one-time payment cryptogram (Application Protocol Data Unit - APDU).',
        actorSource: 'phone',
        actorTarget: 'pos',
        explanation: 'No actual credit card numbers are transmitted; only a one-time dynamic token cryptogram.',
        packetInfo: {
          id: 'nfc-pkt-2',
          source: 'Secure Enclave',
          destination: 'Payment Terminal',
          type: 'APDU (Select EMV AID)',
          summary: 'AID: A0000000041010 | Cryptogram: TC_9a2f...',
          payload: { responseCode: '9000 (Success)', cryptogramApproved: true }
        }
      },
      {
        step: 3,
        title: 'Terminal Decision and RF Field Release (DESELECT)',
        description: 'Reader sends the closing APDU response with status word 9000, then deselects the emulated card and releases the 13.56 MHz field.',
        actorSource: 'pos',
        actorTarget: 'phone',
        explanation: 'The cryptogram is forwarded to the acquirer for authorization while the tap already completes; ISO/IEC 14443-3 DESELECT ends the session cleanly.',
        packetInfo: {
          id: 'nfc-pkt-3',
          source: 'Payment Terminal',
          destination: 'Phone Secure Element',
          type: 'APDU Response (Generate AC)',
          summary: 'SW1SW2: 0x9000 | CID: 0x2F | Terminal Decision: APPROVED',
          payload: { sw1sw2: '9000', cid: '0x2F', onlineAuthorization: true, fieldReleased: true }
        }
      }
    ],
    liveSandboxType: 'generic-simulator',
    quiz: [
      {
        id: 'nfc-q1',
        question: 'What is the carrier frequency used by Near Field Communication (NFC)?',
        options: ['433 MHz', '915 MHz', '13.56 MHz', '2.4 GHz'],
        correctAnswer: 2,
        explanation: 'NFC operates at the globally allocated ISM band frequency of 13.56 MHz.'
      },
      {
        id: 'nfc-q2',
        question: 'Which NFC operating mode lets a smartphone present itself to a payment terminal as a contactless card?',
        options: ['Reader/Writer mode', 'Peer-to-Peer mode', 'Card Emulation mode', 'Tag Emulation mode'],
        correctAnswer: 2,
        explanation: 'In Card Emulation mode the phone answers ISO/IEC 14443 commands as if it were a smartcard, which is how Apple Pay and Google Pay taps are processed.'
      }
    ]
  },
  {
    id: '5g-nr',
    slug: '5g-nr',
    name: '5G NR',
    fullName: '5G New Radio',
    category: 'wireless',
    osiLayer: 'Physical',
    port: 'Sub-6 GHz & mmWave',
    rfc: '3GPP Release 15/16/17',
    yearIntroduced: 2018,
    shortSummary: 'Fifth-generation global cellular standard delivering multi-Gbps peak rates, ultra-low latency, and massive IoT capacity.',
    description: '5G New Radio (5G NR) is the global radio interface defined by 3GPP. It targets three foundational pillars: Enhanced Mobile Broadband (eMBB) delivering 10+ Gbps speeds, Ultra-Reliable Low Latency Communications (URLLC) with sub-1ms radio latency, and Massive Machine-Type Communications (mMTC) supporting up to 1 million IoT devices per square kilometer.',
    keyFeatures: [
      'Sub-6 GHz (FR1) and Millimeter-Wave mmWave 24–40 GHz (FR2)',
      'Network Slicing: dedicated virtual networks for emergency, autonomous vehicle, or IoT traffic',
      'Massive MIMO beamforming with hundreds of antenna elements',
      'Ultra-Reliable Low Latency (URLLC) down to 1 millisecond'
    ],
    useCases: ['Autonomous connected vehicle telematics (C-V2X)', 'Remote robotic surgery and healthcare', 'Fixed Wireless Access (FWA) home broadband'],
    pros: ['Multi-gigabit mobile speeds and extreme spectral efficiency', 'Connects up to 1,000,000 devices per km²'],
    cons: ['Millimeter-wave signals are easily blocked by rain, foliage, and window glass, requiring dense small-cell deployments'],
    actors: [
      { id: 'ue', label: '5G Smartphone / IoT Node (UE)', icon: 'Smartphone', color: '#6366f1' },
      { id: 'gnb', label: '5G Base Station (gNodeB)', icon: 'Radio', color: '#10b981' },
      { id: 'core', label: '5G Core Network (5GC)', icon: 'Server', color: '#06b6d4' }
    ],
    interactiveSteps: [
      {
        step: 1,
        title: 'Random Access Preamble (RACH)',
        description: 'Device transmits preamble signature to gNodeB to synchronize uplink timing.',
        actorSource: 'ue',
        actorTarget: 'gnb',
        explanation: 'Base station responds with Timing Advance command and Uplink Grant.',
        packetInfo: {
          id: '5g-pkt-1',
          source: 'UE Radio',
          destination: 'gNodeB Tower',
          type: 'PRACH (Random Access)',
          summary: 'RAPID: 24, Timing Advance: 14, Subcarrier Spacing: 30 kHz',
          payload: { preambleIndex: 24, cellId: 'gNB_0042' }
        }
      },
      {
        step: 2,
        title: 'RRC Connection & 5GC Network Slice Activation',
        description: 'Device requests RRC Setup. 5G Core Network provisions dedicated URLLC network slice for low-latency telemetry.',
        actorSource: 'gnb',
        actorTarget: 'core',
        explanation: 'Session Management Function (SMF) activates User Plane Function (UPF) tunnel with guaranteed QoS Flow.',
        packetInfo: {
          id: '5g-pkt-2',
          source: 'gNodeB',
          destination: '5G Core (UPF/AMF)',
          type: 'NGAP PDU Session Resource Setup',
          summary: 'Slice: URLLC (SST=2) | Latency Budget: < 5ms',
          payload: { sst: 2, sd: '0x000001', qosFlowId: 1, pduSessionId: 1 }
        }
      },
      {
        step: 3,
        title: 'Beamformed User-Plane Traffic on the PDU Session',
        description: 'UE and gNodeB exchange user payload inside QoS Flow 1 using massive MIMO beamforming on the FR1 carrier.',
        actorSource: 'ue',
        actorTarget: 'gnb',
        explanation: 'The UPF anchors the PDU session while SDAP maps each packet to QFI 1, giving the slice its guaranteed bit rate and latency budget.',
        packetInfo: {
          id: '5g-pkt-3',
          source: 'UE (IMSI 310410...)',
          destination: 'gNodeB (Cell 0042)',
          type: 'NR User Plane (SDAP/PDCP PDU)',
          summary: 'QFI: 1 | 5QI: 82 | SSB Beam: 3 | MCS 27 (256-QAM)',
          payload: { qfi: 1, fiveQi: 82, mcs: 27, modulation: '256-QAM', harqId: 2 }
        }
      }
    ],
    liveSandboxType: 'generic-simulator',
    quiz: [
      {
        id: '5g-q1',
        question: 'Which 5G pillar is designed for mission-critical applications requiring sub-1ms latency and 99.999% reliability?',
        options: ['eMBB (Enhanced Mobile Broadband)', 'URLLC (Ultra-Reliable Low Latency Communications)', 'mMTC (Massive Machine Type)', 'FWA'],
        correctAnswer: 1,
        explanation: 'URLLC is engineered specifically for mission-critical use cases like automated factory robotics and autonomous driving.'
      },
      {
        id: '5g-q2',
        question: 'Which 5G core network function is responsible for establishing and managing PDU sessions?',
        options: ['AMF (Access and Mobility Management Function)', 'SMF (Session Management Function)', 'UPF (User Plane Function)', 'NRF (Network Repository Function)'],
        correctAnswer: 1,
        explanation: 'The SMF handles PDU session establishment, IP address allocation, and selection of the UPF that carries the user-plane traffic.'
      }
    ]
  },
  {
    id: 'ethernet',
    slug: 'ethernet',
    name: 'Ethernet (802.3)',
    fullName: 'IEEE 802.3 Wired LAN',
    category: 'wireless',
    osiLayer: 'Data Link',
    port: 'RJ45 / SFP+ Optical',
    rfc: 'IEEE 802.3 Standard',
    yearIntroduced: 1980,
    shortSummary: 'The universal physical and data-link standard powering wired computer networks, data centers, and internet exchanges.',
    description: 'Ethernet is the predominant wired networking technology for local area networks (LANs) and metropolitan networks. From 10 Mbps over coaxial cables in the 1980s to 100 Gbps, 400 Gbps, and 800 Gbps fiber links in modern hyperscale cloud data centers, Ethernet frames transport virtually all IP traffic.',
    keyFeatures: [
      'Standardized 1518-byte MTU frame structure (Preamble, MACs, EtherType, Payload, CRC)',
      'VLAN Tagging (IEEE 802.1Q) for logical network isolation and trunking',
      'Auto-negotiation for duplex mode (Full-Duplex) and speed (1G/10G/40G/100G/400G)',
      '48-bit physical MAC addressing'
    ],
    useCases: ['High-throughput cloud data center spine-leaf interconnects', 'Enterprise office desktop Gigabit links', 'Industrial Power-over-Ethernet (PoE) security cameras'],
    pros: ['Extreme reliability, immunity to RF noise, and low latency (sub-microsecond)', 'Massive bandwidth scaling up to 800 Gbps'],
    cons: ['Requires physical cable runs (Cat6/Cat6A or optical fiber transceiver pairs)'],
    actors: [
      { id: 'server', label: 'Rack Server (NIC)', icon: 'Server', color: '#6366f1' },
      { id: 'switch', label: 'Top-of-Rack Switch', icon: 'Network', color: '#10b981' }
    ],
    interactiveSteps: [
      {
        step: 1,
        title: 'Ethernet II Frame Encapsulation',
        description: 'Server NIC constructs Ethernet frame with Destination MAC, Source MAC, EtherType 0x0800 (IPv4), and payload.',
        actorSource: 'server',
        actorTarget: 'switch',
        explanation: 'A 4-byte Frame Check Sequence (CRC-32) is appended to detect any physical layer bit errors.',
        packetInfo: {
          id: 'eth-pkt-1',
          source: '00:1e:67:89:ab:cd',
          destination: '00:00:5e:00:53:01',
          type: 'Ethernet II Frame',
          summary: 'EtherType: 0x0800 (IPv4) | Length: 1514 bytes',
          payload: { preamble: '0x55555555555555d5', etherType: '0x0800 (IPv4)', fcs: '0xa4192b01' }
        }
      },
      {
        step: 2,
        title: 'MAC Address Learning & Cut-Through Forwarding',
        description: 'Switch learns server MAC on port 1 in its CAM table and switches frame to destination port in 400 nanoseconds.',
        actorSource: 'switch',
        actorTarget: 'server',
        explanation: 'Hardware ASICs perform lookups at full line rate with zero CPU intervention.',
        packetInfo: {
          id: 'eth-pkt-2',
          source: 'Switch Port 1',
          destination: 'Switch Port 24 (Uplink)',
          type: 'Hardware Switching',
          summary: 'CAM Table Match: Port 24 | Latency: 420ns',
          payload: { vlanId: 10, priority: 5 }
        }
      },
      {
        step: 3,
        title: 'FCS Verification and Frame Discard on CRC Error',
        description: 'Receiving port recomputes the CRC-32 over the frame, finds it does not match the received FCS, and silently drops the frame.',
        actorSource: 'server',
        actorTarget: 'switch',
        explanation: 'Ethernet has no Layer 2 retransmission, so a frame failing the Frame Check Sequence is discarded and recovery is left to TCP or the application.',
        packetInfo: {
          id: 'eth-pkt-3',
          source: '00:1e:67:89:ab:cd',
          destination: '00:00:5e:00:53:01',
          type: 'Ethernet II Frame (FCS Error)',
          summary: 'Received FCS: 0x7c1e44aa | Computed FCS: 0xa4192b01 | Action: DISCARD',
          payload: { vlanId: 10, fcsReceived: '0x7c1e44aa', fcsComputed: '0xa4192b01', framesDropped: 1 }
        }
      }
    ],
    liveSandboxType: 'generic-simulator',
    quiz: [
      {
        id: 'eth-q1',
        question: 'What is the standard Maximum Transmission Unit (MTU) payload size for a traditional standard Ethernet frame?',
        options: ['512 bytes', '1500 bytes', '4096 bytes', '9000 bytes'],
        correctAnswer: 1,
        explanation: 'The standard Ethernet payload MTU is 1500 bytes (frames up to 9000 bytes are known as Jumbo Frames).'
      },
      {
        id: 'eth-q2',
        question: 'Which IEEE standard defines Ethernet VLAN tagging, and what does it insert into the frame?',
        options: ['802.1Q — a 4-byte tag after the source MAC address', '802.3af — a 2-byte tag before the preamble', '802.1X — an 8-byte tag after the FCS', '802.3ad — no tag, only link aggregation'],
        correctAnswer: 0,
        explanation: 'IEEE 802.1Q inserts a 4-byte tag (2-byte TPID 0x8100 plus a 2-byte control field carrying a 12-bit VLAN ID) between the source MAC and EtherType.'
      }
    ]
  }
];

