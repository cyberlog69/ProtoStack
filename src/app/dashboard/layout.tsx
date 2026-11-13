import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Learning Dashboard',
  description:
    'Track learned protocols, quiz results, bookmarks, and curated study paths. All progress is stored locally in your browser.',
  alternates: { canonical: '/dashboard' },
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
