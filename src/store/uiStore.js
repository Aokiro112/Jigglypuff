/**
 * uiStore.js — Zustand store for UI state: views, panels, notifications.
 */
import { create } from 'zustand';

export const VIEWS = {
  DASHBOARD: 'dashboard',
  LIBRARY: 'library',
  PLAYLISTS: 'playlists',
  PLAYLIST_DETAIL: 'playlist_detail',
  SEARCH: 'search',
  SETTINGS: 'settings',
};

const useUiStore = create((set, get) => ({
  // ── Navigation ────────────────────────────────────────────────────────────
  activeView: VIEWS.DASHBOARD,
  viewParams: {},          // e.g. { playlistId: '...' }
  history: [VIEWS.DASHBOARD],
  historyIndex: 0,

  // ── Panels ────────────────────────────────────────────────────────────────
  queueOpen: false,
  miniPlayerActive: false,
  importModalOpen: false,

  // ── Search ────────────────────────────────────────────────────────────────
  searchQuery: '',

  // ── Notifications ─────────────────────────────────────────────────────────
  // { id, type: 'success'|'warning'|'error'|'info', message, duration }
  notifications: [],

  // ── Actions ───────────────────────────────────────────────────────────────

  navigate: (view, params = {}) => {
    set((s) => {
      const newHistory = [...s.history.slice(0, s.historyIndex + 1), view];
      return {
        activeView: view,
        viewParams: params,
        history: newHistory.slice(-20), // cap history at 20
        historyIndex: newHistory.length - 1,
      };
    });
  },

  goBack: () => {
    const { history, historyIndex } = get();
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    set({ historyIndex: newIndex, activeView: history[newIndex], viewParams: {} });
  },

  goForward: () => {
    const { history, historyIndex } = get();
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    set({ historyIndex: newIndex, activeView: history[newIndex], viewParams: {} });
  },

  setSearchQuery: (q) => set({ searchQuery: q }),

  toggleQueue: () => set((s) => ({ queueOpen: !s.queueOpen })),

  toggleMiniPlayer: () => set((s) => ({ miniPlayerActive: !s.miniPlayerActive })),

  openImportModal: () => set({ importModalOpen: true }),

  closeImportModal: () => set({ importModalOpen: false }),

  /** Shows a toast notification. Auto-dismisses after `duration` ms. */
  showNotification: ({ type = 'info', message, duration = 3000 }) => {
    const id = `notif_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    set((s) => ({ notifications: [...s.notifications, { id, type, message }] }));
    setTimeout(() => {
      set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) }));
    }, duration);
  },

  dismissNotification: (id) => {
    set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) }));
  },
}));

export default useUiStore;
