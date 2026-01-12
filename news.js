// news.js

// 1) Feeds list
const feeds = [
  { url: 'https://krebsonsecurity.com/feed/', name: 'Krebs on Security', category: 'Newsrooms' },
  { url: 'https://www.bleepingcomputer.com/feed/', name: 'BleepingComputer', category: 'Newsrooms' },
  { url: 'https://www.theregister.com/security/headlines.atom', name: 'The Register Security', category: 'Industry Press' },
  { url: 'https://hnrss.org/newest?points=50&q=security', name: 'Hacker News', category: 'Communities' },
  { url: 'https://threatpost.com/feed/', name: 'ThreatPost', category: 'Newsrooms' },
  { url: 'https://www.darkreading.com/rss.xml', name: 'Dark Reading', category: 'Analysis & Research' },
  { url: 'https://feeds.feedburner.com/Securityweek', name: 'SecurityWeek', category: 'Newsrooms' }
];

// 2) Color helpers (generate unique accent per feed)
const feedColorCache = new Map();
const usedHueAngles = [];
const categoryColorCache = new Map();

function hashStringToInt(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function hueDistance(a, b) {
  const diff = Math.abs(a - b);
  return Math.min(diff, 360 - diff);
}

function reserveHue(preferred) {
  let hue = ((preferred % 360) + 360) % 360;
  const goldenAngle = 137.508;
  const tolerance = 12;
  let iterations = 0;
  while (iterations < 360) {
    const isUnique = usedHueAngles.every(existing => hueDistance(existing, hue) > tolerance);
    if (isUnique) {
      usedHueAngles.push(hue);
      return hue;
    }
    hue = (hue + goldenAngle) % 360;
    iterations++;
  }
  usedHueAngles.push(hue);
  return hue;
}

function getFeedColors(url) {
  if (feedColorCache.has(url)) return feedColorCache.get(url);
  const baseHue = reserveHue(hashStringToInt(url));
  const hue = Math.round(baseHue * 100) / 100;
  const primary = `hsl(${hue}, 68%, 52%)`;
  const soft = `hsl(${hue}, 85%, 88%)`;
  const badgeText = `hsl(${hue}, 55%, 28%)`;
  const colors = { primary, soft, badgeText };
  feedColorCache.set(url, colors);
  return colors;
}

function getCategoryColors(name) {
  const key = name || 'Feeds';
  if (categoryColorCache.has(key)) return categoryColorCache.get(key);
  const hue = Math.round(((hashStringToInt(key) * 7) % 360 + 360) % 360);
  const border = `hsl(${hue}, 32%, 46%)`;
  const fill = `hsl(${hue}, 28%, 92%)`;
  const text = `hsl(${hue}, 40%, 28%)`;
  const colors = { border, fill, text };
  categoryColorCache.set(key, colors);
  return colors;
}

const feedMap = new Map(feeds.map(feed => [feed.url, feed]));
const DEFAULT_FEED_ORDER = feeds.map(feed => feed.url);

let feedOrder = (() => {
  try {
    const stored = JSON.parse(localStorage.getItem('feedOrder') || 'null');
    if (Array.isArray(stored)) {
      return stored.filter(url => feedMap.has(url));
    }
  } catch (err) {
    console.warn('Failed to parse feed order from storage', err);
  }
  return [...DEFAULT_FEED_ORDER];
})();

let feedOrderChanged = false;
DEFAULT_FEED_ORDER.forEach(url => {
  if (!feedOrder.includes(url)) {
    feedOrder.push(url);
    feedOrderChanged = true;
  }
});
if (feedOrderChanged) {
  localStorage.setItem('feedOrder', JSON.stringify(feedOrder));
}

feedOrder.forEach(url => getFeedColors(url));

const storedSelectedFeedsValue = localStorage.getItem('selectedFeeds');
let selectedFeeds = (() => {
  if (storedSelectedFeedsValue) {
    try {
      const parsed = JSON.parse(storedSelectedFeedsValue);
      if (Array.isArray(parsed)) {
        return parsed.filter(url => feedMap.has(url));
      }
    } catch (err) {
      console.warn('Failed to parse selected feeds from storage', err);
    }
  }
  return [...DEFAULT_FEED_ORDER];
})();

selectedFeeds = Array.from(new Set(selectedFeeds));

const storedFeedFilterTerm = localStorage.getItem('feedFilterTerm');
let feedFilterTerm = storedFeedFilterTerm || '';
let feedOptionsContainer = null;
const storedFeedPanelState = localStorage.getItem('feedPanelOpen');
let feedPanelOpen = storedFeedPanelState !== 'false';
const storedActiveCategories = localStorage.getItem('activeFeedCategories');
let activeFeedCategories = (() => {
  if (storedActiveCategories) {
    try {
      const parsed = JSON.parse(storedActiveCategories);
      if (Array.isArray(parsed)) return parsed;
    } catch (err) {
      console.warn('Failed to parse active feed categories', err);
    }
  }
  return Array.from(new Set(feeds.map(feed => feed.category || 'Feeds')));
})();

if (!storedSelectedFeedsValue) {
  DEFAULT_FEED_ORDER.forEach(url => {
    if (!selectedFeeds.includes(url)) selectedFeeds.push(url);
  });
}

// 3) Proxy & parser
const CORS_PROXY = "https://api.allorigins.win/raw?url=";
const parser = new RSSParser();
const PASSWORD_WORDLIST_URL = 'top_1000_passwords.txt';

const fallbackPasswords = [
  '123456',
  'password',
  '123456789',
  'qwerty',
  '12345',
  '12345678',
  '111111',
  '1234567',
  'sunshine',
  'iloveyou',
];

let passwordList = [...fallbackPasswords];
let passwordListPromise = null;

function loadPasswordList() {
  if (passwordListPromise) return passwordListPromise;
  passwordListPromise = fetch(PASSWORD_WORDLIST_URL)
    .then(res => {
      if (!res.ok) throw new Error(`wordlist ${res.status}`);
      return res.text();
    })
    .then(text => {
      const entries = text
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(Boolean)
        .slice(0, 2000);
      if (entries.length) {
        passwordList = entries;
      }
    })
    .catch(err => {
      console.warn('Failed to load password list', err);
      passwordList = [...fallbackPasswords];
    });
  return passwordListPromise;
}

// 5) Render the feed‑picker form (enhanced)
function renderFeedForm() {
  const container = document.getElementById('feed-settings');
  if (!container) return;

  let details = container.querySelector('details');
  if (!details) {
    details = document.createElement('details');
    details.innerHTML = '<summary>Select Feeds</summary>';
    container.appendChild(details);
  }
  details.open = feedPanelOpen;
  if (!details.dataset.bound) {
    details.addEventListener('toggle', () => {
      feedPanelOpen = details.open;
      localStorage.setItem('feedPanelOpen', feedPanelOpen ? 'true' : 'false');
    });
    details.dataset.bound = 'true';
  }

  let form = details.querySelector('form');
  if (!form) {
    form = document.createElement('form');
    form.id = 'feed-form';
    details.appendChild(form);
  }

  let controls = form.querySelector('.feed-controls');
  if (!controls) {
    controls = document.createElement('div');
    controls.className = 'feed-controls';
    controls.innerHTML = `
      <div class="feed-controls-buttons">
        <button type="button" data-action="select-all">Select all</button>
        <button type="button" data-action="select-none">Select none</button>
      </div>
      <div class="feed-category-chips" role="group" aria-label="Toggle feed categories"></div>
      <input type="search" class="feed-search" placeholder="Filter feeds" aria-label="Filter feeds">
    `;
    form.appendChild(controls);
  }

  const searchInput = controls.querySelector('.feed-search');
  if (searchInput) {
    if (searchInput.value !== feedFilterTerm) {
      searchInput.value = feedFilterTerm;
    }
    if (!searchInput.dataset.bound) {
      searchInput.addEventListener('input', () => {
        feedFilterTerm = searchInput.value;
        if (feedFilterTerm) {
          localStorage.setItem('feedFilterTerm', feedFilterTerm);
        } else {
          localStorage.removeItem('feedFilterTerm');
        }
        renderFeedOptions(feedOptionsContainer);
      });
      searchInput.dataset.bound = 'true';
    }
  }

  if (!controls.dataset.bound) {
    controls.addEventListener('click', event => {
      const button = event.target.closest('button[data-action]');
      if (button) {
        event.preventDefault();
        const action = button.dataset.action;
        if (action === 'select-all') {
          selectedFeeds = feedOrder.filter(url => isFeedInActiveCategory(url));
        } else if (action === 'select-none') {
          selectedFeeds = [];
        }
        localStorage.setItem('selectedFeeds', JSON.stringify(selectedFeeds));
        renderFeedOptions(feedOptionsContainer);
        loadNews();
        return;
      }
      const chip = event.target.closest('.feed-category-chip');
      if (chip && chip.dataset.category) {
        const category = chip.dataset.category;
        toggleCategory(category);
        renderCategoryChips(controls.querySelector('.feed-category-chips'));
        renderFeedOptions(feedOptionsContainer);
        loadNews();
      }
    });
    controls.dataset.bound = 'true';
  }

  const chipContainer = controls.querySelector('.feed-category-chips');
  renderCategoryChips(chipContainer);

  feedOptionsContainer = form.querySelector('.feed-list');
  if (!feedOptionsContainer) {
    feedOptionsContainer = document.createElement('div');
    feedOptionsContainer.className = 'feed-list';
    form.appendChild(feedOptionsContainer);
  }

  renderFeedOptions(feedOptionsContainer);

  if (!form.dataset.bound) {
    form.addEventListener('change', handleFeedFormChange);
    form.addEventListener('click', handleFeedFormClick);
    form.dataset.bound = 'true';
  }
}

function feedCheckboxId(url) {
  return 'chk-' + btoa(url).replace(/[^a-z0-9]/gi, '');
}

function getFeedsInOrder(onlySelected = false) {
  const ordered = feedOrder
    .map(url => feedMap.get(url))
    .filter(Boolean);
  return onlySelected
    ? ordered.filter(feed => selectedFeeds.includes(feed.url) && isFeedInActiveCategory(feed.url))
    : ordered;
}

function renderFeedOptions(container) {
  if (!container) return;
  container.innerHTML = '';

  const normalizedFilter = feedFilterTerm.trim().toLowerCase();
  let renderedCount = 0;

  getFeedsInOrder(false).forEach(feed => {
    const active = isFeedInActiveCategory(feed.url);
    const matchesFilter = !normalizedFilter || feed.name.toLowerCase().includes(normalizedFilter);
    if (!matchesFilter) return;
    const feedColors = getFeedColors(feed.url);
    const categoryColors = getCategoryColors(feed.category || 'Feeds');

    renderedCount += 1;
    const option = document.createElement('div');
    option.className = 'feed-option';
    option.dataset.feedUrl = feed.url;
    const isSelected = selectedFeeds.includes(feed.url);
    option.dataset.active = active ? 'true' : 'false';
    option.dataset.selected = isSelected ? 'true' : 'false';

    const borderColor = (active && isSelected) ? feedColors.primary : (active ? 'var(--muted-color)' : 'transparent');
    option.style.borderLeftColor = borderColor;

    const label = document.createElement('label');
    label.className = 'feed-option-label';
    label.htmlFor = feedCheckboxId(feed.url);

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = feedCheckboxId(feed.url);
    checkbox.value = feed.url;
    checkbox.checked = isSelected;
    checkbox.disabled = !active;

    const nameSpan = document.createElement('span');
    if (normalizedFilter) {
      const highlightRegex = new RegExp(`(${escapeRegExp(feedFilterTerm.trim())})`, 'gi');
      nameSpan.innerHTML = feed.name.replace(highlightRegex, '<mark class="search-highlight">$1</mark>');
    } else {
      nameSpan.textContent = feed.name;
    }

    const categoryBadge = document.createElement('span');
    categoryBadge.className = 'feed-category-pill';
    categoryBadge.textContent = feed.category || 'Feeds';
    const badgeActive = active && isSelected;
    if (badgeActive) {
      categoryBadge.style.borderColor = categoryColors.border;
      categoryBadge.style.background = categoryColors.border;
      categoryBadge.style.color = '#fff';
    } else {
      categoryBadge.style.borderColor = 'var(--muted-color)';
      categoryBadge.style.background = 'transparent';
      categoryBadge.style.color = 'var(--muted-color)';
    }

    label.append(checkbox, nameSpan, categoryBadge);
    option.appendChild(label);

    const actions = document.createElement('div');
    actions.className = 'feed-option-actions';

    const orderIndex = feedOrder.indexOf(feed.url);

    const upBtn = document.createElement('button');
    upBtn.type = 'button';
    upBtn.className = 'feed-move';
    upBtn.dataset.move = 'up';
    upBtn.setAttribute('aria-label', `Move ${feed.name} earlier`);
    upBtn.innerHTML = '↑';
    if (orderIndex <= 0) upBtn.disabled = true;

    const downBtn = document.createElement('button');
    downBtn.type = 'button';
    downBtn.className = 'feed-move';
    downBtn.dataset.move = 'down';
    downBtn.setAttribute('aria-label', `Move ${feed.name} later`);
    downBtn.innerHTML = '↓';
    if (orderIndex === feedOrder.length - 1) downBtn.disabled = true;

    actions.append(upBtn, downBtn);
    option.appendChild(actions);

    container.appendChild(option);
  });

  if (!renderedCount) {
    const emptyMessage = document.createElement('p');
    emptyMessage.className = 'status';
    emptyMessage.textContent = 'No feeds match that filter.';
    container.appendChild(emptyMessage);
  }

  updateFeedControlButtons();
}

function handleFeedFormChange(event) {
  const checkbox = event.target.closest('input[type="checkbox"]');
  if (!checkbox) return;
  const form = event.currentTarget;
  selectedFeeds = Array.from(form.querySelectorAll('input[type="checkbox"]'))
    .filter(input => input.checked)
    .map(input => input.value)
    .filter(url => feedMap.has(url));
  localStorage.setItem('selectedFeeds', JSON.stringify(selectedFeeds));
  updateFeedControlButtons();
  loadNews();
}

function handleFeedFormClick(event) {
  const moveButton = event.target.closest('.feed-move');
  if (moveButton && moveButton.dataset.move) {
    event.preventDefault();
    const option = moveButton.closest('.feed-option');
    if (!option) return;
    const url = option.dataset.feedUrl;
    const feed = feedMap.get(url);
    const currentIndex = feedOrder.indexOf(url);
    if (currentIndex === -1) return;
    if (moveButton.dataset.move === 'up' && currentIndex > 0) {
      [feedOrder[currentIndex - 1], feedOrder[currentIndex]] = [feedOrder[currentIndex], feedOrder[currentIndex - 1]];
    } else if (moveButton.dataset.move === 'down' && currentIndex < feedOrder.length - 1) {
      [feedOrder[currentIndex + 1], feedOrder[currentIndex]] = [feedOrder[currentIndex], feedOrder[currentIndex + 1]];
    } else {
      return;
    }
    localStorage.setItem('feedOrder', JSON.stringify(feedOrder));
    renderFeedOptions(feedOptionsContainer);
    applyFeedOrderToDom();
    const refreshedOption = feedOptionsContainer && feed
      ? feedOptionsContainer.querySelector(`[data-feed-url="${feed.url}"] input[type="checkbox"]`)
      : null;
    if (refreshedOption) refreshedOption.focus();
  }
}

function applyFeedOrderToDom() {
  const container = document.getElementById('news-feed');
  if (!container) return;
  const sectionMap = new Map(Array.from(container.querySelectorAll('.feed-section')).map(section => [section.id, section]));
  feedOrder.forEach(url => {
    const feed = feedMap.get(url);
    if (!feed) return;
    if (!isFeedInActiveCategory(url)) return;
    const sectionId = 'sec-' + feedKey(feed);
    const section = sectionMap.get(sectionId);
    if (section) {
      const colors = getFeedColors(feed.url);
      section.style.borderLeftColor = colors.primary;
      container.appendChild(section);
    }
  });
}

function updateFeedControlButtons() {
  const controls = document.querySelector('#feed-form .feed-controls');
  if (!controls) return;
  const allBtn = controls.querySelector('button[data-action="select-all"]');
  const noneBtn = controls.querySelector('button[data-action="select-none"]');
  if (allBtn) {
    const selectableCount = feedOrder.filter(url => isFeedInActiveCategory(url)).length;
    const selectedCount = selectedFeeds.filter(url => isFeedInActiveCategory(url)).length;
    allBtn.disabled = selectableCount > 0 && selectedCount === selectableCount;
  }
  if (noneBtn) {
    noneBtn.disabled = selectedFeeds.filter(url => isFeedInActiveCategory(url)).length === 0;
  }
}

// 6) Helpers for cache keys
function feedKey(feed) {
  return btoa(feed.url).replace(/=/g, '');
}

// 7) Fetch raw XML
async function fetchXml(feed) {
  const maxRetries = 3;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetch(CORS_PROXY + encodeURIComponent(feed.url));
      if (!res.ok) throw new Error(`Proxy ${res.status}`);
      return await res.text();
    } catch (err) {
      console.warn(`Fetch attempt ${i + 1} failed for ${feed.name}:`, err);
      if (i === maxRetries - 1) {
        err.isProxyError = true;
        throw err; // Re-throw the error after the last attempt
      }
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait before retrying
    }
  }
}

