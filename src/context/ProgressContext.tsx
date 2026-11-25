'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  createProgressSnapshot,
  parseProgressSnapshot,
  parseScoreMap,
  serializeProgressSnapshot,
  type StoredScore,
} from '@/lib/progress-transfer';

export type QuizScore = StoredScore;

export type ProgressImportResult =
  | { ok: true; lessons: number; quizzes: number; attacks: number }
  | { ok: false; error: string };

interface ProgressContextType {
  learnedProtocols: string[];
  bookmarkedProtocols: string[];
  quizScores: Record<string, QuizScore>;
  attackScores: Record<string, QuizScore>;
  /** True once localStorage has been read, so callers can avoid rendering zeroes first. */
  isLoaded: boolean;
  toggleLearned: (protocolId: string) => void;
  toggleBookmark: (protocolId: string) => void;
  isLearned: (protocolId: string) => boolean;
  isBookmarked: (protocolId: string) => boolean;
  saveQuizScore: (quizId: string, score: number, total: number) => void;
  saveAttackScore: (attackId: string, score: number, total: number) => void;
  /** Versioned JSON backup of everything stored locally. */
  exportProgress: () => string;
  /** Replace local progress from a backup created by exportProgress. */
  importProgress: (raw: string) => ProgressImportResult;
  /** Delete all locally stored progress. */
  resetProgress: () => void;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

const LEARNED_KEY = 'protostack_learned';
const BOOKMARKS_KEY = 'protostack_bookmarks';
const SCORES_KEY = 'protostack_scores';
const ATTACK_SCORES_KEY = 'protostack_attack_scores';
const STORAGE_KEYS = [LEARNED_KEY, BOOKMARKS_KEY, SCORES_KEY, ATTACK_SCORES_KEY];

function parseStringArray(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

function readScores(raw: string | null): Record<string, QuizScore> {
  if (!raw) return {};
  try {
    return parseScoreMap(JSON.parse(raw));
  } catch {
    return {};
  }
}

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [learnedProtocols, setLearnedProtocols] = useState<string[]>([]);
  const [bookmarkedProtocols, setBookmarkedProtocols] = useState<string[]>([]);
  const [quizScores, setQuizScores] = useState<Record<string, QuizScore>>({});
  const [attackScores, setAttackScores] = useState<Record<string, QuizScore>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  const loadFromStorage = useCallback(() => {
    setLearnedProtocols(parseStringArray(localStorage.getItem(LEARNED_KEY)));
    setBookmarkedProtocols(parseStringArray(localStorage.getItem(BOOKMARKS_KEY)));
    setQuizScores(readScores(localStorage.getItem(SCORES_KEY)));
    setAttackScores(readScores(localStorage.getItem(ATTACK_SCORES_KEY)));
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
      localStorage.setItem(ATTACK_SCORES_KEY, JSON.stringify(attackScores));
    } catch (error) {
      console.error('Failed to save progress to localStorage', error);
    }
  }, [learnedProtocols, bookmarkedProtocols, quizScores, attackScores, isLoaded]);

  // Keep multiple tabs in sync.
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (!STORAGE_KEYS.includes(event.key || '')) return;
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

  const saveAttackScore = useCallback((attackId: string, score: number, total: number) => {
    if (!Number.isFinite(score) || !Number.isFinite(total) || total <= 0) return;
    const normalizedScore = Math.max(0, Math.min(Math.round(score), Math.round(total)));
    const normalizedTotal = Math.round(total);

    setAttackScores((previous) => {
      const existing = previous[attackId];
      const previousRatio = existing ? existing.score / existing.total : -1;
      const nextRatio = normalizedScore / normalizedTotal;

      if (existing && previousRatio > nextRatio) return previous;

      return {
        ...previous,
        [attackId]: {
          score: normalizedScore,
          total: normalizedTotal,
          updatedAt: new Date().toISOString(),
        },
      };
    });
  }, []);

  const exportProgress = useCallback(
    () =>
      serializeProgressSnapshot(
        createProgressSnapshot({
          learnedProtocols,
          bookmarkedProtocols,
          quizScores,
          attackScores,
        }),
      ),
    [attackScores, bookmarkedProtocols, learnedProtocols, quizScores],
  );

  const importProgress = useCallback((raw: string): ProgressImportResult => {
    const parsed = parseProgressSnapshot(raw);
    if (!parsed.ok) return parsed;

    const { snapshot } = parsed;
    setLearnedProtocols(snapshot.learnedProtocols);
    setBookmarkedProtocols(snapshot.bookmarkedProtocols);
    setQuizScores(snapshot.quizScores);
    setAttackScores(snapshot.attackScores);

    return {
      ok: true,
      lessons: snapshot.learnedProtocols.length,
      quizzes: Object.keys(snapshot.quizScores).length,
      attacks: Object.keys(snapshot.attackScores).length,
    };
  }, []);

  const resetProgress = useCallback(() => {
    setLearnedProtocols([]);
    setBookmarkedProtocols([]);
    setQuizScores({});
    setAttackScores({});
    try {
      for (const key of STORAGE_KEYS) localStorage.removeItem(key);
    } catch {
      // State is still cleared even if storage is unavailable.
    }
  }, []);

  const value = useMemo(
    () => ({
      learnedProtocols,
      bookmarkedProtocols,
      quizScores,
      attackScores,
      isLoaded,
      toggleLearned,
      toggleBookmark,
      isLearned,
      isBookmarked,
      saveQuizScore,
      saveAttackScore,
      exportProgress,
      importProgress,
      resetProgress,
    }),
    [
      learnedProtocols,
      bookmarkedProtocols,
      quizScores,
      attackScores,
      isLoaded,
      toggleLearned,
      toggleBookmark,
      isLearned,
      isBookmarked,
      saveQuizScore,
      saveAttackScore,
      exportProgress,
      importProgress,
      resetProgress,
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
