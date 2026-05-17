/**
 * metadataParser.js — Extracts ID3/MP4 tags from a File object.
 * Strategy:
 *   1. Try music-metadata parseBlob() for full tag data + cover art.
 *   2. If that fails or returns empty fields → fall back to filename parsing.
 *   3. If duration is still 0 → measure via a transient <audio> element.
 */
import { parseBlob } from 'music-metadata';
import { generateId } from '../utils/generateId';

// ---------------------------------------------------------------------------
// Filename fallback parser
// ---------------------------------------------------------------------------

/**
 * Extracts title/artist from common filename patterns:
 *   "Artist - Title.mp3"
 *   "01 - Title.mp3" or "01. Title.mp3"
 *   "Title.mp3"
 */
function parseFilename(filename) {
  const name = filename.replace(/\.[^.]+$/, '').trim();

  // Pattern: "Something - Something Else"
  const dashMatch = name.match(/^(.+?)\s+-\s+(.+)$/);
  if (dashMatch) {
    const [, left, right] = dashMatch;
    // If left side starts with a number it's likely a track number
    if (/^\d+$/.test(left.trim())) {
      return { title: right.trim(), artist: 'Unknown Artist' };
    }
    return { artist: left.trim(), title: right.trim() };
  }

  // Pattern: "01 Title" or "01. Title"
  const numMatch = name.match(/^\d+\.?\s+(.+)$/);
  if (numMatch) {
    return { title: numMatch[1].trim(), artist: 'Unknown Artist' };
  }

  return { title: name, artist: 'Unknown Artist' };
}

// ---------------------------------------------------------------------------
// Duration via transient audio element (fallback)
// ---------------------------------------------------------------------------

function getDurationViaAudio(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const el = document.createElement('audio');
    el.preload = 'metadata';
    const cleanup = () => {
      URL.revokeObjectURL(url);
      el.src = '';
    };
    el.onloadedmetadata = () => { cleanup(); resolve(isFinite(el.duration) ? el.duration : 0); };
    el.onerror = () => { cleanup(); resolve(0); };
    el.src = url;
  });
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Parses metadata from a File object.
 * Returns a plain metadata object (no blob — caller attaches file separately).
 *
 * @param {File} file
 * @returns {Promise<{
 *   id: string,
 *   title: string,
 *   artist: string,
 *   album: string|null,
 *   year: number|null,
 *   trackNo: number|null,
 *   duration: number,
 *   mimeType: string,
 *   filename: string,
 *   coverBlob: Blob|null,
 *   addedAt: number,
 * }>}
 */
export async function parseTrackMetadata(file) {
  const id = generateId();
  const mimeType = file.type || (file.name.endsWith('.mp3') ? 'audio/mpeg' : 'video/mp4');
  const filename = file.name;

  let title = null;
  let artist = null;
  let album = null;
  let year = null;
  let trackNo = null;
  let duration = 0;
  let coverBlob = null;

  // --- Step 1: music-metadata ---
  try {
    const parsed = await parseBlob(file, {
      skipCovers: false,
      duration: true,     // always attempt duration extraction
      skipPostHeaders: false,
    });
    const { common, format } = parsed;

    title = common.title || null;
    artist = common.artist || common.albumartist || null;
    album = common.album || null;
    year = common.year || null;
    trackNo = common.track?.no || null;
    duration = format.duration || 0;

    if (common.picture?.length > 0) {
      const pic = common.picture[0];
      coverBlob = new Blob([pic.data], { type: pic.format || 'image/jpeg' });
    }
  } catch (err) {
    // Non-fatal — log and continue to fallbacks
    console.warn(`[MetadataParser] music-metadata failed for "${filename}":`, err.message);
  }

  // --- Step 2: Filename fallback for missing title/artist ---
  if (!title || !artist) {
    const fallback = parseFilename(filename);
    title = title || fallback.title;
    artist = artist || fallback.artist;
  }

  // --- Step 3: Duration fallback via Audio element ---
  if (!duration || !isFinite(duration)) {
    try {
      duration = await getDurationViaAudio(file);
    } catch (_) {
      duration = 0;
    }
  }

  return {
    id,
    title,
    artist,
    album: album || null,
    year: year || null,
    trackNo: trackNo || null,
    duration,
    mimeType,
    filename,
    coverBlob,
    addedAt: Date.now(),
  };
}
