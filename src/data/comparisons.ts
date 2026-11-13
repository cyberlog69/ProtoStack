export interface ComparisonPreset {
  slugA: string;
  slugB: string;
  title: string;
  tagline: string;
  verdict: string;
}

export const COMPARISON_PRESETS: ComparisonPreset[] = [
  {
    slugA: 'tcp',
    slugB: 'udp',
    title: 'TCP vs. UDP',
    tagline: 'Guaranteed Reliability vs. Lowest Possible Latency',
    verdict: 'Choose TCP when every single byte must arrive in order (web, file transfer, SSH). Choose UDP when low latency is king and occasional lost packets are harmless (video streaming, gaming, VoIP, DNS).'
  },
  {
    slugA: 'mqtt',
    slugB: 'coap',
    title: 'MQTT vs. CoAP',
    tagline: 'Broker Pub/Sub vs. Lightweight Binary REST for IoT',
    verdict: 'Choose MQTT when you have a centralized broker and need pub/sub fanout across many subscribers. Choose CoAP when devices communicate directly peer-to-peer or over multicast with tiny 10KB RAM microcontrollers over UDP.'
  },
  {
    slugA: 'ipv4',
    slugB: 'ipv6',
    title: 'IPv4 vs. IPv6',
    tagline: '32-bit Legacy Routing vs. 128-bit Infinite Address Space',
    verdict: 'IPv6 is the future of internetworking, eliminating NAT complexity and supporting SLAAC auto-configuration for billions of IoT devices. IPv4 remains ubiquitous via dual-stack mechanisms.'
  },
  {
    slugA: 'bgp',
    slugB: 'ospf',
    title: 'BGP vs. OSPF',
    tagline: 'Exterior Inter-AS Routing vs. Interior Shortest Path Link-State',
    verdict: 'OSPF is built for speed and automatic route calculation within a single enterprise network (Interior Gateway). BGP is built for scale, policy, and trust between separate worldwide internet service providers (Exterior Gateway).'
  },
  {
    slugA: 'wifi',
    slugB: 'ethernet',
    title: 'Wi-Fi (802.11) vs. Ethernet (802.3)',
    tagline: 'Wireless Mobility vs. High-Throughput Wired Reliability',
    verdict: 'Ethernet offers superior gigabit speeds (up to 800 Gbps), sub-microsecond latency, and zero RF interference for data centers and desktop workstations. Wi-Fi delivers indispensable freedom of movement for mobile and IoT devices.'
  },
  {
    slugA: 'grpc',
    slugB: 'http',
    title: 'gRPC vs. HTTP/REST',
    tagline: 'Binary Protocol Buffers RPC vs. Human-Readable JSON APIs',
    verdict: 'Choose gRPC for high-throughput, low-latency microservice-to-microservice internal communication. Choose standard HTTP/REST when building public APIs consumed by web browsers and third-party developers.'
  },
  {
    slugA: 'zigbee',
    slugB: 'lorawan',
    title: 'Zigbee vs. LoRaWAN',
    tagline: 'Local Smart Home Mesh vs. 15 km Long-Range LPWAN',
    verdict: 'Zigbee forms dense indoor multi-hop mesh networks ideal for smart light bulbs and door locks. LoRaWAN broadcasts over 10–15 km across entire cities or agricultural farms for battery-operated soil and water sensors.'
  },
  {
    slugA: 'ftp',
    slugB: 'sftp',
    title: 'FTP vs. SFTP',
    tagline: 'Dual-Port Plaintext Legacy vs. SSH-Encrypted Single Channel',
    verdict: 'Never use plain FTP for untrusted networks or internet transfers due to unencrypted plaintext credentials. SFTP encrypts both credentials and data packets inside an SSH tunnel over a single firewall-friendly port (22).'
  },
  {
    slugA: 'imap',
    slugB: 'pop3',
    title: 'IMAP vs. POP3',
    tagline: 'Multi-Device Cloud Sync vs. Single-Computer Download-and-Delete',
    verdict: 'IMAP is designed for modern life where users read email across smartphones, tablets, and laptops in real-time sync. POP3 is reserved for legacy offline single-device workflows where server disk storage is severely constrained.'
  },
  {
    slugA: 'webrtc',
    slugB: 'websocket',
    title: 'WebRTC vs. WebSocket',
    tagline: 'Peer-to-Peer UDP Media Streaming vs. Client-Server TCP Duplex',
    verdict: 'Use WebRTC when ultra-low sub-second latency is essential and direct browser-to-browser P2P audio, video, or data streaming is needed. Use WebSocket for centralized client-server duplex messaging like live chat, financial tickers, and notification feeds.'
  },
  {
    slugA: 'zwave',
    slugB: 'zigbee',
    title: 'Z-Wave vs. Zigbee',
    tagline: 'Interference-Free Sub-GHz vs. High-Bandwidth 2.4 GHz Smart Home Mesh',
    verdict: 'Z-Wave wins on zero Wi-Fi radio interference and long wall penetration due to sub-GHz frequencies. Zigbee wins on global vendor adoption, lower chip price, and higher data bandwidth (250 kbps vs 100 kbps).'
  }
];
