export interface StaticPageData {
  id: number;
  title: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  updatedAt: string;
  content?: string;
  metaTitle?: string;
  metaDescription?: string;
}

export const PAGES_STORE_KEY = 'static-pages';

export const DEFAULT_PAGES: StaticPageData[] = [
  { id: 1, title: 'About Us', slug: 'about-us', sortOrder: 1, isActive: true, updatedAt: 'Oct 18, 2026', content: '<h2>About Bargorya</h2><p>Bargorya is your premier curated deal finder...</p>' },
  { id: 2, title: 'Affiliate Disclosure', slug: 'affiliate-disclosure', sortOrder: 2, isActive: true, updatedAt: 'Oct 18, 2026', content: '<h2>Affiliate Disclosure</h2><p>We may earn a commission when you purchase through our links...</p>' },
  { id: 3, title: 'Privacy Policy', slug: 'privacy-policy', sortOrder: 3, isActive: true, updatedAt: 'Oct 15, 2026', content: '<h2>Privacy Policy</h2><p>Your privacy is important to us...</p>' },
  { id: 4, title: 'Terms of Service', slug: 'terms', sortOrder: 4, isActive: true, updatedAt: 'Oct 15, 2026', content: '<h2>Terms of Service</h2><p>Please read these terms carefully...</p>' },
  { id: 5, title: 'Editorial Guidelines', slug: 'editorial-guidelines', sortOrder: 5, isActive: true, updatedAt: 'Oct 12, 2026', content: '<h2>Editorial Guidelines</h2><p>Our review methodology is independent...</p>' },
];
