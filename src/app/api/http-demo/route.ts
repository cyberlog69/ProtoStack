import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const MAX_BODY_BYTES = 16 * 1024;

async function echo(request: NextRequest, method: string) {
  const started = performance.now();
  let body = '';

  if (!['GET', 'HEAD', 'DELETE'].includes(method)) {
    const text = await request.text();
    body = text.slice(0, MAX_BODY_BYTES);
  }

  const path = request.nextUrl.pathname;
  const query = Object.fromEntries(request.nextUrl.searchParams.entries());
  const requestHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    // Do not echo infrastructure cookies or authorization headers back.
    if (['cookie', 'authorization', 'proxy-authorization'].includes(key.toLowerCase())) return;
    requestHeaders[key] = value;
  });

  const status = method === 'POST' ? 201 : 200;

  return NextResponse.json(
    {
      status,
      statusText: method === 'POST' ? 'Created' : 'OK',
      timeMs: Math.round(performance.now() - started),
      finalUrl: request.nextUrl.toString(),
      truncated: false,
      bytes: new TextEncoder().encode(body).byteLength,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
        'x-protostack-echo': 'true',
        'x-protostack-method': method,
      },
      body: {
        message: `Local echo endpoint received HTTP ${method}.`,
        method,
        path,
        query,
        requestHeaders,
        requestBody: body || null,
        handledAt: new Date().toISOString(),
      },
    },
    {
      status,
      headers: {
        'Cache-Control': 'no-store',
        'X-Protostack-Echo': 'true',
      },
    },
  );
}

export async function GET(request: NextRequest) {
  return echo(request, 'GET');
}

export async function HEAD(request: NextRequest) {
  return echo(request, 'HEAD');
}

export async function POST(request: NextRequest) {
  return echo(request, 'POST');
}

export async function PUT(request: NextRequest) {
  return echo(request, 'PUT');
}

export async function PATCH(request: NextRequest) {
  return echo(request, 'PATCH');
}

export async function DELETE(request: NextRequest) {
  return echo(request, 'DELETE');
}
