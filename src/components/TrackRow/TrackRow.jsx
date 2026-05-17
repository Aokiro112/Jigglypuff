import React, { memo, useState, useRef, useEffect } from 'react';
import usePlayerStore from '../../store/playerStore';
import useLibraryStore from '../../store/libraryStore';
import useUiStore from '../../store/uiStore';
import CoverArt from '../CoverArt/CoverArt';
import { IconPlay, IconPause, IconTrash, IconPlus } from '../Icons';
import { formatTime } from '../../utils/formatTime';
import styles from './TrackRow.module.css';

/**
 * List row for a single track (used in Library, PlaylistDetail).
 * Memoized to prevent re-renders when other rows' state changes.
 * @param {{ track: TrackMeta, index: number, allIds: string[], showDelete?: boolean, showAddToPlaylist?: boolean }} props
 */
const TrackRow = memo(function TrackRow({ track, index, allIds, showDelete, onDelete, showAddToPlaylist }) {
  const currentTrackId     = usePlayerStore((s) => s.currentTrackId);
  const isPlaying          = usePlayerStore((s) => s.isPlaying);
  const loadQueue          = usePlayerStore((s) => s.loadQueue);
  const setPlaying         = usePlayerStore((s) => s.setPlaying);
  const playlists          = useLibraryStore((s) => s.playlists);
  const addTrackToPlaylist = useLibraryStore((s) => s.addTrackToPlaylist);
  const showNotification   = useUiStore((s) => s.showNotification);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const isActive = track.id === currentTrackId;

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const handleClick = () => {
    if (isActive) {
      setPlaying(!isPlaying);
    } else {
      loadQueue(allIds, index);
    }
  };

  const handleAddToPlaylist = async (e, playlistId) => {
    e.stopPropagation();
    setMenuOpen(false);
    await addTrackToPlaylist(playlistId, track.id);
    const pl = playlists.find((p) => p.id === playlistId);
    showNotification({ type: 'success', message: `Added to "${pl?.name}"`, duration: 2000 });
  };

  return (
    <div
      className={`${styles.row} ${isActive ? styles.active : ''}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      id={`track-row-${track.id}`}
    >
      {/* Index or playing indicator */}
      <div className={styles.num}>
        {isActive ? (
          isPlaying
            ? <span className={styles.eqBars} aria-hidden>
                <span className="eq-bar" style={{ height: 8 }} />
                <span className="eq-bar" style={{ height: 12 }} />
                <span className="eq-bar" style={{ height: 6 }} />
              </span>
            : <IconPause size={14} color="var(--color-accent)" />
        ) : (
          <span className={styles.indexNum}>{index + 1}</span>
        )}
      </div>

      <CoverArt trackId={track.id} hasCover={track.hasCover} thumbnailUrl={track.thumbnailUrl} size={38} />

      <div className={styles.meta}>
        <span className={`${styles.title} truncate`}>{track.title}</span>
        <span className={`${styles.artist} truncate`}>{track.artist}</span>
      </div>

      <span className={`${styles.album} truncate`}>{track.album ?? '—'}</span>

      <span className={styles.duration}>{formatTime(track.duration)}</span>

      {/* Action buttons */}
      <div className={styles.actions} onClick={(e) => e.stopPropagation()}>
        {/* Add to playlist button */}
        {showAddToPlaylist && (
          <div className={styles.menuWrap} ref={menuRef}>
            <button
              className={styles.actionBtn}
              onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o); }}
              title="Add to playlist"
              id={`add-pl-${track.id}`}
            >
              <IconPlus size={14} />
            </button>

            {menuOpen && (
              <div className={styles.dropdown}>
                <div className={styles.dropdownTitle}>Add to playlist</div>
                {playlists.length === 0 ? (
                  <div className={styles.dropdownEmpty}>No playlists yet</div>
                ) : (
                  playlists.map((pl) => (
                    <button
                      key={pl.id}
                      className={styles.dropdownItem}
                      onClick={(e) => handleAddToPlaylist(e, pl.id)}
                    >
                      {pl.name}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Delete button */}
        {showDelete && (
          <button
            className={styles.actionBtn}
            onClick={(e) => { e.stopPropagation(); onDelete?.(track.id); }}
            title="Remove track"
          >
            <IconTrash size={14} />
          </button>
        )}
      </div>
    </div>
  );
});

export default TrackRow;
