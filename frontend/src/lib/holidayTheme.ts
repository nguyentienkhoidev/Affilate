export type HolidayThemeMode = 'off' | 'auto' | 'manual';

export type CoreMarketCode = 'US' | 'GB' | 'CA' | 'FR' | 'DE' | 'AU';
export type ExtraMarketCode =
  | 'JP'
  | 'KR'
  | 'SG'
  | 'VN'
  | 'NZ'
  | 'NL'
  | 'ES'
  | 'IT'
  | 'SE'
  | 'IN'
  | 'BR'
  | 'MX'
  | 'AE';
export type MarketCode = CoreMarketCode | ExtraMarketCode | 'GLOBAL' | (string & {});
export type TargetCountryCode = CoreMarketCode;

export type HolidayRuleScope = 'world' | 'six_markets' | 'country';

export type HolidayThemeId =
  | 'none'
  | 'black_friday'
  | 'christmas'
  | 'new_year'
  | 'valentine'
  | 'easter'
  | 'prime_day'
  | 'halloween'
  | 'singles_day'
  | 'july_4th'
  | 'canada_day'
  | 'boxing_day'
  | 'eofy_sale'
  | 'french_soldes'
  | 'german_shopping'
  | 'us_holiday'
  | 'lunar_new_year'
  | 'double_day'
  | 'golden_week'
  | 'diwali_sale'
  | 'eu_seasonal_sale'
  | 'latam_sale'
  | 'white_friday';

export type HolidayEffectType = 'none' | 'snow' | 'confetti' | 'shimmer' | 'autumn' | 'stars';

export interface MarketMeta {
  code: MarketCode;
  name: string;
  flag: string;
  timezone: string;
}

export const TARGET_MARKETS: Array<MarketMeta & { code: TargetCountryCode }> = [
  { code: 'US', name: 'United States', flag: '🇺🇸', timezone: 'America/New_York' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', timezone: 'Europe/London' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', timezone: 'America/Toronto' },
  { code: 'FR', name: 'France', flag: '🇫🇷', timezone: 'Europe/Paris' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', timezone: 'Europe/Berlin' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', timezone: 'Australia/Sydney' },
];

