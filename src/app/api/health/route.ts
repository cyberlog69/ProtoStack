import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Liveness endpoint for containers, load balancers and managed platforms.
 * It deliberately exposes nothing about the host: no versions, paths or
 * environment values.
 */
export function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  );
}

export function HEAD() {
  return new NextResponse(null, {
    status: 200,
    headers: { 'Cache-Control': 'no-store' },
  });
}