// 8) Parse XML to JS
async function parseXml(xml) {
  try {
    return await parser.parseString(xml);
  } catch (err) {
    err.isParserError = true;
    throw err;
  }
}

// 9) Render items under a section
function renderItems(section, feedName, items) {
  section.querySelectorAll('.retry-button').forEach(button => button.remove());
  section.querySelectorAll('article').forEach(a => a.remove());
  if (!items.length) {
    // Ensure retry button is removed even if no items are found
    section.querySelectorAll('.retry-button').forEach(button => button.remove());
    const none = document.createElement('p');
    none.className = 'status';
    none.textContent = 'No items found.';
    section.appendChild(none);
    return;
  }
  items.slice(0, 5).forEach(item => {
    const art = document.createElement('article');

    // Format the date
    const pubDate = new Date(item.pubDate);
    const formattedDate = `${(pubDate.getMonth() + 1).toString().padStart(2, '0')}-${pubDate.getDate().toString().padStart(2, '0')}-${pubDate.getFullYear()}`;
    
    // Format the time in 12-hour format
    let hours = pubDate.getHours();
    const minutes = pubDate.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
 hours = hours % 12;
 hours = hours ? hours : 12; // the hour '0' should be '12'
    art.innerHTML = `
      <header><h3><a href="${item.link}" target="_blank">${item.title}</a></h3></header>
      <footer>
 <small>
 ${formattedDate} - ${hours}:${minutes} ${ampm} | ${feedName}${item.author ? ` - ${item.author}` : ''}
        </small>
 </footer>
    `;
    const link = art.querySelector('a');
    if (link) {
      link.dataset.originalTitle = item.title;
    }
    section.appendChild(art);
  });
}