export const EXTRA_MARKETS: MarketMeta[] = [
  { code: 'JP', name: 'Japan', flag: '🇯🇵', timezone: 'Asia/Tokyo' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷', timezone: 'Asia/Seoul' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', timezone: 'Asia/Singapore' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳', timezone: 'Asia/Ho_Chi_Minh' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', timezone: 'Pacific/Auckland' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', timezone: 'Europe/Amsterdam' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', timezone: 'Europe/Madrid' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', timezone: 'Europe/Rome' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪', timezone: 'Europe/Stockholm' },
  { code: 'IN', name: 'India', flag: '🇮🇳', timezone: 'Asia/Kolkata' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', timezone: 'America/Sao_Paulo' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', timezone: 'America/Mexico_City' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', timezone: 'Asia/Dubai' },
];

export const ALL_MARKETS: MarketMeta[] = [
  ...TARGET_MARKETS,
  ...EXTRA_MARKETS,
  { code: 'GLOBAL', name: 'Global / Other', flag: '🌍', timezone: 'UTC' },
];

export interface HolidayThemeConfig {
  id: HolidayThemeId;
  label: string;
  autoWindowLabel: string;
  ribbonText: string;
  ribbonBgClass: string;
  brandEmoji: string;
  effectType: HolidayEffectType;
}

export const HOLIDAY_THEMES: Record<HolidayThemeId, HolidayThemeConfig> = {
  none: {
    id: 'none',
    label: 'Normal (Default)',
    autoWindowLabel: 'Year-round standard layout',
    ribbonText: '',
    ribbonBgClass: '',
    brandEmoji: '',
    effectType: 'none',
  },
  black_friday: {
    id: 'black_friday',
    label: 'Black Friday & Cyber Monday',
    autoWindowLabel: 'Auto: Cyber Week (Nov)',
    ribbonText: 'Black Friday & Cyber Monday Deals Are Live — Verified Savings Updated Hourly',
    ribbonBgClass: 'bg-gradient-to-r from-neutral-950 via-[#C62828] to-neutral-950 text-white',
    brandEmoji: '⚡',
    effectType: 'shimmer',
  },
  christmas: {
    id: 'christmas',
    label: 'Christmas / Holiday Season',
    autoWindowLabel: 'Auto: Dec 12 – Dec 25',
    ribbonText: 'Holiday & Christmas Deals — Hand-Tested Gift Codes & Festive Offers',
    ribbonBgClass: 'bg-gradient-to-r from-[#14532D] via-[#B91C1C] to-[#14532D] text-white',
    brandEmoji: '🎄',
    effectType: 'snow',
  },
  new_year: {
    id: 'new_year',
    label: 'New Year & Winter Clearance',
    autoWindowLabel: 'Auto: Dec 26 – Jan 5',
    ribbonText: 'Happy New Year! Fresh Deals & Winter Clearance Promo Codes',
    ribbonBgClass: 'bg-gradient-to-r from-slate-900 via-amber-600 to-slate-900 text-white',
    brandEmoji: '🎆',
    effectType: 'confetti',
  },
  valentine: {
    id: 'valentine',
    label: "Valentine's Day Savings",
    autoWindowLabel: 'Auto: Feb 7 – Feb 14',
    ribbonText: "Valentine's Day Gift Guide — Verified Promo Codes on Jewelry, Beauty & Gifts",
    ribbonBgClass: 'bg-gradient-to-r from-rose-900 via-pink-600 to-rose-900 text-white',
    brandEmoji: '💖',
    effectType: 'confetti',
  },
  easter: {
    id: 'easter',
    label: 'Easter Spring Sale',
    autoWindowLabel: 'Auto: Easter Weekend',
    ribbonText: 'Easter & Spring Savings — Verified Promo Codes Across Top Brands',
    ribbonBgClass: 'bg-gradient-to-r from-emerald-800 via-teal-600 to-emerald-800 text-white',
    brandEmoji: '🐣',
    effectType: 'confetti',
  },
  prime_day: {
    id: 'prime_day',
    label: 'Prime Day / Mid-Year Deals',
    autoWindowLabel: 'Auto: Jul 10 – Jul 17 & Oct',
    ribbonText: 'Mid-Year Mega Deals — Prime Day & Brand Counter-Sales Verified Live',
    ribbonBgClass: 'bg-gradient-to-r from-slate-950 via-blue-700 to-slate-950 text-white',
    brandEmoji: '🏷️',
    effectType: 'shimmer',
  },
  halloween: {
    id: 'halloween',
    label: 'Halloween Spooky Savings',
    autoWindowLabel: 'Auto: Oct 20 – Oct 31',
    ribbonText: 'Halloween Flash Savings — Spooky Good Promo Codes & Limited Deals',
    ribbonBgClass: 'bg-gradient-to-r from-purple-950 via-orange-600 to-purple-950 text-white',
    brandEmoji: '🎃',
    effectType: 'autumn',
  },
  singles_day: {
    id: 'singles_day',
    label: "11.11 Singles' Day Sale",
    autoWindowLabel: 'Auto: Nov 10 – Nov 11 (excl. US/CA)',
    ribbonText: "11.11 Global Shopping Festival — Limited-Time Flash Coupons & Deals",
    ribbonBgClass: 'bg-gradient-to-r from-red-900 via-orange-600 to-red-900 text-white',
    brandEmoji: '🛍️',
    effectType: 'confetti',
  },
  july_4th: {
    id: 'july_4th',
    label: '4th of July (US Independence Day)',
    autoWindowLabel: 'US Only: Jul 1 – Jul 5',
    ribbonText: '4th of July Summer Sale — Top US Brand Discounts & Verified Codes',
    ribbonBgClass: 'bg-gradient-to-r from-blue-900 via-[#C62828] to-blue-900 text-white',
    brandEmoji: '🇺🇸',
    effectType: 'stars',
  },
  canada_day: {
    id: 'canada_day',
    label: 'Canada Day Sale',
    autoWindowLabel: 'CA Only: Jun 29 – Jul 2',
    ribbonText: 'Happy Canada Day! Verified Canadian Store Discounts & Promo Codes',
    ribbonBgClass: 'bg-gradient-to-r from-red-800 via-red-600 to-red-800 text-white',
    brandEmoji: '🍁',
    effectType: 'confetti',
  },
  boxing_day: {
    id: 'boxing_day',
    label: 'Boxing Day Mega Sale',
    autoWindowLabel: 'UK/CA/AU: Dec 26 – Dec 31',
    ribbonText: 'Boxing Day & Week Sale — Biggest Post-Christmas Discounts & Clearance Codes',
    ribbonBgClass: 'bg-gradient-to-r from-indigo-950 via-rose-700 to-indigo-950 text-white',
    brandEmoji: '🎁',
    effectType: 'confetti',
  },
  eofy_sale: {
    id: 'eofy_sale',
    label: 'EOFY Sale (Australia)',
    autoWindowLabel: 'AU Only: Jun 20 – Jun 30',
    ribbonText: 'EOFY End of Financial Year Sale — Top Tech, Software & Office Deals in Australia',
    ribbonBgClass: 'bg-gradient-to-r from-emerald-950 via-amber-600 to-emerald-950 text-white',
    brandEmoji: '🇦🇺',
    effectType: 'shimmer',
  },
  french_soldes: {
    id: 'french_soldes',
    label: 'Soldes & French Days (France)',
    autoWindowLabel: 'FR Only: Jan / Apr / Jun-Jul / Sep',
    ribbonText: 'French Sales & Soldes — Verified Discounts Across Top French & EU Retailers',
    ribbonBgClass: 'bg-gradient-to-r from-blue-950 via-indigo-700 to-rose-800 text-white',
    brandEmoji: '🇫🇷',
    effectType: 'shimmer',
  },
  german_shopping: {
    id: 'german_shopping',
    label: 'Germany Shopping Week / Nikolaus',
    autoWindowLabel: 'DE Only: Apr / Oct / Dec 6',
    ribbonText: 'Germany Special Shopping Event — Exclusive Verified Voucher Codes & Deals',
    ribbonBgClass: 'bg-gradient-to-r from-neutral-950 via-red-700 to-amber-600 text-white',
    brandEmoji: '🇩🇪',
    effectType: 'shimmer',
  },
  us_holiday: {
    id: 'us_holiday',
    label: 'US Federal Sale Weekend',
    autoWindowLabel: 'US Only: Presidents / Memorial / Labor Day',
    ribbonText: 'US Holiday Weekend Sale — Verified Savings on Tech, Home & Fashion',
    ribbonBgClass: 'bg-gradient-to-r from-slate-900 via-blue-800 to-[#C62828] text-white',
    brandEmoji: '🇺🇸',
    effectType: 'stars',
  },
  lunar_new_year: {
    id: 'lunar_new_year',
    label: 'Lunar New Year / Tết Sale',
    autoWindowLabel: 'VN/SG/KR: Jan – Feb',
    ribbonText: 'Lunar New Year Mega Deals — Lucky Red-Envelope Savings & Verified Promo Codes',
    ribbonBgClass: 'bg-gradient-to-r from-red-900 via-amber-600 to-red-900 text-white',
    brandEmoji: '🧧',
    effectType: 'confetti',
  },
  double_day: {
    id: 'double_day',
    label: 'Double Day Flash Sale (9.9 / 10.10 / 12.12)',
    autoWindowLabel: 'SG/VN/KR: Double Days',
    ribbonText: 'Mega Double-Day Flash Sale — Limited-Time Verified Coupons & Brand Deals',
    ribbonBgClass: 'bg-gradient-to-r from-orange-700 via-rose-600 to-orange-700 text-white',
    brandEmoji: '🔥',
    effectType: 'shimmer',
  },
  golden_week: {
    id: 'golden_week',
    label: 'Golden Week Sale (Japan)',
    autoWindowLabel: 'JP Only: Apr 28 – May 5',
    ribbonText: 'Japan Golden Week Sale — Verified Travel, Tech & Lifestyle Promo Codes',
    ribbonBgClass: 'bg-gradient-to-r from-rose-900 via-red-600 to-rose-900 text-white',
    brandEmoji: '🇯🇵',
    effectType: 'confetti',
  },
  diwali_sale: {
    id: 'diwali_sale',
    label: 'Diwali / Great Indian Festival',
    autoWindowLabel: 'IN Only: Oct – Nov',
    ribbonText: 'Diwali Festival of Lights Sale — Biggest Electronics & Fashion Discounts in India',
    ribbonBgClass: 'bg-gradient-to-r from-amber-900 via-orange-600 to-purple-900 text-white',
    brandEmoji: '🪔',
    effectType: 'confetti',
  },
  eu_seasonal_sale: {
    id: 'eu_seasonal_sale',
    label: 'EU Seasonal Sales (Rebajas / Saldi / Koningsdag)',
    autoWindowLabel: 'NL/ES/IT/SE: Seasonal Windows',
    ribbonText: 'European Seasonal Clearance — Verified Retailer Promo Codes Across EU',
    ribbonBgClass: 'bg-gradient-to-r from-blue-900 via-indigo-600 to-blue-900 text-white',
    brandEmoji: '🇪🇺',
    effectType: 'shimmer',
  },
  latam_sale: {
    id: 'latam_sale',
    label: 'El Buen Fin / Hot Sale (LATAM)',
    autoWindowLabel: 'BR/MX: Mar / May / Nov',
    ribbonText: 'LATAM Mega Shopping Event — Verified Deals & Promo Codes in Brazil & Mexico',
    ribbonBgClass: 'bg-gradient-to-r from-emerald-900 via-amber-600 to-emerald-900 text-white',
    brandEmoji: '🌎',
    effectType: 'confetti',
  },
  white_friday: {
    id: 'white_friday',
    label: 'White Friday & UAE National Sale',
    autoWindowLabel: 'AE Only: Nov – Dec',
    ribbonText: 'White Friday Mega Deals UAE — Exclusive Electronics, Luxury & Fashion Codes',
    ribbonBgClass: 'bg-gradient-to-r from-slate-900 via-emerald-700 to-slate-900 text-white',
    brandEmoji: '🇦🇪',
    effectType: 'shimmer',
  },
};

export type HolidayMatcherType = 'fixed' | 'nth_weekday' | 'easter' | 'black_friday';

export interface HolidayRule {
  id: string;
  name: string;
  scope: HolidayRuleScope;
  themeId: HolidayThemeId;
  priority: number; // 100 = Global Mega, 80 = Country Major, 50 = Global Standard
  countries: MarketCode[]; // ['US', 'GB', ...] or ['GLOBAL', 'US', ...]
  excludeCountries?: MarketCode[];
  matcherType: HolidayMatcherType;
  startMonth?: number;
  startDay?: number;
  endMonth?: number;
  endDay?: number;
  yearDates?: Record<number, { startMonth: number; startDay: number; endMonth: number; endDay: number }>;
  month?: number;
  weekday?: number; // 0=Sun..6=Sat
  nth?: number; // 1..4 or -1 for last
  windowDaysBefore?: number;
  windowDaysAfter?: number;
  customRibbonText?: string;
  enabled: boolean;
}

export const DEFAULT_HOLIDAY_RULES: HolidayRule[] = [
  // --- TIER 2: GLOBAL MEGA (Priority 100) ---
  {
    id: 'world-black-friday',
    name: 'Black Friday & Cyber Monday',
    scope: 'world',
    themeId: 'black_friday',
    priority: 100,
    countries: ['US', 'GB', 'CA', 'FR', 'DE', 'AU', 'GLOBAL'],
    matcherType: 'black_friday',
    windowDaysBefore: 4,
    windowDaysAfter: 4,
    enabled: true,
  },
  {
    id: 'world-christmas',
    name: 'Christmas / Holiday Season',
    scope: 'world',
    themeId: 'christmas',
    priority: 100,
    countries: ['US', 'GB', 'CA', 'FR', 'DE', 'AU', 'GLOBAL'],
    matcherType: 'fixed',
    startMonth: 12,
    startDay: 12,
    endMonth: 12,
    endDay: 25,
    enabled: true,
  },

  // --- TIER 3: COUNTRY-SPECIFIC MAJOR EVENTS (Priority 80) ---
  {
    id: 'country-us-july4',
    name: '4th of July (US Independence Day)',
    scope: 'country',
    themeId: 'july_4th',
    priority: 85,
    countries: ['US'],
    matcherType: 'fixed',
    startMonth: 7,
    startDay: 1,
    endMonth: 7,
    endDay: 5,
    enabled: true,
  },
  {
    id: 'country-us-presidents',
    name: "Presidents' Day Sale (US)",
    scope: 'country',
    themeId: 'us_holiday',
    priority: 80,
    countries: ['US'],
    matcherType: 'nth_weekday',
    month: 2,
    weekday: 1,
    nth: 3,
    windowDaysBefore: 3,
    windowDaysAfter: 1,
    customRibbonText: "Presidents' Day Weekend Sale — Verified US Mattress, Home & Tech Deals",
    enabled: true,
  },
  {
    id: 'country-us-memorial',
    name: 'Memorial Day Sale (US)',
    scope: 'country',
    themeId: 'us_holiday',
    priority: 80,
    countries: ['US'],
    matcherType: 'nth_weekday',
    month: 5,
    weekday: 1,
    nth: -1,
    windowDaysBefore: 3,
    windowDaysAfter: 1,
    customRibbonText: 'Memorial Day Summer Kickoff Sale — Verified US Discounts Live',
    enabled: true,
  },
  {
    id: 'country-us-labor',
    name: 'Labor Day Sale (US & CA)',
    scope: 'country',
    themeId: 'us_holiday',
    priority: 80,
    countries: ['US', 'CA'],
    matcherType: 'nth_weekday',
    month: 9,
    weekday: 1,
    nth: 1,
    windowDaysBefore: 3,
    windowDaysAfter: 1,
    customRibbonText: 'Labor Day Weekend Sale — End-of-Summer & Back-to-School Deals',
    enabled: true,
  },
  {
    id: 'country-ca-canada-day',
    name: 'Canada Day Sale',
    scope: 'country',
    themeId: 'canada_day',
    priority: 85,
    countries: ['CA'],
    matcherType: 'fixed',
    startMonth: 6,
    startDay: 29,
    endMonth: 7,
    endDay: 2,
    enabled: true,
  },
  {
    id: 'country-ca-victoria',
    name: 'Victoria Day Sale (CA)',
    scope: 'country',
    themeId: 'canada_day',
    priority: 80,
    countries: ['CA'],
    matcherType: 'fixed',
    startMonth: 5,
    startDay: 18,
    endMonth: 5,
    endDay: 25,
    customRibbonText: 'Victoria Day Long Weekend Sale — Verified Canadian Store Offers',
    enabled: true,
  },
  {
    id: 'country-ca-thanksgiving',
    name: 'Canadian Thanksgiving',
    scope: 'country',
    themeId: 'canada_day',
    priority: 80,
    countries: ['CA'],
    matcherType: 'nth_weekday',
    month: 10,
    weekday: 1,
    nth: 2,
    windowDaysBefore: 3,
    windowDaysAfter: 1,
    customRibbonText: 'Canadian Thanksgiving Weekend Deals — Home, Kitchen & Apparel Savings',
    enabled: true,
  },
  {
    id: 'country-commonwealth-boxing',
    name: 'Boxing Day Sale (UK, CA, AU)',
    scope: 'country',
    themeId: 'boxing_day',
    priority: 90,
    countries: ['GB', 'CA', 'AU'],
    matcherType: 'fixed',
    startMonth: 12,
    startDay: 26,
    endMonth: 12,
    endDay: 31,
    enabled: true,
  },
  {
    id: 'country-gb-bank-holiday',
    name: 'UK Summer Bank Holiday Sale',
    scope: 'country',
    themeId: 'prime_day',
    priority: 80,
    countries: ['GB'],
    matcherType: 'nth_weekday',
    month: 8,
    weekday: 1,
    nth: -1,
    windowDaysBefore: 3,
    windowDaysAfter: 1,
    customRibbonText: 'UK Bank Holiday Mega Deals — Hand-Tested Voucher Codes',
    enabled: true,
  },
  {
    id: 'country-fr-soldes-winter',
    name: "Soldes d'hiver (France)",
    scope: 'country',
    themeId: 'french_soldes',
    priority: 80,
    countries: ['FR'],
    matcherType: 'fixed',
    startMonth: 1,
    startDay: 8,
    endMonth: 2,
    endDay: 4,
    customRibbonText: "Soldes d'hiver — Verified Promo Codes & Winter Clearance in France",
    enabled: true,
  },
  {
    id: 'country-fr-soldes-summer',
    name: "Soldes d'été (France)",
    scope: 'country',
    themeId: 'french_soldes',
    priority: 80,
    countries: ['FR'],
    matcherType: 'fixed',
    startMonth: 6,
    startDay: 25,
    endMonth: 7,
    endDay: 22,
    customRibbonText: "Soldes d'été — Official French Summer Sales & Verified Codes",
    enabled: true,
  },
  {
    id: 'country-fr-french-days-autumn',
    name: 'French Days Autumn (FR)',
    scope: 'country',
    themeId: 'french_soldes',
    priority: 80,
    countries: ['FR'],
    matcherType: 'fixed',
    startMonth: 9,
    startDay: 24,
    endMonth: 9,
    endDay: 30,
    customRibbonText: 'French Days — Limited-Time Tech, Home & Fashion Promo Codes',
    enabled: true,
  },
  {
    id: 'country-de-glamour-spring',
    name: 'Glamour Shopping Week Spring (DE)',
    scope: 'country',
    themeId: 'german_shopping',
    priority: 80,
    countries: ['DE'],
    matcherType: 'fixed',
    startMonth: 4,
    startDay: 1,
    endMonth: 4,
    endDay: 9,
    customRibbonText: 'Spring Shopping Week Germany — Exclusive Brand Voucher Codes',
    enabled: true,
  },
  {
    id: 'country-de-glamour-autumn',
    name: 'Glamour Shopping Week Autumn (DE)',
    scope: 'country',
    themeId: 'german_shopping',
    priority: 80,
    countries: ['DE'],
    matcherType: 'fixed',
    startMonth: 10,
    startDay: 1,
    endMonth: 10,
    endDay: 9,
    customRibbonText: 'Autumn Shopping Week Germany — Exclusive Brand Voucher Codes',
    enabled: true,
  },
  {
    id: 'country-de-nikolaus',
    name: 'Nikolaustag Deals (Germany)',
    scope: 'country',
    themeId: 'german_shopping',
    priority: 80,
    countries: ['DE'],
    matcherType: 'fixed',
    startMonth: 12,
    startDay: 5,
    endMonth: 12,
    endDay: 6,
    customRibbonText: 'Nikolaustag Gift Deals — Verified German Store Vouchers',
    enabled: true,
  },
  {
    id: 'country-au-australia-day',
    name: 'Australia Day Sale (AU)',
    scope: 'country',
    themeId: 'eofy_sale',
    priority: 80,
    countries: ['AU'],
    matcherType: 'fixed',
    startMonth: 1,
    startDay: 24,
    endMonth: 1,
    endDay: 27,
    customRibbonText: 'Australia Day Summer Sale — Verified Aussie Brand Discounts',
    enabled: true,
  },
  {
    id: 'country-au-eofy',
    name: 'EOFY End of Financial Year (AU)',
    scope: 'country',
    themeId: 'eofy_sale',
    priority: 85,
    countries: ['AU'],
    matcherType: 'fixed',
    startMonth: 6,
    startDay: 20,
    endMonth: 6,
    endDay: 30,
    enabled: true,
  },
  {
    id: 'country-au-click-frenzy',
    name: 'Click Frenzy Mayhem (AU)',
    scope: 'country',
    themeId: 'prime_day',
    priority: 80,
    countries: ['AU'],
    matcherType: 'fixed',
    startMonth: 5,
    startDay: 14,
    endMonth: 5,
    endDay: 18,
    customRibbonText: 'Click Frenzy Australia — Verified Flash Codes & Clearance Deals',
    enabled: true,
  },

  // --- TIER 4: SHARED 6 MARKETS & GLOBAL STANDARD (Priority 50) ---
  {
    id: 'world-new-year',
    name: 'New Year & Year-End Clearance',
    scope: 'world',
    themeId: 'new_year',
    priority: 50,
    countries: ['US', 'GB', 'CA', 'FR', 'DE', 'AU', 'GLOBAL'],
    matcherType: 'fixed',
    startMonth: 12,
    startDay: 26,
    endMonth: 1,
    endDay: 5,
    enabled: true,
  },
  {
    id: 'six-valentine',
    name: "Valentine's Day",
    scope: 'six_markets',
    themeId: 'valentine',
    priority: 50,
    countries: ['US', 'GB', 'CA', 'FR', 'DE', 'AU', 'GLOBAL'],
    matcherType: 'fixed',
    startMonth: 2,
    startDay: 7,
    endMonth: 2,
    endDay: 14,
    enabled: true,
  },
  // --- EXTRA MARKETS COUNTRY-SPECIFIC RULES (Priority 80-105) ---
  {
    id: 'country-jp-hatsu-uri',
    name: 'Hatsu-uri / Fukubukuro New Year (JP)',
    scope: 'country',
    themeId: 'new_year',
    priority: 85,
    countries: ['JP'],
    matcherType: 'fixed',
    startMonth: 1,
    startDay: 1,
    endMonth: 1,
    endDay: 3,
    customRibbonText: 'Japan Hatsu-uri & Fukubukuro Sale — New Year Lucky Bag & Tech Deals',
    enabled: true,
  },
  {
    id: 'country-jp-golden-week',
    name: 'Golden Week Sale (JP)',
    scope: 'country',
    themeId: 'golden_week',
    priority: 85,
    countries: ['JP'],
    matcherType: 'fixed',
    startMonth: 4,
    startDay: 28,
    endMonth: 5,
    endDay: 5,
    enabled: true,
  },
  {
    id: 'country-jp-obon',
    name: 'Obon Summer Sale (JP)',
    scope: 'country',
    themeId: 'prime_day',
    priority: 80,
    countries: ['JP'],
    matcherType: 'fixed',
    startMonth: 8,
    startDay: 13,
    endMonth: 8,
    endDay: 16,
    customRibbonText: 'Japan Obon Summer Deals — Verified Travel, Electronics & Store Codes',
    enabled: true,
  },
  {
    id: 'country-asia-lunar-ny',
    name: 'Lunar New Year / Tết / Seollal (VN, SG, KR)',
    scope: 'country',
    themeId: 'lunar_new_year',
    priority: 85,
    countries: ['VN', 'SG', 'KR'],
    matcherType: 'fixed',
    startMonth: 1,
    startDay: 20,
    endMonth: 2,
    endDay: 20,
    yearDates: {
      2026: { startMonth: 2, startDay: 10, endMonth: 2, endDay: 22 },
      2027: { startMonth: 1, startDay: 30, endMonth: 2, endDay: 11 },
      2028: { startMonth: 1, startDay: 19, endMonth: 1, endDay: 31 },
      2029: { startMonth: 2, startDay: 6, endMonth: 2, endDay: 18 },
    },
    enabled: true,
  },
  {
    id: 'country-kr-chuseok',
    name: 'Chuseok Harvest Sale (KR)',
    scope: 'country',
    themeId: 'lunar_new_year',
    priority: 80,
    countries: ['KR'],
    matcherType: 'fixed',
    startMonth: 9,
    startDay: 14,
    endMonth: 9,
    endDay: 27,
    yearDates: {
      2026: { startMonth: 9, startDay: 21, endMonth: 9, endDay: 27 },
      2027: { startMonth: 9, startDay: 12, endMonth: 9, endDay: 17 },
      2028: { startMonth: 9, startDay: 30, endMonth: 10, endDay: 5 },
    },
    customRibbonText: 'Korea Chuseok Holiday Sale — Verified Gift Sets & Beauty Promo Codes',
    enabled: true,
  },
  {
    id: 'country-kr-festa',
    name: 'Korea Sale Festa (KR)',
    scope: 'country',
    themeId: 'double_day',
    priority: 80,
    countries: ['KR'],
    matcherType: 'fixed',
    startMonth: 11,
    startDay: 1,
    endMonth: 11,
    endDay: 15,
    customRibbonText: 'Korea Sale Festa — Nationwide Shopping Discounts & Verified Codes',
    enabled: true,
  },
  {
    id: 'country-sea-99',
    name: '9.9 Super Shopping Day (VN, SG)',
    scope: 'country',
    themeId: 'double_day',
    priority: 80,
    countries: ['VN', 'SG'],
    matcherType: 'fixed',
    startMonth: 9,
    startDay: 8,
    endMonth: 9,
    endDay: 9,
    enabled: true,
  },
  {
    id: 'country-sea-1010',
    name: '10.10 Brands Festival (VN, SG)',
    scope: 'country',
    themeId: 'double_day',
    priority: 80,
    countries: ['VN', 'SG'],
    matcherType: 'fixed',
    startMonth: 10,
    startDay: 9,
    endMonth: 10,
    endDay: 10,
    enabled: true,
  },
  {
    id: 'country-sea-1212',
    name: '12.12 Year-End Mega Sale (VN, SG)',
    scope: 'country',
    themeId: 'double_day',
    priority: 80,
    countries: ['VN', 'SG'],
    matcherType: 'fixed',
    startMonth: 12,
    startDay: 11,
    endMonth: 12,
    endDay: 12,
    enabled: true,
  },
  {
    id: 'country-vn-women',
    name: "Vietnamese Women's Day 20/10 (VN)",
    scope: 'country',
    themeId: 'valentine',
    priority: 80,
    countries: ['VN'],
    matcherType: 'fixed',
    startMonth: 10,
    startDay: 19,
    endMonth: 10,
    endDay: 20,
    customRibbonText: "Vietnamese Women's Day 20/10 — Verified Beauty, Fashion & Gift Deals",
    enabled: true,
  },
  {
    id: 'country-sg-national',
    name: 'Singapore National Day Sale (SG)',
    scope: 'country',
    themeId: 'double_day',
    priority: 80,
    countries: ['SG'],
    matcherType: 'fixed',
    startMonth: 8,
    startDay: 8,
    endMonth: 8,
    endDay: 9,
    customRibbonText: 'Singapore National Day Deals — Local & Global Brand Promo Codes',
    enabled: true,
  },
  {
    id: 'country-nz-waitangi',
    name: 'Waitangi Day Summer Sale (NZ)',
    scope: 'country',
    themeId: 'eofy_sale',
    priority: 80,
    countries: ['NZ'],
    matcherType: 'fixed',
    startMonth: 2,
    startDay: 5,
    endMonth: 2,
    endDay: 6,
    customRibbonText: 'Waitangi Day Summer Sale NZ — Verified Kiwi & Global Store Discounts',
    enabled: true,
  },
  {
    id: 'country-nz-boxing',
    name: 'Boxing Day Sale (NZ)',
    scope: 'country',
    themeId: 'boxing_day',
    priority: 90,
    countries: ['NZ'],
    matcherType: 'fixed',
    startMonth: 12,
    startDay: 26,
    endMonth: 12,
    endDay: 31,
    enabled: true,
  },
  {
    id: 'country-nl-kingsday',
    name: "Koningsdag / King's Day Sale (NL)",
    scope: 'country',
    themeId: 'eu_seasonal_sale',
    priority: 80,
    countries: ['NL'],
    matcherType: 'fixed',
    startMonth: 4,
    startDay: 26,
    endMonth: 4,
    endDay: 27,
    customRibbonText: "Koningsdag Orange Deals (NL) — Verified Dutch & EU Store Vouchers",
    enabled: true,
  },
  {
    id: 'country-es-rebajas-winter',
    name: 'Rebajas de Invierno (ES)',
    scope: 'country',
    themeId: 'eu_seasonal_sale',
    priority: 80,
    countries: ['ES'],
    matcherType: 'fixed',
    startMonth: 1,
    startDay: 7,
    endMonth: 1,
    endDay: 31,
    customRibbonText: 'Rebajas de Invierno — Official Spanish Winter Sales & Promo Codes',
    enabled: true,
  },
  {
    id: 'country-es-rebajas-summer',
    name: 'Rebajas de Verano (ES)',
    scope: 'country',
    themeId: 'eu_seasonal_sale',
    priority: 80,
    countries: ['ES'],
    matcherType: 'fixed',
    startMonth: 7,
    startDay: 1,
    endMonth: 7,
    endDay: 31,
    customRibbonText: 'Rebajas de Verano — Spanish Summer Clearance & Verified Discounts',
    enabled: true,
  },
  {
    id: 'country-it-saldi-winter',
    name: 'Saldi Invernali (IT)',
    scope: 'country',
    themeId: 'eu_seasonal_sale',
    priority: 80,
    countries: ['IT'],
    matcherType: 'fixed',
    startMonth: 1,
    startDay: 5,
    endMonth: 1,
    endDay: 31,
    customRibbonText: 'Saldi Invernali — Official Italian Winter Sales & Fashion Promo Codes',
    enabled: true,
  },
  {
    id: 'country-it-saldi-summer',
    name: 'Saldi Estivi (IT)',
    scope: 'country',
    themeId: 'eu_seasonal_sale',
    priority: 80,
    countries: ['IT'],
    matcherType: 'fixed',
    startMonth: 7,
    startDay: 5,
    endMonth: 7,
    endDay: 31,
    customRibbonText: 'Saldi Estivi — Italian Summer Clearance & Verified Vouchers',
    enabled: true,
  },
  {
    id: 'country-se-midsommar',
    name: 'Midsommar Summer Sale (SE)',
    scope: 'country',
    themeId: 'eu_seasonal_sale',
    priority: 80,
    countries: ['SE'],
    matcherType: 'fixed',
    startMonth: 6,
    startDay: 19,
    endMonth: 6,
    endDay: 25,
    customRibbonText: 'Sweden Midsommar Summer Sale — Nordic & Global Store Discounts',
    enabled: true,
  },
  {
    id: 'country-in-republic',
    name: 'Republic Day Sale (IN)',
    scope: 'country',
    themeId: 'diwali_sale',
    priority: 80,
    countries: ['IN'],
    matcherType: 'fixed',
    startMonth: 1,
    startDay: 24,
    endMonth: 1,
    endDay: 26,
    customRibbonText: 'India Republic Day Mega Sale — Verified Tech, Fashion & Home Codes',
    enabled: true,
  },
  {
    id: 'country-in-independence',
    name: 'Independence Day Sale (IN)',
    scope: 'country',
    themeId: 'diwali_sale',
    priority: 80,
    countries: ['IN'],
    matcherType: 'fixed',
    startMonth: 8,
    startDay: 13,
    endMonth: 8,
    endDay: 15,
    customRibbonText: 'India Independence Day Freedom Sale — Top Verified Promo Codes',
    enabled: true,
  },
  {
    id: 'country-in-diwali',
    name: 'Diwali / Great Indian Festival (IN)',
    scope: 'country',
    themeId: 'diwali_sale',
    priority: 85,
    countries: ['IN'],
    matcherType: 'fixed',
    startMonth: 10,
    startDay: 18,
    endMonth: 11,
    endDay: 10,
    yearDates: {
      2026: { startMonth: 10, startDay: 25, endMonth: 11, endDay: 10 },
      2027: { startMonth: 10, startDay: 20, endMonth: 11, endDay: 2 },
      2028: { startMonth: 10, startDay: 10, endMonth: 10, endDay: 22 },
    },
    enabled: true,
  },
  {
    id: 'country-br-consumidor',
    name: 'Dia do Consumidor (BR)',
    scope: 'country',
    themeId: 'latam_sale',
    priority: 80,
    countries: ['BR'],
    matcherType: 'fixed',
    startMonth: 3,
    startDay: 14,
    endMonth: 3,
    endDay: 15,
    customRibbonText: 'Dia do Consumidor Brazil — Verified Tech, Home & Fashion Cupons',
    enabled: true,
  },
  {
    id: 'country-mx-hotsale',
    name: 'Hot Sale Mexico (MX)',
    scope: 'country',
    themeId: 'latam_sale',
    priority: 80,
    countries: ['MX'],
    matcherType: 'fixed',
    startMonth: 5,
    startDay: 23,
    endMonth: 5,
    endDay: 31,
    customRibbonText: 'Hot Sale Mexico — Biggest Mid-Year Online Discounts & Promo Codes',
    enabled: true,
  },
  {
    id: 'country-mx-buenfin',
    name: 'El Buen Fin (MX)',
    scope: 'country',
    themeId: 'latam_sale',
    priority: 85,
    countries: ['MX'],
    matcherType: 'fixed',
    startMonth: 11,
    startDay: 15,
    endMonth: 11,
    endDay: 18,
    customRibbonText: 'El Buen Fin Mexico — Nationwide Mega Weekend Discounts & Cupones',
    enabled: true,
  },
  {
    id: 'country-ae-white-friday',
    name: 'White Friday Sale (AE)',
    scope: 'country',
    themeId: 'white_friday',
    priority: 105,
    countries: ['AE'],
    matcherType: 'black_friday',
    windowDaysBefore: 4,
    windowDaysAfter: 4,
    enabled: true,
  },
  {
    id: 'country-ae-national',
    name: 'UAE National Day Sale (AE)',
    scope: 'country',
    themeId: 'white_friday',
    priority: 80,
    countries: ['AE'],
    matcherType: 'fixed',
    startMonth: 12,
    startDay: 1,
    endMonth: 12,
    endDay: 2,
    customRibbonText: 'UAE National Day Sale — Verified Electronics, Luxury & Travel Codes',
    enabled: true,
  },
  {
    id: 'country-ae-dsf',
    name: 'Dubai Shopping Festival (AE)',
    scope: 'country',
    themeId: 'white_friday',
    priority: 80,
    countries: ['AE'],
    matcherType: 'fixed',
    startMonth: 12,
    startDay: 26,
    endMonth: 1,
    endDay: 20,
    customRibbonText: 'Dubai Shopping Festival — Mega Luxury, Tech & Fashion Promo Codes',
    enabled: true,
  },
  {
    id: 'country-vn-reunification',
    name: 'Reunification & Labor Day 30/4 - 1/5 (VN)',
    scope: 'country',
    themeId: 'double_day',
    priority: 80,
    countries: ['VN'],
    matcherType: 'fixed',
    startMonth: 4,
    startDay: 29,
    endMonth: 5,
    endDay: 1,
    customRibbonText: 'Vietnam Holiday Sale 30/4 – 1/5 — Travel, Tech & Shopping Promo Codes',
    enabled: true,
  },
  {
    id: 'country-vn-national',
    name: 'Vietnam National Day 2/9 (VN)',
    scope: 'country',
    themeId: 'double_day',
    priority: 80,
    countries: ['VN'],
    matcherType: 'fixed',
    startMonth: 9,
    startDay: 1,
    endMonth: 9,
    endDay: 2,
    customRibbonText: 'Vietnam National Day 2/9 Sale — Verified Local & Global Brand Deals',
    enabled: true,
  },
  {
    id: 'country-vn-teachers',
    name: "Vietnamese Teachers' Day 20/11 (VN)",
    scope: 'country',
    themeId: 'double_day',
    priority: 80,
    countries: ['VN'],
    matcherType: 'fixed',
    startMonth: 11,
    startDay: 19,
    endMonth: 11,
    endDay: 20,
    customRibbonText: "Teachers' Day 20/11 Sale — Gift Sets, Courses & Tech Promo Codes",
    enabled: true,
  },
  {
    id: 'country-sg-gss',
    name: 'Great Singapore Sale (SG)',
    scope: 'country',
    themeId: 'double_day',
    priority: 80,
    countries: ['SG'],
    matcherType: 'fixed',
    startMonth: 6,
    startDay: 15,
    endMonth: 7,
    endDay: 9,
    customRibbonText: 'Great Singapore Sale — Verified Fashion, Beauty & Tech Promo Codes',
    enabled: true,
  },
  {
    id: 'country-jp-silver-week',
    name: 'Silver Week Sale (JP)',
    scope: 'country',
    themeId: 'golden_week',
    priority: 80,
    countries: ['JP'],
    matcherType: 'fixed',
    startMonth: 9,
    startDay: 19,
    endMonth: 9,
    endDay: 23,
    customRibbonText: 'Japan Silver Week Sale — Verified Autumn Travel & Lifestyle Deals',
    enabled: true,
  },
  {
    id: 'country-kr-pepero',
    name: 'Pepero Day & 11.11 (KR)',
    scope: 'country',
    themeId: 'double_day',
    priority: 80,
    countries: ['KR'],
    matcherType: 'fixed',
    startMonth: 11,
    startDay: 11,
    endMonth: 11,
    endDay: 11,
    customRibbonText: 'Pepero Day & 11.11 Korea Sale — Sweet Gifts & Flash Promo Codes',
    enabled: true,
  },
  {
    id: 'country-nz-eofy',
    name: 'NZ End of Financial Year (NZ)',
    scope: 'country',
    themeId: 'eofy_sale',
    priority: 80,
    countries: ['NZ'],
    matcherType: 'fixed',
    startMonth: 3,
    startDay: 24,
    endMonth: 3,
    endDay: 31,
    customRibbonText: 'NZ End of Financial Year Sale — Software, Office & Tech Discounts',
    enabled: true,
  },
  {
    id: 'country-nz-anzac',
    name: 'ANZAC Day Long Weekend (NZ, AU)',
    scope: 'country',
    themeId: 'eofy_sale',
    priority: 80,
    countries: ['NZ', 'AU'],
    matcherType: 'fixed',
    startMonth: 4,
    startDay: 25,
    endMonth: 4,
    endDay: 25,
    customRibbonText: 'ANZAC Day Weekend Offers — Verified Store Codes in AU & NZ',
    enabled: true,
  },
  {
    id: 'country-nl-sinterklaas',
    name: 'Sinterklaas Gift Sale (NL)',
    scope: 'country',
    themeId: 'eu_seasonal_sale',
    priority: 85,
    countries: ['NL'],
    matcherType: 'fixed',
    startMonth: 12,
    startDay: 1,
    endMonth: 12,
    endDay: 5,
    customRibbonText: 'Sinterklaas Gift Deals (NL) — Toys, Electronics & Dutch Store Vouchers',
    enabled: true,
  },
  {
    id: 'country-es-reyes',
    name: "Día de los Reyes / Three Kings' Sale (ES)",
    scope: 'country',
    themeId: 'eu_seasonal_sale',
    priority: 85,
    countries: ['ES'],
    matcherType: 'fixed',
    startMonth: 1,
    startDay: 3,
    endMonth: 1,
    endDay: 6,
    customRibbonText: 'Día de los Reyes Deals (Spain) — Gift & Tech Promo Codes',
    enabled: true,
  },
  {
    id: 'country-it-repubblica',
    name: 'Festa della Repubblica Sale (IT)',
    scope: 'country',
    themeId: 'eu_seasonal_sale',
    priority: 80,
    countries: ['IT'],
    matcherType: 'fixed',
    startMonth: 6,
    startDay: 1,
    endMonth: 6,
    endDay: 2,
    customRibbonText: 'Festa della Repubblica Deals (Italy) — Fashion, Travel & Home Codes',
    enabled: true,
  },
  {
    id: 'country-se-julrea',
    name: 'Mellandagsrea / Post-Christmas Sale (SE)',
    scope: 'country',
    themeId: 'boxing_day',
    priority: 85,
    countries: ['SE'],
    matcherType: 'fixed',
    startMonth: 12,
    startDay: 26,
    endMonth: 12,
    endDay: 31,
    customRibbonText: 'Mellandagsrea Sweden — Huge Post-Christmas Clearance & Tech Codes',
    enabled: true,
  },
  {
    id: 'country-in-holi',
    name: 'Holi Color & Spring Sale (IN)',
    scope: 'country',
    themeId: 'diwali_sale',
    priority: 80,
    countries: ['IN'],
    matcherType: 'fixed',
    startMonth: 3,
    startDay: 1,
    endMonth: 3,
    endDay: 24,
    yearDates: {
      2026: { startMonth: 3, startDay: 1, endMonth: 3, endDay: 5 },
      2027: { startMonth: 3, startDay: 19, endMonth: 3, endDay: 23 },
      2028: { startMonth: 3, startDay: 8, endMonth: 3, endDay: 12 },
    },
    customRibbonText: 'Holi Festival Sale (India) — Fashion, Beauty & Electronics Deals',
    enabled: true,
  },
  {
    id: 'country-br-namorados',
    name: 'Dia dos Namorados (BR)',
    scope: 'country',
    themeId: 'valentine',
    priority: 85,
    countries: ['BR'],
    matcherType: 'fixed',
    startMonth: 6,
    startDay: 8,
    endMonth: 6,
    endDay: 12,
    customRibbonText: "Dia dos Namorados Brazil — Valentine's Gift & Fashion Cupons",
    enabled: true,
  },
  {
    id: 'country-mx-muertos',
    name: 'Día de Muertos & Pre-Buen Fin (MX)',
    scope: 'country',
    themeId: 'halloween',
    priority: 80,
    countries: ['MX'],
    matcherType: 'fixed',
    startMonth: 11,
    startDay: 1,
    endMonth: 11,
    endDay: 2,
    customRibbonText: 'Día de Muertos Offers (Mexico) — Verified Store Deals & Cupones',
    enabled: true,
  },
  {
    id: 'six-easter',
    name: 'Easter Sale',
    scope: 'six_markets',
    themeId: 'easter',
    priority: 50,
    countries: ['US', 'GB', 'CA', 'FR', 'DE', 'AU', 'GLOBAL'],
    matcherType: 'easter',
    windowDaysBefore: 3,
    windowDaysAfter: 1,
    enabled: true,
  },
  {
    id: 'six-prime-day-summer',
    name: 'Amazon Prime Day (Summer)',
    scope: 'six_markets',
    themeId: 'prime_day',
    priority: 50,
    countries: ['US', 'GB', 'CA', 'FR', 'DE', 'AU', 'GLOBAL'],
    matcherType: 'fixed',
    startMonth: 7,
    startDay: 10,
    endMonth: 7,
    endDay: 17,
    enabled: true,
  },
  {
    id: 'six-prime-day-oct',
    name: 'Prime Big Deal Days (Oct)',
    scope: 'six_markets',
    themeId: 'prime_day',
    priority: 50,
    countries: ['US', 'GB', 'CA', 'FR', 'DE', 'AU', 'GLOBAL'],
    matcherType: 'fixed',
    startMonth: 10,
    startDay: 8,
    endMonth: 10,
    endDay: 12,
    enabled: true,
  },
  {
    id: 'six-halloween',
    name: 'Halloween Spooky Savings',
    scope: 'six_markets',
    themeId: 'halloween',
    priority: 50,
    countries: ['US', 'GB', 'CA', 'FR', 'DE', 'AU', 'GLOBAL'],
    matcherType: 'fixed',
    startMonth: 10,
    startDay: 20,
    endMonth: 10,
    endDay: 31,
    enabled: true,
  },
  {
    id: 'world-singles-day',
    name: "11.11 Singles' Day",
    scope: 'world',
    themeId: 'singles_day',
    priority: 50,
    countries: ['GB', 'FR', 'DE', 'AU', 'GLOBAL'],
    excludeCountries: ['US', 'CA'],
    matcherType: 'fixed',
    startMonth: 11,
    startDay: 10,
    endMonth: 11,
    endDay: 11,
    enabled: true,
  },
];

export type CountryOverrideMap = Record<string, 'auto' | HolidayThemeId>;

export interface LocalDateParts {
  year: number;
  month: number;
  day: number;
}

export function getCountryTimezone(countryCode: MarketCode): string {
  const found = ALL_MARKETS.find((m) => m.code === countryCode);
  return found?.timezone || 'UTC';
}

export function detectCountryFromBrowserTimezone(): MarketCode {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (tz.startsWith('America/Toronto') || tz.startsWith('America/Vancouver') || tz.startsWith('America/Edmonton') || tz.startsWith('America/Winnipeg') || tz.startsWith('America/Halifax')) {
      return 'CA';
    }
    if (tz.startsWith('America/')) return 'US';
    if (tz === 'Europe/London') return 'GB';
    if (tz === 'Europe/Paris') return 'FR';
    if (tz === 'Europe/Berlin') return 'DE';
    if (tz.startsWith('Australia/')) return 'AU';
  } catch {
    // Ignore Intl errors in constrained environments
  }
  return 'GLOBAL';
}

