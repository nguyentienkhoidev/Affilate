'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { apiClient } from '@/lib/api/axios-client';

export interface UseServerPaginationOptions<T> {
  endpoint: string;
  defaultPageSize?: number;
  initialParams?: Record<string, any>;
  search?: string;
  filters?: Record<string, any>;
  mapItem?: (raw: any) => T;
  transformItem?: (raw: any) => T;
  fallbackItems?: T[];
  filterFallback?: (item: T, params: Record<string, any>) => boolean;
  debounceMs?: number;
}

export interface UseServerPaginationReturn<T> {
  items: T[];
  loading: boolean;
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalElements: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  params: Record<string, any>;
  setParam: (key: string, value: any) => void;
  setParams: (updater: (prev: Record<string, any>) => Record<string, any>) => void;
  refresh: () => Promise<void>;
  setItems: React.Dispatch<React.SetStateAction<T[]>>;
}

export function useServerPagination<T>({
  endpoint,
  defaultPageSize = 10,
  initialParams = {},
  search,
  filters,
  mapItem,
  transformItem,
  fallbackItems = [],
  filterFallback,
  debounceMs = 300,
}: UseServerPaginationOptions<T>): UseServerPaginationReturn<T> {
  const mapper = transformItem || mapItem || ((raw: any) => raw as T);
  const mapperRef = useRef(mapper);
  mapperRef.current = mapper;

  const fallbackItemsRef = useRef(fallbackItems);
  fallbackItemsRef.current = fallbackItems;

  const filterFallbackRef = useRef(filterFallback);
  filterFallbackRef.current = filterFallback;

  // Combine initial params, search, and filters
  const mergedInitialParams = useMemo(() => {
    const combined: Record<string, any> = { ...initialParams };
    if (filters) {
      Object.assign(combined, filters);
    }
    if (search !== undefined && search.trim() !== '') {
      combined.search = search.trim();
    }
    return combined;
  }, []);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(defaultPageSize);
  const [params, setParamsState] = useState<Record<string, any>>(mergedInitialParams);
  const [items, setItems] = useState<T[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const isFirstRender = useRef(true);

  // Synchronize when search or filters props change, skipping first mount
  const filtersJson = JSON.stringify(filters);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setParamsState((prev) => {
      const next: Record<string, any> = { ...prev };
      if (filters) {
        Object.assign(next, filters);
      }
      if (search !== undefined) {
        if (search.trim()) {
          next.search = search.trim();
        } else {
          delete next.search;
        }
      }

      // Prevent redundant state mutation if values are identical
      const prevKeys = Object.keys(prev);
      const nextKeys = Object.keys(next);
      if (prevKeys.length === nextKeys.length && prevKeys.every((k) => prev[k] === next[k])) {
        return prev;
      }
      return next;
    });
    setCurrentPage(1);
  }, [search, filtersJson]);

  // Debounce and cancellation refs
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const activeParamsRef = useRef(params);
  activeParamsRef.current = params;
  const inFlightControllerRef = useRef<AbortController | null>(null);
  const lastFetchedKeyRef = useRef<string>('');

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setCurrentPage(1);
  }, []);

  const setParam = useCallback((key: string, value: any) => {
    setParamsState((prev) => {
      if (prev[key] === value) return prev;
      return { ...prev, [key]: value };
    });
    setCurrentPage(1);
  }, []);

  const setParams = useCallback((updater: (prev: Record<string, any>) => Record<string, any>) => {
    setParamsState((prev) => {
      const next = updater(prev);
      const prevKeys = Object.keys(prev);
      const nextKeys = Object.keys(next);
      if (prevKeys.length === nextKeys.length && prevKeys.every((k) => prev[k] === next[k])) {
        return prev;
      }
      return next;
    });
    setCurrentPage(1);
  }, []);

  const fetchData = useCallback(async () => {
    if (inFlightControllerRef.current) {
      inFlightControllerRef.current.abort();
    }
    const controller = new AbortController();
    inFlightControllerRef.current = controller;

    // Clean undefined or empty string values
    const cleanParams: Record<string, any> = {
      page: currentPage - 1, // Spring Boot is 0-indexed
      size: pageSize,
    };

    Object.entries(activeParamsRef.current).forEach(([k, v]) => {
      if (
        v !== undefined &&
        v !== null &&
        v !== '' &&
        v !== 'ALL' &&
        v !== 'all' &&
        !Number.isNaN(v)
      ) {
        cleanParams[k] = v;
      }
    });

    const requestKey = `${endpoint}?${new URLSearchParams(cleanParams).toString()}`;
    if (lastFetchedKeyRef.current === requestKey) {
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.get(endpoint, {
        params: cleanParams,
        signal: controller.signal,
      });

      lastFetchedKeyRef.current = requestKey;
      const pageData = res.data?.data;
      const list = pageData?.content || pageData?.items || (Array.isArray(pageData) ? pageData : []);

      if (Array.isArray(list)) {
        const mapped = list.map(mapperRef.current);
        setItems(mapped);
        const total = pageData?.totalElements ?? mapped.length;
        setTotalItems(total);
        setTotalPages(pageData?.totalPages ?? Math.max(1, Math.ceil(total / pageSize)));
      }
    } catch (err: any) {
      if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') {
        return; // Aborted in favor of newer request
      }
      console.warn(`[useServerPagination] Failed to fetch ${endpoint}:`, err);
      const fallback = fallbackItemsRef.current;
      let filtered = fallback;
      if (filterFallbackRef.current) {
        filtered = filtered.filter((item) => filterFallbackRef.current!(item, activeParamsRef.current));
      }
      const total = filtered.length;
      const start = (currentPage - 1) * pageSize;
      const paged = filtered.slice(start, start + pageSize);

      setItems(paged);
      setTotalItems(total);
      setTotalPages(Math.max(1, Math.ceil(total / pageSize)));
    } finally {
      setLoading(false);
    }
  }, [endpoint, currentPage, pageSize]);

  // Handle live fetching with search debouncing
  const paramsKey = JSON.stringify(params);

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchData();
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [fetchData, debounceMs, paramsKey]);

  const refresh = useCallback(async () => {
    lastFetchedKeyRef.current = '';
    return fetchData();
  }, [fetchData]);

  return {
    items,
    loading,
    currentPage,
    pageSize,
    totalItems,
    totalElements: totalItems,
    totalPages,
    setCurrentPage,
    setPageSize,
    params,
    setParam,
    setParams,
    refresh,
    setItems,
  };
}
