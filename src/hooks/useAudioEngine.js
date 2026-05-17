/**
 * useAudioEngine.js — Manages the singleton <audio> element.
 *
 * Key design decisions:
 * - Audio element lives in a ref (never triggers React re-renders)
 * - Progress bar updates via requestAnimationFrame + direct DOM manipulation
 * - MP4 blobs are loaded lazily (only when playback starts)
 * - ObjectURLs are properly ref-counted via blobUrlCache
 * - Cleans up previous URL before loading new track
 */
import { useEffect, useRef, useCallback } from 'react';
import usePlayerStore from '../store/playerStore';
import useLibraryStore from '../store/libraryStore';
import { getTrackBlob } from '../services/db';
import { acquireUrl, releaseUrl } from '../services/blobUrlCache';
import { getStreamUrl } from '../services/onlineMusic';

/**
 * @param {{ progressRef: React.RefObject, timeRef: React.RefObject }} refs
 *   DOM refs to the seek input and time-display span in PlayerBar.
 *   Progress is updated directly on these DOM nodes (zero React rerenders).
 */
export function useAudioEngine({ progressRef, timeRef } = {}) {
  const audioRef = useRef(null);
  const rafRef = useRef(null);
  const prevTrackIdRef = useRef(null);
  const prevBlobUrlRef = useRef(null);
  const loadRequestRef = useRef(0);

  // Subscribe to store slices we care about
  const currentTrackId = usePlayerStore((s) => s.currentTrackId);
  const isPlaying      = usePlayerStore((s) => s.isPlaying);
  const playbackNonce  = usePlayerStore((s) => s.playbackNonce);
  const volume         = usePlayerStore((s) => s.volume);
  const isMuted        = usePlayerStore((s) => s.isMuted);

  const { setDuration, nextTrack, setError } = usePlayerStore.getState();
  const { recordPlay } = useLibraryStore.getState();

  // ── Initialize audio element once ────────────────────────────────────────
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'none'; // Never preload — load only on play
    audioRef.current = audio;

    return () => {
      loadRequestRef.current += 1;
      stopRaf();
      audio.pause();
      audio.onloadedmetadata = null;
      audio.onended = null;
      audio.onerror = null;
      audio.src = '';
      if (prevBlobUrlRef.current) {
        releaseUrl(prevBlobUrlRef.current.id);
        prevBlobUrlRef.current = null;
      }
    };
  }, []);

  // ── rAF loop: update progress bar DOM directly ────────────────────────────
  function startRaf() {
    if (rafRef.current) return;
    const tick = () => {
      const audio = audioRef.current;
      if (!audio) return;
      const current = audio.currentTime;
      const total   = audio.duration || 0;

      if (progressRef?.current && total > 0) {
        const pct = (current / total) * 100;
        progressRef.current.value = pct;
        // CSS custom property drives the filled track color
        progressRef.current.style.setProperty('--prog', `${pct}%`);
      }
      if (timeRef?.current && total > 0) {
        timeRef.current.textContent = `${fmt(current)} / ${fmt(total)}`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }

  function stopRaf() {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }

  function fmt(s) {
    if (!isFinite(s) || s < 0) return '0:00';
    const sec = Math.floor(s);
    const m   = Math.floor(sec / 60);
    const ss  = sec % 60;
    return `${m}:${String(ss).padStart(2, '0')}`;
  }

  // ── Load and play a new track ─────────────────────────────────────────────
  useEffect(() => {
    if (!currentTrackId) {
      const audio = audioRef.current;
      loadRequestRef.current += 1;
      if (audio) {
        audio.pause();
        audio.removeAttribute('src');
      }
      prevTrackIdRef.current = null;
      stopRaf();
      setDuration(0);
      return;
    }
    if (currentTrackId === prevTrackIdRef.current) {
      // Same track (e.g. repeat:one) — just restart
      const audio = audioRef.current;
      if (audio) {
        const requestId = ++loadRequestRef.current;
        audio.currentTime = 0;
        if (usePlayerStore.getState().isPlaying) {
          audio.play().then(() => {
            if (requestId !== loadRequestRef.current) return;
            startRaf();
            recordPlay(currentTrackId);
          }).catch(() => {});
        }
      }
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;

    // Clean up previous track blob URL
    if (prevBlobUrlRef.current) {
      releaseUrl(prevBlobUrlRef.current.id);
      prevBlobUrlRef.current = null;
    }

    prevTrackIdRef.current = currentTrackId;
    audio.onloadedmetadata = null;
    audio.onended = null;
    audio.onerror = null;
    audio.pause();
    stopRaf();

    const requestId = ++loadRequestRef.current;

    (async () => {
      try {
        const track = useLibraryStore.getState().tracks.find((t) => t.id === currentTrackId);
        if (track?.source === 'online') {
          if (!track.onlineId) throw new Error('Online track is missing a stream id.');
          audio.src = getStreamUrl(track.onlineId);
        } else {
          const blob = await getTrackBlob(currentTrackId);
          if (requestId !== loadRequestRef.current) return;
          if (!blob) throw new Error('Blob not found in IndexedDB');

          const url = acquireUrl(currentTrackId, blob);
          prevBlobUrlRef.current = { id: currentTrackId };
          audio.src = url;
        }
        if (requestId !== loadRequestRef.current) return;
        audio.load();

        audio.onloadedmetadata = () => {
          if (requestId !== loadRequestRef.current) return;
          setDuration(audio.duration || 0);
        };

        audio.onended = () => {
          if (requestId !== loadRequestRef.current) return;
          stopRaf();
          nextTrack();
        };

        audio.onerror = () => {
          if (requestId !== loadRequestRef.current) return;
          stopRaf();
          setError(track?.source === 'online'
            ? 'Online playback error. Check the local music API and yt-dlp.'
            : 'Playback error. File may be corrupted.');
        };

        if (usePlayerStore.getState().isPlaying) {
          await audio.play();
          if (requestId !== loadRequestRef.current) return;
          startRaf();
          recordPlay(currentTrackId);
        }
      } catch (err) {
        if (requestId !== loadRequestRef.current) return;
        console.error('[AudioEngine] Load error:', err);
        setError(err.message || 'Failed to load track.');
      }
    })();
  }, [currentTrackId, playbackNonce]);

  // ── Sync play/pause ───────────────────────────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrackId) return;
    if (isPlaying) {
      audio.play().then(startRaf).catch(() => {});
    } else {
      audio.pause();
      stopRaf();
    }
  }, [isPlaying]);

  // ── Sync volume / mute ────────────────────────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // ── Exposed controls ──────────────────────────────────────────────────────
  const seek = useCallback((pct) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    audio.currentTime = (pct / 100) * audio.duration;
  }, []);

  const seekSeconds = useCallback((delta) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(audio.duration || 0, audio.currentTime + delta));
  }, []);

  return { audioRef, seek, seekSeconds };
}
