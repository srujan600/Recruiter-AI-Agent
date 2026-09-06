/**
 * High-performance, zero-dependency in-memory Stale-While-Revalidate (SWR) client cache.
 * Provides instant (< 1ms) cached data returns, request deduplication, and background synchronization.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class APICacheManager {
  private cache = new Map<string, CacheEntry<any>>();
  private inFlight = new Map<string, Promise<any>>();
  private subscribers = new Map<string, Set<(data: any) => void>>();

  // Default TTL: 60 seconds (fresh), after which it is stale but still returned while revalidating
  private defaultTTL = 60 * 1000;

  /**
   * Fetch with SWR pattern:
   * - If fresh: returns cached data immediately.
   * - If stale: returns cached data immediately and revalidates in background.
   * - If not in cache: deduplicates concurrent requests and fetches.
   */
  async fetchWithCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    options?: { ttl?: number; forceRefresh?: boolean }
  ): Promise<T> {
    const ttl = options?.ttl ?? this.defaultTTL;
    const now = Date.now();
    const entry = this.cache.get(key);

    if (entry && !options?.forceRefresh) {
      const isFresh = now - entry.timestamp < entry.ttl;
      if (isFresh) {
        return entry.data as T;
      }

      // Stale data exists: trigger silent background revalidation without blocking caller
      this.revalidateInBackground(key, fetcher, ttl);
      return entry.data as T;
    }

    // No cache or forceRefresh: check if identical request is already in-flight
    if (this.inFlight.has(key)) {
      return this.inFlight.get(key) as Promise<T>;
    }

    const requestPromise = (async () => {
      try {
        const result = await fetcher();
        this.cache.set(key, { data: result, timestamp: Date.now(), ttl });
        this.notifySubscribers(key, result);
        return result;
      } finally {
        this.inFlight.delete(key);
      }
    })();

    this.inFlight.set(key, requestPromise);
    return requestPromise;
  }

  private async revalidateInBackground<T>(key: string, fetcher: () => Promise<T>, ttl: number) {
    if (this.inFlight.has(key)) return;

    const promise = (async () => {
      try {
        const freshData = await fetcher();
        this.cache.set(key, { data: freshData, timestamp: Date.now(), ttl });
        this.notifySubscribers(key, freshData);
      } catch (err) {
        console.warn(`[Cache] Background revalidation failed for ${key}:`, err);
      } finally {
        this.inFlight.delete(key);
      }
    })();

    this.inFlight.set(key, promise);
  }

  /**
   * Get cached data synchronously without triggering fetch.
   */
  getCached<T>(key: string): T | undefined {
    return this.cache.get(key)?.data;
  }

  /**
   * Optimistically update cache data directly.
   */
  setCached<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    this.cache.set(key, { data, timestamp: Date.now(), ttl });
    this.notifySubscribers(key, data);
  }

  /**
   * Invalidate cache entries matching a prefix or pattern.
   */
  invalidate(keyPrefix?: string): void {
    if (!keyPrefix) {
      this.cache.clear();
      return;
    }
    for (const key of this.cache.keys()) {
      if (key.startsWith(keyPrefix)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Subscribe to cache updates for live reactive synchronization.
   */
  subscribe<T>(key: string, callback: (data: T) => void): () => void {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    this.subscribers.get(key)!.add(callback);

    return () => {
      this.subscribers.get(key)?.delete(callback);
    };
  }

  private notifySubscribers(key: string, data: any) {
    const subs = this.subscribers.get(key);
    if (subs) {
      subs.forEach((cb) => {
        try {
          cb(data);
        } catch (e) {
          console.error(e);
        }
      });
    }
  }
}

export const apiCache = new APICacheManager();
