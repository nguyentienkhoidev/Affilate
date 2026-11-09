import { apiClient } from '@/lib/api/axios-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';

export interface SystemSettingsMap {
  [key: string]: string;
}

export const BASELINE_FACTORY_SETTINGS: SystemSettingsMap = {
  // Brand & Identity
  site_name: 'HeyGoodly',
  site_slogan: 'Coupon Codes & Honest Tech Reviews',
  contact_email: 'contact@heygoodly.com',
  contact_hotline: '',
  contact_address: '',
  site_logo: '',
  site_favicon: '',
  footer_copyright: '© 2026 HeyGoodly. All rights reserved.',

  // SEO & Verification
  meta_title: 'HeyGoodly - Latest Deals, Verified Coupons & Shopping Reviews',
  meta_description: 'Discover verified promo codes, discounts, exclusive deals, and honest shopping reviews to save more every day.',
  google_meta: '',
  bing_meta: '',
  canonical_url: 'https://heygoodly.com',
  og_image: '',
  no_index: 'false',

  // Telemetry & Tracking
  gtm_id: '',
  gtag_id: '',
  facebook_pixel: '',
  cloudflare_token: '',

  // Monetization & Ads
  header_ads_active: 'false',
  header_ads_badge: 'Partner Spotlight',
  header_ads_subtitle: 'Vetted Promotion',
  header_ads_title: '',
  header_ads_description: '',
  header_ads_button_text: 'Discover',
  header_ads_banner_url: '',
  header_ads_banner_img: '',
  affiliate_redirect_prefix: '/out/',
  affiliate_amazon_tag: '',
  affiliate_impact_id: '',
  affiliate_cj_id: '',
  affiliate_shareasale_id: '',
  affiliate_disclosure: 'HeyGoodly is reader-supported. When you buy through links on our site, we may earn an affiliate commission at no extra cost to you.',

  // Newsletter
  newsletter_enabled: 'true',
  newsletter_eyebrow: 'The HeyGoodly Dispatch',
  newsletter_title: 'Independent Reviews & Product Tests, Weekly',
  newsletter_description: 'Zero sponsored ranking manipulation. Subscribe to receive independent product tests and verified discounts.',
  newsletter_placeholder: 'Enter your email address...',
  newsletter_button_text: 'Subscribe',
  newsletter_success_message: 'Thank you for subscribing! Watch your inbox for the next Dispatch.',
  newsletter_welcome_subject: 'Welcome to HeyGoodly Dispatch',
  newsletter_double_optin: 'false',

  // Security Policies
  auth_max_failed_attempts: '5',
  auth_lockout_seconds: '30',
  two_factor_issuer: 'HeyGoodlyProCMS',
  two_factor_window_size: '3',
  two_factor_dev_bypass_enabled: 'false',
  two_factor_dev_otp: '',
};

class SettingService {
  /**
   * Fetch all system settings from PostgreSQL (Admin only)
   */
  async getAdminSettings(): Promise<SystemSettingsMap> {
    const res = await apiClient.get(API_ENDPOINTS.ADMIN.SETTINGS);
    const data = res.data?.data?.settings || res.data?.data || {};
    return typeof data === 'object' ? data : {};
  }

  /**
   * Update system settings in PostgreSQL (Admin only)
   */
  async updateAdminSettings(settings: SystemSettingsMap): Promise<SystemSettingsMap> {
    const res = await apiClient.put(API_ENDPOINTS.ADMIN.SETTINGS, { settings });
    const data = res.data?.data?.settings || res.data?.data || {};
    return typeof data === 'object' ? data : {};
  }

  /**
   * Fetch public system settings (Public client portal)
   */
  async getPublicSettings(): Promise<SystemSettingsMap> {
    const res = await apiClient.get(API_ENDPOINTS.PUBLIC.SETTINGS);
    const data = res.data?.data?.settings || res.data?.data || {};
    return typeof data === 'object' ? data : {};
  }

  /**
   * Reset all settings to baseline factory defaults in PostgreSQL
   */
  async resetToDefaults(): Promise<SystemSettingsMap> {
    return this.updateAdminSettings(BASELINE_FACTORY_SETTINGS);
  }
}

export const settingService = new SettingService();

