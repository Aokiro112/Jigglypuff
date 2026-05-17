/**
 * db.js — IndexedDB service via `idb` wrapper.
 * Schema v1: tracks, playlists, recently_played, settings
 * Includes quota checking and QuotaExceededError handling.
 */
import { openDB } from 'idb';

const DB_NAME = 'jigglypuff-music';
const DB_VERSION = 1;

let _db = null;

/** Opens (or returns cached) DB connection */
async function getDB() {
  if (_db) return _db;
  _db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // --- Tracks store ---
      if (!db.objectStoreNames.contains('tracks')) {
        const ts = db.createObjectStore('tracks', { keyPath: 'id' });
        ts.createIndex('artist', 'artist');
        ts.createIndex('album', 'album');
        ts.createIndex('addedAt', 'addedAt');
      }
      // --- Playlists store ---
      if (!db.objectStoreNames.contains('playlists')) {
        db.createObjectStore('playlists', { keyPath: 'id' });
      }
      // --- Recently played store ---
      if (!db.objectStoreNames.contains('recently_played')) {
        db.createObjectStore('recently_played', { keyPath: 'trackId' });
      }
      // --- Settings store (key-value) ---
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings');
      }
    },
  });
  return _db;
}

// ---------------------------------------------------------------------------
// Storage quota utilities
// ---------------------------------------------------------------------------

/**
 * Returns { usage, quota, percentage } or null if API unavailable.
 * Use to drive warning notifications.
 */
export async function checkStorageQuota() {
  if (!navigator.storage?.estimate) return null;
  const { usage, quota } = await navigator.storage.estimate();
  const percentage = quota > 0 ? (usage / quota) * 100 : 0;
  return { usage, quota, percentage };
}

// ---------------------------------------------------------------------------
// Track CRUD
// ---------------------------------------------------------------------------

/**
 * Adds or replaces a track record.
 * The `blob` field stores the raw audio File/Blob (for audio).
 * For MP4, `blob` is stored too, but audio engine loads lazily on play.
 * @throws 'QUOTA_EXCEEDED' string error if storage is full.
 */
export async function addTrack(track) {
  const db = await getDB();
  try {
    await db.put('tracks', track);
  } catch (err) {
    if (err.name === 'QuotaExceededError') {
      throw new Error('QUOTA_EXCEEDED', { cause: err });
    }
    throw err;
  }
}

/**
 * Returns all tracks as metadata-only objects (blob stripped for RAM).
 * The blob is fetched separately via getTrackBlob() when playback starts.
 */
export async function getAllTracks() {
  const db = await getDB();
  const all = await db.getAll('tracks');
  // Strip blob to keep renderer memory low; only load on demand
  return all.map((track) => {
    const { coverBlob, ...meta } = track;
    delete meta.blob;
    return {
      ...meta,
      hasCover: !!coverBlob || !!meta.thumbnailUrl || !!meta.hasCover,
    };
  });
}

/**
 * Returns the raw audio Blob for a given track ID.
 * For MP4: called only when playback actually starts (lazy loading).
 */
export async function getTrackBlob(id) {
  const db = await getDB();
  const track = await db.get('tracks', id);
  return track?.blob ?? null;
}

/**
 * Returns the cover art Blob for a given track ID (for album art display).
 */
export async function getTrackCoverBlob(id) {
  const db = await getDB();
  const track = await db.get('tracks', id);
  return track?.coverBlob ?? null;
}

/** Permanently removes a track and its data from IndexedDB. */
export async function deleteTrack(id) {
  const db = await getDB();
  await db.delete('tracks', id);
}

// ---------------------------------------------------------------------------
// Playlist CRUD
// ---------------------------------------------------------------------------

export async function getAllPlaylists() {
  const db = await getDB();
  return db.getAll('playlists');
}

export async function savePlaylist(playlist) {
  const db = await getDB();
  await db.put('playlists', playlist);
}

export async function deletePlaylist(id) {
  const db = await getDB();
  await db.delete('playlists', id);
}

// ---------------------------------------------------------------------------
// Recently Played
// ---------------------------------------------------------------------------

/** Returns the 50 most recently played tracks (newest first). */
export async function getRecentlyPlayed() {
  const db = await getDB();
  const all = await db.getAll('recently_played');
  return all.sort((a, b) => b.timestamp - a.timestamp).slice(0, 50);
}

/** Upserts a play event (overwrites timestamp if same trackId). */
export async function recordPlay(trackId) {
  const db = await getDB();
  await db.put('recently_played', { trackId, timestamp: Date.now() });
}

// ---------------------------------------------------------------------------
// Settings (key-value)
// ---------------------------------------------------------------------------

export async function getSetting(key, defaultValue = null) {
  const db = await getDB();
  const val = await db.get('settings', key);
  return val !== undefined ? val : defaultValue;
}

export async function saveSetting(key, value) {
  const db = await getDB();
  await db.put('settings', value, key);
}
