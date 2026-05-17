'use strict';

const http = require('http');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const ytSearch = require('yt-search');

const HOST = process.env.JIGGLYPUFF_API_HOST || '127.0.0.1';
const PORT = Number(process.env.JIGGLYPUFF_API_PORT || 3939);

const json = (res, status, body) => {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Range',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(body));
};

const getYtDlpBinary = () => {
  if (process.env.YT_DLP_PATH) return process.env.YT_DLP_PATH;
  const localName = process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp';
  const localBin = path.join(__dirname, '..', 'node_modules', 'yt-dlp-exec', 'bin', localName);
  return fs.existsSync(localBin) ? localBin : 'yt-dlp';
};

const runYtDlp = (args) => new Promise((resolve, reject) => {
  const child = spawn(getYtDlpBinary(), args, {
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let out = '';
  let err = '';
  child.stdout.on('data', (chunk) => { out += chunk.toString(); });
  child.stderr.on('data', (chunk) => { err += chunk.toString(); });
  child.on('error', reject);
  child.on('close', (code) => {
    if (code === 0 && out.trim()) resolve(out.trim());
    else reject(new Error(err.trim() || `yt-dlp exited with code ${code}`));
  });
});

const normalizeVideo = (video) => ({
  id: video.videoId,
  title: video.title,
  artist: video.author?.name || video.author || 'YouTube',
  duration: video.seconds || 0,
  durationLabel: video.timestamp || '',
  thumbnailUrl: video.thumbnail,
  url: video.url,
  source: 'online',
});

const handleSearch = async (req, res, url) => {
  const q = url.searchParams.get('q')?.trim();
  if (!q) return json(res, 400, { error: 'Missing search query.' });

  try {
    const result = await ytSearch({ query: q, pages: 1 });
    const tracks = (result.videos || [])
      .filter((video) => video.videoId && video.title)
      .slice(0, 12)
      .map(normalizeVideo);
    json(res, 200, { tracks });
  } catch (err) {
    console.error('[Jigglypuff API] Search failed:', err);
    json(res, 500, { error: 'Search failed.' });
  }
};

const handleStream = async (req, res, id) => {
  if (!id) return json(res, 400, { error: 'Missing video id.' });

  try {
    const target = `https://www.youtube.com/watch?v=${encodeURIComponent(id)}`;
    const streamUrl = await runYtDlp([
      '--no-playlist',
      '--no-warnings',
      '-f',
      'bestaudio/best',
      '-g',
      target,
    ]);

    res.writeHead(302, {
      Location: streamUrl.split(/\r?\n/)[0],
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store',
    });
    res.end();
  } catch (err) {
    console.error('[Jigglypuff API] Stream failed:', err.message);
    json(res, 500, {
      error: 'Stream failed. Make sure yt-dlp is installed and available on PATH.',
    });
  }
};

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Range',
    });
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  if (req.method === 'GET' && url.pathname === '/search') {
    handleSearch(req, res, url);
    return;
  }

  const streamMatch = url.pathname.match(/^\/stream\/([^/]+)$/);
  if (req.method === 'GET' && streamMatch) {
    handleStream(req, res, decodeURIComponent(streamMatch[1]));
    return;
  }

  json(res, 404, { error: 'Not found.' });
});

server.listen(PORT, HOST, () => {
  console.log(`[Jigglypuff API] Listening at http://${HOST}:${PORT}`);
});
