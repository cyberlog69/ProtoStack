import { Protocol } from '@/types/protocol';

export const PROF_SECURITY_PROTOCOLS: Protocol[] = [
    {
        id: 'acme',
        slug: 'acme',
        name: 'ACME',
        fullName: 'Automatic Certificate Management Environment',
        category: 'security',
        osiLayer: 'Application',
        port: '443 (HTTPS)',
        rfc: 'RFC 8555',
        yearIntroduced: 2019,
        shortSummary: 'Protocol that automates domain validation plus the issuance, renewal, and revocation of X.509 certificates.',
        description: 'ACME automates the entire certificate lifecycle for TLS servers. A client proves control of a domain to a certificate authority, submits a certificate signing request, and receives a signed X.509 certificate that can be renewed without human intervention.',
        keyFeatures: [
            'JSON messages exchanged over HTTPS with replay protection through one-time nonces',
            'Domain validation challenges such as http-01, dns-01, and tls-alpn-01',
            'Account key pairs used to sign every request with JWS instead of passwords',
            'Standardized order, authorization, and finalize resources for automated renewal'
        ],
        useCases: ['Free and automated TLS certificates from Let\'s Encrypt', 'Large fleets of web servers renewing certificates unattended', 'Internal PKI issuing certificates for service meshes and appliances'],
        pros: ['Removes manual CSR and renewal work from operations teams', 'Short-lived certificates reduce the impact of key compromise'],
        cons: ['The client needs a reachable HTTP endpoint or DNS API access for validation', 'Rate limits at public certificate authorities can block large bulk issuances'],
        actors: [
            { id: 'agent', label: 'ACME Client (certbot)', icon: 'Laptop', color: '#6366f1' },
            { id: 'ca', label: 'ACME Server (Certificate Authority)', icon: 'ShieldCheck', color: '#10b981' },
            { id: 'webserver', label: 'Web Server', icon: 'Server', color: '#f59e0b' }
        ],
        interactiveSteps: [
            {
                step: 1,
                title: 'Fetch Directory and Anti-Replay Nonce',
                description: 'The ACME client retrieves the directory document that lists every endpoint, then requests a fresh nonce for signing requests.',
                actorSource: 'agent',
                actorTarget: 'ca',
                explanation: 'Every ACME request is a JWS signed with the account key and must carry an unused nonce, so the client first performs HEAD /new-nonce to obtain one.',
                packetInfo: {
                    id: 'acme-pkt-1',
                    source: 'ACME Client',
                    destination: 'ca.example.net:443',
                    type: 'HTTPS GET /directory',
                    summary: 'Directory lists newNonce, newAccount, newOrder | HEAD /new-nonce returns Replay-Nonce',
                    payload: { endpoints: ['newNonce', 'newAccount', 'newOrder'], nonceLength: 32, contentType: 'application/json' }
                }
            },
            {
                step: 2,
                title: 'HTTP-01 Challenge Validation',
                description: 'After the client creates an order and picks the http-01 challenge, the certificate authority fetches the token from the well-known path on the web server.',
                actorSource: 'ca',
                actorTarget: 'webserver',
                explanation: 'The client publishes the key authorization at /.well-known/acme-challenge/<token>; the authority retrieves it over plain HTTP on port 80 and compares it with the expected value to prove control of the domain.',
                packetInfo: {
                    id: 'acme-pkt-2',
                    source: 'ACME Server',
                    destination: 'Web Server:80',
                    type: 'HTTP GET (Challenge Probe)',
                    summary: 'GET /.well-known/acme-challenge/ token matched | authorization valid',
                    payload: { path: '/.well-known/acme-challenge/token', host: 'www.example.com', result: 'valid' }
                }
            },
            {
                step: 3,
                title: 'Finalize Order and Download Certificate',
                description: 'The client posts its CSR to the finalize URL, polls the order until it is ready, then downloads the issued certificate chain.',
                actorSource: 'agent',
                actorTarget: 'ca',
                explanation: 'The finalize request binds the validated identifiers to the public key in the CSR, and the returned PEM chain is installed on the web server.',
                packetInfo: {
                    id: 'acme-pkt-3',
                    source: 'ACME Client',
                    destination: 'ca.example.net:443',
                    type: 'HTTPS POST /finalize',
                    summary: 'Order status: valid | Certificate chain downloaded',
                    payload: { orderStatus: 'valid', certificate: 'PEM chain', identifiers: ['www.example.com'] }
                }
            }
        ],
        liveSandboxType: 'generic-simulator',
        quiz: [
            {
                id: 'acme-q1',
                question: 'What must an ACME client do to satisfy the http-01 challenge for a domain?',
                options: [
                    'Serve a key authorization token under /.well-known/acme-challenge/',
                    'Publish a DKIM public key in a DNS TXT record',
                    'Open TCP port 25 and accept a verification email',
                    'Sign the CSR with the certificate authority private key'
                ],
                correctAnswer: 0,
                explanation: 'In http-01 the authority fetches a token file from the well-known ACME path on port 80 and checks that it matches the key authorization derived from the account key.'
            },
            {
                id: 'acme-q2',
                question: 'Which RFC specifies the ACME protocol?',
                options: ['RFC 6749', 'RFC 8555', 'RFC 7208', 'RFC 4033'],
                correctAnswer: 1,
                explanation: 'ACME is standardized in RFC 8555, published in 2019, while RFC 6749 defines OAuth 2.0 and RFC 7208 defines SPF.'
            }
        ]
    },
    {
        id: 'oidc',
        slug: 'oidc',
        name: 'OpenID Connect',
        fullName: 'OpenID Connect Core 1.0',
        category: 'security',
        osiLayer: 'Application',
        port: '443 (HTTPS)',
        rfc: 'OpenID Connect Core 1.0',
        yearIntroduced: 2014,
        shortSummary: 'Identity layer on top of OAuth 2.0 that authenticates end users and returns signed identity claims.',
        description: 'OpenID Connect adds authentication to OAuth 2.0 authorization. A relying party sends the user to an OpenID Provider, receives an authorization code, and exchanges it for an ID token whose signature, issuer, audience, and nonce it verifies before trusting the identity.',
        keyFeatures: [
            'ID token implemented as a signed JSON Web Token with standard claims',
            'Discovery document at /.well-known/openid-configuration and published JWKS keys',
            'Authorization Code Flow with PKCE plus implicit and hybrid response types',
            'Standard scopes such as openid, profile, email, and optional UserInfo endpoint'
        ],
        useCases: ['Social login with Google, Microsoft, or Apple accounts', 'Single sign-on across SaaS applications through a central identity provider', 'Mobile and single-page apps that need verified user identity tokens'],
        pros: ['Simple JSON and JWT formats that are easy for web and mobile clients to consume', 'Built directly on OAuth 2.0, so one token stack covers authorization and identity'],
        cons: ['Clients must carefully validate issuer, audience, signature, and nonce or they accept forged tokens', 'Implicit flow and loose redirect URI rules have caused real-world token leaks'],
        actors: [
            { id: 'rp', label: 'Relying Party (Web App)', icon: 'Globe', color: '#6366f1' },
            { id: 'op', label: 'OpenID Provider (Identity Server)', icon: 'ShieldCheck', color: '#10b981' },
            { id: 'user', label: 'End User Browser', icon: 'Laptop', color: '#f59e0b' }
        ],
        interactiveSteps: [
            {
                step: 1,
                title: 'Authentication Request Redirect',
                description: 'The relying party redirects the browser to the provider authorization endpoint with the openid scope, state, and nonce parameters.',
                actorSource: 'rp',
                actorTarget: 'user',
                explanation: 'The openid scope marks the request as authentication rather than plain authorization, and the nonce binds the eventual ID token to this browser session.',
                packetInfo: {
                    id: 'oidc-pkt-1',
                    source: 'Relying Party',
                    destination: 'Browser',
                    type: 'HTTP 302 (Authorization Request)',
                    summary: 'scope=openid profile email | response_type=code | nonce=n-0S6_WzA2Mj',
                    payload: { client_id: 'web-app-01', redirect_uri: 'https://app.example.com/callback', scope: 'openid profile email', response_type: 'code' }
                }
            },
            {
                step: 2,
                title: 'User Authentication and Authorization Code',
                description: 'The user authenticates at the provider, which redirects back to the relying party with a short-lived authorization code and the original state value.',
                actorSource: 'user',
                actorTarget: 'op',
                explanation: 'The provider authenticates the user, obtains consent for the requested scopes, and returns a one-time code; the state parameter lets the client detect cross-site request forgery.',
                packetInfo: {
                    id: 'oidc-pkt-2',
                    source: 'Browser',
                    destination: 'provider.example.com/authorize',
                    type: 'HTTP POST (Login and Consent)',
                    summary: 'User authenticated with MFA | 302 redirect with code and state',
                    payload: { authenticated: true, code: 'SplxlOBeZQQYbYS6WxSbIA', state: 'af0ifjsldkj', mfaUsed: true }
                }
            },
            {
                step: 3,
                title: 'Token Exchange and ID Token Validation',
                description: 'The relying party posts the code with its client credentials to the token endpoint and validates the returned ID token before creating a session.',
                actorSource: 'rp',
                actorTarget: 'op',
                explanation: 'The client checks the JWT signature against the provider JWKS, then verifies iss, aud, exp, and nonce; only after that does it read the subject and profile claims.',
                packetInfo: {
                    id: 'oidc-pkt-3',
                    source: 'Relying Party',
                    destination: 'provider.example.com/token',
                    type: 'HTTPS POST (Token Request)',
                    summary: 'grant_type=authorization_code | ID token signature valid | session created',
                    payload: { grant_type: 'authorization_code', id_token: 'eyJhbGciOiJSUzI1NiJ9...', token_type: 'Bearer' }
                }
            }
        ],
        liveSandboxType: 'generic-simulator',
        quiz: [
            {
                id: 'oidc-q1',
                question: 'Which scope value must be present for an OpenID Connect request to act as an authentication request?',
                options: ['profile', 'email', 'openid', 'offline_access'],
                correctAnswer: 2,
                explanation: 'The openid scope is what distinguishes an OpenID Connect authentication request from a plain OAuth 2.0 authorization request.'
            },
            {
                id: 'oidc-q2',
                question: 'What is the purpose of the nonce parameter in an OpenID Connect authentication request?',
                options: [
                    'It encrypts the ID token payload for confidentiality',
                    'It binds the ID token to the client session and mitigates replay',
                    'It selects the signing algorithm used by the provider',
                    'It specifies the token lifetime in seconds'
                ],
                correctAnswer: 1,
                explanation: 'The provider copies the nonce into the ID token, so the client can confirm the token was issued for its own request and reject replayed tokens.'
            }
        ]
    },
    {
        id: 'radius',
        slug: 'radius',
        name: 'RADIUS',
        fullName: 'Remote Authentication Dial-In User Service',
        category: 'security',
        osiLayer: 'Application',
        port: 'UDP 1812 (auth) / 1813 (accounting)',
        rfc: 'RFC 2865 / 2866',
        yearIntroduced: 2000,
        shortSummary: 'Centralized AAA protocol for authenticating, authorizing, and accounting for network access sessions.',
        description: 'RADIUS centralizes authentication, authorization, and accounting for dial-in, VPN, Wi-Fi, and switch access. A network access server forwards user credentials to a central RADIUS server, then applies the returned attributes such as an IP address, VLAN, or session timeout to the connection.',
        keyFeatures: [
            'AAA model covering authentication, authorization, and accounting in one protocol',
            'Attribute-value pairs such as Framed-IP-Address, Session-Timeout, and Filter-Id',
            'User-Password hidden with MD5 over the shared secret and request authenticator',
            'Accounting Start, Interim-Update, and Stop records on UDP port 1813'
        ],
        useCases: ['Enterprise Wi-Fi 802.1X authentication against a central user directory', 'VPN and dial-up remote access authorization', 'ISP and campus session accounting and quota enforcement'],
        pros: ['One central policy store for thousands of access devices', 'Widely supported by switches, wireless controllers, VPNs, and directories'],
        cons: ['Only the password field is hidden; the rest of the attributes travel in clear text', 'UDP transport means no delivery guarantee and only a modest 4096-byte packet limit'],
        actors: [
            { id: 'user', label: 'Remote User', icon: 'Laptop', color: '#6366f1' },
            { id: 'nas', label: 'Network Access Server', icon: 'Network', color: '#f59e0b' },
            { id: 'server', label: 'RADIUS Server', icon: 'ShieldCheck', color: '#10b981' }
        ],
        interactiveSteps: [
            {
                step: 1,
                title: 'Access-Request with User Credentials',
                description: 'The network access server sends an Access-Request on UDP 1812 containing the user name, the hidden password, and NAS identification attributes.',
                actorSource: 'nas',
                actorTarget: 'server',
                explanation: 'The password is XORed with an MD5 hash of the shared secret and the request authenticator, so it is never sent in clear text on the wire.',
                packetInfo: {
                    id: 'radius-pkt-1',
                    source: 'NAS 198.51.100.10:49152',
                    destination: 'RADIUS 203.0.113.20:1812',
                    type: 'Access-Request',
                    summary: 'User-Name=alice | User-Password hidden | NAS-IP-Address=198.51.100.10',
                    payload: { userName: 'alice', nasIpAddress: '198.51.100.10', nasPortType: 'Wireless-802.11', passwordHidden: true }
                }
            },
            {
                step: 2,
                title: 'Access-Accept with Authorization Attributes',
                description: 'The server validates the credentials and returns Access-Accept carrying the session policy that the NAS must enforce.',
                actorSource: 'server',
                actorTarget: 'nas',
                explanation: 'Authorization is expressed as attribute-value pairs, for example a VLAN, a static IP address, and a maximum session time, and the response is authenticated with the shared secret.',
                packetInfo: {
                    id: 'radius-pkt-2',
                    source: 'RADIUS 203.0.113.20:1812',
                    destination: 'NAS 198.51.100.10:49152',
                    type: 'Access-Accept',
                    summary: 'Framed-IP-Address=198.51.100.77 | Session-Timeout=28800 | Filter-Id=staff-acl',
                    payload: { replyCode: 'Access-Accept', framedIpAddress: '198.51.100.77', sessionTimeout: 28800, filterId: 'staff-acl' }
                }
            },
            {
                step: 3,
                title: 'Accounting Start on UDP 1813',
                description: 'Once the session is up, the NAS sends an Accounting-Request with Acct-Status-Type=Start and later a Stop record when the user disconnects.',
                actorSource: 'nas',
                actorTarget: 'server',
                explanation: 'Accounting records use a separate UDP port and carry byte counts and session duration, which the server uses for billing, quotas, and audit trails.',
                packetInfo: {
                    id: 'radius-pkt-3',
                    source: 'NAS 198.51.100.10:49153',
                    destination: 'RADIUS 203.0.113.20:1813',
                    type: 'Accounting-Request (Start)',
                    summary: 'Acct-Status-Type=Start | Acct-Session-Id=0004A1B2 | later Stop with byte counters',
                    payload: { acctStatusType: 'Start', acctSessionId: '0004A1B2', acctSessionTime: 0, acctInputOctets: 0 }
                }
            }
        ],
        liveSandboxType: 'generic-simulator',
        quiz: [
            {
                id: 'radius-q1',
                question: 'Which transport and default ports does RADIUS use for authentication and accounting?',
                options: ['TCP 1812 and 1813', 'UDP 1812 and 1813', 'TCP 389 and 636', 'UDP 500 and 4500'],
                correctAnswer: 1,
                explanation: 'RFC 2865 authentication runs over UDP 1812 and RFC 2866 accounting over UDP 1813, with no TCP fallback defined by the base specifications.'
            },
            {
                id: 'radius-q2',
                question: 'How does RADIUS protect the User-Password attribute in an Access-Request?',
                options: [
                    'It is encrypted end to end with TLS 1.3',
                    'It is hashed with bcrypt before transmission',
                    'It is XORed with an MD5 hash of the shared secret and request authenticator',
                    'It is sent in clear text and protected only by the link layer'
                ],
                correctAnswer: 2,
                explanation: 'RADIUS hides the password by XORing it with an MD5 digest computed over the shared secret and the random request authenticator, which defeats simple eavesdropping but not shared-secret compromise.'
            }
        ]
    },
    {
        id: 'dot1x',
        slug: 'dot1x',
        name: 'IEEE 802.1X',
        fullName: 'IEEE 802.1X Port-Based Network Access Control',
        category: 'security',
        osiLayer: 'Data Link',
        rfc: 'IEEE 802.1X',
        yearIntroduced: 2001,
        shortSummary: 'Port-based access control standard that blocks LAN and Wi-Fi access until the attached device authenticates.',
        description: 'IEEE 802.1X controls access to a wired or wireless LAN port until the attached device authenticates. The switch or access point acts as an authenticator, relays EAP messages to a RADIUS server, and opens the port only after the authentication server returns a success.',
        keyFeatures: [
            'Three roles: supplicant, authenticator, and authentication server',
            'EAPoL frames carried directly over Ethernet with EtherType 0x888E',
            'EAP relay mode forwards EAP between the supplicant and the RADIUS server',
            'Controlled and uncontrolled ports, with only EAPoL allowed before authorization'
        ],
        useCases: ['Wired wall-port authentication on enterprise switches', 'WPA2 and WPA3 enterprise Wi-Fi using EAP methods', 'Guest and device onboarding with dynamic VLAN assignment'],
        pros: ['Blocks rogue devices before they obtain a usable network address', 'Central policy and logging through the existing RADIUS infrastructure'],
        cons: ['Requires supplicant configuration or certificates on every endpoint', 'Misconfigured or unreachable RADIUS servers can lock out wired access'],
        actors: [
            { id: 'supplicant', label: 'Supplicant (Laptop)', icon: 'Laptop', color: '#6366f1' },
            { id: 'authenticator', label: 'Authenticator (Switch / AP)', icon: 'Network', color: '#f59e0b' },
            { id: 'authServer', label: 'Authentication Server (RADIUS)', icon: 'ShieldCheck', color: '#10b981' }
        ],
        interactiveSteps: [
            {
                step: 1,
                title: 'EAPOL-Start and Identity Exchange',
                description: 'The supplicant announces itself with an EAPOL-Start frame, and the switch replies with an EAP-Request/Identity that the client answers.',
                actorSource: 'supplicant',
                actorTarget: 'authenticator',
                explanation: 'Only EAPoL traffic is allowed through the uncontrolled port at this stage, so the device has no normal LAN connectivity yet.',
                packetInfo: {
                    id: 'dot1x-pkt-1',
                    source: 'Supplicant MAC 00:1A:2B:3C:4D:5E',
                    destination: 'Switch (PAE group address 01:80:C2:00:00:03)',
                    type: 'EAPOL-Start / EAP-Response-Identity',
                    summary: 'EtherType 0x888E | Identity=alice@corp.example | port still unauthorized',
                    payload: { etherType: '0x888E', eapCode: 'Response', eapType: 'Identity', identity: 'alice@corp.example' }
                }
            },
            {
                step: 2,
                title: 'EAP Relay to the RADIUS Server',
                description: 'The switch copies the EAP-Response into the EAP-Message attribute of a RADIUS Access-Request and forwards it to the authentication server.',
                actorSource: 'authenticator',
                actorTarget: 'authServer',
                explanation: 'In EAP relay the authenticator does not terminate the EAP method; it passes EAP packets through unchanged, which lets the server run TLS, TTLS, or PEAP with the supplicant.',
                packetInfo: {
                    id: 'dot1x-pkt-2',
                    source: 'Switch 198.51.100.2:49152',
                    destination: 'RADIUS 203.0.113.20:1812',
                    type: 'Access-Request (EAP-Message)',
                    summary: 'EAP-Message carries EAP-Response/Identity | Message-Authenticator present',
                    payload: { radiusCode: 'Access-Request', eapMessage: 'EAP-Response/Identity', messageAuthenticator: true, nasPortType: 'Ethernet' }
                }
            },
            {
                step: 3,
                title: 'Access-Accept and Port Authorization',
                description: 'The server completes the EAP exchange, returns Access-Accept with EAP-Success, and the switch moves the port to the authorized state.',
                actorSource: 'authServer',
                actorTarget: 'authenticator',
                explanation: 'The switch installs the returned authorization attributes, such as a VLAN or ACL, and begins forwarding normal traffic from the now authenticated device.',
                packetInfo: {
                    id: 'dot1x-pkt-3',
                    source: 'RADIUS 203.0.113.20:1812',
                    destination: 'Switch 198.51.100.2:49152',
                    type: 'Access-Accept (EAP-Success)',
                    summary: 'EAP-Success relayed to supplicant | port authorized | VLAN 20 assigned',
                    payload: { radiusCode: 'Access-Accept', eapCode: 'Success', tunnelType: 'VLAN', tunnelPrivateGroupId: 20 }
                }
            }
        ],
        liveSandboxType: 'generic-simulator',
        quiz: [
            {
                id: 'dot1x-q1',
                question: 'Which three roles participate in an IEEE 802.1X authentication?',
                options: [
                    'Client, proxy, and cache',
                    'Supplicant, authenticator, and authentication server',
                    'Registrar, registry, and resolver',
                    'Initiator, responder, and gateway'
                ],
                correctAnswer: 1,
                explanation: 'The supplicant is the device requesting access, the authenticator is the switch or access point controlling the port, and the authentication server is typically a RADIUS server.'
            },
            {
                id: 'dot1x-q2',
                question: 'What does EAP relay mode mean for the authenticator?',
                options: [
                    'It terminates the EAP method locally and validates the password itself',
                    'It forwards EAP packets between the supplicant and the RADIUS server without interpreting the method',
                    'It converts EAP into HTTP before sending it to the server',
                    'It encrypts all EAP frames with the switch management key'
                ],
                correctAnswer: 1,
                explanation: 'With EAP relay the switch tunnels EAP messages inside RADIUS EAP-Message attributes, so the authentication server, not the switch, runs the actual EAP method.'
            }
        ]
    },
    {
        id: 'dnssec',
        slug: 'dnssec',
        name: 'DNSSEC',
        fullName: 'Domain Name System Security Extensions',
        category: 'security',
        osiLayer: 'Application',
        port: 53,
        rfc: 'RFC 4033 / 4034 / 4035',
        yearIntroduced: 2005,
        shortSummary: 'Set of DNS extensions that sign zone data so resolvers can verify origin and integrity of answers.',
        description: 'DNSSEC adds digital signatures to DNS data so a resolver can prove that an answer really came from the authoritative zone and was not altered in transit. It provides origin authentication and integrity, but it does not encrypt queries or responses.',
        keyFeatures: [
            'RRSIG records carrying a cryptographic signature over each resource record set',
            'DNSKEY records holding the zone signing keys, with KSK and ZSK roles',
            'DS records in the parent zone that link a child zone into the chain of trust',
            'Authenticated denial of existence through NSEC or NSEC3 records'
        ],
        useCases: ['Protecting banks and governments against DNS cache poisoning', 'Validating resolver deployments such as Unbound or BIND', 'Securing mail and service discovery records against tampering'],
        pros: ['Detects forged or modified DNS answers before applications use them', 'Backward compatible, since unsigned zones still resolve without validation'],
        cons: ['Does not provide confidentiality, so queries and answers remain readable', 'Key rollover and chain-of-trust mistakes can make an entire zone unreachable'],
        actors: [
            { id: 'stub', label: 'Stub Resolver (Client)', icon: 'Laptop', color: '#6366f1' },
            { id: 'resolver', label: 'Validating Recursive Resolver', icon: 'Server', color: '#f59e0b' },
            { id: 'auth', label: 'Authoritative Nameserver', icon: 'ShieldCheck', color: '#10b981' }
        ],
        interactiveSteps: [
            {
                step: 1,
                title: 'Client Query with the DO Bit',
                description: 'The stub resolver asks its recursive resolver for an A record and sets the DNSSEC OK bit in the EDNS0 header.',
                actorSource: 'stub',
                actorTarget: 'resolver',
                explanation: 'The DO bit tells the recursive resolver that the client can accept DNSSEC records, so signatures should be requested along with the answer.',
                packetInfo: {
                    id: 'dnssec-pkt-1',
                    source: 'Client 192.0.2.50:5353',
                    destination: 'Resolver 198.51.100.53:53',
                    type: 'DNS Query (A www.example.com)',
                    summary: 'EDNS0 DO=1 | Checking Disabled=0 | recursion desired',
                    payload: { qname: 'www.example.com', qtype: 'A', doBit: true, ednsPayload: 1232 }
                }
            },
            {
                step: 2,
                title: 'Iterative Query to the Authoritative Server',
                description: 'The validating resolver walks the delegation chain and queries the authoritative nameserver for the record set with DNSSEC records requested.',
                actorSource: 'resolver',
                actorTarget: 'auth',
                explanation: 'The resolver first obtains the DS record from the parent zone, then fetches the child DNSKEY so it can verify the zone signing key.',
                packetInfo: {
                    id: 'dnssec-pkt-2',
                    source: 'Resolver 198.51.100.53:41234',
                    destination: 'Authoritative 203.0.113.53:53',
                    type: 'DNS Query (A, DO=1)',
                    summary: 'Query www.example.com A | DO=1 | CD=0',
                    payload: { qname: 'www.example.com', qtype: 'A', doBit: true, checkingDisabled: false }
                }
            },
            {
                step: 3,
                title: 'Signature Validation and Secure Answer',
                description: 'The authoritative server returns the A record with its RRSIG, and the resolver validates the signature up to the trust anchor before answering the client.',
                actorSource: 'auth',
                actorTarget: 'resolver',
                explanation: 'The resolver hashes the RRset, checks the RRSIG with the zone DNSKEY, and confirms that key through the parent DS chain; any mismatch produces SERVFAIL instead of a forged answer.',
                packetInfo: {
                    id: 'dnssec-pkt-3',
                    source: 'Authoritative 203.0.113.53:53',
                    destination: 'Resolver 198.51.100.53:41234',
                    type: 'DNS Response (A + RRSIG)',
                    summary: 'A 203.0.113.80 | RRSIG valid | AD bit set in client response',
                    payload: { answer: '203.0.113.80', rrsigAlgorithm: 'ECDSA P-256 SHA-256', validation: 'secure', authenticatedData: true }
                }
            }
        ],
        liveSandboxType: 'generic-simulator',
        quiz: [
            {
                id: 'dnssec-q1',
                question: 'Which security properties does DNSSEC provide for DNS data?',
                options: [
                    'Confidentiality and encryption of queries',
                    'Origin authentication and integrity of answers',
                    'Availability and load balancing across servers',
                    'Compression and caching of responses'
                ],
                correctAnswer: 1,
                explanation: 'DNSSEC signs records so a resolver can verify where an answer came from and that it was not modified, but it deliberately leaves the data unencrypted and readable.'
            },
            {
                id: 'dnssec-q2',
                question: 'Which record type stores the cryptographic signature over a resource record set?',
                options: ['DS', 'NSEC3', 'RRSIG', 'CNAME'],
                correctAnswer: 2,
                explanation: 'An RRSIG record holds the signature over one RRset, while DS records in the parent zone delegate trust to a child zone key.'
            }
        ]
    },
    {
        id: 'spf',
        slug: 'spf',
        name: 'SPF',
        fullName: 'Sender Policy Framework',
        category: 'security',
        osiLayer: 'Application',
        port: '25 (SMTP) / 53 (DNS TXT)',
        rfc: 'RFC 7208',
        yearIntroduced: 2014,
        shortSummary: 'Email authentication method that publishes which hosts are authorized to send mail for a domain.',
        description: 'SPF lets a domain owner publish the mail servers that are allowed to send mail for that domain. The receiving mail server checks the SMTP envelope sender against the published policy and uses the result to reject, flag, or accept the message.',
        keyFeatures: [
            'Policy published as a single DNS TXT record beginning with v=spf1',
            'Mechanisms such as ip4, ip6, a, mx, include, and exists',
            'Qualifiers +, -, ~, and ? that set pass, fail, softfail, and neutral results',
            'Evaluation limited to 10 DNS lookups to bound resolver work'
        ],
        useCases: ['Reducing forged sender addresses in inbound mail filtering', 'Aligning authorized sending services such as newsletters and CRMs', 'Combining with DKIM and DMARC for domain-level mail policy'],
        pros: ['Simple to publish and cheap to evaluate at the receiving gateway', 'Directly blocks many spoofed envelope senders before content filtering'],
        cons: ['Breaks when mail is forwarded, because the envelope sender no longer matches the sending host', 'Does not protect the visible From header and is ineffective without DMARC alignment'],
        actors: [
            { id: 'sender', label: 'Sending MTA', icon: 'Server', color: '#6366f1' },
            { id: 'receiver', label: 'Receiving MTA', icon: 'ShieldCheck', color: '#10b981' },
            { id: 'dns', label: 'Authoritative DNS', icon: 'Globe', color: '#f59e0b' }
        ],
        interactiveSteps: [
            {
                step: 1,
                title: 'SMTP Envelope Sender Presented',
                description: 'The sending MTA connects to the receiving MTA and declares the envelope sender in the MAIL FROM command.',
                actorSource: 'sender',
                actorTarget: 'receiver',
                explanation: 'SPF evaluates the envelope sender, also called the Return-Path, and not the From header that the recipient sees in the mail client.',
                packetInfo: {
                    id: 'spf-pkt-1',
                    source: 'Sending MTA 203.0.113.25:51234',
                    destination: 'Receiving MTA 198.51.100.25:25',
                    type: 'SMTP MAIL FROM',
                    summary: 'EHLO mail.example.com | MAIL FROM:<bounce@example.com>',
                    payload: { helo: 'mail.example.com', mailFrom: 'bounce@example.com', clientIp: '203.0.113.25' }
                }
            },
            {
                step: 2,
                title: 'DNS TXT Policy Lookup',
                description: 'The receiving MTA queries the authoritative DNS for TXT records of the envelope sender domain and retrieves the SPF policy.',
                actorSource: 'receiver',
                actorTarget: 'dns',
                explanation: 'The policy is a single TXT string such as v=spf1 ip4:203.0.113.0/24 -all, and only one SPF record may exist for a domain or the result becomes permerror.',
                packetInfo: {
                    id: 'spf-pkt-2',
                    source: 'Receiving MTA',
                    destination: 'Authoritative DNS 192.0.2.53:53',
                    type: 'DNS Query (TXT example.com)',
                    summary: 'TXT "v=spf1 ip4:203.0.113.0/24 include:_spf.provider.net -all"',
                    payload: { qname: 'example.com', qtype: 'TXT', record: 'v=spf1 ip4:203.0.113.0/24 include:_spf.provider.net -all' }
                }
            },
            {
                step: 3,
                title: 'Mechanism Evaluation and SMTP Verdict',
                description: 'The receiving MTA evaluates the mechanisms in order, matches the client IP, and applies the result to the SMTP transaction.',
                actorSource: 'receiver',
                actorTarget: 'sender',
                explanation: 'A match on ip4 yields pass, while falling through to -all yields fail; the receiver can then reject with a 550 reply or add an Authentication-Results header.',
                packetInfo: {
                    id: 'spf-pkt-3',
                    source: 'Receiving MTA',
                    destination: 'Sending MTA',
                    type: 'SMTP Reply (250 or 550)',
                    summary: 'SPF result: pass | Authentication-Results: spf=pass smtp.mailfrom=example.com',
                    payload: { spfResult: 'pass', matchedMechanism: 'ip4:203.0.113.0/24', smtpReply: '250 2.0.0 Ok' }
                }
            }
        ],
        liveSandboxType: 'generic-simulator',
        quiz: [
            {
                id: 'spf-q1',
                question: 'Where does a domain publish its SPF policy?',
                options: ['In a DNS TXT record', 'In a DNS MX record', 'In the SMTP banner', 'In a WHOIS entry'],
                correctAnswer: 0,
                explanation: 'SPF is published as a TXT record whose value starts with v=spf1, and receivers retrieve it through a normal DNS query.'
            },
            {
                id: 'spf-q2',
                question: 'Which sender identity does SPF check against the published policy?',
                options: [
                    'The visible From header shown in the mail client',
                    'The envelope sender from the SMTP MAIL FROM command',
                    'The Message-ID domain',
                    'The recipient address in RCPT TO'
                ],
                correctAnswer: 1,
                explanation: 'SPF validates the envelope sender, also known as the Return-Path, which is why forwarded mail often fails SPF even when the visible From header is legitimate.'
            }
        ]
    }
];
