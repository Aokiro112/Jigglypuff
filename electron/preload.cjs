'use strict';

/**
 * preload.cjs — runs in the renderer process before the page loads.
 * contextIsolation is ON, so we use contextBridge to safely expose
 * any Electron/Node APIs we need in the React app.
 *
 * Jigglypuff only uses browser-native APIs (IndexedDB, File API, Web Audio)
 * so this preload is intentionally minimal — keeping memory usage low.
 */
const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electronBridge', {
  /** The OS platform (useful for platform-specific UI hints). */
  platform: process.platform,
  /** App version from package.json */
  version: process.env.npm_package_version || '',
});
