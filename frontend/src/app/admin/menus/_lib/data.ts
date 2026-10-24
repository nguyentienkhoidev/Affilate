export interface MenuItem {
  id: number;
  position: 'main' | 'footer';
  title: string;
  targetType: 'page' | 'category' | 'url';
  targetValue: string;
  sortOrder: number;
  isActive: boolean;
}

export const MENUS_STORE_KEY = 'menus';

export const DEFAULT_MENUS: MenuItem[] = [
  { id: 1, position: 'main', title: 'Stores', targetType: 'url', targetValue: '/stores', sortOrder: 1, isActive: true },
  { id: 2, position: 'main', title: 'Categories', targetType: 'url', targetValue: '/categories', sortOrder: 2, isActive: true },
  { id: 3, position: 'main', title: 'Editor Picks', targetType: 'url', targetValue: '/posts', sortOrder: 3, isActive: true },
  { id: 4, position: 'main', title: 'About Us', targetType: 'page', targetValue: '/about-us', sortOrder: 4, isActive: true },
  { id: 5, position: 'main', title: 'Contact', targetType: 'url', targetValue: '/contact-us', sortOrder: 5, isActive: true },

  { id: 6, position: 'footer', title: 'All Stores', targetType: 'url', targetValue: '/stores', sortOrder: 1, isActive: true },
  { id: 7, position: 'footer', title: 'Categories', targetType: 'url', targetValue: '/categories', sortOrder: 2, isActive: true },
  { id: 8, position: 'footer', title: 'About Us', targetType: 'page', targetValue: '/about-us', sortOrder: 3, isActive: true },
  { id: 9, position: 'footer', title: 'Affiliate Disclosure', targetType: 'page', targetValue: '/affiliate-disclosure', sortOrder: 4, isActive: true },
  { id: 10, position: 'footer', title: 'Privacy Policy', targetType: 'page', targetValue: '/privacy-policy', sortOrder: 5, isActive: true },
  { id: 11, position: 'footer', title: 'Terms of Service', targetType: 'page', targetValue: '/terms', sortOrder: 6, isActive: true },
];
