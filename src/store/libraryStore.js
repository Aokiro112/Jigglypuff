/**
 * libraryStore.js — Zustand store for music library, playlists, recently played.
 * Coordinates with IndexedDB via the db service.
 */
import { create } from 'zustand';
import {
  getAllTracks,
  addTrack,
  deleteTrack as dbDeleteTrack,
  getAllPlaylists,
  savePlaylist as dbSavePlaylist,
  deletePlaylist as dbDeletePlaylist,
  getRecentlyPlayed,
  recordPlay,
  checkStorageQuota,
} from '../services/db';
import { parseTrackMetadata } from '../services/metadataParser';
import { generateId } from '../utils/generateId';
import useUiStore from './uiStore';

const useLibraryStore = create((set, get) => ({
  // ── State ─────────────────────────────────────────────────────────────────
  tracks: [],        // TrackMeta[] — no blob data
  playlists: [],
  recentlyPlayed: [], // [{ trackId, timestamp }]
  isLoading: false,
  importProgress: null, // { current, total } | null
  storageWarning: null, // null | 'approaching' | 'critical'

  // ── Initialization ────────────────────────────────────────────────────────

  /** Load all persisted data from IndexedDB on app startup. */
  init: async () => {
    set({ isLoading: true });
    try {
      const [tracks, playlists, recentlyPlayed] = await Promise.all([
        getAllTracks(),
        getAllPlaylists(),
        getRecentlyPlayed(),
      ]);
      set({ tracks, playlists, recentlyPlayed, isLoading: false });
      // Check quota after loading
      get().checkQuota();
    } catch (err) {
      console.error('[LibraryStore] init failed:', err);
      set({ isLoading: false });
    }
  },

  // ── Storage quota ─────────────────────────────────────────────────────────

  checkQuota: async () => {
    const info = await checkStorageQuota();
    if (!info) return;
    let level = null;
    if (info.percentage >= 95) level = 'critical';
    else if (info.percentage >= 80) level = 'approaching';
    set({ storageWarning: level });
    if (level) {
      useUiStore.getState().showNotification({
        type: level === 'critical' ? 'error' : 'warning',
        message: level === 'critical'
          ? `Storage almost full (${info.percentage.toFixed(0)}% used). Delete some tracks to continue.`
          : `Storage at ${info.percentage.toFixed(0)}% — consider cleaning up old tracks.`,
        duration: 6000,
      });
    }
  },

  // ── Track import ──────────────────────────────────────────────────────────

  /**
   * Imports an array of File objects.
   * Processes them sequentially to avoid memory spikes.
   */
  importFiles: async (files) => {
    const validFiles = Array.from(files).filter(
      (f) => f.type === 'audio/mpeg' || f.type === 'audio/mp3' ||
             f.type === 'video/mp4' || f.type === 'audio/mp4' ||
             f.name.endsWith('.mp3') || f.name.endsWith('.mp4') || f.name.endsWith('.m4a')
    );

    if (!validFiles.length) {
      useUiStore.getState().showNotification({
        type: 'error',
        message: 'No valid MP3 or MP4 files found.',
        duration: 4000,
      });
      return;
    }

    set({ importProgress: { current: 0, total: validFiles.length } });
    const newTracks = [];

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      set({ importProgress: { current: i + 1, total: validFiles.length } });

      try {
        const meta = await parseTrackMetadata(file);
        // Store record: metadata + blob (blob loaded lazily for MP4)
        const record = { ...meta, blob: file };
        // Remove coverBlob from record to store separately if you want,
        // but here we keep it together for simplicity.
        await addTrack(record);

        // Track for UI (without blobs)
        newTracks.push({
          id: meta.id,
          title: meta.title,
          artist: meta.artist,
          album: meta.album,
          year: meta.year,
          trackNo: meta.trackNo,
          duration: meta.duration,
          mimeType: meta.mimeType,
          filename: meta.filename,
          hasCover: !!meta.coverBlob,
          addedAt: meta.addedAt,
        });
      } catch (err) {
        if (err.message === 'QUOTA_EXCEEDED') {
          useUiStore.getState().showNotification({
            type: 'error',
            message: 'Storage quota exceeded. Free up space to import more tracks.',
            duration: 6000,
          });
          break;
        }
        console.error(`[LibraryStore] Failed to import "${file.name}":`, err);
      }
    }

    set((s) => ({
      tracks: [...s.tracks, ...newTracks],
      importProgress: null,
    }));

    if (newTracks.length > 0) {
      useUiStore.getState().showNotification({
        type: 'success',
        message: `Imported ${newTracks.length} track${newTracks.length !== 1 ? 's' : ''}.`,
        duration: 3000,
      });
      get().checkQuota();
    }
  },

  deleteTrack: async (trackId) => {
    await dbDeleteTrack(trackId);
    set((s) => ({
      tracks: s.tracks.filter((t) => t.id !== trackId),
      recentlyPlayed: s.recentlyPlayed.filter((r) => r.trackId !== trackId),
      playlists: s.playlists.map((p) => ({
        ...p,
        trackIds: p.trackIds.filter((id) => id !== trackId),
      })),
    }));
  },

  // ── Playlists ─────────────────────────────────────────────────────────────

  createPlaylist: async (name) => {
    const playlist = {
      id: generateId(),
      name,
      trackIds: [],
      createdAt: Date.now(),
    };
    await dbSavePlaylist(playlist);
    set((s) => ({ playlists: [...s.playlists, playlist] }));
    return playlist;
  },

  updatePlaylist: async (id, changes) => {
    const { playlists } = get();
    const updated = playlists.map((p) => (p.id === id ? { ...p, ...changes } : p));
    const playlist = updated.find((p) => p.id === id);
    await dbSavePlaylist(playlist);
    set({ playlists: updated });
  },

  deletePlaylist: async (id) => {
    await dbDeletePlaylist(id);
    set((s) => ({ playlists: s.playlists.filter((p) => p.id !== id) }));
  },

  addTrackToPlaylist: async (playlistId, trackId) => {
    const { playlists } = get();
    const playlist = playlists.find((p) => p.id === playlistId);
    if (!playlist || playlist.trackIds.includes(trackId)) return;
    const updated = { ...playlist, trackIds: [...playlist.trackIds, trackId] };
    await dbSavePlaylist(updated);
    set((s) => ({
      playlists: s.playlists.map((p) => (p.id === playlistId ? updated : p)),
    }));
  },

  removeTrackFromPlaylist: async (playlistId, trackId) => {
    const { playlists } = get();
    const playlist = playlists.find((p) => p.id === playlistId);
    if (!playlist) return;
    const updated = { ...playlist, trackIds: playlist.trackIds.filter((id) => id !== trackId) };
    await dbSavePlaylist(updated);
    set((s) => ({
      playlists: s.playlists.map((p) => (p.id === playlistId ? updated : p)),
    }));
  },

  // ── Recently played ───────────────────────────────────────────────────────

  recordPlay: async (trackId) => {
    await recordPlay(trackId);
    set((s) => {
      const filtered = s.recentlyPlayed.filter((r) => r.trackId !== trackId);
      return {
        recentlyPlayed: [{ trackId, timestamp: Date.now() }, ...filtered].slice(0, 50),
      };
    });
  },

  // ── Search ────────────────────────────────────────────────────────────────

  /** In-memory search — no DB call, instant results. */
  search: (query) => {
    if (!query.trim()) return { tracks: [], albums: [], artists: [] };
    const q = query.toLowerCase();
    const { tracks } = get();

    const matched = tracks.filter(
      (t) =>
        t.title?.toLowerCase().includes(q) ||
        t.artist?.toLowerCase().includes(q) ||
        t.album?.toLowerCase().includes(q)
    );

    // Unique albums
    const albumMap = new Map();
    matched.forEach((t) => {
      if (t.album && !albumMap.has(t.album)) albumMap.set(t.album, t);
    });

    // Unique artists
    const artistMap = new Map();
    matched.forEach((t) => {
      if (t.artist && !artistMap.has(t.artist)) artistMap.set(t.artist, t);
    });

    return {
      tracks: matched,
      albums: [...albumMap.entries()].map(([album, rep]) => ({ album, representative: rep })),
      artists: [...artistMap.entries()].map(([artist, rep]) => ({ artist, representative: rep })),
    };
  },
}));

export default useLibraryStore;
