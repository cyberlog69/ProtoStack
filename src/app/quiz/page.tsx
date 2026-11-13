'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { PROTOCOLS } from '@/data/protocols';
import { QuizQuestion } from '@/types/protocol';
import { useProgress } from '@/context/ProgressContext';
import confetti from 'canvas-confetti';
import { Award, CheckCircle2, XCircle, RotateCcw, Brain, ArrowRight } from 'lucide-react';

const CATEGORY_FILTERS = [
  { id: 'all', label: 'All Protocols' },
  { id: 'network', label: 'Network & Internet' },
  { id: 'transport', label: 'Transport Layer' },
  { id: 'application', label: 'Application Layer' },
  { id: 'iot', label: 'IoT & SCADA' },
  { id: 'security', label: 'Security & Auth' },
  { id: 'wireless', label: 'Wireless & Radio' },
  { id: 'cloud', label: 'Cloud & Messaging' },
];

type QuestionLimit = 10 | 25 | 'all';

interface QuizItem {
  question: QuizQuestion;
  protocolName: string;
  protocolId: string;
}

function seededShuffle<T>(items: T[], seed: number): T[] {
  const shuffled = [...items];
  let state = seed || 1;

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    state = (state * 1664525 + 1013904223) >>> 0;
    const swapIndex = state % (index + 1);
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

export default function QuizArenaPage() {
  const { saveQuizScore } = useProgress();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [questionLimit, setQuestionLimit] = useState<QuestionLimit>(10);
  const [seed, setSeed] = useState(1);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    setSeed((previous) => {
      const next = Math.floor(Math.random() * 2_000_000_000) + 1;
      return next === previous ? next + 1 : next;
    });
  }, [selectedCategory, questionLimit]);

  const allQuestions: QuizItem[] = useMemo(() => {
    const list: QuizItem[] = [];

    for (const protocol of PROTOCOLS) {
      if (selectedCategory !== 'all' && protocol.category !== selectedCategory) continue;
      for (const question of protocol.quiz) {
        list.push({
          question,
          protocolName: protocol.name,
          protocolId: protocol.id,
        });
      }
    }

    const shuffled = seededShuffle(list, seed);
    const count = questionLimit === 'all' ? shuffled.length : Math.min(questionLimit, shuffled.length);
    return shuffled.slice(0, count);
  }, [selectedCategory, questionLimit, seed]);

  const currentItem = allQuestions[currentQuestionIdx];
  const progressPercent =
    allQuestions.length > 0 ? Math.round((currentQuestionIdx / allQuestions.length) * 100) : 0;

  const handleSelectOption = (index: number) => {
    if (isAnswerSubmitted) return;
    setSelectedAnswer(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || !currentItem) return;
    setIsAnswerSubmitted(true);

    if (selectedAnswer === currentItem.question.correctAnswer) {
      setScore((previous) => previous + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIdx < allQuestions.length - 1) {
      const nextIndex = currentQuestionIdx + 1;
      setCurrentQuestionIdx(nextIndex);
      setSelectedAnswer(null);
      setIsAnswerSubmitted(false);
      return;
    }

    setIsCompleted(true);
    saveQuizScore(`quiz-${selectedCategory}`, score, allQuestions.length);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const resetSession = (newSeed = Math.floor(Math.random() * 2_000_000_000) + 1) => {
    setSeed(newSeed);
    setCurrentQuestionIdx(0);
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setIsCompleted(false);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentQuestionIdx(0);
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setIsCompleted(false);
  };

  const handleLimitChange = (limit: QuestionLimit) => {
    setQuestionLimit(limit);
    setCurrentQuestionIdx(0);
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setIsCompleted(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="text-center space-y-3 pt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-medium">
          <Brain className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
          <span>Interactive Protocol Certification &amp; Knowledge Arena</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
          Protocol Knowledge{' '}
          <span className="bg-gradient-to-r from-amber-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            Challenges
          </span>
        </h1>

        <p className="text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
          Test your mastery of OSI layers, RFC specs, frame headers, and IoT protocols.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2" aria-label="Filter by category">
        {CATEGORY_FILTERS.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => handleCategoryChange(category.id)}
            aria-pressed={selectedCategory === category.id}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all border ${
              selectedCategory === category.id
                ? 'bg-indigo-600 text-white font-bold border-indigo-400 shadow-md shadow-indigo-600/30'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-mono text-slate-400">
        <span className="uppercase tracking-wider">Questions:</span>
        {([10, 25, 'all'] as const).map((limit) => (
          <button
            key={limit}
            type="button"
            onClick={() => handleLimitChange(limit)}
            aria-pressed={questionLimit === limit}
            className={`px-3 py-1 rounded-lg border transition-colors ${
              questionLimit === limit
                ? 'bg-slate-800 text-white border-slate-600'
                : 'bg-slate-900 border-slate-800 hover:border-slate-700'
            }`}
          >
            {limit === 'all' ? 'All available' : limit}
          </button>
        ))}
      </div>

      {!isCompleted && currentItem ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 md:p-8 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800 pb-4">
            <span className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">
                {currentItem.protocolName}
              </span>
              <span>
                Question {currentQuestionIdx + 1} of {allQuestions.length}
              </span>
            </span>

            <span className="text-emerald-400 font-bold">
              Score: {score} / {allQuestions.length}
            </span>
          </div>

          <div
            className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progressPercent}
            aria-label="Quiz progress"
          >
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-white leading-snug">
            {currentItem.question.question}
          </h2>

          <div className="space-y-3">
            {currentItem.question.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              let buttonStyle =
                'border-slate-800 bg-slate-950/80 text-slate-200 hover:border-slate-700 hover:bg-slate-900';

              if (isAnswerSubmitted) {
                if (index === currentItem.question.correctAnswer) {
                  buttonStyle = 'border-emerald-500 bg-emerald-950/50 text-emerald-200 font-bold';
                } else if (isSelected) {
                  buttonStyle = 'border-rose-500 bg-rose-950/50 text-rose-200';
                } else {
                  buttonStyle = 'border-slate-900 bg-slate-950/30 text-slate-400 opacity-60';
                }
              } else if (isSelected) {
                buttonStyle = 'border-indigo-500 bg-indigo-950/60 text-indigo-200 font-bold';
              }

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelectOption(index)}
                  disabled={isAnswerSubmitted}
                  aria-pressed={isSelected}
                  className={`w-full p-4 rounded-xl border text-sm text-left transition-all flex items-center justify-between font-mono ${buttonStyle}`}
                >
                  <span className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-md bg-slate-900 border border-slate-800 flex items-center justify-center text-xs font-bold shrink-0">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span>{option}</span>
                  </span>

                  {isAnswerSubmitted && index === currentItem.question.correctAnswer && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 ml-2" aria-hidden="true" />
                  )}
                  {isAnswerSubmitted && isSelected && index !== currentItem.question.correctAnswer && (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0 ml-2" aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>

          {isAnswerSubmitted && (
            <div
              role="status"
              className={`p-4 rounded-xl text-xs leading-relaxed font-mono ${
                selectedAnswer === currentItem.question.correctAnswer
                  ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-950/40 border border-rose-500/40 text-rose-200'
              }`}
            >
              <span className="font-bold mr-1">
                {selectedAnswer === currentItem.question.correctAnswer ? 'Correct!' : 'Incorrect.'}
              </span>
              {currentItem.question.explanation}
            </div>
          )}

          <div className="flex justify-end pt-2">
            {!isAnswerSubmitted ? (
              <button
                type="button"
                onClick={handleSubmitAnswer}
                disabled={selectedAnswer === null}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-xs transition-colors shadow-md shadow-indigo-600/30"
              >
                Submit Answer
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNextQuestion}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-emerald-600/30"
              >
                <span>{currentQuestionIdx < allQuestions.length - 1 ? 'Next Question' : 'View Results'}</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      ) : isCompleted ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center mx-auto">
            <Award className="w-8 h-8 text-amber-400" aria-hidden="true" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Challenge Completed!</h2>
            <p className="text-sm text-slate-300">
              You scored{' '}
              <strong className="text-emerald-400 text-lg font-mono">{score}</strong> out of {allQuestions.length} (
              {Math.round((score / allQuestions.length) * 100)}%)
            </p>
            <p className="text-xs text-slate-400">Best scores are saved automatically in this browser.</p>
          </div>

          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <button
              type="button"
              onClick={() => resetSession()}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              <span>Retry with a new set</span>
            </button>
            <button
              type="button"
              onClick={() => resetSession(1)}
              className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Retry same order
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 text-slate-400">No questions available in this category.</div>
      )}
    </div>
  );
}
