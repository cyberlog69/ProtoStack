/**
 * A deliberately small, reviewed subset of MITRE ATT&CK enterprise techniques.
 * Only IDs listed here may be attached to a scenario, so a typo or invented
 * T-number fails the test suite instead of shipping.
 *
 * MITRE ATT&CK® is a registered trademark of The MITRE Corporation.
 * https://attack.mitre.org/
 */
export const MITRE_TECHNIQUES: Record<string, { name: string }> = {
  T1557: { name: 'Adversary-in-the-Middle' },
  T1040: { name: 'Network Sniffing' },
  T1498: { name: 'Network Denial of Service' },
  T1499: { name: 'Endpoint Denial of Service' },
  T1110: { name: 'Brute Force' },
  T1078: { name: 'Valid Accounts' },
  T1190: { name: 'Exploit Public-Facing Application' },
  T1552: { name: 'Unsecured Credentials' },
  T1553: { name: 'Subvert Trust Controls' },
  T1528: { name: 'Steal Application Access Token' },
  'T1558.003': { name: 'Steal or Forge Kerberos Tickets: Kerberoasting' },
  T1590: { name: 'Gather Victim Network Information' },
  'T1557.004': { name: 'Adversary-in-the-Middle: Evil Twin' },
  T1599: { name: 'Network Boundary Bridging' },
};

/**
 * Reviewed mappings for scenarios where the technique is unambiguous. Scenarios
 * without an entry simply do not show MITRE badges.
 */
export const MITRE_BY_ATTACK: Record<string, string[]> = {
  'ethernet-mac-flooding': ['T1498'],
  'wifi-evil-twin': ['T1557.004', 'T1040'],
  'vlan-double-tagging': ['T1599'],
  'stp-root-takeover': ['T1557'],
  'lacp-rogue-member': ['T1040'],
  'lldp-neighbour-spoofing': ['T1590'],
  'igmp-query-spoofing': ['T1498'],
  'mdns-answer-spoofing': ['T1557'],
  'ipv6-rogue-ra': ['T1557'],
  'arp-cache-poisoning': ['T1557', 'T1040'],
  'icmp-redirect-abuse': ['T1557'],
  'tcp-syn-flood': ['T1498'],
  'udp-amplification': ['T1498'],
  'dns-cache-poisoning': ['T1557'],
  'dhcp-rogue-server': ['T1557'],
  'http-request-smuggling': ['T1190'],
  'http2-hpack-bomb': ['T1499'],
  'tls-downgrade-mitm': ['T1557', 'T1553'],
  'quic-cid-tracking': ['T1590'],
  'websocket-cross-site-hijack': ['T1557'],
  'ssh-credential-bruteforce': ['T1110'],
  'imap-credential-stuffing': ['T1110', 'T1078'],
  'pop3-cleartext-capture': ['T1040'],
  'ftp-cleartext-bounce': ['T1040'],
  'telnet-session-hijack': ['T1040'],
  'ldap-filter-injection': ['T1190'],
  'snmp-community-bruteforce': ['T1110', 'T1552'],
  'ntp-time-spoofing': ['T1557'],
  'bgp-route-hijack': ['T1557'],
  'ospf-lsa-injection': ['T1557'],
  'sctp-init-flood': ['T1498'],
  'vxlan-vni-hopping': ['T1040'],
  'ipsec-aggressive-mode-crack': ['T1552'],
  'wireguard-stolen-key': ['T1552', 'T1078'],
  'radius-secret-capture': ['T1040', 'T1552'],
  'dot1x-eapol-flood': ['T1498'],
  'dnssec-downgrade-walking': ['T1553'],
  'acme-validation-hijack': ['T1553'],
  'oauth2-token-theft': ['T1528'],
  'kerberos-kerberoasting': ['T1558.003', 'T1552'],
  'saml-signature-wrapping': ['T1553'],
  'webdav-unauthenticated-put': ['T1190'],
  'netconf-unauthorised-config': ['T1078'],
  'sip-registration-hijack': ['T1078'],
  'opc-ua-anonymous-endpoint': ['T1078'],
  'amqp-acl-bypass': ['T1078'],
  'kafka-open-broker': ['T1040'],
  'resp-unauthenticated-redis': ['T1190'],
  'webrtc-ip-leak': ['T1590'],
  'zigbee-default-key': ['T1040'],
  'lorawan-key-extraction': ['T1552'],
  'matter-commissioning-bruteforce': ['T1110'],
  'nfc-relay': ['T1557'],
  '5g-nr-imsi-catcher': ['T1557', 'T1040'],
  'coap-amplification': ['T1498'],
  'zwave-s2-downgrade': ['T1553'],
  'vrrp-master-takeover': ['T1557'],
};

export function mitreTechnique(id: string) {
  return MITRE_TECHNIQUES[id];
}
