'use client';

import React, { useState } from 'react';
import { PROTOCOLS } from '@/data/protocols';
import { QuizQuestion } from '@/types/protocol';
import { useProgress } from '@/context/ProgressContext';
import confetti from 'canvas-confetti';
import { Award, CheckCircle2, XCircle, RotateCcw, Brain, Sparkles, ArrowRight, Shield, Cpu, Globe, Network } from 'lucide-react';

export default function QuizArenaPage() {
  const { saveQuizScore } = useProgress();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Collect all questions from protocols matching category
  const allQuestions: { question: QuizQuestion; protocolName: string }[] = React.useMemo(() => {
    const list: { question: QuizQuestion; protocolName: string }[] = [];
    PROTOCOLS.forEach((p) => {
      if (selectedCategory === 'all' || p.category === selectedCategory) {
        p.quiz.forEach((q) => {
          list.push({ question: q, protocolName: p.name });
        });
      }
    });
    return list;
  }, [selectedCategory]);

  const currentItem = allQuestions[currentQuestionIdx];

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedAnswer(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || !currentItem) return;
    setIsAnswerSubmitted(true);

    if (selectedAnswer === currentItem.question.correctAnswer) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIdx < allQuestions.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswerSubmitted(false);
    } else {
      setIsCompleted(true);
      saveQuizScore(`quiz-${selectedCategory}`, score);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIdx(0);
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setIsCompleted(false);
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentQuestionIdx(0);
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setIsCompleted(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Hero Header */}
      <div className="text-center space-y-3 pt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-medium">
          <Brain className="w-3.5 h-3.5 text-amber-400" />
          <span>Interactive Protocol Certification & Knowledge Arena</span>
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

      {/* Category Filter Chips */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {[
          { id: 'all', label: 'All Protocols' },
          { id: 'network', label: 'Network & Internet' },
          { id: 'application', label: 'Application Layer' },
          { id: 'iot', label: 'IoT & SCADA' },
          { id: 'security', label: 'Security & Auth' },
          { id: 'wireless', label: 'Wireless & Radio' },
          { id: 'cloud', label: 'Cloud & Messaging' }
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all border ${
              selectedCategory === cat.id
                ? 'bg-indigo-600 text-white font-bold border-indigo-400 shadow-md shadow-indigo-600/30'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Quiz Card */}
      {!isCompleted && currentItem ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 md:p-8 space-y-6 shadow-2xl">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800 pb-4">
            <span className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">
                {currentItem.protocolName}
              </span>
              <span>Question {currentQuestionIdx + 1} of {allQuestions.length}</span>
            </span>

            <span className="text-emerald-400 font-bold">
              Score: {score} / {allQuestions.length}
            </span>
          </div>

          {/* Question Text */}
          <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">
            {currentItem.question.question}
          </h3>

          {/* Options */}
          <div className="space-y-3">
            {currentItem.question.options.map((opt, idx) => {
              const isSelected = selectedAnswer === idx;
              let btnStyle = 'border-slate-800 bg-slate-950/80 text-slate-200 hover:border-slate-700 hover:bg-slate-900';

              if (isAnswerSubmitted) {
                if (idx === currentItem.question.correctAnswer) {
                  btnStyle = 'border-emerald-500 bg-emerald-950/50 text-emerald-200 font-bold';
                } else if (isSelected) {
                  btnStyle = 'border-rose-500 bg-rose-950/50 text-rose-200';
                } else {
                  btnStyle = 'border-slate-900 bg-slate-950/30 text-slate-500 opacity-50';
                }
              } else if (isSelected) {
                btnStyle = 'border-indigo-500 bg-indigo-950/60 text-indigo-200 font-bold';
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={isAnswerSubmitted}
                  className={`w-full p-4 rounded-xl border text-sm text-left transition-all flex items-center justify-between font-mono ${btnStyle}`}
                >
                  <span className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-md bg-slate-900 border border-slate-800 flex items-center justify-center text-xs font-bold shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{opt}</span>
                  </span>

                  {isAnswerSubmitted && idx === currentItem.question.correctAnswer && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 ml-2" />
                  )}
                  {isAnswerSubmitted && isSelected && idx !== currentItem.question.correctAnswer && (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Feedback & Explanation */}
          {isAnswerSubmitted && (
            <div className={`p-4 rounded-xl text-xs leading-relaxed font-mono ${
              selectedAnswer === currentItem.question.correctAnswer
                ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-200'
                : 'bg-rose-950/40 border border-rose-500/40 text-rose-200'
            }`}>
              <span className="font-bold mr-1">
                {selectedAnswer === currentItem.question.correctAnswer ? '🎉 Correct!' : '❌ Incorrect.'}
              </span>
              {currentItem.question.explanation}
            </div>
          )}

          {/* Action Bar */}
          <div className="flex justify-end pt-2">
            {!isAnswerSubmitted ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={selectedAnswer === null}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-xs transition-colors shadow-md shadow-indigo-600/30"
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-emerald-600/30"
              >
                <span>{currentQuestionIdx < allQuestions.length - 1 ? 'Next Question' : 'View Results'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : isCompleted ? (
        /* Results Screen */
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center mx-auto">
            <Award className="w-8 h-8 text-amber-400" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white">Challenge Completed!</h3>
            <p className="text-sm text-slate-300">
              You scored <strong className="text-emerald-400 text-lg font-mono">{score}</strong> out of {allQuestions.length} ({Math.round((score / allQuestions.length) * 100)}%)
            </p>
          </div>

          <div className="pt-4 flex justify-center gap-4">
            <button
              onClick={handleRestart}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry Challenge</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 text-slate-500">
          No questions available in this category.
        </div>
      )}
    </div>
  );
}
