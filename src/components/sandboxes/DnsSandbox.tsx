'use client';

import React, { useState } from 'react';
import { Search, Globe, Clock, CheckCircle2, AlertTriangle, Server } from 'lucide-react';

const RECORD_TYPES = ['A', 'AAAA', 'MX', 'TXT', 'CNAME', 'NS'] as const;
type RecordType = (typeof RECORD_TYPES)[number];

const PRESET_DOMAINS = ['cloudflare.com', 'google.com', 'github.com', 'wikipedia.org', 'nasa.gov'];

interface DnsAnswer {
  name: string;
  type: number;
  TTL: number | null;
  data: string;
}

interface DnsResponse {
  Status: number;
  RD?: boolean;
  RA?: boolean;
  AD?: boolean;
  ADVerified?: boolean;
  Resolver?: string;
  Question?: { name: string; type: number }[];
  Answer?: DnsAnswer[];
  latencyMs?: number;
  error?: string;
}

export default function DnsSandbox() {
  const [domain, setDomain] = useState('cloudflare.com');
  const [recordType, setRecordType] = useState<RecordType>('A');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DnsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleResolve = async (targetDomain = domain, targetType: RecordType = recordType) => {
    const trimmed = targetDomain.trim();
    if (!trimmed) return;

    setIsLoading(true);
    setResult(null);
    setError(null);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(
        `/api/dns?name=${encodeURIComponent(trimmed)}&type=${encodeURIComponent(targetType)}`,
        { signal: controller.signal, cache: 'no-store' },
      );

      const data = (await response.json()) as DnsResponse;

      if (!response.ok) {
        setError(data.error || `DNS request failed with HTTP ${response.status}.`);
        return;
      }

      setResult(data);
      if (data.error) setError(data.error);
    } catch (fetchError) {
      setError(
        fetchError instanceof DOMException && fetchError.name === 'AbortError'
          ? 'DNS request timed out after 8 seconds.'
          : 'Could not reach the DNS API. Check your connection and try again.',
      );
    } finally {
      clearTimeout(timeout);
      setIsLoading(false);
    }
  };

  const answers = result?.Answer ?? [];
  const hasNoError = result?.Status === 0 && !error;
  const latency = result?.latencyMs;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-cyan-400" aria-hidden="true" />
            DNS Resolver Bench
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Server resolver
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            Queries are resolved on this app&apos;s server through Node&apos;s DNS APIs. Answers are real or the request
            fails with an explicit error; nothing is fabricated.
          </p>
        </div>

        {latency !== undefined && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Resolution latency: {latency} ms</span>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <label htmlFor="dns-domain" className="sr-only">
            Hostname to resolve
          </label>
          <input
            id="dns-domain"
            type="text"
            value={domain}
            onChange={(event) => setDomain(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') void handleResolve();
            }}
            placeholder="Enter hostname (e.g. google.com)"
            autoComplete="off"
            spellCheck={false}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        <div>
          <label htmlFor="dns-record-type" className="sr-only">
            DNS record type
          </label>
          <select
            id="dns-record-type"
            value={recordType}
            onChange={(event) => setRecordType(event.target.value as RecordType)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-mono text-cyan-400 font-bold focus:outline-none focus:border-cyan-500"
          >
            {RECORD_TYPES.map((type) => (
              <option key={type} value={type}>
                {type} Record
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => void handleResolve()}
          disabled={isLoading || !domain.trim()}
          className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-600/30"
        >
          {isLoading ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
          ) : (
            <Search className="w-4 h-4" aria-hidden="true" />
          )}
          <span>{isLoading ? 'Resolving…' : 'Query DNS'}</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-500">Quick test:</span>
        {PRESET_DOMAINS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => {
              setDomain(preset);
              void handleResolve(preset, recordType);
            }}
            className="px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-mono transition-colors"
          >
            {preset}
          </button>
        ))}
      </div>

      <div aria-live="polite">
        {error && (
          <div role="alert" className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs font-mono flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {result && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono">
                <span className="text-[10px] text-slate-500 block uppercase">Response status</span>
                <span
                  className={`text-sm font-bold flex items-center gap-1.5 mt-0.5 ${
                    hasNoError ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {hasNoError ? (
                    <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                  )}
                  {hasNoError ? '0 (NOERROR)' : `Code ${result.Status}`}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono">
                <span className="text-[10px] text-slate-500 block uppercase">Recursion flags</span>
                <span className="text-cyan-400 text-xs font-semibold block mt-1">
                  {result.RD ? 'RD (desired)' : ''} {result.RA ? '• RA (available)' : ''}
                  {!result.RD && !result.RA ? 'Not exposed' : ''}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono">
                <span className="text-[10px] text-slate-500 block uppercase">DNSSEC AD flag</span>
                <span className="text-indigo-400 text-xs font-semibold block mt-1">
                  {result.ADVerified
                    ? `AD = ${result.AD ? '1' : '0'} (verified by resolver)`
                    : 'Not reported by the local resolver'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono">
                <span className="text-[10px] text-slate-500 block uppercase">Answer count</span>
                <span className="text-amber-400 text-sm font-bold block mt-0.5">{answers.length} records</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden font-mono text-xs">
              <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-slate-400 font-semibold flex items-center justify-between gap-2">
                <span>ANSWER SECTION (RESOURCE RECORDS)</span>
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Server className="w-3 h-3" aria-hidden="true" />
                  {result.Resolver || 'system resolver'}
                </span>
              </div>

              <div className="divide-y divide-slate-800/80">
                {answers.length > 0 ? (
                  answers.map((answer, index) => (
                    <div
                      key={`${answer.type}-${answer.data}-${index}`}
                      className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-900/40 transition-colors"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold text-[11px]">
                            {recordType}
                          </span>
                          <span className="text-white font-bold break-all">{answer.name}</span>
                        </div>
                        <div className="text-slate-400 text-[11px]">
                          TTL:{' '}
                          <span className="text-amber-400 font-semibold">
                            {typeof answer.TTL === 'number' ? `${answer.TTL}s` : 'not exposed'}
                          </span>
                          {typeof answer.TTL === 'number' && (
                            <span> ({Math.round(answer.TTL / 60)} min cache)</span>
                          )}
                        </div>
                      </div>

                      <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 text-emerald-400 font-bold select-all break-all">
                        {answer.data}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-slate-500">
                    No {recordType} records returned for {domain}.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
