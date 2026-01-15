// news.js - Refactored for Intelligence Console UI

// ============================================
// FEED CONFIGURATION
// ============================================

const feeds = [
  { url: 'https://krebsonsecurity.com/feed/', name: 'Krebs on Security', category: 'Newsrooms' },
  { url: 'https://www.bleepingcomputer.com/feed/', name: 'BleepingComputer', category: 'Newsrooms' },
  { url: 'https://www.theregister.com/security/headlines.atom', name: 'The Register Security', category: 'Industry Press' },
  { url: 'https://hnrss.org/newest?points=50&q=security', name: 'Hacker News', category: 'Communities' },
  { url: 'https://threatpost.com/feed/', name: 'ThreatPost', category: 'Newsrooms' },
  { url: 'https://www.darkreading.com/rss.xml', name: 'Dark Reading', category: 'Analysis & Research' },
  { url: 'https://feeds.feedburner.com/Securityweek', name: 'SecurityWeek', category: 'Newsrooms' }
];

const feedMap = new Map(feeds.map(feed => [feed.url, feed]));
const DEFAULT_FEED_ORDER = feeds.map(feed => feed.url);

// ============================================
// COLOR GENERATION
// ============================================

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

// Pre-generate colors
feedOrder = (() => {
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

// ============================================
// STATE MANAGEMENT
// ============================================

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

// Sort state
let currentSort = localStorage.getItem('sortMode') || 'newest';

// Feed status tracking
const feedStatus = new Map();
let lastUpdateTime = null;

// ============================================
// PROXY & PARSER
// ============================================

const CORS_PROXY = "https://api.allorigins.win/raw?url=";
const parser = new RSSParser();
const PASSWORD_WORDLIST_URL = 'top_1000_passwords.txt';

const fallbackPasswords = [
  '123456', 'password', '123456789', 'qwerty', '12345',
  '12345678', '111111', '1234567', 'sunshine', 'iloveyou',
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

// ============================================
// FEED PANEL
// ============================================

function renderFeedForm() {
  const panelHeader = document.querySelector('#feed-settings .panel-header');
  const panelContent = document.getElementById('feed-panel-content');

  if (!panelHeader || !panelContent) return;

  // Set initial expanded state
  panelHeader.setAttribute('aria-expanded', feedPanelOpen ? 'true' : 'false');

  // Toggle handler
  if (!panelHeader.dataset.bound) {
    panelHeader.addEventListener('click', () => {
      feedPanelOpen = !feedPanelOpen;
      panelHeader.setAttribute('aria-expanded', feedPanelOpen ? 'true' : 'false');
      localStorage.setItem('feedPanelOpen', feedPanelOpen ? 'true' : 'false');
    });
    panelHeader.dataset.bound = 'true';
  }

  // Feed actions
  const feedActions = panelContent.querySelector('.feed-actions');
  if (feedActions && !feedActions.dataset.bound) {
    feedActions.addEventListener('click', event => {
      const button = event.target.closest('button[data-action]');
      if (!button) return;

      event.preventDefault();
      const action = button.dataset.action;

      if (action === 'select-all') {
        selectedFeeds = feedOrder.filter(url => isFeedInActiveCategory(url));
      } else if (action === 'select-none') {
        selectedFeeds = [];
      }

      localStorage.setItem('selectedFeeds', JSON.stringify(selectedFeeds));
      renderFeedOptions(feedOptionsContainer);
      updateFeedStatusCount();
      loadNews();
    });
    feedActions.dataset.bound = 'true';
  }

  // Category chips
  const chipContainer = panelContent.querySelector('.feed-category-chips');
  if (chipContainer && !chipContainer.dataset.bound) {
    renderCategoryChips(chipContainer);
    chipContainer.addEventListener('click', event => {
      const chip = event.target.closest('.feed-category-chip');
      if (chip && chip.dataset.category) {
        toggleCategory(chip.dataset.category);
        renderCategoryChips(chipContainer);
        renderFeedOptions(feedOptionsContainer);
        updateFeedStatusCount();
        loadNews();
      }
    });
    chipContainer.dataset.bound = 'true';
  }

  // Feed search
  const searchInput = panelContent.querySelector('.feed-search');
  if (searchInput) {
    searchInput.value = feedFilterTerm;
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

  // Feed list
  feedOptionsContainer = document.getElementById('feed-list');
  renderFeedOptions(feedOptionsContainer);
  updateFeedStatusCount();
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

    const borderColor = (active && isSelected) ? feedColors.primary : (active ? 'var(--color-border)' : 'transparent');
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

    // Event handlers
    checkbox.addEventListener('change', handleFeedCheckboxChange);
    upBtn.addEventListener('click', (e) => handleFeedMove(e, feed, 'up'));
    downBtn.addEventListener('click', (e) => handleFeedMove(e, feed, 'down'));

    container.appendChild(option);
  });

  if (!renderedCount) {
    const emptyMessage = document.createElement('p');
    emptyMessage.className = 'status';
    emptyMessage.textContent = 'No feeds match that filter.';
    container.appendChild(emptyMessage);
  }
}

function handleFeedCheckboxChange(event) {
  const checkbox = event.target;
  const url = checkbox.value;

  if (checkbox.checked) {
    if (!selectedFeeds.includes(url)) {
      selectedFeeds.push(url);
    }
  } else {
    selectedFeeds = selectedFeeds.filter(u => u !== url);
  }

  localStorage.setItem('selectedFeeds', JSON.stringify(selectedFeeds));
  updateFeedStatusCount();
  loadNews();
}

function handleFeedMove(event, feed, direction) {
  event.preventDefault();
  const currentIndex = feedOrder.indexOf(feed.url);
  if (currentIndex === -1) return;

  if (direction === 'up' && currentIndex > 0) {
    [feedOrder[currentIndex - 1], feedOrder[currentIndex]] = [feedOrder[currentIndex], feedOrder[currentIndex - 1]];
  } else if (direction === 'down' && currentIndex < feedOrder.length - 1) {
    [feedOrder[currentIndex + 1], feedOrder[currentIndex]] = [feedOrder[currentIndex], feedOrder[currentIndex + 1]];
  } else {
    return;
  }

  localStorage.setItem('feedOrder', JSON.stringify(feedOrder));
  renderFeedOptions(feedOptionsContainer);
  applyFeedOrderToDom();
}

function applyFeedOrderToDom() {
  const container = document.getElementById('news-feed');
  if (!container) return;

  const sectionMap = new Map(
    Array.from(container.querySelectorAll('.feed-section'))
      .map(section => [section.id, section])
  );

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

function updateFeedStatusCount() {
  const countEl = document.getElementById('feed-status-count');
  if (countEl) {
    const activeCount = selectedFeeds.filter(url => isFeedInActiveCategory(url)).length;
    const totalCount = feeds.length;
    countEl.textContent = `${activeCount}/${totalCount}`;
  }
}

// ============================================
// CATEGORY CHIPS
// ============================================

function getAllCategories() {
  return Array.from(new Set(feeds.map(feed => feed.category || 'Feeds')));
}

function renderCategoryChips(container) {
  if (!container) return;
  container.innerHTML = '';

  const categories = getAllCategories();
  categories.forEach(category => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'feed-category-chip';
    chip.dataset.category = category;
    chip.textContent = category;

    const isActive = activeFeedCategories.includes(category);
    chip.dataset.state = isActive ? 'active' : 'inactive';

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

// ============================================
// FETCH & PARSE
// ============================================

function feedKey(feed) {
  return btoa(feed.url).replace(/=/g, '');
}

async function fetchXml(feed) {
  const startTime = Date.now();
  const maxRetries = 3;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetch(CORS_PROXY + encodeURIComponent(feed.url));
      if (!res.ok) throw new Error(`Proxy ${res.status}`);

      const elapsed = Date.now() - startTime;
      feedStatus.set(feed.url, { status: elapsed > 3000 ? 'slow' : 'loaded', time: elapsed });

      return await res.text();
    } catch (err) {
      console.warn(`Fetch attempt ${i + 1} failed for ${feed.name}:`, err);
      if (i === maxRetries - 1) {
        feedStatus.set(feed.url, { status: 'failed', error: err.message });
        err.isProxyError = true;
        throw err;
      }
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
}

async function parseXml(xml) {
  try {
    return await parser.parseString(xml);
  } catch (err) {
    err.isParserError = true;
    throw err;
  }
}

// ============================================
// SKELETON PLACEHOLDERS
// ============================================

function createSkeletonArticles(count = 3) {
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < count; i++) {
    const skeleton = document.createElement('div');
    skeleton.className = 'skeleton-article';
    skeleton.innerHTML = `
      <div class="skeleton skeleton-title"></div>
      <div class="skeleton skeleton-meta"></div>
    `;
    fragment.appendChild(skeleton);
  }

  return fragment;
}

// ============================================
// RENDER ITEMS
// ============================================

function renderItems(section, feedName, items) {
  // Clear existing content
  section.querySelectorAll('.retry-button, article, .skeleton-article').forEach(el => el.remove());

  if (!items.length) {
    const none = document.createElement('p');
    none.className = 'status';
    none.textContent = 'No items found.';
    section.appendChild(none);
    return;
  }

  items.slice(0, 5).forEach(item => {
    const art = document.createElement('article');
    art.dataset.pubDate = item.pubDate ? new Date(item.pubDate).getTime() : 0;
    art.dataset.source = feedName;

    const pubDate = new Date(item.pubDate);
    const formattedDate = `${(pubDate.getMonth() + 1).toString().padStart(2, '0')}-${pubDate.getDate().toString().padStart(2, '0')}-${pubDate.getFullYear()}`;

    let hours = pubDate.getHours();
    const minutes = pubDate.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;

    art.innerHTML = `
      <header><h3><a href="${item.link}" target="_blank" rel="noopener">${item.title}</a></h3></header>
      <footer>
        <small>${formattedDate} - ${hours}:${minutes} ${ampm} | ${feedName}${item.author ? ` - ${item.author}` : ''}</small>
      </footer>
    `;

    const link = art.querySelector('a');
    if (link) {
      link.dataset.originalTitle = item.title;
    }

    section.appendChild(art);
  });
}

// ============================================
// HANDLE FEED
// ============================================

async function handleFeed(feed) {
  const container = document.getElementById('news-feed');
  const sectionId = 'sec-' + feedKey(feed);

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

    // Add skeleton placeholders
    section.appendChild(createSkeletonArticles(3));

    container.appendChild(section);
  }

  const colors = getFeedColors(feed.url);
  section.style.borderLeftColor = colors.primary;
  section.classList.remove('feed-error');

  const cacheKey = 'xmlCache_' + feedKey(feed);
  const raw = localStorage.getItem(cacheKey);

  // Render from cache immediately
  if (raw) {
    try {
      const { xml } = JSON.parse(raw);
      const data = await parseXml(xml);
      section.querySelectorAll('.status, .skeleton-article').forEach(el => el.remove());
      renderItems(section, feed.name, data.items);
    } catch (e) {
      console.warn('Cache parse error', e);
    }
  }

  // Fetch fresh in background
  try {
    const freshXml = await fetchXml(feed);
    const prevXml = raw ? JSON.parse(raw).xml : null;

    if (freshXml !== prevXml) {
      localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), xml: freshXml }));
      const freshData = await parseXml(freshXml);
      section.querySelectorAll('.status, article, .skeleton-article').forEach(n => n.remove());
      renderItems(section, feed.name, freshData.items);
    }

    lastUpdateTime = new Date();
    updateSystemStatus();
  } catch (err) {
    section.querySelectorAll('.retry-button, .skeleton-article').forEach(el => el.remove());

    console.error(`Failed to update ${feed.name}`, err);

    // Only show error if we don't have cached content
    if (!section.querySelector('article')) {
      const status = document.createElement('p');
      status.className = 'status error';

      if (err.isProxyError) {
        status.textContent = `Couldn't load ${feed.name}: News CORS proxy unavailable.`;
      } else if (err.isParserError) {
        status.textContent = `Couldn't load ${feed.name}: RSS parser failed.`;
      } else {
        status.textContent = `Couldn't load ${feed.name}.`;
      }

      section.appendChild(status);
      section.classList.add('feed-error');
    }

    const retryButton = document.createElement('button');
    retryButton.textContent = 'Retry';
    retryButton.classList.add('retry-button');
    retryButton.addEventListener('click', () => handleFeed(feed));
    section.appendChild(retryButton);

    updateSystemStatus();
  }

  return section;
}

