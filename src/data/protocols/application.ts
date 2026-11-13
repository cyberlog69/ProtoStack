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
  },
  {
    id: 'ftp',
    slug: 'ftp',
    name: 'FTP',
    fullName: 'File Transfer Protocol',
    category: 'application',
    osiLayer: 'Application',
    port: '20 / 21',
    rfc: 'RFC 959',
    yearIntroduced: 1971,
    shortSummary: 'Client-server protocol for transferring computer files across a network using separate control and data channels.',
    description: 'FTP operates over two distinct channels: a command/control channel (TCP port 21) for authentication and navigation, and a separate dynamic data channel (TCP port 20 or passive port) for bulk file payload transfer.',
    keyFeatures: [
      'Dual-port architecture (Port 21 Command, Port 20 Data)',
      'Active Mode vs Passive (PASV) Mode to navigate NAT firewalls',
      'Text/ASCII and Binary (IMAGE) file transfer modes',
      'Plaintext credentials (modern setups use FTPS with TLS)'
    ],
    useCases: ['Legacy server file maintenance', 'Website updates via FTP clients like FileZilla', 'Automated bulk document archiving'],
    pros: ['Simple, established standard supported across virtually all operating systems'],
    cons: ['Plaintext passwords and data stream without encryption; firewall complexity due to dual ports'],
    actors: [
      { id: 'client', label: 'FTP Client', icon: 'Laptop', color: '#3b82f6' },
      { id: 'server', label: 'FTP Server (vsftpd)', icon: 'Server', color: '#10b981' }
    ],
    interactiveSteps: [
      {
        step: 1,
        title: 'Control Connection Established',
        description: 'Client connects to server port 21 and sends USER and PASS credentials.',
        actorSource: 'client',
        actorTarget: 'server',
        explanation: 'Server validates credentials and responds with 230 User logged in.',
        packetInfo: {
          id: 'ftp-pkt-1',
          source: 'Client:49152',
          destination: 'Server:21',
          type: 'FTP Command',
          summary: 'USER admin & PASS *******',
          payload: { command: 'USER admin', response: '331 Password required' }
        }
      },
      {
        step: 2,
        title: 'Passive Data Channel (PASV)',
        description: 'Client enters PASV mode. The server binds a dynamic port and returns the IP and port tuple.',
        actorSource: 'client',
        actorTarget: 'server',
        explanation: 'Client sends PASV command; server responds with 227 Entering Passive Mode (192,168,1,50,195,80).',
        packetInfo: {
          id: 'ftp-pkt-2',
          source: 'Server',
          destination: 'Client',
          type: 'FTP Response',
          summary: '227 Entering Passive Mode (Port 50000)',
          payload: { code: 227, dataPort: 50000 }
        }
      },
      {
        step: 3,
        title: 'Data Channel File Stream (RETR / STOR)',
        description: 'Client connects to the negotiated data port to stream file bytes.',
        actorSource: 'server',
        actorTarget: 'client',
        explanation: 'The actual binary file bytes stream across the secondary data connection.',
        packetInfo: {
          id: 'ftp-pkt-3',
          source: 'Server:50000',
          destination: 'Client:49153',
          type: 'FTP Data',
          summary: '150 Opening BINARY mode data connection for report.pdf (2.4 MB)',
          payload: { file: 'report.pdf', sizeBytes: 2489120, status: '226 Transfer complete' }
        }
      }
    ],
    liveSandboxType: 'generic-simulator',
    quiz: [
      {
        id: 'ftp-q1',
        question: 'Why does FTP use two separate TCP connections?',
        options: [
          'One for commands/control (port 21) and one for data payload (port 20/PASV)',
          'One for upload and one for download',
          'One for IPv4 and one for IPv6',
          'One for encryption and one for plaintext'
        ],
        correctAnswer: 0,
        explanation: 'FTP divides control traffic (port 21) from bulk file payloads (port 20 or dynamic passive port) to keep commands responsive during large file transfers.'
      }
    ]
  },
  {
    id: 'sftp',
    slug: 'sftp',
    name: 'SFTP',
    fullName: 'SSH File Transfer Protocol',
    category: 'application',
    osiLayer: 'Application',
    port: 22,
    rfc: 'RFC 913',
    yearIntroduced: 1997,
    shortSummary: 'Secure, encrypted file transfer and filesystem manipulation protocol running over a single SSH session.',
    description: 'Unlike legacy FTP or FTPS, SFTP is an extension of SSH (Secure Shell) that multiplexes commands, data, and authentication through a single encrypted TCP port 22 tunnel, making it exceptionally firewall-friendly.',
    keyFeatures: [
      'Encrypted by SSH v2 (AES-GCM, ChaCha20-Poly1305)',
      'Single-port architecture (TCP 22) - firewall and NAT friendly',
      'Full filesystem operations (chmod, chown, directory listing, file locking, resume)',
      'Public key and password authentication'
    ],
    useCases: ['Secure deployment pipelines (CI/CD artifact upload)', 'Automated banking/payroll batch processing', 'Enterprise secure backup uploads'],
    pros: ['Completely encrypted in transit', 'Single port eliminates complex NAT/firewall pinholing'],
    cons: ['Slightly lower throughput than raw FTP due to crypto overhead on high-bandwidth links'],
    actors: [
      { id: 'client', label: 'SFTP Client', icon: 'Laptop', color: '#6366f1' },
      { id: 'sshd', label: 'OpenSSH Daemon', icon: 'Server', color: '#10b981' }
    ],
    interactiveSteps: [
      {
        step: 1,
        title: 'SSH Channel Subsystem Request',
        description: 'Client authenticates via SSH and requests the "sftp" subsystem channel.',
        actorSource: 'client',
        actorTarget: 'sshd',
        explanation: 'OpenSSH spawns the internal-sftp handler over the encrypted session.',
        packetInfo: {
          id: 'sftp-pkt-1',
          source: 'Client:51234',
          destination: 'Server:22',
          type: 'SSH_MSG_CHANNEL_REQUEST',
          summary: 'subsystem: "sftp"',
          payload: { subsystem: 'sftp', encrypted: true }
        }
      },
      {
        step: 2,
        title: 'SFTP Version Negotiation (SSH_FXP_INIT)',
        description: 'Client sends INIT packet specifying highest supported SFTP protocol version.',
        actorSource: 'client',
        actorTarget: 'sshd',
        explanation: 'Server responds with SSH_FXP_VERSION confirming version 3 or 6.',
        packetInfo: {
          id: 'sftp-pkt-2',
          source: 'Server',
          destination: 'Client',
          type: 'SSH_FXP_VERSION',
          summary: 'SFTP Version 3 Accepted',
          payload: { version: 3, extensions: ['posix-rename@openssh.com', 'statvfs@openssh.com'] }
        }
      },
      {
        step: 3,
        title: 'Encrypted Chunk Transfer (SSH_FXP_WRITE)',
        description: 'Client writes file data chunks with handle and offset, verified by cryptographic MACs.',
        actorSource: 'client',
        actorTarget: 'sshd',
        explanation: 'Server commits bytes to disk and returns SSH_FXP_STATUS SSH_FX_OK.',
        packetInfo: {
          id: 'sftp-pkt-3',
          source: 'Client',
          destination: 'Server',
          type: 'SSH_FXP_WRITE',
          summary: 'Write 32KB Chunk (Offset 0x0000)',
          payload: { handle: '0x01', offset: 0, length: 32768, cipher: 'aes256-gcm@openssh.com' }
        }
      }
    ],
    liveSandboxType: 'generic-simulator',
    quiz: [
      {
        id: 'sftp-q1',
        question: 'Which default port does SFTP operate over?',
        options: ['Port 20', 'Port 21', 'Port 22', 'Port 990'],
        correctAnswer: 2,
        explanation: 'SFTP runs as an SSH subsystem over TCP port 22, unlike FTPS which uses ports 990/989.'
      }
    ]
  },
  {
    id: 'imap',
    slug: 'imap',
    name: 'IMAP',
    fullName: 'Internet Message Access Protocol',
    category: 'application',
    osiLayer: 'Application',
    port: '143 / 993',
    rfc: 'RFC 9051',
    yearIntroduced: 1986,
    shortSummary: 'Client-server email retrieval protocol providing multi-device synchronization and server-side mail storage.',
    description: 'IMAP enables email clients to access and manipulate messages stored on a remote mail server. Unlike POP3 which downloads and deletes, IMAP synchronizes folders, read/unread states, and flags across multiple devices simultaneously.',
    keyFeatures: [
      'Two-way multi-device state synchronization',
      'Server-side mailbox folders and message search',
      'Partial message fetching (fetch headers without large attachments)',
      'IDLE command (RFC 2177) for real-time push email notifications'
    ],
    useCases: ['Smartphone and desktop email clients syncing a shared mailbox', 'Webmail interfaces (Gmail, Outlook, Roundcube)'],
    pros: ['Access all emails from phone, laptop, and webmail simultaneously with identical state'],
    cons: ['Requires significant server-side disk storage and memory for large mailboxes'],
    actors: [
      { id: 'client', label: 'Mail App (iOS / Mac)', icon: 'Smartphone', color: '#6366f1' },
      { id: 'server', label: 'IMAP Server (Dovecot)', icon: 'Server', color: '#06b6d4' }
    ],
    interactiveSteps: [
      {
        step: 1,
        title: 'IMAP TLS Session & Authentication',
        description: 'Client connects via IMAPS port 993 and authenticates via tagged command A01 LOGIN.',
        actorSource: 'client',
        actorTarget: 'server',
        explanation: 'Server authenticates and responds with * CAPABILITY and A01 OK Logged in.',
        packetInfo: {
          id: 'imap-pkt-1',
          source: 'Client:52110',
          destination: 'Server:993',
          type: 'IMAP Command',
          summary: 'A01 LOGIN user@corp.com ********',
          payload: { tag: 'A01', command: 'LOGIN', user: 'user@corp.com' }
        }
      },
      {
        step: 2,
        title: 'Mailbox Selection & Flag Inspection',
        description: 'Client selects INBOX and inspects message counts, unseen flags, and UIDVALIDITY.',
        actorSource: 'client',
        actorTarget: 'server',
        explanation: 'Server returns message counts (* 142 EXISTS, * 3 RECENT) and A02 OK [READ-WRITE].',
        packetInfo: {
          id: 'imap-pkt-2',
          source: 'Server',
          destination: 'Client',
          type: 'IMAP Response',
          summary: '* 142 EXISTS, * 3 RECENT, A02 OK',
          payload: { exists: 142, recent: 3, unseen: 3 }
        }
      },
      {
        step: 3,
        title: 'Real-Time Push Listening (IMAP IDLE)',
        description: 'Client enters IDLE state. The server pushes updates instantly when new mail arrives without polling.',
        actorSource: 'client',
        actorTarget: 'server',
        explanation: 'Dovecot pushes * 143 EXISTS the moment a new email lands in the inbox.',
        packetInfo: {
          id: 'imap-pkt-3',
          source: 'Server',
          destination: 'Client',
          type: 'IMAP IDLE Push',
          summary: '* 143 EXISTS (Instant Push Notification)',
          payload: { newMsgUid: 2841, subject: 'Q4 Financial Report' }
        }
      }
    ],
    liveSandboxType: 'generic-simulator',
    quiz: [
      {
        id: 'imap-q1',
        question: 'What is the primary advantage of IMAP over POP3 for modern users?',
        options: [
          'IMAP keeps emails on the server and synchronizes status across multiple devices',
          'IMAP encrypts emails while POP3 cannot',
          'IMAP is used to send emails instead of SMTP',
          'IMAP does not require an Internet connection'
        ],
        correctAnswer: 0,
        explanation: 'IMAP stores emails on the server, synchronizing reads, deletes, and folders across phones, laptops, and webmail.'
      }
    ]
  },
  {
    id: 'pop3',
    slug: 'pop3',
    name: 'POP3',
    fullName: 'Post Office Protocol version 3',
    category: 'application',
    osiLayer: 'Application',
    port: '110 / 995',
    rfc: 'RFC 1939',
    yearIntroduced: 1988,
    shortSummary: 'Simple mail retrieval protocol designed to download emails to a single client machine and remove them from the server.',
    description: 'POP3 was engineered in the early Internet era when continuous network connectivity and server storage were limited. It connects to the mailbox, downloads all messages to the local machine, marks them for deletion on the server, and disconnects.',
    keyFeatures: [
      'Store-and-forward single-client retrieval model',
      'Port 110 (plaintext) and Port 995 (POP3S over TLS)',
      'Basic commands: USER, PASS, STAT, LIST, RETR, DELE, QUIT',
      'Minimal server resource requirements'
    ],
    useCases: ['Offline email reading on a single primary computer', 'Conserving server storage by offloading all messages locally'],
    pros: ['Extremely simple protocol with tiny server storage footprint'],
    cons: ['Cannot synchronize read/unread states or folders across multiple devices; risk of losing emails if the client drive fails'],
    actors: [
      { id: 'client', label: 'Legacy Mail Client', icon: 'Laptop', color: '#6366f1' },
      { id: 'server', label: 'POP3 Server', icon: 'Server', color: '#10b981' }
    ],
    interactiveSteps: [
      {
        step: 1,
        title: 'Authentication & STAT Query',
        description: 'Client connects, submits credentials, and queries mailbox size via STAT.',
        actorSource: 'client',
        actorTarget: 'server',
        explanation: 'Server responds with message count and total octet size (+OK 5 12540).',
        packetInfo: {
          id: 'pop3-pkt-1',
          source: 'Client:54101',
          destination: 'Server:995',
          type: 'POP3 Command',
          summary: 'STAT -> +OK 5 12540',
          payload: { command: 'STAT', messageCount: 5, bytes: 12540 }
        }
      },
      {
        step: 2,
        title: 'Download & Mark for Deletion (RETR + DELE)',
        description: 'Client downloads each message with RETR and optionally marks it with DELE.',
        actorSource: 'client',
        actorTarget: 'server',
        explanation: 'Server transfers the full raw message payload ending with <CRLF>.<CRLF>.',
        packetInfo: {
          id: 'pop3-pkt-2',
          source: 'Server',
          destination: 'Client',
          type: 'POP3 RETR Data',
          summary: 'RETR 1 (2400 octets)',
          payload: { msgNum: 1, subject: 'Welcome to the network', deletedOnServer: true }
        }
      }
    ],
    liveSandboxType: 'generic-simulator',
    quiz: [
      {
        id: 'pop3-q1',
        question: 'What typically happens to emails on a server when retrieved via standard POP3?',
        options: [
          'They are left synchronized in real time',
          'They are downloaded and marked for deletion from the server',
          'They are automatically forwarded to an SMTP relay',
          'They are archived into a public folder'
        ],
        correctAnswer: 1,
        explanation: 'Standard POP3 downloads messages to the local client and deletes them from the server to free mailbox space.'
      }
    ]
  },
  {
    id: 'ldap',
    slug: 'ldap',
    name: 'LDAP',
    fullName: 'Lightweight Directory Access Protocol',
    category: 'application',
    osiLayer: 'Application',
    port: '389 / 636',
    rfc: 'RFC 4511',
    yearIntroduced: 1993,
    shortSummary: 'Open, vendor-neutral protocol for querying and modifying centralized directory services and user identity trees.',
    description: 'LDAP is the foundation of enterprise identity management (Active Directory, FreeIPA, OpenLDAP). It organizes data into a hierarchical tree of Distinguished Names (DN) optimized for rapid read lookups and authentication binds.',
    keyFeatures: [
      'Hierarchical Directory Information Tree (DIT) structure',
      'Distinguished Names (DN) e.g., "cn=Alice,ou=Engineering,dc=corp,dc=com"',
      'LDAP Bind operation for centralized user authentication',
      'Port 389 (Plaintext/STARTTLS) and Port 636 (LDAPS over TLS)'
    ],
    useCases: ['Enterprise Single Sign-On and employee directory lookup', 'VPN and Linux server PAM authentication', 'Email client address book discovery'],
    pros: ['Extremely fast, indexed read and search queries across millions of user accounts'],
    cons: ['Complex query syntax and rigid schema structure compared to modern REST/SCIM APIs'],
    actors: [
      { id: 'client', label: 'Auth Gateway / App', icon: 'Laptop', color: '#6366f1' },
      { id: 'ldap', label: 'Active Directory / OpenLDAP', icon: 'Database', color: '#8b5cf6' }
    ],
    interactiveSteps: [
      {
        step: 1,
        title: 'LDAP Bind Request (Authentication)',
        description: 'Client connects and submits bind credentials to establish the directory session.',
        actorSource: 'client',
        actorTarget: 'ldap',
        explanation: 'Directory matches password hash and returns bindResponse (resultCode: 0 success).',
        packetInfo: {
          id: 'ldap-pkt-1',
          source: 'App:45120',
          destination: 'LDAP:636',
          type: 'LDAP bindRequest',
          summary: 'bindRequest(cn=admin,dc=corp,dc=com)',
          payload: { bindDN: 'cn=admin,dc=corp,dc=com', version: 3, status: 'success' }
        }
      },
      {
        step: 2,
        title: 'Search Request (Filter: sAMAccountName=jsmith)',
        description: 'Client searches subtree for user attributes (mail, memberOf, telephoneNumber).',
        actorSource: 'client',
        actorTarget: 'ldap',
        explanation: 'LDAP returns searchResEntry with user attributes and terminates with searchResDone.',
        packetInfo: {
          id: 'ldap-pkt-2',
          source: 'LDAP',
          destination: 'Client',
          type: 'LDAP searchResEntry',
          summary: 'Found cn=John Smith (mail: jsmith@corp.com)',
          payload: { dn: 'cn=John Smith,ou=Dev,dc=corp,dc=com', mail: 'jsmith@corp.com', title: 'Senior Engineer' }
        }
      }
    ],
    liveSandboxType: 'generic-simulator',
    quiz: [
      {
        id: 'ldap-q1',
        question: 'What does DN stand for in LDAP terminology?',
        options: ['Distinguished Name', 'Domain Node', 'Directory Network', 'Digital Namespace'],
        correctAnswer: 0,
        explanation: 'DN stands for Distinguished Name, which uniquely identifies an entry in the LDAP directory tree.'
      }
    ]
  },
  {
    id: 'telnet',
    slug: 'telnet',
    name: 'Telnet',
    fullName: 'Teletype Network',
    category: 'application',
    osiLayer: 'Application',
    port: 23,
    rfc: 'RFC 854',
    yearIntroduced: 1969,
    shortSummary: 'Legacy bidirectional, plaintext interactive text communication facility over virtual terminal connections.',
    description: 'Telnet was one of the earliest Internet protocols providing a bidirectional interactive byte-oriented communication facility. Because all keystrokes and passwords are sent completely unencrypted in plaintext, it has been largely superseded by SSH for administration.',
    keyFeatures: [
      '8-bit bidirectional byte stream with character-at-a-time or line mode',
      'In-band negotiation of options using IAC (Interpret As Command, 0xFF)',
      'TCP Port 23 operation',
      'Completely unencrypted (vulnerable to packet sniffing)'
    ],
    useCases: ['Diagnosing raw network port connectivity (telnet host port)', 'Legacy mainframe/switch terminal access in isolated air-gapped labs'],
    pros: ['Ultra-minimal overhead, built into almost every vintage OS'],
    cons: ['Zero encryption; transmits credentials and confidential data in cleartext'],
    actors: [
      { id: 'client', label: 'Terminal Client', icon: 'Terminal', color: '#6366f1' },
      { id: 'host', label: 'Remote Host / Router', icon: 'Server', color: '#ef4444' }
    ],
    interactiveSteps: [
      {
        step: 1,
        title: 'Option Negotiation (IAC DO / DONT / WILL)',
        description: 'Client and host negotiate terminal echo and character set using IAC escape sequences.',
        actorSource: 'client',
        actorTarget: 'host',
        explanation: 'Client sends IAC DO SUPPRESS-GO-AHEAD; host confirms with IAC WILL ECHO.',
        packetInfo: {
          id: 'telnet-pkt-1',
          source: 'Client:53420',
          destination: 'Host:23',
          type: 'Telnet Negotiation',
          summary: 'IAC DO TERMINAL-TYPE, IAC WILL ECHO',
          payload: { command: 'IAC DO', option: 'TERMINAL-TYPE' }
        }
      },
      {
        step: 2,
        title: 'Plaintext Keystroke Transmission',
        description: 'Keystrokes and login passwords stream directly across TCP without encryption.',
        actorSource: 'client',
        actorTarget: 'host',
        explanation: 'Wireshark can capture the entire session including username and passwords in plain ASCII text.',
        packetInfo: {
          id: 'telnet-pkt-2',
          source: 'Client',
          destination: 'Host',
          type: 'Telnet Data',
          summary: 'LOGIN: root | PASS: secret123 (UNENCRYPTED)',
          payload: { cleartextData: 'root\r\nsecret123\r\n', warning: 'Vulnerable to eavesdropping' }
        }
      }
    ],
    liveSandboxType: 'generic-simulator',
    quiz: [
      {
        id: 'telnet-q1',
        question: 'Why was Telnet largely replaced by SSH for remote system administration?',
        options: [
          'Telnet transmits passwords and data in unencrypted plaintext',
          'Telnet cannot run over IP networks',
          'Telnet is limited to 100 baud speed',
          'Telnet only works on Unix operating systems'
        ],
        correctAnswer: 0,
        explanation: 'Telnet does not encrypt traffic, making passwords and commands easily visible to anyone with a packet sniffer.'
      }
    ]
  }
];


