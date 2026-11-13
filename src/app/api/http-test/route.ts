import { NextRequest, NextResponse } from 'next/server';
import { getClientIp, rateLimit, rateLimitHeaders } from '@/lib/rate-limit';
import { getAllowedTargetHosts, validateOutboundUrl } from '@/lib/url-safety';

export const dynamic = 'force-dynamic';

const ALLOWED_METHODS = new Set(['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE']);
const MAX_RESPONSE_BYTES = 64 * 1024;
const MAX_REQUEST_BYTES = 16 * 1024;
const REQUEST_TIMEOUT_MS = 5000;
const MAX_REDIRECTS = 3;

const BLOCKED_REQUEST_HEADERS = new Set([
  'host',
  'content-length',
  'connection',
  'transfer-encoding',
  'upgrade',
  'keep-alive',
  'te',
  'trailer',
  'proxy-connection',
  // Never forward caller credentials to a third-party allowlisted host.
  'cookie',
  'authorization',
  'proxy-authorization',
]);

function errorResponse(message: string, status: number, extra?: Record<string, unknown>) {
  return NextResponse.json(
    { error: message, ...extra },
    { status, headers: { 'Cache-Control': 'no-store' } },
  );
}

async function readLimited(response: Response): Promise<{ text: string; truncated: boolean; bytes: number }> {
  const body = response.body;
  if (!body) return { text: '', truncated: false, bytes: 0 };

  const reader = body.getReader();
  const decoder = new TextDecoder();
  let received = 0;
  let text = '';
  let truncated = false;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      received += value.byteLength;

      if (received > MAX_RESPONSE_BYTES) {
        const remaining = Math.max(0, value.byteLength - (received - MAX_RESPONSE_BYTES));
        text += decoder.decode(value.subarray(0, remaining));
        truncated = true;
        await reader.cancel();
        break;
      }

      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
  } finally {
    reader.releaseLock();
  }

  return { text, truncated, bytes: received };
}

export async function POST(request: NextRequest) {
  const rate = rateLimit(`http-test:${getClientIp(request.headers)}`, 12, 60_000);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: 'Too many outbound test requests. Try again shortly.' },
      { status: 429, headers: { ...rateLimitHeaders(rate), 'Cache-Control': 'no-store' } },
    );
  }

  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return errorResponse('Request body must be valid JSON.', 400);
  }

  const rawUrl = typeof payload.url === 'string' ? payload.url : '';
  const method = (typeof payload.method === 'string' ? payload.method : 'GET').toUpperCase();
  const rawHeaders = payload.headers && typeof payload.headers === 'object' ? payload.headers : {};
  const body = payload.body;

  if (!rawUrl) return errorResponse('A "url" field is required.', 400);
  if (!ALLOWED_METHODS.has(method)) {
    return errorResponse(`Method ${method} is not allowed.`, 400);
  }

  const headers: Record<string, string> = {
    'User-Agent': 'ProtoStack/1.0 (Safe HTTP Request Bench)',
    Accept: '*/*',
  };

  for (const [name, value] of Object.entries(rawHeaders as Record<string, unknown>)) {
    const key = name.toLowerCase();
    if (BLOCKED_REQUEST_HEADERS.has(key) || typeof value !== 'string') continue;
    if (value.length > 1024) continue;
    headers[name] = value;
  }

  let serializedBody: string | undefined;
  if (body !== undefined && ['POST', 'PUT', 'PATCH'].includes(method)) {
    serializedBody = typeof body === 'string' ? body : JSON.stringify(body);
    if (new TextEncoder().encode(serializedBody).byteLength > MAX_REQUEST_BYTES) {
      return errorResponse('Request body is larger than 16 KB.', 413);
    }
  }

  const start = performance.now();
  const allowedHosts = getAllowedTargetHosts();
  let currentUrl: URL;

  try {
    const validated = await validateOutboundUrl(rawUrl, allowedHosts);
    currentUrl = validated.parsedUrl;
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Invalid target URL.', 400);
  }

  try {
    for (let redirects = 0; redirects <= MAX_REDIRECTS; redirects += 1) {
      const response = await fetch(currentUrl, {
        method,
        headers,
        body: serializedBody,
        cache: 'no-store',
        redirect: 'manual',
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get('location');
        // Only follow redirects for safe methods; surface 3xx for writes so the
        // browser does not replay a mutating request against a new origin.
        if (location && (method === 'GET' || method === 'HEAD') && redirects < MAX_REDIRECTS) {
          const nextUrl = new URL(location, currentUrl);
          try {
            currentUrl = (await validateOutboundUrl(nextUrl.toString(), allowedHosts)).parsedUrl;
            continue;
          } catch (error) {
            return errorResponse(
              error instanceof Error ? `Blocked redirect: ${error.message}` : 'Blocked redirect.',
              502,
            );
          }
        }
      }

      const { text, truncated, bytes } = await readLimited(response);
      const contentType = response.headers.get('content-type') || '';
      let parsedBody: unknown = text;

      if (contentType.includes('application/json') && text) {
        try {
          parsedBody = JSON.parse(text);
        } catch {
          parsedBody = text;
        }
      }

      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      const timeMs = Math.round(performance.now() - start);

      return NextResponse.json(
        {
          status: response.status,
          statusText: response.statusText,
          timeMs,
          finalUrl: currentUrl.toString(),
          truncated,
          bytes,
          headers: responseHeaders,
          body: parsedBody,
        },
        { headers: { ...rateLimitHeaders(rate), 'Cache-Control': 'no-store' } },
      );
    }

    return errorResponse('Too many redirects.', 502);
  } catch (error) {
    const err = error as Error;
    const isTimeout = err.name === 'TimeoutError' || err.name === 'AbortError';
    return errorResponse(
      isTimeout
        ? `Target did not respond within ${REQUEST_TIMEOUT_MS / 1000} seconds.`
        : err.message || 'Network request failed.',
      isTimeout ? 504 : 502,
    );
  }
}
