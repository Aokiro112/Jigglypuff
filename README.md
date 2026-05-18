<div align="center">
  <img src="build/icon.png" alt="Jigglypuff Logo" width="150" />
  <h1>Jigglypuff</h1>
  <p><strong>A blazingly fast, offline-first & online-capable desktop music player built with Electron and React.</strong></p>

  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
  [![Electron](https://img.shields.io/badge/Electron-42-lightgray.svg)](https://www.electronjs.org/)
  [![Vite](https://img.shields.io/badge/Vite-8-purple.svg)](https://vitejs.dev/)
  [![Zustand](https://img.shields.io/badge/State-Zustand-orange.svg)](https://github.com/pmndrs/zustand)
</div>

---

## 📖 Introduction

**Jigglypuff** is a lightweight, hybrid music player designed for users who want total control over their local music library while seamlessly accessing the infinite catalog of online music. Built heavily on modern web technologies and wrapped in an optimized Electron shell, it provides an ad-free, tracking-free, and blazing-fast listening experience. 

Whether you're organizing gigabytes of local MP3s, streaming directly from YouTube, or crafting the perfect playlist bridging both worlds, Jigglypuff handles it elegantly.

## ✨ Features

- 🎧 **Offline-First Local Playback**: Import MP3, MP4, M4A, and other formats directly to your local IndexedDB storage.
- 🌍 **Online Search & Streaming**: Built-in backend utilizing `yt-search` and `yt-dlp` to search and stream tracks instantly.
- 💾 **Hybrid Library Management**: Save online streams permanently as lightweight metadata alongside your local tracks.
- 📜 **Advanced Playlists & Queue**: Seamlessly mix online and local tracks into unified playlists.
- 🎨 **Modern Neo-Brutalist / Dark UI**: Pixel-perfect UI with customizable CSS modules.
- 🎮 **Discord Rich Presence**: Show off what you're listening to directly on your Discord profile.
- 🚀 **Performance Optimized**: Lazy-loading, low-RAM Electron flags, and object-URL ref counting for minimal footprint.
- 🚫 **Zero Bloat**: No ads, no tracking, no unnecessary background services.

## 🛠 Tech Stack

### Frontend
- **Framework:** React 19
- **Build Tool:** Vite 8
- **State Management:** Zustand
- **Styling:** CSS Modules (Vanilla CSS with variables)
- **Local Database:** IndexedDB (via `idb`)
- **Metadata Parsing:** `music-metadata`

### Backend / Desktop
- **Desktop Runtime:** Electron 42
- **Backend API:** Node.js (Local Server on port 3939)
- **Media Streaming:** `yt-dlp-exec`, `yt-search`
- **Integrations:** `discord-rpc`
- **Packager:** Electron Builder

## 📐 Architecture Overview

Jigglypuff relies on a **three-tier architecture** designed to run entirely on the user's local machine:

1. **Frontend (React + Vite)**: The renderer process handles the UI, player state (Zustand), and interactions. It interacts directly with IndexedDB for storing local music file blobs and metadata.
2. **Local API (Node.js)**: A lightweight HTTP server spawned by Electron (or manually in dev). It proxies search requests to YouTube via `yt-search` and streams audio data via `yt-dlp`. 
3. **Electron Main Process**: Manages window lifecycle, applies heavy RAM optimization flags, intercepts system events, and orchestrates Discord Rich Presence. 

## 📂 Folder Structure

```text
Jigglypuff/
├── backend/               # Local Node.js API (Search & Stream endpoints)
├── build/                 # Icons and app assets for the installer
├── electron/              # Electron Main process, Preload scripts, Discord RPC
├── public/                # Static public assets served by Vite
├── release/               # Output directory for the packaged .exe installer
├── src/
│   ├── assets/            # App images and visual assets
│   ├── components/        # Reusable UI elements (TrackCard, PlayerBar, etc.)
│   ├── hooks/             # Custom React hooks (Audio Engine, Shortcuts, DND)
│   ├── services/          # Services (IndexedDB wrapper, API clients, Blob Cache)
│   ├── store/             # Zustand stores (UI, Player, Library state)
│   ├── styles/            # Global CSS, variables, resets, and animations
│   ├── utils/             # Helper functions (Formatting, ID generation)
│   └── views/             # Main screens (Dashboard, Library, Playlists, Search)
├── package.json           # Scripts, dependencies, and build config
└── vite.config.js         # Vite configuration & chunk splitting
```

## 🚀 Setup Instructions

This guide is designed for absolute beginners. Follow these steps to get Jigglypuff running on your local machine.

### Prerequisites

You need the following software installed on your machine:
- **Node.js** (v18 or higher recommended) - [Download Here](https://nodejs.org/)
- **Git** - [Download Here](https://git-scm.com/)
- **yt-dlp** (Optional but recommended for system PATH) - Used for streaming online media. The app bundles `yt-dlp-exec`, but having it globally installed is safer.

### 1. Clone the Repository

Open your terminal or command prompt and run:
```bash
git clone https://github.com/your-username/Jigglypuff.git
cd Jigglypuff
```

### 2. Install Dependencies

Install all required packages via npm:
```bash
npm install
```
*(Note: If you are using Windows PowerShell and get an Execution Policy error, run `npm.cmd install` instead.)*

### 3. Local Development (Browser Mode)

If you only want to work on the UI without Electron, you need two terminals.

**Terminal 1: Start the Local API**
```bash
npm run server
```
*This starts the backend at `http://127.0.0.1:3939`.*

**Terminal 2: Start Vite Dev Server**
```bash
npm run dev
```
*Open `http://localhost:5173` in your browser.*

### 4. Start as Desktop App (Electron Mode)

To run the full desktop experience (API + Frontend + Electron) simultaneously:
```bash
npm run electron:dev
```
*This command uses `concurrently` to boot the Vite server, the local API, and the Electron window.*

### 5. Build for Production

To create an optimized production build of the React frontend:
```bash
npm run build
```

### 6. Create a Windows Installer (.exe)

To package the entire app into a distributable installer:
```bash
npm run dist
```
*The `.exe` file will be generated inside the `release/` directory.*

## ⚙️ Environment Variables & Configuration

Create a `.env` file or pass these via terminal to customize the application:

| Variable | Default | Description |
| --- | --- | --- |
| `JIGGLYPUFF_API_HOST` | `127.0.0.1` | The host for the local Node API. |
| `JIGGLYPUFF_API_PORT` | `3939` | The port for the local Node API. |
| `ELECTRON_START_URL` | `http://localhost:5173` | The URL Electron loads in dev mode. |
| `YT_DLP_PATH` | (bundled) | Path to a custom `yt-dlp` executable if needed. |
| `JIGGLYPUFF_DISCORD_CLIENT_ID` | `1505643997404856410` | Your Discord Application Client ID. |

**PowerShell Example (Setting Discord ID):**
```powershell
$env:JIGGLYPUFF_DISCORD_CLIENT_ID="your_client_id"; npm run electron:dev
```

## 🔌 API / Service Explanation

The local backend (`backend/server.cjs`) serves two primary routes required by the frontend for online capabilities:

- `GET /search?q=<query>`
  - Uses `yt-search` to scrape YouTube.
  - Returns top 12 results normalized for the frontend UI.
- `GET /stream/:id`
  - Uses `yt-dlp` to resolve a YouTube Video ID into a direct audio stream URL.
  - Issues an HTTP 302 Redirect directly to the highest quality audio stream.

## 🖼 Screenshots

*(Placeholders - replace with actual images in `docs/screenshots/`)*

<details>
<summary>Click to view screenshots</summary>

| Dashboard | Library | Playlist Detail |
| :---: | :---: | :---: |
| ![Dashboard](docs/screenshots/dashboard.png) | ![Library](docs/screenshots/library.png) | ![Playlist](docs/screenshots/playlist-detail.png) |

</details>

## 🔧 Troubleshooting

Here are common issues you might face and how to fix them.

<details>
<summary><b>1. Port 5173 or 3939 is already in use</b></summary>
<br/>

**Why it happens:** Another application (or an old crashed instance of Jigglypuff) is using the required ports.
**How to fix:**
Kill the process using the port.
In PowerShell:
```powershell
Get-NetTCPConnection -LocalPort 3939 | Select-Object OwningProcess
Stop-Process -Id <OwningProcess> -Force
```
Alternatively, change Vite's port: `npm run dev -- --port 5174`

</details>

<details>
<summary><b>2. "pnpm / npm / vite is not recognized as an internal or external command"</b></summary>
<br/>

**Why it happens:** Node.js isn't installed properly, or the npm `bin` folder isn't in your system's PATH. On Windows PowerShell, script execution might be disabled.
**How to fix:**
Reinstall Node.js and ensure "Add to PATH" is checked. 
If PowerShell blocks execution, explicitly use the `.cmd` extension:
```bash
npm.cmd run dev
```
</details>

<details>
<summary><b>3. Online search works, but playback fails (Stream 500 Error)</b></summary>
<br/>

**Why it happens:** The bundled `yt-dlp-exec` binary might be outdated or blocked by your OS/Antivirus, preventing YouTube from being resolved.
**How to fix:**
1. Update `yt-dlp-exec` in `package.json` and run `npm install`.
2. Alternatively, install Python and `yt-dlp` globally via your system package manager, then set the environment variable to point to it:
```bash
set YT_DLP_PATH=C:\path\to\your\yt-dlp.exe
npm run electron:dev
```
</details>

<details>
<summary><b>4. Electron window opens but stays completely blank or white</b></summary>
<br/>

**Why it happens:** The Vite development server hasn't finished compiling the frontend before Electron tries to load it, or there is a fatal React crash on mount.
**How to fix:**
Wait a few seconds for Vite to compile. Press `Ctrl + R` (or `Cmd + R`) to refresh the Electron window. To see what caused the crash, open DevTools using `Ctrl + Shift + I` (or `Cmd + Option + I`).
</details>

<details>
<summary><b>5. Imported music does not appear (IndexedDB Quota Exceeded)</b></summary>
<br/>

**Why it happens:** Browsers (and Electron) strictly limit how much data IndexedDB can hold. If you import gigabytes of MP3 files, the storage quota will be maxed out.
**How to fix:**
Clear your library via the Settings page. For massive libraries, consider hosting files on a local file server instead of importing them directly as Blobs into IndexedDB.
</details>

<details>
<summary><b>6. Discord Rich Presence isn't showing up</b></summary>
<br/>

**Why it happens:** Discord might not be running, or your `JIGGLYPUFF_DISCORD_CLIENT_ID` is invalid/missing.
**How to fix:**
Ensure the Discord desktop app is running in the background. Pass the Client ID correctly:
```bash
set JIGGLYPUFF_DISCORD_CLIENT_ID=your_id_here
npm run electron:dev
```
</details>

## 💡 Suggested Improvements

While Jigglypuff is functional, here are some recommended upgrades for future contributors:
- **Better Storage Engine**: Moving away from IndexedDB for local MP3 blobs to direct File System access using Electron's `fs` module to bypass storage limits.
- **Security Enhancements**: Enable `contextIsolation` strictly and avoid passing `ELECTRON_START_URL` directly in production builds. Ensure all inputs to `yt-dlp` are aggressively sanitized to prevent RCE (Remote Code Execution).
- **Testing**: Implement unit testing using Vitest or Jest, and end-to-end testing via Playwright/Cypress.
- **Cross-Platform Compatibility**: Update the `electron-builder` configuration in `package.json` to build for macOS (`.dmg`) and Linux (`.AppImage`).

## 🤝 Contribution Guidelines

Contributions, issues, and feature requests are welcome!
1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

Please ensure you run `npm run lint` before opening a pull request.

## 📄 License

This project is licensed under the **MIT License**. See the `LICENSE` file for details.

## 👏 Credits

- UI Inspiration from Neo-Brutalist design systems.
- Powered by the incredible [yt-dlp](https://github.com/yt-dlp/yt-dlp).
- Built with ❤️ using React & Electron.
