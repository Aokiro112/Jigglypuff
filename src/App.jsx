/**
 * App.jsx — Root component and layout shell.
 *
 * Layout:
 *   ┌──────────────────────────────────────────────┐
 *   │  TopBar (search, nav, import)                │
 *   ├──────┬──────────────────────────┬────────────┤
 *   │      │                          │            │
 *   │ Side │  Main view               │ Queue panel│
 *   │ bar  │  (Dashboard/Library/etc) │ (optional) │
 *   │      │                          │            │
 *   ├──────┴──────────────────────────┴────────────┤
 *   │  PlayerBar                                   │
 *   └──────────────────────────────────────────────┘
 *
 * Audio engine lives here via refs passed to PlayerBar.
 * App only re-renders on view/modal changes, NOT on audio progress.
 */
import React, { useRef, useEffect, useCallback } from 'react';
import useUiStore, { VIEWS } from './store/uiStore';
import useLibraryStore from './store/libraryStore';
import { useAudioEngine } from './hooks/useAudioEngine';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useDragDrop } from './hooks/useDragDrop';
import { revokeAll } from './services/blobUrlCache';

import Sidebar          from './components/Sidebar/Sidebar';
import TopBar           from './components/TopBar/TopBar';
import PlayerBar        from './components/PlayerBar/PlayerBar';
import QueuePanel       from './components/QueuePanel/QueuePanel';
import ImportZone       from './components/ImportZone/ImportZone';
import NotificationStack from './components/Notification/Notification';

import Dashboard       from './views/Dashboard/Dashboard';
import Library         from './views/Library/Library';
import Playlists       from './views/Playlists/Playlists';
import PlaylistDetail  from './views/PlaylistDetail/PlaylistDetail';
import Search          from './views/Search/Search';
import Settings        from './views/Settings/Settings';

import styles from './App.module.css';

// Refs for progress bar and time display — passed to AudioEngine and PlayerBar.
// These are module-level to avoid re-creating across re-renders.
const progressRef = { current: null };
const timeRef     = { current: null };

export default function App() {
  const activeView = useUiStore((s) => s.activeView);
  const queueOpen  = useUiStore((s) => s.queueOpen);
  const init       = useLibraryStore((s) => s.init);

  // ── Boot: load library from IndexedDB ────────────────────────────────────
  useEffect(() => {
    init();
    // Cleanup ObjectURLs when window closes
    const handleUnload = () => revokeAll();
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, []);

  // ── Audio engine ──────────────────────────────────────────────────────────
  const { seek, seekSeconds } = useAudioEngine({ progressRef, timeRef });

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useKeyboardShortcuts({ seekSeconds });

  // ── Global drag-drop ──────────────────────────────────────────────────────
  useDragDrop();

  // ── Handle seek from PlayerBar's input ───────────────────────────────────
  const handleSeek = useCallback((pct) => seek(pct), [seek]);

  // ── View router ───────────────────────────────────────────────────────────
  const renderView = () => {
    switch (activeView) {
      case VIEWS.DASHBOARD:       return <Dashboard />;
      case VIEWS.LIBRARY:         return <Library />;
      case VIEWS.PLAYLISTS:       return <Playlists />;
      case VIEWS.PLAYLIST_DETAIL: return <PlaylistDetail />;
      case VIEWS.SEARCH:          return <Search />;
      case VIEWS.SETTINGS:        return <Settings />;
      default:                    return <Dashboard />;
    }
  };

  return (
    <div className={styles.appShell}>
      {/* Top bar */}
      <TopBar />

      {/* Main row: sidebar + content + queue */}
      <div className={styles.mainRow}>
        <Sidebar />

        {/* Main view area */}
        <main className={styles.mainContent} key={activeView}>
          {renderView()}
        </main>

        {/* Collapsible queue panel */}
        {queueOpen && <QueuePanel />}
      </div>

      {/* Bottom player bar — receives DOM refs, not React state for progress */}
      <PlayerBar
        progressRef={progressRef}
        timeRef={timeRef}
        onSeek={handleSeek}
      />

      {/* Modals / overlays */}
      <ImportZone />
      <NotificationStack />
    </div>
  );
}
