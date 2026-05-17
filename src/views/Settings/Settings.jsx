import React from 'react';
import usePlayerStore from '../../store/playerStore';
import useUiStore from '../../store/uiStore';
import styles from './Settings.module.css';

const SHORTCUTS = [
  { key: 'Space',      action: 'Play / Pause'          },
  { key: '←  /  →',   action: 'Seek -5s / +5s'         },
  { key: 'Shift + ←', action: 'Previous track'          },
  { key: 'Shift + →', action: 'Next track'              },
  { key: 'Alt + ↑',   action: 'Volume up'               },
  { key: 'Alt + ↓',   action: 'Volume down'             },
  { key: 'M',         action: 'Toggle mute'             },
  { key: 'Ctrl + M',  action: 'Toggle mini-player'      },
  { key: 'S',         action: 'Toggle shuffle'          },
  { key: 'R',         action: 'Cycle repeat mode'       },
  { key: 'Ctrl + O',  action: 'Open import dialog'      },
];

export default function Settings() {
  const volume  = usePlayerStore((s) => s.volume);
  const shuffle = usePlayerStore((s) => s.shuffle);
  const repeat  = usePlayerStore((s) => s.repeat);
  const { setVolume } = usePlayerStore.getState();

  return (
    <div className={styles.settings}>
      <div className={styles.header}>
        <h1 className={styles.title}>Settings</h1>
      </div>

      <div className={styles.content}>
        {/* Playback defaults */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Playback</h2>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="settings-volume">Default Volume</label>
            <div className={styles.volRow}>
              <input
                id="settings-volume"
                type="range"
                min="0" max="1" step="0.01"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className={styles.volSlider}
                style={{ '--vol': `${volume * 100}%` }}
              />
              <span className={styles.volVal}>{Math.round(volume * 100)}%</span>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Current shuffle</label>
            <span className={styles.value}>{shuffle ? 'On' : 'Off'}</span>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Current repeat</label>
            <span className={styles.value}>{repeat === 'none' ? 'Off' : repeat === 'one' ? 'Repeat one' : 'Repeat all'}</span>
          </div>
        </section>

        {/* Storage info */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Storage</h2>
          <p className={styles.storageNote}>
            Music files are stored in your browser's IndexedDB. They persist between sessions.
            To free space, delete individual tracks from the Library view.
          </p>
          <StorageInfo />
        </section>

        {/* Keyboard shortcuts */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Keyboard Shortcuts</h2>
          <div className={styles.shortcuts}>
            {SHORTCUTS.map((s) => (
              <div key={s.key} className={styles.shortcutRow}>
                <kbd className={styles.kbd}>{s.key}</kbd>
                <span className={styles.shortcutAction}>{s.action}</span>
              </div>
            ))}
          </div>
        </section>

        {/* About */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>About</h2>
          <p className={styles.about}>
            <strong>Jigglypuff</strong> — Offline Music Player<br />
            Built with React + Vite. Zero internet required after first load.<br />
            Supports MP3 and MP4 files. All data stays on your device.
          </p>
        </section>
      </div>
    </div>
  );
}

function StorageInfo() {
  const [info, setInfo] = React.useState(null);

  React.useEffect(() => {
    if (navigator.storage?.estimate) {
      navigator.storage.estimate().then(({ usage, quota }) => {
        setInfo({ usage, quota, pct: (usage / quota) * 100 });
      });
    }
  }, []);

  if (!info) return <p className={styles.storageNote}>Storage info unavailable.</p>;

  const used = (info.usage / 1024 / 1024).toFixed(1);
  const total = (info.quota / 1024 / 1024).toFixed(0);

  return (
    <div className={styles.storageInfo}>
      <div className={styles.storageBar}>
        <div className={styles.storageUsed} style={{ width: `${Math.min(info.pct, 100)}%` }} />
      </div>
      <p className={styles.storageLabel}>{used} MB used of ~{total} MB available ({info.pct.toFixed(1)}%)</p>
    </div>
  );
}
