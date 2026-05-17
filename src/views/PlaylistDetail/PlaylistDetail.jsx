import { useMemo, useEffect, useRef, useState } from 'react';
import useLibraryStore from '../../store/libraryStore';
import useUiStore from '../../store/uiStore';
import usePlayerStore from '../../store/playerStore';
import TrackRow from '../../components/TrackRow/TrackRow';
import CoverArt from '../../components/CoverArt/CoverArt';
import { IconChevronLeft, IconPlay, IconPlus } from '../../components/Icons';
import styles from './PlaylistDetail.module.css';

export default function PlaylistDetail() {
  const viewParams = useUiStore((s) => s.viewParams);
  const goBack     = useUiStore((s) => s.goBack);
  const playlists  = useLibraryStore((s) => s.playlists);
  const tracks     = useLibraryStore((s) => s.tracks);
  const addTrackToPlaylist = useLibraryStore((s) => s.addTrackToPlaylist);
  const removeTrackFromPlaylist = useLibraryStore((s) => s.removeTrackFromPlaylist);
  const loadQueue  = usePlayerStore((s) => s.loadQueue);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const addMenuRef = useRef(null);

  const playlist = playlists.find((p) => p.id === viewParams.playlistId);

  const trackMap = useMemo(() => {
    const m = new Map();
    tracks.forEach((t) => m.set(t.id, t));
    return m;
  }, [tracks]);

  const playlistTracks = useMemo(() => (
    (playlist?.trackIds ?? []).map((id) => trackMap.get(id)).filter(Boolean)
  ), [playlist, trackMap]);

  const allIds = useMemo(() => playlistTracks.map((t) => t.id), [playlistTracks]);
  const availableTracks = useMemo(() => {
    const playlistIds = new Set(playlist?.trackIds ?? []);
    return tracks.filter((track) => !playlistIds.has(track.id));
  }, [playlist, tracks]);

  useEffect(() => {
    if (!addMenuOpen) return;
    const handler = (e) => {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target)) {
        setAddMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [addMenuOpen]);

  if (!playlist) {
    return <div className={styles.notFound}>Playlist not found.</div>;
  }

  const coverTrack = playlistTracks[0] ?? null;
  const handleAddTrack = async (trackId) => {
    await addTrackToPlaylist(playlist.id, trackId);
    setAddMenuOpen(false);
  };

  return (
    <div className={styles.detail}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={goBack} id="pl-detail-back">
          <IconChevronLeft size={18} />
          <span>Playlists</span>
        </button>

        <div className={styles.playlistMeta}>
          <div className={styles.coverWrap}>
            <CoverArt trackId={coverTrack?.id} hasCover={coverTrack?.hasCover ?? false} size={100} />
          </div>
          <div className={styles.metaText}>
            <h1 className={styles.name}>{playlist.name}</h1>
            <p className={styles.count}>{playlistTracks.length} track{playlistTracks.length !== 1 ? 's' : ''}</p>
            <button
              className={styles.playAllBtn}
              onClick={() => loadQueue(allIds, 0)}
              disabled={!allIds.length}
              id="pl-detail-play"
            >
              <IconPlay size={16} />
              <span>Play all</span>
            </button>
            <div className={styles.addMenuWrap} ref={addMenuRef}>
              <button
                className={styles.addTracksBtn}
                onClick={() => setAddMenuOpen((open) => !open)}
                disabled={tracks.length === 0}
                id="pl-detail-add-tracks"
              >
                <IconPlus size={16} />
                <span>Add tracks</span>
              </button>

              {addMenuOpen && (
                <div className={styles.addDropdown}>
                  <div className={styles.addDropdownTitle}>Add to playlist</div>
                  {availableTracks.length === 0 ? (
                    <div className={styles.addDropdownEmpty}>
                      {tracks.length === 0 ? 'Import tracks first.' : 'All tracks are already here.'}
                    </div>
                  ) : (
                    availableTracks.map((track) => (
                      <button
                        key={track.id}
                        className={styles.addDropdownItem}
                        onClick={() => handleAddTrack(track.id)}
                      >
                        <span className={styles.addTrackTitle}>{track.title}</span>
                        <span className={styles.addTrackArtist}>{track.artist}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Track list */}
      <div className={styles.list}>
        {playlistTracks.length === 0 ? (
          <p className={styles.empty}>No tracks in this playlist yet.</p>
        ) : (
          playlistTracks.map((track, i) => (
            <TrackRow
              key={track.id}
              track={track}
              index={i}
              allIds={allIds}
              showDelete
              onDelete={(id) => removeTrackFromPlaylist(playlist.id, id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
