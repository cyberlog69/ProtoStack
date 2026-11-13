import React from 'react';
import Link from 'next/link';
import { Layers, Shield, Cpu, Network, Terminal, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/60 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Layers className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white text-base">ProtoStack</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Open-source interactive platform explaining computer networking, internet, and IoT protocols through animated packet flows and live sandbox experiments.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
              <Network className="w-3.5 h-3.5 text-blue-400" />
              Network Protocols
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link href="/protocols/dns" className="hover:text-indigo-400">DNS (Domain Name System)</Link></li>
              <li><Link href="/protocols/tcp" className="hover:text-indigo-400">TCP (Transmission Control)</Link></li>
              <li><Link href="/protocols/arp" className="hover:text-indigo-400">ARP (Address Resolution)</Link></li>
              <li><Link href="/protocols/http" className="hover:text-indigo-400">HTTP / HTTPS</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-amber-400" />
              IoT & Embedded
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link href="/protocols/mqtt" className="hover:text-indigo-400">MQTT (Pub/Sub Telemetry)</Link></li>
              <li><Link href="/protocols/coap" className="hover:text-indigo-400">CoAP (Constrained Application)</Link></li>
              <li><Link href="/protocols/websocket" className="hover:text-indigo-400">WebSocket Duplex</Link></li>
              <li><Link href="/protocols/tls" className="hover:text-indigo-400">TLS 1.3 Security</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              Interactive Sandboxes
            </h4>
            <p className="text-xs text-slate-400 mb-3">
              Test real packet exchanges with zero installation. All simulations run live in your browser.
            </p>
            <div className="flex gap-2">
              <span className="text-[11px] px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono">
                RFC Verified
              </span>
              <span className="text-[11px] px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono">
                Zero Setup
              </span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} ProtoStack. Designed for engineers, students & developers.</p>
          <p className="flex items-center gap-1">
            Built with Next.js, Tailwind CSS & TypeScript
          </p>
        </div>
      </div>
    </footer>
  );
}

