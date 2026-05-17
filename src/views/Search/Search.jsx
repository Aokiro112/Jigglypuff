import { useState, useMemo, useEffect, useCallback } from 'react';
import { useDeferredValue } from 'react';
import useLibraryStore from '../../store/libraryStore';
import useUiStore from '../../store/uiStore';
import usePlayerStore from '../../store/playerStore';
import TrackCard from '../../components/TrackCard/TrackCard';
import TrackRow from '../../components/TrackRow/TrackRow';
import CoverArt from '../../components/CoverArt/CoverArt';
import { IconPlay, IconPause, IconPlus } from '../../components/Icons';
import { formatTime } from '../../utils/formatTime';
import { searchOnlineTracks } from '../../services/onlineMusic';
import styles from './Search.module.css';
import rowStyles from '../../components/TrackRow/TrackRow.module.css';

const TABS = ['Tracks', 'Albums', 'Artists', 'Online'];

function OnlineTrackRow({ track, index, isAdded, onAdd, onPlay }) {
  const currentTrackId = usePlayerStore((s) => s.currentTrackId);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const isActive = track.id === currentTrackId;

  return (
    <div
      className={`${rowStyles.row} ${isActive ? rowStyles.active : ''}`}
      onClick={() => onPlay(track)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onPlay(track)}
      id={`online-track-row-${track.onlineId}`}
    >
      <div className={rowStyles.num}>
        {isActive && isPlaying ? (
          <span className={rowStyles.eqBars} aria-hidden>
            <span className="eq-bar" style={{ height: 8 }} />
            <span className="eq-bar" style={{ height: 12 }} />
            <span className="eq-bar" style={{ height: 6 }} />
          </span>
        ) : (
          <span className={rowStyles.indexNum}>{index + 1}</span>
        )}
      </div>

      <CoverArt trackId={track.id} hasCover={track.hasCover} thumbnailUrl={track.thumbnailUrl} size={38} />

      <div className={rowStyles.meta}>
        <span className={`${rowStyles.title} truncate`}>{track.title}</span>
        <span className={`${rowStyles.artist} truncate`}>{track.artist}</span>
      </div>

      <span className={`${rowStyles.album} truncate`}>Online</span>
      <span className={rowStyles.duration}>{formatTime(track.duration)}</span>

      <div className={rowStyles.actions} onClick={(e) => e.stopPropagation()}>
        <button
          className={rowStyles.actionBtn}
          onClick={() => onPlay(track)}
          title={isActive && isPlaying ? 'Pause' : 'Play'}
        >
          {isActive && isPlaying ? <IconPause size={14} /> : <IconPlay size={14} />}
        </button>
        <button
          className={rowStyles.actionBtn}
          onClick={() => onAdd(track)}
          title={isAdded ? 'Already in library' : 'Add to library'}
          disabled={isAdded}
        >
          <IconPlus size={14} />
        </button>
      </div>
    </div>
  );
}

export default function Search() {
  const searchQuery = useUiStore((s) => s.searchQuery);
  const search      = useLibraryStore((s) => s.search);
  const tracks      = useLibraryStore((s) => s.tracks);
  const addOnlineTrack = useLibraryStore((s) => s.addOnlineTrack);
  const recordSearchQuery = useLibraryStore((s) => s.recordSearchQuery);
  const showNotification = useUiStore((s) => s.showNotification);
  const loadQueue = usePlayerStore((s) => s.loadQueue);
  const setPlaying = usePlayerStore((s) => s.setPlaying);
  const currentTrackId = usePlayerStore((s) => s.currentTrackId);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const [onlineResults, setOnlineResults] = useState([]);
  const [onlineLoading, setOnlineLoading] = useState(false);
  const [onlineError, setOnlineError] = useState('');
  const [tab, setTab] = useState('Tracks');

  // useDeferredValue defers the expensive search while user is typing
  const deferredQuery = useDeferredValue(searchQuery);

  const results = useMemo(() => {
    if (!deferredQuery.trim()) return { tracks: [], albums: [], artists: [] };
    return search(deferredQuery);
  }, [deferredQuery, search]);

  const allTrackIds = useMemo(() => results.tracks.map((t) => t.id), [results.tracks]);
  const addedIds = useMemo(() => new Set(tracks.map((t) => t.id)), [tracks]);

  useEffect(() => {
    const q = deferredQuery.trim();
    if (!q) {
      const clearTimer = setTimeout(() => {
        setOnlineResults([]);
        setOnlineError('');
        setOnlineLoading(false);
      }, 0);
      return () => clearTimeout(clearTimer);
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setOnlineLoading(true);
      setOnlineError('');
      try {
        const found = await searchOnlineTracks(q, { signal: controller.signal });
        setOnlineResults(found);
        recordSearchQuery(q);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setOnlineError(err.message || 'Online search failed.');
          setOnlineResults([]);
        }
      } finally {
        if (!controller.signal.aborted) setOnlineLoading(false);
      }
    }, 350);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [deferredQuery, recordSearchQuery]);

  const handleAddOnline = useCallback(async (track) => {
    if (addedIds.has(track.id)) {
      showNotification({ type: 'info', message: 'Already in your library.', duration: 2000 });
      return tracks.find((t) => t.id === track.id) || track;
    }
    return addOnlineTrack(track);
  }, [addOnlineTrack, addedIds, showNotification, tracks]);

  const handlePlayOnline = useCallback(async (track) => {
    if (currentTrackId === track.id) {
      setPlaying(!isPlaying);
      return;
    }
    const saved = await handleAddOnline(track);
    loadQueue([saved.id], 0);
  }, [currentTrackId, handleAddOnline, isPlaying, loadQueue, setPlaying]);

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

          {tab === 'Online' && (
            onlineLoading ? (
              <p className={styles.noResults}>Searching online...</p>
            ) : onlineError ? (
              <p className={styles.noResults}>{onlineError}</p>
            ) : onlineResults.length === 0 ? (
              <p className={styles.noResults}>No online results found for "{deferredQuery}"</p>
            ) : (
              <div className={styles.trackList}>
                {onlineResults.map((track, i) => (
                  <OnlineTrackRow
                    key={track.id}
                    track={track}
                    index={i}
                    isAdded={addedIds.has(track.id)}
                    onAdd={handleAddOnline}
                    onPlay={handlePlayOnline}
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
