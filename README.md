# 🌐 ProtoStack — Interactive Protocols Learning Platform

[![Next.js](https://img.shields.io/badge/Next.js-14%2F16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

**ProtoStack** is an open-source, interactive web platform designed for software engineers, network architects, security researchers, and students to explore, visualize, and interactively test computer networking, internet, and IoT protocols.

🔗 **GitHub Repository**: [https://github.com/cyberlog69/ProtoStack](https://github.com/cyberlog69/ProtoStack)

---

## 🌟 Key Features

### 1. 📚 Comprehensive Protocol Encyclopedia (52+ Protocols)
Covers all foundational and modern protocols across 6 dedicated categories:
- **Network & Internet**: DNS, IPv4, IPv6, ICMP, ARP, DHCP, BGP, OSPF, NTP
- **Transport Layer**: TCP, UDP, QUIC, SCTP
- **Application & Web**: HTTP/HTTPS, WebSocket, SSH, gRPC, SNMP, SMTP, FTP, SFTP, IMAP, POP3, LDAP, Telnet
- **Internet of Things (IoT) & Industrial**: MQTT, CoAP, Zigbee, LoRaWAN, Matter, Modbus TCP, OPC-UA, BLE, Z-Wave, CAN Bus, BACnet
- **Security & Identity**: TLS 1.3, IPsec, WireGuard, OAuth 2.0 with PKCE, Kerberos, SAML 2.0
- **Wireless & Radio**: Wi-Fi (802.11), NFC, 5G NR, Ethernet (802.3)
- **Cloud & Event Streaming**: AMQP, Apache Kafka, Redis RESP, WebRTC, NATS, STOMP

### 2. 🎬 Framer-Motion Animated Packet Flow Simulator
- Real-time in-flight packet propagation with dynamic SVG wire and pulse glows.
- Traveling packet capsules displaying real-time progress (0–100%).
- Speed controls (0.5x, 1x, 2x), auto-play, pause, step rewind/forward, and keyboard shortcuts (`Space`, `←`, `→`).
- **4-Tab Deep Inspection Panel**:
  - **Flow Explanation**: Human-readable narrative of each protocol state transition.
  - **Wireshark Packet Inspector**: Dissected protocol fields, headers, and payload structures.
  - **Hex Stream View**: Formatted binary hexadecimal octets with ASCII sidebar.
  - **Code Implementation**: Ready-to-use client/server snippets in Node.js, Python, or Go.

### 3. 🧪 Live Browser & Backend Sandboxes
- 🌐 **DNS Resolver** (`DnsSandbox`): Real DNS over HTTPS (DoH) lookups with millisecond latency, TTL, and record type parsing (A, AAAA, MX, TXT, CNAME) via Cloudflare & Google DNS with internal fallback API route (`/api/dns`).
- ⚡ **MQTT IoT Broker** (`MqttSandbox`): Virtual ESP32 sensor simulation, adjustable QoS tiers (0, 1, 2), topic publisher, and real-time wire listener.
- 💻 **TCP 3-Way Handshake** (`TcpSandbox`): Interactive step sequencer calculating client/server Sequence and Acknowledgement numbers across SYN, SYN-ACK, and ACK states.
- 🌍 **HTTP/HTTPS Client Bench** (`HttpSandbox`): Live request tester wired to `/api/http-test` measuring round-trip latency, status codes, and response headers.
- 🔌 **WebSocket Duplex Terminal** (`WebSocketSandbox`): Full-duplex bidirectional terminal connected to live echo sockets with frame opcode inspector, ping/pong heartbeats, and local fallback simulator.
- 🎛️ **Generic Wire Simulator** (`GenericSandbox`): Universal step runner with live packet payloads and custom parameters for all other protocols.

### 4. 🧱 Interactive OSI 7-Layer & TCP/IP Model (`/layers`)
- Complete side-by-side comparison of the ISO/OSI 7-Layer model and TCP/IP 4-Layer stack.
- **Dynamic Packet Encapsulation & Decapsulation Simulator**: Enter any custom payload string and watch it get wrapped with L7 HTTP headers, L4 TCP segments, L3 IP packets, and L2 Ethernet frames with CRC checksums, then decapsulated back.

### 5. ⚖️ Protocol Comparison Engine (`/compare`)
- Side-by-side spec and feature comparison matrix:
  - TCP vs. UDP
  - MQTT vs. CoAP
  - IPv4 vs. IPv6
  - FTP vs. SFTP
  - IMAP vs. POP3
  - WebRTC vs. WebSocket
  - Z-Wave vs. Zigbee
  - BGP vs. OSPF
  - Wi-Fi vs. Ethernet
  - gRPC vs. HTTP/REST
- Custom URL routing: `/compare/[protocolA]/[protocolB]`.

### 6. 🏆 Knowledge Arena & Quiz Engine (`/quiz`)
- Multi-question challenge arena with category filtering.
- Instant scoring, answer explanations, and celebratory particle confetti.

### 7. 📊 User Mastery & Bookmarks Dashboard (`/dashboard`)
- Local storage persistent progress tracking ("Mark as Learned" & "Bookmark").
- Curated Learning Paths:
  - Web & API Foundations
  - IoT & Smart Home Masterclass
  - Core Internet & Routing
  - Security, Identity & VPN

### 8. 🔍 Global Spotlight Search (`⌘K` / `Ctrl+K`)
- Instant keyboard command palette searching by protocol name, abbreviation, port number, RFC, OSI layer, and category.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (tested on Node.js 20 & 26)
- npm

### Installation & Setup

```bash
# Clone the repository
git clone https://github.com/cyberlog69/ProtoStack.git
cd ProtoStack

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
# Build production bundle
npm run build

# Start production server
npm run start
```

---

## 📁 Repository Structure

```
ProtoStack/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── dns/route.ts              # Live DNS DoH proxy route
│   │   │   └── http-test/route.ts        # HTTP benchmark & latency test endpoint
│   │   ├── compare/
│   │   │   ├── page.tsx                  # Protocol comparison index & preset selector
│   │   │   └── [a]/[b]/page.tsx          # Dynamic side-by-side protocol comparison
│   │   ├── dashboard/page.tsx            # Mastery tracker, bookmarks & learning paths
│   │   ├── layers/page.tsx               # OSI 7-Layer & TCP/IP encapsulation simulator
│   │   ├── protocols/[slug]/page.tsx     # 4-panel interactive protocol session
│   │   ├── quiz/page.tsx                 # Interactive multi-question protocol quiz
│   │   ├── layout.tsx                    # Root layout with ProgressProvider & Navbar
│   │   ├── page.tsx                      # Home page with protocol directory & filters
│   │   └── globals.css                   # Custom styles, wire glows & scrollbar styling
│   ├── components/
│   │   ├── Navbar.tsx                    # Header with Spotlight trigger & route links
│   │   ├── Footer.tsx                    # Footer with category links
│   │   ├── SearchModal.tsx               # Global Spotlight Command Palette (⌘K)
│   │   ├── ProtocolCard.tsx              # Protocol card with learned & bookmark indicators
│   │   ├── InteractiveVisualizer.tsx     # Framer-Motion packet flow simulator
│   │   ├── EncapsulationSimulator.tsx    # L7->L1 encapsulation/decapsulation interactive widget
│   │   ├── ComparisonView.tsx            # Comparison table & spec differential visualizer
│   │   ├── QuizSection.tsx               # Per-protocol quiz component
│   │   └── sandboxes/
│   │       ├── DnsSandbox.tsx            # Live DNS DoH query runner
│   │       ├── MqttSandbox.tsx           # Live MQTT virtual broker & subscriber
│   │       ├── TcpSandbox.tsx            # Interactive TCP 3-way handshake sequencer
│   │       ├── HttpSandbox.tsx           # Live HTTP client & latency bench
│   │       ├── WebSocketSandbox.tsx      # Live full-duplex WebSocket terminal
│   │       └── GenericSandbox.tsx        # Universal step runner with live packet payloads
│   ├── context/
│   │   └── ProgressContext.tsx           # React Context tracking learned items, bookmarks & scores
│   ├── data/
│   │   ├── comparisons.ts                # Comparison presets & differential matrices
│   │   ├── protocols.ts                  # Main aggregator catalog
│   │   └── protocols/                    # Modular protocol datasets (52+ protocols)
│   │       ├── network.ts
│   │       ├── transport.ts
│   │       ├── application.ts
│   │       ├── iot.ts
│   │       ├── security.ts
│   │       ├── wireless.ts
│   │       └── cloud.ts
│   ├── lib/
│   │   └── utils.ts                      # Styling helpers & color tokens
│   └── types/
│       └── protocol.ts                   # Protocol, Step, Packet, and Quiz interfaces
├── scripts/
│   └── ingest-protocols.mjs              # Extensible scraper & protocol ingestion utility
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 📄 License

This project is licensed under the MIT License — see the LICENSE file for details.
