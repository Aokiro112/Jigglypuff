import usePlayerStore from '../store/playerStore';
import useLibraryStore from '../store/libraryStore';

const SYNC_INTERVAL_MS = 15_000;

function getBridge() {
  return window.electronBridge?.discordRpc ?? null;
}

function pickTrack(tracks, currentTrackId) {
  if (!currentTrackId) return null;
  return tracks.find((track) => track.id === currentTrackId) ?? null;
}

function getElapsed(audioRef) {
  const currentTime = audioRef?.current?.currentTime;
  return Number.isFinite(currentTime) && currentTime > 0 ? currentTime : 0;
}

function publishPresence(audioRef) {
  const bridge = getBridge();
  if (!bridge) return;

  const player = usePlayerStore.getState();
  const library = useLibraryStore.getState();
  const track = pickTrack(library.tracks, player.currentTrackId);

  if (!track) {
    bridge.clear();
    return;
  }

  bridge.update({
    track: {
      id: track.id,
      title: track.title,
      artist: track.artist,
      album: track.album,
      duration: track.duration,
      thumbnailUrl: track.thumbnailUrl,
      rpcImageKey: track.rpcImageKey,
    },
    isPlaying: player.isPlaying,
    elapsed: getElapsed(audioRef),
    duration: player.duration || track.duration || 0,
  });
}

export function startDiscordPresenceSync(audioRef) {
  const bridge = getBridge();
  if (!bridge) return () => {};

  let timeoutId = null;
  let intervalId = null;

  const schedulePublish = () => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      timeoutId = null;
      publishPresence(audioRef);
    }, 250);
  };

  const unsubscribePlayer = usePlayerStore.subscribe((state, previous) => {
    if (
      state.currentTrackId !== previous.currentTrackId ||
      state.isPlaying !== previous.isPlaying ||
      state.duration !== previous.duration
    ) {
      schedulePublish();
    }
  });

  const unsubscribeLibrary = useLibraryStore.subscribe((state, previous) => {
    if (state.tracks !== previous.tracks) schedulePublish();
  });

  const handleUnload = () => bridge.clear();

  window.addEventListener('beforeunload', handleUnload);
  intervalId = window.setInterval(() => publishPresence(audioRef), SYNC_INTERVAL_MS);
  schedulePublish();

  return () => {
    if (timeoutId) clearTimeout(timeoutId);
    if (intervalId) window.clearInterval(intervalId);
    unsubscribePlayer();
    unsubscribeLibrary();
    window.removeEventListener('beforeunload', handleUnload);
    bridge.clear();
  };
}
