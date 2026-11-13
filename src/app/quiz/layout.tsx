import type { Metadata } from 'next';
import { PROTOCOLS } from '@/data/protocols';

const totalQuestions = PROTOCOLS.reduce((total, protocol) => total + protocol.quiz.length, 0);

export const metadata: Metadata = {
  title: 'Protocol Knowledge Quizzes',
  description: `Test your networking knowledge with ${totalQuestions} questions covering OSI layers, packet formats, ports, and ${PROTOCOLS.length} protocols.`,
  alternates: { canonical: '/quiz' },
};

export default function QuizLayout({ children }: { children: React.ReactNode }) {
  return children;
}
