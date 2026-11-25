import type { Metadata } from 'next';
import Link from 'next/link';
import { PROTOCOLS } from '@/data/protocols';
import { START_HERE_PATH } from '@/data/curriculum';
import { getCoverage } from '@/data/coverage';
import CurriculumBoard, { type BoardModule } from '@/components/CurriculumBoard';
import { ArrowRight, Compass, Map, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Start Here: a beginner path through networking',
  description:
    'A five-module, prerequisite-ordered path through the protocols that explain how networks actually work, from Ethernet frames to BGP.',
  alternates: { canonical: '/start' },
};

function buildModules(): BoardModule[] {
  return START_HERE_PATH.map((module) => ({
    id: module.id,
    title: module.title,
    summary: module.summary,
    resource: module.resource,
    lessons: module.lessons.map((lesson) => {
      const protocol = PROTOCOLS.find((entry) => entry.slug === lesson.slug);
      if (!protocol) throw new Error(`Curriculum references unknown protocol: ${lesson.slug}`);
      const coverage = getCoverage(protocol.slug);

      return {
        id: protocol.id,
        slug: protocol.slug,
        name: protocol.name,
        fullName: protocol.fullName,
        shortSummary: protocol.shortSummary,
        difficulty: coverage?.difficulty ?? 'beginner',
        tier: coverage?.tier ?? 'core',
        why: lesson.why,
        prerequisites: (coverage?.prerequisites ?? [])
          .map((slug) => PROTOCOLS.find((entry) => entry.slug === slug))
          .filter((entry): entry is (typeof PROTOCOLS)[number] => Boolean(entry))
          .map((entry) => ({ slug: entry.slug, name: entry.name })),
      };
    }),
  }));
}

export default function StartPage() {
  const modules = buildModules();
  const lessonCount = modules.reduce((total, module) => total + module.lessons.length, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <header className="space-y-4 border-b border-slate-800 pb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono">
          <Compass className="w-3.5 h-3.5" aria-hidden="true" />
          <span>New here? Follow this order</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
          Start here —{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            {lessonCount} lessons, one path
          </span>
        </h1>

        <p className="text-base text-slate-300 max-w-3xl leading-relaxed">
          The catalog is a reference library, and a library is a bad place to begin. This path puts {lessonCount}{' '}
          protocols in an order where each lesson only uses ideas introduced earlier, so you are never asked to
          understand BGP before you have seen a router.
        </p>

        <p className="text-sm text-slate-400 max-w-3xl">
          It takes roughly 4–6 hours if you read the flow, open the sandbox and take the quiz for each lesson. Marking a
          lesson learned is stored locally in your browser. The path is free, needs no account, and you can{' '}
          <Link href="/record" className="text-indigo-300 hover:underline">
            print or export your record
          </Link>{' '}
          at any time.
        </p>
      </header>

      <section aria-labelledby="how-it-works" className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          {
            title: 'Read the flow',
            body: 'Each lesson animates the exchange step by step, with the decoded packet fields for that step.',
            icon: Compass,
          },
          {
            title: 'Try the sandbox',
            body: 'DNS and HTTP query real endpoints. Everything else is clearly labelled as a simulation.',
            icon: ShieldCheck,
          },
          {
            title: 'Take the quiz',
            body: 'Two questions per protocol. Wrong answers explain the underlying fact, not just the letter.',
            icon: Map,
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Icon className="w-4 h-4 text-indigo-300" aria-hidden="true" />
                {item.title}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{item.body}</p>
            </div>
          );
        })}
      </section>

      <section aria-label="Curriculum">
        <CurriculumBoard modules={modules} />
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-sm font-bold text-white">Finished the path?</h2>
          <p className="text-xs text-slate-400 max-w-xl">
            The coverage map shows the professional tier, the reference registry and the standards still to be written.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <Link
            href="/record"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600 hover:text-white transition-colors"
          >
            Learning record
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
          <Link
            href="/coverage"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            Coverage map
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
          <Link
            href="/reference"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
          >
            Reference registry
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
