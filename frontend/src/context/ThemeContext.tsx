'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type ThemeMode = 'light' | 'dark';

interface ThemeContextValue {
  theme: ThemeMode;
  isDark: boolean;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const STORAGE_KEY = 'heygoodly:theme';

const DARK_MODE_CSS = `
html.dark {
  color-scheme: dark;
  --background: #0b0e14;
  --foreground: #f1f5f9;
  --surface: #121722;
  --surface-elevated: #181f2e;
  --surface-hover: #1e2638;
  --border: #232b3e;
  --border-subtle: #1a2130;
  --muted: #94a3b8;
}

html.dark,
html.dark body {
  background-color: #0b0e14 !important;
  color: #f1f5f9 !important;
}

/* Custom sleek dark scrollbars */
html.dark ::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
html.dark ::-webkit-scrollbar-track {
  background: #0b0e14;
}
html.dark ::-webkit-scrollbar-thumb {
  background: #252e42;
  border-radius: 9999px;
}
html.dark ::-webkit-scrollbar-thumb:hover {
  background: #35415c;
}

/* ============================================================================
   1. LEVEL 0: PAGE CANVAS BACKGROUNDS (CLIENT & ADMIN)
   ============================================================================ */
html.dark main,
html.dark [class~="bg-[#F8F8F6]"],
html.dark [class~="bg-[#f8fafc]"],
html.dark [class~="bg-[#F8FAFC]"],
html.dark [class~="bg-[#f4f5f7]"],
html.dark [class~="bg-[#F4F5F7]"],
html.dark [class~="bg-[#FBFBF9]"],
html.dark [class~="bg-[#FAF9F5]"],
html.dark [class~="bg-[#eef2f7]"],
html.dark [class~="bg-[#f0f0ee]"],
html.dark [class~="bg-[#f3f2f1]"],
html.dark .min-h-screen[class~="bg-slate-50"],
html.dark .min-h-screen[class~="bg-zinc-50"],
html.dark .h-screen[class~="bg-zinc-50"] {
  background-color: #0b0e14 !important;
}

/* ============================================================================
   2. CLIENT HEADER, STICKY NAV & FLASH NEWS TICKER (SEAMLESS EDITORIAL LOOK)
   ============================================================================ */
html.dark header {
  background-color: #0e121b !important;
  border-color: #1e2536 !important;
  box-shadow: none !important;
}

html.dark header > div[class~="bg-white"],
html.dark header > nav[class~="bg-white"],
html.dark header nav > div[class~="bg-white"],
html.dark header [class~="bg-white"],
html.dark header [class^="bg-white/"],
html.dark header [class*=" bg-white/"] {
  background-color: #0e121b !important;
  border-color: #1e2536 !important;
  box-shadow: none !important;
}

html.dark header [class~="bg-[#F8F8F6]"] {
  background-color: #090c12 !important;
  border-color: #1b2232 !important;
  box-shadow: none !important;
}

/* Header 728x90 Partner Spotlight Banner */
html.dark header div[class~="bg-[#171717]"] {
  background: linear-gradient(135deg, #151b29 0%, #101520 100%) !important;
  border-color: #28324a !important;
}

/* ============================================================================
   3. LEVEL 1: ELEVATED CARDS, SURFACES, TABLES & MODALS
   ============================================================================ */
html.dark [class~="bg-white"]:not(header *),
html.dark [class~="bg-white/95"]:not(header *),
html.dark [class~="bg-white/90"]:not(header *),
html.dark [class~="bg-white/85"]:not(header *),
html.dark [class~="bg-white/80"]:not(header *),
html.dark [class~="bg-white/75"]:not(header *),
html.dark [class~="bg-white/70"]:not(header *),
html.dark [class~="bg-white/60"]:not(header *),
html.dark [class~="bg-white/50"]:not(header *),
html.dark [class~="bg-white/40"]:not(header *),
html.dark [class~="bg-[#F8F8F6]/95"] {
  background-color: #121722 !important;
  box-shadow: 0 1px 0 0 rgba(255, 255, 255, 0.04) inset, 0 10px 28px -8px rgba(0, 0, 0, 0.55) !important;
}

/* Keep table body and inline pills clean without heavy outer drop shadows */
html.dark tbody[class~="bg-white"],
html.dark span[class~="bg-white"],
html.dark a[class~="bg-white"],
html.dark button[class~="bg-white"] {
  background-color: #161c2a !important;
  box-shadow: none !important;
}

/* ============================================================================
   4. LEVEL 2: SUBTLE WELLS, TABLE HEADERS & SECONDARY CONTAINERS
   ============================================================================ */
html.dark thead,
html.dark [class~="bg-[#F2F2EE]"],
html.dark [class~="bg-[#EFECE6]"],
html.dark [class~="bg-slate-50"]:not(.min-h-screen),
html.dark [class~="bg-zinc-50"]:not(.h-screen):not(.min-h-screen),
html.dark [class~="bg-gray-50"],
html.dark [class^="bg-slate-50/"],
html.dark [class*=" bg-slate-50/"],
html.dark [class^="bg-zinc-50/"],
html.dark [class*=" bg-zinc-50/"],
html.dark [class~="bg-slate-100"],
html.dark [class~="bg-zinc-100"],
html.dark [class~="bg-gray-100"],
html.dark [class^="bg-slate-100/"],
html.dark [class*=" bg-slate-100/"],
html.dark [class^="bg-zinc-100/"],
html.dark [class*=" bg-zinc-100/"] {
  background-color: #171e2c !important;
}

html.dark [class~="bg-slate-200"],
html.dark [class^="bg-slate-200/"],
html.dark [class*=" bg-slate-200/"],
html.dark [class~="bg-zinc-200"],
html.dark [class^="bg-zinc-200/"],
html.dark [class*=" bg-zinc-200/"],
html.dark [class~="bg-gray-200"],
html.dark [class^="bg-gray-200/"],
html.dark [class*=" bg-gray-200/"] {
  background-color: #20283a !important;
  border-color: #2c364f !important;
}

/* ============================================================================
   5. LEVEL 3: HOVER STATES & INTERACTIVE BUTTONS
   ============================================================================ */
html.dark tbody tr {
  transition: background-color 0.15s ease !important;
}

html.dark tbody tr:hover,
html.dark [class*="hover:bg-slate-50"]:hover,
html.dark [class*="hover:bg-zinc-50"]:hover,
html.dark [class*="hover:bg-gray-50"]:hover,
html.dark [class*="hover:bg-slate-100"]:hover,
html.dark [class*="hover:bg-zinc-100"]:hover,
html.dark [class*="hover:bg-slate-200"]:hover,
html.dark [class*="hover:bg-zinc-200"]:hover,
html.dark [class~="hover:bg-[#F2F2EE]"]:hover,
html.dark [class~="hover:bg-[#F8F8F6]"]:hover,
html.dark [class~="hover:bg-white"]:hover {
  background-color: #1d2536 !important;
}

html.dark [class~="hover:bg-[#fde8e8]"]:hover,
html.dark [class*="hover:bg-red-50"]:hover,
html.dark [class*="hover:bg-rose-50"]:hover {
  background-color: rgba(244, 63, 94, 0.18) !important;
}

/* Active filter tabs & buttons (bg-zinc-900 / bg-slate-900 / bg-slate-950) */
html.dark button[class~="bg-zinc-900"],
html.dark button[class~="bg-slate-900"],
html.dark button[class~="bg-slate-950"] {
  background: linear-gradient(135deg, #e11d48 0%, #c62828 100%) !important;
  color: #ffffff !important;
  border-color: rgba(255, 255, 255, 0.16) !important;
  box-shadow: 0 4px 12px rgba(198, 40, 40, 0.35) !important;
}

/* Dark CTA buttons (links with bg-slate-900 on dark cards) */
html.dark a[class~="bg-slate-900"],
html.dark a[class~="bg-[#171717]"] {
  background-color: #1e2638 !important;
  border: 1px solid #323f5c !important;
  color: #f8fafc !important;
}
html.dark a[class~="bg-slate-900"]:hover,
html.dark a[class~="bg-[#171717]"]:hover {
  background-color: #c62828 !important;
  border-color: #e11d48 !important;
  color: #ffffff !important;
}

/* ============================================================================
   6. EDITORIAL ARTICLE BODY & CALLOUT BLOCKS (/post/[slug] & Word Studio)
   ============================================================================ */
html.dark .editorial-article-body,
html.dark .editorial-article-body p,
html.dark .editorial-article-body ul,
html.dark .editorial-article-body ol,
html.dark .editorial-article-body li,
html.dark .article-content,
html.dark .article-content p,
html.dark .article-content li {
  color: #cbd5e1 !important;
}

html.dark .editorial-article-body h1,
html.dark .editorial-article-body h2,
html.dark .editorial-article-body h3,
html.dark .editorial-article-body h4,
html.dark .editorial-article-body strong:not([data-custom-color="true"] *),
html.dark .article-content h1,
html.dark .article-content h2,
html.dark .article-content h3,
html.dark .article-content h4,
html.dark .article-content strong:not([data-custom-color="true"] *) {
  color: #f8fafc !important;
}

/* Preserve inline custom text colors & marker highlights on selected words */
html.dark [data-custom-color="true"] *:not([data-custom-color="true"]) {
  color: inherit !important;
}
html.dark span[data-inline-styled="true"][data-custom-highlight="true"]:not([data-custom-color="true"]) {
  color: #0f172a !important;
  padding: 0 3px;
  border-radius: 3px;
}

html.dark .editorial-article-body blockquote,
html.dark .article-content blockquote {
  color: #e2e8f0 !important;
  background-color: #161d2b !important;
  border-left: 4px solid #ef4444 !important;
  padding: 1rem 1.25rem !important;
  border-radius: 0.75rem !important;
}

html.dark .editorial-article-body img,
html.dark .article-content img {
  border-color: #242d42 !important;
}

/* Override light CSS gradients inside articles, banners, and callouts */
html.dark [class*="from-red-50"],
html.dark [class*="via-white"],
html.dark [class*="to-orange-50"] {
  background-image: linear-gradient(135deg, rgba(198, 40, 40, 0.18) 0%, #141a28 55%, rgba(234, 88, 12, 0.14) 100%) !important;
  background-color: #141a28 !important;
  border-color: rgba(239, 68, 68, 0.5) !important;
}

html.dark [class*="from-indigo-50"],
html.dark [class*="from-blue-50"],
html.dark [class*="from-slate-50"] {
  background-image: linear-gradient(135deg, rgba(99, 102, 241, 0.14) 0%, #141a28 100%) !important;
  background-color: #141a28 !important;
}

/* Verdict & Guarantee Dark Cards inside Dark Mode */
html.dark section[class~="bg-slate-900"],
html.dark div[class~="bg-slate-900"][class*="rounded-2xl"],
html.dark div[class~="bg-slate-900"][class*="rounded-xl"] {
  background: linear-gradient(145deg, #161d2d 0%, #101521 100%) !important;
  border: 1px solid #28334a !important;
}

/* Tables inside Articles */
html.dark .editorial-article-body table,
html.dark .article-content table {
  border-color: #242d42 !important;
}
html.dark .editorial-article-body th,
html.dark .article-content th {
  background-color: #1a2234 !important;
  color: #f8fafc !important;
  border-color: #2a354d !important;
}
html.dark .editorial-article-body td,
html.dark .article-content td {
  background-color: #121722 !important;
  color: #cbd5e1 !important;
  border-color: #20283a !important;
}

/* ============================================================================
   7. TYPOGRAPHY & READABILITY HIERARCHY
   ============================================================================ */
html.dark [class~="text-[#171717]"],
html.dark [class~="text-slate-950"],
html.dark [class~="text-zinc-950"],
html.dark [class~="text-gray-950"],
html.dark [class~="text-slate-900"],
html.dark [class~="text-zinc-900"],
html.dark [class~="text-gray-900"],
html.dark [class~="text-slate-800"],
html.dark [class~="text-zinc-800"],
html.dark [class~="text-gray-800"] {
  color: #f8fafc !important;
}

html.dark [class~="text-slate-700"],
html.dark [class~="text-zinc-700"],
html.dark [class~="text-gray-700"],
html.dark [class~="text-slate-600"],
html.dark [class~="text-zinc-600"],
html.dark [class~="text-gray-600"] {
  color: #cbd5e1 !important;
}

html.dark [class~="text-[#737373]"],
html.dark [class~="text-[#525252]"],
html.dark [class~="text-slate-500"],
html.dark [class~="text-zinc-500"],
html.dark [class~="text-gray-500"],
html.dark [class~="text-slate-400"],
html.dark [class~="text-zinc-400"] {
  color: #94a3b8 !important;
}

/* Vibrant semantic accent colors on dark surfaces */
html.dark [class~="text-indigo-600"],
html.dark [class~="text-indigo-700"],
html.dark [class~="text-indigo-800"],
html.dark [class~="text-indigo-900"],
html.dark [class~="text-indigo-950"] {
  color: #818cf8 !important;
}

html.dark [class~="text-emerald-600"],
html.dark [class~="text-emerald-700"],
html.dark [class~="text-emerald-800"],
html.dark [class~="text-emerald-900"],
html.dark [class~="text-emerald-950"] {
  color: #34d399 !important;
}

html.dark [class~="text-amber-600"],
html.dark [class~="text-amber-700"],
html.dark [class~="text-amber-800"],
html.dark [class~="text-amber-900"],
html.dark [class~="text-amber-950"] {
  color: #fbbf24 !important;
}

html.dark [class~="text-rose-600"],
html.dark [class~="text-rose-700"],
html.dark [class~="text-red-700"],
html.dark [class~="text-red-800"] {
  color: #fb7185 !important;
}

html.dark span[class~="text-[#C62828]"],
html.dark span[class~="text-[#c62828]"],
html.dark div[class~="text-[#c62828]"],
html.dark a[class~="text-[#C62828]"] {
  color: #ff6b6b !important;
}

/* Google SERP Preview & Word Studio Ribbon Text in Dark Mode */
html.dark [class~="text-[#1a0dab]"] {
  color: #8ab4f8 !important;
}
html.dark [class~="text-[#4d5156]"] {
  color: #bdc1c6 !important;
}
html.dark [class~="text-[#2b579a]"] {
  color: #60a5fa !important;
}
html.dark [class~="border-[#2b579a]"] {
  border-color: #60a5fa !important;
}

/* ============================================================================
   8. BORDERS & DIVIDERS (CATCHES ALL /90, /80, /60 OPACITY VARIANTS)
   ============================================================================ */
html.dark [class^="border-slate-1"],
html.dark [class*=" border-slate-1"],
html.dark [class^="border-slate-2"],
html.dark [class*=" border-slate-2"],
html.dark [class^="border-slate-3"],
html.dark [class*=" border-slate-3"],
html.dark [class^="border-zinc-1"],
html.dark [class*=" border-zinc-1"],
html.dark [class^="border-zinc-2"],
html.dark [class*=" border-zinc-2"],
html.dark [class^="border-zinc-3"],
html.dark [class*=" border-zinc-3"],
html.dark [class^="border-gray-1"],
html.dark [class*=" border-gray-1"],
html.dark [class^="border-gray-2"],
html.dark [class*=" border-gray-2"],
html.dark [class^="border-gray-3"],
html.dark [class*=" border-gray-3"],
html.dark [class~="border-[#E7E7E5]"],
html.dark [class~="border-[#D6D6D2]"] {
  border-color: #232b3e !important;
}

html.dark [class*="hover:border-slate-"]:hover,
html.dark [class*="hover:border-zinc-"]:hover {
  border-color: #313d56 !important;
}

/* Preserve colored semantic directional accent borders on KPI cards & nav tabs */
html.dark [class~="border-l-indigo-500"] {
  border-left-color: #6366f1 !important;
}
html.dark [class~="border-l-emerald-500"] {
  border-left-color: #10b981 !important;
}
html.dark [class~="border-l-amber-500"] {
  border-left-color: #f59e0b !important;
}
html.dark [class~="border-l-rose-500"],
html.dark [class~="border-l-[#C62828]"] {
  border-left-color: #ef4444 !important;
}
html.dark [class~="border-[#C62828]"] {
  border-color: #ef4444 !important;
}

html.dark [class~="border-[#171717]"] {
  border-color: #35415c !important;
}

html.dark [class*="divide-"] > *,
html.dark [class*="divide-"] > :not(:last-child),
html.dark [class*="divide-"] > :not([hidden]) ~ :not([hidden]),
html.dark tbody > tr,
html.dark thead > tr {
  border-color: #1e2536 !important;
}

/* ============================================================================
   9. FORM INPUTS, SELECTS, TEXTAREAS & CODE PILLS
   ============================================================================ */
html.dark input:not([type="checkbox"]):not([type="radio"]):not([type="range"]),
html.dark select:not([class~="bg-transparent"]),
html.dark textarea {
  background-color: #0d111a !important;
  color: #f8fafc !important;
  border-color: #273046 !important;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.4) inset !important;
}

html.dark select[class~="bg-transparent"] {
  background-color: transparent !important;
  color: #f8fafc !important;
  border-color: transparent !important;
  box-shadow: none !important;
}

html.dark select option {
  background-color: #121722 !important;
  color: #f8fafc !important;
}

html.dark input:not([type="checkbox"]):not([type="radio"]):not([type="range"]):focus,
html.dark select:not([class~="bg-transparent"]):focus,
html.dark textarea:focus {
  border-color: #ef4444 !important;
  background-color: #121722 !important;
}

html.dark input::placeholder,
html.dark textarea::placeholder {
  color: #64748b !important;
}

/* Monospace Coupon Code Pills */
html.dark [class~="font-mono"][class~="bg-zinc-100"],
html.dark [class~="font-mono"][class~="bg-slate-100"],
html.dark [class~="font-mono"][class~="bg-red-100"] {
  background-color: #1c2436 !important;
  border-color: #313e59 !important;
  color: #fca5a5 !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3) !important;
}

/* Soft Tinted Status Badges & Callout Surfaces (strictly non-hover base tokens) */
html.dark [class~="bg-[#C62828]/10"],
html.dark [class~="bg-[#fde8e8]"],
html.dark [class^="bg-rose-50"],
html.dark [class*=" bg-rose-50"],
html.dark [class^="bg-rose-100"],
html.dark [class*=" bg-rose-100"],
html.dark [class^="bg-rose-200"],
html.dark [class*=" bg-rose-200"],
html.dark [class^="bg-red-50"],
html.dark [class*=" bg-red-50"],
html.dark [class^="bg-red-100"],
html.dark [class*=" bg-red-100"],
html.dark [class^="bg-red-200"],
html.dark [class*=" bg-red-200"] {
  background-color: rgba(244, 63, 94, 0.16) !important;
  border-color: rgba(244, 63, 94, 0.35) !important;
  color: #fecdd3 !important;
}
html.dark [class^="bg-emerald-50"],
html.dark [class*=" bg-emerald-50"],
html.dark [class^="bg-emerald-100"],
html.dark [class*=" bg-emerald-100"],
html.dark [class^="bg-emerald-200"],
html.dark [class*=" bg-emerald-200"] {
  background-color: rgba(16, 185, 129, 0.15) !important;
  border-color: rgba(16, 185, 129, 0.34) !important;
  color: #a7f3d0 !important;
}
html.dark [class^="bg-indigo-50"],
html.dark [class*=" bg-indigo-50"],
html.dark [class^="bg-indigo-100"],
html.dark [class*=" bg-indigo-100"],
html.dark [class^="bg-indigo-200"],
html.dark [class*=" bg-indigo-200"],
html.dark [class^="bg-blue-50"],
html.dark [class*=" bg-blue-50"],
html.dark [class^="bg-blue-100"],
html.dark [class*=" bg-blue-100"],
html.dark [class^="bg-blue-200"],
html.dark [class*=" bg-blue-200"] {
  background-color: rgba(99, 102, 241, 0.16) !important;
  border-color: rgba(99, 102, 241, 0.35) !important;
  color: #c7d2fe !important;
}
html.dark [class^="bg-amber-50"],
html.dark [class*=" bg-amber-50"],
html.dark [class^="bg-amber-100"],
html.dark [class*=" bg-amber-100"] {
  background-color: rgba(245, 158, 11, 0.14) !important;
  border-color: rgba(245, 158, 11, 0.34) !important;
  color: #fde68a !important;
}
html.dark [class^="bg-amber-200"],
html.dark [class*=" bg-amber-200"] {
  background-color: rgba(245, 158, 11, 0.26) !important;
  border: 1px solid rgba(251, 191, 36, 0.45) !important;
  color: #fef3c7 !important;
}
html.dark [class*="hover:bg-amber-300"]:hover,
html.dark [class*="hover:bg-amber-200"]:hover {
  background-color: rgba(245, 158, 11, 0.38) !important;
  color: #ffffff !important;
}
html.dark button:disabled[class*="disabled:bg-slate-"],
html.dark button:disabled[class*="disabled:bg-zinc-"] {
  background-color: #1e2638 !important;
  color: #64748b !important;
  border-color: #273046 !important;
}
`;

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  isDark: false,
  setTheme: () => {},
  toggleTheme: () => {},
});

function applyThemeToDocument(mode: ThemeMode) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (mode === 'dark') {
    root.classList.add('dark');
    root.setAttribute('data-theme', 'dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
    root.style.colorScheme = 'light';
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('light');

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
      if (saved === 'dark' || saved === 'light') {
        setThemeState(saved);
        applyThemeToDocument(saved);
      } else {
        applyThemeToDocument('light');
      }
    } catch {
      applyThemeToDocument('light');
    }

    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && (e.newValue === 'dark' || e.newValue === 'light')) {
        setThemeState(e.newValue);
        applyThemeToDocument(e.newValue);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const setTheme = useCallback((next: ThemeMode) => {
    setThemeState(next);
    applyThemeToDocument(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore storage errors
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next: ThemeMode = prev === 'dark' ? 'light' : 'dark';
      applyThemeToDocument(next);
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // ignore storage errors
      }
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: theme === 'dark',
        setTheme,
        toggleTheme,
      }}
    >
      <style
        id="heygoodly-dark-theme-css"
        dangerouslySetInnerHTML={{ __html: DARK_MODE_CSS }}
      />
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
