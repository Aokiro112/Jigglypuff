/**
 * PlayerBar.jsx — Bottom playback bar.
 *
 * Performance contract:
 * - This component only re-renders when currentTrackId, isPlaying, volume,
 *   isMuted, shuffle, or repeat changes — NOT on every timeupdate.
 * - The seek bar and time display are updated via direct DOM manipulation
 *   (rAF loop in useAudioEngine) through refs passed up from App.jsx.
 */
import React, { useCallback } from 'react';
import usePlayerStore, { REPEAT } from '../../store/playerStore';
import useLibraryStore from '../../store/libraryStore';
import CoverArt from '../CoverArt/CoverArt';
import {
  IconPlay, IconPause, IconSkipNext, IconSkipPrev,
  IconShuffle, IconRepeat, IconRepeat1, IconHeart, IconVolume, IconVolumeMute,
} from '../Icons';
import styles from './PlayerBar.module.css';

/**
 * @param {{
 *   progressRef: React.RefObject<HTMLInputElement>,
 *   timeRef: React.RefObject<HTMLSpanElement>,
 *   onSeek: (pct: number) => void,
 * }} props
 */
export default function PlayerBar({ progressRef, timeRef, onSeek }) {
  const currentTrackId = usePlayerStore((s) => s.currentTrackId);
  const isPlaying      = usePlayerStore((s) => s.isPlaying);
  const volume         = usePlayerStore((s) => s.volume);
  const isMuted        = usePlayerStore((s) => s.isMuted);
  const shuffle        = usePlayerStore((s) => s.shuffle);
  const repeat         = usePlayerStore((s) => s.repeat);

  const { setPlaying, setVolume, toggleMute, toggleShuffle, cycleRepeat, nextTrack, prevTrack } =
    usePlayerStore.getState();

  const tracks = useLibraryStore((s) => s.tracks);
  const track  = tracks.find((t) => t.id === currentTrackId) ?? null;

  const handleSeekChange = useCallback((e) => {
    onSeek(parseFloat(e.target.value));
  }, [onSeek]);

  const handleVolumeChange = useCallback((e) => {
    setVolume(parseFloat(e.target.value));
  }, []);

  const RepeatIcon = repeat === REPEAT.ONE ? IconRepeat1 : IconRepeat;

  return (
    <footer className={styles.playerBar} id="player-bar">
      {/* ── Progress strip (full width, above controls) ── */}
      <div className={styles.progressWrap}>
        <input
          ref={progressRef}
          id="player-progress"
          type="range"
          min="0"
          max="100"
          defaultValue="0"
          step="0.1"
          onChange={handleSeekChange}
          className={styles.progressSlider}
          aria-label="Seek"
          style={{ '--prog': '0%' }}
        />
      </div>

      <div className={styles.inner}>
        {/* ── Left: cover + track info ── */}
        <div className={styles.trackInfo}>
          <CoverArt
            trackId={currentTrackId}
            hasCover={track?.hasCover ?? false}
            size={42}
            className={styles.coverArt}
          />
          <div className={styles.meta}>
            <span className={`${styles.title} truncate`}>
              {track?.title ?? 'No track selected'}
            </span>
            <span className={`${styles.artist} truncate`}>
              {track?.artist ?? '—'}
            </span>
          </div>
        </div>

        {/* ── Center: controls ── */}
        <div className={styles.controls}>
          <button
            className={`${styles.ctrlBtn} ${shuffle ? styles.active : ''}`}
            onClick={toggleShuffle}
            title="Shuffle (S)"
            id="ctrl-shuffle"
          >
            <IconShuffle size={16} />
          </button>

          <button
            className={styles.ctrlBtn}
            onClick={prevTrack}
            title="Previous (Shift+←)"
            id="ctrl-prev"
          >
            <IconSkipPrev size={18} />
          </button>

          <button
            className={`${styles.ctrlBtn} ${styles.playBtn}`}
            onClick={() => setPlaying(!isPlaying)}
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            id="ctrl-play"
            disabled={!currentTrackId}
          >
            {isPlaying ? <IconPause size={20} /> : <IconPlay size={20} />}
          </button>

          <button
            className={styles.ctrlBtn}
            onClick={nextTrack}
            title="Next (Shift+→)"
            id="ctrl-next"
          >
            <IconSkipNext size={18} />
          </button>

          <button
            className={`${styles.ctrlBtn} ${repeat !== REPEAT.NONE ? styles.active : ''}`}
            onClick={cycleRepeat}
            title="Repeat (R)"
            id="ctrl-repeat"
          >
            <RepeatIcon size={16} />
          </button>
        </div>

        {/* ── Right: time + volume ── */}
        <div className={styles.rightControls}>
          {/* Time display — updated via DOM in useAudioEngine rAF loop */}
          <span
            ref={timeRef}
            id="player-time"
            className={styles.timeDisplay}
            aria-live="off"
            aria-label="Playback time"
          >
            0:00 / 0:00
          </span>

          <button
            className={styles.ctrlBtn}
            onClick={toggleMute}
            title="Mute (M)"
            id="ctrl-mute"
          >
            {isMuted || volume === 0
              ? <IconVolumeMute size={16} />
              : <IconVolume size={16} />
            }
          </button>

          {/* Volume slider */}
          <input
            id="player-volume"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className={styles.volumeSlider}
            aria-label="Volume"
            style={{ '--vol': `${(isMuted ? 0 : volume) * 100}%` }}
          />
        </div>
      </div>
    </footer>
  );
}
