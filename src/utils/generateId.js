/**
 * generateId.js — Generates a unique string ID for tracks/playlists.
 */

let counter = 0;

/**
 * Generates a collision-resistant unique ID combining timestamp + random + counter.
 * @returns {string}
 */
export function generateId() {
  counter = (counter + 1) % 1_000_000;
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}_${counter}`;
}
