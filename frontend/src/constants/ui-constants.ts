export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'bargorya_access_token',
  REFRESH_TOKEN: 'bargorya_refresh_token',
  USER_DATA: 'bargorya_user_data',
  SAVED_DEALS: 'bargorya_saved_deals',
  AFFILIATE_UTM: 'bargorya_traffic_utm',
} as const;

export const SEO_DEFAULTS = {
  SITE_NAME: 'Bargorya',
  TAGLINE: 'Smart News & Hot Deals - Save More Daily',
  DEFAULT_TITLE: 'Bargorya - Verified Coupon Codes, Promo Discounts & Tech Reviews 2026',
  DEFAULT_DESCRIPTION: 'Find 100% verified coupons, promo codes, exclusive deals, and honest shopping reviews to maximize your savings every day.',
  DEFAULT_OG_IMAGE: '/og-default.jpg',
  TWITTER_HANDLE: '@bargorya',
} as const;

export const UI_CONSTANTS = {
  DEBOUNCE_DELAY_MS: 300,
  TOAST_DURATION_MS: 3000,
  COUPON_POPUP_PARAM: 'offer',
  DEFAULT_PAGE_SIZE: 20,
} as const;
