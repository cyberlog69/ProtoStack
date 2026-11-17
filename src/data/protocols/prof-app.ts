import { Protocol } from '@/types/protocol';

export const PROF_APP_PROTOCOLS: Protocol[] = [
    {
        id: 'webdav',
        slug: 'webdav',
        name: 'WebDAV',
        fullName: 'Web Distributed Authoring and Versioning',
        category: 'application',
        osiLayer: 'Application',
        port: '80 / 443',
        rfc: 'RFC 4918',
        yearIntroduced: 1999,
        shortSummary: 'HTTP extension that turns a web server into a writable filesystem with locking and property metadata.',
        description: 'WebDAV extends HTTP with a set of methods and status codes that allow clients to create, move, copy, lock, and query collections of remote resources. It is the basis of network drives mounted over HTTPS and of collaborative document editing.',
        keyFeatures: [
            'New HTTP methods: PROPFIND, PROPPATCH, MKCOL, COPY, MOVE, LOCK, UNLOCK',
            'Dead properties stored as XML metadata beside each resource',
            'Exclusive and shared write locks prevent lost updates',
            'Runs over existing HTTP or HTTPS infrastructure without a new port'
        ],
        useCases: ['Mounting a remote document share as a drive over HTTPS', 'CalDAV and CardDAV calendar and contact synchronisation', 'Collaborative office suites saving files directly to a server'],
        pros: ['Reuses HTTP authentication, TLS, and proxy infrastructure', 'Standardised metadata and locking make concurrent editing safe'],
        cons: ['Chatty request patterns make bulk directory operations slow', 'Interoperability gaps between vendor lock implementations'],
        actors: [
            { id: 'client', label: 'Authoring Client', icon: 'Laptop', color: '#6366f1' },
            { id: 'server', label: 'WebDAV Server', icon: 'Server', color: '#10b981' }
        ],
        interactiveSteps: [
            {
                step: 1,
                title: 'PROPFIND Requests Resource Properties',
                description: 'The client asks the server for the properties of a collection using the PROPFIND method with Depth: 1.',
                actorSource: 'client',
                actorTarget: 'server',
                explanation: 'PROPFIND is a WebDAV method that returns live and dead properties for a resource and, with Depth: 1, for its immediate children.',
                packetInfo: {
                    id: 'webdav-pkt-1',
                    source: '10.20.4.15:51822',
                    destination: 'dav.example.com:443',
                    type: 'WebDAV PROPFIND',
                    summary: 'PROPFIND /projects/ HTTP/1.1 | Depth: 1',
                    payload: { method: 'PROPFIND', path: '/projects/', depth: 1, body: 'propfind(xml)' }
                }
            },
            {
                step: 2,
                title: 'Server Returns 207 Multi-Status',
                description: 'The server answers with a 207 Multi-Status body containing one response element per resource.',
                actorSource: 'server',
                actorTarget: 'client',
                explanation: 'WebDAV introduced 207 Multi-Status so a single request can report per-resource results instead of one overall status code.',
                packetInfo: {
                    id: 'webdav-pkt-2',
                    source: 'dav.example.com:443',
                    destination: '10.20.4.15:51822',
                    type: 'HTTP 207 Multi-Status',
                    summary: '207 Multi-Status | 4 resources returned',
                    payload: { status: 207, resources: 4, properties: ['getcontentlength', 'getlastmodified', 'resourcetype'] }
                }
            },
            {
                step: 3,
                title: 'LOCK Guards the Resource Before Writing',
                description: 'The client obtains an exclusive write lock and then sends the lock token with its PUT request.',
                actorSource: 'client',
                actorTarget: 'server',
                explanation: 'A successful LOCK returns a lock token that the client must echo in the If header, preventing another author from overwriting the file.',
                packetInfo: {
                    id: 'webdav-pkt-3',
                    source: '10.20.4.15:51822',
                    destination: 'dav.example.com:443',
                    type: 'WebDAV LOCK',
                    summary: 'LOCK /projects/spec.docx | If: (<opaquelocktoken:8f14>)',
                    payload: { method: 'LOCK', resource: '/projects/spec.docx', lockToken: 'opaquelocktoken:8f14e45f', timeout: 'Second-3600' }
                }
            }
        ],
        liveSandboxType: 'generic-simulator',
        quiz: [
            {
                id: 'webdav-q1',
                question: 'Which HTTP status code does a WebDAV server return when a request produces results for several resources?',
                options: ['200 OK', '204 No Content', '207 Multi-Status', '422 Unprocessable Entity'],
                correctAnswer: 2,
                explanation: 'WebDAV defines 207 Multi-Status, whose XML body reports a separate status for each resource touched by the request.'
            },
            {
                id: 'webdav-q2',
                question: 'Which WebDAV method retrieves the properties of a resource and its children?',
                options: ['PROPFIND', 'PROPPATCH', 'MKCOL', 'GET'],
                correctAnswer: 0,
                explanation: 'PROPFIND reads live and dead properties, while PROPPATCH writes them and MKCOL creates a new collection.'
            }
        ]
    },
    {
        id: 'dkim',
        slug: 'dkim',
        name: 'DKIM',
        fullName: 'DomainKeys Identified Mail',
        category: 'security',
        osiLayer: 'Application',
        rfc: 'RFC 6376',
        yearIntroduced: 2011,
        shortSummary: 'Cryptographic email signature that lets a receiving server verify which domain signed a message and that it was not altered.',
        description: 'DKIM adds a DKIM-Signature header to outgoing mail containing a hash of the body and a signature over selected headers. Receivers fetch the signer public key from DNS, so a message signed by a domain can be validated even after it travels through relays.',
        keyFeatures: [
            'RSA or Ed25519 signature carried in the DKIM-Signature header',
            'Body hash (bh=) plus a signed list of header fields (h=)',
            'Public key published as a DNS TXT record at selector._domainkey.domain',
            'Survives forwarding when the relay does not modify signed content'
        ],
        useCases: ['Proving that a bank really sent a notification email', 'Stopping message modification and domain spoofing in transit', 'Providing the DKIM alignment signal used by DMARC'],
        pros: ['Signature verification works without any prior contact between sender and receiver', 'Keys are published in DNS, so no certificate authority is needed'],
        cons: ['Mailing lists that rewrite subject lines break the signature', 'A valid signature alone says nothing about the sender reputation'],
        actors: [
            { id: 'signer', label: 'Signing Mail Transfer Agent', icon: 'Server', color: '#6366f1' },
            { id: 'verifier', label: 'Receiving Mail Transfer Agent', icon: 'Server', color: '#10b981' },
            { id: 'dns', label: 'Authoritative DNS', icon: 'Database', color: '#f59e0b' }
        ],
        interactiveSteps: [
            {
                step: 1,
                title: 'Signing MTA Adds a DKIM-Signature',
                description: 'Before delivery the sending MTA canonicalises the body and headers, hashes them, and signs the result with its private key.',
                actorSource: 'signer',
                actorTarget: 'verifier',
                explanation: 'The signature names the signing domain (d=), the selector (s=), the signed headers (h=), and the body hash (bh=) so the receiver can reproduce the calculation.',
                packetInfo: {
                    id: 'dkim-pkt-1',
                    source: 'mail.sender.example:25',
                    destination: 'mx.receiver.example:25',
                    type: 'SMTP Message with DKIM-Signature',
                    summary: 'DKIM-Signature: v=1; d=sender.example; s=mail2026; bh=...',
                    payload: { version: 1, domain: 'sender.example', selector: 'mail2026', signedHeaders: 'from:to:subject:date', algorithm: 'rsa-sha256' }
                }
            },
            {
                step: 2,
                title: 'Receiver Fetches the Public Key from DNS',
                description: 'The receiving MTA looks up the selector and domain from the signature in DNS to obtain the public key.',
                actorSource: 'verifier',
                actorTarget: 'dns',
                explanation: 'The query targets mail2026._domainkey.sender.example TXT, and the answer carries the p= public key plus key flags.',
                packetInfo: {
                    id: 'dkim-pkt-2',
                    source: 'mx.receiver.example',
                    destination: 'ns1.sender.example:53',
                    type: 'DNS TXT Query',
                    summary: 'mail2026._domainkey.sender.example TXT',
                    payload: { qname: 'mail2026._domainkey.sender.example', qtype: 'TXT', keyTag: 'p=MIIBIjANBg...' }
                }
            },
            {
                step: 3,
                title: 'Verification Result Recorded on Delivery',
                description: 'The receiver recomputes the body hash and verifies the header signature, then records the outcome in Authentication-Results.',
                actorSource: 'verifier',
                actorTarget: 'signer',
                explanation: 'A matching hash and valid signature yield dkim=pass, which downstream spam filters and DMARC evaluation can trust.',
                packetInfo: {
                    id: 'dkim-pkt-3',
                    source: 'mx.receiver.example:25',
                    destination: 'mail.sender.example:25',
                    type: 'SMTP 250 with Authentication-Results',
                    summary: 'Authentication-Results: dkim=pass header.d=sender.example',
                    payload: { status: '250 2.0.0 Ok', dkim: 'pass', signingDomain: 'sender.example', selector: 'mail2026' }
                }
            }
        ],
        liveSandboxType: 'generic-simulator',
        quiz: [
            {
                id: 'dkim-q1',
                question: 'What does the bh= tag in a DKIM-Signature header contain?',
                options: [
                    'The hash of the canonicalised message body',
                    'The public key of the signing domain',
                    'The IP address of the sending relay',
                    'The DKIM policy published by the receiver'
                ],
                correctAnswer: 0,
                explanation: 'The bh= tag holds the base64 hash of the canonicalised body, which the verifier recomputes to detect any modification.'
            },
            {
                id: 'dkim-q2',
                question: 'Where does a receiver obtain the public key needed to verify a DKIM signature?',
                options: [
                    'From a WHOIS lookup on the sending IP address',
                    'From a TXT record at selector._domainkey.signing-domain',
                    'From the Return-Path mailbox over SMTP',
                    'From the message envelope sender in the MAIL FROM command'
                ],
                correctAnswer: 1,
                explanation: 'The s= and d= tags build the DNS name selector._domainkey.domain, whose TXT record carries the p= public key.'
            }
        ]
    },
    {
        id: 'dmarc',
        slug: 'dmarc',
        name: 'DMARC',
        fullName: 'Domain-based Message Authentication, Reporting and Conformance',
        category: 'security',
        osiLayer: 'Application',
        rfc: 'RFC 7489',
        yearIntroduced: 2015,
        shortSummary: 'Policy framework that ties SPF and DKIM results to the visible From domain and tells receivers how to handle failures.',
        description: 'DMARC builds on SPF and DKIM by requiring that at least one of them pass for a domain aligned with the From header. Domain owners publish a policy in DNS and receive aggregate and forensic reports, giving senders visibility and receivers a clear instruction for unauthenticated mail.',
        keyFeatures: [
            'Identifier alignment checks SPF or DKIM against the From header domain',
            'Policy modes p=none, p=quarantine, and p=reject published in DNS',
            'Aggregate reports (rua) and forensic reports (ruf) sent back to the owner',
            'Subdomain policy (sp=) and percentage sampling (pct=) controls'
        ],
        useCases: ['Blocking phishing that forges a company From domain', 'Monitoring SPF and DKIM coverage before enforcing rejection', 'Protecting a brand across all of its subdomains'],
        pros: ['Gives domain owners a single enforceable policy for spoofed mail', 'Reporting reveals which legitimate senders are misconfigured'],
        cons: ['Depends entirely on correct SPF and DKIM deployment', 'Strict rejection can break forwarded mail if alignment fails'],
        actors: [
            { id: 'owner', label: 'Domain Owner', icon: 'Globe', color: '#6366f1' },
            { id: 'receiver', label: 'Receiving Mail Gateway', icon: 'Server', color: '#10b981' },
            { id: 'dns', label: 'Authoritative DNS', icon: 'Database', color: '#f59e0b' }
        ],
        interactiveSteps: [
            {
                step: 1,
                title: 'Domain Owner Publishes the DMARC Record',
                description: 'The owner adds a TXT record at _dmarc.example.com declaring the policy and report destinations.',
                actorSource: 'owner',
                actorTarget: 'dns',
                explanation: 'The record starts with v=DMARC1 and includes p= for the policy plus rua= for the mailbox that receives aggregate XML reports.',
                packetInfo: {
                    id: 'dmarc-pkt-1',
                    source: 'admin@example.com',
                    destination: 'ns1.example.com:53',
                    type: 'DNS TXT Record Publish',
                    summary: '_dmarc.example.com TXT "v=DMARC1; p=quarantine; rua=mailto:dmarc@example.com"',
                    payload: { name: '_dmarc.example.com', type: 'TXT', policy: 'quarantine', aggregateReport: 'mailto:dmarc@example.com' }
                }
            },
            {
                step: 2,
                title: 'Receiver Queries the DMARC Policy',
                description: 'After SPF and DKIM evaluation, the receiving gateway looks up the policy for the From domain.',
                actorSource: 'receiver',
                actorTarget: 'dns',
                explanation: 'The lookup happens after authentication so the gateway knows whether an aligned SPF or DKIM pass already satisfies the policy.',
                packetInfo: {
                    id: 'dmarc-pkt-2',
                    source: 'mx.receiver.example',
                    destination: 'ns1.example.com:53',
                    type: 'DNS TXT Query',
                    summary: '_dmarc.example.com TXT',
                    payload: { qname: '_dmarc.example.com', qtype: 'TXT', spfResult: 'pass', dkimResult: 'none' }
                }
            },
            {
                step: 3,
                title: 'Policy Applied to Unauthenticated Mail',
                description: 'Because neither aligned mechanism passed, the gateway applies the published quarantine policy to the message.',
                actorSource: 'receiver',
                actorTarget: 'owner',
                explanation: 'The message is placed in quarantine or rejected according to p=, and an aggregate report is later sent to the rua address.',
                packetInfo: {
                    id: 'dmarc-pkt-3',
                    source: 'mx.receiver.example',
                    destination: 'dmarc@example.com',
                    type: 'DMARC Aggregate Report',
                    summary: 'Authentication-Results: dmarc=fail | action=quarantine',
                    payload: { dmarcResult: 'fail', alignment: 'none', action: 'quarantine', reportFormat: 'application/xml' }
                }
            }
        ],
        liveSandboxType: 'generic-simulator',
        quiz: [
            {
                id: 'dmarc-q1',
                question: 'Which condition satisfies DMARC for a message?',
                options: [
                    'The message must pass both SPF and DKIM',
                    'Either SPF or DKIM must pass with an identifier aligned to the From domain',
                    'The sending IP must appear in a DNSBL blocklist',
                    'The message must be signed with a TLS client certificate'
                ],
                correctAnswer: 1,
                explanation: 'DMARC needs only one aligned pass, meaning SPF or DKIM authenticated a domain that matches the visible From header.'
            },
            {
                id: 'dmarc-q2',
                question: 'What does a DMARC policy of p=reject instruct a receiving server to do?',
                options: [
                    'Deliver the message and ignore authentication results',
                    'Quarantine the message in the spam folder',
                    'Reject the message outright when DMARC evaluation fails',
                    'Forward the message to the rua reporting address'
                ],
                correctAnswer: 2,
                explanation: 'p=reject tells receivers to refuse delivery of mail that fails DMARC instead of merely quarantining it.'
            }
        ]
    },
    {
        id: 'rtp',
        slug: 'rtp',
        name: 'RTP',
        fullName: 'Real-time Transport Protocol',
        category: 'application',
        osiLayer: 'Application',
        port: '5004 / 5005',
        rfc: 'RFC 3550',
        yearIntroduced: 1996,
        shortSummary: 'Packet format for carrying live audio and video over UDP with sequence numbers, timestamps, and delivery feedback.',
        description: 'RTP defines how real-time media is framed for transport, adding sequence numbers, timestamps, and a payload type so a receiver can reorder packets, absorb jitter, and detect loss. The companion RTCP protocol carries reception statistics for quality monitoring.',
        keyFeatures: [
            'Sequence number per packet enables loss detection and reordering',
            'Timestamp and payload type support clock recovery and codec demux',
            'Synchronisation source (SSRC) identifies each media stream',
            'RTCP reports carry jitter, loss, and round-trip statistics'
        ],
        useCases: ['VoIP call audio carried over UDP', 'Live video conferencing and streaming media', 'WebRTC media tracks between browsers'],
        pros: ['Minimal header overhead keeps latency low for interactive media', 'Works with any codec through the payload type field'],
        cons: ['Delivers no reliability or congestion control of its own', 'UDP transport means packets can be lost, duplicated, or reordered'],
        actors: [
            { id: 'sender', label: 'RTP Media Sender', icon: 'Laptop', color: '#6366f1' },
            { id: 'receiver', label: 'RTP Media Receiver', icon: 'Smartphone', color: '#10b981' }
        ],
        interactiveSteps: [
            {
                step: 1,
                title: 'Sender Packetises Captured Media',
                description: 'The sender encodes a short audio block and wraps it in an RTP header with a sequence number and timestamp.',
                actorSource: 'sender',
                actorTarget: 'receiver',
                explanation: 'Each packet advances the sequence number by one and the timestamp by the number of samples in the block, letting the receiver rebuild playout timing.',
                packetInfo: {
                    id: 'rtp-pkt-1',
                    source: '203.0.113.10:5004',
                    destination: '198.51.100.24:5004',
                    type: 'RTP Media Packet',
                    summary: 'RTP v2 PT=0 (PCMU) seq=34120 ts=112960',
                    payload: { version: 2, payloadType: 0, sequence: 34120, timestamp: 112960, ssrc: '0x9f2c71a4' }
                }
            },
            {
                step: 2,
                title: 'Receiver Reports Quality over RTCP',
                description: 'The receiver measures jitter and loss, then sends an RTCP receiver report back to the sender.',
                actorSource: 'receiver',
                actorTarget: 'sender',
                explanation: 'RTCP packets are sent on the paired port to report fraction lost, cumulative loss, interarrival jitter, and the highest sequence received.',
                packetInfo: {
                    id: 'rtp-pkt-2',
                    source: '198.51.100.24:5005',
                    destination: '203.0.113.10:5005',
                    type: 'RTCP Receiver Report',
                    summary: 'RR ssrc=0x9f2c71a4 fractionLost=2 jitter=14',
                    payload: { packetType: 201, fractionLost: 2, cumulativeLost: 7, jitter: 14, highestSeq: 34119 }
                }
            },
            {
                step: 3,
                title: 'Sender Adapts and Continues the Stream',
                description: 'Using the report, the sender lowers its bitrate and keeps transmitting packets with the next sequence numbers.',
                actorSource: 'sender',
                actorTarget: 'receiver',
                explanation: 'RTP itself does not adapt; the application or a congestion controller reads RTCP feedback and changes the encoder, which is how WebRTC responds to loss.',
                packetInfo: {
                    id: 'rtp-pkt-3',
                    source: '203.0.113.10:5004',
                    destination: '198.51.100.24:5004',
                    type: 'RTP Media Packet',
                    summary: 'RTP v2 PT=111 (Opus) seq=34121 ts=113920',
                    payload: { version: 2, payloadType: 111, sequence: 34121, timestamp: 113920, ssrc: '0x9f2c71a4', bitrateKbps: 48 }
                }
            }
        ],
        liveSandboxType: 'generic-simulator',
        quiz: [
            {
                id: 'rtp-q1',
                question: 'Which two RTP header fields let a receiver detect loss and reconstruct playout timing?',
                options: [
                    'Checksum and window size',
                    'Sequence number and timestamp',
                    'Source port and destination port',
                    'Flags and fragment offset'
                ],
                correctAnswer: 1,
                explanation: 'The sequence number exposes gaps and reordering, while the timestamp conveys sampling instants for smooth playout.'
            },
            {
                id: 'rtp-q2',
                question: 'Which companion protocol carries reception quality statistics such as jitter and packet loss?',
                options: ['RTCP', 'RSVP', 'SDP', 'SRTP'],
                correctAnswer: 0,
                explanation: 'RTCP periodically exchanges sender and receiver reports alongside the RTP media stream, while SRTP only adds encryption.'
            }
        ]
    },
    {
        id: 'sip',
        slug: 'sip',
        name: 'SIP',
        fullName: 'Session Initiation Protocol',
        category: 'application',
        osiLayer: 'Application',
        port: '5060 / 5061',
        rfc: 'RFC 3261',
        yearIntroduced: 1999,
        shortSummary: 'Text-based signalling protocol for creating, modifying, and tearing down voice, video, and messaging sessions.',
        description: 'SIP borrows the request-response style of HTTP and the address style of email to establish multimedia sessions. INVITE, ACK, and BYE manage call state while SDP in the message body negotiates codecs and media addresses, and proxies route requests between user agents.',
        keyFeatures: [
            'Text request methods: INVITE, ACK, BYE, CANCEL, REGISTER, OPTIONS',
            'SDP body negotiates codecs, RTP ports, and media direction',
            'Proxy, registrar, and redirect servers route requests by address of record',
            'Runs over UDP or TCP on 5060, with TLS on 5061'
        ],
        useCases: ['VoIP desk phones and softphone calls', 'WebRTC gateways bridging browsers to the PSTN', 'Unified communications platforms with presence and video'],
        pros: ['Human-readable text messages simplify troubleshooting', 'Extensible design supports new methods and body types'],
        cons: ['NAT traversal usually requires STUN, TURN, or a session border controller', 'Signalling alone does not guarantee media quality'],
        actors: [
            { id: 'caller', label: 'Calling User Agent', icon: 'Laptop', color: '#6366f1' },
            { id: 'proxy', label: 'SIP Proxy / Registrar', icon: 'Server', color: '#8b5cf6' },
            { id: 'callee', label: 'Called User Agent', icon: 'Smartphone', color: '#10b981' }
        ],
        interactiveSteps: [
            {
                step: 1,
                title: 'Caller Sends INVITE to the Proxy',
                description: 'The caller sends an INVITE with an SDP offer listing supported codecs and the RTP address it will use.',
                actorSource: 'caller',
                actorTarget: 'proxy',
                explanation: 'The proxy resolves the address of record through the registrar and forwards the INVITE toward the callee while tracking the transaction.',
                packetInfo: {
                    id: 'sip-pkt-1',
                    source: '192.0.2.44:5060',
                    destination: 'proxy.example.com:5060',
                    type: 'SIP INVITE',
                    summary: 'INVITE sip:bob@example.com SIP/2.0 | SDP offer',
                    payload: { method: 'INVITE', callId: 'a84b4c76e66710', from: 'sip:alice@example.com', to: 'sip:bob@example.com', sdpMedia: 'audio 49170 RTP/AVP 0' }
                }
            },
            {
                step: 2,
                title: 'Callee Answers with 200 OK',
                description: 'The callee accepts the call and returns 200 OK carrying an SDP answer with its chosen codec and media port.',
                actorSource: 'callee',
                actorTarget: 'caller',
                explanation: 'The 200 OK is a final response to the INVITE; its SDP answer completes the offer-answer exchange, and the proxy routes it back to the caller.',
                packetInfo: {
                    id: 'sip-pkt-2',
                    source: '198.51.100.7:5060',
                    destination: '192.0.2.44:5060',
                    type: 'SIP 200 OK',
                    summary: 'SIP/2.0 200 OK | SDP answer: PCMU/8000',
                    payload: { status: 200, reason: 'OK', callId: 'a84b4c76e66710', sdpMedia: 'audio 50102 RTP/AVP 0', codec: 'PCMU' }
                }
            },
            {
                step: 3,
                title: 'Caller Confirms with ACK',
                description: 'The caller sends ACK to confirm the final response, and the media session starts flowing over RTP.',
                actorSource: 'caller',
                actorTarget: 'callee',
                explanation: 'ACK completes the three-way INVITE transaction; without it the callee keeps retransmitting the 200 OK. Hanging up later uses BYE.',
                packetInfo: {
                    id: 'sip-pkt-3',
                    source: '192.0.2.44:5060',
                    destination: '198.51.100.7:5060',
                    type: 'SIP ACK',
                    summary: 'ACK sip:bob@198.51.100.7 SIP/2.0',
                    payload: { method: 'ACK', callId: 'a84b4c76e66710', cseq: 1, mediaState: 'RTP flowing' }
                }
            }
        ],
        liveSandboxType: 'generic-simulator',
        quiz: [
            {
                id: 'sip-q1',
                question: 'Which transport and port does SIP use by default for unencrypted signalling?',
                options: ['TCP port 5061 only', 'UDP or TCP port 5060', 'UDP port 3478', 'TCP port 1720'],
                correctAnswer: 1,
                explanation: 'SIP signalling defaults to UDP or TCP port 5060, while TLS-secured SIP uses port 5061 and H.323 uses 1720.'
            },
            {
                id: 'sip-q2',
                question: 'Which SIP request ends an established session?',
                options: ['CANCEL', 'BYE', 'OPTIONS', 'REGISTER'],
                correctAnswer: 1,
                explanation: 'BYE terminates a confirmed dialog, whereas CANCEL only stops an INVITE that has not yet been answered.'
            }
        ]
    },
    {
        id: 'nfs',
        slug: 'nfs',
        name: 'NFS',
        fullName: 'Network File System',
        category: 'application',
        osiLayer: 'Application',
        port: 2049,
        rfc: 'RFC 8881',
        yearIntroduced: 1984,
        shortSummary: 'Sun-developed distributed filesystem protocol that lets Unix and Linux hosts mount remote directories as local paths.',
        description: 'NFS exposes a remote server filesystem to clients through Remote Procedure Calls, so applications read and write files as if they were local. Version 4 moved to a single TCP port, added strong security, and introduced COMPOUND procedures that batch operations into one round trip.',
        keyFeatures: [
            'Remote procedure call model over ONC RPC, with NFSv4 using TCP port 2049',
            'NFSv4 COMPOUND batches several operations in a single request',
            'NFSv4.1 sessions provide exactly-once semantics and backchannel callbacks',
            'Kerberos-based security via RPCSEC_GSS in NFSv4'
        ],
        useCases: ['Shared home directories across a Linux compute cluster', 'Central document storage mounted by virtual machines', 'Kubernetes persistent volumes backed by an NFS server'],
        pros: ['Transparent access with normal file permissions and POSIX semantics', 'Mature and highly optimised for Unix and Linux environments'],
        cons: ['Sensitive to network latency and packet loss without tuning', 'Classic versions relied on auxiliary rpcbind and mountd ports'],
        actors: [
            { id: 'client', label: 'NFS Client Host', icon: 'Laptop', color: '#6366f1' },
            { id: 'server', label: 'NFS File Server', icon: 'Server', color: '#10b981' }
        ],
        interactiveSteps: [
            {
                step: 1,
                title: 'Client Establishes an NFSv4.1 Session',
                description: 'The client calls EXCHANGE_ID to register a client identifier and then CREATE_SESSION to open a slot table.',
                actorSource: 'client',
                actorTarget: 'server',
                explanation: 'Sessions are the defining NFSv4.1 feature: they give the client a clientid plus slots so retried requests are executed exactly once.',
                packetInfo: {
                    id: 'nfs-pkt-1',
                    source: '10.0.8.21:874',
                    destination: '10.0.8.10:2049',
                    type: 'NFSv4.1 COMPOUND',
                    summary: 'EXCHANGE_ID + CREATE_SESSION',
                    payload: { procedure: 'EXCHANGE_ID', clientOwner: '10.0.8.21/linux-6.8', minorVersion: 1, slots: 16 }
                }
            },
            {
                step: 2,
                title: 'Client Opens the Remote File',
                description: 'The client resolves the path and sends OPEN for report.csv, receiving a stateid that authorises access.',
                actorSource: 'client',
                actorTarget: 'server',
                explanation: 'OPEN returns a stateid and open state that must accompany later READ and WRITE calls, allowing the server to enforce share reservations.',
                packetInfo: {
                    id: 'nfs-pkt-2',
                    source: '10.0.8.21:874',
                    destination: '10.0.8.10:2049',
                    type: 'NFSv4.1 COMPOUND',
                    summary: 'PUTFH + OPEN report.csv (OPEN4_SHARE_ACCESS_READ)',
                    payload: { operations: ['PUTFH', 'OPEN'], file: 'report.csv', access: 'read', stateid: '0x5d1e' }
                }
            },
            {
                step: 3,
                title: 'Server Returns File Data',
                description: 'The client issues READ on the open stateid and the server replies with the requested byte range.',
                actorSource: 'server',
                actorTarget: 'client',
                explanation: 'The reply carries the file bytes plus an end-of-file flag and the updated stateid, all inside one COMPOUND response.',
                packetInfo: {
                    id: 'nfs-pkt-3',
                    source: '10.0.8.10:2049',
                    destination: '10.0.8.21:874',
                    type: 'NFSv4.1 COMPOUND Reply',
                    summary: 'READ 65536 bytes @ offset 0 | eof=false',
                    payload: { status: 'NFS4_OK', bytesRead: 65536, offset: 0, eof: false, stateid: '0x5d1e' }
                }
            }
        ],
        liveSandboxType: 'generic-simulator',
        quiz: [
            {
                id: 'nfs-q1',
                question: 'Which port and transport does NFSv4 use?',
                options: ['UDP port 111', 'TCP port 2049', 'TCP port 445', 'UDP port 137'],
                correctAnswer: 1,
                explanation: 'NFSv4 uses TCP port 2049 only, unlike earlier versions that needed rpcbind on port 111 and dynamic mountd ports.'
            },
            {
                id: 'nfs-q2',
                question: 'What capability did NFSv4.1 add for exactly-once request handling?',
                options: [
                    'Sessions with slots and a client identifier',
                    'UDP as the only transport',
                    'A separate mount protocol on port 20048',
                    'Clear-text AUTH_SYS as the default security flavour'
                ],
                correctAnswer: 0,
                explanation: 'NFSv4.1 sessions bind a clientid and slot table to the server so retransmitted requests are detected and replayed safely.'
            }
        ]
    },
    {
        id: 'smb',
        slug: 'smb',
        name: 'SMB',
        fullName: 'Server Message Block',
        category: 'application',
        osiLayer: 'Application',
        port: 445,
        rfc: '[MS-SMB2]',
        yearIntroduced: 1983,
        shortSummary: 'Microsoft network file-sharing protocol for reading and writing files, printing, and named pipes over TCP.',
        description: 'SMB is the native file-sharing protocol of Windows and is implemented by Samba on Unix. SMB2 and SMB3 carry file operations, authentication, and locking over TCP port 445, with SMB3 adding encryption, signing, and multichannel throughput.',
        keyFeatures: [
            'SMB2 NEGOTIATE selects the dialect and capabilities for the session',
            'SESSION_SETUP authenticates with NTLM or Kerberos and yields a session id',
            'CREATE, READ, WRITE, and CLOSE operate on file handles called FileIds',
            'SMB3 adds AES encryption, signing, leases, and multichannel'
        ],
        useCases: ['Windows file shares mapped as network drives', 'Domain-controller SYSVOL and Group Policy distribution', 'Samba shares for mixed Windows and Linux networks'],
        pros: ['Native integration with Windows ACLs, Active Directory, and Group Policy', 'SMB3 encryption and signing protect data and integrity in transit'],
        cons: ['Historically targeted by ransomware and relay attacks', 'Legacy SMB1 is insecure and should be disabled'],
        actors: [
            { id: 'client', label: 'Windows Workstation', icon: 'Laptop', color: '#6366f1' },
            { id: 'fileserver', label: 'File Server', icon: 'Server', color: '#10b981' },
            { id: 'dc', label: 'Domain Controller', icon: 'Database', color: '#f59e0b' }
        ],
        interactiveSteps: [
            {
                step: 1,
                title: 'SMB2 NEGOTIATE Selects a Dialect',
                description: 'The client connects to TCP 445 and sends NEGOTIATE listing the SMB dialects and capabilities it supports.',
                actorSource: 'client',
                actorTarget: 'fileserver',
                explanation: 'The server picks the highest mutually supported dialect and returns its security mode, capabilities, and maximum read and write sizes.',
                packetInfo: {
                    id: 'smb-pkt-1',
                    source: '10.1.5.42:49712',
                    destination: '10.1.5.10:445',
                    type: 'SMB2 NEGOTIATE Request',
                    summary: 'NEGOTIATE dialects 0x0202, 0x0210, 0x0300, 0x0311',
                    payload: { command: 'NEGOTIATE', dialects: ['2.0.2', '2.1', '3.0', '3.1.1'], signingEnabled: true }
                }
            },
            {
                step: 2,
                title: 'SESSION_SETUP Authenticates the User',
                description: 'The client authenticates the user with NTLM or Kerberos and receives a session id for subsequent requests.',
                actorSource: 'client',
                actorTarget: 'dc',
                explanation: 'With Kerberos the client obtains a service ticket for cifs/fileserver; the resulting session is bound to the user security context.',
                packetInfo: {
                    id: 'smb-pkt-2',
                    source: '10.1.5.42:49712',
                    destination: '10.1.5.5:88',
                    type: 'Kerberos TGS-REQ',
                    summary: 'TGS-REQ cifs/fileserver.corp.example',
                    payload: { service: 'cifs/fileserver.corp.example', user: 'CORP\\alice', encryption: 'aes256-cts-hmac-sha1-96' }
                }
            },
            {
                step: 3,
                title: 'CREATE and READ the Shared File',
                description: 'The client opens the file with CREATE, reads its contents with READ, and closes the handle.',
                actorSource: 'client',
                actorTarget: 'fileserver',
                explanation: 'CREATE returns a FileId that identifies the open handle; READ uses it to fetch bytes at a given offset before CLOSE releases it.',
                packetInfo: {
                    id: 'smb-pkt-3',
                    source: '10.1.5.42:49712',
                    destination: '10.1.5.10:445',
                    type: 'SMB2 CREATE + READ',
                    summary: 'CREATE \\finance\\q4.xlsx | READ 1 MB @ offset 0',
                    payload: { command: 'CREATE', path: '\\finance\\q4.xlsx', desiredAccess: 'GENERIC_READ', readBytes: 1048576 }
                }
            }
        ],
        liveSandboxType: 'generic-simulator',
        quiz: [
            {
                id: 'smb-q1',
                question: 'Which TCP port does direct-hosted SMB2 and SMB3 traffic use?',
                options: ['TCP port 139', 'TCP port 445', 'TCP port 137', 'TCP port 2049'],
                correctAnswer: 1,
                explanation: 'Modern SMB runs directly over TCP port 445, while port 139 was used for SMB over NetBIOS session service.'
            },
            {
                id: 'smb-q2',
                question: 'Which SMB2 command opens or creates a file and returns a FileId?',
                options: ['NEGOTIATE', 'SESSION_SETUP', 'CREATE', 'TREE_CONNECT'],
                correctAnswer: 2,
                explanation: 'CREATE opens or creates a file or directory and returns the FileId handle used by READ, WRITE, and CLOSE.'
            }
        ]
    },
    {
        id: 'netconf',
        slug: 'netconf',
        name: 'NETCONF',
        fullName: 'Network Configuration Protocol',
        category: 'application',
        osiLayer: 'Application',
        port: 830,
        rfc: 'RFC 6241',
        yearIntroduced: 2006,
        shortSummary: 'XML-based protocol for installing, editing, and validating configuration on network devices over a secure SSH session.',
        description: 'NETCONF replaces screen-scraping CLI automation with structured XML remote procedure calls. A manager opens an SSH subsystem on port 830, exchanges hello messages to learn capabilities, and then edits candidate or running datastores with transactions and rollback support.',
        keyFeatures: [
            'XML-encoded RPC messages framed with end-of-message delimiters',
            'Capability exchange in <hello> messages during session setup',
            'Candidate datastore with <commit>, <discard-changes>, and rollback',
            'Operations include <get-config>, <edit-config>, <copy-config>, <validate>'
        ],
        useCases: ['Automated configuration of routers and switches from an orchestrator', 'Transactional multi-device changes with rollback on failure', 'Model-driven telemetry and configuration with YANG modules'],
        pros: ['Structured, validated changes replace fragile CLI parsing', 'Commit and rollback make configuration changes atomic'],
        cons: ['XML payloads are verbose compared with JSON-based alternatives', 'Requires YANG models to describe device configuration correctly'],
        actors: [
            { id: 'manager', label: 'NETCONF Manager', icon: 'Laptop', color: '#6366f1' },
            { id: 'router', label: 'NETCONF Server (Router)', icon: 'Server', color: '#10b981' }
        ],
        interactiveSteps: [
            {
                step: 1,
                title: 'SSH Subsystem and Hello Exchange',
                description: 'The manager opens an SSH session to port 830, requests the netconf subsystem, and both sides send <hello>.',
                actorSource: 'manager',
                actorTarget: 'router',
                explanation: 'The <hello> messages advertise the base 1.0 or 1.1 capability plus device-specific YANG models, and 1.1 adds chunked framing.',
                packetInfo: {
                    id: 'netconf-pkt-1',
                    source: '10.50.0.20:52014',
                    destination: '10.50.0.1:830',
                    type: 'NETCONF <hello>',
                    summary: 'SSH subsystem netconf | base:1.1, candidate, rollback-on-error',
                    payload: { subsystem: 'netconf', base: '1.1', capabilities: ['urn:ietf:params:netconf:base:1.1', 'urn:ietf:params:netconf:capability:candidate:1.0'] }
                }
            },
            {
                step: 2,
                title: 'Manager Retrieves the Running Configuration',
                description: 'The manager sends a <get-config> RPC with a subtree filter for the interfaces container.',
                actorSource: 'manager',
                actorTarget: 'router',
                explanation: 'The RPC carries a message-id and names the running datastore, so the reply can be matched to the request.',
                packetInfo: {
                    id: 'netconf-pkt-2',
                    source: '10.50.0.20:52014',
                    destination: '10.50.0.1:830',
                    type: 'NETCONF <rpc> get-config',
                    summary: '<get-config><source><running/></source><filter type="subtree">',
                    payload: { messageId: '101', operation: 'get-config', datastore: 'running', filter: '/interfaces/interface[name="Gi0/1"]' }
                }
            },
            {
                step: 3,
                title: 'Device Returns the XML Configuration',
                description: 'The router replies with an <rpc-reply> containing the requested configuration as XML inside a <data> element.',
                actorSource: 'router',
                actorTarget: 'manager',
                explanation: 'The reply echoes the message-id and returns structured data that the manager can parse into a YANG model tree.',
                packetInfo: {
                    id: 'netconf-pkt-3',
                    source: '10.50.0.1:830',
                    destination: '10.50.0.20:52014',
                    type: 'NETCONF <rpc-reply>',
                    summary: 'rpc-reply message-id=101 | <data> interface Gi0/1',
                    payload: { messageId: '101', interface: 'Gi0/1', enabled: true, mtu: 9000, description: 'Uplink to core' }
                }
            }
        ],
        liveSandboxType: 'generic-simulator',
        quiz: [
            {
                id: 'netconf-q1',
                question: 'On which transport and port does NETCONF normally run?',
                options: ['TLS on port 6513', 'SSH on port 830', 'UDP on port 161', 'HTTP on port 8080'],
                correctAnswer: 1,
                explanation: 'NETCONF is standardised over SSH on TCP port 830, and RFC 7589 also defines a TLS mapping on port 6513.'
            },
            {
                id: 'netconf-q2',
                question: 'What does the NETCONF <commit> operation do when a candidate datastore is in use?',
                options: [
                    'Copies the running datastore into the candidate',
                    'Publishes the candidate configuration as the running configuration',
                    'Discards all uncommitted changes',
                    'Deletes the startup configuration'
                ],
                correctAnswer: 1,
                explanation: 'After <edit-config> targets the candidate datastore, <commit> applies those edits to the running configuration atomically.'
            }
        ]
    }
];
