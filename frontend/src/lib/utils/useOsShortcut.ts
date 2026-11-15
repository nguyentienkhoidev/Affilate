'use client';

import { useEffect, useState } from 'react';

export type OsPlatform = 'mac' | 'windows' | 'ubuntu';

export interface OsShortcutInfo {
  os: OsPlatform;
  isMac: boolean;
  modifierLabel: string;
  shortcutBadge: string;
  shortcutTitle: string;
}

const DEFAULT_SHORTCUT: OsShortcutInfo = {
  os: 'windows',
  isMac: false,
  modifierLabel: 'Ctrl',
  shortcutBadge: 'Ctrl K',
  shortcutTitle: 'Ctrl + K',
};

function detectOsPlatform(): OsShortcutInfo {
  if (typeof navigator === 'undefined') {
    return DEFAULT_SHORTCUT;
  }

  const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
  const rawPlatform = (
    nav.userAgentData?.platform ||
    navigator.platform ||
    navigator.userAgent ||
    ''
  ).toLowerCase();

  if (/mac|iphone|ipad|ipod/.test(rawPlatform)) {
    return {
      os: 'mac',
      isMac: true,
      modifierLabel: '⌘',
      shortcutBadge: '⌘K',
      shortcutTitle: '⌘K',
    };
  }

  if (/linux|ubuntu|x11/.test(rawPlatform)) {
    return {
      os: 'ubuntu',
      isMac: false,
      modifierLabel: 'Ctrl',
      shortcutBadge: 'Ctrl K',
      shortcutTitle: 'Ctrl + K',
    };
  }

  return DEFAULT_SHORTCUT;
}

/**
 * Returns OS-aware Quick Search shortcut labels (macOS: ⌘K, Windows/Ubuntu: Ctrl K).
 * Uses client-side detection inside useEffect to remain SSR hydration-safe.
 */
export function useOsShortcut(): OsShortcutInfo {
  const [shortcut, setShortcut] = useState<OsShortcutInfo>(DEFAULT_SHORTCUT);

  useEffect(() => {
    setShortcut(detectOsPlatform());
  }, []);

  return shortcut;
}
