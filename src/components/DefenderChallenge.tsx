'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Trophy, CheckCircle2, XCircle, RotateCcw, ShieldCheck } from 'lucide-react';
import type { AttackScenario } from '@/data/attacks';
import { useProgress } from '@/context/ProgressContext';

interface DefenderChallengeProps {
  attack: AttackScenario;
  /** Two controls from other scenarios, used as plausible wrong answers. */
  distractors: string[];
}

interface Question {
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const hashString = (value: string) => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash = Math.imul(hash ^ value.charCodeAt(index), 16777619);
  }
  return hash >>> 0;
};

const seededShuffle = <T,>(items: T[], seed: number): T[] => {
  const result = [...items];
  let state = seed || 1;
  for (let index = result.length - 1; index > 0; index -= 1) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const swap = state % (index + 1);
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  return result;
};

export default function DefenderChallenge({ attack, distractors }: DefenderChallengeProps) {
  const { attackScores, saveAttackScore } = useProgress();
  const [selected, setSelected] = useState<(number | null)[]>([null, null]);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setSelected([null, null]);
    setSubmitted(false);
  }, [attack.id]);

  const questions = useMemo<Question[]>(() => {
    const actionStep =
      attack.steps.find((step) => step.phase === 'action') ?? attack.steps[1] ?? attack.steps[0];

    const detectionOptions = seededShuffle(
      attack.steps.map((step) => step.title),
      hashString(attack.id),
    );

    const mitigationOptions = seededShuffle(
      [attack.mitigations[0], ...distractors].slice(0, 3),
      hashString(`${attack.id}:mitigation`),
    );

    return [
      {
        prompt: `A defender observes: “${actionStep.detection}” Which step of this attack does that signal belong to?`,
        options: detectionOptions,
        correctIndex: detectionOptions.indexOf(actionStep.title),
        explanation: `That signal is listed for the “${actionStep.title}” step.`,
      },
      {
        prompt: `Which control is documented for ${attack.name}?`,
        options: mitigationOptions,
        correctIndex: mitigationOptions.indexOf(attack.mitigations[0]),
        explanation: `The documented primary control is: ${attack.mitigations[0]}.`,
      },
    ];
  }, [attack, distractors]);

  const best = attackScores[attack.id];
  const score = submitted
    ? questions.reduce((total, question, index) => (selected[index] === question.correctIndex ? total + 1 : total), 0)
    : null;

  const handleSubmit = () => {
    const finalScore = questions.reduce(
      (total, question, index) => (selected[index] === question.correctIndex ? total + 1 : total),
      0,
    );
    setSubmitted(true);
    saveAttackScore(attack.id, finalScore, questions.length);
  };

  const reset = () => {
    setSelected([null, null]);
    setSubmitted(false);
  };

  const allAnswered = selected.every((answer) => answer !== null);

  return (
    <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-500/20 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
            <Trophy className="w-4 h-4" aria-hidden="true" />
          </span>
          <div>
            <h4 className="text-sm font-bold text-white">Defender challenge</h4>
            <p className="text-[11px] text-slate-400">
              Two questions on the detection signal and the documented control.
            </p>
          </div>
        </div>

        <span
          className={`px-3 py-1 rounded-full font-mono text-xs font-bold border ${
            best && best.score === best.total
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
              : best
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
          }`}
        >
          {best ? `Best ${best.score}/${best.total}` : 'Not attempted'}
        </span>
      </div>

      <div className="space-y-4">
        {questions.map((question, questionIndex) => (
          <div key={question.prompt} className="space-y-2">
            <span className="block text-xs font-bold text-slate-200">
              {questionIndex + 1}. {question.prompt}
            </span>

            <div className="space-y-1.5" role="radiogroup" aria-label={`Question ${questionIndex + 1}`}>
              {question.options.map((option, optionIndex) => {
                const isSelected = selected[questionIndex] === optionIndex;
                const isCorrect = question.correctIndex === optionIndex;

                let style = 'border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700';
                if (submitted) {
                  if (isCorrect) style = 'border-emerald-500/50 bg-emerald-500/10 text-emerald-200';
                  else if (isSelected) style = 'border-rose-500/50 bg-rose-500/10 text-rose-200';
                  else style = 'border-slate-850 bg-slate-950/40 text-slate-500';
                } else if (isSelected) {
                  style = 'border-indigo-500/60 bg-indigo-500/20 text-white';
                }

                return (
                  <button
                    key={option}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    disabled={submitted}
                    onClick={() =>
                      setSelected((previous) => {
                        const next = [...previous];
                        next[questionIndex] = optionIndex;
                        return next;
                      })
                    }
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-xs transition-all flex items-start gap-2.5 ${style}`}
                  >
                    <span className="mt-0.5 shrink-0">
                      {submitted ? (
                        isCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                        ) : isSelected ? (
                          <XCircle className="w-4 h-4 text-rose-400" aria-hidden="true" />
                        ) : (
                          <span className="w-4 h-4 rounded-full border border-slate-700 inline-block" />
                        )
                      ) : (
                        <span
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-indigo-400 bg-indigo-500' : 'border-slate-700 bg-slate-950'
                          }`}
                        >
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </span>
                      )}
                    </span>
                    <span className="leading-relaxed">{option}</span>
                  </button>
                );
              })}
            </div>

            {submitted && (
              <p className="text-[11px] text-slate-400 leading-relaxed">{question.explanation}</p>
            )}
          </div>
        ))}
      </div>

      {!submitted ? (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!allAnswered}
          className="w-full py-2.5 rounded-xl text-xs font-bold font-mono uppercase tracking-wider bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition-colors"
        >
          Submit defender evaluation
        </button>
      ) : (
        <div
          className="rounded-xl border border-indigo-500/30 bg-slate-950/80 p-3.5 flex flex-wrap items-center justify-between gap-3"
          aria-live="polite"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0" aria-hidden="true" />
            <span className="text-xs text-slate-300">
              Score {score}/{questions.length}.{' '}
              {score === questions.length
                ? 'Both the detection signal and the primary control are correct.'
                : 'Review the telemetry and the documented controls above.'}
            </span>
          </div>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 text-xs font-mono font-bold text-indigo-300 hover:text-indigo-200 shrink-0"
          >
            <RotateCcw className="w-3 h-3" aria-hidden="true" />
            Retake
          </button>
        </div>
      )}
    </div>
  );
}
