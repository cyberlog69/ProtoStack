'use client';

import React, { useState } from 'react';
import { QuizQuestion } from '@/types/protocol';
import { HelpCircle, CheckCircle2, XCircle, Award, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuizSectionProps {
  questions: QuizQuestion[];
  protocolName: string;
}

export default function QuizSection({ questions, protocolName }: QuizSectionProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});

  const handleSelect = (questionId: string, optionIndex: number) => {
    if (submitted[questionId]) return;
    setSelectedAnswers({ ...selectedAnswers, [questionId]: optionIndex });
  };

  const handleCheck = (question: QuizQuestion) => {
    setSubmitted({ ...submitted, [question.id]: true });
    if (selectedAnswers[question.id] === question.correctAnswer) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 }
      });
    }
  };

  const handleReset = (questionId: string) => {
    const newAnswers = { ...selectedAnswers };
    delete newAnswers[questionId];
    const newSubmitted = { ...submitted };
    delete newSubmitted[questionId];
    setSelectedAnswers(newAnswers);
    setSubmitted(newSubmitted);
  };

  if (!questions || questions.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            Knowledge Check & Protocol Quiz
          </h3>
          <p className="text-xs text-slate-400">
            Test your understanding of {protocolName} architecture and packet behaviors.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {questions.map((q, qIndex) => {
          const isAnswered = selectedAnswers[q.id] !== undefined;
          const isSubmitted = submitted[q.id];
          const isCorrect = selectedAnswers[q.id] === q.correctAnswer;

          return (
            <div key={q.id} className="p-5 rounded-xl border border-slate-800 bg-slate-950 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <h4 className="text-sm font-semibold text-white leading-snug">
                  <span className="text-indigo-400 font-mono mr-2">Q{qIndex + 1}.</span>
                  {q.question}
                </h4>

                {isSubmitted && (
                  <button
                    onClick={() => handleReset(q.id)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                    title="Retry question"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {q.options.map((opt, optIdx) => {
                  const isSelected = selectedAnswers[q.id] === optIdx;
                  let btnStyle = 'border-slate-800 bg-slate-900/70 text-slate-300 hover:border-slate-700 hover:bg-slate-900';

                  if (isSubmitted) {
                    if (optIdx === q.correctAnswer) {
                      btnStyle = 'border-emerald-500 bg-emerald-950/40 text-emerald-300 font-bold';
                    } else if (isSelected && !isCorrect) {
                      btnStyle = 'border-rose-500 bg-rose-950/40 text-rose-300';
                    } else {
                      btnStyle = 'border-slate-900 bg-slate-950/40 text-slate-500 opacity-60';
                    }
                  } else if (isSelected) {
                    btnStyle = 'border-indigo-500 bg-indigo-950/50 text-indigo-300 font-bold';
                  }

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelect(q.id, optIdx)}
                      disabled={isSubmitted}
                      className={`p-3 rounded-lg border text-xs text-left transition-all flex items-center justify-between ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {isSubmitted && optIdx === q.correctAnswer && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                      )}
                      {isSubmitted && isSelected && !isCorrect && (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>

              {!isSubmitted && (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => handleCheck(q)}
                    disabled={!isAnswered}
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold transition-colors"
                  >
                    Submit Answer
                  </button>
                </div>
              )}

              {isSubmitted && (
                <div className={`p-3 rounded-lg text-xs leading-relaxed ${
                  isCorrect
                    ? 'bg-emerald-950/30 border border-emerald-500/30 text-emerald-200'
                    : 'bg-rose-950/30 border border-rose-500/30 text-rose-200'
                }`}>
                  <span className="font-bold mr-1">{isCorrect ? 'Correct!' : 'Incorrect.'}</span>
                  {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

