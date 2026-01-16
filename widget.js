// widget.js - handles the Default Cred of the Week widget

const GITHUB_API =
  "https://api.github.com/repos/danielmiessler/SecLists/contents/"
  + "Passwords/Default-Credentials";
const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
const CACHE_KEY = "secListCache";
const MAX_FILES_TO_LOAD = 10;

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
  const contentArea = document.getElementById("cred-widget-content");
  if (!contentArea) return;

  try {
    const { list, idx } = await loadCredCache();
    if (!list.length) throw new Error("no creds");
    const entry = list[idx];

    // Clear previous content
    contentArea.innerHTML = '';

    // Create elements safely using textContent to prevent XSS
    const credEntry = document.createElement('p');
    credEntry.className = 'cred-entry';
    credEntry.textContent = entry.text;
    contentArea.appendChild(credEntry);

    const credMeta = document.createElement('div');
    credMeta.className = 'cred-meta';
    credMeta.innerHTML = '<em>Source:</em> ';
    const sourceText = document.createTextNode(entry.file);
    credMeta.appendChild(sourceText);
    contentArea.appendChild(credMeta);

    const credLinks = document.createElement('div');
    credLinks.className = 'cred-links';
    const viewLink = document.createElement('a');
    viewLink.href = entry.source;
    viewLink.target = '_blank';
    viewLink.rel = 'noopener';
    viewLink.textContent = 'View raw list';
    credLinks.appendChild(viewLink);
    contentArea.appendChild(credLinks);

    const credCount = document.createElement('div');
    credCount.className = 'cred-count';
    credCount.textContent = `Entry #${idx + 1} of ${list.length}`;
    contentArea.appendChild(credCount);

    const credFootnote = document.createElement('div');
    credFootnote.className = 'cred-footnote';
    credFootnote.textContent = 'Data from ';
    const secListsLink = document.createElement('a');
    secListsLink.href = 'https://github.com/danielmiessler/SecLists';
    secListsLink.target = '_blank';
    secListsLink.rel = 'noopener';
    secListsLink.textContent = 'SecLists';
    credFootnote.appendChild(secListsLink);
    contentArea.appendChild(credFootnote);
  } catch (e) {
    console.error("Cred of the Week failed:", e);
    const fallbackUser = "admin";
    const fallbackPass = "password";

    // Clear and create fallback content safely
    contentArea.innerHTML = '';

    const errorMsg = document.createElement('p');
    errorMsg.className = 'status error';
    errorMsg.textContent = "Can't reach SecLists right now.";
    contentArea.appendChild(errorMsg);

    const fallbackEntry = document.createElement('p');
    fallbackEntry.className = 'cred-entry';
    fallbackEntry.textContent = `${fallbackUser}:${fallbackPass}`;
    contentArea.appendChild(fallbackEntry);

    const fallbackNote = document.createElement('p');
    fallbackNote.className = 'cred-footnote';
    fallbackNote.textContent = 'Showing a placeholder credential.';
    contentArea.appendChild(fallbackNote);

    const retryButton = document.createElement('button');
    retryButton.className = 'retry-button';
    retryButton.type = 'button';
    retryButton.textContent = 'Try again';
    retryButton.addEventListener('click', () => {
      localStorage.removeItem(CACHE_KEY);
      renderCredOfWeek();
    });
    contentArea.appendChild(retryButton);
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

document.addEventListener('DOMContentLoaded', () => {
  renderCredOfWeek();

  // Bind refresh button
  const refreshBtn = document.getElementById('refresh-cred');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', (event) => {
      event.preventDefault();
      refreshCredOfWeek();
    });
  }
});
