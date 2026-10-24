'use client';

import { useAdminCollection } from './useAdminCollection';
import { STORES_STORE_KEY, DEFAULT_STORES, type AdminStore } from '@/app/admin/stores/_lib/data';
import { OFFERS_STORE_KEY, DEFAULT_OFFERS, type OfferItem } from '@/app/admin/offers/_lib/data';
import { POSTS_STORE_KEY, DEFAULT_ARTICLES, type AdminArticle } from '@/app/admin/posts/_lib/data';
import { CATEGORIES_STORE_KEY, DEFAULT_CATEGORIES, type CategoryData } from '@/app/admin/categories/_lib/data';
import { MENUS_STORE_KEY, DEFAULT_MENUS, type MenuItem } from '@/app/admin/menus/_lib/data';
import { PAGES_STORE_KEY, DEFAULT_PAGES, type StaticPageData } from '@/app/admin/pages/_lib/data';
import { USERS_STORE_KEY, DEFAULT_USERS, type UserData } from '@/app/admin/users/_lib/data';
import { ROLES_STORE_KEY, DEFAULT_ROLES, type RoleItem } from '@/app/admin/roles/_lib/data';
import { FEEDBACK_STORE_KEY, DEFAULT_FEEDBACKS, type FeedbackItem } from '@/app/admin/feedback/_lib/data';
import { MEDIA_STORE_KEY, DEFAULT_MEDIA, type MediaItem } from '@/app/admin/media/_lib/data';
import { AUDIT_STORE_KEY, DEFAULT_AUDIT_LOGS, type AuditLogItem } from '@/app/admin/tracing/_lib/data';

export interface AdminCounts {
  storesCount: number;
  offersCount: number;
  postsCount: number;
  categoriesCount: number;
  menusCount: number;
  pagesCount: number;
  feedbackCount: number;
  unreadFeedbackCount: number;
  usersCount: number;
  rolesCount: number;
  mediaCount: number;
  tracingCount: number;
}

export function useAdminCounts(): AdminCounts {
  const { items: stores } = useAdminCollection<AdminStore>(STORES_STORE_KEY, DEFAULT_STORES);
  const { items: offers } = useAdminCollection<OfferItem>(OFFERS_STORE_KEY, DEFAULT_OFFERS);
  const { items: posts } = useAdminCollection<AdminArticle>(POSTS_STORE_KEY, DEFAULT_ARTICLES);
  const { items: categories } = useAdminCollection<CategoryData>(CATEGORIES_STORE_KEY, DEFAULT_CATEGORIES);
  const { items: menus } = useAdminCollection<MenuItem>(MENUS_STORE_KEY, DEFAULT_MENUS);
  const { items: pages } = useAdminCollection<StaticPageData>(PAGES_STORE_KEY, DEFAULT_PAGES);
  const { items: users } = useAdminCollection<UserData>(USERS_STORE_KEY, DEFAULT_USERS);
  const { items: roles } = useAdminCollection<RoleItem>(ROLES_STORE_KEY, DEFAULT_ROLES);
  const { items: feedbacks } = useAdminCollection<FeedbackItem>(FEEDBACK_STORE_KEY, DEFAULT_FEEDBACKS);
  const { items: media } = useAdminCollection<MediaItem>(MEDIA_STORE_KEY, DEFAULT_MEDIA);
  const { items: auditLogs } = useAdminCollection<AuditLogItem>(AUDIT_STORE_KEY, DEFAULT_AUDIT_LOGS);

  const unreadFeedbackCount = feedbacks.filter((f) => !f.isRead).length;

  return {
    storesCount: stores.length,
    offersCount: offers.length,
    postsCount: posts.length,
    categoriesCount: categories.length,
    menusCount: menus.length,
    pagesCount: pages.length,
    feedbackCount: feedbacks.length,
    unreadFeedbackCount,
    usersCount: users.length,
    rolesCount: roles.length,
    mediaCount: media.length,
    tracingCount: auditLogs.length,
  };
}
