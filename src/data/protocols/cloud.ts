import { Protocol } from '@/types/protocol';

export const CLOUD_PROTOCOLS: Protocol[] = [
  {
    id: 'amqp',
    slug: 'amqp',
    name: 'AMQP',
    fullName: 'Advanced Message Queuing Protocol',
    category: 'cloud',
    osiLayer: 'Application',
    port: 5672,
    rfc: 'OASIS Standard / ISO/IEC 19464',
    yearIntroduced: 2003,
    shortSummary: 'Open standard application layer protocol for enterprise message-oriented middleware (RabbitMQ, Azure Service Bus).',
    description: 'AMQP defines wire-level protocols and message broker models featuring Exchanges (Direct, Fanout, Topic, Headers), Queues, and Bindings. It guarantees enterprise-grade message delivery, transactional publishing, and distributed worker load leveling.',
    keyFeatures: [
      'Flexible routing via Exchanges (Direct, Fanout, Topic, Headers)',
      'Reliable message acknowledgments and dead-letter exchanges (DLX)',
      'Flow control, publisher confirms, and prefetch limits',
      'Binary encoding format for high throughput'
    ],
    useCases: ['Asynchronous background task queues (Celery, BullMQ)', 'Financial trading order execution queues', 'Microservices event-driven choreography'],
    pros: ['Very rich routing semantics without client application code complexity', 'Strict delivery guarantees and durable message persistence'],
    cons: ['Higher broker complexity and resource overhead than lightweight MQTT or Kafka'],
    actors: [
      { id: 'publisher', label: 'Order Microservice', icon: 'Laptop', color: '#6366f1' },
      { id: 'exchange', label: 'AMQP Topic Exchange', icon: 'Server', color: '#06b6d4' },
      { id: 'worker', label: 'Warehouse Worker Queue', icon: 'Database', color: '#10b981' }
    ],
    interactiveSteps: [
      {
        step: 1,
        title: 'Basic.Publish to Topic Exchange',
        description: 'Order service publishes message with routing key `order.eu.created` to `orders.exchange`.',
        actorSource: 'publisher',
        actorTarget: 'exchange',
        explanation: 'AMQP frames define channel ID (1), exchange name, routing key, delivery mode 2 (persistent), and payload.',
        packetInfo: {
          id: 'amqp-pkt-1',
          source: 'OrderApp:54321',
          destination: 'RabbitMQ:5672',
          type: 'AMQP Basic.Publish',
          summary: 'Exchange: "orders.exchange" | RoutingKey: "order.eu.created"',
          payload: { channel: 1, exchange: 'orders.exchange', routingKey: 'order.eu.created', deliveryMode: 2 }
        }
      },
      {
        step: 2,
        title: 'Exchange Binds & Delivers to Worker Queue',
        description: 'Topic exchange matches wildcard binding `order.*.created` and queues message into `warehouse.queue`.',
        actorSource: 'exchange',
        actorTarget: 'worker',
        explanation: 'RabbitMQ pushes `Basic.Deliver` to active consumer worker, awaiting `Basic.Ack`.',
        packetInfo: {
          id: 'amqp-pkt-2',
          source: 'RabbitMQ Broker',
          destination: 'Worker Node',
          type: 'AMQP Basic.Deliver',
          summary: 'DeliveryTag: 42 | ConsumerTag: ctag_1a',
          payload: { consumerTag: 'ctag_1a', deliveryTag: 42, redelivered: false }
        }
      },
      {
        step: 3,
        title: 'Worker Acknowledges Delivery (Basic.Ack)',
        description: 'Warehouse worker finishes processing the order and returns `Basic.Ack` for delivery tag 42 on channel 1.',
        actorSource: 'worker',
        actorTarget: 'exchange',
        explanation: 'The broker removes the message from `warehouse.queue` only after the ack arrives; an unacked message is requeued if the consumer channel closes.',
        packetInfo: {
          id: 'amqp-pkt-3',
          source: 'Worker Node',
          destination: 'RabbitMQ Broker',
          type: 'AMQP Basic.Ack',
          summary: 'DeliveryTag: 42 | Multiple: false | Channel: 1',
          payload: { channel: 1, deliveryTag: 42, multiple: false, requeueOnFailure: true }
        }
      }
    ],
    liveSandboxType: 'generic-simulator',
    quiz: [
      {
        id: 'amqp-q1',
        question: 'Which AMQP exchange type broadcasts an incoming message to all bound queues unconditionally, ignoring routing keys?',
        options: ['Direct Exchange', 'Fanout Exchange', 'Topic Exchange', 'Headers Exchange'],
        correctAnswer: 1,
        explanation: 'A Fanout Exchange routes copies of received messages to all bound queues without inspecting the routing key.'
      },
      {
        id: 'amqp-q2',
        question: 'In AMQP, what does setting the message property `delivery-mode` to 2 request from the broker?',
        options: [
          'Best-effort delivery that may be dropped under memory pressure',
          'Persistent delivery, so the message survives a broker restart once written to disk',
          'Immediate delivery directly to a consumer, bypassing queues',
          'Duplicate delivery of the message to two exchanges'
        ],
        correctAnswer: 1,
        explanation: 'Delivery mode 2 marks a message persistent: the broker writes it to durable storage so it is recovered after a restart, provided the queue is also durable.'
      }
    ]
  },
  {
    id: 'kafka',
    slug: 'kafka',
    name: 'Kafka Protocol',
    fullName: 'Apache Kafka Wire Protocol',
    category: 'cloud',
    osiLayer: 'Application',
    port: 9092,
    rfc: 'Apache Kafka Specification',
    yearIntroduced: 2011,
    shortSummary: 'High-throughput, distributed event-streaming wire protocol designed for partition-ordered logs.',
    description: 'The Kafka protocol is a binary RPC protocol over TCP designed for extreme scale (millions of events per second). Rather than destructive queues, Kafka treats topics as append-only partitioned commit logs, allowing consumer groups to independently read records at their own pace using persistent offsets.',
    keyFeatures: [
      'Append-only partitioned commit log architecture',
      'Zero-copy data transfer from disk straight to network sockets via OS page cache',
      'Batching of produce requests and fetch responses',
      'Consumer Group offset tracking stored in `__consumer_offsets` topic'
    ],
    useCases: ['Real-time telemetry and clickstream ingestion', 'Distributed event sourcing and CQRS patterns', 'Real-time stream processing with Kafka Streams and Flink'],
    pros: ['Unmatched throughput (millions of messages/sec)', 'Horizontal partition scaling and long-term event retention'],
    cons: ['Steep operational learning curve and partition rebalancing complexities'],
    actors: [
      { id: 'producer', label: 'Event Producer', icon: 'Laptop', color: '#6366f1' },
      { id: 'broker', label: 'Kafka Broker (Leader)', icon: 'Server', color: '#10b981' },
      { id: 'consumer', label: 'Consumer Group', icon: 'Database', color: '#06b6d4' }
    ],
    interactiveSteps: [
      {
        step: 1,
        title: 'ProduceRequest (Batch Append)',
        description: 'Producer sends batch of 500 JSON events destined for partition 0 of topic `user-clicks`.',
        actorSource: 'producer',
        actorTarget: 'broker',
        explanation: 'Kafka broker appends records to local disk segment file at offset 10420 and triggers ISR replication.',
        packetInfo: {
          id: 'kafka-pkt-1',
          source: 'ProducerApp',
          destination: 'KafkaBroker:9092',
          type: 'Kafka ProduceRequest (ApiKey: 0)',
          summary: 'Topic: "user-clicks", Partition: 0, Records: 500',
          payload: { apiKey: 0, apiVersion: 9, acks: 1, timeoutMs: 1500, recordsSize: 24500 }
        }
      },
      {
        step: 2,
        title: 'FetchResponse (Zero-Copy Read)',
        description: 'Consumer polls broker with `FetchRequest` specifying its current committed offset.',
        actorSource: 'broker',
        actorTarget: 'consumer',
        explanation: 'Broker streams raw record batches directly from OS page cache using Linux `sendfile` syscall without user-space buffer copies.',
        packetInfo: {
          id: 'kafka-pkt-2',
          source: 'KafkaBroker:9092',
          destination: 'AnalyticsConsumer',
          type: 'Kafka FetchResponse (ApiKey: 1)',
          summary: 'HighWatermark: 10920 | StartingOffset: 10420',
          payload: { throttleTimeMs: 0, errorCode: 0, highWatermark: 10920 }
        }
      },
      {
        step: 3,
        title: 'OffsetCommit (ApiKey: 8)',
        description: 'After processing the fetched records, the consumer commits its progress to the group coordinator.',
        actorSource: 'consumer',
        actorTarget: 'broker',
        explanation: 'The commit writes offset 10920 for `user-clicks` partition 0 into the internal `__consumer_offsets` topic, so a rebalance or restart resumes from that point.',
        packetInfo: {
          id: 'kafka-pkt-3',
          source: 'AnalyticsConsumer',
          destination: 'KafkaBroker:9092',
          type: 'Kafka OffsetCommitRequest (ApiKey: 8)',
          summary: 'Group: "analytics-cg" | Topic: "user-clicks" | Partition: 0 | Offset: 10920',
          payload: { groupId: 'analytics-cg', generationId: 7, topic: 'user-clicks', partition: 0, committedOffset: 10920 }
        }
      }
    ],
    liveSandboxType: 'generic-simulator',
    quiz: [
      {
        id: 'kafka-q1',
        question: 'How does Apache Kafka order messages within a topic?',
        options: [
          'Globally across all partitions simultaneously',
          'Strictly ordered within each individual partition',
          'Randomly ordered based on CPU availability',
          'Alphabetically by message key only'
        ],
        correctAnswer: 1,
        explanation: 'Kafka guarantees total in-order delivery of messages strictly within a specific partition of a topic.'
      },
      {
        id: 'kafka-q2',
        question: 'Where does Kafka durably store the committed offsets of a consumer group by default?',
        options: [
          'In a local file on each consumer machine',
          'In ZooKeeper under /consumers/offsets',
          'In the internal compacted topic `__consumer_offsets`',
          'In the producer record batch headers'
        ],
        correctAnswer: 2,
        explanation: 'Consumer group offsets are committed to the internal `__consumer_offsets` topic, which is log-compacted so only the latest offset per group/topic/partition is retained.'
      }
    ]
  },
  {
    id: 'resp',
    slug: 'resp',
    name: 'RESP (Redis)',
    fullName: 'Redis Serialization Protocol',
    category: 'cloud',
    osiLayer: 'Application',
    port: 6379,
    rfc: 'Redis Protocol Specification (RESP2/RESP3)',
    yearIntroduced: 2009,
    shortSummary: 'Human-readable, lightning-fast binary-safe serialization protocol powering Redis in-memory databases.',
    description: 'RESP is the wire protocol that clients use to communicate with Redis servers. It balances simplicity (human-readable string format) with high parsing performance (binary safe with prefix length indicators).',
    keyFeatures: [
      'Simple type prefixes: Simple String (+), Error (-), Integer (:), Bulk String ($), Array (*)',
      'Binary safe: handles arbitrary binary images, pickled objects, and compressed blobs',
      'Pipelining: client can issue 10,000 commands in a single TCP socket burst without waiting for individual replies',
      'RESP3 adds maps (%), sets (~), booleans (#), and streaming attributes'
    ],
    useCases: ['High-speed in-memory database caching', 'Distributed locks via Redlock', 'Sub-millisecond leaderboard ranking and rate limiting'],
    pros: ['Extremely simple to implement client parsers in any language', 'Tens of thousands of operations per second per core'],
    cons: ['Text-based prefix parsing introduces minor byte overhead compared to pure binary formats like Protobuf'],
    actors: [
      { id: 'client', label: 'Web Server Client', icon: 'Laptop', color: '#6366f1' },
      { id: 'redis', label: 'Redis Server (Port 6379)', icon: 'Database', color: '#10b981' }
    ],
    interactiveSteps: [
      {
        step: 1,
        title: 'RESP Array Command: SET user:100 "Alice"',
        description: 'Client formats command as an array of 3 bulk strings over TCP port 6379.',
        actorSource: 'client',
        actorTarget: 'redis',
        explanation: 'Format is `*3\\r\\n$3\\r\\nSET\\r\\n$8\\r\\nuser:100\\r\\n$5\\r\\nAlice\\r\\n`.',
        packetInfo: {
          id: 'resp-pkt-1',
          source: 'Client:54321',
          destination: 'RedisServer:6379',
          type: 'RESP Command',
          summary: '*3 $3 SET $8 user:100 $5 Alice',
          payload: { command: 'SET', key: 'user:100', value: 'Alice', rawWire: '*3\\r\\n$3\\r\\nSET\\r\\n$8\\r\\nuser:100\\r\\n$5\\r\\nAlice\\r\\n' }
        }
      },
      {
        step: 2,
        title: 'Redis Simple String Response: +OK',
        description: 'Redis commits key-value into RAM in 0.05 milliseconds and returns a simple string response.',
        actorSource: 'redis',
        actorTarget: 'client',
        explanation: 'The `+` byte prefix indicates a simple string response terminated by `\\r\\n`.',
        packetInfo: {
          id: 'resp-pkt-2',
          source: 'RedisServer:6379',
          destination: 'Client',
          type: 'RESP Response',
          summary: '+OK (Execution Time: 0.04ms)',
          payload: { status: 'OK', rawWire: '+OK\\r\\n' }
        }
      },
      {
        step: 3,
        title: 'Pipelined Command Batch (INCR / INCR / GET)',
        description: 'Client writes three commands back-to-back in a single TCP segment instead of waiting for each reply.',
        actorSource: 'client',
        actorTarget: 'redis',
        explanation: 'Redis executes the batch in order and returns `:1\\r\\n:2\\r\\n$2\\r\\n10\\r\\n` as one buffer, eliminating three network round trips.',
        packetInfo: {
          id: 'resp-pkt-3',
          source: 'Client:54321',
          destination: 'RedisServer:6379',
          type: 'RESP Pipelined Commands',
          summary: '*2 INCR hits | *2 INCR hits | *2 GET hits (one write, three replies)',
          payload: { commands: ['INCR hits', 'INCR hits', 'GET hits'], replies: [':1', ':2', '$2 10'], roundTripsSaved: 3 }
        }
      }
    ],
    liveSandboxType: 'generic-simulator',
    quiz: [
      {
        id: 'resp-q1',
        question: 'In the Redis Serialization Protocol (RESP), what prefix character denotes a Bulk String (specifying exact byte length)?',
        options: ['Plus (+)', 'Dollar ($)', 'Asterisk (*)', 'Colon (:)'],
        correctAnswer: 1,
        explanation: 'The dollar sign `$` denotes a bulk string and is followed by the byte length (e.g. `$5\\r\\nhello\\r\\n`).'
      },
      {
        id: 'resp-q2',
        question: 'What is the main performance benefit of RESP pipelining?',
        options: [
          'Commands are executed in parallel across multiple Redis threads',
          'Multiple commands are sent before reading replies, avoiding a round trip per command',
          'Responses are compressed with gzip before transmission',
          'Replies are cached on the client so repeated commands never reach the server'
        ],
        correctAnswer: 1,
        explanation: 'With pipelining the client writes many commands at once and only then reads the replies, which removes per-command network latency; Redis still executes them sequentially.'
      }
    ]
  },
  {
    id: 'webrtc',
    slug: 'webrtc',
    name: 'WebRTC',
    fullName: 'Web Real-Time Communication',
    category: 'cloud',
    osiLayer: 'Application',
    port: 'Dynamic UDP (ICE / STUN / TURN)',
    rfc: 'RFC 8825 - RFC 8835 / W3C Recommendation',
    yearIntroduced: 2011,
    shortSummary: 'Peer-to-peer real-time audio, video, and arbitrary binary data streaming directly between web browsers without plugins.',
    description: 'WebRTC enables sub-second latency peer-to-peer audio, video, and data communication directly between browsers and mobile devices. It leverages SDP (Session Description Protocol) for offer/answer signaling, STUN/TURN for NAT traversal, and SRTP/SCTP for encrypted media and data channels.',
    keyFeatures: [
      'Peer-to-peer direct audio/video streaming via SRTP (Secure Real-time Transport Protocol)',
      'RTCDataChannel for bidirectional, low-latency binary and text transmission over SCTP/DTLS',
      'ICE (Interactive Connectivity Establishment) with STUN and TURN for NAT and firewall traversal',
      'Adaptive bitrate and jitter buffer management tailored for unstable mobile networks'
    ],
    useCases: ['Google Meet, Discord, and Zoom browser video conferences', 'Cloud gaming streaming (GeForce Now, Xbox Cloud)', 'Browser-to-browser P2P file sharing'],
    pros: ['Ultra-low latency (<200ms glass-to-glass)', 'Encrypted by default via DTLS and SRTP', 'Native browser API without third-party plugins'],
    cons: ['P2P mesh topology does not scale past 4–6 participants without a Selective Forwarding Unit (SFU) media server'],
    actors: [
      { id: 'peerA', label: 'Peer A (Caller)', icon: 'Laptop', color: '#6366f1' },
      { id: 'stun', label: 'STUN / TURN Server', icon: 'Globe', color: '#f59e0b' },
      { id: 'peerB', label: 'Peer B (Callee)', icon: 'Laptop', color: '#10b981' }
    ],
    interactiveSteps: [
      {
        step: 1,
        title: 'ICE Candidate Gathering via STUN',
        description: 'Peer A queries STUN server to discover its public IP and reflexive UDP port mapping.',
        actorSource: 'peerA',
        actorTarget: 'stun',
        explanation: 'STUN server inspects the incoming packet and echoes back the public socket 203.0.113.19:54120.',
        packetInfo: {
          id: 'webrtc-pkt-1',
          source: 'PeerA (Private: 192.168.1.5:40000)',
          destination: 'STUN (stun.l.google.com:19302)',
          type: 'STUN Binding Request',
          summary: 'Discover reflexive public IP/port candidate',
          payload: { transactionId: '0x81bfa094', reflexiveCandidate: '203.0.113.19:54120' }
        }
      },
      {
        step: 2,
        title: 'SDP Offer / Answer Signaling Exchange',
        description: 'Peers exchange Session Description Protocol (SDP) payloads containing codecs (Opus, VP9) and ICE candidates.',
        actorSource: 'peerA',
        actorTarget: 'peerB',
        explanation: 'Signaling server relays the SDP offer; Peer B generates and returns an SDP answer.',
        packetInfo: {
          id: 'webrtc-pkt-2',
          source: 'PeerA',
          destination: 'PeerB',
          type: 'SDP Offer (Signaling)',
          summary: 'SDP: Audio(Opus/48000), Video(VP9/90000), DTLS Fingerprint',
          payload: { codecs: ['VP9', 'Opus'], iceCandidatesCount: 4, dtlsRole: 'actpass' }
        }
      },
      {
        step: 3,
        title: 'DTLS Handshake & SRTP Media P2P Stream',
        description: 'Direct P2P connection established. Audio and video frames stream encrypted via SRTP.',
        actorSource: 'peerA',
        actorTarget: 'peerB',
        explanation: 'Keys are derived through DTLS-SRTP. Media streams directly between peers without touching any web server.',
        packetInfo: {
          id: 'webrtc-pkt-3',
          source: 'PeerA:54120',
          destination: 'PeerB:51020',
          type: 'SRTP Media Stream',
          summary: '1080p 60fps VP9 Video Stream (Latency: 42ms)',
          payload: { stream: 'webrtc-video-track', fps: 60, resolution: '1920x1080', latencyMs: 42 }
        }
      }
    ],
    liveSandboxType: 'generic-simulator',
    quiz: [
      {
        id: 'webrtc-q1',
        question: 'What is the role of a STUN server in establishing a WebRTC peer connection?',
        options: [
          'It tells a peer what its public IP address and port mapping are behind NAT',
          'It stores and records video calls on disk',
          'It renders 3D graphics in the browser',
          'It generates SSL certificates'
        ],
        correctAnswer: 0,
        explanation: 'STUN (Session Traversal Utilities for NAT) allows a client behind a router/NAT to discover its public IP address and port to share with peers.'
      },
      {
        id: 'webrtc-q2',
        question: 'When direct peer-to-peer connectivity cannot be established through NAT or firewall, what does a TURN server provide?',
        options: [
          'A relay that forwards the encrypted media between the peers',
          'A certificate authority that signs the DTLS fingerprints',
          'A transcoder that converts VP9 video into H.264',
          'A DNS resolver that maps peer names to IP addresses'
        ],
        correctAnswer: 0,
        explanation: 'TURN allocates a public relay address and forwards packets between peers when ICE cannot find a working direct candidate path; media stays encrypted end to end.'
      }
    ]
  },
  {
    id: 'nats',
    slug: 'nats',
    name: 'NATS',
    fullName: 'NATS Messaging System',
    category: 'cloud',
    osiLayer: 'Application',
    port: 4222,
    rfc: 'Cloud Native Computing Foundation (CNCF)',
    yearIntroduced: 2010,
    shortSummary: 'High-performance, cloud-native pub/sub and distributed messaging system written in Go.',
    description: 'NATS is a CNCF graduated project engineered for high velocity, low latency microservices communication. It features an ultra-simple text protocol (PUB, SUB, MSG, +OK) achieving millions of messages per second with microsecond latencies, alongside JetStream for distributed persistence and deduplication.',
    keyFeatures: [
      'Simple ASCII wire protocol (PUB, SUB, MSG, PING, PONG)',
      'Core publish/subscribe, request-reply, and load-balanced queue groups',
      'JetStream persistence engine with stream deduplication and consumer acknowledgments',
      'Multi-cluster superclusters and leaf nodes for edge-to-cloud topologies'
    ],
    useCases: ['Kubernetes cloud-native microservice telemetry', 'Edge computing and IoT gateway message dispatching', 'Ultra-low latency financial market event buses'],
    pros: ['Blazing fast throughput (over 10 million msgs/sec per server) with sub-millisecond latencies', 'Single lightweight Go binary with zero external dependencies'],
    cons: ['Core NATS provides at-most-once delivery (requires JetStream for persistent guaranteed delivery)'],
    actors: [
      { id: 'publisher', label: 'Payment Microservice', icon: 'Laptop', color: '#6366f1' },
      { id: 'broker', label: 'NATS Server (JetStream)', icon: 'Server', color: '#06b6d4' },
      { id: 'consumer', label: 'Fraud Detection Worker', icon: 'Database', color: '#10b981' }
    ],
    interactiveSteps: [
      {
        step: 1,
        title: 'NATS Queue Subscription (SUB payments.* workers)',
        description: 'Fraud worker connects and registers a queue group subscription to distribute load.',
        actorSource: 'consumer',
        actorTarget: 'broker',
        explanation: 'Worker sends `SUB payments.* workers 1\\r\\n`. Multiple workers sharing the group receive load-balanced messages.',
        packetInfo: {
          id: 'nats-pkt-1',
          source: 'Worker:51200',
          destination: 'NATS:4222',
          type: 'NATS SUB Command',
          summary: 'SUB payments.* queue:workers sid:1',
          payload: { subject: 'payments.*', queueGroup: 'workers', sid: '1' }
        }
      },
      {
        step: 2,
        title: 'High-Velocity Publish (PUB)',
        description: 'Payment service publishes a 48-byte JSON transaction to `payments.usd`.',
        actorSource: 'publisher',
        actorTarget: 'broker',
        explanation: 'Wire format: `PUB payments.usd 48\\r\\n{"tx":"tx_9981","amount":250.00,"currency":"USD"}\\r\\n`.',
        packetInfo: {
          id: 'nats-pkt-2',
          source: 'PaymentApp:54310',
          destination: 'NATS:4222',
          type: 'NATS PUB Command',
          summary: 'PUB payments.usd 48 bytes',
          payload: { subject: 'payments.usd', bytes: 48, data: '{"tx":"tx_9981","amount":250.00,"currency":"USD"}' }
        }
      },
      {
        step: 3,
        title: 'NATS Dispatches MSG to Worker',
        description: 'NATS routes the message to one worker in the queue group within 30 microseconds.',
        actorSource: 'broker',
        actorTarget: 'consumer',
        explanation: 'Server sends `MSG payments.usd 1 48\\r\\n...` directly to the consumer socket.',
        packetInfo: {
          id: 'nats-pkt-3',
          source: 'NATS:4222',
          destination: 'Worker:51200',
          type: 'NATS MSG Delivery',
          summary: 'MSG payments.usd 1 48 (Dispatched in 28μs)',
          payload: { subject: 'payments.usd', sid: '1', sizeBytes: 48 }
        }
      }
    ],
    liveSandboxType: 'generic-simulator',
    quiz: [
      {
        id: 'nats-q1',
        question: 'What is the function of Queue Groups in NATS?',
        options: [
          'They load-balance incoming messages across a pool of subscribing workers so only one gets each message',
          'They permanently delete old messages',
          'They convert JSON to XML',
          'They manage TLS encryption keys'
        ],
        correctAnswer: 0,
        explanation: 'When subscribers join a Queue Group, NATS automatically load-balances messages across them in a 1-of-N pattern.'
      },
      {
        id: 'nats-q2',
        question: 'What delivery guarantee does core NATS publish/subscribe provide without JetStream enabled?',
        options: [
          'Exactly-once delivery with automatic deduplication',
          'At-most-once delivery, where messages are dropped if no subscriber is connected',
          'At-least-once delivery with server-side redelivery',
          'Transactional delivery with two-phase commit'
        ],
        correctAnswer: 1,
        explanation: 'Core NATS is fire-and-forget at-most-once: a message published with no active matching subscriber is lost, and JetStream must be enabled for persistence and redelivery.'
      }
    ]
  },
  {
    id: 'stomp',
    slug: 'stomp',
    name: 'STOMP',
    fullName: 'Simple Text Oriented Messaging Protocol',
    category: 'cloud',
    osiLayer: 'Application',
    port: '61613 / WebSocket',
    rfc: 'STOMP 1.2 Specification',
    yearIntroduced: 2005,
    shortSummary: 'Lightweight, human-readable framing protocol designed for message passing between browsers and enterprise brokers.',
    description: 'STOMP provides an interoperable wire format that enables web browsers (via WebSockets) and multi-language clients to communicate with enterprise message brokers (ActiveMQ, RabbitMQ, HornetQ) using simple HTTP-like headers and verbs (CONNECT, SUBSCRIBE, SEND, MESSAGE).',
    keyFeatures: [
      'HTTP-like header syntax (COMMAND followed by Key:Value headers and NULL byte terminator 0x00)',
      'Native WebSocket integration for browser-to-broker pub/sub (SockJS + STOMP.js)',
      'Heartbeating mechanism to detect broken connections',
      'Transaction support via BEGIN, COMMIT, and ABORT commands'
    ],
    useCases: ['Spring Boot WebSocket real-time web applications', 'Browser push notifications from enterprise JMS brokers', 'Cross-language message bus abstraction between Python and Java'],
    pros: ['Extremely simple and readable; easy to debug with network sniffers', 'Supported out of the box in Spring Framework and enterprise brokers'],
    cons: ['Text header framing introduces more byte overhead than compact binary protocols like MQTT'],
    actors: [
      { id: 'browser', label: 'Web Browser (STOMP.js)', icon: 'Laptop', color: '#6366f1' },
      { id: 'broker', label: 'Spring Boot Broker', icon: 'Server', color: '#10b981' }
    ],
    interactiveSteps: [
      {
        step: 1,
        title: 'STOMP CONNECT Handshake',
        description: 'Browser sends CONNECT frame over WebSocket with accept-version and heart-beat headers.',
        actorSource: 'browser',
        actorTarget: 'broker',
        explanation: 'Broker confirms with CONNECTED frame indicating negotiated STOMP version 1.2.',
        packetInfo: {
          id: 'stomp-pkt-1',
          source: 'Browser:52130',
          destination: 'Broker:61613',
          type: 'STOMP CONNECT',
          summary: 'CONNECT accept-version:1.2, host:api.app.com',
          payload: { command: 'CONNECT', headers: { 'accept-version': '1.2', 'heart-beat': '10000,10000' } }
        }
      },
      {
        step: 2,
        title: 'SUBSCRIBE /topic/notifications',
        description: 'Client subscribes to a destination channel with unique subscription id `sub-0`.',
        actorSource: 'browser',
        actorTarget: 'broker',
        explanation: 'Broker registers client socket to the `/topic/notifications` broadcast stream.',
        packetInfo: {
          id: 'stomp-pkt-2',
          source: 'Browser',
          destination: 'Broker',
          type: 'STOMP SUBSCRIBE',
          summary: 'SUBSCRIBE id:sub-0, destination:/topic/notifications',
          payload: { command: 'SUBSCRIBE', id: 'sub-0', destination: '/topic/notifications' }
        }
      },
      {
        step: 3,
        title: 'MESSAGE Broadcast Frame',
        description: 'Broker pushes MESSAGE frame containing JSON payload ending in NULL byte (0x00).',
        actorSource: 'broker',
        actorTarget: 'browser',
        explanation: 'Client receives event and triggers real-time UI notification badge update.',
        packetInfo: {
          id: 'stomp-pkt-3',
          source: 'Broker',
          destination: 'Browser',
          type: 'STOMP MESSAGE',
          summary: 'MESSAGE destination:/topic/notifications | text: "New alert received"',
          payload: { command: 'MESSAGE', subscription: 'sub-0', body: '{"alert": "High CPU load", "severity": "warning"}' }
        }
      }
    ],
    liveSandboxType: 'generic-simulator',
    quiz: [
      {
        id: 'stomp-q1',
        question: 'What character marks the end of a STOMP frame body on the wire?',
        options: ['NULL byte (0x00)', 'Carriage Return Line Feed (CRLF)', 'Double Semicolon (;;)', 'Closing curly brace (})'],
        correctAnswer: 0,
        explanation: 'Every STOMP frame body terminates with a null byte (ASCII 0, hex 0x00) following the body content.'
      },
      {
        id: 'stomp-q2',
        question: 'Which STOMP command does a client use to publish a message to a destination?',
        options: ['SEND', 'PUBLISH', 'POST', 'MESSAGE'],
        correctAnswer: 0,
        explanation: 'A client publishes with a SEND frame carrying a `destination` header; the broker then delivers the payload in a MESSAGE frame to matching subscribers.'
      }
    ]
  }
];


