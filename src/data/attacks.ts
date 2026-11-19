import type { AttackCategory } from './attackCategories';
import { phaseForStep, type AttackPhase } from './attackPhases';
import { MITRE_BY_ATTACK } from './mitre';
import { difficultyForAttack } from './attackDifficulty';

export interface AttackStep {
  title: string;
  description: string;
  detection: string;
  phase: AttackPhase;
  trafficDirection: 'attacker-to-target' | 'target-to-attacker' | 'broadcast';
}

export interface AttackScenario {
  id: string;
  protocolSlug: string;
  name: string;
  category: AttackCategory;
  summary: string;
  steps: AttackStep[];
  impact: string;
  mitigations: string[];
  difficulty: 1 | 2 | 3;
  /** Reviewed MITRE ATT&CK technique IDs; empty when the mapping is unclear. */
  mitreIds: string[];
}

function scenario(
  protocolSlug: string,
  id: string,
  name: string,
  category: AttackCategory,
  summary: string,
  steps: [title: string, description: string, detection: string][],
  impact: string,
  mitigations: string[],
): AttackScenario {
  const fullId = `${protocolSlug}-${id}`;

  return {
    id: fullId,
    protocolSlug,
    name,
    category,
    summary,
    steps: steps.map(([title, description, detection], index) => ({
      title,
      description,
      detection,
      phase: phaseForStep(index),
      trafficDirection: 'attacker-to-target',
    })),
    impact,
    mitigations,
    difficulty: difficultyForAttack(fullId),
    mitreIds: MITRE_BY_ATTACK[fullId] ?? [],
  };
}

/**
 * Defensive education only. Every scenario describes an attack class at a
 * conceptual level: no exploit code, no payloads that could be replayed, and
 * no network activity. The UI runs these entirely in the browser.
 */
