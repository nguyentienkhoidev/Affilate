export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'heygoodly_access_token',
  REFRESH_TOKEN: 'heygoodly_refresh_token',
  USER_DATA: 'heygoodly_user_data',
  SAVED_DEALS: 'heygoodly_saved_deals',
  AFFILIATE_UTM: 'heygoodly_traffic_utm',
} as const;

export const SEO_DEFAULTS = {
  SITE_NAME: 'HeyGoodly',
  TAGLINE: 'Smart News & Hot Deals - Save More Daily',
  DEFAULT_TITLE: 'HeyGoodly - Verified Coupon Codes, Promo Discounts & Tech Reviews 2026',
  DEFAULT_DESCRIPTION: 'Find 100% verified coupons, promo codes, exclusive deals, and honest shopping reviews to maximize your savings every day.',
  DEFAULT_OG_IMAGE: '/og-default.jpg',
  TWITTER_HANDLE: '@heygoodly',
} as const;

export const UI_CONSTANTS = {
  DEBOUNCE_DELAY_MS: 300,
  TOAST_DURATION_MS: 3000,
  COUPON_POPUP_PARAM: 'offer',
  DEFAULT_PAGE_SIZE: 20,
} as const;