// 10) For each feed: placeholder + cache + background fetch
async function handleFeed(feed) {
  const container = document.getElementById('news-feed');
  const sectionId = 'sec-' + feedKey(feed);

  // build section if absent
  let section = document.getElementById(sectionId);
  if (!section) {
    section = document.createElement('section');
    section.id = sectionId;
    section.classList.add('feed-section');

    const colors = getFeedColors(feed.url);
    section.style.borderLeftColor = colors.primary;

    const h2 = document.createElement('h2');
    h2.textContent = feed.name;
    h2.addEventListener('click', () => {
      section.classList.toggle('collapsed');
    });
    section.appendChild(h2);

    const status = document.createElement('p');
    status.className = 'status';
    status.textContent = 'Loading…';
    section.appendChild(status);
  }
  const colors = getFeedColors(feed.url);
  section.style.borderLeftColor = colors.primary;
  // Remove any existing error class before attempting to load
  section.classList.remove('feed-error');
  const status = section.querySelector('.status');
  const cacheKey = 'xmlCache_' + feedKey(feed);
  const raw = localStorage.getItem(cacheKey);

  // 10a) render from cache immediately
  if (raw) {
    try {
      const { xml } = JSON.parse(raw);
      const data = await parseXml(xml);
      status.remove();
      renderItems(section, feed.name, data.items);
    } catch (e) {
      console.warn('Cache parse error', e);
    }
  }

  // 10b) fetch fresh in background
  try {
    const freshXml = await fetchXml(feed);
    const prevXml = raw ? JSON.parse(raw).xml : null;
    if (freshXml !== prevXml) {
      localStorage.setItem(cacheKey,
        JSON.stringify({ timestamp: Date.now(), xml: freshXml })
      );
      const freshData = await parseXml(freshXml);
      section.querySelectorAll('.status, article').forEach(n => n.remove());
      renderItems(section, feed.name, freshData.items);
    }
  } catch (err) {
    // Remove any existing retry button before showing the error
    section.querySelectorAll('.retry-button').forEach(button => button.remove());

    console.error(`Failed to update ${feed.name}`, err);
    if (section.querySelector('.status')) {
      // More specific error messages
      if (err.isProxyError) {
        status.textContent = `Couldn’t load ${feed.name}: News CORS proxy unavailable.`;
      } else if (err.isParserError) {
        status.textContent = `Couldn’t load ${feed.name}: RSS parser failed (possibly CDN down).`;
      } else {
        status.textContent = `Couldn’t load ${feed.name}.`;
      }
      status.classList.add('error');
      // Add visual indicator for failed feed
      section.classList.add('feed-error');

      // Only add the retry button if one doesn't already exist
      if (!section.querySelector('.retry-button')) {
        const retryButton = document.createElement('button');
        retryButton.textContent = 'Retry';
        retryButton.classList.add('retry-button'); // Add a class for easy selection
        retryButton.addEventListener('click', () => handleFeed(feed));
        section.appendChild(retryButton);
      }

    }
  }
  return section;
}