export const ATTACKS: AttackScenario[] = [
  // 1. MAC flooding
  scenario(
    'ethernet',
    'mac-flooding',
    'MAC flooding (CAM table exhaustion)',
    'denial-of-service',
    'A flood of frames with random source MAC addresses overflows the switch forwarding table, so unknown-unicast traffic is broadcast to every port.',
    [
      ['Overwhelm the table', 'The attacker sends thousands of frames with different source MACs. The switch keeps learning entries until its CAM table is full.', 'A sudden spike in learned MACs and a falling CAM table watermark on the switch.'],
      ['Switch falls back to flooding', 'With no table entry, the switch floods frames out of every port in the VLAN, including the attacker port.', 'Unknown-unicast flooding counters rise; multiple hosts see traffic not addressed to them.'],
      ['Capture exposed traffic', 'The attacker receives frames that would normally be switched only to their real destination.', 'Promiscuous-mode interfaces and abnormal broadcast levels on an access port.'],
    ],
    'Confidentiality loss on the local segment and degraded performance for every host in the VLAN.',
    ['Port security with a strict MAC limit', 'Storm control and broadcast suppression', 'Dynamic ARP Inspection plus VLAN segmentation'],
  ),
  // 2. Evil twin
  scenario(
    'wifi',
    'evil-twin',
    'Evil twin access point',
    'interception',
    'A rogue access point reuses the corporate SSID and captures clients that associate with the stronger signal.',
    [
      ['Clone the SSID', 'The attacker advertises the same network name, often with a stronger signal near the target.', 'Wireless IDS sees two BSSIDs for one SSID with different security settings.'],
      ['Lure the client', 'Clients configured to roam automatically may associate with the clone, especially after a deauthentication burst.', 'Repeated deauth frames followed by associations to a new BSSID.'],
      ['Relay or capture', 'The attacker proxies traffic to the real network or presents a captive portal to harvest credentials.', 'Certificate warnings, unexpected captive portals and DNS changes.'],
    ],
    'Credential theft, session interception and full visibility of the victim traffic.',
    ['WPA3-Enterprise with certificate validation', '802.1X supplicant that validates the server certificate', 'Wireless IDS and rogue AP containment'],
  ),
  // 3. VLAN double tagging
  scenario(
    'vlan',
    'double-tagging',
    'VLAN double tagging (hop)',
    'abuse',
    'A frame with two 802.1Q tags can cross a trunk port when the native VLAN is left untagged.',
    [
      ['Craft a stacked tag', 'The attacker sends a frame tagged with the native VLAN as the outer tag and the victim VLAN as the inner tag.', 'Frames with two 802.1Q headers on an access port.'],
      ['Switch strips the outer tag', 'The access port removes the native VLAN tag and forwards the frame onto the trunk with the inner tag intact.', 'Unexpected tagged frames arriving on a trunk from an access port.'],
      ['Reach another segment', 'The target switch delivers the frame into the victim VLAN, bypassing the segmentation.', 'Traffic for a VLAN that should not exist on that port.'],
    ],
    'Segmentation bypass that exposes hosts in another VLAN.',
    ['Never use VLAN 1 as the native VLAN', 'Tag all traffic on trunks and prune unused VLANs', 'Reject double-tagged frames at the edge'],
  ),
  // 4. STP root takeover
  scenario(
    'stp',
    'root-takeover',
    'Spanning tree root takeover',
    'spoofing',
    'Faster BPDUs from an attacker make it the root bridge, pulling inter-switch traffic through its link.',
    [
      ['Send superior BPDUs', 'The attacker advertises a lower bridge ID and better root path cost than the real root.', 'A new root bridge appears with an unexpected MAC and priority.'],
      ['Topology reconverges', 'Switches move their root port toward the attacker, changing the forwarding topology.', 'Spanning tree topology change notifications and port role changes.'],
      ['Become an on-path node', 'Traffic between switches now traverses the attacker, enabling capture or drops.', 'High traffic on an edge port that should only see one host.'],
    ],
    'Traffic interception or a network-wide outage if the attacker stops forwarding.',
    ['BPDU Guard on access ports', 'Root Guard on designated ports', 'Loop Guard and consistent bridge priorities'],
  ),
  // 5. LACP rogue member
  scenario(
    'lacp',
    'rogue-member',
    'Rogue link aggregation member',
    'interception',
    'A device that speaks LACP can join a link aggregation group and receive a share of the bundled traffic.',
    [
      ['Negotiate LACP', 'The attacker sends LACPDUs with a matching aggregation key and system parameters.', 'An unexpected port joins an existing port-channel.'],
      ['Join the bundle', 'The switch adds the attacker link as a member and load-balances frames onto it.', 'Member count and per-link traffic counters change.'],
      ['Receive traffic', 'A portion of the conversations is hashed onto the attacker link.', 'Traffic leaving on a port that should not carry that VLAN.'],
    ],
    'Partial interception of inter-switch traffic.',
    ['802.1X on all access ports', 'Port security and unused-port shutdown', 'Monitor port-channel membership changes'],
  ),
  // 6. LLDP neighbour spoofing
  scenario(
    'lldp',
    'neighbour-spoofing',
    'LLDP neighbour spoofing',
    'reconnaissance',
    'Forged LLDP TLVs advertise a fake switch or phone identity, poisoning topology and inventory records.',
    [
      ['Advertise a fake neighbour', 'The attacker sends LLDP frames claiming to be a core switch or IP phone.', 'LLDP neighbour changes on an access port.'],
      ['Poison the inventory', 'Management tools record the fake device and may apply the wrong voice or QoS policy.', 'Mismatch between LLDP data and the actual device inventory.'],
      ['Enable further attacks', 'The fake identity can justify VLAN or QoS changes that help a later attack.', 'Unexpected policy changes tied to LLDP-MED.'],
    ],
    'Incorrect topology data and possible policy manipulation.',
    ['Disable LLDP on untrusted edge ports', 'Use LLDP-MED policies with authentication', 'Alert on neighbour identity changes'],
  ),
  // 7. IGMP query spoofing
  scenario(
    'igmp',
    'query-spoofing',
    'IGMP query spoofing',
    'denial-of-service',
    'Forged IGMP queries and joins create multicast forwarding state that floods a segment.',
    [
      ['Send forged queries', 'The attacker impersonates the multicast querier and lowers response intervals.', 'Multiple IGMP queriers on one segment.'],
      ['Trigger joins', 'Hosts respond and the attacker joins high-volume groups.', 'Unexpected multicast group memberships.'],
      ['Flood the segment', 'Multicast traffic is replicated to ports that never asked for it.', 'Multicast rate spikes and switch CPU load.'],
    ],
    'Bandwidth exhaustion and degraded service for the VLAN.',
    ['IGMP snooping with querier guard', 'Multicast rate limits', 'Filter IGMP from untrusted ports'],
  ),
  // 8. mDNS answer spoofing
  scenario(
    'mdns',
    'answer-spoofing',
    'mDNS answer spoofing',
    'spoofing',
    'A forged multicast answer maps a local service name to the attacker address.',
    [
      ['Observe a query', 'The attacker watches multicast traffic for a printer or service discovery request.', 'Unusual hosts answering service discovery.'],
      ['Answer first', 'A forged response with a short TTL claims the name belongs to the attacker.', 'Conflicting mDNS answers for the same name.'],
      ['Redirect the client', 'The victim connects to the attacker for printing or file sharing.', 'Traffic to a host that has no matching inventory record.'],
    ],
    'Service impersonation and possible credential capture.',
    ['Segment untrusted devices', 'Filter mDNS at network boundaries', 'Verify service identities where the application supports it'],
  ),
  // 9. IPv4 source spoofing
  scenario(
    'ipv4',
    'source-spoofing',
    'Source address spoofing',
    'spoofing',
    'Packets carry a forged source address, hiding the sender and enabling reflection attacks.',
    [
      ['Forge the source', 'The attacker sets the source address to the victim or to an address that passes filters.', 'Packets arriving on an interface with a source that does not belong to that path.'],
      ['Bypass trust', 'Address-based allowlists and logging are fooled.', 'Audit logs show impossible source/destination combinations.'],
      ['Reflect or amplify', 'Responses are sent to the victim instead of the attacker.', 'Large response volumes toward a host that sent no request.'],
    ],
    'Attribution failure and reflected traffic toward a victim.',
    ['Ingress and egress filtering (BCP 38)', 'Unicast reverse path forwarding', 'Do not rely on IP addresses alone for authentication'],
  ),
  // 10. IPv6 rogue RA
  scenario(
    'ipv6',
    'rogue-ra',
    'Rogue router advertisement',
    'spoofing',
    'A forged Router Advertisement installs the attacker as the default gateway or DNS server for the segment.',
    [
      ['Advertise a prefix', 'The attacker multicasts an RA with a prefix and a short lifetime.', 'Multiple IPv6 routers or unexpected default routes.'],
      ['Become the default gateway', 'Hosts autoconfigure the attacker address as their next hop.', 'Default gateway changes without a DHCP or config event.'],
      ['Intercept or blackhole', 'Traffic is captured or dropped depending on the attacker goal.', 'Neighbour discovery anomalies and asymmetric paths.'],
    ],
    'Full IPv6 traffic interception on the segment.',
    ['RA Guard on access ports', 'DHCPv6 Guard and 802.1X', 'Monitor ICMPv6 router advertisements'],
  ),
  scenario(
    'arp',
    'cache-poisoning',
    'ARP cache poisoning',
    'interception',
    'Gratuitous ARP replies bind the gateway IP to the attacker MAC, placing the attacker on-path.',
    [
      ['Send gratuitous replies', 'The attacker claims that the gateway address belongs to its own MAC.', 'Repeated ARP replies without matching requests.'],
      ['Victims update their cache', 'Clients overwrite the gateway entry and send off-subnet traffic to the attacker.', 'One MAC appearing for many IP addresses.'],
      ['Relay to stay hidden', 'The attacker forwards traffic to the real gateway while reading it.', 'Duplicate MACs in ARP tables and asymmetric latency.'],
    ],
    'Man-in-the-middle access to local traffic, including credentials.',
    ['Dynamic ARP Inspection', 'DHCP snooping bindings', 'Static ARP for critical gateways and segmentation'],
  ),
  scenario(
    'icmp',
    'redirect-abuse',
    'ICMP redirect abuse',
    'spoofing',
    'Forged redirects convince a host to send traffic through an attacker-chosen next hop.',
    [
      ['Send a redirect', 'The attacker pretends to be the current gateway and suggests a better route.', 'ICMP redirects arriving from non-gateway addresses.'],
      ['Host updates its route cache', 'The victim installs the new next hop for that destination.', 'Route changes without routing protocol activity.'],
      ['Traffic follows the attacker', 'The flow is redirected for capture or blackholing.', 'Unexpected next-hop MAC addresses.'],
    ],
    'Traffic interception or selective outage.',
    ['Disable ICMP redirects on hosts and routers', 'Filter ICMP redirects at the edge', 'Segment routing domains'],
  ),
  scenario(
    'tcp',
    'syn-flood',
    'SYN flood',
    'denial-of-service',
    'Half-open connections exhaust the server backlog so legitimate clients cannot complete the handshake.',
    [
      ['Flood SYNs', 'The attacker sends many SYNs, often with spoofed sources.', 'Backlog queue growth and many SYN_RECEIVED states.'],
      ['Server allocates state', 'Each request consumes a connection slot until it times out.', 'Memory and connection table pressure.'],
      ['Legitimate clients time out', 'New handshakes are dropped or delayed, and health checks begin to fail.', 'Rising connect latency and failed health checks.'],
    ],
    'Service unavailability for legitimate users.',
    ['SYN cookies', 'Edge rate limiting and DDoS scrubbing', 'Backlog tuning and connection limits'],
  ),
  scenario(
    'udp',
    'amplification',
    'UDP amplification and reflection',
    'denial-of-service',
    'Spoofed requests to open UDP services produce large responses aimed at the victim.',
    [
      ['Find an amplifier', 'The attacker inventories services that answer small requests with large replies.', 'Scanning of UDP ports and unusual request patterns.'],
      ['Spoof the victim source', 'Requests carry the victim address as the source.', 'Responses arriving at a host that sent no request.'],
      ['Overwhelm the link', 'The combined response volume saturates the victim uplink.', 'Traffic spikes with a small packet size on the request side.'],
    ],
    'Bandwidth exhaustion and collateral impact on nearby networks.',
    ['BCP 38 ingress filtering', 'Rate limits on UDP services', 'Disable unused UDP responders'],
  ),
  scenario(
    'dns',
    'cache-poisoning',
    'DNS cache poisoning',
    'spoofing',
    'A forged answer that matches the transaction ID and source port is cached and served to later clients.',
    [
      ['Trigger a lookup', 'The attacker causes the resolver to query a name it wants to poison.', 'Unusual query bursts for one name.'],
      ['Race the real answer', 'Forged responses with guessed ID and port arrive before the authoritative server.', 'Duplicate responses and mismatched answer sources.'],
      ['Poison the cache', 'The resolver stores the forged record for its TTL.', 'Resolution changing to an address not present in the zone.'],
    ],
    'Traffic redirection for every client behind the resolver.',
    ['DNSSEC validation', 'Source port and transaction ID randomisation', 'Encrypted DNS to a trusted resolver'],
  ),
  scenario(
    'dhcp',
    'rogue-server',
    'Rogue DHCP server',
    'spoofing',
    'An unauthorised DHCP server answers first and hands out a malicious gateway or DNS server.',
    [
      ['Race the real server', 'The attacker replies to DISCOVER messages before the legitimate server.', 'Two DHCP servers offering addresses on one segment.'],
      ['Hand out bad options', 'The lease points the client at the attacker for gateway or DNS.', 'Gateway and DNS values outside the approved pool.'],
      ['Intercept traffic', 'The client sends traffic through the attacker.', 'Traffic to an unapproved next hop.'],
    ],
    'Traffic interception for new or renewing clients.',
    ['DHCP snooping with trusted ports', 'Port security and 802.1X', 'Monitor for unauthorised DHCP servers'],
  ),
  scenario(
    'http',
    'request-smuggling',
    'HTTP request smuggling',
    'injection',
    'Conflicting Content-Length and Transfer-Encoding headers make a proxy and origin disagree about where one request ends.',
    [
      ['Send ambiguous framing', 'A single request contains both length signals, interpreted differently by each hop.', 'Requests rejected by one hop but accepted by another.'],
      ['Desynchronise the connection', 'The front end treats the remainder as a new request, which the attacker controls.', 'Unexpected requests appearing on reused connections.'],
      ['Bypass controls', 'The smuggled request skips authentication or poisons another user response.', 'Access logs that do not match backend request logs.'],
    ],
    'Access control bypass, cache poisoning or response splitting.',
    ['Reject ambiguous message framing', 'Normalise headers at the edge', 'Use HTTP/2 end-to-end where possible'],
  ),
  scenario(
    'http2',
    'hpack-bomb',
    'HPACK bomb',
    'denial-of-service',
    'Highly compressed header blocks expand into enormous header tables, consuming server memory.',
    [
      ['Build a compression bomb', 'The attacker sends a small compressed block that expands to a huge header set.', 'Header decompression memory spikes per connection.'],
      ['Exhaust connection state', 'Many streams repeat the pattern until the server runs out of memory.', 'Rapid stream creation with tiny frames.'],
      ['Deny service', 'Legitimate streams are reset or delayed.', 'GOAWAY frames and elevated reset counts.'],
    ],
    'Memory exhaustion and connection resets.',
    ['Cap decoded header size', 'Limit concurrent streams and header table size', 'Terminate abusive connections at the edge'],
  ),
  scenario(
    'http3',
    'zero-rtt-replay',
    '0-RTT replay',
    'injection',
    'Early data captured from a previous connection is replayed to a server that accepts 0-RTT.',
    [
      ['Capture early data', 'The attacker records a 0-RTT request, for example a state-changing API call.', 'Repeated early-data requests with identical content.'],
      ['Replay it', 'The same bytes are sent on a new connection before the handshake completes.', 'Duplicate side effects for one user action.'],
      ['Trigger the action twice', 'Non-idempotent operations execute again.', 'Duplicate orders, transfers or state changes.'],
    ],
    'Duplicate transactions and state corruption.',
    ['Accept 0-RTT only for replay-safe methods', 'Server-side replay protection', 'Disable 0-RTT for authenticated state changes'],
  ),
  scenario(
    'tls',
    'downgrade-mitm',
    'Downgrade and rogue certificate',
    'downgrade',
    'An on-path attacker strips modern TLS or presents a certificate the client should reject.',
    [
      ['Intercept the handshake', 'The attacker proxies the connection and offers only weaker parameters.', 'Handshake offers and selected versions diverge.'],
      ['Present a rogue certificate', 'A certificate for the name is issued or the client is tricked into trusting it.', 'Certificate transparency and pinning alerts.'],
      ['Read or alter traffic', 'If accepted, the attacker decrypts or modifies the session.', 'Unexpected certificate issuers or validity periods.'],
    ],
    'Confidentiality and integrity loss for the affected session.',
    ['TLS 1.3 with strong cipher suites', 'HSTS and certificate pinning', 'Certificate Transparency monitoring'],
  ),
  scenario(
    'quic',
    'cid-tracking',
    'Stable connection ID tracking',
    'reconnaissance',
    'A connection ID that never changes lets an observer link a user across networks and sessions.',
    [
      ['Observe the CID', 'The attacker records the connection ID on one network.', 'Repeated CIDs across different client addresses.'],
      ['Follow the user', 'The same CID appears after a network change or IP rotation.', 'A CID that survives address changes.'],
      ['Correlate activity', 'The attacker links destinations and timing to build a profile.', 'Traffic correlation across otherwise separate paths.'],
    ],
    'Privacy loss through long-term tracking.',
    ['Rotate connection IDs', 'Avoid linkable CIDs for privacy-sensitive clients', 'Use encrypted transport parameters'],
  ),
  scenario(
    'websocket',
    'cross-site-hijack',
    'Cross-site WebSocket hijacking',
    'interception',
    'A malicious page opens a WebSocket to a victim site and relies on the browser sending session cookies.',
    [
      ['Lure the victim', 'The user visits an attacker page while logged in to the target application.', 'WebSocket handshakes with a foreign Origin header.'],
      ['Open a socket', 'JavaScript connects to the target; cookies may accompany the handshake.', 'Authenticated connections from unexpected origins.'],
      ['Read messages', 'The attacker receives live data or sends actions over the socket.', 'Message patterns inconsistent with the real client.'],
    ],
    'Session takeover and data exfiltration.',
    ['Validate the Origin header', 'Authenticate the socket with a token, not only cookies', 'Use SameSite cookies and per-message authorisation'],
  ),
  scenario(
    'ssh',
    'credential-bruteforce',
    'Credential brute force',
    'credential',
    'Automated guessing against exposed SSH services eventually finds a weak password.',
    [
      ['Enumerate the service', 'The attacker confirms SSH and its version without triggering alarms.', 'Repeated banner grabs and version scans.'],
      ['Guess credentials', 'Password spraying tries common passwords across many accounts.', 'Many failed authentications from one source.'],
      ['Log in', 'A successful login gives an interactive shell.', 'Successful auth from a new location at an odd hour.'],
    ],
    'Remote code execution with the victim account privileges.',
    ['Disable password authentication; use keys', 'MFA and source-address restrictions', 'Fail2ban and login alerting'],
  ),
  scenario(
    'smtp',
    'sender-spoofing',
    'Sender spoofing and open relay',
    'abuse',
    'A misconfigured mail server relays mail for anyone or accepts a forged sender identity.',
    [
      ['Probe for relay', 'The attacker tests whether the server forwards mail to an external domain.', 'Relay attempts and unusual RCPT TO domains.'],
      ['Forge the sender', 'The envelope and header claim to come from a trusted brand.', 'SPF, DKIM and DMARC failures at receivers.'],
      ['Send a campaign', 'Bulk phishing is delivered using the server reputation.', 'Sudden outbound volume and complaint rates.'],
    ],
    'Phishing delivery and reputational damage.',
    ['Require authentication for submission', 'SPF, DKIM and DMARC enforcement', 'Outbound rate limits and monitoring'],
  ),
  scenario(
    'imap',
    'credential-stuffing',
    'Credential stuffing',
    'credential',
    'Passwords leaked from another breach are replayed against IMAP, which often lacks MFA.',
    [
      ['Reuse leaked credentials', 'The attacker tries email/password pairs from a breach list.', 'Many failed logins across distinct accounts.'],
      ['Find a match', 'A reused password grants mailbox access.', 'Successful logins from new devices or countries.'],
      ['Harvest mail', 'The attacker reads or forwards messages and resets other accounts.', 'Suspicious forwarding rules and mailbox exports.'],
    ],
    'Mailbox takeover and downstream account resets.',
    ['MFA and OAuth-based mail access', 'Block legacy authentication', 'Rate limiting and impossible-travel alerts'],
  ),
  scenario(
    'pop3',
    'cleartext-capture',
    'Cleartext credential capture',
    'interception',
    'POP3 without TLS sends usernames and passwords in plaintext across the local network.',
    [
      ['Capture the session', 'The attacker sniffs the network during a mail check.', 'POP3 traffic on port 110 instead of 995.'],
      ['Read the credentials', 'USER and PASS commands are visible in the capture, exposing the mailbox password.', 'Plaintext authentication in captured traffic.'],
      ['Reuse them', 'The same credentials often unlock other services.', 'Logins from new locations.'],
    ],
    'Credential theft and mailbox compromise.',
    ['Require POP3S on port 995', 'Disable plaintext authentication', 'Network segmentation and MFA'],
  ),
  scenario(
    'ftp',
    'cleartext-bounce',
    'Cleartext sessions and FTP bounce',
    'interception',
    'FTP sends credentials and data in the clear, and the PORT command can be abused to reach other hosts.',
    [
      ['Sniff the control channel', 'The attacker captures USER and PASS commands.', 'FTP control traffic on port 21.'],
      ['Abuse the data channel', 'A forged PORT command makes the server connect to a third party.', 'Server-initiated connections to unexpected hosts.'],
      ['Exfiltrate or pivot', 'Data is read, altered or used to scan internal networks.', 'Unusual data transfers and connection attempts.'],
    ],
    'Credential theft and use of the server as a pivot.',
    ['Replace FTP with SFTP or FTPS', 'Disable PORT and use passive mode only', 'Egress filtering from servers'],
  ),
  scenario(
    'telnet',
    'session-hijack',
    'Telnet session hijack',
    'interception',
    'Telnet carries credentials and commands in plaintext, so an on-path attacker can read or take over a session.',
    [
      ['Capture the session', 'The attacker records the TCP stream of an administrative login.', 'Telnet traffic on port 23.'],
      ['Read credentials', 'Username and password are visible in the capture.', 'Cleartext credentials in logs or packet captures.'],
      ['Hijack or replay', 'The attacker injects commands into the session or logs in later.', 'Commands the administrator did not type.'],
    ],
    'Full administrative compromise of the device.',
    ['Replace Telnet with SSH', 'Disable Telnet on all devices', 'Management VLAN and ACLs'],
  ),
  scenario(
    'ldap',
    'filter-injection',
    'LDAP filter injection',
    'injection',
    'Unescaped input in an LDAP filter can change the query logic and bypass authentication or expose entries.',
    [
      ['Supply a crafted value', 'A login field contains filter metacharacters instead of a plain name.', 'LDAP errors and unusual filter strings in logs.'],
      ['Alter the filter', 'The query becomes a wildcard or an OR condition that always matches.', 'Queries returning far more entries than expected.'],
      ['Bypass or enumerate', 'The attacker logs in as another user or dumps the directory.', 'Authentication successes without a matching password check.'],
    ],
    'Authentication bypass and directory disclosure.',
    ['Escape all filter input', 'Use parameterised directory APIs', 'Least-privilege bind accounts'],
  ),
  scenario(
    'snmp',
    'community-bruteforce',
    'Community string guessing',
    'credential',
    'Devices left on the default public or private community expose configuration and statistics.',
    [
      ['Probe the agent', 'The attacker tries common community strings against UDP 161.', 'Repeated SNMP requests with failed community values.'],
      ['Read the MIB', 'Interface, routing and host information becomes visible.', 'Bulk SNMP walks from an unusual source.'],
      ['Change or pivot', 'A read-write string allows configuration changes.', 'SET requests from an unauthorised address.'],
    ],
    'Device reconfiguration and network reconnaissance.',
    ['SNMPv3 with authentication and privacy', 'Remove default communities', 'ACLs limiting management sources'],
  ),
  scenario(
    'ntp',
    'time-spoofing',
    'Time spoofing and monlist amplification',
    'denial-of-service',
    'Forged NTP replies shift a client clock, while legacy monlist queries amplify traffic.',
    [
      ['Answer a request', 'The attacker replies to an NTP query with a forged timestamp before the real server.', 'Clients syncing to an unapproved server.'],
      ['Shift the clock', 'Kerberos, TLS validity and logs start to disagree.', 'Clock offsets across hosts and authentication failures.'],
      ['Amplify or disrupt', 'Old monlist commands flood a victim, or wrong time breaks services.', 'Large NTP responses and time-sensitive errors.'],
    ],
    'Authentication failures, log corruption and reflected traffic.',
    ['NTS or authenticated NTP', 'Multiple trusted time sources', 'Disable monlist and rate limit NTP'],
  ),
  scenario(
    'bgp',
    'route-hijack',
    'BGP route hijack',
    'spoofing',
    'A network announces a prefix it does not own, and neighbours prefer the more specific or shorter path.',
    [
      ['Announce the prefix', 'The attacker originates a prefix belonging to someone else.', 'Unexpected origin AS for a known prefix.'],
      ['Win the best path', 'A more specific announcement or manipulated AS path attracts traffic.', 'Traffic engineering changes for that prefix.'],
      ['Blackhole or inspect', 'Traffic is dropped or routed through the attacker.', 'Traffic leaving through an unexpected provider.'],
    ],
    'Large-scale redirection or outage for the hijacked address space.',
    ['RPKI origin validation', 'Prefix and AS-path filters', 'Maximum-prefix limits and monitoring'],
  ),
  scenario(
    'ospf',
    'lsa-injection',
    'OSPF LSA injection',
    'spoofing',
    'A rogue router forms an adjacency and floods false link-state advertisements into the area.',
    [
      ['Form an adjacency', 'The attacker brings up OSPF with the correct area and parameters.', 'New neighbour on an unexpected interface.'],
      ['Flood bogus LSAs', 'Fake links or costs change the shortest-path tree.', 'LSA churn and topology changes without link events.'],
      ['Steer traffic', 'Routes point through the attacker or into a black hole.', 'Next-hop changes for many prefixes.'],
    ],
    'Traffic redirection or routing instability.',
    ['OSPF authentication (MD5 or SHA)', 'Passive interfaces on edge ports', 'Area filtering and topology monitoring'],
  ),
  scenario(
    'sctp',
    'init-flood',
    'INIT flood',
    'denial-of-service',
    'A flood of spoofed INIT chunks consumes bandwidth and association table resources.',
    [
      ['Send INIT chunks', 'The attacker floods INITs, often with forged source addresses.', 'High INIT rate and association table growth.'],
      ['Force cookie work', 'The endpoint computes and returns cookies for every request.', 'CPU spikes in the SCTP stack.'],
      ['Exhaust resources', 'Legitimate associations are delayed or dropped.', 'Failed association attempts and packet loss.'],
    ],
    'Service degradation despite the cookie defence.',
    ['Rate limit INIT chunks at the edge', 'Firewall SCTP to known peers', 'Monitor association table pressure'],
  ),
  scenario(
    'mpls',
    'vrf-leak',
    'MPLS VPN label leak',
    'interception',
    'A misconfigured label stack or route target lets traffic from one VPN reach another.',
    [
      ['Craft a labelled packet', 'The attacker sends traffic with a label that belongs to another VRF.', 'Labels arriving from an unexpected interface.'],
      ['Router forwards by label', 'The PE forwards based on the label without rechecking the VRF.', 'Traffic crossing VRFs in flow telemetry.'],
      ['Reach another tenant', 'The packet is delivered into a network it should never reach.', 'Cross-tenant flows and unexpected next hops.'],
    ],
    'Tenant isolation failure and data exposure.',
    ['Strict label and route-target filtering', 'Inter-AS option controls', 'Flow monitoring across VRFs'],
  ),
  scenario(
    'vxlan',
    'vni-hopping',
    'VXLAN VNI hopping',
    'injection',
    'A host that can send VXLAN frames injects traffic into another VNI on the same underlay.',
    [
      ['Reach the underlay', 'The attacker gains access to a host or switch that can send VXLAN traffic.', 'VTEP traffic from an unapproved source.'],
      ['Set another VNI', 'Frames are encapsulated with a VNI the attacker should not use.', 'VNI values outside the host policy.'],
      ['Inject into the segment', 'The destination VTEP decapsulates into the victim network.', 'Unexpected source MACs in the target VNI.'],
    ],
    'Cross-segment injection and isolation bypass.',
    ['VNI ACLs on VTEPs', 'Isolate the underlay from tenants', 'BUM traffic rate limits and monitoring'],
  ),
  scenario(
    'ipsec',
    'aggressive-mode-crack',
    'IKE aggressive-mode offline crack',
    'credential',
    'A PSK hash captured from aggressive mode can be attacked offline, and a weak secret falls quickly.',
    [
      ['Capture the exchange', 'The attacker records the aggressive-mode messages.', 'Aggressive mode in use instead of IKEv2.'],
      ['Take the hash offline', 'The PSK hash is cracked without touching the VPN again.', 'No further traffic needed to test guesses.'],
      ['Connect as a peer', 'The recovered PSK allows a rogue tunnel.', 'New IKE identities and tunnel endpoints.'],
    ],
    'Unauthorised VPN access to the private network.',
    ['Use IKEv2 with certificates', 'Long random PSKs where PSK is unavoidable', 'Disable aggressive mode'],
  ),
  scenario(
    'wireguard',
    'stolen-key',
    'Stolen static key impersonation',
    'credential',
    'A leaked private key lets an attacker impersonate a peer and use its allowed IPs.',
    [
      ['Obtain the key', 'The key is copied from a compromised host or backup.', 'Key material outside the expected host.'],
      ['Bring up a peer', 'The attacker completes the handshake as the legitimate peer.', 'A peer online from two places at once.'],
      ['Reach allowed networks', 'Traffic is accepted for that peer allowed-IP range.', 'Source addresses from an unexpected endpoint.'],
    ],
    'Network access with the victim peer privileges.',
    ['Protect and rotate private keys', 'Per-peer allowed IPs and least privilege', 'Alert on duplicate or roaming peers'],
  ),
  scenario(
    'radius',
    'secret-capture',
    'Shared secret capture and forgery',
    'credential',
    'A weak RADIUS shared secret allows forged access requests or response tampering.',
    [
      ['Capture traffic', 'The attacker records RADIUS packets between the NAS and server.', 'RADIUS on plain UDP without a tunnel.'],
      ['Attack the secret', 'The shared secret is guessed or cracked offline.', 'Failed authentications and retries from a new source.'],
      ['Forge a response', 'The attacker grants access or alters attributes.', 'Access-Accept without a matching request.'],
    ],
    'Unauthorised network access and policy bypass.',
    ['Long random shared secrets', 'RADIUS over TLS or IPsec', 'MFA and accounting correlation'],
  ),
  scenario(
    'dot1x',
    'eapol-flood',
    'EAPOL flood',
    'denial-of-service',
    'A flood of EAPOL start frames overwhelms the authenticator and prevents legitimate supplicants from authenticating.',
    [
      ['Flood EAPOL-Start', 'The attacker generates many authentication attempts.', 'High EAPOL rate and CPU load on the switch.'],
      ['Exhaust auth state', 'The authenticator allocates state for each attempt.', 'Authentication queue growth and timeouts.'],
      ['Block legitimate users', 'Real devices fail to authenticate and fall back or are denied.', 'Ports stuck in authenticating state.'],
    ],
    'Wired access outage for the affected switch.',
    ['EAPOL rate limiting', 'Port security and MAC limits', 'Monitor authentication failure rates'],
  ),
  scenario(
    'dnssec',
    'downgrade-walking',
    'DNSSEC downgrade and zone walking',
    'downgrade',
    'Stripping the DO bit or querying NSEC records can bypass validation or enumerate a zone.',
    [
      ['Strip validation', 'An on-path attacker removes DNSSEC records so a non-validating resolver accepts the answer.', 'Answers with missing RRSIG or DO.'],
      ['Walk the zone', 'NSEC records reveal the next name, allowing enumeration.', 'Sequential NSEC queries.'],
      ['Target the discovered names', 'Internal hostnames become attack targets.', 'Scans of names that were never published.'],
    ],
    'Spoofed answers and information disclosure.',
    ['Enforce validating resolvers', 'Use NSEC3 with opt-out where appropriate', 'Do not rely on DNSSEC alone for confidentiality'],
  ),
  scenario(
    'acme',
    'validation-hijack',
    'Domain validation hijack',
    'spoofing',
    'Control of the HTTP-01 path or DNS zone lets an attacker obtain a certificate for a domain they do not own.',
    [
      ['Take the validation path', 'The attacker gains control of the web root or DNS records.', 'Unexpected changes to .well-known or DNS.'],
      ['Complete the challenge', 'The CA validates the attacker-controlled response.', 'Certificate issuance not matching a change ticket.'],
      ['Use the certificate', 'A trusted certificate enables phishing or interception.', 'New certificates in transparency logs.'],
    ],
    'Trusted certificate misissuance for the domain.',
    ['CAA records limiting issuers', 'DNS-01 with a secured zone', 'Certificate Transparency monitoring'],
  ),
  scenario(
    'oidc',
    'redirect-abuse',
    'Redirect URI abuse',
    'credential',
    'A loose redirect URI allowlist sends the authorization code to an attacker-controlled endpoint.',
    [
      ['Craft the request', 'The attacker builds an authorization request using an allowed but open redirect.', 'Authorize requests with unexpected redirect parameters.'],
      ['Capture the code', 'The victim authenticates and the code is forwarded to the attacker.', 'Codes redeemed from a different client or IP.'],
      ['Exchange the code', 'The attacker obtains tokens and impersonates the user.', 'Token use from an unusual device.'],
    ],
    'Account takeover through stolen authorization codes.',
    ['Exact redirect URI matching', 'PKCE for all public clients', 'State and nonce validation'],
  ),
  scenario(
    'webdav',
    'unauthenticated-put',
    'Unauthenticated file upload',
    'abuse',
    'A writable WebDAV share accepts PUT requests and serves the uploaded content back to other users.',
    [
      ['Probe methods', 'The attacker checks which WebDAV methods are enabled.', 'OPTIONS responses listing PUT or MOVE.'],
      ['Upload a file', 'A script or phishing page is written to the share.', 'New files created outside the normal workflow.'],
      ['Serve it', 'The file is executed or delivered to victims from a trusted domain.', 'Requests for unexpected paths on the server.'],
    ],
    'Web shell deployment or malware hosting on a trusted domain.',
    ['Require authentication and authorisation', 'Disable unused WebDAV methods', 'Content scanning and immutable storage'],
  ),
  scenario(
    'spf',
    'misconfiguration',
    'SPF misconfiguration abuse',
    'spoofing',
    'A neutral all-qualifier or missing record lets anyone send mail claiming to be the domain.',
    [
      ['Check the policy', 'The attacker reads the domain SPF record and finds ~all or no record.', 'Domains without an enforcing SPF policy.'],
      ['Send forged mail', 'Messages use the domain in the envelope sender.', 'SPF neutral or none results at receivers.'],
      ['Reach the inbox', 'Without DMARC enforcement, the mail may be delivered.', 'Brand impersonation and user reports.'],
    ],
    'Phishing with the organisation domain.',
    ['End SPF with -all', 'Align SPF with DMARC', 'Monitor authentication results'],
  ),
  scenario(
    'dkim',
    'weak-key-replay',
    'Weak DKIM key and signed-message replay',
    'spoofing',
    'Short DKIM keys can be factored, and a captured signed message can be replayed if the body is unchanged.',
    [
      ['Inspect the selector', 'The attacker fetches the public key and finds a short key.', 'DKIM keys below 2048 bits.'],
      ['Recover or replay', 'The key is factored or the signed message is reused.', 'Repeated identical signatures across messages.'],
      ['Pass authentication', 'The forged or replayed mail validates at the receiver.', 'DKIM pass on unexpected content.'],
    ],
    'Delivered spoofed mail with a valid signature.',
    ['Use 2048-bit keys and rotate them', 'DMARC alignment and enforcement', 'Reject old or duplicate signatures'],
  ),
  scenario(
    'dmarc',
    'subdomain-gap',
    'Subdomain policy gap',
    'spoofing',
    'A p=none policy or a missing sp= record leaves subdomains available for spoofing.',
    [
      ['Read the policy', 'The attacker checks the organisational domain DMARC record.', 'p=none or no DMARC at all.'],
      ['Use a subdomain', 'Mail is sent from an unmonitored subdomain that inherits no enforcement.', 'Authentication failures only in reporting.'],
      ['Bypass filtering', 'Receivers deliver the message because no policy requires rejection.', 'User reports of plausible internal mail.'],
    ],
    'Phishing from lookalike subdomains.',
    ['p=reject with sp=reject', 'Inventory and monitor all subdomains', 'Act on aggregate reports'],
  ),
  scenario(
    'nfs',
    'auth-sys-spoofing',
    'AUTH_SYS identity spoofing',
    'interception',
    'NFS with AUTH_SYS trusts the client to state its UID and GID, so a modified client can claim another identity.',
    [
      ['Find an exported share', 'The attacker enumerates exports and mount permissions.', 'Mount attempts from unapproved hosts.'],
      ['Claim another UID', 'The client sends AUTH_SYS credentials for a privileged user.', 'File access by a UID that does not match the host.'],
      ['Read or write data', 'Sensitive files are exposed or altered using the spoofed identity.', 'Access to files outside the expected owner.'],
    ],
    'Data disclosure or tampering on the share.',
    ['Kerberos with sec=krb5p', 'Root squash and export restrictions', 'Network ACLs on NFS ports'],
  ),
  scenario(
    'smb',
    'ntlm-relay',
    'NTLM relay',
    'interception',
    'Coerced authentication is relayed to another SMB server that accepts NTLM, granting the attacker the victim session.',
    [
      ['Coerce authentication', 'The victim is tricked into authenticating to the attacker.', 'Outbound SMB or WebDAV authentication attempts.'],
      ['Relay the session', 'The authentication is forwarded to a target server.', 'Logins from an unexpected source address.'],
      ['Act as the victim', 'Files or administrative shares are accessed.', 'SMB sessions with mismatched host and user context.'],
    ],
    'Lateral movement with the victim privileges.',
    ['Require SMB signing', 'Disable NTLM where possible', 'Extended Protection for Authentication and segmentation'],
  ),
  scenario(
    'netconf',
    'unauthorised-config',
    'Unauthorised configuration change',
    'abuse',
    'Reused SSH credentials or an over-privileged account allows a NETCONF client to change device configuration.',
    [
      ['Log in over SSH', 'The attacker uses stolen or weak credentials on port 830.', 'NETCONF sessions from new management hosts.'],
      ['Edit the candidate config', 'A configuration change is staged in the candidate datastore and committed.', 'Configuration diffs outside a change window.'],
      ['Impact the network', 'Routes or ACLs change, causing outage or redirection.', 'Unexpected commits and rollback events.'],
    ],
    'Network-wide misconfiguration or traffic redirection.',
    ['SSH keys with MFA', 'NACM rules limiting each account', 'Configuration change approval and audit'],
  ),
  scenario(
    'sftp',
    'path-traversal',
    'SFTP path traversal and weak credentials',
    'injection',
    'A misconfigured SFTP server or stolen credentials allow access outside the intended directory.',
    [
      ['Authenticate', 'The attacker logs in with reused credentials or a stolen key.', 'SFTP logins from new locations.'],
      ['Probe paths', 'Traversal sequences or symlinks are used to leave the home directory.', 'Read attempts on paths outside the chroot.'],
      ['Exfiltrate or upload', 'Sensitive files are downloaded or a payload is staged.', 'Large transfers and new files in unexpected paths.'],
    ],
    'Data exposure and malware staging on the server.',
    ['Chroot every SFTP account', 'Keys plus MFA, no password reuse', 'Audit file access and transfers'],
  ),
  scenario(
    'rtp',
    'media-injection',
    'RTP media injection',
    'injection',
    'An attacker who guesses the RTP ports and SSRC can inject audio or video into a call.',
    [
      ['Discover the session', 'SDP or scanning reveals the RTP ports and codec.', 'Unsolicited packets toward the media ports.'],
      ['Match the stream', 'The attacker uses the SSRC and sequence numbers to blend in.', 'Duplicate SSRCs and out-of-order sequence jumps.'],
      ['Inject media', 'Forged audio is played to the participants.', 'Unexpected talk bursts and quality alarms.'],
    ],
    'Eavesdropping disruption and social-engineering opportunities.',
    ['SRTP with authenticated key exchange', 'Randomise ports and restrict media sources', 'Monitor SSRC and sequence anomalies'],
  ),
  scenario(
    'sip',
    'registration-hijack',
    'SIP registration hijack',
    'spoofing',
    'Weak digest credentials allow an attacker to register as a user and route calls through the attacker.',
    [
      ['Guess credentials', 'The attacker brute-forces or reuses SIP digest passwords.', 'Many 401/407 challenges for one account.'],
      ['Register the contact', 'A new contact URI replaces the legitimate one.', 'Registration from a new IP for an existing user.'],
      ['Intercept or fraud', 'Calls are redirected or premium-rate numbers are dialled.', 'Unexpected international destinations and call volume.'],
    ],
    'Call interception and toll fraud.',
    ['TLS for SIP signalling', 'Strong digest or certificate auth', 'Fraud detection and registration monitoring'],
  ),
  scenario(
    'mqtt',
    'topic-hijack',
    'Topic hijack and ACL gap',
    'injection',
    'A client that can subscribe to wildcards or publish to another device topic can forge sensor data or commands.',
    [
      ['Connect to the broker', 'Weak or anonymous authentication lets the attacker join.', 'New client IDs and anonymous connections.'],
      ['Subscribe broadly', 'A wildcard subscription exposes other devices traffic.', 'Subscriptions to # or other tenants topics.'],
      ['Publish forged data', 'Fake readings or commands are delivered to subscribers.', 'Messages from a client that should not publish there.'],
    ],
    'False telemetry, unauthorised actuation and data disclosure.',
    ['Per-client topic ACLs', 'TLS with client certificates', 'Disable anonymous access and monitor subscriptions'],
  ),
  scenario(
    'coap',
    'amplification',
    'CoAP amplification',
    'denial-of-service',
    'Spoofed CoAP requests to discovery or large-resource endpoints generate responses aimed at a victim.',
    [
      ['Find a responder', 'The attacker probes for discovery or large resource endpoints.', 'Repeated /.well-known/core queries.'],
      ['Spoof the victim', 'Requests carry the victim source address.', 'Responses to a host that sent no request.'],
      ['Amplify', 'Many small requests produce larger responses.', 'Uplink saturation at the victim.'],
    ],
    'Reflected traffic and device overload.',
    ['BCP 38 filtering', 'Rate limits on constrained devices', 'Disable multicast discovery from untrusted networks'],
  ),
  scenario(
    'modbus',
    'register-write',
    'Unauthorised register write',
    'injection',
    'Modbus has no authentication, so anyone who can reach port 502 can write coils or registers.',
    [
      ['Reach the PLC', 'The attacker gains access to the control network.', 'Connections to port 502 from IT segments.'],
      ['Write a register', 'A function code changes a setpoint or output.', 'Write requests outside the normal master polling.'],
      ['Cause physical impact', 'Equipment changes state or a safety limit is exceeded.', 'Process alarms and unexpected actuator movement.'],
    ],
    'Physical process disruption or equipment damage.',
    ['Segment OT from IT', 'Modbus-aware firewalls and allowlists', 'Deep packet inspection for write operations'],
  ),
  scenario(
    'opc-ua',
    'anonymous-endpoint',
    'Anonymous endpoint exposure',
    'abuse',
    'An OPC UA server that allows anonymous sessions exposes tags and methods to anyone who can reach it.',
    [
      ['Browse anonymously', 'The attacker connects without a certificate and browses the address space.', 'Anonymous sessions in the audit log.'],
      ['Read or invoke', 'Tags are read and methods may be callable.', 'Reads of sensitive nodes and method calls.'],
      ['Manipulate the process', 'Writable nodes change process behaviour.', 'Writes from an unapproved application.'],
    ],
    'Industrial data disclosure and process manipulation.',
    ['Disable anonymous authentication', 'X.509 certificates with a managed PKI', 'Role-based node permissions'],
  ),
  scenario(
    'amqp',
    'acl-bypass',
    'AMQP permission bypass',
    'injection',
    'Broad vhost permissions or the default guest account let a client publish to or consume from queues it should not touch.',
    [
      ['Connect to the broker', 'Default or reused credentials are accepted.', 'Guest logins and new connections.'],
      ['Access another queue', 'The client binds to a queue outside its scope.', 'Unexpected bindings and consumers.'],
      ['Inject or drain', 'Forged jobs are queued or messages are stolen.', 'Message rates and consumer counts changing.'],
    ],
    'Job injection, data theft and workflow corruption.',
    ['Remove the guest account', 'Per-vhost, per-user permissions', 'TLS and connection monitoring'],
  ),
  scenario(
    'kafka',
    'open-broker',
    'Open broker access',
    'interception',
    'A Kafka broker without authentication exposes topics, consumer offsets and produced records.',
    [
      ['Reach the broker', 'The attacker connects to the plaintext listener.', 'Clients from unapproved networks.'],
      ['Read topics', 'Sensitive event streams are consumed and consumer offsets move backward.', 'New consumer groups and offset resets.'],
      ['Produce records', 'Forged events are produced and flow into downstream systems.', 'Producers outside the known inventory.'],
    ],
    'Data disclosure and downstream fraud.',
    ['SASL and TLS listeners', 'Topic ACLs and quotas', 'Network isolation and client authentication'],
  ),
  scenario(
    'resp',
    'unauthenticated-redis',
    'Unauthenticated Redis access',
    'injection',
    'Redis bound to a reachable interface without a password allows arbitrary commands, including writes and module loading.',
    [
      ['Connect to 6379', 'The attacker reaches the port and sends RESP commands.', 'Connections from outside the application subnet.'],
      ['Read or overwrite', 'Keys are dumped or replaced, corrupting sessions and queues.', 'CONFIG, FLUSHALL or mass reads.'],
      ['Escalate', 'Replication or module features are abused to write files.', 'REPLICAOF or MODULE commands.'],
    ],
    'Session forgery, data loss and host compromise.',
    ['Bind to localhost or a private interface', 'ACLs and requirepass', 'Firewall port 6379 and disable dangerous commands'],
  ),
  scenario(
    'webrtc',
    'ip-leak',
    'ICE candidate IP leak',
    'reconnaissance',
    'ICE candidates can reveal local and public IP addresses to the remote peer before consent.',
    [
      ['Collect candidates', 'The remote peer gathers host and server-reflexive addresses.', 'Candidates revealing private ranges.'],
      ['Correlate the address', 'The IP identifies the network or approximate location.', 'Unexpected local addresses in SDP.'],
      ['Target the network', 'The address supports later network scanning or targeted attacks.', 'Scanning of the exposed range.'],
    ],
    'Privacy loss and network reconnaissance.',
    ['Force TURN relay for sensitive calls', 'Use mDNS host candidates', 'Review ICE policy and permissions'],
  ),
  scenario(
    'nats',
    'open-publish',
    'Unauthenticated publish',
    'injection',
    'An open NATS client port lets anyone publish or subscribe to subjects used by the application.',
    [
      ['Connect', 'The attacker reaches port 4222 without credentials.', 'Clients from unexpected addresses.'],
      ['Subscribe to wildcards', 'Application messages are observed in real time through the wildcard.', 'Subscriptions to broad subjects.'],
      ['Publish forged events', 'Services act on attacker-controlled messages.', 'Messages from clients not in the inventory.'],
    ],
    'Data disclosure and unauthorised actions.',
    ['Token or NKey authentication', 'Subject-level permissions', 'TLS and network isolation'],
  ),
  scenario(
    'stomp',
    'header-injection',
    'STOMP header injection',
    'injection',
    'Unsanitised CRLF sequences in STOMP headers can create extra headers or split frames.',
    [
      ['Supply header input', 'User-controlled text reaches a STOMP header value.', 'Headers containing line breaks.'],
      ['Add or split headers', 'Extra headers or a second frame are created.', 'Malformed frames and duplicate destinations.'],
      ['Redirect messages', 'The broker routes to an unintended destination.', 'Messages appearing on unexpected queues.'],
    ],
    'Message redirection and broker policy bypass.',
    ['Reject CRLF in header values', 'Authenticate and authorise destinations', 'TLS for broker connections'],
  ),
  scenario(
    'zigbee',
    'default-key',
    'Default trust-centre key',
    'interception',
    'Many Zigbee networks still use the well-known default trust-centre key, so an attacker can join and derive network keys.',
    [
      ['Sniff the join', 'The attacker captures the network key transport.', 'Unknown devices joining the mesh.'],
      ['Join with the default key', 'The trust centre accepts the attacker as a router or end device.', 'New short addresses and neighbour entries.'],
      ['Control devices', 'Commands are sent to lights, locks or sensors.', 'Commands from an unexpected node.'],
    ],
    'Full control of the Zigbee network.',
    ['Unique install codes and keys per device', 'Disable the default trust-centre key', 'Monitor joins and link keys'],
  ),
  scenario(
    'lorawan',
    'key-extraction',
    'Root key extraction and device impersonation',
    'credential',
    'Keys extracted from a device allow an attacker to derive session keys and inject uplinks as that device.',
    [
      ['Read the keys', 'NwkKey and AppKey are recovered from a debug interface or firmware.', 'Devices with exposed debug ports.'],
      ['Derive session keys', 'The attacker computes the keys for the current session.', 'Uplinks with a valid MIC from a second location.'],
      ['Forge uplinks', 'False sensor readings or commands reach the application.', 'Frame counters and duplicate device traffic.'],
    ],
    'False telemetry and unauthorised downlinks.',
    ['Protect keys in a secure element', 'Disable debug interfaces in production', 'Monitor frame counters and duplicate devices'],
  ),
  scenario(
    'matter',
    'commissioning-bruteforce',
    'Commissioning code brute force',
    'credential',
    'A short commissioning window and a weak setup passcode can allow an attacker to commission a device into their fabric.',
    [
      ['Start commissioning', 'The attacker opens a commissioning session during the pairing window.', 'Commissioning attempts from unknown controllers.'],
      ['Guess the passcode', 'Weak or reused setup passcodes are tried until one succeeds.', 'Repeated failed attestation or passcode attempts.'],
      ['Join the fabric', 'The device becomes controllable by the attacker.', 'An extra administrator or fabric entry.'],
    ],
    'Device takeover and persistent access to the fabric.',
    ['Short commissioning windows', 'Device attestation and unique codes', 'Lockout after failed attempts and audit fabrics'],
  ),
  scenario(
    'ble',
    'pairing-mitm',
    'BLE pairing downgrade (Just Works)',
    'interception',
    'If pairing falls back to Just Works, an on-path attacker can pair with both sides without a shared secret.',
    [
      ['Position between the peers', 'The attacker relays pairing messages during discovery.', 'Two connections to the same device.'],
      ['Force Just Works', 'The peers do not display or compare a passkey.', 'Pairing without a passkey or numeric comparison.'],
      ['Relay GATT traffic', 'Reads and writes pass through the attacker.', 'GATT operations from an unexpected central.'],
    ],
    'Data interception and unauthorised GATT writes.',
    ['LE Secure Connections with passkey or OOB', 'Require bonding and validate identities', 'Monitor connection counts'],
  ),
  scenario(
    'zwave',
    's2-downgrade',
    'S2 downgrade during inclusion',
    'downgrade',
    'A controller that accepts non-S2 inclusion lets an attacker join or impersonate a device with weaker security.',
    [
      ['Offer legacy inclusion', 'The attacker presents a device that only supports S0 or none.', 'Inclusion without S2 or DSK verification.'],
      ['Join the network', 'The controller grants a node ID and network keys.', 'New nodes added outside change control.'],
      ['Control devices', 'The rogue node sends commands to other devices.', 'Commands from an unexpected node ID.'],
    ],
    'Network takeover and device control.',
    ['Require S2 with DSK verification', 'Disable S0 and insecure inclusion', 'Monitor inclusion events'],
  ),
  scenario(
    'canbus',
    'frame-injection',
    'CAN frame injection',
    'injection',
    'Any node on a CAN bus can transmit frames, so a compromised ECU can spoof safety-critical messages.',
    [
      ['Gain bus access', 'The attacker connects to the CAN bus through a compromised node or port.', 'Unknown nodes and diagnostic traffic.'],
      ['Send a spoofed ID', 'Frames use the identifier of a trusted ECU.', 'Duplicate IDs and impossible sensor combinations.'],
      ['Trigger a reaction', 'Brakes, steering or dashboards respond to forged data.', 'Actuator commands without matching inputs.'],
    ],
    'Safety-critical vehicle behaviour and component damage.',
    ['Segment safety-critical buses', 'Gateway filtering of CAN IDs', 'CAN intrusion detection and secure onboard communication'],
  ),
  scenario(
    'bacnet',
    'unauthenticated-write',
    'Unauthenticated BACnet write',
    'injection',
    'BACnet has no native authentication, so anyone who reaches UDP 47808 can write setpoints and schedules.',
    [
      ['Reach the building network', 'The attacker gains access to the BAS VLAN.', 'BACnet traffic from IT or guest networks.'],
      ['Write a property', 'WriteProperty changes a temperature or schedule.', 'Writes outside the normal workstation.'],
      ['Affect the building', 'HVAC, access or lighting behaves unexpectedly.', 'Setpoint alarms and occupant complaints.'],
    ],
    'Comfort, safety and energy impact in the building.',
    ['Segment the BAS network', 'BACnet/SC with TLS', 'Gateway allowlists and write monitoring'],
  ),
  scenario(
    'nfc',
    'relay',
    'NFC relay attack',
    'interception',
    'Two devices forward APDUs in real time so a reader believes the card is present when it is far away.',
    [
      ['Approach the card', 'A hidden device reads the victim card in a pocket or bag.', 'Card use while the owner is not at a reader.'],
      ['Relay to the reader', 'A second device forwards the APDUs to the target reader.', 'Unusually long transaction timing.'],
      ['Authorise a payment', 'The reader accepts the relayed card response.', 'Payments without the owner present.'],
    ],
    'Unauthorised payments or access-control entry.',
    ['Distance-bounding and relay detection', 'Biometric or PIN verification', 'Tokenisation and transaction risk scoring'],
  ),
  scenario(
    '5g-nr',
    'imsi-catcher',
    'IMSI catcher and downgrade',
    'interception',
    'A rogue base station or a forced downgrade to 2G exposes subscriber identity and traffic metadata.',
    [
      ['Advertise a stronger cell', 'The attacker broadcasts a cell that the device prefers.', 'Unexpected cells and tracking-area changes.'],
      ['Collect identities', 'The device reveals identifiers during attach or paging.', 'Silent SMS and repeated attach attempts.'],
      ['Downgrade or intercept', 'Traffic is pushed to weaker encryption or recorded.', 'Unexpected 2G/3G fallback and cipher changes.'],
    ],
    'Location tracking and metadata exposure.',
    ['Require SUCI and 5G-AKA', 'Disable 2G/3G fallback where possible', 'Monitor for rogue cells and silent SMS'],
  ),
  scenario(
    'grpc',
    'reflection-abuse',
    'Reflection-enabled method abuse',
    'abuse',
    'Server reflection and missing authorisation expose RPC methods that clients were never meant to call directly.',
    [
      ['List the services', 'The attacker enables reflection and enumerates methods and message types.', 'Reflection requests from an unexpected client.'],
      ['Call a method directly', 'An internal administrative RPC is invoked with forged metadata.', 'Calls without the expected auth metadata or scope.'],
      ['Read or mutate data', 'The method returns records or performs a privileged change.', 'Authorisation decisions logged for the wrong subject.'],
    ],
    'Unauthorised data access and privileged operations.',
    ['Disable reflection in production', 'Per-method authorisation and scopes', 'Validate and sign caller metadata'],
  ),
  scenario(
    'oauth2',
    'token-theft',
    'Access token theft and scope abuse',
    'credential',
    'A leaked bearer token is replayed until it expires, and broad scopes widen the damage.',
    [
      ['Obtain a token', 'The token leaks through logs, a compromised client or an insecure redirect.', 'Tokens used from a new IP or device.'],
      ['Replay it', 'The attacker calls APIs with the stolen bearer token.', 'API calls that do not match the user session.'],
      ['Abuse the scopes', 'Overbroad grants allow data beyond the original purpose.', 'Access to resources outside the client role.'],
    ],
    'Account data disclosure and actions as the victim.',
    ['Short-lived tokens with sender constraints', 'Least-privilege scopes and consent', 'Token binding, rotation and revocation'],
  ),
  scenario(
    'kerberos',
    'kerberoasting',
    'Kerberoasting',
    'credential',
    'Any authenticated user can request a service ticket for an account with an SPN and crack its password offline.',
    [
      ['Request service tickets', 'The attacker enumerates SPNs and asks the KDC for tickets.', 'Many TGS requests for service accounts.'],
      ['Extract the encrypted blob', 'The ticket is encrypted with the service account key and taken offline.', 'Unusual ticket encryption types such as RC4.'],
      ['Crack and reuse', 'A weak service password is recovered and used for lateral movement.', 'Service account logins from new hosts.'],
    ],
    'Service account compromise and lateral movement.',
    ['Long random service account passwords', 'Managed service accounts and gMSAs', 'AES-only tickets and anomaly detection'],
  ),
  scenario(
    'saml',
    'signature-wrapping',
    'SAML signature wrapping',
    'injection',
    'A forged assertion is inserted beside the signed one so the service provider validates the signature but reads the attacker attributes.',
    [
      ['Capture a valid assertion', 'The attacker obtains their own signed assertion from the IdP.', 'Replays of assertions for the same account.'],
      ['Wrap a forged copy', 'A second assertion with elevated attributes is placed outside the signed element.', 'Assertions with multiple or nested Subject elements.'],
      ['Log in as an admin', 'The SP processes the unsigned copy and grants the wrong role.', 'Role changes without a matching IdP event.'],
    ],
    'Privilege escalation and full SSO account takeover.',
    ['Validate the signature over the exact consumed element', 'Reject duplicate or wrapped assertions', 'Audience, recipient and expiry checks'],
  ),
  scenario(
    'rip',
    'route-injection',
    'RIP route injection',
    'spoofing',
    'A forged RIP update advertises a shorter route for a prefix and attracts traffic to the attacker.',
    [
      ['Send an update', 'The attacker multicasts a RIPv2 response with a low hop count.', 'RIP updates from an unapproved router.'],
      ['Neighbours install it', 'Routers replace or add the route to their tables.', 'Routing table changes without a link event.'],
      ['Blackhole or intercept', 'Traffic follows the false route toward the attacker or a black hole.', 'Traffic leaving through an unexpected next hop.'],
    ],
    'Traffic redirection or outage for the affected prefixes.',
    ['RIPv2 authentication', 'Passive interfaces and prefix filters', 'Maximum-path and route-change monitoring'],
  ),
  scenario(
    'isis',
    'lsp-injection',
    'IS-IS LSP injection',
    'spoofing',
    'A rogue router forms an adjacency and floods link-state PDUs that distort the topology.',
    [
      ['Form an adjacency', 'The attacker matches the area and authentication parameters.', 'New IS-IS neighbour on an edge port.'],
      ['Flood false LSPs', 'Fake links and metrics change the shortest-path tree.', 'LSP churn and sequence-number jumps.'],
      ['Steer traffic', 'Routes shift toward or through the attacker.', 'Unexpected next hops for many prefixes.'],
    ],
    'Routing instability or interception across the domain.',
    ['IS-IS authentication (MD5 or HMAC-SHA)', 'Passive interfaces and prefix filters', 'Topology change monitoring'],
  ),
  scenario(
    'vrrp',
    'master-takeover',
    'VRRP master takeover',
    'spoofing',
    'Forged advertisements with a higher priority make the attacker the virtual router master.',
    [
      ['Send advertisements', 'The attacker claims a higher priority for the same VRID.', 'VRRP adverts from an unexpected MAC or priority.'],
      ['Become master', 'The real master yields and the virtual MAC moves to the attacker.', 'Master state changes without a failure.'],
      ['Own the gateway', 'Hosts send off-subnet traffic through the attacker.', 'Traffic to the virtual MAC on an unexpected port.'],
    ],
    'Default-gateway interception or outage.',
    ['VRRP authentication', 'Priority and source-address monitoring', 'First-hop security and port ACLs'],
  ),
  scenario(
    'bfd',
    'session-forgery',
    'BFD session forgery',
    'spoofing',
    'Forged BFD control packets can keep a dead path looking alive or flap a healthy one.',
    [
      ['Match the session', 'The attacker discovers the discriminators and timing.', 'BFD packets from an unexpected source.'],
      ['Forge liveness', 'Fake control packets prevent the peer from declaring the path down.', 'A session that stays up while traffic fails.'],
      ['Delay failover', 'Routing convergence is blocked during an outage.', 'Traffic loss with no BFD down event.'],
    ],
    'Delayed failover and extended outages.',
    ['BFD authentication', 'Control-plane policing and TTL checks', 'Independent path monitoring'],
  ),
];

