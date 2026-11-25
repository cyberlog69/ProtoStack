'use client';

import React from 'react';
import Link from 'next/link';
import { PROTOCOLS } from '@/data/protocols';
import { START_HERE_PATH } from '@/data/curriculum';
import { useProgress } from '@/context/ProgressContext';
import { ArrowRight, Compass, ScrollText, CheckCircle2 } from 'lucide-react';

const PATH_LESSONS = START_HERE_PATH.flatMap((module) =>
  module.lessons.map((lesson) => {
    const protocol = PROTOCOLS.find((entry) => entry.slug === lesson.slug);
    return protocol ? { slug: protocol.slug, name: protocol.name, moduleTitle: module.title } : null;
  }),
).filter((lesson): lesson is { slug: string; name: string; moduleTitle: string } => Boolean(lesson));

export default function ContinueLearning() {
  const { learnedProtocols, isLoaded } = useProgress();

  if (!isLoaded) return null;

  const learnedIds = new Set(learnedProtocols);
  const learnedCount = PATH_LESSONS.filter((lesson) => {
    const protocol = PROTOCOLS.find((entry) => entry.slug === lesson.slug);
    return protocol ? learnedIds.has(protocol.id) : false;
  }).length;
  const nextIndex = PATH_LESSONS.findIndex((lesson) => {
    const protocol = PROTOCOLS.find((entry) => entry.slug === lesson.slug);
    return protocol ? !learnedIds.has(protocol.id) : false;
  });
  const nextLesson = nextIndex >= 0 ? PATH_LESSONS[nextIndex] : null;

  const percent = PATH_LESSONS.length > 0 ? Math.round((learnedCount / PATH_LESSONS.length) * 100) : 0;

  return (
    <section
      aria-label="Continue learning"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6"
    >
      <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/50 via-slate-900/60 to-slate-950 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
            {nextLesson ? (
              <Compass className="w-4 h-4 text-indigo-300" aria-hidden="true" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-300" aria-hidden="true" />
            )}
          </div>
          <div className="min-w-0 space-y-1">
            <p className="text-[11px] font-mono uppercase tracking-wider text-indigo-300">
              {learnedCount > 0 ? 'Welcome back' : 'New here? Start with the guided path'}
            </p>
            <p className="text-sm font-bold text-white break-anywhere">
              {nextLesson
                ? `Lesson ${nextIndex + 1} of ${PATH_LESSONS.length}: ${nextLesson.name}`
                : `All ${PATH_LESSONS.length} path lessons marked learned`}
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400 font-mono">
              <span>{nextLesson ? nextLesson.moduleTitle : 'Keep going with the professional catalog'}</span>
              <span aria-hidden="true">·</span>
              <span>{percent}% of the path</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Link
            href={nextLesson ? `/protocols/${nextLesson.slug}` : '/coverage'}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors min-h-[38px]"
          >
            {nextLesson ? `Continue: ${nextLesson.name}` : 'Browse what is next'}
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
          <Link
            href="/record"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold hover:border-slate-700 transition-colors min-h-[38px]"
          >
            <ScrollText className="w-3.5 h-3.5" aria-hidden="true" />
            Record
          </Link>
        </div>
      </div>
    </section>
  );
}
