import React from 'react';
import useUiStore, { VIEWS } from '../../store/uiStore';
import usePlayerStore from '../../store/playerStore';
import {
  IconDashboard, IconMusic, IconGrid, IconQueue,
  IconSettings, IconCassette, IconClock,
} from '../Icons';
import styles from './Sidebar.module.css';

const NAV_ITEMS = [
  { id: VIEWS.DASHBOARD,  Icon: IconClock,     label: 'Recently Played' },
  { id: VIEWS.LIBRARY,    Icon: IconMusic,      label: 'Library'         },
  { id: VIEWS.PLAYLISTS,  Icon: IconGrid,       label: 'Playlists'       },
  { id: VIEWS.SEARCH,     Icon: null,           label: 'divider'         },
  { id: VIEWS.SETTINGS,   Icon: IconSettings,   label: 'Settings'        },
];

export default function Sidebar() {
  const activeView = useUiStore((s) => s.activeView);
  const navigate   = useUiStore((s) => s.navigate);
  const queueOpen  = useUiStore((s) => s.queueOpen);
  const toggleQueue = useUiStore((s) => s.toggleQueue);
  const isPlaying  = usePlayerStore((s) => s.isPlaying);

  return (
    <aside className={styles.sidebar} role="navigation" aria-label="Main navigation">
      {/* Logo */}
      <div className={styles.logo} title="Jigglypuff">
        <IconCassette size={22} color="var(--color-accent)" />
      </div>

      {/* Nav icons */}
      <nav className={styles.nav}>
        <button
          className={`${styles.navBtn} ${activeView === VIEWS.DASHBOARD ? styles.active : ''}`}
          onClick={() => navigate(VIEWS.DASHBOARD)}
          title="Dashboard"
          id="nav-dashboard"
        >
          <IconDashboard size={18} />
        </button>

        <button
          className={`${styles.navBtn} ${activeView === VIEWS.LIBRARY ? styles.active : ''}`}
          onClick={() => navigate(VIEWS.LIBRARY)}
          title="Library"
          id="nav-library"
        >
          <IconMusic size={18} />
        </button>

        <button
          className={`${styles.navBtn} ${activeView === VIEWS.PLAYLISTS ? styles.active : ''}`}
          onClick={() => navigate(VIEWS.PLAYLISTS)}
          title="Playlists"
          id="nav-playlists"
        >
          <IconGrid size={18} />
        </button>

        <button
          className={`${styles.navBtn} ${queueOpen ? styles.active : ''}`}
          onClick={toggleQueue}
          title="Queue"
          id="nav-queue"
        >
          <IconQueue size={18} />
          {/* Equalizer indicator when playing */}
          {isPlaying && (
            <span className={styles.eqIndicator} aria-hidden="true">
              <span className="eq-bar" style={{ height: 10 }} />
              <span className="eq-bar" style={{ height: 14 }} />
              <span className="eq-bar" style={{ height: 8  }} />
            </span>
          )}
        </button>
      </nav>

      {/* Settings at bottom */}
      <button
        className={`${styles.navBtn} ${styles.settingsBtn} ${activeView === VIEWS.SETTINGS ? styles.active : ''}`}
        onClick={() => navigate(VIEWS.SETTINGS)}
        title="Settings"
        id="nav-settings"
      >
        <IconSettings size={18} />
      </button>
    </aside>
  );
}
