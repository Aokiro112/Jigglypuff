# Jigglypuff

Jigglypuff is an offline-first and online-capable music player built with React, Vite, Electron, Zustand, IndexedDB, and a small local Node.js music API. It lets you import local audio files, search songs online, instantly stream them, save online songs into your local library, create playlists, manage the play queue, and run the same app as either a browser-based development build or a desktop application.

## Screenshots

> Save the screenshots as the following files to render them in this README:
>
> - `docs/screenshots/dashboard.png`
> - `docs/screenshots/library.png`
> - `docs/screenshots/playlist-detail.png`

| Dashboard | Library | Playlist Detail |
| --- | --- | --- |
| ![Dashboard screen](docs/screenshots/dashboard.png) | ![Library screen](docs/screenshots/library.png) | ![Playlist detail screen](docs/screenshots/playlist-detail.png) |

## What This Project Includes

- Offline-first music playback for local files.
- Import support for MP3, MP4, M4A, and related audio formats.
- Online song search through a local backend powered by `yt-search`.
- Online streaming through a local `/stream/:id` endpoint powered by `yt-dlp`.
- Add online songs permanently to the local library as lightweight metadata.
- Unified local + online library, queue, playlists, recently played, and favorites.
- A dashboard with recently played tracks and new additions.
- A library view with imported tracks, metadata, duration, and quick actions.
- Playlist creation, playlist detail pages, playlist playback, and track removal.
- Search for local tracks, artists, albums, and online results.
- Queue panel for upcoming tracks.
- Player controls for play, pause, next, previous, shuffle, repeat, seek, and volume.
- Discord Rich Presence support for the Electron desktop app.
- Local data persistence using IndexedDB and localStorage-backed player state.
- Desktop app support through Electron.
- No ads, no popup ads, no banner ads, no sponsored content, and no tracking-based monetization UI.

## Tech Stack

- React 19
- Vite 8
- Electron 42
- Zustand
- IndexedDB through `idb`
- `music-metadata`
- `yt-search`
- `yt-dlp-exec`
- `discord-rpc`
- CSS Modules
- ESLint
- Electron Builder

## Project Structure

```text
Jigglypuff/
  backend/               Local music API for online search and streaming
  electron/              Electron main and preload scripts
  public/                Static public assets
  src/
    assets/              App images and visual assets
    components/          Reusable UI components
    hooks/               Audio engine, keyboard shortcuts, drag-and-drop
    services/            IndexedDB, online music API client, metadata parsing, blob URL cache
    store/               Zustand stores for UI, player, and library state
    styles/              Global styles, variables, and animations
    views/               Main screens such as Dashboard, Library, Playlists
  package.json           Scripts, dependencies, and desktop build config
  vite.config.js         Vite configuration
```

## Requirements

Install these before running the project:

- Node.js
- npm

Check that both are available:

```bash
node -v
npm -v
```

## Installation

Install project dependencies:

```bash
npm install
```

## Start In Browser

Run the local music API:

```bash
npm run server
```

In another terminal, run the Vite development server:

```bash
npm run dev
```

Open the app at:

```text
http://localhost:5173
```

This mode is best for quick frontend development and UI testing.

## Start As Desktop App

Run the app through Electron:

```bash
npm run electron:dev
```

This starts the local music API, the Vite dev server, and the Electron desktop window together.

Discord Rich Presence is enabled when the Electron process has a Discord application client ID:

```bash
JIGGLYPUFF_DISCORD_CLIENT_ID=1505643997404856410 npm run electron:dev
```

In PowerShell:

```powershell
$env:JIGGLYPUFF_DISCORD_CLIENT_ID="1505643997404856410"; npm run electron:dev
```

Optional Discord asset and button settings:

| Variable | Description |
| --- | --- |
| `JIGGLYPUFF_DISCORD_OPEN_URL` | HTTPS URL for the "Open Jigglypuff" activity button |
| `JIGGLYPUFF_DISCORD_LARGE_IMAGE_KEY` | Discord developer portal asset key for the main logo, defaults to `jigglypuff_logo` |
| `JIGGLYPUFF_DISCORD_SMALL_PLAYING_IMAGE_KEY` | Asset key for the playing indicator, defaults to `playing` |
| `JIGGLYPUFF_DISCORD_SMALL_PAUSED_IMAGE_KEY` | Asset key for the paused indicator, defaults to `paused` |

The local music API runs at:

```text
http://127.0.0.1:3939
```

Available API routes:

| Route | Description |
| --- | --- |
| `GET /search?q=<query>` | Searches online songs |
| `GET /stream/:id` | Resolves an online song to a playable stream |

## Build The App

Create a production web build:

```bash
npm run build
```

The generated output is placed in:

```text
dist/
```

## Preview Production Build

After building, preview the production output locally:

```bash
npm run preview
```

## Create Windows Installer

Build a Windows desktop installer/package:

```bash
npm run dist
```

The packaged output is generated in:

```text
release/
```

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Starts the Vite development server |
| `npm run server` | Starts the local online music API |
| `npm run electron:dev` | Runs the local API, Vite, and Electron together |
| `npm run build` | Creates a production frontend build |
| `npm run preview` | Serves the production build locally |
| `npm run lint` | Runs ESLint checks |
| `npm run dist` | Builds the Windows desktop installer/package |

## How To Use

1. Start the app in browser mode or Electron mode.
2. Click `Import` and select your audio files.
3. Open `Library` to view imported tracks.
4. Use the top search bar to search your local library.
5. Open the `Online` tab on the Search page to find online songs.
6. Click Play to stream an online result instantly.
7. Click Add to save an online result into your local library.
8. Use local and online songs together in the queue, playlists, recently played, and favorites.
9. Use the bottom player bar to control playback.

## Data Storage

Jigglypuff stores imported local music files in IndexedDB. Online songs are saved as lightweight metadata records in the same library, while playback streams are resolved on demand through the local backend. Queue preferences and player state are persisted locally too.

Local/imported songs work offline after import. Online songs need internet access when streamed.

## Troubleshooting

### PowerShell blocks `npm`

On Windows, PowerShell may block `npm.ps1` because of execution policy settings. Use `npm.cmd` instead:

```bash
npm.cmd run dev
npm.cmd run electron:dev
```

### Port 5173 is already in use

Run Vite on another port:

```bash
npm run dev -- --port 5174
```

### Port 3939 is already in use

The local music API is already running. Stop the process using that port, then start again:

```powershell
Get-NetTCPConnection -LocalPort 3939 | Select-Object OwningProcess
Stop-Process -Id <OwningProcess> -Force
npm run electron:dev
```

### Online search works but playback fails

Make sure the local music API is running:

```bash
npm run server
```

Jigglypuff includes a bundled `yt-dlp` binary through `yt-dlp-exec`. If you want to use your own `yt-dlp`, set `YT_DLP_PATH` before starting the app.

### Electron opens but the app is blank

Make sure the Vite dev server is running, then start Electron again:

```bash
npm run electron:dev
```

### Imported music does not appear

Check that the selected files are valid audio files and that browser storage is not full. The app stores imported files locally, so storage quota can affect imports.

## Notes

- The app is designed for offline-first local playback with optional online search and streaming.
- Music metadata depends on the source file.
- Online song availability depends on the source platform and network access.
- The Electron build configuration currently targets Windows.
- The project is private by default.

## License

Private project.
