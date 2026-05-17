/**
 * start-electron.cjs
 * Waits for Vite to become available then spawns Electron.
 * Works on Windows PowerShell where `&&` inside npm scripts can be unreliable.
 */
'use strict';

const { spawn }   = require('child_process');
const http        = require('http');
const path        = require('path');

const VITE_URL    = process.env.ELECTRON_START_URL || 'http://localhost:5173';
const MAX_RETRIES = 40;   // 40 × 500 ms = 20 s max wait
const RETRY_MS    = 500;

function probe(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => { res.resume(); resolve(true); })
        .on('error', () => resolve(false));
  });
}

async function waitForVite(retries = 0) {
  const up = await probe(VITE_URL);
  if (up) return;
  if (retries >= MAX_RETRIES) {
    console.error('[start-electron] Vite did not start in time. Aborting.');
    process.exit(1);
  }
  await new Promise((r) => setTimeout(r, RETRY_MS));
  return waitForVite(retries + 1);
}

(async () => {
  console.log(`[start-electron] Waiting for ${VITE_URL} …`);
  await waitForVite();
  console.log('[start-electron] Vite is up — launching Electron.');

  // `require('electron')` returns the absolute path to the electron binary
  const electronBin = require('electron');

  const child = spawn(electronBin, ['.'], {
    stdio: 'inherit',
    env: { ...process.env, ELECTRON_START_URL: VITE_URL },
    // shell: false is safe here — electron pkg gives us the full path
  });

  child.on('exit', (code) => process.exit(code ?? 0));
})();
