import { Protocol } from '@/types/protocol';

export const APPLICATION_PROTOCOLS: Protocol[] = [
  {
    id: 'http',
    slug: 'http',
    name: 'HTTP / HTTPS',
    fullName: 'Hypertext Transfer Protocol Secure',
    category: 'application',
    osiLayer: 'Application',
    port: '80 / 443',
    rfc: 'RFC 9110, RFC 9112',
    yearIntroduced: 1991,
    shortSummary: 'The stateless, request-response foundation of data communication for the World Wide Web.',
    description: 'HTTP is an application-level protocol for distributed hypermedia systems. Secured by TLS as HTTPS, it encrypts the session to prevent eavesdropping and data tampering.',
    keyFeatures: [
      'Stateless client-server request/response model',
      'Standardized HTTP verbs (GET, POST, PUT, DELETE, PATCH, OPTIONS)',
      'Rich header semantics (caching, content negotiation, authentication)',
      'TLS encryption via HTTPS (Port 443)'
    ],
    useCases: ['Serving web pages and SPA assets', 'RESTful web APIs', 'Microservice webhooks', 'CDN content distribution'],
    pros: ['Universal platform support across all operating systems', 'Human-readable header text (HTTP/1.1)'],
    cons: ['Stateless nature requires cookies/tokens for sessions', 'HTTP/1.1 text header redundancy'],
    actors: [
      { id: 'browser', label: 'Web Browser / Client', icon: 'Globe', color: '#6366f1' },
      { id: 'webserver', label: 'Origin Web Server', icon: 'Server', color: '#10b981' }
    ],
    interactiveSteps: [
      {
        step: 1,
        title: 'Client Transmits HTTP Request',
        description: 'Client crafts an HTTP request line, headers, and optional body to send to the server.',
        actorSource: 'browser',
        actorTarget: 'webserver',
        explanation: 'An HTTP GET request is formed specifying method, URI path, HTTP version, and headers.',
        packetInfo: {
          id: 'http-pkt-1',
          source: '192.168.1.100',
          destination: '93.184.216.34:443',
          type: 'HTTP Request',
          summary: 'GET /api/v1/protocols HTTP/1.1',
          payload: { method: 'GET', path: '/api/v1/protocols', headers: { Host: 'api.protostack.dev' } }
        }
      },
      {
        step: 2,
        title: 'Server Processes & Returns Response',
        description: 'The server executes application logic, formats the response, and sends HTTP status code with body.',
        actorSource: 'webserver',
        actorTarget: 'browser',
        explanation: 'Server returns HTTP/1.1 200 OK along with Content-Type header and JSON payload.',
        packetInfo: {
          id: 'http-pkt-2',
          source: 'Server',
          destination: 'Client',
          type: 'HTTP Response',
          summary: 'HTTP/1.1 200 OK (Content-Type: application/json)',
          payload: { status: 200, statusText: 'OK', headers: { 'Content-Type': 'application/json' }, body: '{"success": true}' }
        }
      }
    ],
    liveSandboxType: 'http-client',
    quiz: [
      {
        id: 'http-q1',
        question: 'Which HTTP status code signifies that a resource was successfully created?',
        options: ['200 OK', '201 Created', '204 No Content', '301 Moved Permanently'],
        correctAnswer: 1,
        explanation: 'HTTP 201 Created is the standard response sent when a POST request successfully creates a new resource.'
      }
    ]
  },
  {
    id: 'websocket',
    slug: 'websocket',
    name: 'WebSocket',
    fullName: 'WebSocket Protocol',
    category: 'application',
    osiLayer: 'Application',
    port: '80 / 443',
    rfc: 'RFC 6455',
    yearIntroduced: 2011,
    shortSummary: 'Full-duplex, persistent two-way communication channel over a single TCP connection.',
    description: 'WebSocket provides persistent, low-latency, full-duplex communication channels between client and server over a single TCP connection. Unlike HTTP request/response polling, either side can send messages at any time with minimal frame overhead.',
    keyFeatures: [
      'Initiated via an HTTP 101 Switching Protocols upgrade handshake',
      'Ultra-thin 2 to 10 byte framing header',
      'Full-duplex bidirectional data streaming',
      'Supports text (UTF-8) and binary (ArrayBuffer/Blob) frames'
    ],
    useCases: ['Live chat and collaboration tools', 'Real-time financial tickers', 'Multiplayer online gaming', 'Live streaming dashboards'],
    pros: ['Extremely low latency compared to HTTP long-polling', 'Persistent socket eliminates per-message connection setup'],
    cons: ['Requires sticky sessions or pub/sub backplanes to scale across multiple server nodes'],
    actors: [
      { id: 'client', label: 'Web Browser Client', icon: 'Laptop', color: '#6366f1' },
      { id: 'server', label: 'WebSocket Gateway', icon: 'Server', color: '#06b6d4' }
    ],
    interactiveSteps: [
      {
        step: 1,
        title: 'HTTP Upgrade Handshake Request',
        description: 'Client connects over HTTP and asks to upgrade the connection to WebSocket.',
        actorSource: 'client',
        actorTarget: 'server',
        explanation: 'Headers include "Upgrade: websocket" and a generated "Sec-WebSocket-Key" challenge.',
        packetInfo: {
          id: 'ws-pkt-1',
          source: 'Client',
          destination: 'Server',
          type: 'HTTP Upgrade Request',
          summary: 'GET /chat HTTP/1.1 | Upgrade: websocket',
          payload: { Upgrade: 'websocket', Connection: 'Upgrade', 'Sec-WebSocket-Key': 'dGhlIHNhbXBsZSBub25jZQ==' }
        }
      },
      {
        step: 2,
        title: 'Server Accepts Upgrade (101)',
        description: 'Server accepts the upgrade request with HTTP 101 Switching Protocols and hashes the challenge key.',
        actorSource: 'server',
        actorTarget: 'client',
        explanation: 'The TCP socket remains open and switches from HTTP mode to the binary WebSocket framing protocol.',
        packetInfo: {
          id: 'ws-pkt-2',
          source: 'Server',
          destination: 'Client',
          type: 'HTTP 101 Switching Protocols',
          summary: 'Connection upgraded to WebSocket duplex channel',
          payload: { status: 101, 'Sec-WebSocket-Accept': 's3pPLMBiTxaQ9kYGzzhZRbK+xOo=' }
        }
      },
      {
        step: 3,
        title: 'Duplex Message Streaming',
        description: 'Both parties can now push real-time text or binary frames with just 2 bytes of overhead.',
        actorSource: 'client',
        actorTarget: 'server',
        explanation: 'Client sends a chat message. Server broadcasts it instantaneously.',
        packetInfo: {
          id: 'ws-pkt-3',
          source: 'Client',
          destination: 'Server',
          type: 'WS Frame (Text)',
          summary: 'Opcode: 0x1 (Text), Payload: "Hello, World!"',
          payload: { fin: true, opcode: '0x1 Text', payload: '{"msg": "Hello, World!"}' }
        }
      }
    ],
    liveSandboxType: 'generic-simulator',
    quiz: [
      {
        id: 'ws-q1',
        question: 'Which HTTP status code is returned by a server when upgrading a connection to WebSocket?',
        options: ['200 OK', '101 Switching Protocols', '301 Moved Permanently', '204 No Content'],
        correctAnswer: 1,
        explanation: 'The server responds with HTTP 101 Switching Protocols to indicate connection protocol upgrade.'
      }
    ]
  },
  {
    id: 'ssh',
    slug: 'ssh',
    name: 'SSH',
    fullName: 'Secure Shell',
    category: 'security',
    osiLayer: 'Application',
    port: 22,
    rfc: 'RFC 4253',
    yearIntroduced: 1995,
    shortSummary: 'Encrypted network protocol for operating network services and command-line terminals securely over an unsecured network.',
    description: 'SSH replaced insecure cleartext terminal protocols like Telnet and rlogin. It provides strong public-key authentication, encrypted remote shell sessions, secure file transfer (SFTP/SCP), and encrypted TCP port tunneling.',
    keyFeatures: [
      'Diffie-Hellman cryptographic key exchange',
      'Public Key (ED25519, RSA) and password authentication',
      'Secure port forwarding and SOCKS5 proxy tunneling',
      'Encrypted remote shell execution and SFTP subsystem'
    ],
    useCases: ['Remote Linux server administration', 'Git over SSH repository push/pull', 'Encrypted database port tunneling'],
    pros: ['Industry gold standard for secure server administration', 'Strong cryptographic forward secrecy'],
    cons: ['Requires strict host-key verification to prevent man-in-the-middle on first connect (TOFU model)'],
    actors: [
      { id: 'admin', label: 'DevOps Terminal', icon: 'Laptop', color: '#6366f1' },
      { id: 'server', label: 'Production Server', icon: 'Server', color: '#10b981' }
    ],
    interactiveSteps: [
      {
        step: 1,
        title: 'Version Exchange & Cipher Negotiation',
        description: 'Client connects to port 22 and exchanges protocol string (SSH-2.0-OpenSSH_9.0).',
        actorSource: 'admin',
        actorTarget: 'server',
        explanation: 'Both sides negotiate encryption algorithms (e.g. chacha20-poly1305, aes256-gcm) and key exchange (curve25519-sha256).',
        packetInfo: {
          id: 'ssh-pkt-1',
          source: 'Client:51234',
          destination: 'Server:22',
          type: 'SSH_MSG_KEXINIT',
          summary: 'KEX: curve25519-sha256 | Cipher: chacha20-poly1305',
          payload: { clientVersion: 'SSH-2.0-OpenSSH_9.0', kexAlgorithms: ['curve25519-sha256'] }
        }
      },
      {
        step: 2,
        title: 'Public Key Authentication & Shell Allocation',
        description: 'Client proves possession of private key via signature. Server admits user and spawns PTY shell.',
        actorSource: 'server',
        actorTarget: 'admin',
        explanation: 'The session key encrypts all keystrokes and shell outputs.',
        packetInfo: {
          id: 'ssh-pkt-2',
          source: 'Server:22',
          destination: 'Client:51234',
          type: 'SSH_MSG_USERAUTH_SUCCESS',
          summary: 'Authenticated as user "root" | PTY Allocated',
          payload: { authSuccess: true, channelType: 'session' }
        }
      }
    ],
    liveSandboxType: 'generic-simulator',
    quiz: [
      {
        id: 'ssh-q1',
        question: 'What is the default TCP port for SSH connections?',
        options: ['Port 21', 'Port 22', 'Port 23', 'Port 80'],
        correctAnswer: 1,
        explanation: 'SSH operates on TCP port 22 by default (whereas Telnet was port 23 and FTP was port 21).'
      }
    ]
  },
  {
    id: 'grpc',
    slug: 'grpc',
    name: 'gRPC',
    fullName: 'gRPC Remote Procedure Call',
    category: 'cloud',
    osiLayer: 'Application',
    port: '443 / 50051',
    rfc: 'CNCF Project Standard',
    yearIntroduced: 2015,
    shortSummary: 'High-performance, open-source universal RPC framework leveraging Protocol Buffers and HTTP/2 transport.',
    description: 'gRPC enables client applications to directly call methods on a server application on a different machine as if it were a local object. By combining strongly typed Protocol Buffers (Protobuf) serialization with HTTP/2 multiplexed streaming, gRPC delivers up to 10x faster performance than traditional JSON REST APIs.',
    keyFeatures: [
      'Compact binary serialization via Protocol Buffers (.proto schemas)',
      'Built natively on HTTP/2 transport with bidirectional streaming',
      'Strongly typed contracts with auto-generated client SDKs across 10+ languages',
      'Built-in deadline propagation, cancellation, and metadata headers'
    ],
    useCases: ['High-throughput microservices internal communication', 'Low-latency mobile app backends', 'Cloud-native Kubernetes service mesh (Envoy)'],
    pros: ['Much faster and smaller payloads than JSON REST', 'Native support for client/server/bidirectional streaming'],
    cons: ['Binary payloads are not directly human-readable in standard browser devtools', 'Requires gRPC-Web proxy for standard browser support'],
    actors: [
      { id: 'client', label: 'Order Microservice', icon: 'Laptop', color: '#6366f1' },
      { id: 'service', label: 'Payment Microservice', icon: 'Server', color: '#10b981' }
    ],
    interactiveSteps: [
      {
        step: 1,
        title: 'Unary RPC Invocation',
        description: 'Client calls `ProcessPayment(PaymentRequest)` serialized into Protobuf binary format over HTTP/2 POST.',
        actorSource: 'client',
        actorTarget: 'service',
        explanation: 'Header sets `content-type: application/grpc+proto` and TE: trailers.',
        packetInfo: {
          id: 'grpc-pkt-1',
          source: 'OrderService',
          destination: 'PaymentService:50051',
          type: 'HTTP/2 HEADERS + DATA (gRPC)',
          summary: 'POST /payment.v1.PaymentService/ProcessPayment',
          payload: { 'content-type': 'application/grpc+proto', method: 'ProcessPayment', protoBytes: '0x0896011207555344' }
        }
      },
      {
        step: 2,
        title: 'Binary Protobuf Response with Trailer Status',
        description: 'Payment service processes request, returns binary response frame, and sends `grpc-status: 0 (OK)` in HTTP/2 trailers.',
        actorSource: 'service',
        actorTarget: 'client',
        explanation: 'gRPC conveys final status codes inside HTTP/2 trailers rather than HTTP status headers.',
        packetInfo: {
          id: 'grpc-pkt-2',
          source: 'PaymentService',
          destination: 'OrderService',
          type: 'HTTP/2 DATA + TRAILERS',
          summary: 'grpc-status: 0 (OK) | PaymentApproved',
          payload: { grpcStatus: 0, statusDescription: 'OK', paymentId: 'pay_982341' }
        }
      }
    ],
    liveSandboxType: 'generic-simulator',
    quiz: [
      {
        id: 'grpc-q1',
        question: 'What interface definition language (IDL) and serialization mechanism does gRPC use by default?',
        options: ['JSON Schema', 'Protocol Buffers (Protobuf)', 'XML / SOAP', 'Apache Avro'],
        correctAnswer: 1,
        explanation: 'gRPC uses Protocol Buffers (.proto files) to define strong service contracts and serialize binary messages.'
      }
    ]
  },
  {
    id: 'snmp',
    slug: 'snmp',
    name: 'SNMP',
    fullName: 'Simple Network Management Protocol',
    category: 'application',
    osiLayer: 'Application',
    port: '161 / 162',
    rfc: 'RFC 1157, RFC 3416',
    yearIntroduced: 1988,
    shortSummary: 'Standard protocol for collecting, organizing, and monitoring information from managed network devices.',
    description: 'SNMP is used by network administrators to monitor routers, switches, firewalls, and servers. An SNMP Manager queries SNMP Agents using Management Information Bases (MIBs) and receives unsolicited alerts called SNMP Traps.',
    keyFeatures: [
      'Manager/Agent architecture with hierarchical MIB tree',
      'Operations: GET, GET-NEXT, GET-BULK, SET, and TRAP alerts',
      'Runs over UDP port 161 (polling) and port 162 (traps)',
      'SNMPv3 adds cryptographic authentication (SHA/MD5) and privacy (AES/DES)'
    ],
    useCases: ['Monitoring switch interface bandwidth and packet drop rates', 'Server CPU, RAM, and disk utilization alerts', 'Printer ink and error tracking'],
    pros: ['Supported by virtually every enterprise network switch, router, and UPS device in the world'],
    cons: ['SNMPv1 and v2c send community strings in cleartext (insecure without SNMPv3)'],
    actors: [
      { id: 'manager', label: 'NMS (Prometheus / Zabbix)', icon: 'Laptop', color: '#6366f1' },
      { id: 'switch', label: 'Core Switch Agent', icon: 'Network', color: '#10b981' }
    ],
    interactiveSteps: [
      {
        step: 1,
        title: 'SNMP GET Request (OID Query)',
        description: 'Network management system polls switch port 161 for interface octet count (OID: 1.3.6.1.2.1.2.2.1.10.1).',
        actorSource: 'manager',
        actorTarget: 'switch',
        explanation: 'Query specifies Object Identifier (OID) pointing to the specific interface metric in the MIB.',
        packetInfo: {
          id: 'snmp-pkt-1',
          source: '10.0.0.50:54321',
          destination: '10.0.0.1:161',
          type: 'SNMP GetRequest (v3)',
          summary: 'OID: 1.3.6.1.2.1.2.2.1.10.1 (ifInOctets.1)',
          payload: { version: 'SNMPv3', msgFlags: 'authPriv', oid: '1.3.6.1.2.1.2.2.1.10.1' }
        }
      },
      {
        step: 2,
        title: 'SNMP Response with Metric Value',
        description: 'Switch looks up local hardware counter and returns 64-bit integer representing total bytes transferred.',
        actorSource: 'switch',
        actorTarget: 'manager',
        explanation: 'NMS calculates delta over time to generate live bandwidth graphs.',
        packetInfo: {
          id: 'snmp-pkt-2',
          source: '10.0.0.1:161',
          destination: '10.0.0.50',
          type: 'SNMP GetResponse',
          summary: 'Value: Counter64 = 49281729482 bytes',
          payload: { value: 49281729482, errorStatus: 0 }
        }
      }
    ],
    liveSandboxType: 'generic-simulator',
    quiz: [
      {
        id: 'snmp-q1',
        question: 'What is an unsolicited notification sent by an SNMP agent to notify a manager of an event or failure called?',
        options: ['SNMP Probe', 'SNMP Trap', 'SNMP Echo', 'SNMP Beacon'],
        correctAnswer: 1,
        explanation: 'An SNMP Trap is an asynchronous alert sent to UDP port 162 when an event occurs (e.g., link down, power supply failure).'
      }
    ]
  },
  {
    id: 'smtp',
    slug: 'smtp',
    name: 'SMTP',
    fullName: 'Simple Mail Transfer Protocol',
    category: 'application',
    osiLayer: 'Application',
    port: '25 / 587',
    rfc: 'RFC 5321',
    yearIntroduced: 1982,
    shortSummary: 'The standard communication protocol for transmitting electronic mail (email) across the Internet.',
    description: 'SMTP is used by mail servers and email clients to send messages across networks. While IMAP/POP3 are used to retrieve email from a mailbox, SMTP handles mail delivery between mail transfer agents (MTAs).',
    keyFeatures: [
      'Text-based command/response protocol (HELO, MAIL FROM, RCPT TO, DATA)',
      'Port 25 (MTA-to-MTA relay) and Port 587 (Client email submission with STARTTLS)',
      'MIME extension support for attachments, HTML body, and Unicode',
      'DKIM, SPF, and DMARC authentication integration'
    ],
    useCases: ['Sending transactional emails (password resets, notifications)', 'Inter-server email routing (Gmail to Outlook)'],
    pros: ['Universal standard for all worldwide email transport'],
    cons: ['Inherently lacks sender verification without SPF/DKIM/DMARC, enabling spam spoofing'],
    actors: [
      { id: 'client', label: 'Sender Mail Client', icon: 'Laptop', color: '#6366f1' },
      { id: 'mta', label: 'Mail Server (Postfix)', icon: 'Server', color: '#10b981' }
    ],
    interactiveSteps: [
      {
        step: 1,
        title: 'SMTP Handshake (EHLO)',
        description: 'Client connects to port 587 and greets server with EHLO identifying its hostname.',
        actorSource: 'client',
        actorTarget: 'mta',
        explanation: 'Server responds with supported extensions (STARTTLS, AUTH, SIZE).',
        packetInfo: {
          id: 'smtp-pkt-1',
          source: 'Client:54321',
          destination: 'smtp.mail.com:587',
          type: 'SMTP Command',
          summary: 'EHLO mail.client.org',
          payload: { command: 'EHLO', domain: 'mail.client.org' }
        }
      },
      {
        step: 2,
        title: 'Envelope Definition & Message Delivery',
        description: 'Client issues MAIL FROM and RCPT TO, then streams email headers and body via DATA.',
        actorSource: 'client',
        actorTarget: 'mta',
        explanation: 'Message terminates with a single period line <CRLF>.<CRLF>, and server responds "250 OK: queued as 4fa1".',
        packetInfo: {
          id: 'smtp-pkt-2',
          source: 'Client',
          destination: 'Server',
          type: 'SMTP DATA',
          summary: 'MAIL FROM:<alice@x.com> -> RCPT TO:<bob@y.com>',
          payload: { from: 'alice@x.com', to: 'bob@y.com', subject: 'Project Status Update' }
        }
      }
    ],
    liveSandboxType: 'generic-simulator',
    quiz: [
      {
        id: 'smtp-q1',
        question: 'Which protocol is used to SEND outgoing emails, distinct from IMAP which retrieves them?',
        options: ['SMTP', 'POP3', 'SNMP', 'NNTP'],
        correctAnswer: 0,
        explanation: 'SMTP (Simple Mail Transfer Protocol) is used for sending/routing emails, while IMAP/POP3 are used for reading them.'
      }
    ]
  }
];

