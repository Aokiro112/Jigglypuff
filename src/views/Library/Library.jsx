import React, { useMemo, useState } from 'react';
import useLibraryStore from '../../store/libraryStore';
import TrackRow from '../../components/TrackRow/TrackRow';
import styles from './Library.module.css';

const SORT_OPTIONS = [
  { value: 'title',   label: 'Title'    },
  { value: 'artist',  label: 'Artist'   },
  { value: 'album',   label: 'Album'    },
  { value: 'addedAt', label: 'Date Added' },
];

export default function Library() {
  const tracks      = useLibraryStore((s) => s.tracks);
  const deleteTrack = useLibraryStore((s) => s.deleteTrack);
  const [sort, setSort] = useState('addedAt');
  const [dir,  setDir]  = useState('desc');

  const sorted = useMemo(() => {
    return [...tracks].sort((a, b) => {
      const va = a[sort] ?? '';
      const vb = b[sort] ?? '';
      const cmp = typeof va === 'number' ? va - vb : String(va).localeCompare(String(vb));
      return dir === 'asc' ? cmp : -cmp;
    });
  }, [tracks, sort, dir]);

  const allIds = useMemo(() => sorted.map((t) => t.id), [sorted]);

  const toggleSort = (field) => {
    if (sort === field) setDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSort(field); setDir('asc'); }
  };

  return (
    <div className={styles.library}>
      <div className={styles.header}>
        <h1 className={styles.title}>Library</h1>
        <span className={styles.count}>{tracks.length} track{tracks.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Column headers / sort */}
      <div className={styles.colHeaders}>
        <div className={styles.colNum}>#</div>
        <div className={styles.colArt}></div>
        <button className={`${styles.colBtn} ${sort === 'title' ? styles.sorted : ''}`} onClick={() => toggleSort('title')}>
          Title {sort === 'title' ? (dir === 'asc' ? '↑' : '↓') : ''}
        </button>
        <button className={`${styles.colBtn} ${sort === 'album' ? styles.sorted : ''}`} onClick={() => toggleSort('album')}>
          Album {sort === 'album' ? (dir === 'asc' ? '↑' : '↓') : ''}
        </button>
        <div className={styles.colDur}>Duration</div>
        <div className={styles.colDel}></div>
      </div>

      <div className={styles.list}>
        {sorted.length === 0 ? (
          <p className={styles.empty}>No tracks. Import some music to get started!</p>
        ) : (
          sorted.map((track, i) => (
            <TrackRow
              key={track.id}
              track={track}
              index={i}
              allIds={allIds}
              showDelete
              showAddToPlaylist
              onDelete={deleteTrack}
            />
          ))
        )}
      </div>
    </div>
  );
}
