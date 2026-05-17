const API_BASE = import.meta.env.VITE_JIGGLYPUFF_API_BASE || 'http://127.0.0.1:3939';

export function getStreamUrl(onlineId) {
  return `${API_BASE}/stream/${encodeURIComponent(onlineId)}`;
}

export async function searchOnlineTracks(query, { signal } = {}) {
  const q = query.trim();
  if (!q) return [];

  const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(q)}`, { signal });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Online search failed.');
  }

  const body = await res.json();
  return (body.tracks || []).map((track) => ({
    id: `yt_${track.id}`,
    onlineId: track.id,
    title: track.title,
    artist: track.artist,
    album: 'Online',
    duration: track.duration || 0,
    mimeType: 'audio/online',
    filename: `${track.title}.youtube`,
    hasCover: !!track.thumbnailUrl,
    thumbnailUrl: track.thumbnailUrl,
    source: 'online',
    addedAt: Date.now(),
  }));
}
