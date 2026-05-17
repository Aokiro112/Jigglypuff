import React, { useMemo } from 'react';
import useLibraryStore from '../../store/libraryStore';
import usePlayerStore from '../../store/playerStore';
import useUiStore, { VIEWS } from '../../store/uiStore';
import TrackCard from '../../components/TrackCard/TrackCard';
import TrackRow from '../../components/TrackRow/TrackRow';
import { IconUpload } from '../../components/Icons';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const tracks        = useLibraryStore((s) => s.tracks);
  const recentlyPlayed = useLibraryStore((s) => s.recentlyPlayed);
  const queue         = usePlayerStore((s) => s.queue);
  const queueIndex    = usePlayerStore((s) => s.queueIndex);
  const openImportModal = useUiStore((s) => s.openImportModal);
  const navigate      = useUiStore((s) => s.navigate);

  const trackMap = useMemo(() => {
    const m = new Map();
    tracks.forEach((t) => m.set(t.id, t));
    return m;
  }, [tracks]);

  // Recently played — resolve track objects, deduplicate
  const recentTracks = useMemo(() => {
    const seen = new Set();
    return recentlyPlayed
      .map((r) => trackMap.get(r.trackId))
      .filter((t) => t && !seen.has(t.id) && seen.add(t.id))
      .slice(0, 12);
  }, [recentlyPlayed, trackMap]);

  // New additions — 12 most recently imported
  const newAdditions = useMemo(() => (
    [...tracks].sort((a, b) => b.addedAt - a.addedAt).slice(0, 12)
  ), [tracks]);

  // Queue tracks for the right panel preview (shown in TrackRow format)
  const upNext = useMemo(() => (
    queue.slice(queueIndex + 1, queueIndex + 8).map((id) => trackMap.get(id)).filter(Boolean)
  ), [queue, queueIndex, trackMap]);

  const allIds = useMemo(() => tracks.map((t) => t.id), [tracks]);

  if (tracks.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyCard}>
          <IconUpload size={48} color="var(--color-accent)" />
          <h2 className={styles.emptyTitle}>Your library is empty</h2>
          <p className={styles.emptyText}>Import MP3 or MP4 files to get started</p>
          <button className={styles.emptyBtn} onClick={openImportModal} id="empty-import">
            Import Music
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* ── Recently Played ── */}
      {recentTracks.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recently Played</h2>
            <button className={styles.seeAll} onClick={() => navigate(VIEWS.LIBRARY)}>See all</button>
          </div>
          <div className={styles.cardScroll}>
            {recentTracks.map((t) => (
              <TrackCard key={t.id} track={t} />
            ))}
          </div>
        </section>
      )}

      {/* ── New Additions ── */}
      {newAdditions.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>New Additions</h2>
            <button className={styles.seeAll} onClick={() => navigate(VIEWS.LIBRARY)}>See all</button>
          </div>
          <div className={styles.cardScroll}>
            {newAdditions.map((t) => (
              <TrackCard key={t.id} track={t} />
            ))}
          </div>
        </section>
      )}

      {/* ── Up Next (from queue) ── */}
      {upNext.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Up Next</h2>
          <div className={styles.upNextList}>
            {upNext.map((t, i) => (
              <TrackRow
                key={t.id}
                track={t}
                index={queueIndex + 1 + i}
                allIds={allIds}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
