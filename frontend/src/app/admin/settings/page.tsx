'use client';

import { useState, useEffect } from 'react';
import {
  Settings,
  Globe,
  ShieldCheck,
  BarChart3,
  DollarSign,
  Save,
  CheckCircle2,
  Copy,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { usePermission } from '@/lib/admin/usePermission';
import UnauthorizedAccess from '@/components/admin/UnauthorizedAccess';

export default function AdminSettingsPage() {
  const { hasPermission } = usePermission();
  const [activeTab, setActiveTab] = useState<'general' | 'seo' | 'tracking' | 'ads'>('general');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const paramTab = new URLSearchParams(window.location.search).get('tab');
      if (paramTab === 'seo' || paramTab === 'tracking' || paramTab === 'ads' || paramTab === 'general') {
        setActiveTab(paramTab);
      }
    }
  }, []);

  if (!hasPermission('setting.general')) {
    return <UnauthorizedAccess requiredPermission="setting.general" moduleName="System Settings" />;
  }

  const [form, setForm] = useState({
    // General
    siteName: 'Bargorya',
    tagline: 'Verified Coupon Codes & Honest Tech Reviews',
    logoUrl: '/logo.png',
    contactEmail: 'contact@bargorya.com',
    supportHotline: '+1 (800) 555-0199',

    // SEO & Affiliate Network Verification
    partnerboostMeta: '<meta name="partnerboost-site-verification" content="pb_verify_982348921" />',
    impactMeta: '<meta name="impact-site-verification" content="impact_id_77812903" />',
    googleMeta: '<meta name="google-site-verification" content="google_auth_token_8892" />',
    bingMeta: '<meta name="msvalidate.01" content="bing_auth_token_4412" />',

    // Tracking
    gtmId: 'GTM-BG9942A',
    ga4Id: 'G-772910842',
    facebookPixel: '88291029481920',

    // Ads
    headerAdsBannerImg: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=728&h=90&fit=crop&q=80',
    headerAdsBannerUrl: 'https://www.anker.com/?cj_ref=bargorya',
    headerAdsActive: true,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const tabs = [
    { id: 'general', label: 'Brand & Identity', icon: Globe },
    { id: 'seo', label: 'SEO & Networks', icon: ShieldCheck },
    { id: 'tracking', label: 'Telemetry & GTM', icon: BarChart3 },
    { id: 'ads', label: 'Monetization & Ads', icon: DollarSign },
  ] as const;

  return (
    <div className="space-y-6">
      
      {/* Page Title & Save Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
            System & Platform Configuration
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Global metadata, affiliate network ownership verification tags, and third-party telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {saved && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
              <CheckCircle2 size={14} /> Settings Saved
            </span>
          )}
          <Button onClick={handleSave} size="sm">
            <Save size={14} /> Save Changes
          </Button>
        </div>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-zinc-200 pb-3 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`h-8.5 px-3.5 inline-flex items-center gap-2 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-zinc-900 text-white shadow-2xs'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Settings Forms */}
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Tab 1: General Brand & Identity */}
        {activeTab === 'general' && (
          <Card className="p-6 space-y-6">
            <div>
              <CardTitle>Site Identity & Branding</CardTitle>
              <CardDescription>Primary public branding displayed in headers and email footers</CardDescription>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700">Platform Public Name</label>
                <Input
                  value={form.siteName}
                  onChange={(e) => setForm({ ...form, siteName: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700">Tagline (SEO Title Suffix)</label>
                <Input
                  value={form.tagline}
                  onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700">Contact Support Email</label>
                <Input
                  type="email"
                  value={form.contactEmail}
                  onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700">Editorial Support Hotline</label>
                <Input
                  value={form.supportHotline}
                  onChange={(e) => setForm({ ...form, supportHotline: e.target.value })}
                />
              </div>
            </div>
          </Card>
        )}

        {/* Tab 2: SEO & Affiliate Network Verification */}
        {activeTab === 'seo' && (
          <Card className="p-6 space-y-6">
            <div>
              <CardTitle>Affiliate Network & Search Engine Ownership Meta Tags</CardTitle>
              <CardDescription>
                These verification tags are automatically injected into the public HTML <code>&lt;head&gt;</code> to certify ownership for PartnerBoost, Impact, Google, and Bing.
              </CardDescription>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-700">
                    PartnerBoost Verification Meta Tag
                  </label>
                  <Badge variant="indigo">PartnerBoost Network</Badge>
                </div>
                <Input
                  value={form.partnerboostMeta}
                  onChange={(e) => setForm({ ...form, partnerboostMeta: e.target.value })}
                  className="font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-700">
                    Impact Radius Site Ownership Verification Tag
                  </label>
                  <Badge variant="indigo">Impact Radius</Badge>
                </div>
                <Input
                  value={form.impactMeta}
                  onChange={(e) => setForm({ ...form, impactMeta: e.target.value })}
                  className="font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-700">
                    Google Search Console Meta Tag
                  </label>
                  <Badge variant="secondary">Googlebot</Badge>
                </div>
                <Input
                  value={form.googleMeta}
                  onChange={(e) => setForm({ ...form, googleMeta: e.target.value })}
                  className="font-mono text-xs"
                />
              </div>
            </div>
          </Card>
        )}

        {/* Tab 3: Telemetry & Tracking Scripts */}
        {activeTab === 'tracking' && (
          <Card className="p-6 space-y-6">
            <div>
              <CardTitle>Telemetry & Event Tracking</CardTitle>
              <CardDescription>Container IDs for Google Tag Manager, GA4, and conversion pixels</CardDescription>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700">Google Tag Manager (GTM) Container ID</label>
                <Input
                  value={form.gtmId}
                  onChange={(e) => setForm({ ...form, gtmId: e.target.value })}
                  placeholder="GTM-XXXXXXX"
                  className="font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700">Google Analytics 4 (GA4) Measurement ID</label>
                <Input
                  value={form.ga4Id}
                  onChange={(e) => setForm({ ...form, ga4Id: e.target.value })}
                  placeholder="G-XXXXXXXXXX"
                  className="font-mono"
                />
              </div>
            </div>
          </Card>
        )}

        {/* Tab 4: Monetization & Ads */}
        {activeTab === 'ads' && (
          <Card className="p-6 space-y-6">
            <div>
              <CardTitle>Desktop Header Banner 728x90</CardTitle>
              <CardDescription>Configure promotional sponsorship banner shown on the public desktop header</CardDescription>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700">Banner Creative Image URL (728x90 px)</label>
                <Input
                  value={form.headerAdsBannerImg}
                  onChange={(e) => setForm({ ...form, headerAdsBannerImg: e.target.value })}
                  className="font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700">Destination Sponsor URL</label>
                <Input
                  value={form.headerAdsBannerUrl}
                  onChange={(e) => setForm({ ...form, headerAdsBannerUrl: e.target.value })}
                  className="font-mono text-xs"
                />
              </div>

              {/* Live Preview Box */}
              <div className="pt-2 space-y-2">
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                  Live Banner Preview
                </span>
                <div className="border border-zinc-200 rounded-xl p-3 bg-zinc-50 flex items-center justify-center">
                  <img
                    src={form.headerAdsBannerImg}
                    alt="728x90 Preview"
                    className="max-h-[90px] w-auto rounded border border-zinc-200"
                  />
                </div>
              </div>
            </div>
          </Card>
        )}

      </form>

    </div>
  );
}
