'use client';

import { useCallback, useSyncExternalStore } from 'react';

/**
 * Lightweight client-side store for admin CRUD collections.
 *
 * List pages and the dedicated create / edit pages live on different routes,
 * so they need a shared source of truth. Data is seeded from mock defaults and
 * persisted to localStorage until the real backend API is wired in.
 */

type Id = string | number;
type Listener = () => void;

const STORAGE_PREFIX = 'admin:collection:';

const cache = new Map<string, unknown[]>();
const listeners = new Map<string, Set<Listener>>();

function readCollection<T>(key: string, seed: T[]): T[] {
  if (!cache.has(key)) {
    let data: T[] = seed;
    try {
      const raw = window.localStorage.getItem(STORAGE_PREFIX + key);
      if (raw) data = JSON.parse(raw) as T[];
    } catch {
      data = seed;
    }
    cache.set(key, data);
  }
  return cache.get(key) as T[];
}

function writeCollection<T>(key: string, next: T[]) {
  cache.set(key, next);
  try {
    window.localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(next));
  } catch {
    // Storage full / unavailable – keep in-memory state only.
  }
  listeners.get(key)?.forEach((l) => l());
}

function subscribe(key: string, listener: Listener) {
  if (!listeners.has(key)) listeners.set(key, new Set());
  listeners.get(key)!.add(listener);
  return () => {
    listeners.get(key)?.delete(listener);
  };
}

const noopSubscribe = () => () => {};

/** `true` once the component is running on the client (after hydration). */
export function useHydrated() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

export function useAdminCollection<T extends { id: Id }>(key: string, seed: T[]) {
  const items = useSyncExternalStore(
    useCallback((l: Listener) => subscribe(key, l), [key]),
    () => readCollection(key, seed),
    () => seed
  );
  const hydrated = useHydrated();

  const setItems = useCallback(
    (updater: (prev: T[]) => T[]) => {
      writeCollection(key, updater(readCollection(key, seed)));
    },
    [key, seed]
  );

  const create = useCallback((item: T) => setItems((prev) => [item, ...prev]), [setItems]);

  const update = useCallback(
    (id: Id, patch: Partial<T>) =>
      setItems((prev) => prev.map((it) => (String(it.id) === String(id) ? { ...it, ...patch } : it))),
    [setItems]
  );

  const remove = useCallback(
    (id: Id) => setItems((prev) => prev.filter((it) => String(it.id) !== String(id))),
    [setItems]
  );

  const getById = useCallback(
    (id: Id | undefined) => (id === undefined ? undefined : items.find((it) => String(it.id) === String(id))),
    [items]
  );

  return { items, hydrated, setItems, create, update, remove, getById };
}
