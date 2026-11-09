'use client';

import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { apiClient } from '@/lib/api/axios-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';

export interface SiteSettings {
  // General & Identity
  siteName: string;
  tagline: string;
  logoUrl: string;
  faviconUrl: string;
  contactEmail: string;
  supportHotline: string;
  contactAddress: string;
  footerCopyright: string;
  affiliateDisclosure: string;

  // SEO & Search Engine Ownership Verification
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  ogImage: string;
  noIndex: boolean;
  googleMeta: string;
  bingMeta: string;
  partnerboostMetaTag: string;
  impactMetaTag: string;

  // Tracking & Telemetry
  gtmId: string;
  ga4Id: string;
  facebookPixel: string;
  cloudflareToken: string;

  // Ads (Desktop Header Banner 728x90)
  headerAdsBannerImg: string;
  headerAdsBannerUrl: string;
  headerAdsActive: boolean;
  headerAdsBadge: string;
  headerAdsSubtitle: string;
  headerAdsTitle: string;
  headerAdsDescription: string;
  headerAdsButtonText: string;

  // Newsletter (homepage "Dispatch" block)
  newsletterEnabled: boolean;
  newsletterEyebrow: string;
  newsletterTitle: string;
  newsletterDescription: string;
  newsletterPlaceholder: string;
  newsletterButtonText: string;
  newsletterSuccessMessage: string;

  // Social Channels
  socialFacebook: string;
  socialTwitter: string;
  socialYoutube: string;
  socialTiktok: string;

  // Hydration state
  loaded: boolean;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  siteName: 'HeyGoodly',
  tagline: '',
  logoUrl: '',
  faviconUrl: '',
  contactEmail: '',
  supportHotline: '',
  contactAddress: '',
  footerCopyright: '',
  affiliateDisclosure: '',

  metaTitle: '',
  metaDescription: '',
  canonicalUrl: '',
  ogImage: '',
  noIndex: false,
  googleMeta: '',
  bingMeta: '',
  partnerboostMetaTag: '',
  impactMetaTag: '',

  gtmId: '',
  ga4Id: '',
  facebookPixel: '',
  cloudflareToken: '',

  headerAdsBannerImg: '',
  headerAdsBannerUrl: '',
  headerAdsActive: false,
  headerAdsBadge: '',
  headerAdsSubtitle: '',
  headerAdsTitle: '',
  headerAdsDescription: '',
  headerAdsButtonText: '',

  newsletterEnabled: false,
  newsletterEyebrow: '',
  newsletterTitle: '',
  newsletterDescription: '',
  newsletterPlaceholder: '',
  newsletterButtonText: '',
  newsletterSuccessMessage: '',

  socialFacebook: '',
  socialTwitter: '',
  socialYoutube: '',
  socialTiktok: '',

  loaded: false,
};

type Listener = () => void;
let cache: SiteSettings = DEFAULT_SITE_SETTINGS;
let inFlightPromise: Promise<void> | null = null;
let isFetched = false;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((l) => l());
}

function mapResponseToSettings(map: Record<string, string>): Partial<SiteSettings> {
  const result: Partial<SiteSettings> = { loaded: true };
  if (map.site_name !== undefined) result.siteName = map.site_name || 'HeyGoodly';
  if (map.site_slogan !== undefined || map.site_tagline !== undefined) {
    result.tagline = map.site_slogan || map.site_tagline || '';
  }
  if (map.site_logo !== undefined) result.logoUrl = map.site_logo;
  if (map.site_favicon !== undefined) result.faviconUrl = map.site_favicon;
  if (map.contact_email !== undefined) result.contactEmail = map.contact_email;
  if (map.contact_hotline !== undefined) result.supportHotline = map.contact_hotline;
  if (map.contact_address !== undefined) result.contactAddress = map.contact_address;
  if (map.footer_copyright !== undefined) result.footerCopyright = map.footer_copyright;
  if (map.affiliate_disclosure !== undefined) result.affiliateDisclosure = map.affiliate_disclosure;

  if (map.meta_title !== undefined || map.default_meta_title !== undefined) {
    result.metaTitle = map.meta_title || map.default_meta_title || '';
  }
  if (map.meta_description !== undefined || map.default_meta_description !== undefined) {
    result.metaDescription = map.meta_description || map.default_meta_description || '';
  }
  if (map.canonical_url !== undefined) result.canonicalUrl = map.canonical_url;
  if (map.og_image !== undefined) result.ogImage = map.og_image;
  if (map.no_index !== undefined) result.noIndex = map.no_index === 'true';
  if (map.google_meta !== undefined) result.googleMeta = map.google_meta;
  if (map.bing_meta !== undefined) result.bingMeta = map.bing_meta;
  if (map.partnerboost_meta_tag !== undefined) result.partnerboostMetaTag = map.partnerboost_meta_tag;
  if (map.impact_meta_tag !== undefined) result.impactMetaTag = map.impact_meta_tag;

  if (map.gtm_id !== undefined) result.gtmId = map.gtm_id;
  if (map.gtag_id !== undefined) result.ga4Id = map.gtag_id;
  if (map.facebook_pixel !== undefined) result.facebookPixel = map.facebook_pixel;
  if (map.cloudflare_token !== undefined) result.cloudflareToken = map.cloudflare_token;

  if (map.header_ads_active !== undefined) result.headerAdsActive = map.header_ads_active === 'true';
  if (map.header_ads_badge !== undefined) result.headerAdsBadge = map.header_ads_badge;
  if (map.header_ads_subtitle !== undefined) result.headerAdsSubtitle = map.header_ads_subtitle;
  if (map.header_ads_title !== undefined) result.headerAdsTitle = map.header_ads_title;
  if (map.header_ads_description !== undefined) result.headerAdsDescription = map.header_ads_description;
  if (map.header_ads_button_text !== undefined) result.headerAdsButtonText = map.header_ads_button_text;
  if (map.header_ads_banner_img !== undefined) result.headerAdsBannerImg = map.header_ads_banner_img;
  if (map.header_ads_banner_url !== undefined) result.headerAdsBannerUrl = map.header_ads_banner_url;

  if (map.newsletter_enabled !== undefined) result.newsletterEnabled = map.newsletter_enabled === 'true';
  if (map.newsletter_eyebrow !== undefined) result.newsletterEyebrow = map.newsletter_eyebrow;
  if (map.newsletter_title !== undefined) result.newsletterTitle = map.newsletter_title;
  if (map.newsletter_description !== undefined) result.newsletterDescription = map.newsletter_description;
  if (map.newsletter_placeholder !== undefined) result.newsletterPlaceholder = map.newsletter_placeholder;
  if (map.newsletter_button_text !== undefined) result.newsletterButtonText = map.newsletter_button_text;
  if (map.newsletter_success_message !== undefined) result.newsletterSuccessMessage = map.newsletter_success_message;

  if (map.social_facebook !== undefined) result.socialFacebook = map.social_facebook;
  if (map.social_twitter !== undefined) result.socialTwitter = map.social_twitter;
  if (map.social_youtube !== undefined) result.socialYoutube = map.social_youtube;
  if (map.social_tiktok !== undefined) result.socialTiktok = map.social_tiktok;

  return result;
}

