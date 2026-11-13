import { NextRequest, NextResponse } from 'next/server';
import dns from 'node:dns/promises';
import { getClientIp, rateLimit, rateLimitHeaders } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const RECORD_TYPES = ['A', 'AAAA', 'MX', 'TXT', 'CNAME', 'NS'] as const;
type RecordType = (typeof RECORD_TYPES)[number];

const BLOCKED_SUFFIXES = ['.local', '.internal', '.lan', '.home', '.corp', '.arpa'];

function normalizeDomain(raw: string): string {
  const name = raw.trim().toLowerCase().replace(/\.$/, '');
  if (!name || name.length > 253) {
    throw new Error('Enter a hostname between 1 and 253 characters.');
  }
  if (BLOCKED_SUFFIXES.some((suffix) => name.endsWith(suffix))) {
    throw new Error('Local and special-use DNS names are not allowed.');
  }
  if (!/^(?=.{1,253}$)(?!-)[a-z0-9-]{1,63}(?<!-)(\.(?!-)[a-z0-9-]{1,63}(?<!-))+$/.test(name)) {
    throw new Error('Enter a valid public hostname such as example.com.');
  }
  return name;
}

function withTimeout<T>(promise: Promise<T>, ms = 4000): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<T>((_, reject) => {
    timer = setTimeout(() => {
      const error = new Error('DNS query timed out.');
      (error as NodeJS.ErrnoException).code = 'ETIMEOUT';
      reject(error);
    }, ms);
  });

  return Promise.race([promise, timeout]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

function statusForError(error: NodeJS.ErrnoException): number {
  if (error.code === 'ENOTFOUND' || error.code === 'ENODATA') return 3; // NXDOMAIN
  return 2; // SERVFAIL
}

export async function GET(request: NextRequest) {
  const rate = rateLimit(`dns:${getClientIp(request.headers)}`, 30, 60_000);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: 'Too many DNS queries. Try again shortly.' },
      { status: 429, headers: { ...rateLimitHeaders(rate), 'Cache-Control': 'no-store' } },
    );
  }

  const { searchParams } = new URL(request.url);
  const rawName = searchParams.get('name') || '';
  const rawType = (searchParams.get('type') || 'A').toUpperCase();

  if (!RECORD_TYPES.includes(rawType as RecordType)) {
    return NextResponse.json(
      { error: `Unsupported record type. Use one of: ${RECORD_TYPES.join(', ')}.` },
      { status: 400, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  let name: string;
  try {
    name = normalizeDomain(rawName);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Invalid hostname.' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const type = rawType as RecordType;
  const start = performance.now();

  try {
    let answers: { name: string; type: number; TTL: number | null; data: string }[] = [];

    switch (type) {
      case 'A': {
        const records = await withTimeout(dns.resolve4(name, { ttl: true }));
        answers = records.map((record) => ({
          name,
          type: 1,
          TTL: record.ttl ?? null,
          data: record.address,
        }));
        break;
      }
      case 'AAAA': {
        const records = await withTimeout(dns.resolve6(name, { ttl: true }));
        answers = records.map((record) => ({
          name,
          type: 28,
          TTL: record.ttl ?? null,
          data: record.address,
        }));
        break;
      }
      case 'MX': {
        const records = await withTimeout(dns.resolveMx(name));
        answers = records.map((record) => ({
          name,
          type: 15,
          TTL: null,
          data: `${record.priority} ${record.exchange}`,
        }));
        break;
      }
      case 'TXT': {
        const records = await withTimeout(dns.resolveTxt(name));
        answers = records.map((chunks) => ({
          name,
          type: 16,
          TTL: null,
          data: chunks.join(' '),
        }));
        break;
      }
      case 'CNAME': {
        const records = await withTimeout(dns.resolveCname(name));
        answers = records.map((record) => ({ name, type: 5, TTL: null, data: record }));
        break;
      }
      case 'NS': {
        const records = await withTimeout(dns.resolveNs(name));
        answers = records.map((record) => ({ name, type: 2, TTL: null, data: record }));
        break;
      }
    }

    const latencyMs = Math.round(performance.now() - start);

    return NextResponse.json(
      {
        Status: 0,
        TC: false,
        RD: true,
        RA: true,
        // The local Node resolver does not validate DNSSEC or expose the AD flag.
        AD: false,
        ADVerified: false,
        Resolver: 'system-resolver',
        Question: [{ name, type }],
        Answer: answers,
        latencyMs,
      },
      {
        headers: {
          ...rateLimitHeaders(rate),
          'Cache-Control': 'no-store',
        },
      },
    );
  } catch (error) {
    const latencyMs = Math.round(performance.now() - start);
    const err = error as NodeJS.ErrnoException;
    return NextResponse.json(
      {
        Status: statusForError(err),
        AD: false,
        ADVerified: false,
        Resolver: 'system-resolver',
        error: err.code === 'ETIMEOUT' ? 'DNS query timed out after 4 seconds.' : err.message || 'DNS resolution failed.',
        Question: [{ name, type }],
        Answer: [],
        latencyMs,
      },
      {
        headers: {
          ...rateLimitHeaders(rate),
          'Cache-Control': 'no-store',
        },
      },
    );
  }
}
