'use client';

import { useEffect } from 'react';
import { useSiteSettings } from '@/lib/admin/useSiteSettings';

function parseMetaTag(raw: string, fallbackName: string): { name: string; content: string } | null {
  const trimmed = (raw || '').trim();
  if (!trimmed) return null;

  const nameMatch = trimmed.match(/name=["']([^"']+)["']/i);
  const contentMatch = trimmed.match(/content=["']([^"']+)["']/i);
  if (nameMatch && contentMatch) {
    return { name: nameMatch[1], content: contentMatch[1] };
  }
  if (!trimmed.startsWith('<')) {
    return { name: fallbackName, content: trimmed };
  }
  return null;
}

export default function SiteHeadTelemetry() {
  const { settings } = useSiteSettings();

  // Dynamically synchronize browser favicon from PostgreSQL (`site_favicon`)
  useEffect(() => {
    if (!settings.faviconUrl || typeof document === 'undefined') return;
    let iconLink = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!iconLink) {
      iconLink = document.createElement('link');
      iconLink.rel = 'icon';
      document.head.appendChild(iconLink);
    }
    if (iconLink.href !== settings.faviconUrl) {
      iconLink.href = settings.faviconUrl;
    }
  }, [settings.faviconUrl]);

  const verifications = [
    parseMetaTag(settings.googleMeta, 'google-site-verification'),
    parseMetaTag(settings.bingMeta, 'msvalidate.01'),
    parseMetaTag(settings.partnerboostMetaTag, 'partnerboost-verification'),
    parseMetaTag(settings.impactMetaTag, 'ir-site-verification-token'),
  ].filter((v): v is { name: string; content: string } => Boolean(v && v.content));

  return (
    <>
      {verifications.map((v) => (
        <meta key={v.name} name={v.name} content={v.content} />
      ))}
      {settings.noIndex && <meta name="robots" content="noindex, nofollow" />}
      {settings.gtmId && <meta name="gtm-container-id" content={settings.gtmId} />}
      {settings.ga4Id && <meta name="ga4-measurement-id" content={settings.ga4Id} />}
      {settings.facebookPixel && <meta name="facebook-pixel-id" content={settings.facebookPixel} />}
      {settings.cloudflareToken && <meta name="cloudflare-analytics-token" content={settings.cloudflareToken} />}
    </>
  );
}
