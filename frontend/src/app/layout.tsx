import type { Metadata } from 'next';
import { Inter, Newsreader } from 'next/font/google';
import './globals.css';
import QueryProvider from '@/components/providers/QueryProvider';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const newsreader = Newsreader({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Bargorya — Independent Product Reviews & Smart Deals Journal',
  description: 'Unbiased laboratory product evaluations, vetted shopping discounts, and independent technology reviews to help consumers save wisely.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    siteName: 'Bargorya',
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${newsreader.variable}`}>
      <body className={`${inter.className} min-h-screen bg-[#F8F8F6] text-[#171717] antialiased selection:bg-[#c62828] selection:text-white`}>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
