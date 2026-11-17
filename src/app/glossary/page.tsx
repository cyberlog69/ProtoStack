import type { Metadata } from 'next';
import Link from 'next/link';
import { GLOSSARY } from '@/data/glossary';
import GlossaryBrowser from '@/components/GlossaryBrowser';
import { BookMarked, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Networking glossary',
  description: `${GLOSSARY.length} networking and protocol terms defined in plain language, with links to the related lesson or reference card.`,
  alternates: { canonical: '/glossary' },
};

export default function GlossaryPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <header className="space-y-4 border-b border-slate-800 pb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
          <BookMarked className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{GLOSSARY.length} terms, no jargon loop</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
          Networking{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
            glossary
          </span>
        </h1>

        <p className="text-base text-slate-300 max-w-2xl leading-relaxed">
          Every acronym the lessons use, defined in one or two sentences. Definitions are deliberately plain: read the
          linked lesson or the cited standard for the precise version.
        </p>

        <p className="text-xs text-slate-500">
          Looking for a protocol rather than a term?{' '}
          <Link href="/coverage" className="text-cyan-300 hover:underline">
            Browse the coverage map
          </Link>{' '}
          or{' '}
          <Link href="/reference" className="text-cyan-300 hover:underline">
            the reference registry
          </Link>
          .
        </p>
      </header>

      <GlossaryBrowser />

      <div className="pt-2">
        <Link
          href="/start"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-300 hover:text-indigo-200"
        >
          Put these terms to work in the beginner path
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
