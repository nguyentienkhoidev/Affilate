import type { Metadata } from 'next';
import { Inter, Newsreader } from 'next/font/google';
import './globals.css';
import QueryProvider from '@/components/providers/QueryProvider';
import { ThemeProvider } from '@/context/ThemeContext';

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

import { SITE_URL } from '@/constants/site';

const BACKEND_BASE = (
  process.env.BACKEND_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:8080'
).replace(/\/api\/v1\/?$/, '');

export async function generateMetadata(): Promise<Metadata> {
  let map: Record<string, string> = {};
  try {
    const res = await fetch(`${BACKEND_BASE}/api/v1/settings/public`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const json = await res.json();
      map = json?.data?.settings || json?.data || {};
    }
  } catch {
    // Fallback gracefully if backend is temporarily unreachable during build
  }

  const siteName = map.site_name || 'HeyGoodly';
  const title = map.meta_title || map.default_meta_title || `${siteName} — Independent Product Reviews & Smart Deals Journal`;
  const description =
    map.meta_description ||
    map.default_meta_description ||
    'Unbiased laboratory product evaluations, vetted shopping discounts, and independent technology reviews to help consumers save wisely.';
  const canonicalBase = map.canonical_url || SITE_URL;
  const favicon = map.site_favicon || undefined;
  const ogImage = map.og_image || undefined;
  const noIndex = map.no_index === 'true';

  return {
    title,
    description,
    metadataBase: new URL(canonicalBase),
    ...(favicon ? { icons: { icon: favicon, shortcut: favicon, apple: favicon } } : {}),
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      title,
      description,
      siteName,
      locale: 'en_US',
      type: 'website',
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${newsreader.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var m=localStorage.getItem('heygoodly:theme');if(m==='dark'){document.documentElement.classList.add('dark');document.documentElement.setAttribute('data-theme','dark');document.documentElement.style.colorScheme='dark';}}catch(e){}`,
          }}
        />
      </head>
      <body className={`${inter.className} min-h-screen bg-[#F8F8F6] text-[#171717] antialiased selection:bg-[#c62828] selection:text-white transition-colors duration-200`}>
        <ThemeProvider>
          <QueryProvider>
            {children}
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
