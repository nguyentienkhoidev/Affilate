'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/axios-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import { detectCountryFromBrowserTimezone, MarketCode } from '@/lib/holidayTheme';

let cachedGeoCountry: MarketCode | null = null;
let geoFetchPromise: Promise<MarketCode> | null = null;

function normalizeClientCountry(code?: string | null): MarketCode | null {
  if (!code) return null;
  const upper = code.trim().toUpperCase();
  if (upper === 'UK') return 'GB';
  if (upper === 'GLOBAL' || /^[A-Z]{2}$/.test(upper)) return upper as MarketCode;
  return null;
}

async function resolveGeoCountryOnce(): Promise<MarketCode> {
  if (cachedGeoCountry) return cachedGeoCountry;
  if (geoFetchPromise) return geoFetchPromise;

  geoFetchPromise = (async () => {
    try {
      const res = await apiClient.get(API_ENDPOINTS.PUBLIC.GEO);
      const code = normalizeClientCountry(res.data?.data?.countryCode);
      if (code && code !== 'GLOBAL') {
        cachedGeoCountry = code;
        return code;
      }
    } catch {
      // Fall through to browser timezone detection
    }
    const tzCountry = detectCountryFromBrowserTimezone();
    cachedGeoCountry = tzCountry;
    return tzCountry;
  })();

  return geoFetchPromise;
}

/**
 * Resolves the visitor's market code (`US`, `GB`, `CA`, `FR`, `DE`, `AU`, or `GLOBAL`).
 * Supports `?country=XX` query parameter for instant multi-market previewing.
 */
export function useVisitorCountry(): MarketCode {
  const [countryCode, setCountryCode] = useState<MarketCode>(() => cachedGeoCountry || 'GLOBAL');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const override = normalizeClientCountry(params.get('country'));
      if (override) {
        setCountryCode(override);
        return;
      }
    }

    let cancelled = false;
    void resolveGeoCountryOnce().then((resolved) => {
      if (!cancelled) {
        setCountryCode(resolved);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return countryCode;
}
