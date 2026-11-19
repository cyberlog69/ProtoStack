'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, CheckCircle2, XCircle, RotateCcw, ShieldCheck } from 'lucide-react';
import type { AttackScenario } from '@/data/attacks';

interface DefenderChallengeProps {
  attack: AttackScenario;
  onComplete?: (score: number) => void;
}

interface Question {
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export default function DefenderChallenge({ attack, onComplete }: DefenderChallengeProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>([null, null]);
  const [submitted, setSubmitted] = useState(false);
  const [storedScore, setStoredScore] = useState<number | null>(null);

  // Load existing score from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`defender-score-${attack.id}`);
      if (saved !== null) {
        setStoredScore(parseInt(saved, 10));
      }
    } catch {
      // ignore in SSR or restricted storage
    }
  }, [attack.id]);

  // Generate deterministic questions based on attack data
  const lastStep = attack.steps[attack.steps.length - 1];
  const questions: Question[] = [
    {
      prompt: 'Which telemetry or signal would alert a defender that this attack is underway?',
      options: [
        lastStep.detection,
        'Standard TLS handshake completion with valid certificates',
        'Routine DHCP ACK packets with default lease durations',
      ],
      correctIndex: 0,
      explanation: lastStep.detection,
    },
    {
      prompt: 'Which primary security control removes the precondition this attack depends on?',
      options: [
        'Enabling full disk encryption on employee endpoints',
        attack.mitigations[0] ?? 'Strict cryptographic verification and access controls',
        'Increasing default TCP receive window buffer size',
      ],
      correctIndex: 1,
      explanation: attack.mitigations[0] ?? 'Enforcing strict protocol defenses at the boundary.',
    },
  ];

  const handleSelect = (questionIndex: number, optionIndex: number) => {
    if (submitted) return;
    setSelectedAnswers((prev) => {
      const next = [...prev];
      next[questionIndex] = optionIndex;
      return next;
    });
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        score += 1;
      }
    });
    return score;
  };

  const handleSubmit = () => {
    const finalScore = calculateScore();
    setSubmitted(true);
    setStoredScore(finalScore);
    try {
      localStorage.setItem(`defender-score-${attack.id}`, finalScore.toString());
    } catch {
      // ignore
    }
    onComplete?.(finalScore);
  };

  const handleReset = () => {
    setSelectedAnswers([null, null]);
    setSubmitted(false);
  };

  const allAnswered = selectedAnswers.every((ans) => ans !== null);
  const currentScore = submitted ? calculateScore() : storedScore;

  return (
    <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-5 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-500/20 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
            <Trophy className="w-4 h-4" aria-hidden="true" />
          </span>
          <div>
            <h4 className="text-sm font-bold text-white">Defender Challenge</h4>
            <p className="text-[11px] text-slate-400">
              Verify your comprehension of the detection signals and mitigations.
            </p>
          </div>
        </div>

        {currentScore !== null && (
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full font-mono text-xs font-bold border ${
                currentScore === 2
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : currentScore === 1
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
              }`}
            >
              Score: {currentScore} / {questions.length}
            </span>
            {submitted && (
              <button
                type="button"
                onClick={handleReset}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Retry challenge"
                aria-label="Retry challenge"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="space-y-4">
        {questions.map((q, qIndex) => {
          const selected = selectedAnswers[qIndex];
          return (
            <div key={qIndex} className="space-y-2">
              <span className="block text-xs font-bold text-slate-200">
                {qIndex + 1}. {q.prompt}
              </span>

              <div className="space-y-1.5" role="radiogroup">
                {q.options.map((option, optIndex) => {
                  const isSelected = selected === optIndex;
                  const isCorrect = q.correctIndex === optIndex;

                  let buttonStyle =
                    'border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700 hover:bg-slate-850';

                  if (submitted) {
                    if (isCorrect) {
                      buttonStyle = 'border-emerald-500/50 bg-emerald-500/10 text-emerald-200';
                    } else if (isSelected && !isCorrect) {
                      buttonStyle = 'border-rose-500/50 bg-rose-500/10 text-rose-200';
                    } else {
                      buttonStyle = 'border-slate-850 bg-slate-950/40 text-slate-500';
                    }
                  } else if (isSelected) {
                    buttonStyle =
                      'border-indigo-500/60 bg-indigo-500/20 text-white shadow-sm shadow-indigo-500/20';
                  }

                  return (
                    <button
                      key={optIndex}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      disabled={submitted}
                      onClick={() => handleSelect(qIndex, optIndex)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-xs transition-all flex items-start gap-2.5 ${buttonStyle}`}
                    >
                      <span className="mt-0.5 shrink-0">
                        {submitted ? (
                          isCorrect ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : isSelected ? (
                            <XCircle className="w-4 h-4 text-rose-400" />
                          ) : (
                            <span className="w-4 h-4 rounded-full border border-slate-700 inline-block" />
                          )
                        ) : (
                          <span
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected
                                ? 'border-indigo-400 bg-indigo-500'
                                : 'border-slate-700 bg-slate-950'
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
            </div>
          );
        })}
      </div>

      {!submitted ? (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!allAnswered}
          className="w-full py-2.5 rounded-xl text-xs font-bold font-mono transition-all uppercase tracking-wider bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white shadow-md shadow-indigo-900/40"
        >
          Submit Defender Evaluation
        </button>
      ) : (
        <div className="rounded-xl border border-indigo-500/30 bg-slate-950/80 p-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0" />
            <span className="text-xs text-slate-300">
              {calculateScore() === 2
                ? 'Excellent! You have mastered both the telemetry detection and core mitigation.'
                : 'Review the threat model above to reinforce detection indicators.'}
            </span>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="text-xs font-mono font-bold text-indigo-300 hover:text-indigo-200 shrink-0"
          >
            Retake
          </button>
        </div>
      )}
    </div>
  );
}
