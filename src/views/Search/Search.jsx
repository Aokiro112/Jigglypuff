import React, { useState, useMemo, useCallback } from 'react';
import { useDeferredValue } from 'react';
import useLibraryStore from '../../store/libraryStore';
import useUiStore from '../../store/uiStore';
import usePlayerStore from '../../store/playerStore';
import TrackCard from '../../components/TrackCard/TrackCard';
import TrackRow from '../../components/TrackRow/TrackRow';
import styles from './Search.module.css';

const TABS = ['Tracks', 'Albums', 'Artists'];

export default function Search() {
  const searchQuery = useUiStore((s) => s.searchQuery);
  const search      = useLibraryStore((s) => s.search);
  const tracks      = useLibraryStore((s) => s.tracks);
  const [tab, setTab] = useState('Tracks');

  // useDeferredValue defers the expensive search while user is typing
  const deferredQuery = useDeferredValue(searchQuery);

  const results = useMemo(() => {
    if (!deferredQuery.trim()) return { tracks: [], albums: [], artists: [] };
    return search(deferredQuery);
  }, [deferredQuery, search]);

  const allTrackIds = useMemo(() => results.tracks.map((t) => t.id), [results.tracks]);

  return (
    <div className={styles.searchView}>
      <div className={styles.header}>
        <h1 className={styles.title}>Search</h1>
        {deferredQuery && (
          <p className={styles.queryLabel}>
            Query: <strong>"{deferredQuery}"</strong>
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {TABS.map((t) => (
          <button
            key={t}
            className={`${styles.tab} ${tab === t ? styles.activeTab : ''}`}
            onClick={() => setTab(t)}
            id={`search-tab-${t.toLowerCase()}`}
          >
            {t}
          </button>
        ))}
      </div>

      {!deferredQuery.trim() ? (
        <div className={styles.empty}>
          <p>Start typing in the search bar to find music</p>
        </div>
      ) : (
        <div className={styles.results}>
          {tab === 'Tracks' && (
            results.tracks.length === 0 ? (
              <p className={styles.noResults}>No tracks found for "{deferredQuery}"</p>
            ) : (
              <div className={styles.trackList}>
                {results.tracks.map((track, i) => (
                  <TrackRow key={track.id} track={track} index={i} allIds={allTrackIds} />
                ))}
              </div>
            )
          )}

          {tab === 'Albums' && (
            results.albums.length === 0 ? (
              <p className={styles.noResults}>No albums found for "{deferredQuery}"</p>
            ) : (
              <div className={styles.grid}>
                {results.albums.map(({ album, representative: rep }) => (
                  <TrackCard
                    key={album}
                    track={rep}
                    label={album}
                    sublabel={rep.artist}
                    tracks={results.tracks.filter((t) => t.album === album)}
                  />
                ))}
              </div>
            )
          )}

          {tab === 'Artists' && (
            results.artists.length === 0 ? (
              <p className={styles.noResults}>No artists found for "{deferredQuery}"</p>
            ) : (
              <div className={styles.grid}>
                {results.artists.map(({ artist, representative: rep }) => (
                  <TrackCard
                    key={artist}
                    track={rep}
                    label={artist}
                    sublabel={`${results.tracks.filter((t) => t.artist === artist).length} tracks`}
                    tracks={results.tracks.filter((t) => t.artist === artist)}
                  />
                ))}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
