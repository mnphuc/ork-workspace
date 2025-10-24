"use client";
import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/api';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class APICache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Invalidate cache entries that match a pattern
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }
}

const apiCache = new APICache();

export function useCachedAPI<T>(
  url: string | null,
  options: {
    ttl?: number;
    enabled?: boolean;
    dependencies?: any[];
  } = {}
): {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  invalidate: () => void;
} {
  const { ttl = 5 * 60 * 1000, enabled = true, dependencies = [] } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!url || !enabled) return;

    // Check cache first
    const cachedData = apiCache.get<T>(url);
    if (cachedData) {
      setData(cachedData);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await apiFetch<T>(url);
      setData(result);
      apiCache.set(url, result, ttl);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [url, enabled, ttl]);

  const refetch = useCallback(async () => {
    if (url) {
      apiCache.delete(url);
      await fetchData();
    }
  }, [url, fetchData]);

  const invalidate = useCallback(() => {
    if (url) {
      apiCache.delete(url);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData, ...dependencies]);

  return {
    data,
    loading,
    error,
    refetch,
    invalidate
  };
}

// Hook for optimistic updates
export function useOptimisticUpdate<T>(
  url: string,
  updateFn: (oldData: T | null, newData: any) => T
) {
  const { data, refetch, invalidate } = useCachedAPI<T>(url);

  const optimisticUpdate = useCallback(async (newData: any) => {
    // Update cache immediately
    const currentData = apiCache.get<T>(url);
    const optimisticData = updateFn(currentData, newData);
    apiCache.set(url, optimisticData);

    // Update state
    setData(optimisticData);

    try {
      // Perform actual API call
      await apiFetch(url, {
        method: 'PATCH',
        body: newData
      });
    } catch (error) {
      // Revert on error
      await refetch();
      throw error;
    }
  }, [url, updateFn, refetch]);

  return {
    data,
    optimisticUpdate,
    refetch,
    invalidate
  };
}

// Utility functions for cache management
export const cacheUtils = {
  invalidatePattern: (pattern: string) => apiCache.invalidatePattern(pattern),
  clear: () => apiCache.clear(),
  delete: (key: string) => apiCache.delete(key)
};