let animationInterval;

function animatePassword() {
  const el = document.getElementById('password-animation');
  if (!el) return;
  if (!passwordList.length) {
    passwordList = [...fallbackPasswords];
  }

  let i = 0;
  animationInterval = setInterval(() => {
    el.value = passwordList[i];
    i = (i + 1) % passwordList.length;
  }, 200);
}

function escapeRegExp(string) {
  return string.replace(/([.*+?^${}()|[\]\\])/g, '\\$1');
}

function applySearchFilter(rawTerm = '') {
  const searchBar = document.getElementById('search-bar');
  const filterStatus = document.getElementById('filter-status');
  const termFromInput = typeof rawTerm === 'string' ? rawTerm : (searchBar ? searchBar.value : '');
  const trimmedTerm = termFromInput.trim();
  const normalizedTerm = trimmedTerm.toLowerCase();
  const articles = document.querySelectorAll('#news-feed article');
  let visibleCount = 0;

  articles.forEach(article => {
    const link = article.querySelector('h3 a');
    if (!link) return;

    const originalTitle = link.dataset.originalTitle || link.textContent;
    link.dataset.originalTitle = originalTitle;

    const lowerTitle = originalTitle.toLowerCase();
    const titleMatches = normalizedTerm ? lowerTitle.includes(normalizedTerm) : false;
    const linkMatches = normalizedTerm ? link.href.toLowerCase().includes(normalizedTerm) : false;
    const matches = !normalizedTerm.length || titleMatches || linkMatches;

    if (!normalizedTerm.length) {
      link.innerHTML = originalTitle;
    } else if (titleMatches) {
      const highlightRegex = new RegExp(`(${escapeRegExp(trimmedTerm)})`, 'gi');
      link.innerHTML = originalTitle.replace(highlightRegex, '<mark class="search-highlight">$1</mark>');
    } else {
      link.innerHTML = originalTitle;
    }

    article.style.display = matches ? '' : 'none';
    if (matches) visibleCount += 1;
  });

  if (filterStatus) {
    if (normalizedTerm.length && visibleCount === 0) {
      filterStatus.hidden = false;
      filterStatus.textContent = `No articles found for "${trimmedTerm}".`;
    } else if (normalizedTerm.length) {
      filterStatus.hidden = false;
      filterStatus.textContent = `Showing ${visibleCount} article${visibleCount === 1 ? '' : 's'} matching "${trimmedTerm}".`;
    } else {
      filterStatus.hidden = true;
      filterStatus.textContent = '';
    }
  }
}

