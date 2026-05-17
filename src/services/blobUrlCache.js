/**
 * blobUrlCache.js — Manages ObjectURL lifecycle to prevent memory leaks.
 *
 * Rules:
 * - ObjectURLs are created lazily on first request.
 * - Reference counting ensures URLs are only revoked when no consumers hold them.
 * - revokeAll() is called on app unmount to guarantee no leaks.
 */

/** @type {Map<string, { url: string, refCount: number }>} */
const cache = new Map();

/**
 * Creates and caches an ObjectURL for a Blob, or returns the existing URL.
 * Increments reference count.
 * @param {string} id - Unique identifier (track ID)
 * @param {Blob} blob
 * @returns {string} Object URL
 */
export function acquireUrl(id, blob) {
  if (cache.has(id)) {
    cache.get(id).refCount++;
    return cache.get(id).url;
  }
  const url = URL.createObjectURL(blob);
  cache.set(id, { url, refCount: 1 });
  return url;
}

/**
 * Decrements the reference count for a cached URL.
 * If count reaches 0, revokes the ObjectURL and removes it from cache.
 * @param {string} id
 */
export function releaseUrl(id) {
  const entry = cache.get(id);
  if (!entry) return;
  entry.refCount--;
  if (entry.refCount <= 0) {
    URL.revokeObjectURL(entry.url);
    cache.delete(id);
  }
}

/**
 * Returns the cached URL for an ID without altering ref count.
 * Returns null if not cached.
 * @param {string} id
 * @returns {string|null}
 */
export function peekUrl(id) {
  return cache.get(id)?.url ?? null;
}

/**
 * Forcefully revokes ALL cached ObjectURLs.
 * Call this on app unmount / window unload to guarantee no memory leaks.
 */
export function revokeAll() {
  for (const { url } of cache.values()) {
    URL.revokeObjectURL(url);
  }
  cache.clear();
}

/** Returns current cache size (for debugging/monitoring). */
export function cacheSize() {
  return cache.size;
}
