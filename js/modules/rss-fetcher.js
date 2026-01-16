// rss-fetcher.js - RSS fetching and parsing utilities

import { getFeedStatus, setLastUpdateTime } from './state.js';

export const CORS_PROXY = "https://api.allorigins.win/raw?url=";

// RSSParser is loaded globally from CDN
const parser = typeof RSSParser !== 'undefined' ? new RSSParser() : null;

export const MESSAGE_DATA_FILES = {
  '[>] Cracking password...': 'cracking_passwords.txt',
  '[>] Brute forcing credentials...': 'brute_force_creds.txt',
  '[>] Testing password hash...': 'password_hashes.txt',
  '[>] Decrypting credentials...': 'decrypting_creds.txt',
  '[>] Bypassing authentication...': 'bypassing_auth.txt',
  '[>] Exploiting default creds...': 'default_creds.txt',
  '[>] Scanning for weak passwords...': 'weak_passwords.txt',
  '[>] Injecting credential payload...': 'injection_payloads.txt'
};

export const fallbackData = {
  '[>] Cracking password...': ['admin:password', 'root:toor', 'user:12345'],
  '[>] Brute forcing credentials...': ['admin:admin', 'test:test', 'guest:guest'],
  '[>] Testing password hash...': ['$2y$10$...', '5f4dcc3b5aa765d61d8327deb882cf99', '098f6bcd4621d373cade4e832627b4f6'],
  '[>] Decrypting credentials...': ['encrypted:data', 'hash:value', 'token:secret'],
  '[>] Bypassing authentication...': ['session:abc123', 'token:xyz789', 'auth:bypass'],
  '[>] Exploiting default creds...': ['admin:password', 'root:root', 'user:user'],
  '[>] Scanning for weak passwords...': ['123456', 'password', 'qwerty'],
  '[>] Injecting credential payload...': ['admin\' OR 1=1--', 'union select *', '; DROP TABLE--']
};

// Store loaded data for each message type
const messageDataCache = {};
const dataLoadPromises = {};

export function loadMessageData(messageType) {
  // Return cached data if available
  if (messageDataCache[messageType]) {
    return Promise.resolve(messageDataCache[messageType]);
  }
  
  // Return existing promise if already loading
  if (dataLoadPromises[messageType]) {
    return dataLoadPromises[messageType];
  }
  
  const fileName = MESSAGE_DATA_FILES[messageType];
  if (!fileName) {
    // No file mapping, use fallback
    messageDataCache[messageType] = [...(fallbackData[messageType] || fallbackData['[>] Cracking password...'])];
    return Promise.resolve(messageDataCache[messageType]);
  }
  
  // Load the file
  dataLoadPromises[messageType] = fetch(fileName)
    .then(res => {
      if (!res.ok) throw new Error(`Failed to load ${fileName}: ${res.status}`);
      return res.text();
    })
    .then(text => {
      const entries = text
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(Boolean);
      if (entries.length) {
        messageDataCache[messageType] = entries;
      } else {
        messageDataCache[messageType] = [...(fallbackData[messageType] || fallbackData['[>] Cracking password...'])];
      }
      return messageDataCache[messageType];
    })
    .catch(err => {
      console.warn(`Failed to load ${fileName}, using fallback:`, err);
      messageDataCache[messageType] = [...(fallbackData[messageType] || fallbackData['[>] Cracking password...'])];
      return messageDataCache[messageType];
    });
  
  return dataLoadPromises[messageType];
}

// Preload all data files with error boundaries
export function preloadAllMessageData() {
  const messages = Object.keys(MESSAGE_DATA_FILES);
  return Promise.allSettled(messages.map(msg => 
    loadMessageData(msg).catch(err => {
      console.warn(`Failed to preload message data for ${msg}:`, err);
      return null; // Return null instead of throwing
    })
  )).then(results => {
    const failures = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && r.value === null));
    if (failures.length > 0) {
      console.warn(`${failures.length} message data file(s) failed to preload`);
    }
    return results;
  });
}

export function getMessageData(messageType) {
  return messageDataCache[messageType] || fallbackData[messageType] || fallbackData['[>] Cracking password...'];
}

export async function fetchXml(feed) {
  const startTime = Date.now();
  const maxRetries = 3;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetch(CORS_PROXY + encodeURIComponent(feed.url));
      if (!res.ok) throw new Error(`Proxy ${res.status}`);

      const elapsed = Date.now() - startTime;
      getFeedStatus().set(feed.url, { status: elapsed > 3000 ? 'slow' : 'loaded', time: elapsed });

      return await res.text();
    } catch (err) {
      console.warn(`Fetch attempt ${i + 1} failed for ${feed.name}:`, err);
      if (i === maxRetries - 1) {
        getFeedStatus().set(feed.url, { status: 'failed', error: err.message });
        err.isProxyError = true;
        throw err;
      }
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
}

export async function parseXml(xml) {
  try {
    if (!parser) {
      throw new Error('RSSParser not available');
    }
    return await parser.parseString(xml);
  } catch (err) {
    err.isParserError = true;
    throw err;
  }
}
