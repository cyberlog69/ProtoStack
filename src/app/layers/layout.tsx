import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'OSI 7-Layer & TCP/IP Model',
  description:
    'Explore the OSI 7-layer reference model and the practical TCP/IP stack, with an interactive encapsulation simulator and layer-by-layer protocol mapping.',
  alternates: { canonical: '/layers' },
};

export default function LayersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
