import { isIP } from 'node:net';
import { lookup } from 'node:dns/promises';

export const DEFAULT_ALLOWED_TARGET_HOSTS = [
  'example.com',
  'www.example.com',
  'httpbin.org',
  'jsonplaceholder.typicode.com',
];

export function getAllowedTargetHosts(): Set<string> {
  const configured = process.env.HTTP_TEST_ALLOWED_HOSTS;
  const hosts = (configured ? configured.split(',') : DEFAULT_ALLOWED_TARGET_HOSTS)
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean);
  return new Set(hosts);
}

function isDisallowedIPv4(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return true;
  }

  const [a, b, c] = parts;
  return (
    a === 0 || // "this network"
    a === 10 || // RFC 1918
    a === 127 || // loopback
    (a === 100 && b >= 64 && b <= 127) || // CGNAT
    (a === 169 && b === 254) || // link-local / cloud metadata
    (a === 172 && b >= 16 && b <= 31) || // RFC 1918
    (a === 192 && b === 0 && c === 0) || // IETF protocol assignments
    (a === 192 && b === 0 && c === 2) || // TEST-NET-1
    (a === 192 && b === 168) || // RFC 1918
    (a === 198 && (b === 18 || b === 19)) || // benchmarking
    (a === 198 && b === 51 && c === 100) || // TEST-NET-2
    (a === 203 && b === 0 && c === 113) || // TEST-NET-3
    a >= 224 // multicast, reserved, broadcast
  );
}

function isDisallowedIPv6(rawIp: string): boolean {
  let ip = rawIp.toLowerCase();
  if (ip.startsWith('[') && ip.endsWith(']')) ip = ip.slice(1, -1);
  const [head] = ip.split('%');

  if (head === '::' || head === '::1') return true;

  // IPv4-mapped (::ffff:127.0.0.1) and IPv4-compatible addresses.
  const mapped = head.match(/^::(?:ffff:)?(\d{1,3}(?:\.\d{1,3}){3})$/);
  if (mapped) return isDisallowedIPv4(mapped[1]);

  return (
    head.startsWith('fc') || // unique local fc00::/7
    head.startsWith('fd') ||
    /^fe[89ab]/.test(head) || // link-local fe80::/10
    head.startsWith('ff') || // multicast
    head.startsWith('2001:db8') || // documentation
    head.startsWith('64:ff9b') // NAT64
  );
}

function parseNonStandardIPv4(hostname: string): string | null {
  const lower = hostname.toLowerCase();
  let value: number | null = null;

  if (/^0x[0-9a-f]+$/.test(lower)) {
    value = Number.parseInt(lower, 16);
  } else if (/^0[0-7]+$/.test(lower)) {
    value = Number.parseInt(lower, 8);
  } else if (/^\d+$/.test(lower)) {
    value = Number.parseInt(lower, 10);
  }

  if (value === null || !Number.isFinite(value) || value < 0 || value > 0xffffffff) {
    return null;
  }

  return `${(value >>> 24) & 255}.${(value >>> 16) & 255}.${(value >>> 8) & 255}.${value & 255}`;
}

function normalizeHostname(hostname: string): string {
  return hostname.toLowerCase().replace(/^\[|\]$/g, '').replace(/\.$/, '');
}

function isDisallowedHostname(hostname: string): boolean {
  // IP literals are classified by the address checks below. Without this
  // guard, bracketed IPv6 literals look like single-label hostnames.
  if (isIP(hostname) !== 0) return false;

  return (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal') ||
    hostname.endsWith('.lan') ||
    hostname.endsWith('.home') ||
    hostname.endsWith('.corp') ||
    !hostname.includes('.')
  );
}

export interface ValidatedTarget {
  url: string;
  hostname: string;
  addresses: string[];
}

/**
 * Validates an outbound HTTP(S) target before a server-side fetch.
 *
 * Defenses: scheme, credentials, host allowlist, port allowlist, encoded-IP
 * detection, private/reserved address checks, and DNS resolution checks.
 * Redirects must be re-validated by the caller because DNS can change between
 * validation and connection.
 */
export async function validateOutboundUrl(
  rawUrl: string,
  allowedHosts: Set<string> = getAllowedTargetHosts(),
): Promise<ValidatedTarget> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error('Invalid URL.');
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Only HTTP and HTTPS URLs are allowed.');
  }

  if (parsed.username || parsed.password) {
    throw new Error('URL credentials are not allowed.');
  }

  if (parsed.port && !['80', '443'].includes(parsed.port)) {
    throw new Error('Only ports 80 and 443 are allowed.');
  }

  const hostname = normalizeHostname(parsed.hostname);
  if (!hostname) throw new Error('Missing target host.');

  if (isDisallowedHostname(hostname)) {
    throw new Error('Local and single-label hostnames are not allowed.');
  }

  const encodedIPv4 = parseNonStandardIPv4(hostname);
  if (encodedIPv4 && isDisallowedIPv4(encodedIPv4)) {
    throw new Error('Private or reserved network targets are not allowed.');
  }

  const ipVersion = isIP(hostname);
  if (ipVersion === 4 && isDisallowedIPv4(hostname)) {
    throw new Error('Private or reserved network targets are not allowed.');
  }
  if (ipVersion === 6 && isDisallowedIPv6(hostname)) {
    throw new Error('Private or reserved network targets are not allowed.');
  }

  if (!allowedHosts.has(hostname)) {
    throw new Error(
      `Target host "${hostname}" is not on the allowlist. This deployment allows: ${[...allowedHosts].join(', ')}.`,
    );
  }

  let resolved: { address: string; family: number }[];
  try {
    resolved = await lookup(hostname, { all: true, verbatim: true });
  } catch {
    throw new Error(`Could not resolve target host "${hostname}".`);
  }

  if (resolved.length === 0) {
    throw new Error('Target host did not resolve to any address.');
  }

  for (const entry of resolved) {
    if (
      (entry.family === 4 && isDisallowedIPv4(entry.address)) ||
      (entry.family === 6 && isDisallowedIPv6(entry.address))
    ) {
      throw new Error('Target resolves to a private or reserved address.');
    }
  }

  // Preserve the port; drop the fragment.
  const canonical = new URL(parsed.toString());
  canonical.hash = '';

  return {
    url: canonical.toString(),
    parsedUrl: canonical,
    hostname,
    addresses: resolved.map((entry) => entry.address),
  };
}
