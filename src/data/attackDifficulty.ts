/**
 * Difficulty is a teaching rating, not a CVSS score:
 * 1 = recognisable concept, 2 = needs protocol knowledge, 3 = advanced chain.
 */
const BEGINNER = new Set<string>([
  'ethernet-mac-flooding',
  'wifi-evil-twin',
  'arp-cache-poisoning',
  'dns-cache-poisoning',
  'dhcp-rogue-server',
  'icmp-redirect-abuse',
  'tcp-syn-flood',
  'udp-amplification',
  'pop3-cleartext-capture',
  'ftp-cleartext-bounce',
  'telnet-session-hijack',
  'smtp-sender-spoofing',
  'ssh-credential-bruteforce',
  'snmp-community-bruteforce',
  'ntp-time-spoofing',
  'kafka-open-broker',
  'resp-unauthenticated-redis',
  'mdns-answer-spoofing',
  'webrtc-ip-leak',
  'nfc-relay',
  'igmp-query-spoofing',
  'coap-amplification',
]);

const ADVANCED = new Set<string>([
  'bgp-route-hijack',
  'ospf-lsa-injection',
  'isis-lsp-injection',
  'mpls-vrf-leak',
  'vxlan-vni-hopping',
  'ipsec-aggressive-mode-crack',
  'wireguard-stolen-key',
  'kerberos-kerberoasting',
  'saml-signature-wrapping',
  'dnssec-downgrade-walking',
  'acme-validation-hijack',
  'http2-hpack-bomb',
  'http3-zero-rtt-replay',
  'quic-cid-tracking',
  'tls-downgrade-mitm',
  'dot1x-eapol-flood',
  'lorawan-key-extraction',
  'matter-commissioning-bruteforce',
  '5g-nr-imsi-catcher',
  'opc-ua-anonymous-endpoint',
  'zigbee-default-key',
  'zwave-s2-downgrade',
  'canbus-frame-injection',
  'bacnet-unauthenticated-write',
  'grpc-reflection-abuse',
  'sctp-init-flood',
  'vrrp-master-takeover',
  'bfd-session-forgery',
]);

export function difficultyForAttack(id: string): 1 | 2 | 3 {
  if (ADVANCED.has(id)) return 3;
  if (BEGINNER.has(id)) return 1;
  return 2;
}
