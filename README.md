# ProtoStack — Interactive Protocols Learning Platform

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](./LICENSE)

**ProtoStack** is an open-source learning platform for computer networking, internet, and IoT protocols. It combines a 52-protocol catalog with step-by-step packet-flow models, OSI/TCP-IP layer views, side-by-side comparisons, quizzes, and sandboxes that are explicitly labelled **live** or **simulated**.

Repository: [https://github.com/cyberlog69/ProtoStack](https://github.com/cyberlog69/ProtoStack)

---

## What is real, and what is simulated

Honesty is a design constraint here. Every sandbox states which mode it is in.

| Feature | Mode | Notes |
| :--- | :--- | :--- |
| DNS resolver | Real, server-side | `/api/dns` uses Node's DNS APIs with a 4 s timeout and rate limiting. TTLs and AD flags are reported only when the resolver exposes them. |
| HTTP request bench | Real | Defaults to the local `/api/http-demo` echo route. External URLs go through `/api/http-test`, which enforces an allowlist, timeouts, redirect re-validation, and a 64 KB response cap. |
| MQTT pub/sub | Simulated in the browser | Implements `+`/`#` topic matching, per-subscriber delivery, and retained messages. No broker connection is opened. |
| TCP handshake | Simulated | Random per-session ISNs and real TCP state transitions; not captured packets. |
| WebSocket terminal | Simulated by default | Optional live `wss://echo.websocket.events` connection. Errors are surfaced, never converted into a fake success. |
| Encapsulation / packet flow | Simulated | Header labels are illustrative; hex dumps, bit strings, and CRC-32 values are computed from the current payload. |
| Other protocols | Simulated step runner | Replays the stored interaction steps. No network traffic. |
| Progress, bookmarks, quiz scores | Local only | Stored in `localStorage`; nothing is uploaded. |

---

## Features

### Protocol catalog (52 protocols)

- **Network & Internet** — DNS, IPv4, IPv6, ICMP, ARP, DHCP, BGP, OSPF, NTP, and more
- **Transport Layer** — TCP, UDP, QUIC, SCTP
- **Application & Web** — HTTP/HTTPS, WebSocket, SSH, gRPC, SNMP, SMTP, FTP, SFTP, IMAP, POP3, LDAP, Telnet
- **Internet of Things & Industrial** — MQTT, CoAP, Zigbee, LoRaWAN, Matter, Modbus TCP, OPC-UA, BLE, Z-Wave, CAN Bus, BACnet
- **Security & Identity** — TLS 1.3, IPsec, WireGuard, OAuth 2.0 with PKCE, Kerberos, SAML 2.0
- **Wireless & Radio** — Wi-Fi (802.11), NFC, 5G NR, Ethernet (802.3)
- **Cloud & Event Streaming** — AMQP, Apache Kafka, Redis RESP, WebRTC, NATS, STOMP

Category counts are derived from the data at build time, so they cannot drift from the catalog. Each protocol ships with at least three interaction steps and two quiz questions, and the data tests enforce those floors.

### Animated packet flow

- Framer Motion packet propagation with speed controls (0.5×, 1×, 2×), play/pause, replay, and step navigation.
- Keyboard support: `Space`, `←`, `→` (ignored while typing or focused on a control).
- `prefers-reduced-motion` is respected globally and inside the animation.
- Inspector tabs: flow explanation, decoded packet fields, a hex dump generated from the current step payload (with CRC-32), and an optional raw code snippet.

### OSI and TCP/IP layers (`/layers`)

- Side-by-side OSI 7-layer and TCP/IP 4-layer reference.
- Encapsulation and decapsulation walkthrough with computed hex, bit strings, and CRC-32 from your custom payload.
- Layer-by-layer protocol links.

### Protocol comparisons (`/compare`)

- Preset matchups plus any pair of protocols via `/compare/[a]/[b]`.
- Unknown slugs return a 404 instead of silently falling back.
- A notice appears when both selectors point at the same protocol.

### Quizzes (`/quiz`)

- Category filters, 10 / 25 / all question limits, and seeded shuffling for stable retries.
- Best score per protocol or category is stored locally.

### Dashboard (`/dashboard`)

- Overall mastery, quiz average, saved quiz results, bookmarks, and curated learning paths.
- Fully local; the dashboard is excluded from search indexing.

### Search (`Ctrl+K` / `⌘K`)

- Lazy-loaded dialog searching names, abbreviations, ports, RFCs, layers, features, and use cases.
- Focus trap, Escape to close, focus restoration, and body scroll lock.

---

## Getting started

### Prerequisites

- Node.js **20.9 or newer** (Next.js 16 requirement)
- npm

### Install and run

```bash
git clone https://github.com/cyberlog69/ProtoStack.git
cd ProtoStack
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production build

```bash
npm run build
npm run start
```

### Environment variables

| Variable | Required | Purpose |
| :--- | :---: | :--- |
| `NEXT_PUBLIC_SITE_URL` | No | Canonical site origin used for metadata, sitemap, and robots. Defaults to `http://localhost:3000`. Set this to your public HTTPS origin in production. |
| `HTTP_TEST_ALLOWED_HOSTS` | No | Comma-separated allowlist for `/api/http-test`. Defaults to `example.com,www.example.com,httpbin.org,jsonplaceholder.typicode.com`. |

### Quality commands

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint .
npm run test        # node test runner via tsx
npm run check       # typecheck + lint + test
npm run ingest      # audit real protocol counts and data structure
```

CI runs typecheck, lint, tests, and a production build on Node 20.9 and Node 22.

---

## Repository structure

```text
ProtoStack/
├── .github/
│   ├── workflows/ci.yml                  # typecheck, lint, test, build
│   └── dependabot.yml                    # npm and Actions updates
├── scripts/
│   └── ingest-protocols.mjs              # data audit (real counts, no scraping)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── dns/route.ts              # validated server-side DNS resolver
│   │   │   ├── http-demo/route.ts        # local same-origin echo endpoint
│   │   │   └── http-test/route.ts        # allowlisted outbound HTTP proxy
│   │   ├── compare/
│   │   │   ├── page.tsx                  # comparison index
│   │   │   └── [a]/[b]/page.tsx          # validated, statically generated comparisons
│   │   ├── dashboard/                    # local progress dashboard (+ noindex metadata)
│   │   ├── layers/                       # OSI/TCP-IP page and encapsulation simulator
│   │   ├── protocols/[slug]/page.tsx     # statically generated protocol pages
│   │   ├── quiz/                         # quiz arena
│   │   ├── layout.tsx                    # metadata, skip link, MotionProvider
│   │   ├── page.tsx                      # home catalog and filters
│   │   ├── robots.ts                     # robots.txt
│   │   ├── sitemap.ts                    # sitemap.xml
│   │   └── globals.css                   # focus styles, reduced motion, scrollbars
│   ├── components/
│   │   ├── ProtocolDetail.tsx            # client shell for a protocol page
│   │   ├── InteractiveVisualizer.tsx     # packet-flow animation and inspector
│   │   ├── EncapsulationSimulator.tsx    # L7→L1 model with computed payload output
│   │   ├── ComparisonView.tsx            # side-by-side comparison
│   │   ├── QuizSection.tsx               # per-protocol quiz
│   │   ├── SearchModal.tsx               # Ctrl+K dialog
│   │   └── sandboxes/                    # DNS, HTTP, MQTT, TCP, WebSocket, generic
│   ├── context/ProgressContext.tsx       # typed localStorage progress state
│   ├── data/
│   │   ├── comparisons.ts
│   │   ├── layers.ts
│   │   ├── protocols.ts                  # aggregator and category metadata
│   │   └── protocols/                    # seven data files, 52 protocols
│   ├── lib/
│   │   ├── hex.ts                        # CRC-32, hex dump, bit string
│   │   ├── rate-limit.ts                 # in-memory fixed-window limiter
│   │   ├── site.ts                       # canonical URL helpers
│   │   ├── url-safety.ts                 # outbound URL and DNS validation
│   │   └── utils.ts                      # styling helpers
│   └── types/protocol.ts                 # protocol, step, packet, quiz types
├── tests/
│   ├── data.test.ts                      # catalog integrity
│   └── url-safety.test.ts                # SSRF-oriented URL validation
├── eslint.config.mjs
├── next.config.mjs                       # security headers and CSP
├── tailwind.config.ts
├── tsconfig.json
├── SECURITY.md
├── LICENSE
└── README.md
```

---

## Security

See [SECURITY.md](./SECURITY.md) for the implemented controls, honest limitations (including the per-process rate limiter and DNS rebinding caveat), and the private disclosure process.

## License

MIT — see [LICENSE](./LICENSE).
