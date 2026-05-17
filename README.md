# Jigglypuff

Jigglypuff is an offline music player built with React, Vite, Electron, Zustand, and IndexedDB. It lets you import local audio files, browse your library, create playlists, search through tracks, manage the play queue, and run the same app as either a browser-based development build or a desktop application.

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
- A dashboard with recently played tracks and new additions.
- A library view with imported tracks, metadata, duration, and quick actions.
- Playlist creation, playlist detail pages, playlist playback, and track removal.
- Search for tracks, artists, and albums.
- Queue panel for upcoming tracks.
- Player controls for play, pause, next, previous, shuffle, repeat, seek, and volume.
- Local data persistence using IndexedDB.
- Desktop app support through Electron.

## Tech Stack

- React 19
- Vite 8
- Electron 42
- Zustand
- IndexedDB through `idb`
- `music-metadata`
- CSS Modules
- ESLint
- Electron Builder

## Project Structure

```text
Jigglypuff/
  electron/              Electron main and preload scripts
  public/                Static public assets
  src/
    assets/              App images and visual assets
    components/          Reusable UI components
    hooks/               Audio engine, keyboard shortcuts, drag-and-drop
    services/            IndexedDB, metadata parsing, blob URL cache
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

Run the Vite development server:

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

This starts the Vite dev server and opens the Electron desktop window.

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
| `npm run electron:dev` | Runs the app in Electron development mode |
| `npm run build` | Creates a production frontend build |
| `npm run preview` | Serves the production build locally |
| `npm run lint` | Runs ESLint checks |
| `npm run dist` | Builds the Windows desktop installer/package |

## How To Use

1. Start the app in browser mode or Electron mode.
2. Click `Import` and select your audio files.
3. Open `Library` to view imported tracks.
4. Use the sidebar to move between Dashboard, Library, Playlists, Queue, and Settings.
5. Create playlists from the Playlists section.
6. Add tracks to playlists from the library or playlist flow.
7. Use the bottom player bar to control playback.

## Data Storage

Jigglypuff stores imported music data locally using IndexedDB. This means the app can work offline after files are imported, and your library data stays on the same device/browser profile unless manually cleared.

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

### Electron opens but the app is blank

Make sure the Vite dev server is running, then start Electron again:

```bash
npm run electron:dev
```

### Imported music does not appear

Check that the selected files are valid audio files and that browser storage is not full. The app stores imported files locally, so storage quota can affect imports.

## Notes

- The app is designed for local/offline playback.
- Music metadata depends on the source file.
- The Electron build configuration currently targets Windows.
- The project is private by default.

## License

Private project.
