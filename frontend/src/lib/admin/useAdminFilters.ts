'use client';

import { useState, useCallback } from 'react';

interface UseAdminFiltersOptions<T> {
  /** All items before filtering */
  items: T[];
  /** Filter function — returns true to include the item */
  filterFn: (item: T) => boolean;
  /** Sort function */
  sortFn?: (a: T, b: T) => number;
  /** Default page size */
  defaultPageSize?: number;
}

interface UseAdminFiltersReturn<T> {
  /** Filtered + sorted + paginated items for the current page */
  pagedItems: T[];
  /** Filtered + sorted items (all pages) */
  filtered: T[];
  /** Total filtered item count */
  totalItems: number;
  /** Current page number */
  currentPage: number;
  /** Number of items per page */
  pageSize: number;
  /** Total page count */
  totalPages: number;
  /** Change page (does NOT reset to 1) */
  setCurrentPage: (page: number) => void;
  /** Change page size and reset to page 1 */
  setPageSize: (size: number) => void;
  /**
   * Wraps a state setter so it always resets currentPage to 1.
   * Usage: `const setSearch = wrapSetter(setSearchRaw)`
   */
  wrapSetter: <V>(setter: (v: V) => void) => (v: V) => void;
}

/**
 * Generic admin filter + pagination hook.
 * Centralises the boilerplate of filtering, sorting and paginating admin list pages.
 *
 * @example
 * const { pagedItems, totalItems, currentPage, setCurrentPage, pageSize, setPageSize, wrapSetter } =
 *   useAdminFilters({ items: stores, filterFn: myFilterFn, sortFn: mySortFn });
 *
 * const setSearch = wrapSetter(setSearchRaw);   // auto-resets to page 1
 */
export function useAdminFilters<T>({
  items,
  filterFn,
  sortFn,
  defaultPageSize = 10,
}: UseAdminFiltersOptions<T>): UseAdminFiltersReturn<T> {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(defaultPageSize);

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setCurrentPage(1);
  }, []);

  const wrapSetter = useCallback(
    <V,>(setter: (v: V) => void) =>
      (value: V) => {
        setter(value);
        setCurrentPage(1);
      },
    []
  );

  const filtered = [...items].filter(filterFn);
  if (sortFn) filtered.sort(sortFn);

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const safePage = Math.min(currentPage, totalPages);
  const pagedItems = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  return {
    pagedItems,
    filtered,
    totalItems,
    currentPage: safePage,
    pageSize,
    totalPages,
    setCurrentPage,
    setPageSize,
    wrapSetter,
  };
}
