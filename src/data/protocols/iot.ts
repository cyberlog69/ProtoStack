import { Protocol } from '@/types/protocol';

export const IOT_PROTOCOLS: Protocol[] = [
  {
    id: 'mqtt',
    slug: 'mqtt',
    name: 'MQTT',
    fullName: 'Message Queuing Telemetry Transport',
    category: 'iot',
    osiLayer: 'Application',
    port: 1883,
    rfc: 'OASIS Standard / ISO/IEC 20922',
    yearIntroduced: 1999,
    shortSummary: 'Lightweight publish/subscribe messaging protocol designed specifically for resource-constrained IoT devices.',
    description: 'MQTT is an extremely lightweight, publish/subscribe messaging protocol created for constrained devices and low-bandwidth, high-latency or unreliable networks. It is the dominant communication backbone of smart homes, connected vehicles, and industrial telemetry.',
    keyFeatures: [
      'Publish/Subscribe architecture decoupled by topics',
      'Tiny 2-byte header footprint for minimal battery & bandwidth consumption',
      'Three Quality of Service (QoS) delivery tiers (0, 1, and 2)',
      'Last Will and Testament (LWT) for automatic offline detection',
      'Persistent sessions and retained messages'
    ],
    useCases: [
      'Smart home sensors (temperature, motion, light switches)',
      'Automotive telematics and GPS fleet tracking',
      'Industrial automation and SCADA sensor telemetry',
      'Mobile push notifications with low battery overhead'
    ],
    pros: [
      'Ultra low overhead and power usage',
      'Supports millions of concurrent connected sensors',
      'Bi-directional messaging between client and cloud'
    ],
    cons: [
      'Requires a centralized broker that can be a single point of failure without clustering',
      'Payload format is agnostic (usually raw bytes or JSON) with no built-in schema validation'
    ],
    actors: [
      { id: 'sensor', label: 'IoT Sensor (Publisher)', icon: 'Cpu', color: '#10b981' },
      { id: 'broker', label: 'MQTT Broker', icon: 'Server', color: '#6366f1' },
      { id: 'app', label: 'Dashboard (Subscriber)', icon: 'Smartphone', color: '#f59e0b' }
    ],
    interactiveSteps: [
      {
        step: 1,
        title: 'CONNECT to Broker',
        description: 'The IoT sensor establishes a TCP connection to port 1883 and transmits a CONNECT packet.',
        actorSource: 'sensor',
        actorTarget: 'broker',
        explanation: 'The CONNECT packet includes client ID ("temp-sensor-01"), KeepAlive interval (60s), and optional Last Will and Testament (LWT).',
        packetInfo: {
          id: 'mqtt-pkt-1',
          source: '10.0.0.45',
          destination: 'mqtt.hivemq.com:1883',
          type: 'CONNECT',
          summary: 'Client: esp32-sensor-a8 | KeepAlive: 60s',
          payload: { clientId: 'esp32-sensor-a8', cleanSession: true, keepAlive: 60 }
        }
      },
      {
        step: 2,
        title: 'CONNACK (Connection Acknowledged)',
        description: 'The broker validates credentials and returns a CONNACK packet granting session establishment.',
        actorSource: 'broker',
        actorTarget: 'sensor',
        explanation: 'Return code 0 indicates connection accepted. The sensor is now ready to stream telemetry.',
        packetInfo: {
          id: 'mqtt-pkt-2',
          source: 'Broker',
          destination: 'Sensor',
          type: 'CONNACK',
          summary: 'Connection Accepted (Return Code: 0x00)',
          payload: { returnCode: '0x00 Connection Accepted', sessionPresent: false }
        }
      },
      {
        step: 3,
        title: 'Dashboard Issues SUBSCRIBE',
        description: 'A mobile app or web dashboard subscribes to topic "factory/sensor/temperature".',
        actorSource: 'app',
        actorTarget: 'broker',
        explanation: 'The dashboard asks the broker for all future messages matching the wildcard or topic with QoS 1.',
        packetInfo: {
          id: 'mqtt-pkt-3',
          source: 'Mobile App',
          destination: 'Broker',
          type: 'SUBSCRIBE',
          summary: 'Topic: factory/sensor/temperature | QoS: 1',
          payload: { topic: 'factory/sensor/temperature', qos: 1, packetId: 101 }
        }
      },
      {
        step: 4,
        title: 'Sensor PUBLISH Telemetry',
        description: 'The temperature sensor reads 24.5°C and publishes a message to "factory/sensor/temperature".',
        actorSource: 'sensor',
        actorTarget: 'broker',
        explanation: 'The message contains the topic name, QoS level, and raw telemetry payload.',
        packetInfo: {
          id: 'mqtt-pkt-4',
          source: 'Sensor',
          destination: 'Broker',
          type: 'PUBLISH',
          summary: 'Topic: factory/sensor/temperature | Payload: 24.5°C',
          payload: { topic: 'factory/sensor/temperature', qos: 1, payload: '{"temp": 24.5, "unit": "C"}' }
        }
      },
      {
        step: 5,
        title: 'Broker Dispatches to Subscribers',
        description: 'The broker immediately routes the payload to all clients subscribed to that topic.',
        actorSource: 'broker',
        actorTarget: 'app',
        explanation: 'The dashboard receives the real-time update instantaneously, updating the UI chart without polling.',
        packetInfo: {
          id: 'mqtt-pkt-5',
          source: 'Broker',
          destination: 'Mobile App',
          type: 'PUBLISH (Relay)',
          summary: 'Delivered to subscriber client',
          payload: { topic: 'factory/sensor/temperature', payload: '{"temp": 24.5}' }
        }
      }
    ],
    liveSandboxType: 'mqtt-broker',
    quiz: [
      {
        id: 'mqtt-q1',
        question: 'Which MQTT Quality of Service (QoS) tier guarantees that a message is delivered EXACTLY ONCE?',
        options: ['QoS 0 (At most once)', 'QoS 1 (At least once)', 'QoS 2 (Exactly once)', 'QoS 3 (Guaranteed broadcast)'],
        correctAnswer: 2,
        explanation: 'QoS 2 is the highest level of service in MQTT, using a 4-step handshake to guarantee exactly once delivery without duplication.'
      },
      {
        id: 'mqtt-q2',
        question: 'What does the MQTT Last Will and Testament (LWT) feature do?',
        options: [
          'It encrypts the payload with TLS',
          'It lets the broker publish a pre-registered message if the client disconnects unexpectedly',
          'It stores the client password for automatic re-authentication',
          'It compresses retained messages to save bandwidth'
        ],
        correctAnswer: 1,
        explanation: 'The client registers the will message in its CONNECT packet, and the broker publishes it to the specified topic only when the connection drops without a clean DISCONNECT.'
      }
    ]
  },
  {
    id: 'coap',
    slug: 'coap',
    name: 'CoAP',
    fullName: 'Constrained Application Protocol',
    category: 'iot',
    osiLayer: 'Application',
    port: 5683,
    rfc: 'RFC 7252',
    yearIntroduced: 2014,
    shortSummary: 'Specialized web transfer protocol for use with constrained nodes and low-power, lossy networks.',
    description: 'CoAP is designed as a lightweight, binary version of HTTP designed specifically for IoT microcontrollers (like 8-bit MCUs with minimal RAM). It runs over UDP rather than TCP to eliminate handshaking overhead and support multicast.',
    keyFeatures: [
      'RESTful model with GET, POST, PUT, DELETE methods over UDP',
      'Tiny 4-byte fixed binary header',
      'Built-in resource discovery via `/.well-known/core`',
      'Asynchronous subscribe/observe mechanism (RFC 7641)',
      'Security via DTLS (Datagram Transport Layer Security)'
    ],
    useCases: ['Smart utility energy and water meters', 'Agricultural soil moisture sensors', 'Smart city street light control networks'],
    pros: ['Extremely small footprint; runs on MCUs with only 10 KB RAM', 'Native multicast support for group device control'],
    cons: ['UDP requires application-level handling of duplicate packets'],
    actors: [
      { id: 'client', label: 'IoT Sensor Node', icon: 'Cpu', color: '#10b981' },
      { id: 'server', label: 'CoAP Gateway / Server', icon: 'Server', color: '#6366f1' }
    ],
    interactiveSteps: [
      {
        step: 1,
        title: 'Confirmable GET Request (CON)',
        description: 'Constrained device sends a 4-byte binary header with Method Code 0.01 (GET) over UDP port 5683.',
        actorSource: 'client',
        actorTarget: 'server',
        explanation: 'The sensor requests `/sensors/temperature` with a Confirmable (CON) message type requiring an ACK.',
        packetInfo: {
          id: 'coap-pkt-1',
          source: 'Node (UDP)',
          destination: 'Gateway:5683',
          type: 'CoAP CON GET',
          summary: 'Type: CON, Code: 0.01 (GET), Uri-Path: "temperature"',
          payload: { version: 1, type: 'CON', code: '0.01 (GET)', messageId: '0x7d34' }
        }
      },
      {
        step: 2,
        title: 'Piggybacked Acknowledgment (ACK)',
        description: 'Gateway responds with an ACK packet containing the response payload directly inside.',
        actorSource: 'server',
        actorTarget: 'client',
        explanation: 'CoAP optimizes bandwidth by "piggybacking" the 2.05 Content response directly inside the acknowledgment.',
        packetInfo: {
          id: 'coap-pkt-2',
          source: 'Gateway',
          destination: 'Node',
          type: 'CoAP ACK (2.05 Content)',
          summary: 'Code: 2.05 (Content), Payload: 21.8°C',
          payload: { type: 'ACK', code: '2.05 (Content)', payload: '21.8' }
        }
      },
      {
        step: 3,
        title: 'Observe Registration for Streaming Updates',
        description: 'The node re-sends the GET with an Observe option set to 0, asking the gateway to push a notification whenever the temperature reading changes.',
        actorSource: 'client',
        actorTarget: 'server',
        explanation: 'An Observe value of 0 registers the client as an observer under RFC 7641; the gateway then streams unsolicited 2.05 notifications instead of the client polling every few seconds.',
        packetInfo: {
          id: 'coap-pkt-3',
          source: 'Node (UDP)',
          destination: 'Gateway:5683',
          type: 'CoAP CON GET + Observe',
          summary: 'Observe: 0 (Register) | Uri-Path: "temperature" | Token: 0x8f21',
          payload: { type: 'CON', code: '0.01 (GET)', observe: 0, token: '0x8f21' }
        }
      }
    ],
    liveSandboxType: 'generic-simulator',
    quiz: [
      {
        id: 'coap-q1',
        question: 'What underlying transport protocol does standard CoAP use?',
        options: ['TCP', 'UDP', 'SCTP', 'ICMP'],
        correctAnswer: 1,
        explanation: 'CoAP runs on top of UDP (port 5683) to keep message sizes minimal and eliminate TCP connection setup overhead.'
      },
      {
        id: 'coap-q2',
        question: 'Which CoAP message type does a receiver send when it cannot process a Confirmable message?',
        options: ['ACK', 'RST (Reset)', 'NON', 'PING'],
        correctAnswer: 1,
        explanation: 'A Reset message rejects a Confirmable message that the receiver cannot process, while an ACK only acknowledges receipt and may carry a piggybacked response.'
      }
    ]
  },
  {
    id: 'zigbee',
    slug: 'zigbee',
    name: 'Zigbee',
    fullName: 'Zigbee Wireless Mesh Protocol',
    category: 'iot',
    osiLayer: 'Network',
    port: '2.4 GHz Radio (802.15.4)',
    rfc: 'IEEE 802.15.4 / Zigbee Alliance',
    yearIntroduced: 2004,
    shortSummary: 'Low-power, low-data rate wireless mesh networking standard designed for smart home and building automation.',
    description: 'Zigbee creates self-healing mesh networks where devices forward data for each other, extending coverage across entire homes and commercial buildings. Because nodes can sleep for months on coin-cell batteries, Zigbee powers Philips Hue bulbs, smart door locks, and climate sensors.',
    keyFeatures: [
      'Self-healing, self-organizing mesh network topology',
      'Built upon IEEE 802.15.4 low-rate wireless physical radio',
      'Three node roles: Coordinator, Router (mains powered), and End Device (battery powered)',
      '128-bit AES symmetric network and link key encryption'
    ],
    useCases: ['Smart home lighting (Philips Hue, IKEA Trådfri)', 'Home security motion sensors and door contacts', 'HVAC smart thermostatic valves'],
    pros: ['Mesh topology extends range indefinitely without Wi-Fi repeaters', 'Years of battery life on a single CR2032 battery'],
    cons: ['Requires dedicated Zigbee Coordinator gateway to connect to the Internet', 'Limited to 250 kbps maximum data throughput'],
    actors: [
      { id: 'sensor', label: 'Door Sensor (End Device)', icon: 'Cpu', color: '#10b981' },
      { id: 'bulb', label: 'Smart Light (Router)', icon: 'Radio', color: '#06b6d4' },
      { id: 'hub', label: 'Zigbee Hub (Coordinator)', icon: 'Server', color: '#6366f1' }
    ],
    interactiveSteps: [
      {
        step: 1,
        title: 'Sensor Wakes & Hops to Mesh Router',
        description: 'Door contact sensor detects door opening, wakes up in 15ms, and transmits Zigbee cluster command to closest smart bulb.',
        actorSource: 'sensor',
        actorTarget: 'bulb',
        explanation: 'The battery-powered end device conserves energy by transmitting at low radio power to the nearest mains-powered router node.',
        packetInfo: {
          id: 'zb-pkt-1',
          source: '0x12a4 (DoorSensor)',
          destination: '0x0001 (SmartBulb Router)',
          type: 'Zigbee ZCL (IAS Zone)',
          summary: 'Cluster: 0x0500 (IAS Zone) | Status: Alarm 1 (Door Open)',
          payload: { panId: '0x1a2b', clusterId: '0x0500', command: 'Zone Status Change' }
        }
      },
      {
        step: 2,
        title: 'Router Forwards Hop to Coordinator Hub',
        description: 'The smart light bulb retransmits the frame across the mesh network directly to the Zigbee Coordinator gateway.',
        actorSource: 'bulb',
        actorTarget: 'hub',
        explanation: 'Coordinator receives alarm and dispatches instant push notification to user phone.',
        packetInfo: {
          id: 'zb-pkt-2',
          source: '0x0001 (SmartBulb)',
          destination: '0x0000 (Coordinator Hub)',
          type: 'Zigbee Mesh Relay',
          summary: 'Hop count=1, LQI=255 (Max Signal)',
          payload: { source: '0x12a4', event: 'Front Door Opened', time: '12:04:12' }
        }
      },
      {
        step: 3,
        title: 'End Device Discovers Route to Coordinator',
        description: 'Before sending the next alarm the end device broadcasts a Zigbee NWK Route Request, and every mains-powered router re-broadcasts it while accumulating path cost.',
        actorSource: 'sensor',
        actorTarget: 'hub',
        explanation: 'The coordinator answers the route request with a unicast Route Reply along the best-cost path, so subsequent frames use source routing through the mesh instead of flooding.',
        packetInfo: {
          id: 'zb-pkt-3',
          source: '0x12a4 (DoorSensor)',
          destination: '0x0000 (Coordinator Hub)',
          type: 'Zigbee NWK Route Request',
          summary: 'NWK Command: 0x01 (Route Request) | Radius: 8 | Broadcast',
          payload: { routeRequestId: 7, destination: '0x0000', radius: 8, pathCost: 0 }
        }
      }
    ],
    liveSandboxType: 'generic-simulator',
    quiz: [
      {
        id: 'zb-q1',
        question: 'Which device role in a Zigbee network is responsible for forming the network and managing security keys?',
        options: ['Zigbee End Device', 'Zigbee Router', 'Zigbee Coordinator', 'Zigbee Bridge'],
        correctAnswer: 2,
        explanation: 'Every Zigbee network has exactly one Zigbee Coordinator which initiates the network, chooses the radio channel, and manages cryptographic security keys.'
      },
      {
        id: 'zigbee-q2',
        question: 'What raw data rate does Zigbee achieve on its standard 2.4 GHz IEEE 802.15.4 radio?',
        options: ['250 kbps', '11 Mbps', '2 Mbps', '1 Gbps'],
        correctAnswer: 0,
        explanation: 'The 2.4 GHz 802.15.4 PHY used by Zigbee carries 250 kbps across 16 channels, which is plenty for small sensor and control payloads.'
      }
    ]
  },
  {
    id: 'lorawan',
    slug: 'lorawan',
    name: 'LoRaWAN',
    fullName: 'Long Range Wide Area Network',
    category: 'iot',
    osiLayer: 'Data Link',
    port: 'Sub-GHz ISM Radio',
    rfc: 'LoRa Alliance Specification',
    yearIntroduced: 2015,
    shortSummary: 'Low-power, long-range wireless specification capable of transmitting telemetry up to 15 km on battery power.',
    description: 'LoRaWAN is a Low Power Wide Area Network (LPWAN) protocol designed to wirelessly connect battery-operated things to the Internet across regional, national, or global networks. Using sub-GHz chirp spread spectrum radio modulation, LoRaWAN penetrates deep into buildings and travels up to 15 kilometers in rural areas.',
    keyFeatures: [
      'Massive range: 2–5 km in dense urban environments, 15+ km in rural line-of-sight',
      'Ultra-long battery life (10+ years on standard batteries)',
      'Star-of-stars network topology via LoRaWAN gateways',
      'End-to-end 128-bit AES encryption (Network Session Key & App Session Key)'
    ],
    useCases: ['Smart agriculture soil moisture and livestock tracking', 'Municipal water meter automated readings', 'Smart city parking and air quality monitoring'],
    pros: ['Enormous transmission range without recurring cellular SIM subscriptions', 'Free public community network access (The Things Network)'],
    cons: ['Very low data bandwidth (0.3 to 50 kbps) and strict regional duty cycle transmission limits (e.g. 1%)'],
    actors: [
      { id: 'sensor', label: 'Soil Moisture Sensor', icon: 'Cpu', color: '#10b981' },
      { id: 'gateway', label: 'LoRaWAN Tower Gateway', icon: 'Radio', color: '#06b6d4' },
      { id: 'server', label: 'Network Server (TTN)', icon: 'Server', color: '#6366f1' }
    ],
    interactiveSteps: [
      {
        step: 1,
        title: 'Uplink Radio Broadcast (Chirp Spread Spectrum)',
        description: 'Sensor chirps a tiny 20-byte encrypted payload across the 868 MHz / 915 MHz frequency band.',
        actorSource: 'sensor',
        actorTarget: 'gateway',
        explanation: 'Any LoRaWAN gateway within 10 km that overhears the radio transmission picks it up.',
        packetInfo: {
          id: 'lora-pkt-1',
          source: 'DevAddr: 0x26011a2b',
          destination: 'Gateway Antenna',
          type: 'LoRaWAN Uplink',
          summary: 'Freq: 868.1 MHz, SF: 7, BW: 125kHz, SNR: +8.5dB',
          payload: { fPort: 1, payloadHex: '016700dc02683c', decoded: 'Temp: 22.0°C, Moisture: 60%' }
        }
      },
      {
        step: 2,
        title: 'IP Backhaul to Cloud Network Server',
        description: 'Gateway encapsulates the radio packet in UDP/IP and forwards it over Ethernet/Cellular to the LoRaWAN Network Server.',
        actorSource: 'gateway',
        actorTarget: 'server',
        explanation: 'The Network Server deduplicates messages if multiple gateways received the same transmission, verifies the MIC integrity code, and decrypts the application payload.',
        packetInfo: {
          id: 'lora-pkt-2',
          source: 'Gateway_Eui: 58a0cbfffe801122',
          destination: 'thethings.network:1700',
          type: 'Semtech UDP Packet Forwarder',
          summary: 'PUSH_DATA: 1 uplink forwarded',
          payload: { rxpk: [{ rssi: -84, snr: 8.5, data: 'AWcA3AJoPA==' }] }
        }
      },
      {
        step: 3,
        title: 'ADR Downlink in the RX1 Receive Window',
        description: 'Because the uplink arrived with a healthy link margin, the Network Server queues a LinkADRReq downlink that the gateway transmits one second later in the RX1 window.',
        actorSource: 'server',
        actorTarget: 'gateway',
        explanation: 'Adaptive Data Rate (ADR) moves the device from SF7 to SF9 and lowers transmit power, cutting airtime and battery drain while keeping the link above the noise floor.',
        packetInfo: {
          id: 'lora-pkt-3',
          source: 'thethings.network:1700',
          destination: 'Gateway_Eui: 58a0cbfffe801122',
          type: 'LoRaWAN Downlink (MAC Command)',
          summary: 'PULL_RESP: LinkADRReq | DataRate: SF9 | TXPower: 14 dBm',
          payload: { command: 'LinkADRReq', dataRate: 'SF9/125kHz', txPower: 14, chMask: '0x0001', margin: 12 }
        }
      }
    ],
    liveSandboxType: 'generic-simulator',
    quiz: [
      {
        id: 'lora-q1',
        question: 'What is the primary physical radio modulation technology underlying LoRaWAN?',
        options: ['Frequency Shift Keying (FSK)', 'Chirp Spread Spectrum (CSS)', 'Orthogonal Frequency-Division Multiplexing (OFDM)', 'Phase Shift Keying (PSK)'],
        correctAnswer: 1,
        explanation: 'LoRa uses Chirp Spread Spectrum (CSS) modulation, which varies frequency over time to achieve superior sensitivity and resistance to interference.'
      },
      {
        id: 'lorawan-q2',
        question: 'In LoRaWAN Over-The-Air Activation (OTAA), which message completes the join procedure?',
        options: [
          'Join-Request',
          'Join-Accept',
          'CONFIRMED_DATA_UP',
          'Beacon'
        ],
        correctAnswer: 1,
        explanation: 'The device sends a Join-Request with its DevEUI, JoinEUI and DevNonce, and the Network Server answers with a Join-Accept encrypted with the AppKey that assigns the DevAddr and session keys.'
      }
    ]
  },
  {
    id: 'matter',
    slug: 'matter',
    name: 'Matter',
    fullName: 'Matter Smart Home Standard',
    category: 'iot',
    osiLayer: 'Application',
    port: '5540 (over IPv6)',
    rfc: 'Connectivity Standards Alliance (CSA)',
    yearIntroduced: 2022,
    shortSummary: 'Universal, IP-based application layer unifying Apple Home, Google Home, Amazon Alexa, and SmartThings.',
    description: 'Matter is the unified open-source connectivity standard created by Apple, Google, Amazon, and the Connectivity Standards Alliance (CSA). Because Matter runs natively over IPv6 (via Wi-Fi, Ethernet, and Thread mesh), a single smart device works simultaneously and locally across Apple HomeKit, Google Assistant, and Alexa without vendor lock-in or cloud dependencies.',
    keyFeatures: [
      'Universal interoperability across Apple, Google, Amazon, and Samsung',
      'Runs over local IPv6 networks (Wi-Fi, Ethernet, and Thread low-power mesh)',
      'Local-first execution: devices work even when home internet connection drops',
      'Multi-Admin capability: control the exact same bulb in Apple Home and Google Home simultaneously',
      'Mandatory certificate-based device security & zero-trust onboarding via BLE QR code'
    ],
    useCases: ['Cross-platform smart plugs and smart bulbs', 'Smart door locks and blinds', 'HVAC thermostats and energy monitors'],
    pros: ['Completely eliminates smart home ecosystem incompatibility', 'Local control provides zero cloud subscription or outage risk'],
    cons: ['Requires Matter border routers (like Apple TV or Google Nest Hub) for Thread device bridging'],
    actors: [
      { id: 'phone', label: 'iPhone / Android App', icon: 'Smartphone', color: '#6366f1' },
      { id: 'device', label: 'Matter Smart Plug (IPv6)', icon: 'Cpu', color: '#10b981' }
    ],
    interactiveSteps: [
      {
        step: 1,
        title: 'Bluetooth LE Commissioning (PASE)',
        description: 'User scans Matter QR code on device box. Phone pairs over BLE and performs Password-Authenticated Session Establishment.',
        actorSource: 'phone',
        actorTarget: 'device',
        explanation: 'The phone securely provisions Wi-Fi or Thread credentials and generates device operational certificates.',
        packetInfo: {
          id: 'matter-pkt-1',
          source: 'User Phone (BLE)',
          destination: 'Matter Device',
          type: 'PASE Handshake',
          summary: 'PBKDF2 Key Derivation + Thread Network Credentials',
          payload: { setupCode: '20202021', discriminator: 3840, networkPan: '0x12a4' }
        }
      },
      {
        step: 2,
        title: 'IPv6 Operational Command (CASE)',
        description: 'Device joins local IPv6 network. Phone issues Certificate-Authenticated Session Establishment and toggles state.',
        actorSource: 'phone',
        actorTarget: 'device',
        explanation: 'Local command executes in under 20 milliseconds directly over LAN without traveling to any external cloud server.',
        packetInfo: {
          id: 'matter-pkt-2',
          source: 'fe80::phone (UDP 5540)',
          destination: 'fe80::plug:5540',
          type: 'Matter Interaction Model',
          summary: 'Cluster: On/Off (0x0006) | Command: Toggle',
          payload: { endpointId: 1, clusterId: '0x0006', command: 'Toggle', status: 'SUCCESS' }
        }
      },
      {
        step: 3,
        title: 'AddNOC Installs the Operational Certificate',
        description: 'Inside the PASE session the phone sends AddNOC, handing the plug its Node Operational Certificate, intermediate CA and assigned Node ID.',
        actorSource: 'phone',
        actorTarget: 'device',
        explanation: 'AddNOC binds the device to the controller fabric with a Fabric ID and Node ID, so after CommissioningComplete the plug only answers CASE sessions signed by that fabric.',
        packetInfo: {
          id: 'matter-pkt-3',
          source: 'Commissioner (PASE session)',
          destination: 'Matter Device',
          type: 'Matter AddNOC Command',
          summary: 'Fabric ID: 1 | Node ID: 0xBEEF0001 | ICAC installed',
          payload: { fabricId: 1, nodeId: '0x000000000000BEEF', caseAdminNode: '0x0000000000000001', icac: true }
        }
      }
    ],
    liveSandboxType: 'generic-simulator',
    quiz: [
      {
        id: 'matter-q1',
        question: 'What underlying network protocol layer does Matter mandate for all device communications?',
        options: ['IPv4 only', 'IPv6', 'Proprietary RF', 'Zigbee ZDO'],
        correctAnswer: 1,
        explanation: 'Matter is an application layer built strictly on top of IPv6, running over Wi-Fi, Ethernet, and Thread mesh networks.'
      },
      {
        id: 'matter-q2',
        question: 'What is it called when one Matter device is commissioned into several ecosystems at the same time?',
        options: [
          'Multi-Admin across multiple fabrics',
          'Dual-stack bridging',
          'Mesh roaming',
          'Cloud federation'
        ],
        correctAnswer: 0,
        explanation: 'Multi-Admin gives the device one fabric per ecosystem, so Apple Home and Google Home each hold their own credentials and can control the same plug locally.'
      }
    ]
  },
  {
    id: 'modbus',
    slug: 'modbus',
    name: 'Modbus TCP',
    fullName: 'Modbus Protocol',
    category: 'iot',
    osiLayer: 'Application',
    port: 502,
    rfc: 'Modbus Organization / IEC Standard',
    yearIntroduced: 1979,
    shortSummary: 'The de facto industrial communication protocol connecting programmable logic controllers (PLCs) and industrial SCADA sensors.',
    description: 'Modbus is an industrial protocol developed by Modicon (Schneider Electric) in 1979 to connect industrial electronic devices like PLCs, variable frequency motor drives, and factory sensors. In modern factories, Modbus TCP encapsulates legacy serial frames inside TCP port 502.',
    keyFeatures: [
      'Master/Slave (Client/Server) request-response architecture',
      'Four memory tables: Discrete Inputs, Coils (outputs), Input Registers, and Holding Registers',
      'Function codes: Read Coils (01), Read Holding Registers (03), Write Single Register (06)',
      'Modbus TCP adds a 7-byte MBAP (Modbus Application Protocol) header'
    ],
    useCases: ['Factory assembly line PLC automation', 'Solar inverter power generation monitoring', 'Building HVAC chiller control systems'],
    pros: ['Supported by practically 100% of industrial hardware and SCADA software worldwide', 'Ultra-simple register model'],
    cons: ['Zero authentication, encryption, or integrity verification (must be isolated on air-gapped industrial OT networks)'],
    actors: [
      { id: 'scada', label: 'SCADA Master / HMI', icon: 'Laptop', color: '#6366f1' },
      { id: 'plc', label: 'Factory PLC (Slave)', icon: 'Cpu', color: '#10b981' }
    ],
    interactiveSteps: [
      {
        step: 1,
        title: 'Read Holding Registers Request (Function Code 03)',
        description: 'SCADA system sends Modbus TCP query to PLC port 502 requesting 2 holding registers starting at address 40001.',
        actorSource: 'scada',
        actorTarget: 'plc',
        explanation: 'The request contains Transaction ID, Unit ID, Function Code 03, starting register offset, and quantity.',
        packetInfo: {
          id: 'modbus-pkt-1',
          source: '10.0.10.50:54321',
          destination: '10.0.10.100:502',
          type: 'Modbus TCP Request',
          summary: 'Unit: 1, Function: 03 (Read Holding Registers), Count: 2',
          payload: { transactionId: '0x0001', unitId: 1, functionCode: 3, startAddress: 0, quantity: 2 }
        }
      },
      {
        step: 2,
        title: 'PLC Register Values Response',
        description: 'PLC reads physical ADC sensor inputs and returns raw 16-bit binary integer register values.',
        actorSource: 'plc',
        actorTarget: 'scada',
        explanation: 'Register 1 holds 0x01A4 (420 rpm) and Register 2 holds 0x004B (75°C motor temperature).',
        packetInfo: {
          id: 'modbus-pkt-2',
          source: '10.0.10.100:502',
          destination: '10.0.10.50',
          type: 'Modbus TCP Response',
          summary: 'Byte Count: 4, Reg[0]: 420 (RPM), Reg[1]: 75 (°C)',
          payload: { functionCode: 3, byteCount: 4, registerValues: ['0x01a4', '0x004b'] }
        }
      },
      {
        step: 3,
        title: 'Exception Response (Illegal Data Address)',
        description: 'The SCADA master requests 4 registers starting at offset 120, past the end of the PLC register map, so the PLC refuses with a Modbus exception instead of data.',
        actorSource: 'plc',
        actorTarget: 'scada',
        explanation: 'The PLC sets the high bit of the function code (0x03 becomes 0x83) and returns exception code 0x02, telling the master the starting address is not defined on this slave.',
        packetInfo: {
          id: 'modbus-pkt-3',
          source: '10.0.10.100:502',
          destination: '10.0.10.50:54321',
          type: 'Modbus TCP Exception Response',
          summary: 'Function: 0x83 (03 + 0x80) | Exception: 0x02 (Illegal Data Address)',
          payload: { transactionId: '0x0002', unitId: 1, functionCode: '0x83', exceptionCode: '0x02 (Illegal Data Address)' }
        }
      }
    ],
    liveSandboxType: 'generic-simulator',
    quiz: [
      {
        id: 'modbus-q1',
        question: 'What is the default TCP port used by Modbus TCP in industrial networks?',
        options: ['Port 80', 'Port 502', 'Port 1883', 'Port 44818'],
        correctAnswer: 1,
        explanation: 'Modbus TCP communicates on standard IANA port 502.'
      },
      {
        id: 'modbus-q2',
        question: 'How does a Modbus slave signal that it could not fulfill a request?',
        options: [
          'It sets the high bit of the function code and appends an exception code',
          'It sends a TCP RST and drops the connection',
          'It returns a register value of all zeros',
          'It answers with function code 0x00'
        ],
        correctAnswer: 0,
        explanation: 'An exception response ORs 0x80 onto the requested function code and adds a one-byte exception code such as 0x01 (Illegal Function) or 0x02 (Illegal Data Address).'
      }
    ]
  },
  {
    id: 'opc-ua',
    slug: 'opc-ua',
    name: 'OPC-UA',
    fullName: 'Open Platform Communications Unified Architecture',
    category: 'iot',
    osiLayer: 'Application',
    port: 4840,
    rfc: 'IEC 62541 Standard',
    yearIntroduced: 2008,
    shortSummary: 'Platform-independent, service-oriented industrial IoT communication standard with built-in cybersecurity.',
    description: 'OPC Unified Architecture (OPC-UA) is the global standard for Industry 4.0 data exchange. Unlike legacy Modbus, OPC-UA provides rich semantic object modeling, complex data types, and enterprise-grade end-to-end encryption with digital X.509 certificates.',
    keyFeatures: [
      'Rich object-oriented Address Space modeling (nodes, references, methods)',
      'Built-in cybersecurity with X.509 certificates and AES-256 encryption',
      'Platform independent: runs on embedded Linux, Windows, cloud microservices',
      'Supports Client/Server request/reply and Pub/Sub over UDP/MQTT/TSN'
    ],
    useCases: ['Smart factory Industry 4.0 robotic cells', 'Pharmaceutical manufacturing compliance auditing', 'Wind turbine and renewable energy grid telemetry'],
    pros: ['Solves industrial cybersecurity and data modeling natively', 'Bridging from shop floor sensors directly to Azure/AWS IoT'],
    cons: ['Substantially higher protocol complexity and memory footprint than Modbus'],
    actors: [
      { id: 'client', label: 'Cloud MES / ERP', icon: 'Server', color: '#6366f1' },
      { id: 'server', label: 'Robotic Arm OPC-UA Server', icon: 'Cpu', color: '#10b981' }
    ],
    interactiveSteps: [
      {
        step: 1,
        title: 'Secure Channel Creation & Certificate Exchange',
        description: 'Client connects to `opc.tcp://robot:4840` and exchanges X.509 certificates to establish an encrypted session.',
        actorSource: 'client',
        actorTarget: 'server',
        explanation: 'Security policy Basic256Sha256 encrypts the channel with mutual asymmetric authentication.',
        packetInfo: {
          id: 'opc-pkt-1',
          source: 'MES_Client',
          destination: 'Robot_Server:4840',
          type: 'OPC-UA OpenSecureChannel',
          summary: 'SecurityPolicy: Basic256Sha256 | Mode: SignAndEncrypt',
          payload: { securityToken: '0x4f128a', certificateThumbprint: 'SHA1:a8...12' }
        }
      },
      {
        step: 2,
        title: 'Node Monitored Item Subscription',
        description: 'Client subscribes to robot joint torque and velocity nodes for change-of-value streaming.',
        actorSource: 'server',
        actorTarget: 'client',
        explanation: 'Server publishes structured data packets whenever values cross threshold without continuous polling.',
        packetInfo: {
          id: 'opc-pkt-2',
          source: 'Robot_Server',
          destination: 'MES_Client',
          type: 'OPC-UA PublishResponse',
          summary: 'NodeId: "ns=2;s=Joint3.Torque", Value: 42.8 Nm',
          payload: { statusCode: 'Good (0x0000)', value: 42.8, timestamp: '2026-11-13T12:00:00Z' }
        }
      },
      {
        step: 3,
        title: 'ActivateSession with X.509 User Identity',
        description: 'The MES client activates the session by presenting an X.509 user identity token and a signature over the server nonce made with the user private key.',
        actorSource: 'client',
        actorTarget: 'server',
        explanation: 'The server verifies the nonce signature against the user certificate and only then exposes the address space; an invalid signature returns Bad_IdentityTokenRejected.',
        packetInfo: {
          id: 'opc-pkt-3',
          source: 'MES_Client',
          destination: 'Robot_Server:4840',
          type: 'OPC-UA ActivateSessionRequest',
          summary: 'UserIdentityToken: X509IdentityToken | Signature: valid | Status: Good',
          payload: { sessionName: 'MES_Line3', userTokenType: 'X509', nonce: '0x7b3e9c14', statusCode: 'Good (0x0000)' }
        }
      }
    ],
    liveSandboxType: 'generic-simulator',
    quiz: [
      {
        id: 'opcua-q1',
        question: 'What major advantage does OPC-UA provide over legacy industrial protocols like Modbus?',
        options: [
          'Built-in X.509 certificate cybersecurity and semantic object modeling',
          'It only runs on Windows 95',
          'It eliminates the need for Ethernet',
          'It only supports 8-bit integers'
        ],
        correctAnswer: 0,
        explanation: 'OPC-UA integrates rigorous cybersecurity (mutual certificate authentication, AES encryption) and rich object-oriented semantic data structures.'
      },
      {
        id: 'opc-ua-q2',
        question: 'What is the default TCP port for the OPC-UA binary protocol endpoint (opc.tcp)?',
        options: ['4840', '502', '44818', '1883'],
        correctAnswer: 0,
        explanation: 'OPC-UA binary servers listen on TCP 4840 by default, which is why discovery URLs look like opc.tcp://robot:4840.'
      }
    ]
  },
  {
    id: 'ble',
    slug: 'ble',
    name: 'BLE',
    fullName: 'Bluetooth Low Energy',
    category: 'iot',
    osiLayer: 'Data Link',
    port: '2.4 GHz ISM Radio',
    rfc: 'Bluetooth Core Spec (Bluetooth SIG)',
    yearIntroduced: 2010,
    shortSummary: 'Short-range wireless personal area network technology designed for ultra-low power sensor communication.',
    description: 'Bluetooth Low Energy (BLE), also known as Bluetooth Smart, is designed to consume a fraction of the power of classic Bluetooth while maintaining similar communication ranges. It powers consumer wearables, fitness bands, medical heart rate monitors, and smart indoor positioning beacons.',
    keyFeatures: [
      'Generic Attribute Profile (GATT) architecture with Services and Characteristics',
      'Periodic Advertising and Beacons (iBeacon, Eddystone)',
      'Coin-cell battery operation lasting 1 to 3 years',
      'Ultra-fast connection establishment (under 6 milliseconds)'
    ],
    useCases: ['Smartwatches and health fitness trackers', 'Blood glucose and medical monitors', 'Indoor museum and airport asset tracking beacons'],
    pros: ['Built into 100% of modern smartphones, tablets, and laptops', 'Extremely low power draw'],
    cons: ['Limited range (~10–30 meters indoors)', 'Low throughput compared to Wi-Fi (~1–2 Mbps)'],
    actors: [
      { id: 'watch', label: 'Heart Rate Band (GATT Server)', icon: 'Cpu', color: '#10b981' },
      { id: 'phone', label: 'Smartphone App (GATT Client)', icon: 'Smartphone', color: '#6366f1' }
    ],
    interactiveSteps: [
      {
        step: 1,
        title: 'BLE Advertising Packets',
        description: 'Wearable broadcasts advertising packets on dedicated RF channels 37, 38, and 39 declaring its UUID.',
        actorSource: 'watch',
        actorTarget: 'phone',
        explanation: 'Smartphone scans and discovers the Heart Rate Service UUID 0x180D.',
        packetInfo: {
          id: 'ble-pkt-1',
          source: 'Band (MAC: 00:1a:7d:..)',
          destination: 'Broadcast',
          type: 'ADV_IND (Advertising)',
          summary: 'Service: 0x180D (Heart Rate Service) | RSSI: -58 dBm',
          payload: { flags: '0x06', completeLocalName: 'SmartBand-HR', serviceUuid: '0x180d' }
        }
      },
      {
        step: 2,
        title: 'GATT Characteristic Notification',
        description: 'Phone connects and enables notifications. Wearable pushes BPM reading without phone polling.',
        actorSource: 'watch',
        actorTarget: 'phone',
        explanation: 'Heart rate measurement characteristic (0x2A37) streams 72 BPM directly to health app.',
        packetInfo: {
          id: 'ble-pkt-2',
          source: 'Band',
          destination: 'Phone',
          type: 'ATT Handle Value Notification',
          summary: 'Characteristic: 0x2A37, Value: 72 BPM',
          payload: { flags: 0, heartRateBpm: 72 }
        }
      },
      {
        step: 3,
        title: 'GATT Write to the Heart Rate Control Point',
        description: 'The app writes the Reset Energy Expended opcode to the Heart Rate Control Point characteristic, and the band confirms with an ATT Write Response.',
        actorSource: 'phone',
        actorTarget: 'watch',
        explanation: 'A Write Request (ATT opcode 0x12) is acknowledged by the server, unlike a notification; the band clears its accumulated energy-expended field and keeps the connection open.',
        packetInfo: {
          id: 'ble-pkt-3',
          source: 'Phone',
          destination: 'Band',
          type: 'ATT Write Request',
          summary: 'Characteristic: 0x2A39 (Heart Rate Control Point) | Value: 0x01',
          payload: { opcode: '0x12 (Write Request)', handle: '0x0012', value: '0x01', response: '0x13 (Write Response)' }
        }
      }
    ],
    liveSandboxType: 'generic-simulator',
    quiz: [
      {
        id: 'ble-q1',
        question: 'What architectural profile is used in Bluetooth Low Energy to organize data into Services and Characteristics?',
        options: ['GATT (Generic Attribute Profile)', 'REST Profile', 'MQTT Profile', 'JSON Profile'],
        correctAnswer: 0,
        explanation: 'GATT defines how two BLE devices transfer data using Services, Characteristics, and Descriptors.'
      },
      {
        id: 'ble-q2',
        question: 'Which RF channels carry BLE advertising packets?',
        options: ['Channels 37, 38 and 39', 'Channels 0, 1 and 2', 'Channels 1, 6 and 11', 'Channels 39, 40 and 41'],
        correctAnswer: 0,
        explanation: 'BLE advertises on channels 37, 38 and 39, which are deliberately placed between the 37 data channels to reduce collisions with Wi-Fi traffic.'
      }
    ]
  },
  {
    id: 'zwave',
    slug: 'zwave',
    name: 'Z-Wave',
    fullName: 'Z-Wave Wireless Protocol',
    category: 'iot',
    osiLayer: 'Network',
    port: 'Sub-GHz (908.42 MHz US / 868.42 MHz EU)',
    rfc: 'ITU-T G.9959',
    yearIntroduced: 2001,
    shortSummary: 'Sub-gigahertz low-power mesh networking protocol engineered specifically for smart home automation.',
    description: 'Z-Wave operates in the sub-1GHz frequency band, completely avoiding the crowded 2.4 GHz spectrum used by Wi-Fi and Bluetooth. Every mains-powered Z-Wave device acts as a mesh repeater, allowing smart locks, light switches, and thermostats to route commands through up to 4 hops.',
    keyFeatures: [
      'Sub-GHz frequency band eliminates Wi-Fi and microwave interference',
      'Mesh networking topology supporting up to 232 nodes per network',
      'Security 2 (S2) framework with Elliptic Curve Diffie-Hellman (ECDH) encryption',
      'Strict Z-Wave Alliance certification ensuring interoperability across vendors'
    ],
    useCases: ['Smart deadbolts and keyless door locks', 'Smart home wall switches and dimmers', 'Security window/door sensors and water leak detectors'],
    pros: ['Zero interference from 2.4 GHz Wi-Fi', 'High penetration through walls and floors due to longer wavelength'],
    cons: ['Limited bandwidth (100 kbps)', 'Requires a dedicated Z-Wave USB stick or bridge hub'],
    actors: [
      { id: 'hub', label: 'Z-Wave Gateway Hub', icon: 'Radio', color: '#6366f1' },
      { id: 'switch', label: 'Repeater Light Switch', icon: 'Cpu', color: '#06b6d4' },
      { id: 'lock', label: 'Smart Deadbolt', icon: 'ShieldCheck', color: '#10b981' }
    ],
    interactiveSteps: [
      {
        step: 1,
        title: 'Hub Dispatches Routed Command',
        description: 'Gateway sends an S2-encrypted command to lock the front door via repeater switch.',
        actorSource: 'hub',
        actorTarget: 'switch',
        explanation: 'Mesh frame contains source node 1, destination node 5, routed through repeater node 2.',
        packetInfo: {
          id: 'zw-pkt-1',
          source: 'Hub (Node 1)',
          destination: 'Repeater (Node 2)',
          type: 'Z-Wave Routed Frame',
          summary: 'Route: 1 -> 2 -> 5 | Cmd: COMMAND_CLASS_DOOR_LOCK',
          payload: { homeId: '0x01FA94B', sourceNode: 1, targetNode: 5, hopsRemaining: 1 }
        }
      },
      {
        step: 2,
        title: 'Repeater Forwards to Deadbolt',
        description: 'Mains-powered switch retransmits the RF packet on sub-GHz band directly to deadbolt.',
        actorSource: 'switch',
        actorTarget: 'lock',
        explanation: 'Deadbolt wakes up, decrypts S2 payload, engages motor, and returns ACK to hub.',
        packetInfo: {
          id: 'zw-pkt-2',
          source: 'Repeater (Node 2)',
          destination: 'Deadbolt (Node 5)',
          type: 'Z-Wave S2 Encrypted',
          summary: 'DOOR_LOCK_OPERATION_SET (0xFF = SECURED)',
          payload: { command: 'DOOR_LOCK_OPERATION_SET', status: 'SECURED', ack: true }
        }
      },
      {
        step: 3,
        title: 'S2 Bootstrapping During Inclusion',
        description: 'When the deadbolt is added to the network, the hub and the lock run S2 bootstrapping and the user confirms the first five digits of the device DSK printed on the lock body.',
        actorSource: 'hub',
        actorTarget: 'lock',
        explanation: 'S2 grants keys per security class only after the DSK check passes, so the lock receives S2_Authenticated and S2_Unauthenticated keys while the controller learns its command classes.',
        packetInfo: {
          id: 'zw-pkt-3',
          source: 'Hub (Node 1)',
          destination: 'New Node (Node 5)',
          type: 'Z-Wave S2 Inclusion',
          summary: 'Command: SECURITY_2_NETWORK_KEY_GET | Scheme: 1 (Authenticated)',
          payload: { inclusionController: 1, dskPrefix: '12345', scheme: 'Authenticated (S2_ACCESS_CONTROL)' }
        }
      }
    ],
    liveSandboxType: 'generic-simulator',
    quiz: [
      {
        id: 'zw-q1',
        question: 'Why does Z-Wave experience virtually zero interference from Wi-Fi routers and Bluetooth headsets?',
        options: [
          'It operates in the sub-1GHz radio spectrum instead of the 2.4 GHz band',
          'It uses physical fiber optic cables',
          'It uses quantum encryption',
          'It only operates when Wi-Fi is turned off'
        ],
        correctAnswer: 0,
        explanation: 'Z-Wave uses sub-GHz frequencies (e.g., 908.42 MHz in North America, 868.42 MHz in Europe), avoiding the congested 2.4 GHz Wi-Fi spectrum.'
      },
      {
        id: 'zwave-q2',
        question: 'How many nodes can a single Z-Wave network address?',
        options: ['232', '50', '1024', '65535'],
        correctAnswer: 0,
        explanation: 'Z-Wave allocates 8-bit node IDs but reserves the top range for the controller, leaving 232 usable node IDs per Home ID.'
      }
    ]
  },
  {
    id: 'canbus',
    slug: 'canbus',
    name: 'CAN Bus',
    fullName: 'Controller Area Network',
    category: 'iot',
    osiLayer: 'Data Link',
    port: 'Differential Twisted Pair (CAN_H / CAN_L)',
    rfc: 'ISO 11898-1',
    yearIntroduced: 1986,
    shortSummary: 'High-integrity, message-based differential serial bus for automotive electronic control units (ECUs).',
    description: 'CAN Bus was developed by Robert Bosch to connect automotive ECUs (Engine Control Unit, ABS, Airbags, Transmission) without complex point-to-point wiring harnesses. It uses differential signaling on two wires (CAN_H and CAN_L) and deterministic non-destructive bitwise arbitration.',
    keyFeatures: [
      'Differential voltage signaling (2.5V recessive, 3.5V/1.5V dominant)',
      'Non-destructive bitwise message priority arbitration (lower identifier = higher priority)',
      'Built-in CRC error detection, frame check, and automatic error confinement',
      'CAN FD (Flexible Data-Rate) supporting payloads up to 64 bytes and 5 Mbps'
    ],
    useCases: ['Automotive internal ECU communication (engine, brakes, steering)', 'Heavy equipment and avionics (CANopen, J1939)', 'Medical robotics and industrial automation'],
    pros: ['Immune to extreme electrical noise in vehicle engines', 'Deterministic priority ensures life-critical messages like ABS fire first'],
    cons: ['Inherently lacks built-in authentication or encryption in base CAN (vulnerable to OBD-II port hacking)'],
    actors: [
      { id: 'brakes', label: 'ABS / Brake ECU', icon: 'Cpu', color: '#ef4444' },
      { id: 'bus', label: 'CAN Twisted Pair Bus', icon: 'Network', color: '#6366f1' },
      { id: 'cluster', label: 'Dashboard Gauge Cluster', icon: 'Laptop', color: '#10b981' }
    ],
    interactiveSteps: [
      {
        step: 1,
        title: 'Bitwise Arbitration Phase (SOF + ID)',
        description: 'ECUs broadcast simultaneously. ABS ECU transmits high-priority ID 0x0C0 (dominant zero wins).',
        actorSource: 'brakes',
        actorTarget: 'bus',
        explanation: 'The lower numerical CAN ID wins arbitration without losing a single clock cycle of bus throughput.',
        packetInfo: {
          id: 'can-pkt-1',
          source: 'ECU_ABS',
          destination: 'CAN_BUS',
          type: 'CAN 2.0A Frame',
          summary: 'ID: 0x0C0 (High Priority) | DLC: 8 | Wheel Speed 65 km/h',
          payload: { canId: '0x0C0', priority: 'CRITICAL', dlc: 8, data: '0x41 0x2A 0x00 0x00' }
        }
      },
      {
        step: 2,
        title: 'Differential Signal Delivery & ACK',
        description: 'All nodes on the bus sample the differential voltage and dominant ACK bit confirms receipt.',
        actorSource: 'bus',
        actorTarget: 'cluster',
        explanation: 'Dashboard cluster displays speedometer reading and illuminates ABS indicator if slip is detected.',
        packetInfo: {
          id: 'can-pkt-2',
          source: 'CAN_BUS',
          destination: 'Cluster',
          type: 'CAN Data Received',
          summary: 'Speedometer updated: 65 km/h',
          payload: { speedKmh: 65, absActive: false, crcStatus: 'VALID_15BIT_CRC' }
        }
      },
      {
        step: 3,
        title: 'Error Frame and Error Counter Update',
        description: 'A bit error in the data phase makes the gauge cluster transmit an Error Flag of six dominant bits, and every node on the bus discards the corrupted frame.',
        actorSource: 'cluster',
        actorTarget: 'bus',
        explanation: 'The six dominant bits violate bit stuffing, so all nodes detect the error at the same bit; the transmitter increments its Transmit Error Counter by 8 and retries after intermission.',
        packetInfo: {
          id: 'can-pkt-3',
          source: 'Cluster',
          destination: 'CAN_BUS',
          type: 'CAN Error Frame',
          summary: 'Error Flag: 6 dominant bits | Error: Bit Error | TEC: 8, REC: 0',
          payload: { errorType: 'Bit Error', errorFlag: '6 dominant bits', transmitErrorCounter: 8, receiveErrorCounter: 0 }
        }
      }
    ],
    liveSandboxType: 'generic-simulator',
    quiz: [
      {
        id: 'can-q1',
        question: 'When two CAN bus nodes transmit at the exact same moment, how is collision resolved?',
        options: [
          'Bitwise arbitration where dominant "0" bits overwrite recessive "1" bits (lower CAN ID wins)',
          'Both nodes back off randomly like CSMA/CD',
          'The node with the higher MAC address wins',
          'The master clock controller picks a node'
        ],
        correctAnswer: 0,
        explanation: 'In CAN bus arbitration, dominant "0" bits override recessive "1" bits on the wire, so the message with the lowest identifier transmits without interruption.'
      },
      {
        id: 'canbus-q2',
        question: 'What voltages do CAN_H and CAN_L carry during a recessive bit?',
        options: [
          'Both lines at about 2.5 V, giving a near-zero differential',
          'CAN_H at 3.5 V and CAN_L at 1.5 V',
          'CAN_H at 0 V and CAN_L at 5 V',
          'Both lines at 5 V'
        ],
        correctAnswer: 0,
        explanation: 'A recessive bit drives both wires to roughly 2.5 V so the differential is close to 0 V, while a dominant bit pulls CAN_H to 3.5 V and CAN_L to 1.5 V for a 2 V differential.'
      }
    ]
  },
  {
    id: 'bacnet',
    slug: 'bacnet',
    name: 'BACnet',
    fullName: 'Building Automation and Control Networks',
    category: 'iot',
    osiLayer: 'Application',
    port: '47808 (0xBAC0)',
    rfc: 'ISO 16484-5 / ANSI/ASHRAE 135',
    yearIntroduced: 1995,
    shortSummary: 'Universal data communication protocol for commercial building automation, HVAC, lighting, and fire systems.',
    description: 'BACnet is the worldwide standard protocol engineered specifically for building management systems (BMS). It models smart buildings as standardized collections of objects (Analog Input for temperature, Binary Output for fans, Schedules) communicating over BACnet/IP (UDP 47808) or MS/TP.',
    keyFeatures: [
      'Standardized Object and Property model (Analog Input, Binary Output, Multi-state, Schedule)',
      'BACnet/IP over UDP port 47808 (hex 0xBAC0)',
      'Who-Is and I-Am device discovery broadcast services',
      'BACnet/SC (Secure Connect) using TLS and WebSockets for modern cybersecurity'
    ],
    useCases: ['Skyscraper central HVAC chiller and thermostat regulation', 'Commercial smart lighting and occupancy sensor automation', 'Hospital critical airflow and emergency generator monitoring'],
    pros: ['Prevents proprietary vendor lock-in across chillers, air handlers, and lighting', 'Rich domain-specific building automation semantics'],
    cons: ['Legacy BACnet/IP broadcast traffic requires BBMD routers to traverse subnets and lacks encryption without BACnet/SC'],
    actors: [
      { id: 'bms', label: 'Central BMS Workstation', icon: 'Laptop', color: '#6366f1' },
      { id: 'hvac', label: 'Rooftop Chiller / Air Handler', icon: 'Cpu', color: '#10b981' }
    ],
    interactiveSteps: [
      {
        step: 1,
        title: 'BACnet Device Discovery (Who-Is / I-Am)',
        description: 'BMS workstation broadcasts Who-Is on UDP 47808. Chiller controller responds with I-Am.',
        actorSource: 'bms',
        actorTarget: 'hvac',
        explanation: 'Discovery establishes Device ID, Vendor ID (Johnson Controls, Siemens, Honeywell), and BACnet version.',
        packetInfo: {
          id: 'bac-pkt-1',
          source: 'BMS:47808',
          destination: '255.255.255.255:47808',
          type: 'BACnet Who-Is Broadcast',
          summary: 'Who-Is Device Range 1 to 999999',
          payload: { service: 'Who-Is', lowLimit: 1, highLimit: 999999 }
        }
      },
      {
        step: 2,
        title: 'ReadProperty Request (Temperature Sensor)',
        description: 'BMS queries Analog Input #1 (Chilled Water Supply Temperature).',
        actorSource: 'bms',
        actorTarget: 'hvac',
        explanation: 'HVAC controller returns present-value property: 44.5 degrees Fahrenheit.',
        packetInfo: {
          id: 'bac-pkt-2',
          source: 'BMS',
          destination: 'ChillerController',
          type: 'BACnet ReadProperty-ACK',
          summary: 'Analog-Input #1 present-value: 44.5 °F',
          payload: { objectType: 'analog-input', objectInstance: 1, property: 'present-value', value: 44.5, units: 'degrees-fahrenheit' }
        }
      },
      {
        step: 3,
        title: 'COV Notification Pushes a Value Change',
        description: 'The BMS had issued SubscribeCOV for Analog Input #1, so when supply temperature drifts past the 0.5 °F increment the chiller pushes an unconfirmed COVNotification.',
        actorSource: 'hvac',
        actorTarget: 'bms',
        explanation: 'Change-of-Value reporting sends only meaningful deltas instead of constant polling, which keeps BACnet/IP traffic low on buildings with thousands of objects.',
        packetInfo: {
          id: 'bac-pkt-3',
          source: 'ChillerController',
          destination: 'BMS',
          type: 'BACnet COVNotification (Unconfirmed)',
          summary: 'Analog-Input #1 present-value: 43.8 °F | Subscriber Process ID: 12',
          payload: { subscriberProcessId: 12, monitoredObject: 'analog-input,1', property: 'present-value', value: 43.8, units: 'degrees-fahrenheit' }
        }
      }
    ],
    liveSandboxType: 'generic-simulator',
    quiz: [
      {
        id: 'bac-q1',
        question: 'Which default UDP port does BACnet/IP use for building automation packets?',
        options: ['Port 47808 (hex 0xBAC0)', 'Port 80', 'Port 502', 'Port 1883'],
        correctAnswer: 0,
        explanation: 'BACnet/IP uses UDP port 47808, chosen because its hexadecimal representation is 0xBAC0.'
      },
      {
        id: 'bacnet-q2',
        question: 'Which BACnet service lets a workstation receive value changes instead of polling every object?',
        options: ['SubscribeCOV', 'Who-Is', 'ReadPropertyMultiple', 'AtomicWriteFile'],
        correctAnswer: 0,
        explanation: 'SubscribeCOV registers the workstation for Change-of-Value notifications, and the device then sends COVNotification messages whenever a monitored property exceeds its increment.'
      }
    ]
  }
];