export function getLocalDateParts(now: Date, timeZone: string): LocalDateParts {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(now);
    const year = Number(parts.find((p) => p.type === 'year')?.value || now.getFullYear());
    const month = Number(parts.find((p) => p.type === 'month')?.value || now.getMonth() + 1);
    const day = Number(parts.find((p) => p.type === 'day')?.value || now.getDate());
    return { year, month, day };
  } catch {
    return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
  }
}

function toUtcDayNumber(year: number, month: number, day: number): number {
  return Math.floor(Date.UTC(year, month - 1, day) / 86400000);
}

function getEasterDate(year: number): LocalDateParts {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return { year, month, day };
}

function getNthWeekdayDay(year: number, month: number, weekday: number, nth: number): number {
  if (nth > 0) {
    const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
    const offset = (weekday - firstWeekday + 7) % 7;
    return 1 + offset + (nth - 1) * 7;
  }
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const lastWeekday = new Date(Date.UTC(year, month - 1, daysInMonth)).getUTCDay();
  const offset = (lastWeekday - weekday + 7) % 7;
  return daysInMonth - offset;
}

export function doesRuleMatchDate(rule: HolidayRule, local: LocalDateParts): boolean {
  if (!rule.enabled) return false;
  const currentDayNum = toUtcDayNumber(local.year, local.month, local.day);

  if (rule.matcherType === 'fixed') {
    const yearOverride = rule.yearDates?.[local.year];
    const sm = yearOverride?.startMonth || rule.startMonth || 1;
    const sd = yearOverride?.startDay || rule.startDay || 1;
    const em = yearOverride?.endMonth || rule.endMonth || sm;
    const ed = yearOverride?.endDay || rule.endDay || sd;
    if (sm < em || (sm === em && sd <= ed)) {
      const startNum = toUtcDayNumber(local.year, sm, sd);
      const endNum = toUtcDayNumber(local.year, em, ed);
      return currentDayNum >= startNum && currentDayNum <= endNum;
    }
    // Wraps across year boundary (e.g. Dec 26 - Jan 5)
    const afterStartThisYear = currentDayNum >= toUtcDayNumber(local.year, sm, sd);
    const beforeEndThisYear = currentDayNum <= toUtcDayNumber(local.year, em, ed);
    return afterStartThisYear || beforeEndThisYear;
  }

  let anchorDayNum: number | null = null;
  if (rule.matcherType === 'easter') {
    const easter = getEasterDate(local.year);
    anchorDayNum = toUtcDayNumber(easter.year, easter.month, easter.day);
  } else if (rule.matcherType === 'black_friday') {
    const thanksgivingDay = getNthWeekdayDay(local.year, 11, 4, 4); // 4th Thursday of Nov
    anchorDayNum = toUtcDayNumber(local.year, 11, thanksgivingDay + 1);
  } else if (rule.matcherType === 'nth_weekday') {
    const m = rule.month || 1;
    const wd = rule.weekday ?? 1;
    const n = rule.nth ?? 1;
    const day = getNthWeekdayDay(local.year, m, wd, n);
    anchorDayNum = toUtcDayNumber(local.year, m, day);
  }

  if (anchorDayNum === null) return false;
  const before = rule.windowDaysBefore ?? 0;
  const after = rule.windowDaysAfter ?? 0;
  return currentDayNum >= anchorDayNum - before && currentDayNum <= anchorDayNum + after;
}

