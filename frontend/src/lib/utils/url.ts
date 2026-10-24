export function appendUtmParams(url: string, params: Record<string, string | null | undefined>): string {
  try {
    const parsed = new URL(url, window.location.origin);
    Object.entries(params).forEach(([key, val]) => {
      if (val) {
        parsed.searchParams.set(key, val);
      }
    });
    return parsed.toString();
  } catch {
    return url;
  }
}

export function cleanQueryParams<T extends Record<string, unknown>>(params: T): Record<string, string> {
  const result: Record<string, string> = {};
  Object.entries(params).forEach(([key, val]) => {
    if (val !== null && val !== undefined && val !== '') {
      result[key] = String(val);
    }
  });
  return result;
}
