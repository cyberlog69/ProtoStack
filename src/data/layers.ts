export interface LayerInfo {
  number: number;
  name: string;
  tcpIpEquivalent: string;
  pdu: string; // Protocol Data Unit
  devices: string[];
  purpose: string;
  description: string;
  functions: string[];
  color: string;
  protocols: { name: string; slug?: string }[];
  analogy: string;
}

export const OSI_LAYERS: LayerInfo[] = [
  {
    number: 7,
    name: 'Application Layer',
    tcpIpEquivalent: 'Application Layer',
    pdu: 'Data / Message',
    devices: ['Host Computer', 'Smartphones', 'IoT Edge Devices', 'L7 Load Balancers', 'Web Application Firewalls (WAF)'],
    purpose: 'Direct interface with user software applications, providing network services and APIs.',
    description: 'The Application layer is closest to the end user. It enables software applications to communicate over the network. When you visit a website, send an email, or query an IoT sensor, application layer protocols format and initiate the request.',
    functions: [
      'Identifies communication partners and resource availability',
      'Synchronizes application communication',
      'Provides user-facing protocols for web, file transfer, and mail',
      'API serialization (REST, GraphQL, gRPC Protobuf)'
    ],
    color: 'from-purple-500/20 to-purple-600/30 border-purple-500/40 text-purple-300',
    protocols: [
      { name: 'HTTP / HTTPS', slug: 'http' },
      { name: 'DNS', slug: 'dns' },
      { name: 'MQTT', slug: 'mqtt' },
      { name: 'CoAP', slug: 'coap' },
      { name: 'WebSocket', slug: 'websocket' },
      { name: 'SSH', slug: 'ssh' },
      { name: 'gRPC', slug: 'grpc' },
      { name: 'SNMP', slug: 'snmp' },
      { name: 'SMTP', slug: 'smtp' },
      { name: 'Modbus TCP', slug: 'modbus' },
      { name: 'Matter', slug: 'matter' }
    ],
    analogy: 'The content of your handwritten letter (the actual message you want to communicate).'
  },
  {
    number: 6,
    name: 'Presentation Layer',
    tcpIpEquivalent: 'Application Layer',
    pdu: 'Formatted Data',
    devices: ['Operating System Libraries', 'Crypto Accelerators', 'Application Runtimes'],
    purpose: 'Translates, encrypts, and compresses data so it can be understood by both endpoints.',
    description: 'The Presentation layer acts as the network translator. It formats data (ASCII, Unicode, UTF-8, JSON, XML), handles cryptographic encryption/decryption (TLS/SSL), and applies compression algorithms (Gzip, Brotli) before transmission.',
    functions: [
      'Data character-code translation (e.g. ASCII to Unicode)',
      'Data encryption & decryption (TLS 1.3, SSL)',
      'Data compression and decompression (Gzip, Deflate, Brotli)',
      'Media format standards (JPEG, PNG, MP4, Protobuf)'
    ],
    color: 'from-indigo-500/20 to-indigo-600/30 border-indigo-500/40 text-indigo-300',
    protocols: [
      { name: 'TLS 1.3', slug: 'tls' },
      { name: 'MIME', slug: 'smtp' },
      { name: 'JSON / XML', slug: 'http' },
      { name: 'Protobuf', slug: 'grpc' }
    ],
    analogy: 'Translating the letter into a common language (e.g., English) and encrypting it in secret code.'
  },
  {
    number: 5,
    name: 'Session Layer',
    tcpIpEquivalent: 'Application Layer',
    pdu: 'Session Data',
    devices: ['Operating System Sockets', 'RPC Daemons', 'Gateway Session Managers'],
    purpose: 'Establishes, manages, synchronizes, and terminates communication sessions between applications.',
    description: 'The Session layer sets up, coordinates, and ends conversations between applications. It manages full-duplex or half-duplex communication and handles checkpointing so that if a transfer fails, it resumes from the last known checkpoint rather than starting over.',
    functions: [
      'Session establishment, maintenance, and teardown',
      'Dialogue control (duplex mode coordination)',
      'Synchronization checkpoints and session recovery',
      'RPC session identification'
    ],
    color: 'from-blue-500/20 to-blue-600/30 border-blue-500/40 text-blue-300',
    protocols: [
      { name: 'RPC', slug: 'grpc' },
      { name: 'NetBIOS' },
      { name: 'PPTP' },
      { name: 'SOCKS5' }
    ],
    analogy: 'Calling someone on the phone, confirming they hear you, and keeping the line open.'
  },
  {
    number: 4,
    name: 'Transport Layer',
    tcpIpEquivalent: 'Transport Layer (Host-to-Host)',
    pdu: 'Segment (TCP) / Datagram (UDP)',
    devices: ['L4 Firewalls', 'Stateful Packet Filters', 'Operating System Network Stacks'],
    purpose: 'Provides end-to-end communication, port addressing, reliability, flow control, and segmentation.',
    description: 'The Transport layer is responsible for transferring data between end hosts. It uses Port Numbers (e.g. 80, 443, 22) to deliver data to the correct application process. TCP provides guaranteed ordered delivery, while UDP offers fast connectionless transmission.',
    functions: [
      'Port addressing (multiplexing multiple apps over one IP address)',
      'Segmentation of large data into segments and reassembly',
      'Connection management (TCP 3-Way Handshake: SYN, SYN-ACK, ACK)',
      'Flow control via Sliding Window and congestion control algorithms (Cubic, BBR)'
    ],
    color: 'from-cyan-500/20 to-cyan-600/30 border-cyan-500/40 text-cyan-300',
    protocols: [
      { name: 'TCP', slug: 'tcp' },
      { name: 'UDP', slug: 'udp' },
      { name: 'QUIC', slug: 'quic' },
      { name: 'SCTP', slug: 'sctp' }
    ],
    analogy: 'Choosing Certified Registered Mail (TCP with receipt verification) or Regular Postcard (UDP).'
  },
  {
    number: 3,
    name: 'Network Layer',
    tcpIpEquivalent: 'Internet / Network Layer',
    pdu: 'Packet / Datagram',
    devices: ['Routers', 'Layer 3 Switches', 'IP Gateways'],
    purpose: 'Logical addressing (IP addresses) and path selection (routing) across interconnected networks.',
    description: 'The Network layer enables packets to hop across different networks and routers to reach their destination anywhere on Earth. Routers inspect the destination IP address, consult routing tables (via BGP, OSPF), and forward the packet towards its destination.',
    functions: [
      'Logical host addressing (IPv4 32-bit & IPv6 128-bit addresses)',
      'Routing path determination (Dijkstra SPF, BGP Path Vector)',
      'Hop-by-hop packet forwarding and TTL decrementing',
      'Subnetting, NAT translation, and packet fragmentation'
    ],
    color: 'from-emerald-500/20 to-emerald-600/30 border-emerald-500/40 text-emerald-300',
    protocols: [
      { name: 'IPv4', slug: 'ipv4' },
      { name: 'IPv6', slug: 'ipv6' },
      { name: 'ICMP', slug: 'icmp' },
      { name: 'BGP', slug: 'bgp' },
      { name: 'OSPF', slug: 'ospf' },
      { name: 'IPsec', slug: 'ipsec' }
    ],
    analogy: 'The postal address and ZIP code written on the envelope that postal sorting hubs read.'
  },
  {
    number: 2,
    name: 'Data Link Layer',
    tcpIpEquivalent: 'Network Access / Link Layer',
    pdu: 'Frame',
    devices: ['Network Switches', 'Wireless Access Points (WAP)', 'Network Interface Cards (NIC)', 'Bridges'],
    purpose: 'Physical hardware addressing (MAC addresses), framing, and node-to-node hop delivery on a local subnet.',
    description: 'The Data Link layer handles physical frame delivery between adjacent nodes connected on the exact same local physical network (LAN, Wi-Fi link, or direct cable). It wraps packets with physical MAC addresses and calculates a CRC-32 Frame Check Sequence (FCS) to detect hardware errors.',
    functions: [
      'Framing: encapsulates packets into Ethernet frames with Preamble and FCS',
      'Physical hardware addressing (48-bit MAC addresses like 00:1A:2B:3C:4D:5E)',
      'Media Access Control: CSMA/CD (Ethernet) & CSMA/CA (Wi-Fi)',
      'Error detection via CRC-32 Frame Check Sequence'
    ],
    color: 'from-amber-500/20 to-amber-600/30 border-amber-500/40 text-amber-300',
    protocols: [
      { name: 'Ethernet (802.3)', slug: 'ethernet' },
      { name: 'Wi-Fi (802.11)', slug: 'wifi' },
      { name: 'ARP', slug: 'arp' },
      { name: 'Zigbee (802.15.4)', slug: 'zigbee' },
      { name: 'BLE', slug: 'ble' },
      { name: 'LoRaWAN', slug: 'lorawan' }
    ],
    analogy: 'The delivery truck transporting the bin of mail between local distribution hubs.'
  },
  {
    number: 1,
    name: 'Physical Layer',
    tcpIpEquivalent: 'Network Access / Link Layer',
    pdu: 'Bits / Raw Signals',
    devices: ['Ethernet Cables (Cat6/Cat6A)', 'Optical Fiber (Single/Multi-Mode)', 'Radio Antennas', 'Repeaters', 'Hubs'],
    purpose: 'Transmits unstructured raw bitstreams over a physical transmission medium.',
    description: 'The Physical layer is the hardware foundation of all computer networking. It converts binary bits (0s and 1s) into physical signals — electrical voltages through copper cables, pulses of light through optical fiber, or modulated radio waves over the air.',
    functions: [
      'Bit-level transmission (encoding 1s and 0s into physical signals)',
      'Signal modulation: frequency, amplitude, and phase shift keying',
      'Physical topologies and pinouts (RJ45, SFP+, Coaxial, USB)',
      'Data rate and bit synchronization timing'
    ],
    color: 'from-rose-500/20 to-rose-600/30 border-rose-500/40 text-rose-300',
    protocols: [
      { name: '1000BASE-T Ethernet', slug: 'ethernet' },
      { name: 'Optical Fiber (100G SFP28)', slug: 'ethernet' },
      { name: '5G NR Radio', slug: '5g-nr' },
      { name: 'NFC 13.56 MHz', slug: 'nfc' }
    ],
    analogy: 'The actual physical paved road, railway track, or air lane that the vehicles travel upon.'
  }
];

