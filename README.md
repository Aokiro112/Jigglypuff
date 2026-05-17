# Jigglypuff Music Player

Jigglypuff ek local-first desktop music player hai jo React, Vite, Electron, IndexedDB aur Zustand par built hai. App ka goal simple hai: apne system ke MP3, MP4 ya M4A tracks import karo, unhe library me manage karo, playlist banao, search karo, queue dekho, aur music ko desktop app jaisi feel ke saath play karo.

## Screenshots

<p>
  <img alt="Dashboard preview" width="31%" src="data:image/svg+xml;utf8,%3Csvg%20width='900'%20height='560'%20viewBox='0%200%20900%20560'%20xmlns='http://www.w3.org/2000/svg'%3E%3Crect%20width='900'%20height='560'%20fill='%2311111b'/%3E%3Crect%20x='0'%20y='0'%20width='900'%20height='54'%20fill='%23171628'/%3E%3Crect%20x='0'%20y='54'%20width='78'%20height='420'%20fill='%23131220'/%3E%3Crect%20x='0'%20y='474'%20width='900'%20height='86'%20fill='%23171628'/%3E%3Ctext%20x='116'%20y='104'%20fill='%23ffffff'%20font-family='Arial'%20font-size='34'%20font-weight='700'%3EDashboard%3C/text%3E%3Crect%20x='116'%20y='140'%20width='300'%20height='150'%20rx='12'%20fill='%23202034'%20stroke='%23ff3366'/%3E%3Ctext%20x='142'%20y='186'%20fill='%23ff6690'%20font-family='Arial'%20font-size='20'%20font-weight='700'%3ERecently%20Played%3C/text%3E%3Crect%20x='142'%20y='210'%20width='220'%20height='10'%20rx='5'%20fill='%235b5b70'/%3E%3Crect%20x='142'%20y='234'%20width='180'%20height='10'%20rx='5'%20fill='%233a3a4d'/%3E%3Crect%20x='448'%20y='140'%20width='300'%20height='150'%20rx='12'%20fill='%23202034'%20stroke='%23ff3366'/%3E%3Ctext%20x='474'%20y='186'%20fill='%23ff6690'%20font-family='Arial'%20font-size='20'%20font-weight='700'%3ELibrary%20Stats%3C/text%3E%3Ccircle%20cx='534'%20cy='238'%20r='36'%20fill='%23ff3366'/%3E%3Ccircle%20cx='626'%20cy='238'%20r='36'%20fill='%23f5c542'/%3E%3C/svg%3E" />
  <img alt="Library preview" width="31%" src="data:image/svg+xml;utf8,%3Csvg%20width='900'%20height='560'%20viewBox='0%200%20900%20560'%20xmlns='http://www.w3.org/2000/svg'%3E%3Crect%20width='900'%20height='560'%20fill='%2311111b'/%3E%3Crect%20x='0'%20y='0'%20width='900'%20height='54'%20fill='%23171628'/%3E%3Crect%20x='0'%20y='54'%20width='78'%20height='420'%20fill='%23131220'/%3E%3Crect%20x='0'%20y='474'%20width='900'%20height='86'%20fill='%23171628'/%3E%3Ctext%20x='116'%20y='104'%20fill='%23ffffff'%20font-family='Arial'%20font-size='34'%20font-weight='700'%3ELibrary%3C/text%3E%3Ctext%20x='116'%20y='142'%20fill='%239b9bb0'%20font-family='Arial'%20font-size='18'%3EImported%20tracks%20with%20sorting%20and%20playlist%20actions%3C/text%3E%3Cg%20fill='%23202034'%20stroke='%23303046'%3E%3Crect%20x='116'%20y='180'%20width='660'%20height='52'%20rx='8'/%3E%3Crect%20x='116'%20y='246'%20width='660'%20height='52'%20rx='8'/%3E%3Crect%20x='116'%20y='312'%20width='660'%20height='52'%20rx='8'/%3E%3C/g%3E%3Cg%20fill='%23ff3366'%3E%3Ccircle%20cx='148'%20cy='206'%20r='16'/%3E%3Ccircle%20cx='148'%20cy='272'%20r='16'/%3E%3Ccircle%20cx='148'%20cy='338'%20r='16'/%3E%3C/g%3E%3Cg%20fill='%23ffffff'%20font-family='Arial'%20font-size='16'%3E%3Ctext%20x='184'%20y='211'%3ETrack%20title%20and%20artist%3C/text%3E%3Ctext%20x='184'%20y='277'%3ESong%20row%20with%20album%3C/text%3E%3Ctext%20x='184'%20y='343'%3EQueue,%20delete,%20add%20to%20playlist%3C/text%3E%3C/g%3E%3C/svg%3E" />
  <img alt="Playlist preview" width="31%" src="data:image/svg+xml;utf8,%3Csvg%20width='900'%20height='560'%20viewBox='0%200%20900%20560'%20xmlns='http://www.w3.org/2000/svg'%3E%3Crect%20width='900'%20height='560'%20fill='%2311111b'/%3E%3Crect%20x='0'%20y='0'%20width='900'%20height='54'%20fill='%23171628'/%3E%3Crect%20x='0'%20y='54'%20width='78'%20height='420'%20fill='%23131220'/%3E%3Crect%20x='0'%20y='474'%20width='900'%20height='86'%20fill='%23171628'/%3E%3Ctext%20x='116'%20y='104'%20fill='%23ffffff'%20font-family='Arial'%20font-size='34'%20font-weight='700'%3EPlaylists%3C/text%3E%3Crect%20x='620'%20y='76'%20width='138'%20height='38'%20rx='8'%20fill='%23ff3366'/%3E%3Ctext%20x='646'%20y='101'%20fill='%23ffffff'%20font-family='Arial'%20font-size='15'%20font-weight='700'%3ECreate%20new%3C/text%3E%3Cg%3E%3Crect%20x='116'%20y='150'%20width='160'%20height='214'%20rx='10'%20fill='%23202034'%20stroke='%23ff3366'/%3E%3Crect%20x='136'%20y='170'%20width='120'%20height='120'%20rx='8'%20fill='%23ff3366'/%3E%3Ctext%20x='136'%20y='326'%20fill='%23ffffff'%20font-family='Arial'%20font-size='16'%20font-weight='700'%3EWorkout%20Mix%3C/text%3E%3Ctext%20x='136'%20y='350'%20fill='%239b9bb0'%20font-family='Arial'%20font-size='13'%3E12%20tracks%3C/text%3E%3C/g%3E%3Cg%3E%3Crect%20x='308'%20y='150'%20width='160'%20height='214'%20rx='10'%20fill='%23202034'%20stroke='%23ff3366'/%3E%3Crect%20x='328'%20y='170'%20width='120'%20height='120'%20rx='8'%20fill='%23f5c542'/%3E%3Ctext%20x='328'%20y='326'%20fill='%23ffffff'%20font-family='Arial'%20font-size='16'%20font-weight='700'%3EChill%20Night%3C/text%3E%3Ctext%20x='328'%20y='350'%20fill='%239b9bb0'%20font-family='Arial'%20font-size='13'%3E8%20tracks%3C/text%3E%3C/g%3E%3C/svg%3E" />
