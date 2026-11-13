'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export interface QuizScore {
  score: number;
  total: number;
  updatedAt: string;
}

interface ProgressContextType {
  learnedProtocols: string[];
  bookmarkedProtocols: string[];
  quizScores: Record<string, QuizScore>;
  toggleLearned: (protocolId: string) => void;
  toggleBookmark: (protocolId: string) => void;
  isLearned: (protocolId: string) => boolean;
  isBookmarked: (protocolId: string) => boolean;
  saveQuizScore: (quizId: string, score: number, total: number) => void;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

const LEARNED_KEY = 'protostack_learned';
const BOOKMARKS_KEY = 'protostack_bookmarks';
const SCORES_KEY = 'protostack_scores';

function parseStringArray(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

function parseScores(raw: string | null): Record<string, QuizScore> {
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};

    const scores: Record<string, QuizScore> = {};
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (!value || typeof value !== 'object') continue;
      const candidate = value as Partial<QuizScore>;
      if (
        typeof candidate.score === 'number' &&
        Number.isFinite(candidate.score) &&
        typeof candidate.total === 'number' &&
        Number.isFinite(candidate.total) &&
        candidate.total > 0
      ) {
        scores[key] = {
          score: Math.max(0, Math.min(candidate.score, candidate.total)),
          total: candidate.total,
          updatedAt: typeof candidate.updatedAt === 'string' ? candidate.updatedAt : new Date().toISOString(),
        };
      }
    }
    return scores;
  } catch {
    return {};
  }
}

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [learnedProtocols, setLearnedProtocols] = useState<string[]>([]);
  const [bookmarkedProtocols, setBookmarkedProtocols] = useState<string[]>([]);
  const [quizScores, setQuizScores] = useState<Record<string, QuizScore>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  const loadFromStorage = useCallback(() => {
    setLearnedProtocols(parseStringArray(localStorage.getItem(LEARNED_KEY)));
    setBookmarkedProtocols(parseStringArray(localStorage.getItem(BOOKMARKS_KEY)));
    setQuizScores(parseScores(localStorage.getItem(SCORES_KEY)));
  }, []);

  useEffect(() => {
    try {
      loadFromStorage();
    } catch (error) {
      console.error('Failed to load progress from localStorage', error);
    } finally {
      setIsLoaded(true);
    }
  }, [loadFromStorage]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(LEARNED_KEY, JSON.stringify(learnedProtocols));
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarkedProtocols));
      localStorage.setItem(SCORES_KEY, JSON.stringify(quizScores));
    } catch (error) {
      console.error('Failed to save progress to localStorage', error);
    }
  }, [learnedProtocols, bookmarkedProtocols, quizScores, isLoaded]);

  // Keep multiple tabs in sync.
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (![LEARNED_KEY, BOOKMARKS_KEY, SCORES_KEY].includes(event.key || '')) return;
      try {
        loadFromStorage();
      } catch {
        // Ignore unavailable storage in private browsing modes.
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [loadFromStorage]);

  const toggleLearned = useCallback((protocolId: string) => {
    setLearnedProtocols((previous) =>
      previous.includes(protocolId)
        ? previous.filter((id) => id !== protocolId)
        : [...previous, protocolId],
    );
  }, []);

  const toggleBookmark = useCallback((protocolId: string) => {
    setBookmarkedProtocols((previous) =>
      previous.includes(protocolId)
        ? previous.filter((id) => id !== protocolId)
        : [...previous, protocolId],
    );
  }, []);

  const isLearned = useCallback(
    (protocolId: string) => learnedProtocols.includes(protocolId),
    [learnedProtocols],
  );

  const isBookmarked = useCallback(
    (protocolId: string) => bookmarkedProtocols.includes(protocolId),
    [bookmarkedProtocols],
  );

  const saveQuizScore = useCallback((quizId: string, score: number, total: number) => {
    if (!Number.isFinite(score) || !Number.isFinite(total) || total <= 0) return;
    const normalizedScore = Math.max(0, Math.min(Math.round(score), Math.round(total)));
    const normalizedTotal = Math.round(total);

    setQuizScores((previous) => {
      const existing = previous[quizId];
      const previousRatio = existing ? existing.score / existing.total : -1;
      const nextRatio = normalizedScore / normalizedTotal;

      if (existing && previousRatio > nextRatio) return previous;

      return {
        ...previous,
        [quizId]: {
          score: normalizedScore,
          total: normalizedTotal,
          updatedAt: new Date().toISOString(),
        },
      };
    });
  }, []);

  const value = useMemo(
    () => ({
      learnedProtocols,
      bookmarkedProtocols,
      quizScores,
      toggleLearned,
      toggleBookmark,
      isLearned,
      isBookmarked,
      saveQuizScore,
    }),
    [
      learnedProtocols,
      bookmarkedProtocols,
      quizScores,
      toggleLearned,
      toggleBookmark,
      isLearned,
      isBookmarked,
      saveQuizScore,
    ],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
}
