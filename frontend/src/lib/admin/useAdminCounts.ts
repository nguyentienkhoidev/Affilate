'use client';

import { useState, useEffect } from 'react';
import { dashboardService } from '@/services/dashboardService';

export interface AdminCounts {
  storesCount: number;
  offersCount: number;
  postsCount: number;
  categoriesCount: number;
  menusCount: number;
  pagesCount: number;
  feedbackCount: number;
  unreadFeedbackCount: number;
  subscribersCount: number;
  usersCount: number;
  rolesCount: number;
  mediaCount: number;
  tracingCount: number;
}

const DEFAULT_COUNTS: AdminCounts = {
  storesCount: 0,
  offersCount: 0,
  postsCount: 0,
  categoriesCount: 0,
  menusCount: 0,
  pagesCount: 0,
  feedbackCount: 0,
  unreadFeedbackCount: 0,
  subscribersCount: 0,
  usersCount: 0,
  rolesCount: 0,
  mediaCount: 0,
  tracingCount: 0,
};

export function useAdminCounts(): AdminCounts {
  const [counts, setCounts] = useState<AdminCounts>(() => {
    const cached = dashboardService.getCachedStats();
    if (!cached) return DEFAULT_COUNTS;
    return {
      storesCount: cached.activeStoresCount || 0,
      offersCount: cached.activeOffersCount || 0,
      postsCount: cached.postsCount || 0,
      categoriesCount: cached.categoriesCount || 0,
      menusCount: cached.menusCount || 0,
      pagesCount: cached.pagesCount || 0,
      feedbackCount: cached.unreadFeedbackCount || 0,
      unreadFeedbackCount: cached.unreadFeedbackCount || 0,
      subscribersCount: cached.subscribersCount || 0,
      usersCount: cached.usersCount || 0,
      rolesCount: cached.rolesCount || 0,
      tracingCount: cached.auditLogsCount || 0,
      mediaCount: cached.mediaCount || 0,
    };
  });

  useEffect(() => {
    const unsubscribe = dashboardService.subscribe((data) => {
      setCounts({
        storesCount: data.activeStoresCount || 0,
        offersCount: data.activeOffersCount || 0,
        postsCount: data.postsCount || 0,
        categoriesCount: data.categoriesCount || 0,
        menusCount: data.menusCount || 0,
        pagesCount: data.pagesCount || 0,
        feedbackCount: data.unreadFeedbackCount || 0,
        unreadFeedbackCount: data.unreadFeedbackCount || 0,
        subscribersCount: data.subscribersCount || 0,
        usersCount: data.usersCount || 0,
        rolesCount: data.rolesCount || 0,
        tracingCount: data.auditLogsCount || 0,
        mediaCount: data.mediaCount || 0,
      });
    });

    dashboardService.getStats(true).then((data) => {
      if (data) {
        setCounts({
          storesCount: data.activeStoresCount || 0,
          offersCount: data.activeOffersCount || 0,
          postsCount: data.postsCount || 0,
          categoriesCount: data.categoriesCount || 0,
          menusCount: data.menusCount || 0,
          pagesCount: data.pagesCount || 0,
          feedbackCount: data.unreadFeedbackCount || 0,
          unreadFeedbackCount: data.unreadFeedbackCount || 0,
          subscribersCount: data.subscribersCount || 0,
          usersCount: data.usersCount || 0,
          rolesCount: data.rolesCount || 0,
          tracingCount: data.auditLogsCount || 0,
          mediaCount: data.mediaCount || 0,
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return counts;
}
