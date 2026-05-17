/**
 * useKeyboardShortcuts.js — Global keyboard shortcut handler.
 * Registered once at App level. Does not cause any re-renders.
 */
import { useEffect } from 'react';
import usePlayerStore from '../store/playerStore';
import useUiStore from '../store/uiStore';

/**
 * @param {{ seekSeconds: (delta: number) => void }} param
 */
export function useKeyboardShortcuts({ seekSeconds }) {
  useEffect(() => {
    const handler = (e) => {
      // Ignore shortcuts when typing in inputs/textareas
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      const { isPlaying, setPlaying, setVolume, toggleMute, toggleShuffle,
              cycleRepeat, nextTrack, prevTrack, volume } = usePlayerStore.getState();
      const { toggleMiniPlayer, openImportModal } = useUiStore.getState();

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          setPlaying(!isPlaying);
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (e.shiftKey) nextTrack();
          else seekSeconds(5);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (e.shiftKey) prevTrack();
          else seekSeconds(-5);
          break;
        case 'ArrowUp':
          if (e.altKey) { e.preventDefault(); setVolume(Math.min(1, volume + 0.1)); }
          break;
        case 'ArrowDown':
          if (e.altKey) { e.preventDefault(); setVolume(Math.max(0, volume - 0.1)); }
          break;
        case 'KeyM':
          if (e.ctrlKey || e.metaKey) { e.preventDefault(); toggleMiniPlayer(); }
          else toggleMute();
          break;
        case 'KeyS':
          if (!e.ctrlKey && !e.metaKey) toggleShuffle();
          break;
        case 'KeyR':
          if (!e.ctrlKey && !e.metaKey) cycleRepeat();
          break;
        case 'KeyO':
          if (e.ctrlKey || e.metaKey) { e.preventDefault(); openImportModal(); }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [seekSeconds]);
}
