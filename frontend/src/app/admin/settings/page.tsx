'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Settings,
  Globe,
  ShieldCheck,
  BarChart3,
  DollarSign,
  Mail,
  Lock,
  Save,
  RotateCcw,
  Undo2,
  AlertTriangle,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import ImageUpload from '@/components/admin/ImageUpload';
import { usePermission } from '@/lib/admin/usePermission';
import { useToast } from '@/context/ToastContext';
import { useAdminI18n } from '@/context/AdminI18nContext';
import UnauthorizedAccess from '@/components/admin/UnauthorizedAccess';
import { settingService, type SystemSettingsMap } from '@/services/settingService';
import { invalidateSiteSettingsCache } from '@/lib/admin/useSiteSettings';
import { ROUTES } from '@/constants/routes';
import Link from 'next/link';

type SettingsTab = 'general' | 'seo' | 'tracking' | 'ads' | 'newsletter' | 'security';

function getInitialTab(): SettingsTab {
  if (typeof window !== 'undefined') {
    const paramTab = new URLSearchParams(window.location.search).get('tab');
    if (
      paramTab === 'seo' ||
      paramTab === 'tracking' ||
      paramTab === 'ads' ||
      paramTab === 'general' ||
      paramTab === 'newsletter' ||
      paramTab === 'security'
    ) {
      return paramTab;
    }
  }
  return 'general';
}

