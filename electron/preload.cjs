'use strict';

/**
 * preload.cjs — runs in the renderer process before the page loads.
 * contextIsolation is ON, so we use contextBridge to safely expose
 * any Electron/Node APIs we need in the React app.
 *
 * Jigglypuff only uses browser-native APIs (IndexedDB, File API, Web Audio)
 * so this preload is intentionally minimal — keeping memory usage low.
 */
const { contextBridge, ipcRenderer } = require('electron');

function invokeSilently(channel, payload) {
  return ipcRenderer.invoke(channel, payload).catch(() => ({ ok: false }));
}

contextBridge.exposeInMainWorld('electronBridge', {
  /** The OS platform (useful for platform-specific UI hints). */
  platform: process.platform,
  /** App version from package.json */
  version: process.env.npm_package_version || '',
  /** Discord Rich Presence bridge. No-ops cleanly when Discord is not available. */
  discordRpc: {
    update: (presence) => invokeSilently('discord-rpc:update', presence),
    clear: () => invokeSilently('discord-rpc:clear'),
  },
});