export function parseHolidayRules(customRulesJson?: string): HolidayRule[] {
  if (!customRulesJson || customRulesJson.trim() === '' || customRulesJson.trim() === '[]') {
    return DEFAULT_HOLIDAY_RULES;
  }
  try {
    const parsed = JSON.parse(customRulesJson);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed as HolidayRule[];
    }
  } catch {
    // Fallback to built-in rules if JSON is malformed
  }
  return DEFAULT_HOLIDAY_RULES;
}

export function parseCountryOverrides(overridesJson?: string): CountryOverrideMap {
  if (!overridesJson || overridesJson.trim() === '' || overridesJson.trim() === '{}') {
    return {};
  }
  try {
    const parsed = JSON.parse(overridesJson);
    if (parsed && typeof parsed === 'object') {
      return parsed as CountryOverrideMap;
    }
  } catch {
    // Ignore malformed JSON
  }
  return {};
}

function getScopeSpecificity(scope: HolidayRuleScope): number {
  if (scope === 'country') return 3;
  if (scope === 'six_markets') return 2;
  return 1;
}

export interface HolidayResolutionResult {
  theme: HolidayThemeConfig;
  winningRule: HolidayRule | null;
  matchingRules: HolidayRule[];
  countryCode: MarketCode;
  localDateLabel: string;
  overrideApplied: boolean;
}

