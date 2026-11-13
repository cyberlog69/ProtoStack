# 🛡️ Security Policy

ProtoStack is committed to maintaining a secure, safe, and reliable environment for developers, network engineers, educators, and students exploring computer networking and IoT protocols.

This security policy outlines our supported versions, built-in defensive architecture, reporting guidelines, and vulnerability disclosure process.

---

## 📦 Supported Versions

Security patches and bug fixes are actively provided for the following versions:

| Version / Branch | Supported | Notes |
| :--- | :---: | :--- |
| `main` (Latest) | ✅ | Actively maintained with continuous integration |
| `v0.1.x` | ✅ | Current release track |
| `< 0.1.0` | ❌ | Deprecated early pre-release builds |

---

## 🔒 Security Architecture & Defensive Controls

Because ProtoStack features live network probes, protocol testers, and real-time simulators, we enforce strict defensive controls across all layers:

### 1. Server-Side Request Forgery (SSRF) Prevention
All server-side proxy routes (such as `/api/http-test` and `/api/dns`) implement rigorous destination validation:
- **Private & Reserved IP Blocking**: Requests targeting RFC 1918 private subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), loopback addresses (`127.0.0.0/8`, `::1`), link-local IPs (`169.254.0.0/16`, `fe80::/10`), and multicast addresses are rejected immediately.
- **Cloud Metadata Protection**: Direct requests to cloud provider instance metadata services (e.g., `169.254.169.254`) are explicitly blocked.
- **Protocol Scheme Restrictions**: Outbound network tests are constrained strictly to standard `http:` and `https:` schemes.
- **Timeout & Payload Caps**: Outbound requests enforce rigid execution timeouts (max 5000ms) and response byte limits to prevent resource exhaustion and denial of service.

### 2. Client-Side Sandbox Isolation
- Interactive simulators (such as the MQTT broker, WebSocket terminal, and DNS DoH client) execute inside the user's isolated browser environment.
- No sensitive user credentials, tokens, or personal identifiers are stored or transmitted.
- Progress metrics, bookmarked protocols, and quiz scores are kept strictly in local browser storage (`localStorage`).

### 3. Dependency & Supply Chain Security
- Automated dependency scanning and patch updates via GitHub Dependabot.
- Regular static application security testing (SAST) and CodeQL code scanning for early detection of CWE vulnerabilities.

---

## 🚨 Reporting a Vulnerability

We treat all security issues with the utmost urgency. If you discover a vulnerability or potential security risk in ProtoStack, **please do not open a public issue.**

### Preferred Reporting Method
Please report vulnerabilities privately via GitHub's Security Advisory system:
👉 **[Report a Security Vulnerability via GitHub Advisories](https://github.com/cyberlog69/ProtoStack/security/advisories/new)**

### Alternative Method
If you are unable to use GitHub Security Advisories, you can contact the repository maintainer directly via GitHub profile details.

### What to Include in Your Report
To help us investigate and resolve the issue quickly, please provide:
1. **Summary**: A clear description of the vulnerability and its potential impact.
2. **Steps to Reproduce**: Detailed reproduction steps or a minimal Proof of Concept (PoC).
3. **Affected Endpoints / Files**: Specific URLs, components, or API routes involved.
4. **Environment**: Node.js version, browser, operating system, and commit hash.
5. **Mitigation Suggestions** (optional): Any suggested code fix or defensive control.

---

## ⏱️ Response Timelines & SLA

When you submit a vulnerability report:
* **Initial Acknowledgment**: Within **48 hours** of receiving your report.
* **Triage & Assessment**: Within **3 to 5 business days**, confirming reproduction and assigning a severity rating (CVSS).
* **Patch & Fix**: We strive to develop, verify, and merge a remediation patch within **7 to 14 business days**.
* **Coordinated Disclosure**: Once a fix is verified and deployed, a public security advisory will be published crediting the reporter (unless anonymity is requested).

---

## 🤝 Safe Harbor & Ethical Research

We support responsible security research. We will not take legal action or file complaints against researchers who:
* Conduct research in good faith without attempting to disrupt live services or degrade performance.
* Avoid accessing, modifying, or destroying unauthorized user data.
* Allow reasonable time for remediation before publicly disclosing technical vulnerability details.
