# 🌐 ProtoStack — Interactive Protocols Learning Platform

ProtoStack is an open-source, interactive web platform designed for engineers, students, and network professionals to explore, visualize, and test computer networking, internet, and IoT protocols.

---

## ✨ Features

- **Categorized Protocol Library**: Over 70+ protocols across Network & Internet, Application Layer, IoT & Embedded, Security & Cryptography, Wireless & Physical, and Cloud Messaging.
- **Interactive Packet Flow Visualizer**: Step-by-step animated packet propagation across nodes (Client, Server, Resolvers, Brokers) with auto-play, pause, step controls, and Wireshark-style packet inspector.
- **Live Browser Sandboxes**:
  - 🌐 **DNS Resolver**: Live DoH queries with real latency, TTL, and record parsing.
  - ⚡ **MQTT IoT Broker**: Virtual sensor publisher (temperature/humidity), topic routing, and subscriber live wire stream.
  - 💻 **TCP 3-Way Handshake**: Sequence number calculation, SYN/ACK step simulator, and state machine transitions.
  - 🌍 **HTTP/HTTPS Client Bench**: Request methods, headers inspection, and live response simulation.
- **Knowledge Quizzes**: Built-in interactive quizzes with real-time feedback and explanation.
- **Dark-First Modern UI**: Built with Next.js 14, Tailwind CSS, and Lucide icons.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (tested on Node.js 20 & 26)
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/protostack.git
cd protostack

# Install dependencies
npm install

# Start the local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
ProtoStack/
├── src/
│   ├── app/
│   │   ├── globals.css              # Custom styling & glow animations
│   │   ├── layout.tsx               # Root layout with Navbar & Footer
│   │   ├── page.tsx                 # Home page with search, filters & protocol cards
│   │   └── protocols/[slug]/page.tsx# 4-panel interactive protocol session page
│   ├── components/
│   │   ├── Navbar.tsx               # Navigation header
│   │   ├── Footer.tsx               # Footer with quick links
│   │   ├── ProtocolCard.tsx         # Protocol library card
│   │   ├── InteractiveVisualizer.tsx# Animated packet flow simulator & Wireshark inspector
│   │   ├── QuizSection.tsx          # Knowledge check quiz component
│   │   └── sandboxes/
│   │       ├── DnsSandbox.tsx       # Live DNS DoH client
│   │       ├── MqttSandbox.tsx      # Live IoT MQTT Pub/Sub broker
│   │       ├── TcpSandbox.tsx       # Interactive TCP handshake sequencer
│   │       ├── HttpSandbox.tsx      # HTTP request/response bench
│   │       └── GenericSandbox.tsx   # Universal protocol simulator
│   ├── data/
│   │   ├── protocols.ts             # Main catalog aggregator
│   │   └── protocols/               # Modular protocol datasets
│   │       ├── network.ts           # DNS, IPv4, IPv6, ICMP, ARP, DHCP, BGP, OSPF, NTP
│   │       ├── transport.ts         # TCP, UDP, QUIC, SCTP
│   │       ├── application.ts       # HTTP, WebSocket, SSH, gRPC, SNMP, SMTP
│   │       ├── iot.ts               # MQTT, CoAP, Zigbee, LoRaWAN, Matter, Modbus, OPC-UA, BLE
│   │       ├── security.ts          # TLS 1.3, IPsec, WireGuard, OAuth 2.0
│   │       ├── wireless.ts          # Wi-Fi, NFC, 5G NR, Ethernet
│   │       └── cloud.ts             # AMQP, Apache Kafka, Redis RESP
│   ├── lib/
│   │   └── utils.ts                 # Utility functions & badge styling
│   └── types/
│       └── protocol.ts              # TypeScript schemas
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 🛠️ Adding a New Protocol

To add a new protocol to ProtoStack, simply append an entry to `src/data/protocols.ts` matching the `Protocol` interface in `src/types/protocol.ts`. Each protocol automatically receives:
1. An entry in the Home search & filter grid
2. A dedicated `/protocols/[slug]` page
3. Step-by-step interactive packet animations
4. A live sandbox execution environment
5. Interactive knowledge check quiz questions