export const TCPIP_LAYERS = [
  {
    number: 4,
    name: 'Application Layer',
    osiLayersCovered: 'Layers 7, 6, 5 (Application, Presentation, Session)',
    pdu: 'Data / Messages',
    purpose: 'User-facing protocols, data formatting, encryption, and session state all handled in user-space software.',
    protocols: ['HTTP/HTTPS', 'DNS', 'MQTT', 'SSH', 'WebSocket', 'gRPC', 'TLS 1.3', 'SMTP']
  },
  {
    number: 3,
    name: 'Transport Layer',
    osiLayersCovered: 'Layer 4 (Transport)',
    pdu: 'Segment / Datagram',
    purpose: 'Host-to-host process communication, port multiplexing, and reliability (TCP/UDP/QUIC).',
    protocols: ['TCP', 'UDP', 'QUIC', 'SCTP']
  },
  {
    number: 2,
    name: 'Internet Layer',
    osiLayersCovered: 'Layer 3 (Network)',
    pdu: 'Packet',
    purpose: 'Routing packets across independent networks using logical IP addresses.',
    protocols: ['IPv4', 'IPv6', 'ICMP', 'BGP', 'OSPF', 'IPsec']
  },
  {
    number: 1,
    name: 'Network Access Layer (Link Layer)',
    osiLayersCovered: 'Layers 2, 1 (Data Link & Physical)',
    pdu: 'Frame & Bits',
    purpose: 'Interface with local physical network hardware (Ethernet, Wi-Fi, optical fiber, radio).',
    protocols: ['Ethernet (802.3)', 'Wi-Fi (802.11)', 'ARP', '5G NR', 'Zigbee', 'LoRaWAN']
  }
];

