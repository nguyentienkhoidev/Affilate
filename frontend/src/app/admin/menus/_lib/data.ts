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

export const DEFAULT_MENUS: MenuItem[] = [];
