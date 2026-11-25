# ProtoStack — Interactive Protocols Learning Platform

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](./LICENSE)

**ProtoStack** is an open-source learning platform for computer networking, internet, and IoT protocols. It combines 80 full protocol lessons and 80 reference cards with step-by-step packet-flow models, OSI/TCP-IP layer views, side-by-side comparisons, quizzes, and sandboxes that are explicitly labelled **live** or **simulated**. Coverage is tiered and published on `/coverage`, so the site states what it teaches and what it does not.

It is free to use with **no account, no paywall, no ads and no tracking**. Progress, bookmarks and quiz scores live in the browser's `localStorage`, can be exported and imported as JSON, and can be printed as a self-study record. That record is explicitly **not an accredited certificate**.

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

### Protocol catalog (80 protocols)

- **Network & Internet** — DNS, IPv4, IPv6, ICMP, ARP, DHCP, BGP, OSPF, NTP, and more
- **Transport Layer** — TCP, UDP, QUIC, SCTP
- **Application & Web** — HTTP/HTTPS, WebSocket, SSH, gRPC, SNMP, SMTP, FTP, SFTP, IMAP, POP3, LDAP, Telnet
- **Internet of Things & Industrial** — MQTT, CoAP, Zigbee, LoRaWAN, Matter, Modbus TCP, OPC-UA, BLE, Z-Wave, CAN Bus, BACnet
- **Security & Identity** — TLS 1.3, IPsec, WireGuard, OAuth 2.0 with PKCE, Kerberos, SAML 2.0
- **Wireless & Radio** — Wi-Fi (802.11), NFC, 5G NR, Ethernet (802.3)
- **Cloud & Event Streaming** — AMQP, Apache Kafka, Redis RESP, WebRTC, NATS, STOMP

Category counts are derived from the data at build time, so they cannot drift from the catalog. Each protocol ships with at least three interaction steps and two quiz questions, and the data tests enforce those floors.

### Coverage and scope (`/coverage`)

- Every entry is assigned a tier — **core study**, **professional working knowledge**, or **reference registry** — plus a difficulty level, prerequisites and a review date.
- A public coverage map shows the category × tier and OSI-layer × tier matrices, so empty areas are visible instead of implied.
- The roadmap names the families that are *not* covered yet (routing/switching, telecom, storage, industrial, management, legacy) with estimated entry counts.
- Prerequisites form a validated DAG: each protocol page links to the entries worth reading first, and cycles fail the test suite.

### Learning path and reference library

- **`/start`** - a five-module beginner path (18 lessons) ordered so every lesson only uses ideas introduced earlier. Progress is stored locally, and prerequisites that are still unread are flagged inline.
- **Home "continue learning" strip** - returning visitors land on the next unfinished path lesson instead of having to remember where they stopped.
- **Curriculum navigation** - each lesson on the path shows its position, the module, and previous/next lessons, plus a "continue to the next lesson" hand-off after the quiz. Catalog-wide previous/next links remain available.
- **`/reference`** - 80 compact reference cards for standards without a full lesson: routing, web, security, telecom, storage, industrial, management, discovery, tunnelling and legacy protocols, each with layer, specification, port and status.
- **`/glossary`** — 116 networking terms defined in plain language, searchable and filterable by letter.
- **`/standards`** — how to read an RFC: document statuses, MUST/SHOULD/MAY, document anatomy, errata, a seven-step reading method and a first-documents exercise.
- **`/record`** — a printable, exportable learning record. It summarises path completion, catalog progress, best quiz results and passed defender challenges, and lets you export/import a JSON backup or reset local data. No account is involved, and the page states plainly that it is not an accredited certificate.

### Threat models and simulated attacks (`/attacks`)

- Every one of the 80 protocols has a threat model: three attacker steps (precondition, action, impact), per-step detection guidance, the impact and at least two defences.
- The library covers eight categories: spoofing, interception, injection, denial of service, credential attacks, downgrade, feature abuse and reconnaissance.
- Each scenario carries a teaching difficulty (1–3 stars) and a three-phase timeline; the library can filter and sort by difficulty.
- Each protocol page includes an **attack simulation** panel with a manual **Simulate attack** control (pause, resume, replay), an animated attacker → target flow, a phase timeline, scoped keyboard shortcuts (`S` `←` `→` `M` `R`), and a mitigation toggle that shows the blocked state. Nothing animates or advances until you start it.
- On the final step, a two-question **defender challenge** checks the detection signal and the documented control. Best scores are stored locally through the shared progress store, and completed scenarios are marked in the library.
- MITRE ATT&CK® badges are shown only for reviewed mappings from a small, tested allowlist; there are no invented CVSS scores or CVE IDs.
- A **frame anatomy** panel shows the protocol's real header fields, bit widths and offsets. Attack packets themselves are not reproduced.
- Scenarios are conceptual and run entirely in the browser. They contain no exploit code, payloads or tooling, and the UI states that testing requires explicit authorisation.

