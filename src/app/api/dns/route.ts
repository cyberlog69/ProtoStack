import { NextRequest, NextResponse } from 'next/server';
import dns from 'dns/promises';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name') || 'google.com';
  const type = (searchParams.get('type') || 'A').toUpperCase();

  const start = performance.now();

  try {
    let answers: any[] = [];

    switch (type) {
      case 'A': {
        const addresses = await dns.resolve4(name);
        answers = addresses.map((addr) => ({ name, type: 1, TTL: 300, data: addr }));
        break;
      }
      case 'AAAA': {
        const addresses = await dns.resolve6(name);
        answers = addresses.map((addr) => ({ name, type: 28, TTL: 300, data: addr }));
        break;
      }
      case 'MX': {
        const mxRecords = await dns.resolveMx(name);
        answers = mxRecords.map((mx) => ({ name, type: 15, TTL: 300, data: `${mx.priority} ${mx.exchange}` }));
        break;
      }
      case 'TXT': {
        const txtRecords = await dns.resolveTxt(name);
        answers = txtRecords.map((txt) => ({ name, type: 16, TTL: 300, data: txt.join(' ') }));
        break;
      }
      case 'CNAME': {
        const cnames = await dns.resolveCname(name);
        answers = cnames.map((c) => ({ name, type: 5, TTL: 300, data: c }));
        break;
      }
      case 'NS': {
        const nsRecords = await dns.resolveNs(name);
        answers = nsRecords.map((ns) => ({ name, type: 2, TTL: 86400, data: ns }));
        break;
      }
      default: {
        const addresses = await dns.resolve4(name);
        answers = addresses.map((addr) => ({ name, type: 1, TTL: 300, data: addr }));
      }
    }

    const end = performance.now();
    const latencyMs = Math.round(end - start);

    return NextResponse.json({
      Status: 0,
      TC: false,
      RD: true,
      RA: true,
      AD: true,
      CD: false,
      Question: [{ name, type }],
      Answer: answers,
      latencyMs
    });
  } catch (error: any) {
    const end = performance.now();
    return NextResponse.json(
      {
        Status: 2,
        error: error.message || 'DNS resolution failed',
        Question: [{ name, type }],
        Answer: [],
        latencyMs: Math.round(end - start)
      },
      { status: 200 }
    );
  }
}
