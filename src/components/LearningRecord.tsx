'use client';

import React, { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { PROTOCOLS } from '@/data/protocols';
import { START_HERE_PATH } from '@/data/curriculum';
import { ATTACKS } from '@/data/attacks';
import { useProgress } from '@/context/ProgressContext';
import {
  Award,
  BookOpen,
  Brain,
  CheckCircle2,
  Circle,
  Download,
  Info,
  Lock,
  Printer,
  RotateCcw,
  ShieldCheck,
  Upload,
} from 'lucide-react';

const PROTOCOL_BY_ID = new Map(PROTOCOLS.map((protocol) => [protocol.id, protocol]));
const PROTOCOL_BY_SLUG = new Map(PROTOCOLS.map((protocol) => [protocol.slug, protocol]));
const ATTACK_BY_ID = new Map(ATTACKS.map((attack) => [attack.id, attack]));

const CATEGORY_LABELS: Record<string, string> = {
  all: 'All Protocols',
  network: 'Network & Internet',
  transport: 'Transport Layer',
  application: 'Application Layer',
  iot: 'IoT & SCADA',
  security: 'Security & Auth',
  wireless: 'Wireless & Radio',
  cloud: 'Cloud & Messaging',
};

interface PathRow {
  slug: string;
  name: string;
  protocolId: string;
  moduleTitle: string;
  position: number;
  why: string;
}

type StatusMessage = { tone: 'success' | 'error'; message: string };

export default function LearningRecord() {
  const {
    learnedProtocols,
    quizScores,
    attackScores,
    isLoaded,
    exportProgress,
    importProgress,
    resetProgress,
  } = useProgress();
  const [status, setStatus] = useState<StatusMessage | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const learnedSet = useMemo(
    () => new Set(learnedProtocols.filter((id) => PROTOCOL_BY_ID.has(id))),
    [learnedProtocols],
  );

  const pathRows = useMemo(() => {
    const rows: PathRow[] = [];
    let position = 0;
    for (const pathModule of START_HERE_PATH) {
      for (const lesson of pathModule.lessons) {
        const protocol = PROTOCOL_BY_SLUG.get(lesson.slug);
        if (!protocol) continue;
        position += 1;
        rows.push({
          slug: lesson.slug,
          name: protocol.name,
          protocolId: protocol.id,
          moduleTitle: pathModule.title,
          position,
          why: lesson.why,
        });
      }
    }
    return rows;
  }, []);

  const pathLearned = pathRows.filter((row) => learnedSet.has(row.protocolId)).length;
  const pathPercent = pathRows.length > 0 ? Math.round((pathLearned / pathRows.length) * 100) : 0;

  const quizEntries = useMemo(
    () =>
      Object.entries(quizScores)
        .map(([id, value]) => {
          const protocol = PROTOCOL_BY_ID.get(id);
          const categoryId = id.startsWith('quiz-') ? id.slice('quiz-'.length) : null;
          const label = protocol?.name ?? (categoryId ? CATEGORY_LABELS[categoryId] ?? categoryId : null);
          if (!label) return null;
          return {
            id,
            label,
            score: value.score,
            total: value.total,
            percent: Math.round((value.score / value.total) * 100),
            updatedAt: value.updatedAt,
          };
        })
        .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
        .sort((a, b) => b.percent - a.percent || a.label.localeCompare(b.label)),
    [quizScores],
  );

  const quizAverage =
    quizEntries.length > 0
      ? Math.round(quizEntries.reduce((total, entry) => total + entry.percent, 0) / quizEntries.length)
      : 0;

  const attackAttempts = useMemo(
    () => Object.entries(attackScores).filter(([id]) => ATTACK_BY_ID.has(id)),
    [attackScores],
  );
  const attacksPassed = attackAttempts.filter(([, value]) => value.score === value.total && value.total > 0);
  const passedAttackNames = attacksPassed
    .map(([id]) => ATTACK_BY_ID.get(id)?.name)
    .filter((name): name is string => Boolean(name));
  const passedAttackSummary =
    passedAttackNames.length > 12
      ? `${passedAttackNames.slice(0, 12).join(' · ')} · +${passedAttackNames.length - 12} more`
      : passedAttackNames.join(' · ');
  const hasAnyProgress =
    learnedSet.size > 0 || quizEntries.length > 0 || attackAttempts.length > 0;

  const toneClasses = (tone: StatusMessage['tone']) =>
    tone === 'success'
      ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-200'
      : 'border-rose-500/40 bg-rose-950/30 text-rose-200';

  const handlePrint = () => {
    setStatus(null);
    window.print();
  };

  const handleExport = () => {
    const blob = new Blob([exportProgress()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `protostack-progress-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setStatus({ tone: 'success', message: 'Backup downloaded. Keep it somewhere safe.' });
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (file.size > 1_000_000) {
      setStatus({ tone: 'error', message: 'That file is larger than the 1 MB import limit.' });
      return;
    }

    let text: string;
    try {
      text = await file.text();
    } catch {
      setStatus({ tone: 'error', message: 'The file could not be read.' });
      return;
    }

    if (!window.confirm('Replace the progress currently stored in this browser with the backup?')) {
      return;
    }

    const result = importProgress(text);
    if (result.ok) {
      setStatus({
        tone: 'success',
        message: `Imported ${result.lessons} lessons, ${result.quizzes} quiz results and ${result.attacks} attack results.`,
      });
    } else {
      setStatus({ tone: 'error', message: result.error });
    }
  };

  const handleReset = () => {
    if (
      !window.confirm(
        'Delete every locally stored lesson, quiz and attack result? Export a backup first if you want to keep them.',
      )
    ) {
      return;
    }
    resetProgress();
    setStatus({ tone: 'success', message: 'Local progress deleted. This browser is back to a clean slate.' });
  };

  if (!isLoaded) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-sm text-slate-400">
          Loading your local progress…
        </div>
      </div>
    );
  }

  return (
    <div
      data-print-document
      className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8"
    >
      <header className="space-y-4 border-b border-slate-800 pb-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
            <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
            Free · no account · no paywall
          </span>
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
            <Lock className="w-3.5 h-3.5" aria-hidden="true" />
            Stored only in this browser
          </span>
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Your learning record
          </h1>
          <p className="text-base text-slate-300 max-w-2xl leading-relaxed">
            A printable summary of the lessons, quizzes and defender challenges you have completed. It is
            generated from local browser storage, so you can keep a copy without creating an account.
          </p>
        </div>
      </header>

      <div className="no-print rounded-2xl border border-slate-800 bg-slate-900/60 p-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors min-h-[38px]"
        >
          <Printer className="w-3.5 h-3.5" aria-hidden="true" />
          Print or save as PDF
        </button>
        <button
          type="button"
          onClick={handleExport}
          disabled={!hasAnyProgress}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 border border-slate-700 text-xs font-semibold transition-colors min-h-[38px]"
        >
          <Download className="w-3.5 h-3.5" aria-hidden="true" />
          Export backup
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors min-h-[38px]"
        >
          <Upload className="w-3.5 h-3.5" aria-hidden="true" />
          Import backup
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleImport}
          className="sr-only"
          aria-label="Choose a ProtoStack progress backup file"
        />
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-500/40 text-xs font-semibold transition-colors min-h-[38px] sm:ml-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          Reset local progress
        </button>
      </div>

      {status && (
        <div role="status" className={`no-print rounded-xl border p-3 text-xs ${toneClasses(status.tone)}`}>
          {status.message}
        </div>
      )}

      <section aria-labelledby="record-summary" className="space-y-4">
        <h2 id="record-summary" className="text-xl font-bold text-white">
          Summary
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat label="Lessons learned" value={`${learnedSet.size} / ${PROTOCOLS.length}`} detail="whole catalog" />
          <Stat label="Start Here path" value={`${pathLearned} / ${pathRows.length}`} detail={`${pathPercent}% complete`} />
          <Stat label="Knowledge checks" value={`${quizAverage}%`} detail={`${quizEntries.length} best results`} />
          <Stat label="Defences passed" value={`${attacksPassed.length}`} detail={`of ${ATTACKS.length} scenarios`} />
        </div>
      </section>

      <section aria-labelledby="record-path" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 id="record-path" className="text-xl font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" aria-hidden="true" />
              Start Here path
            </h2>
            <p className="text-xs text-slate-400">
              {pathLearned} of {pathRows.length} lessons marked learned, in curriculum order.
            </p>
          </div>
          <Link
            href="/start"
            className="no-print text-xs font-semibold text-indigo-300 hover:text-indigo-200"
          >
            Open the path →
          </Link>
        </div>

        <div className="h-2 rounded-full bg-slate-800 overflow-hidden" aria-hidden="true">
          <div
            data-print-fill
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400"
            style={{ width: `${pathPercent}%` }}
          />
        </div>

        <div className="space-y-3">
          {START_HERE_PATH.map((curriculumModule) => {
            const moduleRows = pathRows.filter((row) => row.moduleTitle === curriculumModule.title);
            const moduleLearned = moduleRows.filter((row) => learnedSet.has(row.protocolId)).length;

            return (
              <div
                key={curriculumModule.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden break-inside-avoid"
              >
                <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/50 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-white">{curriculumModule.title}</h3>
                  <span className="text-[11px] font-mono text-slate-400">
                    {moduleLearned}/{moduleRows.length} done
                  </span>
                </div>
                <ul className="divide-y divide-slate-800/70">
                  {moduleRows.map((row) => {
                    const learned = learnedSet.has(row.protocolId);
                    const score = quizScores[row.protocolId];
                    return (
                      <li key={row.slug} className="px-4 py-2.5 flex flex-wrap items-center gap-2 text-xs">
                        <span className="w-5 shrink-0" aria-hidden="true">
                          {learned ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-600" />
                          )}
                        </span>
                        <Link
                          href={`/protocols/${row.slug}`}
                          className="font-semibold text-slate-200 hover:text-indigo-300"
                        >
                          {row.name}
                        </Link>
                        <span className="text-[10px] font-mono text-slate-500">#{row.position}</span>
                        <span className="ml-auto font-mono text-[10px] text-slate-400">
                          {learned ? 'Learned' : 'Not yet'}
                          {score ? ` · quiz ${score.score}/${score.total}` : ''}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="record-quizzes" className="space-y-3 break-inside-avoid">
        <div>
          <h2 id="record-quizzes" className="text-xl font-bold text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-amber-400" aria-hidden="true" />
            Knowledge check results
          </h2>
          <p className="text-xs text-slate-400">
            Best score per lesson or category. Retakes never replace a higher score.
          </p>
        </div>

        {quizEntries.length > 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden">
            <table className="w-full text-left text-xs">
              <caption className="sr-only">Best knowledge-check results stored in this browser</caption>
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono">
                  <th scope="col" className="px-3 sm:px-4 py-2.5 font-semibold">Topic</th>
                  <th scope="col" className="px-3 sm:px-4 py-2.5 font-semibold text-center">Best</th>
                  <th scope="col" className="px-3 sm:px-4 py-2.5 font-semibold text-center">Percent</th>
                  <th scope="col" className="px-3 sm:px-4 py-2.5 font-semibold text-right hidden sm:table-cell">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {quizEntries.map((entry) => (
                  <tr key={entry.id}>
                    <th scope="row" className="px-3 sm:px-4 py-2 font-medium text-slate-200 text-left">
                      {entry.label}
                    </th>
                    <td className="px-3 sm:px-4 py-2 text-center font-mono text-slate-300">
                      {entry.score}/{entry.total}
                    </td>
                    <td
                      className={`px-3 sm:px-4 py-2 text-center font-mono font-bold ${
                        entry.percent >= 80
                          ? 'text-emerald-300'
                          : entry.percent >= 50
                            ? 'text-amber-300'
                            : 'text-rose-300'
                      }`}
                    >
                      {entry.percent}%
                    </td>
                    <td className="px-3 sm:px-4 py-2 text-right font-mono text-[11px] text-slate-500 hidden sm:table-cell">
                      {new Date(entry.updatedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-slate-800 p-6 text-center text-xs text-slate-400">
            No quiz attempts yet. Open a lesson or the{' '}
            <Link href="/quiz" className="text-indigo-300 hover:underline">
              knowledge checks
            </Link>{' '}
            to start.
          </p>
        )}
      </section>

      <section aria-labelledby="record-attacks" className="space-y-3 break-inside-avoid">
        <div>
          <h2 id="record-attacks" className="text-xl font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-rose-400" aria-hidden="true" />
            Defender challenges
          </h2>
          <p className="text-xs text-slate-400">
            A scenario counts as passed when both detection and mitigation questions are answered correctly.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 text-xs text-slate-300">
          <p>
            <strong className="text-white">{attacksPassed.length}</strong> of {ATTACKS.length} scenarios passed,{' '}
            {attackAttempts.length} attempted.
          </p>
          {attacksPassed.length > 0 && (
            <p className="mt-2 text-[11px] text-slate-400">
              Passed: {passedAttackSummary}
            </p>
          )}
        </div>
      </section>

      <section className="space-y-3 break-inside-avoid">
        <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/5 p-5 space-y-2">
          <h2 className="text-sm font-bold text-cyan-200 flex items-center gap-2">
            <Info className="w-4 h-4" aria-hidden="true" />
            What this record is — and is not
          </h2>
          <ul className="space-y-1.5 text-xs text-slate-300">
            <li>It is a self-study summary generated from your own browser storage.</li>
            <li>It is not an accredited certificate, diploma or professional qualification.</li>
            <li>ProtoStack has no accounts, no server-side profile and no way to recover a deleted browser profile.</li>
            <li>Use Export backup before clearing site data or switching browsers.</li>
          </ul>
        </div>
      </section>

      <p className="text-[11px] font-mono text-slate-500 border-t border-slate-800 pt-4">
        Generated locally on {new Date().toLocaleString()} · ProtoStack is free and open source (MIT).
      </p>
    </div>
  );
}

function Stat({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">{label}</span>
      <div className="text-2xl font-black font-mono mt-1 text-white">{value}</div>
      <span className="text-[11px] text-slate-400">{detail}</span>
    </div>
  );
}
