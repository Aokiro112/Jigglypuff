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
    if (shuffle && trackIds.length > 1) {
      const startTrack = trackIds[startIndex];
      const rest = trackIds.filter((_, i) => i !== startIndex);
      for (let i = rest.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [rest[i], rest[j]] = [rest[j], rest[i]];
      }
      set({ queue: [startTrack, ...rest], queueIndex: 0, currentTrackId: startTrack });
    } else {
      set({ queue: trackIds, queueIndex: startIndex, currentTrackId: trackIds[startIndex] });
    }
  },

  nextTrack: () => {
    const { queue, queueIndex, repeat } = get();
    if (!queue.length) return;
    if (repeat === REPEAT.ONE) {
      // Signal audio engine to restart — don't change track
      set({ currentTrackId: queue[queueIndex] }); // same ID, engine will restart
      return;
    }
    const next = queueIndex + 1;
    if (next >= queue.length) {
      if (repeat === REPEAT.ALL) {
        set({ queueIndex: 0, currentTrackId: queue[0] });
      }
      // REPEAT.NONE: stop
      else {
        set({ isPlaying: false });
      }
    } else {
      set({ queueIndex: next, currentTrackId: queue[next] });
    }
  },

  prevTrack: () => {
    const { queue, queueIndex } = get();
    if (!queue.length) return;
    const prev = Math.max(0, queueIndex - 1);
    set({ queueIndex: prev, currentTrackId: queue[prev] });
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
  }),
}));

export default usePlayerStore;
