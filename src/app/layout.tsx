import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ProgressProvider } from '@/context/ProgressContext';

export const metadata: Metadata = {
  title: 'ProtoStack — Interactive Network & IoT Protocols Learning Platform',
  description: 'Explore and master computer networking, internet, and IoT protocols through interactive step-by-step animations and live sandboxes.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
        <ProgressProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </ProgressProvider>
      </body>
    </html>
  );
}
