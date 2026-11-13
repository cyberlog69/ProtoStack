import React from 'react';
import Link from 'next/link';
import { PROTOCOLS } from '@/data/protocols';
import { Layers, Cpu, Network, Terminal, ArrowLeftRight, Brain, Award, BookOpen } from 'lucide-react';

const EXPLORE_LINKS = [
  { href: '/layers', label: 'OSI & TCP/IP Layers', icon: Layers },
  { href: '/compare', label: 'Protocol Comparison', icon: ArrowLeftRight },
  { href: '/quiz', label: 'Knowledge Arena', icon: Brain },
  { href: '/dashboard', label: 'Learning Dashboard', icon: Award },
];

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/60 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Layers className="w-4 h-4 text-white" aria-hidden="true" />
              </div>
              <span className="font-bold text-white text-base">ProtoStack</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Open-source interactive platform for computer networking, internet, and IoT protocols. Live resolvers
              and local simulations are labelled honestly; fabricated responses are never used.
            </p>
            <p className="text-[11px] text-slate-400 font-mono">MIT licensed</p>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
              <Network className="w-3.5 h-3.5 text-blue-400" aria-hidden="true" />
              Core Protocols
            </h2>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link href="/protocols/dns" className="hover:text-indigo-400">DNS</Link></li>
              <li><Link href="/protocols/tcp" className="hover:text-indigo-400">TCP</Link></li>
              <li><Link href="/protocols/arp" className="hover:text-indigo-400">ARP</Link></li>
              <li><Link href="/protocols/http" className="hover:text-indigo-400">HTTP / HTTPS</Link></li>
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
              IoT &amp; Web
            </h2>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link href="/protocols/mqtt" className="hover:text-indigo-400">MQTT</Link></li>
              <li><Link href="/protocols/coap" className="hover:text-indigo-400">CoAP</Link></li>
              <li><Link href="/protocols/websocket" className="hover:text-indigo-400">WebSocket</Link></li>
              <li><Link href="/protocols/tls" className="hover:text-indigo-400">TLS 1.3</Link></li>
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
              Explore
            </h2>
            <ul className="space-y-2 text-xs text-slate-400">
              {EXPLORE_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.href}>
                    <Link href={link.href} className="hover:text-indigo-400 flex items-center gap-1.5">
                      <Icon className="w-3 h-3" aria-hidden="true" />
                      {link.label}
                    </Link>
                  </li>
                );
              })}
              <li>
                <Link href="/#protocols" className="hover:text-indigo-400 flex items-center gap-1.5">
                  <BookOpen className="w-3 h-3" aria-hidden="true" />
                  All {PROTOCOLS.length} Protocols
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} ProtoStack. Designed for engineers, students &amp; developers.</p>
          <p>Built with Next.js, Tailwind CSS &amp; TypeScript</p>
        </div>
      </div>
    </footer>
  );
}
