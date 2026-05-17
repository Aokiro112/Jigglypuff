import React, { useState } from 'react';
import useLibraryStore from '../../store/libraryStore';
import useUiStore, { VIEWS } from '../../store/uiStore';
import usePlayerStore from '../../store/playerStore';
import CoverArt from '../../components/CoverArt/CoverArt';
import { IconPlus, IconImport, IconPlay, IconTrash } from '../../components/Icons';
import styles from './Playlists.module.css';

export default function Playlists() {
  const playlists      = useLibraryStore((s) => s.playlists);
  const tracks         = useLibraryStore((s) => s.tracks);
  const createPlaylist = useLibraryStore((s) => s.createPlaylist);
  const deletePlaylist = useLibraryStore((s) => s.deletePlaylist);
  const navigate       = useUiStore((s) => s.navigate);
  const loadQueue      = usePlayerStore((s) => s.loadQueue);
  const openImportModal = useUiStore((s) => s.openImportModal);

  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  const trackMap = React.useMemo(() => {
    const m = new Map();
    tracks.forEach((t) => m.set(t.id, t));
    return m;
  }, [tracks]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    await createPlaylist(newName.trim());
    setNewName('');
    setCreating(false);
  };

  const handlePlay = (playlist, e) => {
    e.stopPropagation();
    if (!playlist.trackIds.length) return;
    loadQueue(playlist.trackIds, 0);
  };

  return (
    <div className={styles.playlists}>
      <div className={styles.header}>
        <h1 className={styles.title}>Playlists</h1>
        <div className={styles.headerActions}>
          <button className={styles.importBtn} onClick={openImportModal} id="pl-import">
            <IconImport size={14} />
            <span>Import</span>
          </button>
          <button className={styles.createBtn} onClick={() => setCreating(true)} id="pl-create">
            <IconPlus size={14} />
            <span>Create new</span>
          </button>
        </div>
      </div>

      {/* Create playlist inline form */}
      {creating && (
        <form className={styles.createForm} onSubmit={handleCreate}>
          <input
            autoFocus
            className={styles.createInput}
            placeholder="Playlist name…"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && setCreating(false)}
            id="playlist-name-input"
          />
          <button type="submit" className={styles.createSubmit}>Create</button>
          <button type="button" className={styles.createCancel} onClick={() => setCreating(false)}>Cancel</button>
        </form>
      )}

      <div className={styles.grid}>
        {playlists.map((pl) => {
          const coverTrack = pl.trackIds.length ? trackMap.get(pl.trackIds[0]) : null;
          const hasTracks = pl.trackIds.length > 0;
          return (
            <div
              key={pl.id}
              className={`${styles.card} card-hover`}
              onClick={() => navigate(VIEWS.PLAYLIST_DETAIL, { playlistId: pl.id })}
              id={`pl-card-${pl.id}`}
            >
              <div className={styles.artWrap}>
                <CoverArt
                  trackId={coverTrack?.id}
                  hasCover={coverTrack?.hasCover ?? false}
                  size={110}
                />
                {/* Play button overlay */}
                {hasTracks && (
                  <button className={styles.playOverlay} onClick={(e) => handlePlay(pl, e)} title="Play">
                    <IconPlay size={22} color="white" />
                  </button>
                )}
              </div>
              <div className={styles.cardInfo}>
                <span className={`${styles.cardName} truncate`}>{pl.name}</span>
                <span className={styles.cardCount}>{pl.trackIds.length} track{pl.trackIds.length !== 1 ? 's' : ''}</span>
              </div>
              <button
                className={styles.deleteBtn}
                onClick={(e) => { e.stopPropagation(); deletePlaylist(pl.id); }}
                title="Delete playlist"
              >
                <IconTrash size={12} />
              </button>
            </div>
          );
        })}

        {playlists.length === 0 && !creating && (
          <p className={styles.empty}>No playlists yet. Create one to get started!</p>
        )}
      </div>
    </div>
  );
}