// ============================================
// SYSTEM STATUS
// ============================================

function updateSystemStatus() {
  // Update last updated time
  const lastUpdatedEl = document.getElementById('last-updated');
  if (lastUpdatedEl && lastUpdateTime) {
    const now = new Date();
    const diff = Math.floor((now - lastUpdateTime) / 1000);

    if (diff < 60) {
      lastUpdatedEl.textContent = 'Just now';
    } else if (diff < 3600) {
      const mins = Math.floor(diff / 60);
      lastUpdatedEl.textContent = `${mins}m ago`;
    } else {
      lastUpdatedEl.textContent = lastUpdateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  }

  // Update feed health indicators
  const feedHealthEl = document.getElementById('feed-health');
  if (feedHealthEl) {
    const loaded = Array.from(feedStatus.values()).filter(s => s.status === 'loaded').length;
    const slow = Array.from(feedStatus.values()).filter(s => s.status === 'slow').length;
    const failed = Array.from(feedStatus.values()).filter(s => s.status === 'failed').length;

    feedHealthEl.innerHTML = '';

    if (loaded > 0) {
      const indicator = document.createElement('span');
      indicator.className = 'feed-status-indicator loaded';
      indicator.textContent = `${loaded} OK`;
      feedHealthEl.appendChild(indicator);
    }

    if (slow > 0) {
      const indicator = document.createElement('span');
      indicator.className = 'feed-status-indicator slow';
      indicator.textContent = `${slow} Slow`;
      feedHealthEl.appendChild(indicator);
    }

    if (failed > 0) {
      const indicator = document.createElement('span');
      indicator.className = 'feed-status-indicator failed';
      indicator.textContent = `${failed} Failed`;
      feedHealthEl.appendChild(indicator);
    }
  }
}

// ============================================
// SEARCH & FILTER
// ============================================

function escapeRegExp(string) {
  return string.replace(/([.*+?^${}()|[\]\\])/g, '\\$1');
}

function applySearchFilter(rawTerm = '') {
  const searchBar = document.getElementById('search-bar');
  const filterStatus = document.getElementById('filter-status');
  const searchClear = document.getElementById('search-clear');
  const emptyState = document.getElementById('empty-state');

  const termFromInput = typeof rawTerm === 'string' ? rawTerm : (searchBar ? searchBar.value : '');
  const trimmedTerm = termFromInput.trim();
  const normalizedTerm = trimmedTerm.toLowerCase();
  const articles = document.querySelectorAll('#news-feed article');
  let visibleCount = 0;

  // Show/hide clear button
  if (searchClear) {
    searchClear.hidden = !trimmedTerm;
  }

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

  // Update filter status
  if (filterStatus) {
    if (normalizedTerm.length) {
      filterStatus.hidden = false;
      filterStatus.textContent = `${visibleCount} result${visibleCount === 1 ? '' : 's'}`;
    } else {
      filterStatus.hidden = true;
      filterStatus.textContent = '';
    }
  }

  // Show empty state if no results and no articles at all
  if (emptyState) {
    const hasArticles = document.querySelectorAll('#news-feed article').length > 0;
    emptyState.hidden = hasArticles || visibleCount > 0 || selectedFeeds.length === 0;
  }
}

function initSearchFilter() {
  const searchBar = document.getElementById('search-bar');
  const searchClear = document.getElementById('search-clear');
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

  if (searchClear) {
    searchClear.addEventListener('click', () => {
      if (searchBar) {
        searchBar.value = '';
        localStorage.removeItem('newsSearchTerm');
        applySearchFilter('');
        searchBar.focus();
      }
    });
  }
}

// ============================================
// SORTING
// ============================================

function initSortControl() {
  const sortSelect = document.getElementById('sort-select');
  if (!sortSelect) return;

  sortSelect.value = currentSort;

  sortSelect.addEventListener('change', () => {
    currentSort = sortSelect.value;
    localStorage.setItem('sortMode', currentSort);
    applySorting();
  });
}

function applySorting() {
  const container = document.getElementById('news-feed');
  if (!container) return;

  const sections = Array.from(container.querySelectorAll('.feed-section'));

  if (currentSort === 'source') {
    // Sort sections alphabetically by feed name
    sections.sort((a, b) => {
      const nameA = a.querySelector('h2')?.textContent || '';
      const nameB = b.querySelector('h2')?.textContent || '';
      return nameA.localeCompare(nameB);
    });
  } else {
    // For newest/oldest, sort articles within each section
    sections.forEach(section => {
      const articles = Array.from(section.querySelectorAll('article'));
      articles.sort((a, b) => {
        const dateA = parseInt(a.dataset.pubDate) || 0;
        const dateB = parseInt(b.dataset.pubDate) || 0;
        return currentSort === 'newest' ? dateB - dateA : dateA - dateB;
      });
      articles.forEach(article => section.appendChild(article));
    });

    // Then apply feed order
    applyFeedOrderToDom();
    return;
  }

  sections.forEach(section => container.appendChild(section));
}

// ============================================
// LOADING ANIMATION
// ============================================

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

// ============================================
// LOAD NEWS
// ============================================

async function loadNews() {
  const container = document.getElementById('news-feed');
  const loadingIndicator = document.getElementById('loading-indicator');
  const emptyState = document.getElementById('empty-state');

  // Clear previous content
  container.innerHTML = '';
  feedStatus.clear();

  if (emptyState) {
    emptyState.hidden = true;
  }

  const selected = getFeedsInOrder(true);

  if (!selected.length) {
    if (loadingIndicator) {
      loadingIndicator.classList.remove('visible');
      loadingIndicator.setAttribute('aria-hidden', 'true');
    }
    clearInterval(animationInterval);

    if (emptyState) {
      emptyState.hidden = false;
    }

    return;
  }

  if (loadingIndicator) {
    loadingIndicator.classList.add('visible');
    loadingIndicator.setAttribute('aria-hidden', 'false');
  }
  animatePassword();

  // Fetch feeds incrementally
  const results = await Promise.all(selected.map(f => handleFeed(f)));

  // Hide loading indicator
  if (loadingIndicator) {
    loadingIndicator.classList.remove('visible');
    loadingIndicator.setAttribute('aria-hidden', 'true');
  }
  clearInterval(animationInterval);

  // Apply search filter and sorting
  const searchBar = document.getElementById('search-bar');
  if (searchBar) {
    applySearchFilter(searchBar.value);
  }

  applySorting();
  updateSystemStatus();
}

// ============================================
// BACK TO TOP
// ============================================

function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
  // Load password list
  loadPasswordList().catch(() => {});

  // Initialize UI components
  renderFeedForm();
  initSearchFilter();
  initSortControl();
  initBackToTop();

  // Load news
  await loadNews();
});
