import { apiClient } from '@/lib/api/axios-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import { MenuItem } from '@/app/admin/menus/_lib/data';
import { ROUTES } from '@/constants/routes';
import { resolvePublicPageHref } from '@/services/pageService';

export function resolveMenuHref(item: Pick<MenuItem, 'targetType' | 'targetValue'>): string {
  const raw = (item.targetValue || '').trim();
  if (!raw) return ROUTES.PUBLIC.HOME;

  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    return raw;
  }

  const type = (item.targetType || 'url').toLowerCase();
  const cleanSlug = raw.replace(/^\/+/, '');

  if (type === 'category') {
    if (raw.startsWith('/category/')) return raw;
    return ROUTES.PUBLIC.CATEGORY_DETAIL(cleanSlug);
  }

  if (type === 'store') {
    if (raw.startsWith('/store/')) return raw;
    return ROUTES.PUBLIC.STORE_DETAIL(cleanSlug);
  }

  if (type === 'page') {
    return resolvePublicPageHref(cleanSlug);
  }

  return raw.startsWith('/') ? raw : `/${raw}`;
}

class MenuService {
  private cache: Partial<Record<'main' | 'footer', MenuItem[]>> = {};

  async getPublicMenus(position: 'main' | 'footer' = 'main'): Promise<MenuItem[]> {
    if (this.cache[position]) {
      return this.cache[position]!;
    }

    try {
      const res = await apiClient.get(API_ENDPOINTS.PUBLIC.MENUS, {
        params: { position },
        timeout: 6000,
      });

      const list = res.data?.data;
      if (Array.isArray(list)) {
        const mapped: MenuItem[] = list.map((m: any) => ({
          id: Number(m.id),
          title: String(m.title || ''),
          position: (m.position || position) as any,
          targetType: (m.targetType || 'url') as any,
          targetValue: String(m.targetValue || ''),
          imageIcon: m.imageIcon ? String(m.imageIcon) : undefined,
          sortOrder: Number(m.sortOrder ?? 9999),
          isActive: Boolean(m.isActive),
        }));
        this.cache[position] = mapped;
        return mapped;
      }
    } catch (err) {
      console.warn(`Failed to fetch '${position}' menus from backend:`, err);
    }

    return [];
  }
}

export const menuService = new MenuService();
export default menuService;
