'use client';

import React, { useState } from 'react';
import { Globe, Send, AlertTriangle, Server } from 'lucide-react';

const METHODS = ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;
type Method = (typeof METHODS)[number];

const BODY_METHODS: Method[] = ['POST', 'PUT', 'PATCH'];

interface HttpResult {
  status: number;
  statusText: string;
  timeMs: number;
  finalUrl?: string;
  truncated?: boolean;
  bytes?: number;
  headers: Record<string, string>;
  body: unknown;
}

function isExternalTarget(target: string): boolean {
  return /^https?:\/\//i.test(target.trim());
}

export default function HttpSandbox() {
  const [method, setMethod] = useState<Method>('GET');
  const [url, setUrl] = useState('/api/http-demo');
  const [requestBody, setRequestBody] = useState('{"message": "hello from ProtoStack"}');
  const [response, setResponse] = useState<HttpResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    const target = url.trim();
    if (!target) {
      setError('Enter a local path or an allowed external URL.');
      return;
    }

    setIsLoading(true);
    setResponse(null);
    setError(null);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    const hasBody = BODY_METHODS.includes(method);
    const started = performance.now();

    try {
      if (isExternalTarget(target)) {
        const proxyResponse = await fetch('/api/http-test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: target,
            method,
            body: hasBody ? requestBody : undefined,
          }),
          signal: controller.signal,
        });

        const data = (await proxyResponse.json()) as HttpResult & { error?: string };
        if (!proxyResponse.ok) {
          setError(data.error || `Outbound request failed with HTTP ${proxyResponse.status}.`);
          return;
        }
        setResponse(data);
        return;
      }

      // Same-origin/local request: this exercises the real local echo route.
      const localResponse = await fetch(target, {
        method,
        headers: hasBody ? { 'Content-Type': 'application/json' } : undefined,
        body: hasBody ? requestBody : undefined,
        cache: 'no-store',
        signal: controller.signal,
      });

      const rawText = method === 'HEAD' ? '' : await localResponse.text();
      let parsedBody: unknown = rawText;
      if (rawText) {
        try {
          parsedBody = JSON.parse(rawText);
        } catch {
          parsedBody = rawText;
        }
      }

      const headers: Record<string, string> = {};
      localResponse.headers.forEach((value, key) => {
        headers[key] = value;
      });

      setResponse({
        status: localResponse.status,
        statusText: localResponse.statusText,
        timeMs: Math.round(performance.now() - started),
        finalUrl: localResponse.url,
        bytes: new TextEncoder().encode(rawText).byteLength,
        headers,
        body: parsedBody,
      });
    } catch (fetchError) {
      setError(
        fetchError instanceof DOMException && fetchError.name === 'AbortError'
          ? 'Request timed out after 10 seconds.'
          : 'Request failed before a response was received. Check the URL and connection.',
      );
    } finally {
      clearTimeout(timeout);
      setIsLoading(false);
    }
  };

  const hasBody = BODY_METHODS.includes(method);
  const isExternal = isExternalTarget(url);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-400" aria-hidden="true" />
            HTTP / HTTPS Request Bench
          </h3>
          <p className="text-xs text-slate-400">
            Defaults to the local <code className="text-emerald-300">/api/http-demo</code> echo route. External URLs are
            proxied by the server only for allowlisted hosts, with timeouts and a 64 KB response cap.
          </p>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          {isExternal ? 'Allowlisted proxy' : 'Local echo'}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div>
          <label htmlFor="http-method" className="sr-only">
            HTTP method
          </label>
          <select
            id="http-method"
            value={method}
            onChange={(event) => setMethod(event.target.value as Method)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-mono text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
          >
            {METHODS.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label htmlFor="http-url" className="sr-only">
            Request URL
          </label>
          <input
            id="http-url"
            type="text"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') void handleSend();
            }}
            spellCheck={false}
            autoComplete="off"
            placeholder="/api/http-demo or https://example.com"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <button
          type="button"
          onClick={() => void handleSend()}
          disabled={isLoading}
          className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/30"
        >
          {isLoading ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
          ) : (
            <Send className="w-4 h-4" aria-hidden="true" />
          )}
          <span>{isLoading ? 'Sending…' : 'Send Request'}</span>
        </button>
      </div>

      {hasBody && (
        <div className="space-y-1.5">
          <label htmlFor="http-body" className="text-xs font-mono text-slate-400">
            Request body (16 KB max)
          </label>
          <textarea
            id="http-body"
            value={requestBody}
            onChange={(event) => setRequestBody(event.target.value)}
            rows={3}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
          />
        </div>
      )}

      <div className="flex flex-wrap gap-2 text-xs font-mono">
        <span className="text-slate-500">Try:</span>
        <button
          type="button"
          onClick={() => setUrl('/api/http-demo')}
          className="px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300"
        >
          /api/http-demo
        </button>
        <button
          type="button"
          onClick={() => setUrl('https://example.com')}
          className="px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300"
        >
          https://example.com
        </button>
        <button
          type="button"
          onClick={() => setUrl('https://httpbin.org/get')}
          className="px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300"
        >
          https://httpbin.org/get
        </button>
      </div>

      <div aria-live="polite" className="space-y-4">
        {error && (
          <div role="alert" className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs font-mono flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {!response && !error && !isLoading && (
          <p className="text-xs text-slate-500 font-mono">
            No request sent yet. Press &quot;Send Request&quot; to see real response status, headers, timing, and body.
          </p>
        )}

        {response && (
          <div className="space-y-4 pt-2 font-mono text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`px-2.5 py-1 rounded text-xs font-bold ${
                    response.status < 400
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : response.status < 500
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-rose-500/20 text-rose-400'
                  }`}
                >
                  {response.status} {response.statusText}
                </span>
                <span className="text-slate-400">Client RTT: {response.timeMs}ms</span>
                {typeof response.bytes === 'number' && (
                  <span className="text-slate-500">{response.bytes} bytes</span>
                )}
                {response.truncated && (
                  <span className="text-amber-400">Response truncated at 64 KB</span>
                )}
              </div>
              <span className="text-slate-500 text-[11px] flex items-center gap-1 min-w-0">
                <Server className="w-3 h-3 shrink-0" aria-hidden="true" />
                <span className="truncate max-w-[280px]">{response.finalUrl || url}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 overflow-x-auto">
                <div className="text-slate-500 text-[11px] mb-2">{'// Response headers'}</div>
                <pre className="text-slate-300 whitespace-pre-wrap break-all">
                  {Object.keys(response.headers).length > 0
                    ? JSON.stringify(response.headers, null, 2)
                    : 'No response headers were exposed to the browser.'}
                </pre>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 overflow-x-auto">
                <div className="text-slate-500 text-[11px] mb-2">{'// Response body'}</div>
                <pre className="text-slate-300 whitespace-pre-wrap break-all max-h-80 overflow-y-auto">
                  {response.body === null || response.body === undefined || response.body === ''
                    ? '(empty body)'
                    : typeof response.body === 'string'
                      ? response.body
                      : JSON.stringify(response.body, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