### Animated packet flow

- Framer Motion packet propagation with speed controls (0.5×, 1×, 2×), play/pause, replay, and step navigation.
- The wire and the packet capsule use the same column centres as the nodes, so the travelling frame actually arrives at the endpoint it names.
- A mechanism strip under the stage shows direction, frame type, payload size and the decoded field chips (flags, sequence numbers, counters).
- Inspector tabs: **Process** (step explanation, previous → current transition, clickable sequence log), **Protocol tree** (54 reusable header layers, 70 protocol stacks, bit ranges, byte offsets, decoded values and meanings), **Bytes** (hex dump and bit string with CRC-32), **Nodes** (participant roles), and **Syntax** when the step has a code sample.
- The protocol tree binds each header field to the step payload, so a TCP step fills in ports, sequence/ack numbers, window size and SYN/ACK/FIN state; endpoints in `address:port` form also populate the address and port rows.
- Protocols without a byte layout fall back to a flat decoded-field table, labelled as such.
- Values are labelled as protocol-model data, not a packet capture.
- Keyboard support: `Space`, `←`, `→` (ignored while typing or focused on a control).
- `prefers-reduced-motion` parks the capsule at the destination instead of animating it.

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

- Lazy-loaded dialog searching the whole platform in one place: protocol lessons, reference cards, glossary terms, attack scenarios and learning pages.
- Matches names, abbreviations, ports, RFCs, layers, features, use cases, standards, definitions, detections and mitigations.
- Results are ranked (exact title matches first) and labelled by content type; deep links jump to the protocol page, glossary term, reference card or attack card.
- Focus trap, Escape to close, focus restoration, and body scroll lock.

---

## Getting started

### Prerequisites

- Node.js **20.19 or newer** (Next.js 16 needs 20.9+; ESLint 10 needs 20.19+). Node 22 LTS is recommended.
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

### Containers and free hosts

```bash
docker build --build-arg NEXT_PUBLIC_SITE_URL=https://proto.example.com -t protostack .
docker run --rm -p 3000:3000 protostack
```

Podman uses the same Dockerfile, and `docker-compose.yml` works with
`docker compose` and `podman-compose`. A Quadlet unit for rootless Podman lives in
`deploy/podman/protostack.container`.

Prebuilt multi-arch images (amd64 and arm64) are published by
`.github/workflows/container.yml` to `ghcr.io/cyberlog69/protostack`.

Configs are included for Fly.io (`fly.toml`), Render (`render.yaml`) and Netlify
(`netlify.toml`); Vercel, Railway, Koyeb and GCP Cloud Run need no extra file.
See **[docs/DEPLOY.md](./docs/DEPLOY.md)** for the GCP VM walkthrough, Podman
rootless setup, health checks, build-time vs runtime variables and the known
limitations.

