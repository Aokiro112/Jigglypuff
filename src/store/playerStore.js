/**
 * playerStore.js — Zustand store for playback state.
 *
 * NOTE: `progress` is intentionally NOT stored here.
 * The progress bar reads directly from the <audio> element via a ref
 * to avoid React rerenders on every timeupdate event (~4x/sec).
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const REPEAT = {
  NONE: 'none',
  ONE: 'one',
  ALL: 'all',
};

const usePlayerStore = create(persist((set, get) => ({
  // ── Current track ──────────────────────────────────────────────────────────
  currentTrackId: null,
  isPlaying: false,
  playbackNonce: 0,
  duration: 0,         // seconds — set once audio metadata loads

  // ── Controls ───────────────────────────────────────────────────────────────
  volume: 0.8,
  isMuted: false,
  shuffle: false,
  repeat: REPEAT.NONE,

  // ── Queue ──────────────────────────────────────────────────────────────────
  // Array of track IDs in play order (shuffled or not)
  queue: [],
  queueIndex: 0,

  // ── Error ──────────────────────────────────────────────────────────────────
  error: null,

  // ── Actions ────────────────────────────────────────────────────────────────

  setCurrentTrack: (trackId) => set({ currentTrackId: trackId, error: null }),

  setPlaying: (isPlaying) => set({ isPlaying }),

  setDuration: (duration) => set({ duration }),

  setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)), isMuted: false }),

  toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),

  toggleShuffle: () => set((s) => {
    const newShuffle = !s.shuffle;
    if (newShuffle && s.queue.length > 1) {
      // Reshuffle remaining queue, keep current at front
      const current = s.queue[s.queueIndex];
      const rest = [...s.queue.slice(0, s.queueIndex), ...s.queue.slice(s.queueIndex + 1)];
      // Fisher-Yates shuffle
      for (let i = rest.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [rest[i], rest[j]] = [rest[j], rest[i]];
      }
      return { shuffle: true, queue: [current, ...rest], queueIndex: 0 };
    }
    return { shuffle: newShuffle };
  }),

  cycleRepeat: () => set((s) => {
    const order = [REPEAT.NONE, REPEAT.ALL, REPEAT.ONE];
    const next = order[(order.indexOf(s.repeat) + 1) % order.length];
    return { repeat: next };
  }),

  /**
   * Loads a list of track IDs into the queue and starts at a given index.
   * Shuffles if shuffle mode is enabled.
   */
  loadQueue: (trackIds, startIndex = 0) => {
    const { shuffle } = get();
    const safeIds = trackIds.filter(Boolean);
    if (!safeIds.length) {
      set({ queue: [], queueIndex: 0, currentTrackId: null, isPlaying: false, duration: 0 });
      return;
    }

    const safeStartIndex = Math.max(0, Math.min(startIndex, safeIds.length - 1));
    if (shuffle && safeIds.length > 1) {
      const startTrack = safeIds[safeStartIndex];
      const rest = safeIds.filter((_, i) => i !== safeStartIndex);
      for (let i = rest.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [rest[i], rest[j]] = [rest[j], rest[i]];
      }
      set((s) => ({
        queue: [startTrack, ...rest],
        queueIndex: 0,
        currentTrackId: startTrack,
        isPlaying: true,
        duration: 0,
        error: null,
        playbackNonce: s.playbackNonce + 1,
      }));
    } else {
      set((s) => ({
        queue: safeIds,
        queueIndex: safeStartIndex,
        currentTrackId: safeIds[safeStartIndex],
        isPlaying: true,
        duration: 0,
        error: null,
        playbackNonce: s.playbackNonce + 1,
      }));
    }
  },

  nextTrack: () => {
    const { queue, queueIndex, repeat, shuffle } = get();
    if (!queue.length) return;
    if (repeat === REPEAT.ONE) {
      // Signal audio engine to restart — don't change track
      set((s) => ({
        currentTrackId: queue[queueIndex],
        isPlaying: true,
        duration: 0,
        error: null,
        playbackNonce: s.playbackNonce + 1,
      }));
      return;
    }
    if (shuffle) {
      if (queue.length === 1) {
        set((s) => ({
          queueIndex: 0,
          currentTrackId: queue[0],
          isPlaying: true,
          duration: 0,
          error: null,
          playbackNonce: s.playbackNonce + 1,
        }));
        return;
      }

      const currentTrack = queue[queueIndex];
      const candidates = queue
        .map((trackId, index) => ({ trackId, index }))
        .filter(({ trackId, index }) => index !== queueIndex && trackId !== currentTrack);
      const pool = candidates.length
        ? candidates
        : queue.map((trackId, index) => ({ trackId, index })).filter(({ index }) => index !== queueIndex);
      const nextPick = pool[Math.floor(Math.random() * pool.length)];
      set({
        queueIndex: nextPick.index,
        currentTrackId: nextPick.trackId,
        isPlaying: true,
        duration: 0,
        error: null,
      });
      return;
    }

    const next = queueIndex + 1;
    if (next >= queue.length) {
      if (repeat === REPEAT.ALL) {
        set({ queueIndex: 0, currentTrackId: queue[0], isPlaying: true, duration: 0, error: null });
      }
      // REPEAT.NONE: stop
      else {
        set({ isPlaying: false });
      }
    } else {
      set({ queueIndex: next, currentTrackId: queue[next], isPlaying: true, duration: 0, error: null });
    }
  },

  prevTrack: () => {
    const { queue, queueIndex } = get();
    if (!queue.length) return;
    const prev = Math.max(0, queueIndex - 1);
    set({ queueIndex: prev, currentTrackId: queue[prev], isPlaying: true, duration: 0, error: null });
  },

  addToQueue: (trackId) => set((s) => ({ queue: [...s.queue, trackId] })),

  removeFromQueue: (index) => set((s) => {
    const newQueue = s.queue.filter((_, i) => i !== index);
    const newIndex = index < s.queueIndex
      ? s.queueIndex - 1
      : Math.min(s.queueIndex, newQueue.length - 1);
    return { queue: newQueue, queueIndex: Math.max(0, newIndex) };
  }),

  clearQueue: () => set({ queue: [], queueIndex: 0 }),

  setError: (error) => set({ error, isPlaying: false }),
}), {
  name: 'jigglypuff-player-state',
  partialize: (s) => ({
    volume: s.volume,
    isMuted: s.isMuted,
    shuffle: s.shuffle,
    repeat: s.repeat,
    queue: s.queue,
    queueIndex: s.queueIndex,
    currentTrackId: s.currentTrackId,
    isPlaying: s.isPlaying,
  }),
}));

export default usePlayerStore;
