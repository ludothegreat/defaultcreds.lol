// widget.js - handles the Default Cred of the Week widget

const GITHUB_API =
  "https://api.github.com/repos/danielmiessler/SecLists/contents/"
  + "Passwords/Default-Credentials";
const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
const CACHE_KEY = "secListCache";
const MAX_FILES_TO_LOAD = 10; // prevent dozens of fetches on first load

function sampleArray(list, limit) {
  if (limit >= list.length) return list;
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, limit);
}

async function listCredFiles() {
  const res = await fetch(GITHUB_API);
  if (!res.ok) throw new Error(`GitHub API ${res.status}`);
  const json = await res.json();
  return json.filter(f => f.type === 'file').map(f => f.download_url);
}

async function fetchAllCreds(urls) {
  const all = [];
  for (const url of urls) {
    const res = await fetch(url);
    if (!res.ok) continue;
    const txt = await res.text();
    const file = url.substring(url.lastIndexOf('/') + 1);
    txt.split(/\r?\n/)
      .filter(l => l && !l.startsWith('#'))
      .forEach(line => all.push({ text: line, source: url, file }));
  }
  return all;
}

async function loadCredCache() {
  let cache = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
  if (cache && Date.now() - cache.ts < ONE_WEEK) return cache;
  const urls = await listCredFiles();
  const sampledUrls = sampleArray(urls, MAX_FILES_TO_LOAD);
  const list = await fetchAllCreds(sampledUrls);
  const idx = list.length ? Math.floor(Math.random() * list.length) : 0;
  cache = { ts: Date.now(), list, idx };
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  return cache;
}

async function renderCredOfWeek() {
  const aside = document.getElementById("cred-of-week");
  if (!aside) return;
  try {
    const { list, idx } = await loadCredCache();
    if (!list.length) throw new Error("no creds");
    const entry = list[idx];
    aside.innerHTML = `
  <div class="cred-widget-header">
    <h3>🔑 Default Cred of the Week</h3>
    <a href="#" id="refresh-cred" class="cred-refresh-link" title="Refresh Credential">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M23 4v6h-6"></path>
        <path d="M1 20v-6h6"></path>
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"></path>
        <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14"></path>
      </svg>
    </a>
  </div>
  <p class="cred-entry">${entry.text}</p>
  <div class="cred-meta"><span><em>Source file:</em> ${entry.file}</span></div>
  <div class="cred-links"><a href="${entry.source}" target="_blank">View raw list</a></div>
  <div class="cred-meta cred-count">(entry #${idx + 1} of ${list.length})</div>
  <div class="cred-footnote">Credit goes to <a href="https://github.com/danielmiessler/SecLists" target="_blank">SecLists</a></div>
`;

    const refreshButton = document.getElementById('refresh-cred');
    if (refreshButton) {
      refreshButton.addEventListener('click', (event) => {
        event.preventDefault();
        refreshCredOfWeek();
      });
    }
  } catch (e) {
    console.error("Cred of the Week failed:", e);
    const fallbackUser = "admin";
    const fallbackPass = "password";
    aside.innerHTML = `
      <div class="cred-widget-header">
        <h3>🔑 Default Cred of the Week</h3>
        <button class="retry-button" type="button">Try again</button>
      </div>
      <p class="status error">Can’t reach SecLists right now.</p>
      <p class="cred-entry">${fallbackUser}:${fallbackPass}</p>
      <p class="cred-footnote">Showing a placeholder credential until we reconnect.</p>
    `;
    const retry = aside.querySelector('.retry-button');
    if (retry) {
      retry.addEventListener('click', () => {
        localStorage.removeItem(CACHE_KEY);
        renderCredOfWeek();
      });
    }
  }
}

async function refreshCredOfWeek() {
  let cache = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
  if (!cache) {
    cache = await loadCredCache();
  }
  const idx = cache.list.length ? Math.floor(Math.random() * cache.list.length) : 0;
  cache.idx = idx;
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  await renderCredOfWeek();
}

document.addEventListener('DOMContentLoaded', renderCredOfWeek);
