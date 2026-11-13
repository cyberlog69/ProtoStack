'use client';

import React, { useState } from 'react';
import { Globe, Send, CheckCircle2, Copy } from 'lucide-react';

export default function HttpSandbox() {
  const [method, setMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>('GET');
  const [url, setUrl] = useState('https://api.protostack.dev/v1/sensors/telemetry');
  const [response, setResponse] = useState<any>({
    status: 200,
    statusText: 'OK',
    timeMs: 42,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=3600',
      'x-protocol-version': 'HTTP/2',
      'server': 'cloudflare'
    },
    body: {
      status: 'success',
      timestamp: new Date().toISOString(),
      data: {
        network_id: 'corp-net-04',
        protocols_active: ['DNS', 'MQTT', 'TCP', 'TLS_1_3'],
        throughput_mbps: 840.5
      }
    }
  });

  const handleSend = () => {
    setResponse({
      status: method === 'POST' ? 201 : 200,
      statusText: method === 'POST' ? 'Created' : 'OK',
      timeMs: Math.floor(Math.random() * 40) + 18,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-cache',
        'x-request-method': method,
        'server': 'protostack-edge/1.0'
      },
      body: {
        message: `HTTP ${method} execution completed successfully.`,
        executedAt: new Date().toISOString(),
        requestUrl: url
      }
    });
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-400" />
            Live HTTP / HTTPS Request Bench
          </h3>
          <p className="text-xs text-slate-400">
            Construct client requests, inspect response status codes, header semantics, and parsed JSON payload.
          </p>
        </div>
      </div>

      {/* Request Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value as any)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-mono text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
        </select>

        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
        />

        <button
          onClick={handleSend}
          className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/30"
        >
          <Send className="w-4 h-4" />
          <span>Send Request</span>
        </button>
      </div>

      {/* Response Display */}
      {response && (
        <div className="space-y-4 pt-2 font-mono text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-3">
              <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                response.status < 300 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
              }`}>
                {response.status} {response.statusText}
              </span>
              <span className="text-slate-400">RTT: {response.timeMs}ms</span>
            </div>
            <span className="text-slate-500 text-[11px]">HTTP/2 Over TLS 1.3</span>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 overflow-x-auto">
            <div className="text-slate-500 text-[11px] mb-2">// Response Headers & Body</div>
            <pre className="text-slate-300">
              {JSON.stringify(response.body, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

