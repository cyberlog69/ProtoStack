'use client';

import React from 'react';
import Link from 'next/link';
import { useProgress } from '@/context/ProgressContext';
import { getDifficultyBadge, getTierBadge } from '@/lib/utils';
import { ArrowRight, CheckCircle2, Circle, Compass, Info } from 'lucide-react';

export interface BoardLesson {
  id: string;
  slug: string;
  name: string;
  fullName: string;
  shortSummary: string;
  difficulty: string;
  tier: string;
  why: string;
  prerequisites: { slug: string; name: string }[];
}

export interface BoardModule {
  id: string;
  title: string;
  summary: string;
  lessons: BoardLesson[];
  resource?: { label: string; href: string };
}

export default function CurriculumBoard({ modules }: { modules: BoardModule[] }) {
  const { learnedProtocols, toggleLearned, isLearned } = useProgress();

  const lessons = modules.flatMap((module) => module.lessons);
  const learnedCount = lessons.filter((lesson) => learnedProtocols.includes(lesson.id)).length;
  const percent = lessons.length > 0 ? Math.round((learnedCount / lessons.length) * 100) : 0;
  const nextLesson = lessons.find((lesson) => !learnedProtocols.includes(lesson.id));

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">Your position on the path</h2>
            <p className="text-xs text-slate-400">
              {learnedCount} of {lessons.length} lessons marked learned. Progress stays in this browser.
            </p>
          </div>

          {nextLesson ? (
            <Link
              href={`/protocols/${nextLesson.slug}`}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors shadow-md shadow-indigo-600/30"
            >
              <Compass className="w-4 h-4" aria-hidden="true" />
              <span>Continue: {nextLesson.name}</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
              Path complete
            </span>
          )}
        </div>

        <div
          className="h-2 rounded-full bg-slate-800 overflow-hidden"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={lessons.length}
          aria-valuenow={learnedCount}
          aria-label="Lessons marked learned"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {modules.map((module, moduleIndex) => {
        const moduleLearned = module.lessons.filter((lesson) => learnedProtocols.includes(lesson.id)).length;

        return (
          <section
            key={module.id}
            aria-labelledby={`module-${module.id}`}
            className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden"
          >
            <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <h2 id={`module-${module.id}`} className="text-base font-bold text-white">
                  {module.title}
                </h2>
                <p className="text-xs text-slate-400 max-w-2xl">{module.summary}</p>
              </div>
              <span className="text-[11px] font-mono text-slate-400 shrink-0">
                {moduleLearned}/{module.lessons.length} done
              </span>
            </div>

            <ol className="divide-y divide-slate-800/70">
              {module.lessons.map((lesson, lessonIndex) => {
                const learned = isLearned(lesson.id);
                const missing = lesson.prerequisites.filter((prerequisite) => {
                  const entry = lessons.find((candidate) => candidate.slug === prerequisite.slug);
                  return entry ? !learnedProtocols.includes(entry.id) : false;
                });
                const difficulty = getDifficultyBadge(lesson.difficulty);
                const tier = getTierBadge(lesson.tier);
                const stepNumber = moduleIndex * 10 + lessonIndex + 1;

                return (
                  <li key={lesson.slug}>
                    <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-start gap-4 hover:bg-slate-900/60 transition-colors">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <span
                          className={`mt-0.5 w-7 h-7 shrink-0 rounded-full border flex items-center justify-center text-[11px] font-mono font-bold ${
                            learned
                              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                              : 'bg-slate-900 border-slate-700 text-slate-400'
                          }`}
                          aria-hidden="true"
                        >
                          {learned ? <CheckCircle2 className="w-3.5 h-3.5" /> : stepNumber}
                        </span>

                        <div className="min-w-0 space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              href={`/protocols/${lesson.slug}`}
                              className="text-sm font-bold text-white hover:text-indigo-300 transition-colors"
                            >
                              {lesson.name}
                            </Link>
                            <span className="text-[11px] text-slate-400 font-mono truncate">{lesson.fullName}</span>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${tier.color}`}>
                              {tier.label}
                            </span>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${difficulty.color}`}>
                              {difficulty.label}
                            </span>
                          </div>

                          <p className="text-xs text-slate-300 leading-relaxed">{lesson.why}</p>

                          {missing.length > 0 && (
                            <p className="text-[11px] text-amber-300/90 flex items-start gap-1.5">
                              <Info className="w-3 h-3 mt-0.5 shrink-0" aria-hidden="true" />
                              <span>
                                Read first:{' '}
                                {missing.map((prerequisite, index) => (
                                  <span key={prerequisite.slug}>
                                    {index > 0 && ', '}
                                    <Link href={`/protocols/${prerequisite.slug}`} className="hover:underline">
                                      {prerequisite.name}
                                    </Link>
                                  </span>
                                ))}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 lg:pl-4">
                        <button
                          type="button"
                          onClick={() => toggleLearned(lesson.id)}
                          aria-pressed={learned}
                          aria-label={
                            learned
                              ? `Mark ${lesson.name} as not learned`
                              : `Mark ${lesson.name} as learned`
                          }
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition-colors ${
                            learned
                              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25'
                              : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600 hover:text-white'
                          }`}
                        >
                          {learned ? (
                            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                          ) : (
                            <Circle className="w-3.5 h-3.5" aria-hidden="true" />
                          )}
                          {learned ? 'Learned' : 'Mark learned'}
                        </button>

                        <Link
                          href={`/protocols/${lesson.slug}`}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-300 hover:text-indigo-200 px-2 py-1.5"
                        >
                          Open
                          <ArrowRight className="w-3 h-3" aria-hidden="true" />
                        </Link>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>

            {module.resource && (
              <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/40">
                <Link
                  href={module.resource.href}
                  className="text-xs font-semibold text-cyan-300 hover:text-cyan-200 inline-flex items-center gap-1"
                >
                  {module.resource.label}
                  <ArrowRight className="w-3 h-3" aria-hidden="true" />
                </Link>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