### Quality commands

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint .
npm run test        # node test runner via tsx
npm run check       # typecheck + lint + test
npm run ingest      # audit real protocol counts and data structure
```

CI runs typecheck, lint, tests, and a production build on Node 20.x and Node 22.x.

---

## Repository structure

```text
ProtoStack/
├── .github/
│   ├── workflows/ci.yml                  # typecheck, lint, test, build
│   ├── workflows/container.yml           # multi-arch image to GHCR
│   └── dependabot.yml                    # npm and Actions updates
├── deploy/
│   └── podman/protostack.container       # rootless Podman Quadlet unit
├── docs/
│   └── DEPLOY.md                         # Docker, Podman, GCP, Fly, Render
├── scripts/
│   └── ingest-protocols.mjs              # data audit (real counts, no scraping)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── dns/route.ts              # validated server-side DNS resolver
│   │   │   ├── health/route.ts           # container liveness probe
│   │   │   ├── http-demo/route.ts        # local same-origin echo endpoint
│   │   │   └── http-test/route.ts        # allowlisted outbound HTTP proxy
│   │   ├── compare/
│   │   │   ├── page.tsx                  # comparison index
│   │   │   └── [a]/[b]/page.tsx          # validated, statically generated comparisons
│   │   ├── attacks/page.tsx              # filterable attack library
│   │   ├── coverage/page.tsx             # tiered coverage matrix, catalog and roadmap
│   │   ├── glossary/page.tsx             # searchable terminology browser
│   │   ├── reference/page.tsx            # filterable reference-card registry
│   │   ├── record/page.tsx               # printable/exportable local learning record
│   │   ├── standards/page.tsx            # how to read an RFC
│   │   ├── start/page.tsx                # prerequisite-ordered beginner path
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
│   │   ├── AttackLab.tsx                 # per-protocol attack simulation
│   │   ├── AttackBrowser.tsx             # attack library filters
│   │   ├── AttackFrameAnatomy.tsx        # protocol header layout for an attack
│   │   ├── PacketFlowAnimation.tsx       # animated attacker → target flow
│   │   ├── KillChainBar.tsx              # three-phase attack timeline
│   │   ├── DefenderChallenge.tsx         # scored detection/mitigation quiz
│   │   ├── CurriculumBoard.tsx           # Start Here path with local progress
│   │   ├── ContinueLearning.tsx          # home-page resume strip
│   │   ├── GlossaryBrowser.tsx           # glossary search and letter filter
│   │   ├── ReferenceBrowser.tsx          # reference-card filters
│   │   ├── InteractiveVisualizer.tsx     # packet-flow animation and inspector
│   │   ├── EncapsulationSimulator.tsx    # L7→L1 model with computed payload output
│   │   ├── ComparisonView.tsx            # side-by-side comparison
│   │   ├── QuizSection.tsx               # per-protocol quiz
│   │   ├── SearchModal.tsx               # Ctrl+K unified search dialog
│   │   ├── LearningRecord.tsx            # printable record and progress backup/restore
│   │   └── sandboxes/                    # DNS, HTTP, MQTT, TCP, WebSocket, generic
│   ├── context/ProgressContext.tsx       # typed localStorage progress state
│   ├── data/
│   │   ├── attacks.ts                    # 80 attack scenarios and defences
│   │   ├── attackCategories.ts           # attack taxonomy
│   │   ├── attackDifficulty.ts           # teaching difficulty 1-3
│   │   ├── attackPhases.ts               # precondition / action / impact
│   │   ├── mitre.ts                      # reviewed ATT&CK allowlist and mappings
│   │   ├── comparisons.ts
│   │   ├── coverage.ts                   # tiers, difficulty, prerequisites, roadmap
│   │   ├── curriculum.ts                 # ordered beginner path
│   │   ├── glossary.ts                   # terminology
│   │   ├── headerLayouts.ts              # bit-level header layers and protocol stacks
│   │   ├── reference.ts                  # reference-card registry
│   │   ├── layers.ts
│   │   ├── protocols.ts                  # aggregator and category metadata
│   │   └── protocols/                    # eleven data files, 80 protocols
│   ├── lib/
│   │   ├── hex.ts                        # CRC-32, hex dump, bit string
│   │   ├── progress-transfer.ts          # versioned, validated JSON progress backup
│   │   ├── rate-limit.ts                 # in-memory fixed-window limiter
│   │   ├── search.ts                     # unified search index and ranking
│   │   ├── site.ts                       # canonical URL helpers
│   │   ├── slug.ts                       # stable glossary anchors
│   │   ├── url-safety.ts                 # outbound URL and DNS validation
│   │   └── utils.ts                      # styling helpers
│   └── types/protocol.ts                 # protocol, step, packet, quiz types
├── tests/
│   ├── data.test.ts                      # catalog integrity
│   ├── coverage.test.ts                  # tiers, prerequisites, roadmap
│   ├── content.test.ts                   # curriculum, glossary and reference registry
│   ├── layouts.test.ts                   # header bit widths and protocol stacks
│   ├── attacks.test.ts                   # attack coverage, phases, MITRE and difficulty
│   ├── search.test.ts                    # unified search coverage, links and ranking
│   ├── progress.test.ts                  # backup/restore validation and round-trip
│   └── url-safety.test.ts                # SSRF-oriented URL validation
├── eslint.config.mjs
├── next.config.mjs                       # security headers, CSP, standalone output
├── tailwind.config.ts
├── tsconfig.json
├── Dockerfile                            # multi-stage, non-root, standalone
├── docker-compose.yml
├── .dockerignore
├── .env.example
├── fly.toml
├── render.yaml
├── netlify.toml
├── SECURITY.md
├── LICENSE
└── README.md
```

---

## Security

See [SECURITY.md](./SECURITY.md) for the implemented controls, honest limitations (including the per-process rate limiter and DNS rebinding caveat), and the private disclosure process.

## License

MIT — see [LICENSE](./LICENSE).
