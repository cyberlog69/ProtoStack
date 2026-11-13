'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface ProgressContextType {
  learnedProtocols: string[];
  bookmarkedProtocols: string[];
  quizScores: Record<string, number>;
  toggleLearned: (protocolId: string) => void;
  toggleBookmark: (protocolId: string) => void;
  isLearned: (protocolId: string) => boolean;
  isBookmarked: (protocolId: string) => boolean;
  saveQuizScore: (quizId: string, score: number) => void;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [learnedProtocols, setLearnedProtocols] = useState<string[]>([]);
  const [bookmarkedProtocols, setBookmarkedProtocols] = useState<string[]>([]);
  const [quizScores, setQuizScores] = useState<Record<string, number>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedLearned = localStorage.getItem('protostack_learned');
      const savedBookmarks = localStorage.getItem('protostack_bookmarks');
      const savedScores = localStorage.getItem('protostack_scores');

      if (savedLearned) setLearnedProtocols(JSON.parse(savedLearned));
      if (savedBookmarks) setBookmarkedProtocols(JSON.parse(savedBookmarks));
      if (savedScores) setQuizScores(JSON.parse(savedScores));
    } catch (e) {
      console.error('Failed to load progress from localStorage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('protostack_learned', JSON.stringify(learnedProtocols));
      localStorage.setItem('protostack_bookmarks', JSON.stringify(bookmarkedProtocols));
      localStorage.setItem('protostack_scores', JSON.stringify(quizScores));
    } catch (e) {
      console.error('Failed to save progress to localStorage', e);
    }
  }, [learnedProtocols, bookmarkedProtocols, quizScores, isLoaded]);

  const toggleLearned = (protocolId: string) => {
    setLearnedProtocols((prev) =>
      prev.includes(protocolId) ? prev.filter((id) => id !== protocolId) : [...prev, protocolId]
    );
  };

  const toggleBookmark = (protocolId: string) => {
    setBookmarkedProtocols((prev) =>
      prev.includes(protocolId) ? prev.filter((id) => id !== protocolId) : [...prev, protocolId]
    );
  };

  const isLearned = (protocolId: string) => learnedProtocols.includes(protocolId);
  const isBookmarked = (protocolId: string) => bookmarkedProtocols.includes(protocolId);

  const saveQuizScore = (quizId: string, score: number) => {
    setQuizScores((prev) => ({ ...prev, [quizId]: Math.max(prev[quizId] || 0, score) }));
  };

  return (
    <ProgressContext.Provider
      value={{
        learnedProtocols,
        bookmarkedProtocols,
        quizScores,
        toggleLearned,
        toggleBookmark,
        isLearned,
        isBookmarked,
        saveQuizScore,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
}
