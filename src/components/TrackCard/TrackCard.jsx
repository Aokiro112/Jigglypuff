import React, { memo } from 'react';
import usePlayerStore from '../../store/playerStore';
import useLibraryStore from '../../store/libraryStore';
import CoverArt from '../CoverArt/CoverArt';
import { IconPlay, IconMoreVert } from '../Icons';
import styles from './TrackCard.module.css';

/**
 * Grid card for albums/playlists.
 * @param {{ track: TrackMeta, tracks?: TrackMeta[], label?: string, sublabel?: string }} props
 */
const TrackCard = memo(function TrackCard({ track, tracks, label, sublabel, onClick }) {
  const currentTrackId = usePlayerStore((s) => s.currentTrackId);
  const isPlaying      = usePlayerStore((s) => s.isPlaying);
  const loadQueue      = usePlayerStore((s) => s.loadQueue);
  const allTracks      = useLibraryStore((s) => s.tracks);

  const isActive = track?.id === currentTrackId;

  const handlePlay = (e) => {
    e.stopPropagation();
    if (tracks && tracks.length) {
      loadQueue(tracks.map((t) => t.id), 0);
    } else if (track) {
      const allIds = allTracks.map((t) => t.id);
      const idx    = allIds.indexOf(track.id);
      loadQueue(allIds, idx >= 0 ? idx : 0);
    }
  };

  return (
    <div
      className={`${styles.card} card-hover ${isActive ? styles.active : ''}`}
      onClick={onClick ?? handlePlay}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && (onClick ?? handlePlay)(e)}
      id={`card-${track?.id}`}
    >
      <div className={styles.artWrap}>
        <CoverArt trackId={track?.id} hasCover={track?.hasCover} thumbnailUrl={track?.thumbnailUrl} size={110} />
        {/* Play overlay */}
        <div className={styles.playOverlay} onClick={handlePlay}>
          {isActive && isPlaying
            ? <span className={styles.eqBars} aria-hidden>
                <span className="eq-bar" style={{ height: 12 }} />
                <span className="eq-bar" style={{ height: 16 }} />
                <span className="eq-bar" style={{ height: 10 }} />
              </span>
            : <IconPlay size={24} color="white" />
          }
        </div>
      </div>

      <div className={styles.info}>
        <span className={`${styles.label} truncate`}>{label ?? track?.title}</span>
        <span className={`${styles.sublabel} truncate`}>{sublabel ?? track?.artist}</span>
      </div>
    </div>
  );
});

export default TrackCard;