function mapSettingsToRequest(settings: SiteSettings): Record<string, string> {
  return {
    site_name: settings.siteName,
    site_slogan: settings.tagline,
    site_logo: settings.logoUrl,
    site_favicon: settings.faviconUrl,
    contact_email: settings.contactEmail,
    contact_hotline: settings.supportHotline,
    contact_address: settings.contactAddress,
    footer_copyright: settings.footerCopyright,
    affiliate_disclosure: settings.affiliateDisclosure,
    meta_title: settings.metaTitle,
    meta_description: settings.metaDescription,
    canonical_url: settings.canonicalUrl,
    og_image: settings.ogImage,
    no_index: String(Boolean(settings.noIndex)),
    google_meta: settings.googleMeta,
    bing_meta: settings.bingMeta,
    partnerboost_meta_tag: settings.partnerboostMetaTag,
    impact_meta_tag: settings.impactMetaTag,
    gtm_id: settings.gtmId,
    gtag_id: settings.ga4Id,
    facebook_pixel: settings.facebookPixel,
    cloudflare_token: settings.cloudflareToken,
    header_ads_active: String(Boolean(settings.headerAdsActive)),
    header_ads_badge: settings.headerAdsBadge,
    header_ads_subtitle: settings.headerAdsSubtitle,
    header_ads_title: settings.headerAdsTitle,
    header_ads_description: settings.headerAdsDescription,
    header_ads_button_text: settings.headerAdsButtonText,
    header_ads_banner_img: settings.headerAdsBannerImg,
    header_ads_banner_url: settings.headerAdsBannerUrl,
    newsletter_enabled: String(Boolean(settings.newsletterEnabled)),
    newsletter_eyebrow: settings.newsletterEyebrow,
    newsletter_title: settings.newsletterTitle,
    newsletter_description: settings.newsletterDescription,
    newsletter_placeholder: settings.newsletterPlaceholder,
    newsletter_button_text: settings.newsletterButtonText,
    newsletter_success_message: settings.newsletterSuccessMessage,
    social_facebook: settings.socialFacebook,
    social_twitter: settings.socialTwitter,
    social_youtube: settings.socialYoutube,
    social_tiktok: settings.socialTiktok,
  };
}

async function fetchFromBackend(force = false) {
  if (isFetched && !force) return;
  if (inFlightPromise && !force) return inFlightPromise;

  isFetched = true;
  inFlightPromise = (async () => {
    try {
      const res = await apiClient.get(API_ENDPOINTS.PUBLIC.SETTINGS);
      const settingsMap = res.data?.data?.settings || res.data?.data;
      if (settingsMap && typeof settingsMap === 'object') {
        const mapped = mapResponseToSettings(settingsMap);
        cache = { ...DEFAULT_SITE_SETTINGS, ...mapped, loaded: true };
        notify();
      } else {
        cache = { ...cache, loaded: true };
        notify();
      }
    } catch {
      cache = { ...cache, loaded: true };
      notify();
    } finally {
      inFlightPromise = null;
    }
  })();

  return inFlightPromise;
}

export function invalidateSiteSettingsCache() {
  isFetched = false;
  void fetchFromBackend(true);
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useSiteSettings() {
  const settings = useSyncExternalStore(subscribe, () => cache, () => DEFAULT_SITE_SETTINGS);

  useEffect(() => {
    void fetchFromBackend();
  }, []);

  const saveSettings = useCallback(async (patch: Partial<SiteSettings>) => {
    const next = { ...cache, ...patch };
    cache = next;
    notify();

    try {
      const payload = { settings: mapSettingsToRequest(next) };
      await apiClient.put(API_ENDPOINTS.ADMIN.SETTINGS, payload);
    } catch (err) {
      console.warn('Backend settings update error:', err);
    }
  }, []);

  const resetSettings = useCallback(async () => {
    await fetchFromBackend(true);
  }, []);

  return { settings, saveSettings, resetSettings };
}
