import { Protocol } from '@/types/protocol';

export const SECURITY_PROTOCOLS: Protocol[] = [
  {
    id: 'tls',
    slug: 'tls',
    name: 'TLS 1.3',
    fullName: 'Transport Layer Security 1.3',
    category: 'security',
    osiLayer: 'Presentation',
    port: '443 (wraps TCP)',
    rfc: 'RFC 8446',
    yearIntroduced: 2018,
    shortSummary: 'Cryptographic protocol designed to provide privacy, integrity, and data security over computer networks.',
    description: 'TLS 1.3 is the modern cryptographic standard protecting internet communications. It simplifies and secures the handshake to a single round-trip (1-RTT) or zero round-trip (0-RTT), removing legacy insecure ciphers and encrypting metadata.',
    keyFeatures: [
      '1-RTT Handshake latency reduction',
      'Zero-RTT (0-RTT) resumption for repeat connections',
      'Mandatory forward secrecy (Ephemeral Diffie-Hellman)',
      'Elimination of legacy vulnerable ciphers (RC4, 3DES, CBC)'
    ],
    useCases: ['Securing HTTPS web traffic', 'Encrypted email transmission (STARTTLS)', 'Secure IoT telemetry (MQTTS, CoAPS)'],
    pros: ['Fastest and most secure TLS version to date', 'Protects against passive wiretapping and active man-in-the-middle attacks'],
    cons: ['0-RTT mode is vulnerable to replay attacks if not handled carefully'],
    actors: [
      { id: 'client', label: 'Client (TLS Client)', icon: 'Laptop', color: '#6366f1' },
      { id: 'server', label: 'Secure Server', icon: 'ShieldCheck', color: '#10b981' }
    ],
    interactiveSteps: [
      {
        step: 1,
        title: 'ClientHello + Key Share',
        description: 'Client initiates handshake and sends its Diffie-Hellman public key share immediately.',
        actorSource: 'client',
        actorTarget: 'server',
        explanation: 'In TLS 1.3 the client guesses the cipher group and provides its ephemeral public key in the very first packet.',
        packetInfo: {
          id: 'tls-pkt-1',
          source: 'Client',
          destination: 'Server:443',
          type: 'ClientHello',
          summary: 'Cipher: TLS_AES_256_GCM_SHA384 | KeyShare: X25519',
          payload: { version: 'TLS 1.3', supportedGroups: ['X25519'], keyShare: '0x9a4f21...' }
        }
      },
      {
        step: 2,
        title: 'ServerHello + Certificate + Finished',
        description: 'Server responds with its key share, digital certificate, and finishes the handshake in 1 round trip.',
        actorSource: 'server',
        actorTarget: 'client',
        explanation: 'Both parties independently compute the shared symmetric encryption key. All subsequent traffic is encrypted.',
        packetInfo: {
          id: 'tls-pkt-2',
          source: 'Server',
          destination: 'Client',
          type: 'ServerHello, Finished',
          summary: 'Handshake complete in 1-RTT. Symmetric key derived.',
          payload: { cipherChosen: 'TLS_AES_256_GCM_SHA384', certificateVerified: true }
        }
      }
    ],
    liveSandboxType: 'generic-simulator',
    quiz: [
      {
        id: 'tls-q1',
        question: 'How many round-trips (RTT) does a standard TLS 1.3 full handshake require to establish encryption?',
        options: ['1-RTT', '2-RTT', '3-RTT', '0-RTT only'],
        correctAnswer: 0,
        explanation: 'TLS 1.3 reduced the standard handshake from 2-RTT to 1-RTT by including the client key share in ClientHello.'
      }
    ]
  },
  {
    id: 'ipsec',
    slug: 'ipsec',
    name: 'IPsec',
    fullName: 'Internet Protocol Security',
    category: 'security',
    osiLayer: 'Network',
    port: 'UDP 500 / 4500 (IKE)',
    rfc: 'RFC 4301',
    yearIntroduced: 1995,
    shortSummary: 'Suite of protocols providing end-to-end cryptographic encryption and authentication at the IP layer.',
    description: 'IPsec secures communications across public IP networks by authenticating and encrypting each IP packet. Composed of Authentication Header (AH), Encapsulating Security Payload (ESP), and Internet Key Exchange (IKEv2), IPsec is the backbone of site-to-site corporate VPN tunnels.',
    keyFeatures: [
      'Two operating modes: Transport Mode (payload only) and Tunnel Mode (entire original IP packet encapsulated)',
      'Encapsulating Security Payload (ESP) for confidentiality and integrity',
      'Internet Key Exchange (IKEv2) for mutual authentication and Security Association (SA) negotiation',
      'Anti-replay protection via packet sequence numbering'
    ],
    useCases: ['Branch office to headquarters site-to-site VPNs', 'Enterprise remote worker corporate VPN client access', 'Router-to-cloud VPC secure gateway connections'],
    pros: ['Completely transparent to application protocols (HTTP, SSH, VoIP all inherit IPsec encryption)', 'Hardware ASIC acceleration in enterprise routers'],
    cons: ['Complex configuration and notorious issues with NAT traversal (requires UDP port 4500 NAT-T encapsulation)'],
    actors: [
      { id: 'branch', label: 'Branch Router (Gateway A)', icon: 'Network', color: '#6366f1' },
      { id: 'hq', label: 'HQ Firewall (Gateway B)', icon: 'ShieldCheck', color: '#10b981' }
    ],
    interactiveSteps: [
      {
        step: 1,
        title: 'IKEv2 Security Association Negotiation',
        description: 'Gateways exchange IKE_SA_INIT and IKE_AUTH packets on UDP port 500 to agree on cipher suites and authenticate via certificates.',
        actorSource: 'branch',
        actorTarget: 'hq',
        explanation: 'Gateways negotiate Diffie-Hellman Group 14 and AES-256-GCM to establish an encrypted management channel.',
        packetInfo: {
          id: 'ipsec-pkt-1',
          source: '198.51.100.1:500',
          destination: '203.0.113.1:500',
          type: 'IKE_SA_INIT',
          summary: 'SA Proposals: AES-256-GCM, DH Group 14, PRF-SHA256',
          payload: { spiInitiator: '0x3a4b9c1d', ikeVersion: 2, exchangeType: 'IKE_SA_INIT' }
        }
      },
      {
        step: 2,
        title: 'ESP Tunnel Encapsulation',
        description: 'Internal packet (192.168.1.10 -> 10.0.0.5) is encrypted and wrapped inside a new public IP header with an ESP header.',
        actorSource: 'branch',
        actorTarget: 'hq',
        explanation: 'Eavesdroppers on the public Internet only see random encrypted ciphertext and the outer gateway IP addresses.',
        packetInfo: {
          id: 'ipsec-pkt-2',
          source: '198.51.100.1 (ESP)',
          destination: '203.0.113.1',
          type: 'IPsec ESP (Protocol 50)',
          summary: 'SPI: 0x8a92bc01, Seq: 1042, Encrypted Payload: 1420 bytes',
          payload: { spi: '0x8a92bc01', sequenceNumber: 1042, encryptedPayloadLength: 1420 }
        }
      }
    ],
    liveSandboxType: 'generic-simulator',
    quiz: [
      {
        id: 'ipsec-q1',
        question: 'Which IPsec mode encrypts both the original IP payload AND the original IP header by encapsulating them inside a new IP header?',
        options: ['Transport Mode', 'Tunnel Mode', 'Bridge Mode', 'Pass-Through Mode'],
        correctAnswer: 1,
        explanation: 'In Tunnel Mode, the entire original IP packet is encrypted and placed inside a new outer IP packet, which is standard for site-to-site VPNs.'
      }
    ]
  },
  {
    id: 'wireguard',
    slug: 'wireguard',
    name: 'WireGuard',
    fullName: 'WireGuard VPN Protocol',
    category: 'security',
    osiLayer: 'Network',
    port: '51820 (over UDP)',
    rfc: 'RFC Technical Whitepaper / Linux Kernel',
    yearIntroduced: 2016,
    shortSummary: 'Modern, high-performance VPN protocol with state-of-the-art cryptography and a clean ~4,000 line codebase.',
    description: 'WireGuard is an extremely simple yet fast and modern VPN designed to replace IPsec and OpenVPN. With approximately 4,000 lines of code (compared to IPsec\'s 400,000+), it uses modern cryptography (ChaCha20, Poly1305, Curve25519) and treats VPN endpoints like static SSH public keys.',
    keyFeatures: [
      'State-of-the-art cryptography: ChaCha20, Poly1305, Curve25519, BLAKE2s',
      'Cryptokey Routing: associates public encryption keys with a list of tunnel IP addresses',
      'Stealth silence: does not respond to unauthenticated packets (invisible to port scanners)',
      'Instantaneous roaming: handles IP address changes seamlessly on mobile devices'
    ],
    useCases: ['Consumer and enterprise fast mobile VPNs (Tailscale, Cloudflare WARP)', 'Cross-cloud VPC mesh networking', 'Server-to-server secure private links'],
    pros: ['Dramatic performance and throughput gains over OpenVPN', 'Tiny attack surface with easy security auditing'],
    cons: ['Static IP mapping inside kernel makes dynamic IP assignment slightly more involved without orchestration layers like Tailscale'],
    actors: [
      { id: 'laptop', label: 'Roaming Laptop', icon: 'Laptop', color: '#6366f1' },
      { id: 'vpn', label: 'WireGuard Gateway', icon: 'Server', color: '#10b981' }
    ],
    interactiveSteps: [
      {
        step: 1,
        title: '1-RTT Handshake Initiation',
        description: 'Laptop transmits 148-byte UDP packet containing its Curve25519 ephemeral key encrypted with server public key.',
        actorSource: 'laptop',
        actorTarget: 'vpn',
        explanation: 'The handshake completes in just 1 round-trip using Noise protocol framework.',
        packetInfo: {
          id: 'wg-pkt-1',
          source: '192.168.1.10:51820',
          destination: '203.0.113.5:51820',
          type: 'WireGuard Handshake Initiation',
          summary: 'Type: 1, SenderIndex: 0x14a8, Unauthenticated packet length: 148 bytes',
          payload: { messageType: 1, senderIndex: '0x14a8', encryptedEphemeral: '0x9fa1...' }
        }
      },
      {
        step: 2,
        title: 'Handshake Response & Encrypted Transport',
        description: 'Gateway responds with 92-byte Handshake Response. Symmetric session keys are derived immediately.',
        actorSource: 'vpn',
        actorTarget: 'laptop',
        explanation: 'Both parties immediately begin passing ChaCha20-Poly1305 encrypted traffic at near-line speed.',
        packetInfo: {
          id: 'wg-pkt-2',
          source: '203.0.113.5:51820',
          destination: '192.168.1.10:51820',
          type: 'WireGuard Handshake Response',
          summary: 'Type: 2, ReceiverIndex: 0x14a8, Handshake Done',
          payload: { messageType: 2, receiverIndex: '0x14a8', sessionKeyDerived: true }
        }
      }
    ],
    liveSandboxType: 'generic-simulator',
    quiz: [
      {
        id: 'wg-q1',
        question: 'Which symmetric cipher algorithm is used by WireGuard for high-speed packet payload encryption?',
        options: ['Triple DES (3DES)', 'ChaCha20-Poly1305', 'RC4', 'Blowfish'],
        correctAnswer: 1,
        explanation: 'WireGuard uses modern ChaCha20 for symmetric encryption and Poly1305 for authentication tag verification.'
      }
    ]
  },
  {
    id: 'oauth2',
    slug: 'oauth2',
    name: 'OAuth 2.0',
    fullName: 'Open Authorization 2.0',
    category: 'security',
    osiLayer: 'Application',
    port: '443 (HTTPS)',
    rfc: 'RFC 6749',
    yearIntroduced: 2012,
    shortSummary: 'Industry-standard authorization framework enabling third-party applications to obtain limited access to protected HTTP services.',
    description: 'OAuth 2.0 allows users to grant websites or applications access to their information on other websites (e.g. "Log in with Google" or allowing a tool to access your GitHub repositories) without handing over their actual passwords.',
    keyFeatures: [
      'Authorization Code Flow with Proof Key for Code Exchange (PKCE)',
      'Short-lived Access Tokens and long-lived Refresh Tokens',
      'Granular permission scopes (e.g. `read:user`, `repo:status`)',
      'Four roles: Resource Owner, Client, Authorization Server, Resource Server'
    ],
    useCases: ['Third-party API integration access (Google Drive, Slack, GitHub)', 'Single Sign-On (SSO) delegation architectures', 'Mobile app backend authorization'],
    pros: ['Users never expose passwords to third-party apps', 'Permissions can be revoked selectively at any time'],
    cons: ['Vulnerable to token theft or redirect URI manipulation if PKCE and HTTPS are not strictly enforced'],
    actors: [
      { id: 'user', label: 'End User Browser', icon: 'Laptop', color: '#6366f1' },
      { id: 'authServer', label: 'Auth Server (Google/GitHub)', icon: 'ShieldCheck', color: '#06b6d4' },
      { id: 'api', label: 'Resource Server (API)', icon: 'Server', color: '#10b981' }
    ],
    interactiveSteps: [
      {
        step: 1,
        title: 'Authorization Code Grant Request with PKCE',
        description: 'Client redirects user to Auth Server consent screen with Client ID, Scope, and `code_challenge`.',
        actorSource: 'user',
        actorTarget: 'authServer',
        explanation: 'User approves consent screen. Auth Server redirects back to client with a temporary one-time `code`.',
        packetInfo: {
          id: 'oauth-pkt-1',
          source: 'Browser',
          destination: 'accounts.provider.com/oauth/authorize',
          type: 'HTTP GET (Authorize)',
          summary: 'response_type=code, scope=user:read, code_challenge=E9Mel...',
          payload: { client_id: 'app_123', redirect_uri: 'https://app.com/callback', response_type: 'code' }
        }
      },
      {
        step: 2,
        title: 'Code Exchange for Bearer Access Token',
        description: 'Client backend exchanges one-time `code` + `code_verifier` for an access token via secure POST request.',
        actorSource: 'user',
        actorTarget: 'authServer',
        explanation: 'Auth Server validates PKCE verifier and issues short-lived JWT Access Token and Refresh Token.',
        packetInfo: {
          id: 'oauth-pkt-2',
          source: 'Client Backend',
          destination: 'accounts.provider.com/oauth/token',
          type: 'HTTP POST (Token)',
          summary: 'grant_type=authorization_code, code=splat9812',
          payload: { access_token: 'eyJhbGciOi...', token_type: 'Bearer', expires_in: 3600 }
        }
      }
    ],
    liveSandboxType: 'generic-simulator',
    quiz: [
      {
        id: 'oauth-q1',
        question: 'What security enhancement is required in modern OAuth 2.0 to prevent authorization code interception attacks on mobile and SPA apps?',
        options: ['SAML Assertion', 'PKCE (Proof Key for Code Exchange)', 'Basic Auth', 'HMAC Cookie'],
        correctAnswer: 1,
        explanation: 'PKCE (Proof Key for Code Exchange) creates a dynamic cryptographic verifier that prevents attackers from redeeming stolen authorization codes.'
      }
    ]
  }
];

