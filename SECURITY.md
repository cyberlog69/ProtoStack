# Security Policy

ProtoStack is a learning project. Its API routes are deliberately small and defensive, but they are not a hardened production proxy. This document describes what is actually implemented so operators can deploy it with the right expectations.

---

## Supported Versions

| Version / Branch | Supported | Notes |
| :--- | :---: | :--- |
| `main` (latest) | Yes | Actively maintained with CI |
| `v0.1.x` | Yes | Current release track |
| `< 0.1.0` | No | Deprecated pre-release builds |

---

## Implemented Defensive Controls

### Outbound HTTP proxy — `/api/http-test`

Used only when the browser requests an external URL from the HTTP sandbox.

- **Host allowlist.** Defaults to `example.com`, `www.example.com`, `httpbin.org`, and `jsonplaceholder.typicode.com`. Override with the comma-separated `HTTP_TEST_ALLOWED_HOSTS` environment variable. Hosts outside the list are rejected before DNS lookup.
- **Scheme and port allowlist.** Only `http:` and `https:` are accepted, and only ports `80` and `443` (or the scheme default).
- **Private and reserved address blocking.** Rejects loopback, RFC 1918, CGNAT, link-local, multicast, documentation, benchmarking, IPv4-mapped IPv6, and cloud metadata ranges. Both literal IPs and encoded IPv4 forms (`2130706433`, `0x7f000001`, octal) are checked.
- **DNS resolution checks.** Resolved addresses are validated, not just the hostname. DNS rebinding is still theoretically possible between validation and connection; this is a known limitation of application-level checks.
- **Credentials and fragments.** URLs containing `user:pass@` or URL credentials are rejected; fragments are dropped.
- **Method allowlist.** `GET`, `HEAD`, `POST`, `PUT`, `PATCH`, and `DELETE` only.
- **Header filtering.** `host`, `content-length`, `connection`, `transfer-encoding`, `upgrade`, `keep-alive`, `te`, `trailer`, `proxy-connection`, `cookie`, `authorization`, and `proxy-authorization` cannot be set by the caller. Header values are capped at 1 KB.
- **Body cap.** Request bodies are limited to 16 KB.
- **Timeout.** Each outbound request has a 5-second timeout.
- **Response cap.** Response bodies are streamed and truncated at 64 KB.
- **Redirect handling.** At most three redirects. Every redirect target is re-validated against the allowlist and address rules. Writes (`POST`, `PUT`, `PATCH`, `DELETE`) are not followed to a new origin.
- **Rate limit.** 12 requests per minute per client IP. The limiter is an in-memory fixed window and is **per server process**: on serverless or multi-instance deployments each warm instance keeps its own counter. Use a shared store (Redis, etc.) if you need a global limit.
- **Client identity caveat.** The limiter keys on `X-Forwarded-For` / `X-Real-IP`. Those headers are trustworthy only behind a proxy that overwrites them; if the app is exposed directly, a caller can spoof them to bypass the limit.

### DNS resolver — `/api/dns`

- Hostname grammar validation, 253-character cap, and rejection of local/special-use suffixes (`.local`, `.internal`, `.lan`, `.home`, `.corp`, `.arpa`).
- Record-type allowlist: `A`, `AAAA`, `MX`, `TXT`, `CNAME`, `NS`.
- 4-second query timeout.
- Rate limit: 30 requests per minute per client IP, with the same per-process caveat.
- Client IPs are read from `X-Forwarded-For` / `X-Real-IP`; only trust those headers behind a proxy that sets them.
- Answers and TTLs come from Node's resolver. When a record type does not expose a TTL, the UI says "not exposed" rather than inventing one.
- The local resolver does not validate DNSSEC, so the API reports `ADVerified: false` instead of asserting that a zone is unsigned.

### Local echo route — `/api/http-demo`

- Same-origin route intended for the default HTTP sandbox experiment.
- Supports `GET`, `HEAD`, `POST`, `PUT`, `PATCH`, and `DELETE`.
- Request bodies are capped at 16 KB.
- `cookie`, `authorization`, and `proxy-authorization` request headers are not echoed back.

### Browser-side simulations

- MQTT topic matching, retained messages, the TCP state machine, the generic step runner, and the simulated WebSocket session run entirely in the browser. They do not open broker or socket connections, and the UI labels them as simulated.
- The WebSocket sandbox can optionally open a real connection to `wss://echo.websocket.events`. Errors are surfaced instead of being reported as a successful connection.
- Progress, quiz results, and bookmarks are stored in `localStorage` and are never uploaded.

### HTTP response headers

`next.config.mjs` sets:

- Content-Security-Policy (app origin; `wss://echo.websocket.events` for the optional live WebSocket; Next requires inline bootstrap scripts)
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY` and `frame-ancestors 'none'`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` denying camera, microphone, geolocation, and payment
- `Cross-Origin-Opener-Policy: same-origin`
- `Strict-Transport-Security` (effective only when served over HTTPS)

### Dependency and supply-chain checks

- GitHub Dependabot for npm and GitHub Actions updates.
- CodeQL analysis for JavaScript and TypeScript.
- `npm run check` (typecheck, lint, tests) runs in CI for every push and pull request.

---

## Reporting a Vulnerability

Please do **not** open a public issue for a security problem.

Use GitHub Security Advisories:

**[Report a security vulnerability](https://github.com/cyberlog69/ProtoStack/security/advisories/new)**

Include:

1. A summary of the issue and its impact.
2. Reproduction steps or a minimal proof of concept.
3. Affected endpoints, routes, or files.
4. Node.js version, browser, OS, and commit hash.
5. Optional mitigation suggestions.

### Response expectations

- Initial acknowledgment: within 48 hours.
- Triage and severity assessment: within 3–5 business days.
- Remediation target: 7–14 business days, depending on complexity.
- Coordinated disclosure after a fix is verified and deployed.

---

## Safe Harbor

We support good-faith research. We will not pursue legal action against researchers who avoid disrupting live services, do not access or modify other users' data, and give reasonable time for remediation before public disclosure.