export interface EncapsulationStep {
  layerNumber: number;
  layerName: string;
  pduName: string;
  action: string;
  headerAdded: string;
  explanation: string;
  visualRepresentation: {
    headers: string[];
    payload: string;
    trailers?: string[];
  };
}

export const ENCAPSULATION_STEPS: EncapsulationStep[] = [
  {
    layerNumber: 7,
    layerName: 'Application Layer',
    pduName: 'Application Data',
    action: 'Generate Application Payload',
    headerAdded: 'HTTP/1.1 Request Header',
    explanation: 'User browser creates the HTTP request payload: `GET /telemetry HTTP/1.1\\r\\nHost: api.iot.org`.',
    visualRepresentation: {
      headers: ['HTTP Header (GET /telemetry)'],
      payload: '{"temp": 24.5, "unit": "C"}'
    }
  },
  {
    layerNumber: 6,
    layerName: 'Presentation Layer',
    pduName: 'Encrypted Data',
    action: 'TLS 1.3 Encryption & Formatting',
    headerAdded: 'TLS Record Header',
    explanation: 'Payload is compressed and encrypted with AES-256-GCM symmetric key. A 5-byte TLS Record header is attached.',
    visualRepresentation: {
      headers: ['TLS Header', 'HTTP Header'],
      payload: '[Encrypted Ciphertext: 0x9f1a2b...]'
    }
  },
  {
    layerNumber: 5,
    layerName: 'Session Layer',
    pduName: 'Session Data',
    action: 'Session Management',
    headerAdded: 'Session Token / Socket Context',
    explanation: 'Operating system establishes and tags session context to track the bi-directional communication socket.',
    visualRepresentation: {
      headers: ['Session Context', 'TLS Header', 'HTTP Header'],
      payload: '[Encrypted Ciphertext]'
    }
  },
  {
    layerNumber: 4,
    layerName: 'Transport Layer',
    pduName: 'TCP Segment',
    action: 'Encapsulate into TCP Segment',
    headerAdded: '20-Byte TCP Header',
    explanation: 'Transport layer prepends a 20-byte TCP header with Source Port 54321, Dest Port 443, Seq=1000, Ack=0, and Flags=[PSH, ACK].',
    visualRepresentation: {
      headers: ['TCP Header (Port 54321 -> 443, Seq=1000)', 'TLS Header', 'HTTP Header'],
      payload: '[Payload Data]'
    }
  },
  {
    layerNumber: 3,
    layerName: 'Network Layer',
    pduName: 'IP Packet',
    action: 'Encapsulate into IP Packet',
    headerAdded: '20-Byte IPv4 Header',
    explanation: 'Network layer prepends a 20-byte IPv4 header containing Source IP 192.168.1.100, Dest IP 104.16.132.229, and TTL 64.',
    visualRepresentation: {
      headers: ['IP Header (192.168.1.100 -> 104.16.132.229, TTL=64)', 'TCP Header', 'TLS Header'],
      payload: '[Payload Data]'
    }
  },
  {
    layerNumber: 2,
    layerName: 'Data Link Layer',
    pduName: 'Ethernet Frame',
    action: 'Encapsulate into Ethernet Frame',
    headerAdded: '14-Byte Ethernet Header + 4-Byte FCS Trailer',
    explanation: 'Data Link layer prepends Source MAC, Dest MAC (gateway router), EtherType 0x0800, and appends CRC-32 Frame Check Sequence trailer.',
    visualRepresentation: {
      headers: ['Ethernet Header (MAC: c4:b3 -> e0:d5)', 'IP Header', 'TCP Header'],
      payload: '[Encapsulated Packet]',
      trailers: ['FCS Trailer (CRC-32 Checksum)']
    }
  },
  {
    layerNumber: 1,
    layerName: 'Physical Layer',
    pduName: 'Raw Bits',
    action: 'Convert Frame to Electrical/Optical Bitstream',
    headerAdded: 'Preamble + Start Frame Delimiter',
    explanation: 'NIC converts the frame into physical pulses (e.g. Manchester/PAM-4 voltages on Cat6 copper or 1310nm laser pulses over fiber).',
    visualRepresentation: {
      headers: ['Preamble (10101010...)', 'Ethernet Frame'],
      payload: '01010100 01100101 01101101 01110000 00111010 00110010 00110100',
      trailers: ['Physical End of Stream Delimiter']
    }
  }
];