// 11) Load all selected feeds
async function loadNews() {
  const container = document.getElementById('news-feed');
  const loadingIndicator = document.getElementById('loading-indicator');
  const filterStatus = document.getElementById('filter-status');
  
  // Clear previous content and reset filter messaging
  container.innerHTML = '';
  if (filterStatus) {
    filterStatus.hidden = true;
    filterStatus.textContent = '';
  }
  const selected = getFeedsInOrder(true);
  if (!selected.length) {
    if (loadingIndicator) {
      loadingIndicator.classList.remove('visible');
      loadingIndicator.setAttribute('aria-hidden', 'true');
    }
    clearInterval(animationInterval);
    const emptyMessage = document.createElement('p');
    emptyMessage.className = 'status';
    emptyMessage.textContent = 'Select at least one feed from the sidebar to populate the news feed.';
    container.appendChild(emptyMessage);
    applyFeedOrderToDom();
    return;
  }

  if (loadingIndicator) {
    loadingIndicator.classList.add('visible');
    loadingIndicator.setAttribute('aria-hidden', 'false');
  }
  animatePassword();

  const results = await Promise.all(selected.map(f => handleFeed(f)));
  
  // Hide loading indicator and render results
  if (loadingIndicator) {
    loadingIndicator.classList.remove('visible');
    loadingIndicator.setAttribute('aria-hidden', 'true');
  }
  clearInterval(animationInterval);
  
  results.forEach(section => container.appendChild(section));

  const searchBar = document.getElementById('search-bar');
  if (searchBar) {
    applySearchFilter(searchBar.value);
  }

  applyFeedOrderToDom();
}

