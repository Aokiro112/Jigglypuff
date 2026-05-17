import React from 'react';
import usePlayerStore from '../../store/playerStore';
import useLibraryStore from '../../store/libraryStore';
import useUiStore from '../../store/uiStore';
import CoverArt from '../CoverArt/CoverArt';
import { IconX, IconTrash } from '../Icons';
import { formatTime } from '../../utils/formatTime';
import styles from './QueuePanel.module.css';

export default function QueuePanel() {
  const queueOpen = useUiStore((s) => s.queueOpen);
  const toggleQueue = useUiStore((s) => s.toggleQueue);
  const queue       = usePlayerStore((s) => s.queue);
  const queueIndex  = usePlayerStore((s) => s.queueIndex);
  const currentTrackId = usePlayerStore((s) => s.currentTrackId);
  const { loadQueue, removeFromQueue, clearQueue } = usePlayerStore.getState();
  const tracks      = useLibraryStore((s) => s.tracks);

  const trackMap = React.useMemo(() => {
    const m = new Map();
    tracks.forEach((t) => m.set(t.id, t));
    return m;
  }, [tracks]);

  if (!queueOpen) return null;

  return (
    <aside className={styles.panel} id="queue-panel">
      <div className={styles.header}>
        <h2 className={styles.title}>Queue</h2>
        <div className={styles.headerActions}>
          <button className={styles.clearBtn} onClick={clearQueue} title="Clear queue" id="queue-clear">
            <IconTrash size={14} />
            <span>Clear</span>
          </button>
          <button className={styles.closeBtn} onClick={toggleQueue} title="Close queue" id="queue-close">
            <IconX size={16} />
          </button>
        </div>
      </div>

      <div className={styles.list}>
        {queue.length === 0 ? (
          <div className={styles.empty}>Queue is empty</div>
        ) : (
          queue.map((trackId, idx) => {
            const t = trackMap.get(trackId);
            if (!t) return null;
            const isCurrent = idx === queueIndex;
            return (
              <div
                key={`${trackId}_${idx}`}
                className={`${styles.row} ${isCurrent ? styles.active : ''}`}
                onClick={() => loadQueue(queue, idx)}
                id={`queue-row-${idx}`}
              >
                <CoverArt trackId={t.id} hasCover={t.hasCover} thumbnailUrl={t.thumbnailUrl} size={36} />
                <div className={styles.rowMeta}>
                  <span className={`${styles.rowTitle} truncate`}>{t.title}</span>
                  <span className={`${styles.rowArtist} truncate`}>{t.artist}</span>
                </div>
                <span className={styles.rowDuration}>{formatTime(t.duration)}</span>
                <button
                  className={styles.rowRemove}
                  onClick={(e) => { e.stopPropagation(); removeFromQueue(idx); }}
                  title="Remove from queue"
                >
                  <IconX size={12} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
