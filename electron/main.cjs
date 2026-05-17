'use strict';

const { app, BrowserWindow, shell, Menu, dialog } = require('electron');
const path = require('path');
const fs   = require('fs');
const { fork } = require('child_process');

// ── RAM optimisations (must be called before app is ready) ───────────────────

app.commandLine.appendSwitch('js-flags', '--max-old-space-size=256');

app.commandLine.appendSwitch('disable-features', [
  'Translate',
  'HardwareMediaKeyHandling',
  'MediaSessionService',
  'AutofillServerCommunication',
  'BackgroundSync',
  'CalculateNativeWinOcclusion',
  'InterestCohortAPI',
].join(','));

app.commandLine.appendSwitch('disable-background-networking');
app.commandLine.appendSwitch('disable-sync');
app.commandLine.appendSwitch('no-first-run');
app.commandLine.appendSwitch('disable-default-apps');

// ── Dev / prod ────────────────────────────────────────────────────────────────

const isDev = !app.isPackaged;
let apiProcess = null;

function getDevUrl() {
  return process.env.ELECTRON_START_URL || 'http://localhost:5173';
}

// ── Window ────────────────────────────────────────────────────────────────────

function createWindow() {
  const iconPath = path.join(__dirname, '../build/icon.png');

  const win = new BrowserWindow({
    width:     1280,
    height:    780,
    minWidth:  860,
    minHeight: 560,
    title:     'Jigglypuff',
    backgroundColor: '#0d0d12',
    icon:      fs.existsSync(iconPath) ? iconPath : undefined,
    autoHideMenuBar: true,
    // Start hidden — show once ready (or after timeout fallback)
    show: false,
    webPreferences: {
      preload:              path.join(__dirname, 'preload.cjs'),
      contextIsolation:     true,
      nodeIntegration:      false,
      webSecurity:          true,
      spellcheck:           false,
      backgroundThrottling: true,
    },
  });

  Menu.setApplicationMenu(null);

  // ── Show window reliably ──────────────────────────────────────────────────
  // ready-to-show fires when the renderer has painted its first frame.
  // Fallback: force-show after 4 s in case the event never fires.
  let shown = false;
  const forceShow = setTimeout(() => {
    if (!shown) { shown = true; win.show(); }
  }, 4000);

  win.once('ready-to-show', () => {
    clearTimeout(forceShow);
    if (!shown) { shown = true; win.show(); }
    if (isDev) win.webContents.openDevTools({ mode: 'detach' });
  });

  // ── Load URL / file ───────────────────────────────────────────────────────
  if (isDev) {
    const url = getDevUrl();
    console.log('[Electron] Loading dev URL:', url);
    win.loadURL(url).catch((err) => {
      console.error('[Electron] loadURL failed:', err.message);
      // Show window anyway so user sees the error
      if (!shown) { shown = true; win.show(); }
    });
  } else {
    const filePath = path.join(__dirname, '../dist/index.html');
    win.loadFile(filePath).catch((err) => {
      console.error('[Electron] loadFile failed:', err.message);
      dialog.showErrorBox('Load Error', `Could not load app:\n${err.message}`);
    });
  }

  // External links → OS browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Log renderer-process crashes
  win.webContents.on('render-process-gone', (_, details) => {
    console.error('[Electron] Renderer crashed:', details);
  });

  win.webContents.on('did-fail-load', (_, code, desc, url) => {
    console.error(`[Electron] Page load failed (${code}): ${desc} — ${url}`);
    if (!shown) { shown = true; win.show(); }
  });
}

function startApiServer() {
  if (apiProcess) return;
  const serverPath = path.join(__dirname, '../backend/server.cjs');
  if (!fs.existsSync(serverPath)) return;

  apiProcess = fork(serverPath, [], {
    env: { ...process.env, JIGGLYPUFF_API_PORT: process.env.JIGGLYPUFF_API_PORT || '3939' },
    stdio: isDev ? 'inherit' : 'ignore',
  });

  apiProcess.on('exit', () => {
    apiProcess = null;
  });
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────

app.whenReady().then(() => {
  if (!isDev) startApiServer();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => app.quit());

app.on('before-quit', () => {
  if (apiProcess) {
    apiProcess.kill();
    apiProcess = null;
  }
});
