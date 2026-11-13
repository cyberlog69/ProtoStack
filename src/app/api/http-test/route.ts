import { NextRequest, NextResponse } from 'next/server';

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

    const response = await fetch(url, fetchOptions);
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