// 12) Init on page load
document.addEventListener('DOMContentLoaded', async () => {
  loadPasswordList().catch(() => {});
  renderFeedForm();

  const searchBar = document.getElementById('search-bar');
  const savedTerm = localStorage.getItem('newsSearchTerm');
  if (searchBar && savedTerm) {
    searchBar.value = savedTerm;
  }

  if (searchBar) {
    searchBar.addEventListener('input', () => {
      if (searchBar.value) {
        localStorage.setItem('newsSearchTerm', searchBar.value);
      } else {
        localStorage.removeItem('newsSearchTerm');
      }
      applySearchFilter(searchBar.value);
    });
  }

  await loadNews();
});
function getAllCategories() {
  return Array.from(new Set(feeds.map(feed => feed.category || 'Feeds')));
}

function renderCategoryChips(container) {
  if (!container) return;
  container.innerHTML = '';
  const categories = getAllCategories();
  categories.forEach(category => {
    const colors = getCategoryColors(category);
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'feed-category-chip';
    chip.dataset.category = category;
    chip.textContent = category;
    const isActive = activeFeedCategories.includes(category);
    chip.dataset.state = isActive ? 'active' : 'inactive';
    if (isActive) {
      chip.style.borderColor = colors.border;
      chip.style.background = colors.border;
      chip.style.color = '#fff';
      chip.style.opacity = '1';
    } else {
      chip.style.borderColor = 'var(--muted-color)';
      chip.style.background = 'transparent';
      chip.style.color = 'var(--muted-color)';
      chip.style.opacity = '0.5';
    }
    container.appendChild(chip);
  });
}

function toggleCategory(category) {
  const index = activeFeedCategories.indexOf(category);
  if (index === -1) {
    activeFeedCategories.push(category);
  } else {
    activeFeedCategories.splice(index, 1);
  }
  if (!activeFeedCategories.length) {
    activeFeedCategories = getAllCategories();
  }
  localStorage.setItem('activeFeedCategories', JSON.stringify(activeFeedCategories));
}

function isFeedInActiveCategory(url) {
  const feed = feedMap.get(url);
  const category = feed ? (feed.category || 'Feeds') : 'Feeds';
  return activeFeedCategories.includes(category);
}