</p>

## Project Me Kya Hai

- Music import flow for MP3, MP4 aur M4A files.
- Local IndexedDB storage, isliye tracks aur playlists browser/app ke local data me save hote hain.
- Library view with sorting by title, album, artist/date-added logic.
- Playlist section jahan playlist create, open, play aur delete kar sakte ho.
- Playlist detail page for playlist ke tracks, play-all aur remove actions.
- Search view for tracks, albums aur artists.
- Player bar with queue, play/pause, skip, shuffle, repeat, volume aur seek controls.
- Electron setup, taaki same React app desktop app ki tarah run ho sake.

## Tech Stack

- React 19 for UI
- Vite 8 for frontend dev/build
- Electron 42 for desktop shell
- Zustand for app state
- IndexedDB via `idb` for local data
- `music-metadata` for reading track metadata
- CSS Modules for component-level styling

## Folder Structure

```text
Jigglypuff/
  electron/          Electron main and preload scripts
  public/            Static icons and favicon assets
  src/
    components/      Reusable UI pieces like PlayerBar, Sidebar, TrackRow
    hooks/           Audio engine, keyboard shortcuts, drag-drop
    services/        IndexedDB, metadata parser, blob URL cache
    store/           Zustand stores for library, player, UI
    views/           Dashboard, Library, Playlists, Search, Settings
    styles/          Global CSS, variables, animations
  package.json       Scripts, dependencies and Electron build config
```

## Requirements

- Node.js installed
- npm installed
- Windows recommended for packaged build, because `electron-builder` config currently targets Windows NSIS

Check versions:

```bash
node -v
npm -v
```

## Setup

Fresh clone/download ke baad dependencies install karo:

```bash
npm install
```

## Run In Browser

Development server start karne ke liye:

```bash
npm run dev
```

Default URL:

```text
http://localhost:5173
```

Browser me app open ho jayegi. Ye mode UI development aur quick testing ke liye best hai.

## Run As Desktop App

Electron ke saath app run karne ke liye:

```bash
npm run electron:dev
```

Ye command Vite dev server aur Electron window dono start karti hai.

## Production Build

Web build generate karne ke liye:

```bash
npm run build
```

Output `dist/` folder me aayega.

## Preview Production Build

Build ke baad local preview:

```bash
npm run preview
```

## Create Windows Installer

Windows installer/package build karne ke liye:

```bash
npm run dist
```

Output `release/` folder me generate hota hai.

## Useful Scripts

| Command | Kaam |
| --- | --- |
| `npm run dev` | Vite dev server start karta hai |
| `npm run electron:dev` | Desktop app dev mode me run karta hai |
| `npm run build` | Production frontend build banata hai |
| `npm run preview` | Production build ka local preview |
| `npm run lint` | ESLint checks run karta hai |
| `npm run dist` | Windows installer/package banata hai |

## Basic Usage

1. App start karo.
2. Import button se audio files select karo.
3. Library me imported tracks dekho.
4. Track row ke actions se track ko playlist me add karo.
5. Playlists tab me playlist create/open/play/delete karo.
6. Player bar se playback, volume, shuffle, repeat aur queue control karo.

## Notes

- Music data local IndexedDB me save hota hai.
- Agar storage full ho raha ho, app warning notification dikha sakti hai.
- MP4/M4A files supported hain, lekin metadata quality source file par depend karegi.
- Electron build ke liye app asset paths relative rakhe gaye hain so packaged desktop app correctly load ho.

## Troubleshooting

### `npm` PowerShell me blocked aa raha hai

Windows PowerShell execution policy ki wajah se `npm.ps1` block ho sakta hai. Is case me command ko `npm.cmd` ke saath run karo:

```bash
npm.cmd run dev
npm.cmd run electron:dev
```

### Port already in use

Vite default port `5173` use karta hai. Agar port busy hai, running dev server close karo ya Vite ko another port ke saath run karo:

```bash
npm run dev -- --port 5174
```

### Electron window blank aa rahi hai

Pehle verify karo ki Vite server chal raha hai. Phir:

```bash
npm run electron:dev
```

## License

Private project.