export default function AdminSettingsPage() {
  const { hasPermission } = usePermission();
  const { toast, confirm } = useToast();
  const { t } = useAdminI18n();

  const [activeTab, setActiveTab] = useState<SettingsTab>(getInitialTab);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [resetting, setResetting] = useState<boolean>(false);

  // Database-driven state (populated strictly from GET /api/v1/admin/settings)
  const [settings, setSettings] = useState<SystemSettingsMap>({});
  const [savedSnapshot, setSavedSnapshot] = useState<SystemSettingsMap>({});

  const isMountedRef = useRef<boolean>(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // 1. Fetch settings from PostgreSQL on mount
  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await settingService.getAdminSettings();
      if (!isMountedRef.current) return;
      const resolved = data && typeof data === 'object' ? data : {};
      setSettings(resolved);
      setSavedSnapshot(resolved);
    } catch (err: any) {
      console.warn('Failed to load system settings from PostgreSQL:', err);
      toast.error(t('Failed to load settings from database.'));
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  // RBAC permission gate
  if (!hasPermission('setting.general')) {
    return <UnauthorizedAccess />;
  }

  // Dirty check: has the user made modifications compared to saved snapshot?
  const isDirty = JSON.stringify(settings) !== JSON.stringify(savedSnapshot);

  const updateField = (key: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const toggleField = (key: string, currentValue: string) => {
    const nextVal = currentValue === 'true' ? 'false' : 'true';
    updateField(key, nextVal);
  };

  // 2. Persist updated configuration to PostgreSQL
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const updated = await settingService.updateAdminSettings(settings);
      invalidateSiteSettingsCache();
      if (!isMountedRef.current) return;
      setSettings(updated);
      setSavedSnapshot(updated);
      toast.success(t('System configuration updated successfully!'));
    } catch (err: any) {
      console.error('Save settings failed:', err);
      const msg = err?.response?.data?.message || err?.message || 'Failed to persist settings';
      toast.error(t(msg));
    } finally {
      if (isMountedRef.current) {
        setSaving(false);
      }
    }
  };

  // 3. Discard unsaved changes
  const handleDiscard = () => {
    setSettings(savedSnapshot);
    toast.info(t('Reverted changes to saved database state'));
  };

  // 4. Reset to Factory Baseline
  const handleResetToDefaults = async () => {
    const ok = await confirm({
      title: t('Reset System Settings to Factory Defaults?'),
      message: t('This will restore all 50 global settings in PostgreSQL back to factory baseline defaults. Custom domain IDs, meta tags, and ads will be restored. Continue?'),
      confirmText: t('Reset to Factory Baseline'),
      cancelText: t('Cancel'),
      variant: 'danger',
    });
    if (!ok) return;

    setResetting(true);
    try {
      const resetData = await settingService.resetToDefaults();
      invalidateSiteSettingsCache();
      if (!isMountedRef.current) return;
      setSettings(resetData);
      setSavedSnapshot(resetData);
      toast.success(t('All system settings reset to factory defaults!'));
    } catch (err: any) {
      console.error('Reset defaults failed:', err);
      toast.error(t('Failed to reset system settings'));
    } finally {
      if (isMountedRef.current) {
        setResetting(false);
      }
    }
  };

  const tabs = [
    { id: 'general', label: 'Brand & Identity', icon: Globe },
    { id: 'seo', label: 'SEO & Verification', icon: ShieldCheck },
    { id: 'tracking', label: 'Telemetry & GTM', icon: BarChart3 },
    { id: 'ads', label: 'Monetization & Ads', icon: DollarSign },
    { id: 'newsletter', label: 'Newsletter', icon: Mail },
    { id: 'security', label: 'Security & Policies', icon: Lock },
  ] as const;

  // GTM and GA4 format helpers
  const isGtmValid = !settings.gtm_id || /^GTM-[A-Z0-9]{4,10}$/i.test(settings.gtm_id.trim());
  const isGa4Valid = !settings.gtag_id || /^G-[A-Z0-9]{4,14}$/i.test(settings.gtag_id.trim());

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full pb-16">
      {/* Page Title & Save Action */}
      <AdminPageHeader
        icon={Settings}
        title="System & Platform Configuration"
        description="Global metadata, search engine ownership verification tags, and third-party telemetry."
      >
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResetToDefaults}
            disabled={loading || saving || resetting}
            className="shadow-2xs"
          >
            {resetting ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
            <span>{t('Reset to Defaults')}</span>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => handleSave()}
            disabled={loading || saving || resetting}
            className="bg-[#C62828] hover:bg-[#B71C1C] text-white font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            <span>{saving ? t('Saving...') : t('Save Changes')}</span>
          </Button>
        </div>
      </AdminPageHeader>

      {/* Dirty state notification bar */}
      {isDirty && !loading && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 animate-in fade-in duration-200 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="text-amber-600 shrink-0" size={18} />
            <div className="text-xs">
              <span className="font-bold text-amber-950">{t('You have unsaved changes')}: </span>
              <span className="text-amber-800">{t('Remember to save your configuration changes to persist them to the database.')}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleDiscard}
              className="px-3 py-1.5 text-xs font-semibold bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl transition cursor-pointer flex items-center gap-1.5"
            >
              <Undo2 size={13} />
              <span>{t('Discard Changes')}</span>
            </button>
            <button
              type="button"
              onClick={() => handleSave()}
              disabled={saving}
              className="px-3.5 py-1.5 text-xs font-bold bg-[#C62828] hover:bg-[#B71C1C] text-white rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              <span>{t('Save Changes')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-3 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              type="button"
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`h-9 px-4 inline-flex items-center gap-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-[#C62828] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon size={15} />
              <span>{t(tab.label)}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <Card className="p-12 flex flex-col items-center justify-center gap-3 text-slate-500 rounded-2xl">
          <Loader2 className="animate-spin text-[#C62828]" size={28} />
          <span className="text-xs font-semibold text-slate-500">
            {t('Loading system configuration from PostgreSQL...')}
          </span>
        </Card>
      ) : (
        <form noValidate onSubmit={handleSave} className="space-y-6">
          {/* =========================================================================
              TAB 1: BRAND & IDENTITY
             ========================================================================= */}
          {activeTab === 'general' && (
            <Card className="p-6 sm:p-7 space-y-6 rounded-2xl">
              <div className="border-b border-slate-100 pb-4">
                <CardTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Globe className="text-[#C62828]" size={20} />
                  {t('Site Identity & Branding')}
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-0.5">
                  {t('Primary public branding displayed in headers and email footers')}
                </CardDescription>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">{t('Platform Public Name')}</label>
                  <Input
                    value={settings.site_name ?? ''}
                    onChange={(e) => updateField('site_name', e.target.value)}
                    placeholder="HeyGoodly"
                    className="font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">{t('Tagline (SEO Title Suffix)')}</label>
                  <Input
                    value={settings.site_slogan ?? ''}
                    onChange={(e) => updateField('site_slogan', e.target.value)}
                    placeholder="Coupon Codes & Honest Tech Reviews"
                    className="font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">{t('Contact Support Email')}</label>
                  <Input
                    type="email"
                    value={settings.contact_email ?? ''}
                    onChange={(e) => updateField('contact_email', e.target.value)}
                    placeholder="contact@heygoodly.com"
                    className="font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">{t('Editorial Support Hotline')}</label>
                  <Input
                    value={settings.contact_hotline ?? ''}
                    onChange={(e) => updateField('contact_hotline', e.target.value)}
                    placeholder="+1 (800) 555-0199"
                    className="font-medium"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">{t('Corporate Office Address')}</label>
                  <Input
                    value={settings.contact_address ?? ''}
                    onChange={(e) => updateField('contact_address', e.target.value)}
                    placeholder="100 Montgomery St, Suite 1800, San Francisco, CA 94104"
                    className="font-medium"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">{t('Footer Copyright Notice')}</label>
                  <Input
                    value={settings.footer_copyright ?? ''}
                    onChange={(e) => updateField('footer_copyright', e.target.value)}
                    placeholder="© 2026 HeyGoodly Media Inc. All rights reserved."
                    className="font-medium"
                  />
                </div>

                {/* Logo & Favicon Upload */}
                <div className="sm:col-span-2 pt-2 border-t border-slate-100 space-y-6">
                  <ImageUpload
                    label={t('Brand Logo')}
                    value={settings.site_logo ?? ''}
                    onChange={(url) => updateField('site_logo', url)}
                    folder="stores"
                    description={t('Upload or select a brand logo from the Media Library (must include tags).')}
                  />

                  <ImageUpload
                    label={t('Browser Favicon')}
                    value={settings.site_favicon ?? ''}
                    onChange={(url) => updateField('site_favicon', url)}
                    aspectRatio="square"
                    folder="stores"
                    description={t('Upload or select a 32x32 favicon icon from Media Library.')}
                  />
                </div>
              </div>
            </Card>
          )}

          {/* =========================================================================
              TAB 2: SEO & SEARCH ENGINE OWNERSHIP VERIFICATION
             ========================================================================= */}
          {activeTab === 'seo' && (
            <Card className="p-6 sm:p-7 space-y-6 rounded-2xl">
              <div className="border-b border-slate-100 pb-4">
                <CardTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="text-[#C62828]" size={20} />
                  {t('Search Engine Ownership Meta Tags')}
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-0.5">
                  {t('These verification tags are automatically injected into the public HTML <head> to certify ownership for Google and Bing.')}
                </CardDescription>
              </div>

              {/* Indexing Toggle */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-900">{t('Search Engine Indexing')}</span>
                    {settings.no_index === 'true' ? (
                      <Badge variant="destructive">noindex, nofollow</Badge>
                    ) : (
                      <Badge variant="success">index, follow</Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {settings.no_index === 'true'
                      ? t('Block Search Crawlers (noindex, nofollow)')
                      : t('Allow Search Engines (index, follow)')}
                  </p>
                </div>

                <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={settings.no_index === 'true'}
                    onChange={() => toggleField('no_index', settings.no_index ?? 'false')}
                    className="w-4 h-4 accent-[#C62828]"
                  />
                  <span>{t('Block search engines (noindex)')}</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">{t('Canonical Website URL')}</label>
                  <Input
                    value={settings.canonical_url ?? ''}
                    onChange={(e) => updateField('canonical_url', e.target.value)}
                    placeholder="https://heygoodly.com"
                    className="font-mono text-xs"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">{t('Default Meta Title')}</label>
                  <Input
                    value={settings.meta_title ?? ''}
                    onChange={(e) => updateField('meta_title', e.target.value)}
                    placeholder="HeyGoodly - Latest Deals, Verified Coupons & Shopping Reviews 2026"
                    className="font-medium"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">{t('Default Meta Description')}</label>
                  <textarea
                    rows={3}
                    value={settings.meta_description ?? ''}
                    onChange={(e) => updateField('meta_description', e.target.value)}
                    placeholder="Discover verified promo codes, discounts, exclusive deals, and honest shopping reviews to save more every day."
                    className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#C62828]/20 focus:border-[#C62828] font-medium placeholder:text-zinc-400"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">
                      {t('Google Search Console Meta Tag')}
                    </label>
                    <Badge variant="secondary" className="text-[10px]">Googlebot</Badge>
                  </div>
                  <Input
                    value={settings.google_meta ?? ''}
                    onChange={(e) => updateField('google_meta', e.target.value)}
                    placeholder='<meta name="google-site-verification" content="google_auth_token_8892" />'
                    className="font-mono text-xs"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">
                      {t('Bing Webmaster Verification Meta Tag')}
                    </label>
                    <Badge variant="secondary" className="text-[10px]">Bingbot</Badge>
                  </div>
                  <Input
                    value={settings.bing_meta ?? ''}
                    onChange={(e) => updateField('bing_meta', e.target.value)}
                    placeholder='<meta name="msvalidate.01" content="bing_auth_token_4412" />'
                    className="font-mono text-xs"
                  />
                </div>

                <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                  <ImageUpload
                    label={t('Social Sharing Open Graph Image')}
                    value={settings.og_image ?? ''}
                    onChange={(url) => updateField('og_image', url)}
                    folder="articles"
                    description={t('Default 1200x630 image displayed when homepage and site links are shared on Facebook, X, and LinkedIn.')}
                  />
                </div>
              </div>
            </Card>
          )}

          {/* =========================================================================
              TAB 3: TELEMETRY & TRACKING SCRIPTS
             ========================================================================= */}
          {activeTab === 'tracking' && (
            <Card className="p-6 sm:p-7 space-y-6 rounded-2xl">
              <div className="border-b border-slate-100 pb-4">
                <CardTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <BarChart3 className="text-[#C62828]" size={20} />
                  {t('Telemetry & Event Tracking')}
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-0.5">
                  {t('Container IDs for Google Tag Manager, GA4, and conversion pixels')}
                </CardDescription>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">{t('Google Tag Manager (GTM) Container ID')}</label>
                    {settings.gtm_id && (
                      <Badge variant={isGtmValid ? 'success' : 'destructive'} className="text-[10px] rounded-full">
                        {isGtmValid ? 'Valid GTM format' : 'Format: GTM-XXXXXXX'}
                      </Badge>
                    )}
                  </div>
                  <Input
                    value={settings.gtm_id ?? ''}
                    onChange={(e) => updateField('gtm_id', e.target.value.toUpperCase())}
                    placeholder="GTM-BG9942A"
                    className="font-mono text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">{t('Google Analytics 4 (GA4) Measurement ID')}</label>
                    {settings.gtag_id && (
                      <Badge variant={isGa4Valid ? 'success' : 'destructive'} className="text-[10px] rounded-full">
                        {isGa4Valid ? 'Valid GA4 format' : 'Format: G-XXXXXXXXXX'}
                      </Badge>
                    )}
                  </div>
                  <Input
                    value={settings.gtag_id ?? ''}
                    onChange={(e) => updateField('gtag_id', e.target.value.toUpperCase())}
                    placeholder="G-772910842"
                    className="font-mono text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">{t('Meta / Facebook Pixel ID')}</label>
                  <Input
                    value={settings.facebook_pixel ?? ''}
                    onChange={(e) => updateField('facebook_pixel', e.target.value.replace(/\D/g, ''))}
                    placeholder="88291029481920"
                    className="font-mono text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">{t('Cloudflare Web Analytics Token')}</label>
                  <Input
                    value={settings.cloudflare_token ?? ''}
                    onChange={(e) => updateField('cloudflare_token', e.target.value)}
                    placeholder="cf_token_9918238472910"
                    className="font-mono text-xs"
                  />
                </div>
              </div>
            </Card>
          )}

          {/* =========================================================================
              TAB 4: MONETIZATION & ADS (728x90 BANNER & AFFILIATE PARAMS)
             ========================================================================= */}
          {activeTab === 'ads' && (
            <div className="space-y-6">
              {/* Card 1: 728x90 Header Ad Banner */}
              <Card className="p-6 sm:p-7 space-y-6 rounded-2xl">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <CardTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <DollarSign className="text-[#C62828]" size={20} />
                      {t('Desktop Header Banner 728x90')}
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500 mt-0.5">
                      {t('Configure promotional sponsorship banner shown on the public desktop header')}
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                      <input
                        type="checkbox"
                        checked={settings.header_ads_active !== 'false'}
                        onChange={() => toggleField('header_ads_active', settings.header_ads_active ?? 'true')}
                        className="w-4 h-4 accent-[#C62828]"
                      />
                      <span>{t('Active Banner')}</span>
                    </label>
                  </div>
                </div>

                {/* Banner Preview Frame */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    {t('Desktop Header Live Preview (728x90)')}
                  </span>
                  <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 flex items-center justify-center overflow-x-auto">
                    <div className="relative w-[728px] h-[90px] rounded-xl overflow-hidden shadow-sm flex items-center justify-between px-6 border border-slate-800 shrink-0 bg-[#171717]">
                      {settings.header_ads_banner_img ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={settings.header_ads_banner_img}
                            alt="Header Ad"
                            className="absolute inset-0 w-full h-full object-cover opacity-35"
                          />
                          <div className="absolute inset-0 bg-linear-to-r from-slate-950/90 via-slate-950/65 to-transparent" />
                        </>
                      ) : (
                        <div className="absolute inset-0 bg-linear-to-r from-red-950/90 via-slate-950/90 to-slate-900" />
                      )}

                      <div className="relative z-10 space-y-0.5 max-w-md">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black uppercase tracking-widest text-[#EAB308] bg-[#EAB308]/15 px-2 py-0.5 rounded-full border border-[#EAB308]/30">
                            {settings.header_ads_badge || 'Partner Spotlight'}
                          </span>
                          <span className="text-[10px] text-zinc-300 font-semibold">
                            {settings.header_ads_subtitle || 'Vetted Promotion'}
                          </span>
                        </div>
                        <h4 className="text-xs font-black text-white truncate">
                          {settings.header_ads_title || 'Seasonal Clearance Deals & Tested Coupons'}
                        </h4>
                        <p className="text-[10px] text-zinc-300 line-clamp-1">
                          {settings.header_ads_description || 'Tested directly against merchant checkouts.'}
                        </p>
                      </div>

                      <div className="relative z-10 shrink-0 pl-4">
                        <span className="h-7 px-3.5 inline-flex items-center justify-center text-[11px] font-bold text-white bg-[#C62828] rounded-lg shadow-sm">
                          {settings.header_ads_button_text || 'Discover'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">{t('Banner Eyebrow Badge')}</label>
                    <Input
                      value={settings.header_ads_badge ?? ''}
                      onChange={(e) => updateField('header_ads_badge', e.target.value)}
                      placeholder="Partner Spotlight"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">{t('Banner Subtitle Tag')}</label>
                    <Input
                      value={settings.header_ads_subtitle ?? ''}
                      onChange={(e) => updateField('header_ads_subtitle', e.target.value)}
                      placeholder="Vetted Promotion"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700">{t('Banner Headline Title')}</label>
                    <Input
                      value={settings.header_ads_title ?? ''}
                      onChange={(e) => updateField('header_ads_title', e.target.value)}
                      placeholder="Seasonal Consumer Tech & Smart Home Clearance Deals"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700">{t('Banner Supporting Description')}</label>
                    <Input
                      value={settings.header_ads_description ?? ''}
                      onChange={(e) => updateField('header_ads_description', e.target.value)}
                      placeholder="Hand-tested promo codes checked against live merchant checkouts."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">{t('CTA Button Text')}</label>
                    <Input
                      value={settings.header_ads_button_text ?? ''}
                      onChange={(e) => updateField('header_ads_button_text', e.target.value)}
                      placeholder="Discover"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">{t('Destination Sponsor URL')}</label>
                    <Input
                      value={settings.header_ads_banner_url ?? ''}
                      onChange={(e) => updateField('header_ads_banner_url', e.target.value)}
                      placeholder="https://www.anker.com/?cj_ref=heygoodly"
                      className="font-mono text-xs"
                    />
                  </div>

                  <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                    <ImageUpload
                      label={t('Banner Creative Image URL (728x90 px)')}
                      value={settings.header_ads_banner_img ?? ''}
                      onChange={(url) => updateField('header_ads_banner_img', url)}
                      aspectRatio="banner"
                      folder="stores"
                      description={t('Upload a 728x90 banner background image, choose from Media Library, or paste an image URL.')}
                    />
                  </div>
                </div>
              </Card>

              {/* Card 2: Affiliate Operations & Network Parameters */}
              <Card className="p-6 sm:p-7 space-y-6 rounded-2xl">
                <div className="border-b border-slate-100 pb-4">
                  <CardTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Sparkles className="text-amber-500" size={20} />
                    {t('Affiliate Link Cloaking & Network Settings')}
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 mt-0.5">
                    {t('Configure outgoing affiliate link prefixes, partner tags, and FTC compliance disclosures.')}
                  </CardDescription>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">{t('Outbound Redirect Prefix')}</label>
                    <Input
                      value={settings.affiliate_redirect_prefix ?? '/out/'}
                      onChange={(e) => updateField('affiliate_redirect_prefix', e.target.value)}
                      placeholder="/out/"
                      className="font-mono text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">{t('Amazon Associate Tag')}</label>
                    <Input
                      value={settings.affiliate_amazon_tag ?? ''}
                      onChange={(e) => updateField('affiliate_amazon_tag', e.target.value)}
                      placeholder="heygoodly-20"
                      className="font-mono text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">{t('Impact Radius Publisher ID')}</label>
                    <Input
                      value={settings.affiliate_impact_id ?? ''}
                      onChange={(e) => updateField('affiliate_impact_id', e.target.value)}
                      placeholder="HG_IMP_49102"
                      className="font-mono text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">{t('CJ Affiliate Publisher ID')}</label>
                    <Input
                      value={settings.affiliate_cj_id ?? ''}
                      onChange={(e) => updateField('affiliate_cj_id', e.target.value)}
                      placeholder="HG_CJ_881920"
                      className="font-mono text-xs"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">{t('ShareASale Affiliate ID')}</label>
                    <Input
                      value={settings.affiliate_shareasale_id ?? ''}
                      onChange={(e) => updateField('affiliate_shareasale_id', e.target.value)}
                      placeholder="HG_SAS_11029"
                      className="font-mono text-xs"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">{t('FTC Affiliate Disclosure Statement')}</label>
                    <textarea
                      rows={2}
                      value={settings.affiliate_disclosure ?? ''}
                      onChange={(e) => updateField('affiliate_disclosure', e.target.value)}
                      placeholder="HeyGoodly is reader-supported. When you buy through links on our site, we may earn an affiliate commission at no extra cost to you."
                      className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#C62828]/20 focus:border-[#C62828] font-medium placeholder:text-zinc-400"
                    />
                    <span className="text-[11px] text-slate-500">
                      {t('Displayed prominently across public reviews, buying guides, and coupon modals.')}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* =========================================================================
              TAB 5: NEWSLETTER & DISPATCH
             ========================================================================= */}
          {activeTab === 'newsletter' && (
            <Card className="p-6 sm:p-7 space-y-6 rounded-2xl">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <CardTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Mail className="text-[#C62828]" size={20} />
                    {t('Homepage Newsletter Block')}
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 mt-0.5">
                    {t('Content of the "Dispatch" signup section at the bottom of the homepage. Signups are listed in')}{' '}
                    <Link href={ROUTES.ADMIN.SUBSCRIBERS} className="text-[#C62828] font-bold hover:underline">
                      {t('Newsletter Subscribers')}
                    </Link>
                    .
                  </CardDescription>
                </div>
                <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                  <input
                    type="checkbox"
                    checked={settings.newsletter_enabled !== 'false'}
                    onChange={() => toggleField('newsletter_enabled', settings.newsletter_enabled ?? 'true')}
                    className="w-4 h-4 accent-[#C62828]"
                  />
                  <span>{t('Show on homepage')}</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">{t('Eyebrow Label')}</label>
                  <Input
                    value={settings.newsletter_eyebrow ?? ''}
                    onChange={(e) => updateField('newsletter_eyebrow', e.target.value)}
                    placeholder="The HeyGoodly Dispatch"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">{t('Headline')}</label>
                  <Input
                    value={settings.newsletter_title ?? ''}
                    onChange={(e) => updateField('newsletter_title', e.target.value)}
                    placeholder="Independent Reviews & Product Tests, Weekly"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">{t('Description')}</label>
                <textarea
                  rows={3}
                  value={settings.newsletter_description ?? ''}
                  onChange={(e) => updateField('newsletter_description', e.target.value)}
                  placeholder="Zero sponsored ranking manipulation. Join 45,000+ smart readers who rely on our independent testing laboratory."
                  className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#C62828]/20 focus:border-[#C62828] font-medium placeholder:text-zinc-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">{t('Email Input Placeholder')}</label>
                  <Input
                    value={settings.newsletter_placeholder ?? ''}
                    onChange={(e) => updateField('newsletter_placeholder', e.target.value)}
                    placeholder="Enter your email address..."
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">{t('Button Text')}</label>
                  <Input
                    value={settings.newsletter_button_text ?? ''}
                    onChange={(e) => updateField('newsletter_button_text', e.target.value)}
                    placeholder="Subscribe"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">{t('Success Message')}</label>
                  <Input
                    value={settings.newsletter_success_message ?? ''}
                    onChange={(e) => updateField('newsletter_success_message', e.target.value)}
                    placeholder="Thank you for subscribing! Watch your inbox for the next Dispatch."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">{t('Subscriber Welcome Email Subject')}</label>
                  <Input
                    value={settings.newsletter_welcome_subject ?? ''}
                    onChange={(e) => updateField('newsletter_welcome_subject', e.target.value)}
                    placeholder="Welcome to HeyGoodly Dispatch - Your Tech & Deal Briefing"
                  />
                </div>
              </div>

              {/* Live Preview */}
              <div className="pt-2 space-y-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  {t('Live Preview')}
                </span>
                <div
                  className={`border border-slate-200 rounded-2xl p-6 bg-slate-50 text-center space-y-2 ${
                    settings.newsletter_enabled !== 'false' ? '' : 'opacity-40'
                  }`}
                >
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#C62828] block">
                    {settings.newsletter_eyebrow || 'The HeyGoodly Dispatch'}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">
                    {settings.newsletter_title || 'Independent Reviews'}
                  </h3>
                  <p className="text-xs text-slate-600 max-w-md mx-auto">
                    {settings.newsletter_description}
                  </p>
                  <div className="pt-1 flex items-center justify-center gap-2 max-w-sm mx-auto">
                    <div className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-left text-slate-500">
                      {settings.newsletter_placeholder || 'Enter your email...'}
                    </div>
                    <span className="bg-[#C62828] text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs">
                      {settings.newsletter_button_text || 'Subscribe'}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* =========================================================================
              TAB 6: SECURITY & ACCESS POLICIES
             ========================================================================= */}
          {activeTab === 'security' && (
            <Card className="p-6 sm:p-7 space-y-6 rounded-2xl">
              <div className="border-b border-slate-100 pb-4">
                <CardTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Lock className="text-[#C62828]" size={20} />
                  {t('Security & Access Policies')}
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-0.5">
                  {t('Global login lockout windows, TOTP authenticator tolerances, and developer bypass modes.')}
                </CardDescription>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">{t('Max Failed Login Attempts')}</label>
                  <Input
                    type="number"
                    min="1"
                    max="20"
                    value={settings.auth_max_failed_attempts ?? '5'}
                    onChange={(e) => updateField('auth_max_failed_attempts', e.target.value)}
                    className="font-mono"
                  />
                  <span className="text-[10px] text-slate-500 block">
                    {t('Accounts are temporarily locked after reaching this number of sequential password failures.')}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">{t('Account Lockout Duration (Seconds)')}</label>
                  <Input
                    type="number"
                    min="5"
                    max="3600"
                    value={settings.auth_lockout_seconds ?? '30'}
                    onChange={(e) => updateField('auth_lockout_seconds', e.target.value)}
                    className="font-mono"
                  />
                  <span className="text-[10px] text-slate-500 block">
                    {t('Cooldown window duration during which authentication requests from locked accounts are rejected.')}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">{t('2FA Authenticator Issuer Name')}</label>
                  <Input
                    value={settings.two_factor_issuer ?? 'HeyGoodlyProCMS'}
                    onChange={(e) => updateField('two_factor_issuer', e.target.value)}
                    className="font-mono"
                  />
                  <span className="text-[10px] text-slate-500 block">
                    {t('Label registered into user authenticator apps (e.g. Google Authenticator, 1Password).')}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">{t('2FA TOTP Window Size Tolerance')}</label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={settings.two_factor_window_size ?? '3'}
                    onChange={(e) => updateField('two_factor_window_size', e.target.value)}
                    className="font-mono"
                  />
                  <span className="text-[10px] text-slate-500 block">
                    {t('Number of 30-second time steps permitted for clock drift compensation between server and phone.')}
                  </span>
                </div>

                {/* Developer 2FA Bypass Mode */}
                <div className="sm:col-span-2 pt-2 border-t border-slate-100 space-y-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900">{t('Developer 2FA Bypass Mode')}</span>
                        {settings.two_factor_dev_bypass_enabled === 'true' ? (
                          <Badge variant="warning">Dev Bypass Active</Badge>
                        ) : (
                          <Badge variant="secondary">Disabled (Strict)</Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {t('Allows automated test suites and local development environments to authenticate using the static dev test code.')}
                      </p>
                    </div>

                    <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={settings.two_factor_dev_bypass_enabled === 'true'}
                        onChange={() => toggleField('two_factor_dev_bypass_enabled', settings.two_factor_dev_bypass_enabled ?? 'false')}
                        className="w-4 h-4 accent-[#C62828]"
                      />
                      <span>{t('Enable Dev 2FA Bypass')}</span>
                    </label>
                  </div>

                  {settings.two_factor_dev_bypass_enabled === 'true' && (
                    <div className="space-y-1.5 max-w-sm">
                      <label className="text-xs font-bold text-slate-700">{t('Developer Test OTP Passcode')}</label>
                      <Input
                        value={settings.two_factor_dev_otp ?? ''}
                        onChange={(e) => updateField('two_factor_dev_otp', e.target.value.replace(/\D/g, ''))}
                        placeholder="6-digit OTP"
                        className="font-mono text-xs font-bold tracking-widest"
                      />
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}
        </form>
      )}
    </div>
  );
}