function adaptThemeForCountry(theme: HolidayThemeConfig, countryCode: MarketCode, rule?: HolidayRule | null): HolidayThemeConfig {
  let adapted = theme;
  // In Australia, December is summer: swap falling snow for summer confetti
  if (countryCode === 'AU' && theme.id === 'christmas') {
    adapted = {
      ...adapted,
      effectType: 'confetti',
      brandEmoji: '☀️',
      ribbonText: 'Summer Christmas Deals Australia — Hand-Tested Gift Codes & Festive Offers',
    };
  }
  if (rule?.customRibbonText) {
    adapted = { ...adapted, ribbonText: rule.customRibbonText };
  }
  return adapted;
}

export function resolveHolidayForCountry(params: {
  mode?: string;
  manualTheme?: string;
  countryOverridesJson?: string;
  customRulesJson?: string;
  countryCode?: MarketCode;
  now?: Date;
}): HolidayResolutionResult {
  const countryCode: MarketCode = params.countryCode || 'GLOBAL';
  const now = params.now || new Date();
  const tz = getCountryTimezone(countryCode);
  const local = getLocalDateParts(now, tz);
  const localDateLabel = `${local.year}-${String(local.month).padStart(2, '0')}-${String(local.day).padStart(2, '0')} (${tz})`;

  const normalizedMode = (params.mode || 'off').toLowerCase() as HolidayThemeMode;
  if (normalizedMode === 'off') {
    return { theme: HOLIDAY_THEMES.none, winningRule: null, matchingRules: [], countryCode, localDateLabel, overrideApplied: false };
  }

  if (normalizedMode === 'manual') {
    const key = (params.manualTheme || 'none') as HolidayThemeId;
    const base = HOLIDAY_THEMES[key] || HOLIDAY_THEMES.none;
    return {
      theme: adaptThemeForCountry(base, countryCode),
      winningRule: null,
      matchingRules: [],
      countryCode,
      localDateLabel,
      overrideApplied: true,
    };
  }

  // Check per-country override in Auto mode
  const overrides = parseCountryOverrides(params.countryOverridesJson);
  if (countryCode !== 'GLOBAL') {
    const countryOverride = overrides[countryCode];
    if (countryOverride && countryOverride !== 'auto') {
      const base = HOLIDAY_THEMES[countryOverride] || HOLIDAY_THEMES.none;
      return {
        theme: adaptThemeForCountry(base, countryCode),
        winningRule: null,
        matchingRules: [],
        countryCode,
        localDateLabel,
        overrideApplied: true,
      };
    }
  }

  const rules = parseHolidayRules(params.customRulesJson);
  const matchingRules = rules
    .filter((rule) => {
      if (!rule.enabled) return false;
      if (rule.excludeCountries?.includes(countryCode)) return false;
      if (!rule.countries.includes(countryCode) && !(rule.countries.includes('GLOBAL') && rule.scope === 'world')) {
        return false;
      }
      return doesRuleMatchDate(rule, local);
    })
    .sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      return getScopeSpecificity(b.scope) - getScopeSpecificity(a.scope);
    });

  const winningRule = matchingRules[0] || null;
  if (!winningRule) {
    return { theme: HOLIDAY_THEMES.none, winningRule: null, matchingRules: [], countryCode, localDateLabel, overrideApplied: false };
  }

  const baseTheme = HOLIDAY_THEMES[winningRule.themeId] || HOLIDAY_THEMES.none;
  return {
    theme: adaptThemeForCountry(baseTheme, countryCode, winningRule),
    winningRule,
    matchingRules,
    countryCode,
    localDateLabel,
    overrideApplied: false,
  };
}

/** Backwards-compatible wrapper for components passing simple arguments */
export function detectAutoHolidayTheme(now: Date = new Date()): HolidayThemeId {
  return resolveHolidayForCountry({ mode: 'auto', countryCode: 'GLOBAL', now }).theme.id;
}

export function resolveActiveHolidayTheme(
  mode?: string,
  manualTheme?: string,
  now: Date = new Date(),
  countryCode: MarketCode = 'GLOBAL',
  countryOverridesJson?: string,
  customRulesJson?: string
): HolidayThemeConfig {
  return resolveHolidayForCountry({
    mode,
    manualTheme,
    countryOverridesJson,
    customRulesJson,
    countryCode,
    now,
  }).theme;
}
