'use strict';

const DiscordRPC = require('discord-rpc');

const DEFAULT_RECONNECT_DELAY_MS = 15_000;
const DEFAULT_LARGE_IMAGE_KEY = 'jigglypuff_logo';
const DEFAULT_SMALL_PLAYING_IMAGE_KEY = 'playing';
const DEFAULT_SMALL_PAUSED_IMAGE_KEY = 'paused';

function cleanText(value, fallback) {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  return trimmed || fallback;
}

function cleanUrl(value) {
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : null;
  } catch {
    return null;
  }
}

function cleanPositiveNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : 0;
}

class DiscordRpcService {
  constructor({
    clientId,
    openUrl,
    reconnectDelayMs = DEFAULT_RECONNECT_DELAY_MS,
    largeImageKey = DEFAULT_LARGE_IMAGE_KEY,
    smallPlayingImageKey = DEFAULT_SMALL_PLAYING_IMAGE_KEY,
    smallPausedImageKey = DEFAULT_SMALL_PAUSED_IMAGE_KEY,
  } = {}) {
    this.clientId = clientId;
    this.openUrl = cleanUrl(openUrl);
    this.reconnectDelayMs = reconnectDelayMs;
    this.largeImageKey = largeImageKey;
    this.smallPlayingImageKey = smallPlayingImageKey;
    this.smallPausedImageKey = smallPausedImageKey;

    this.client = null;
    this.isReady = false;
    this.isConnecting = false;
    this.reconnectTimer = null;
    this.lastPresence = null;
    this.destroyed = false;
  }

  start() {
    if (!this.clientId || this.destroyed) return;
    DiscordRPC.register(this.clientId);
    this.connect();
  }

  connect() {
    if (!this.clientId || this.isConnecting || this.isReady || this.destroyed) return;

    this.isConnecting = true;
    this.client = new DiscordRPC.Client({ transport: 'ipc' });

    this.client.once('ready', () => {
      this.isReady = true;
      this.isConnecting = false;
      if (this.lastPresence) this.setActivity(this.lastPresence);
    });

    this.client.on('disconnected', () => {
      this.markDisconnected();
      this.scheduleReconnect();
    });

    this.client.login({ clientId: this.clientId }).catch(() => {
      this.markDisconnected();
      this.scheduleReconnect();
    });
  }

  updatePresence(presence) {
    if (!presence?.track) {
      this.clear();
      return;
    }

    this.lastPresence = presence;

    if (!this.isReady) {
      this.connect();
      return;
    }

    this.setActivity(presence);
  }

  setActivity(presence) {
    if (!this.client || !this.isReady || !presence?.track) return;

    const now = Date.now();
    const track = presence.track;
    const elapsed = cleanPositiveNumber(presence.elapsed);
    const duration = cleanPositiveNumber(presence.duration || track.duration);
    const isPlaying = presence.isPlaying !== false;
    const startTimestamp = Math.floor((now - elapsed * 1000) / 1000);
    const endTimestamp = duration > elapsed
      ? Math.floor((now + (duration - elapsed) * 1000) / 1000)
      : undefined;

    const imageKey = cleanText(track.rpcImageKey || track.thumbnailUrl, null) || this.largeImageKey;
    const largeImageKey = cleanUrl(imageKey) || imageKey;
    const artist = cleanText(track.artist, 'Unknown Artist');

    const activity = {
      details: cleanText(track.title, 'Untitled Track'),
      state: artist,
      largeImageKey,
      largeImageText: cleanText(track.album, 'Listening to Jigglypuff'),
      smallImageKey: isPlaying ? this.smallPlayingImageKey : this.smallPausedImageKey,
      smallImageText: isPlaying ? 'Playing' : 'Paused',
      instance: false,
    };

    if (isPlaying) {
      activity.startTimestamp = startTimestamp;
      if (endTimestamp) activity.endTimestamp = endTimestamp;
    } else if (elapsed > 0) {
      activity.startTimestamp = startTimestamp;
    }

    if (this.openUrl) {
      activity.buttons = [{ label: 'Open Jigglypuff', url: this.openUrl }];
    }

    this.client.setActivity(activity).catch(() => {
      this.markDisconnected();
      this.scheduleReconnect();
    });
  }

  clear() {
    this.lastPresence = null;
    if (!this.client || !this.isReady) return;
    this.client.clearActivity().catch(() => {});
  }

  destroy() {
    this.destroyed = true;
    this.lastPresence = null;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
    if (this.client && this.isReady) {
      this.client.clearActivity().catch(() => {});
    }
    if (this.client) {
      Promise.resolve(this.client.destroy()).catch(() => {});
    }
    this.markDisconnected();
  }

  markDisconnected() {
    this.isReady = false;
    this.isConnecting = false;
    this.client = null;
  }

  scheduleReconnect() {
    if (this.destroyed || this.reconnectTimer || !this.clientId) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, this.reconnectDelayMs);
  }
}

module.exports = { DiscordRpcService };
