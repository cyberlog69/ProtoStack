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
      }
    ]
  }
];