export function getAttacks(slug: string): AttackScenario[] {
  return ATTACKS.filter((attack) => attack.protocolSlug === slug);
}

/**
 * Two real controls from other scenarios, used as plausible distractors. The
 * selection is deterministic so the quiz is stable across renders and devices.
 */
export function getDefenceDistractors(attackId: string, count = 2): string[] {
  const attack = ATTACKS.find((entry) => entry.id === attackId);
  if (!attack) return [];

  const correct = attack.mitigations[0];
  const pool = Array.from(
    new Set(
      ATTACKS.filter((entry) => entry.id !== attackId)
        .map((entry) => entry.mitigations[0])
        .filter((value) => value && value !== correct),
    ),
  );

  if (pool.length === 0) return [];

  let hash = 0;
  for (let index = 0; index < attackId.length; index += 1) {
    hash = (hash * 31 + attackId.charCodeAt(index)) >>> 0;
  }

  return Array.from({ length: Math.min(count, pool.length) }, (_, index) => {
    return pool[(hash + index * 7) % pool.length];
  });
}


export const ATTACKS_BY_PROTOCOL: Record<string, AttackScenario[]> = ATTACKS.reduce(
  (groups, attack) => {
    (groups[attack.protocolSlug] ??= []).push(attack);
    return groups;
  },
  {} as Record<string, AttackScenario[]>,
);
