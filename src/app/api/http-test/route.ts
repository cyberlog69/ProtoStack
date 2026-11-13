import { NextRequest, NextResponse } from 'next/server';
import { lookup } from 'node:dns/promises';

function isPrivateOrLocalIPv4(ip: string): boolean {
  const parts = ip.split('.').map((p) => Number(p));
  if (parts.length !== 4 || parts.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) {
    return true;
  }

  const [a, b] = parts;
  return (
    a === 10 ||
    a === 127 ||
    a === 0 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168)
  );
}

function isPrivateOrLocalIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase();
  return (
    normalized === '::1' ||
    normalized === '::' ||
    normalized.startsWith('fc') ||
    normalized.startsWith('fd') ||
    normalized.startsWith('fe80:')
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

  const a = (value >>> 24) & 255;
  const b = (value >>> 16) & 255;
  const c = (value >>> 8) & 255;
  const d = value & 255;
  return `${a}.${b}.${c}.${d}`;
}

async function validateTargetUrl(rawUrl: string): Promise<string> {
  const parsed = new URL(rawUrl);

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Only HTTP(S) URLs are allowed.');
  }

  if (parsed.username || parsed.password) {
    throw new Error('URL credentials are not allowed.');
  }

  const hostname = parsed.hostname.toLowerCase();
  if (hostname === 'localhost' || hostname.endsWith('.localhost')) {
    throw new Error('Localhost targets are not allowed.');
  }

  const encodedIPv4 = parseNonStandardIPv4(hostname);
  if (encodedIPv4 && isPrivateOrLocalIPv4(encodedIPv4)) {
    throw new Error('Private or local network targets are not allowed.');
  }

  const resolved = await lookup(parsed.hostname, { all: true, verbatim: true });
  for (const entry of resolved) {
    if (
      (entry.family === 4 && isPrivateOrLocalIPv4(entry.address)) ||
      (entry.family === 6 && isPrivateOrLocalIPv6(entry.address))
    ) {
      throw new Error('Private or local network targets are not allowed.');
    }
  }

  return parsed.toString();
}

export async function POST(request: NextRequest) {
  try {
    const { url, method = 'GET', headers = {}, body } = await request.json();

    const start = performance.now();
    const fetchOptions: RequestInit = {
      method,
      headers: {
        'User-Agent': 'ProtoStack/1.0 (Interactive Protocol Visualizer)',
        ...headers,
      },
      cache: 'no-store',
    };

    if (body && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
      fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    const safeUrl = await validateTargetUrl(url);
    const response = await fetch(safeUrl, fetchOptions);
    const end = performance.now();
    const timeMs = Math.round(end - start);

    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    let responseBody = '';
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      try {
        responseBody = await response.json();
      } catch {
        responseBody = await response.text();
      }
    } else {
      const text = await response.text();
      responseBody = text.slice(0, 2000); // truncate for preview
    }

    return NextResponse.json({
      status: response.status,
      statusText: response.statusText,
      timeMs,
      headers: responseHeaders,
      body: responseBody,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 500,
        statusText: 'Request Failed',
        error: error.message || 'Network error occurred',
      },
      { status: 200 }
    );
  }
}
