import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';
import { ToastProvider } from '@/components/Toast';

export const metadata: Metadata = {
  title: 'MEMORIES 2027 — Buku Kenangan SMPN 1 Rajapolah',
  description: 'Digital Yearbook Angkatan 2026/2027 SMPN 1 Rajapolah. One School, Many Stories, A Thousand Memories.',
  keywords: 'Buku Kenangan, Yearbook Digital, SMPN 1 Rajapolah, Angkatan 2027, Album Kenangan Siswa',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0D1522',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen flex flex-col bg-cream text-navy selection:bg-gold/30 selection:text-navy-950 antialiased overflow-x-hidden">
        <ToastProvider>
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
          <BackToTop />
        </ToastProvider>
      </body>
    </html>
  );
}
