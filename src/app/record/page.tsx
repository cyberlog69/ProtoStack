import type { Metadata } from 'next';
import LearningRecord from '@/components/LearningRecord';

export const metadata: Metadata = {
  title: 'Your learning record',
  description:
    'Print, export or import the lesson, quiz and defender-challenge progress stored in your browser. Free, no account, not an accredited certificate.',
  robots: { index: false, follow: false },
};

export default function RecordPage() {
  return <LearningRecord />;
}
