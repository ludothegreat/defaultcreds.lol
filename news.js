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

// Common helper function to generate HSL color string
function generateHslColor(hue, saturation, lightness) {
  const roundedHue = Math.round(hue * 100) / 100;
  return `hsl(${roundedHue}, ${saturation}%, ${lightness}%)`;
}

// Common helper function to calculate hue from a string hash
function calculateHueFromString(str, multiplier = 1) {
  const hash = hashStringToInt(str);
  return ((hash * multiplier) % 360 + 360) % 360;
}

function getFeedColors(url) {
  if (feedColorCache.has(url)) return feedColorCache.get(url);
  const baseHue = reserveHue(hashStringToInt(url));
  const colors = {
    primary: generateHslColor(baseHue, 68, 52),
    soft: generateHslColor(baseHue, 85, 88),
    badgeText: generateHslColor(baseHue, 55, 28)
  };
  feedColorCache.set(url, colors);
  return colors;
}

function getCategoryColors(name) {
  const key = name || 'Feeds';
  if (categoryColorCache.has(key)) return categoryColorCache.get(key);
  const hue = calculateHueFromString(key, 7);
  const colors = {
    border: generateHslColor(hue, 32, 46),
    fill: generateHslColor(hue, 28, 92),
    text: generateHslColor(hue, 40, 28)
  };
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

// Save defaults to localStorage to ensure state consistency
if (!storedActiveCategories) {
  localStorage.setItem('activeFeedCategories', JSON.stringify(activeFeedCategories));
}

if (!storedSelectedFeedsValue) {
  DEFAULT_FEED_ORDER.forEach(url => {
    if (!selectedFeeds.includes(url)) selectedFeeds.push(url);
  });
  // Save defaults to localStorage to ensure state consistency
  localStorage.setItem('selectedFeeds', JSON.stringify(selectedFeeds));
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

// Message type to file mapping
const MESSAGE_DATA_FILES = {
  '[>] Cracking password...': 'cracking_passwords.txt',
  '[>] Brute forcing credentials...': 'brute_force_creds.txt',
  '[>] Testing password hash...': 'password_hashes.txt',
  '[>] Decrypting credentials...': 'decrypting_creds.txt',
  '[>] Bypassing authentication...': 'bypassing_auth.txt',
  '[>] Exploiting default creds...': 'default_creds.txt',
  '[>] Scanning for weak passwords...': 'weak_passwords.txt',
  '[>] Injecting credential payload...': 'injection_payloads.txt'
};

// Fallback data for each message type
const fallbackData = {
  '[>] Cracking password...': ['123456', 'password', '123456789', 'qwerty', '12345'],
  '[>] Brute forcing credentials...': ['admin:admin', 'root:root', 'user:password', 'guest:guest', 'test:test'],
  '[>] Testing password hash...': ['$2b$10$abcdefghijklmnopqrstuv', '$5$rounds=5000$salt$hash', 'a1b2c3d4e5f6'],
  '[>] Decrypting credentials...': ['ENC(abc123)', '{encrypted}xyz789', 'ciphertext:def456'],
  '[>] Bypassing authentication...': ['Bearer token123', 'session_id=abc', 'api_key_xyz'],
  '[>] Exploiting default creds...': ['admin:admin', 'root:password', 'administrator:admin'],
  '[>] Scanning for weak passwords...': ['password', '123456', 'qwerty', 'abc123', 'password1'],
  '[>] Injecting credential payload...': ["admin' OR '1'='1", "admin'--", "' OR 1=1--"]
};

// Store loaded data for each message type
const messageDataCache = {};
const dataLoadPromises = {};

function loadMessageData(messageType) {
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

// Preload all data files
function preloadAllMessageData() {
  const messages = Object.keys(MESSAGE_DATA_FILES);
  return Promise.all(messages.map(msg => loadMessageData(msg).catch(() => {})));
}

// ============================================
// FEED PANEL
// ============================================

function renderFeedForm() {
  const panelContent = document.getElementById('feed-panel-content');

  if (!panelContent) return;

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

  // Category filter popup
  const filterBtn = document.getElementById('feed-filter-btn');
  const filterPopup = document.getElementById('feed-filter-popup');
  const filterPopupContent = filterPopup?.querySelector('.feed-filter-popup-content');
  
  if (filterBtn && filterPopup && filterPopupContent && !filterBtn.dataset.bound) {
    // Render category checkboxes in popup
    function renderFilterPopup() {
      if (!filterPopupContent) return;
      filterPopupContent.innerHTML = '';
      
      const categories = getAllCategories();
      categories.forEach(category => {
        const label = document.createElement('label');
        label.className = 'feed-filter-checkbox-label';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = category;
        checkbox.checked = activeFeedCategories.includes(category);
        checkbox.className = 'feed-filter-checkbox';
        
        const span = document.createElement('span');
        span.textContent = category;
        
        label.appendChild(checkbox);
        label.appendChild(span);
        filterPopupContent.appendChild(label);
        
        checkbox.addEventListener('change', () => {
          toggleCategory(category);
          renderFilterPopup(); // Re-render to update all checkboxes
          renderFeedOptions(feedOptionsContainer);
          updateFeedStatusCount();
          loadNews();
        });
      });
    }
    
    // Toggle popup
    filterBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isExpanded = filterBtn.getAttribute('aria-expanded') === 'true';
      
      if (isExpanded) {
        filterBtn.setAttribute('aria-expanded', 'false');
        filterPopup.setAttribute('hidden', '');
      } else {
        filterBtn.setAttribute('aria-expanded', 'true');
        filterPopup.removeAttribute('hidden');
        renderFilterPopup();
      }
    });
    
    // Close popup when clicking outside
    document.addEventListener('click', (e) => {
      if (!filterPopup.contains(e.target) && e.target !== filterBtn) {
        filterBtn.setAttribute('aria-expanded', 'false');
        filterPopup.setAttribute('hidden', '');
      }
    });
    
    filterBtn.dataset.bound = 'true';
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

    // No border color needed - using background indicators instead

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
    nameSpan.className = 'feed-name';
    if (normalizedFilter) {
      const highlightRegex = new RegExp(`(${escapeRegExp(feedFilterTerm.trim())})`, 'gi');
      nameSpan.innerHTML = feed.name.replace(highlightRegex, '<mark class="search-highlight">$1</mark>');
    } else {
      nameSpan.textContent = feed.name;
    }

    label.append(checkbox, nameSpan);
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
  renderFeedOptions(feedOptionsContainer); // Update visual state immediately
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

function glitchText(text, intensity = 0.1) {
  const glitchChars = '█▓▒░▄▀▌▐║╗╝╚╔╩╦╠═╬0123456789!@#$%^&*';
  let glitched = '';
  for (let i = 0; i < text.length; i++) {
    if (Math.random() < intensity) {
      glitched += glitchChars[Math.floor(Math.random() * glitchChars.length)];
    } else {
      glitched += text[i];
    }
  }
  return glitched;
}

function animateSkeletonPassword(passwordInput, messageType, delay = 0) {
  if (!passwordInput) return;
  
  // Get the data list for this message type
  const dataList = messageDataCache[messageType] || fallbackData[messageType] || fallbackData['[>] Cracking password...'];
  
  if (!dataList || dataList.length === 0) {
    // If data not loaded yet, try to load it and retry
    loadMessageData(messageType).then(() => {
      animateSkeletonPassword(passwordInput, messageType, delay);
    });
    return;
  }
  
  // Each skeleton gets completely different timing
  let i = Math.floor(Math.random() * dataList.length);
  const baseSpeed = 120 + Math.random() * 180; // 120-300ms per password (wider range)
  let currentSpeed = baseSpeed;
  
  // Random initial delay - much more varied
  const initialDelay = delay + Math.random() * 800;
  
  setTimeout(() => {
    const updatePassword = () => {
      if (passwordInput.parentElement && passwordInput.parentElement.closest('.skeleton-article')) {
        passwordInput.value = dataList[i];
        i = (i + 1) % dataList.length;
        
        // Occasionally vary the speed for more independence
        if (Math.random() < 0.1) {
          currentSpeed = baseSpeed + (Math.random() * 100 - 50); // ±50ms variation
        }
        
        setTimeout(updatePassword, currentSpeed);
      }
    };
    
    updatePassword();
  }, initialDelay);
}

function applyGlitchEffects(section) {
  const skeletons = section.querySelectorAll('.skeleton-article');
  skeletons.forEach((skeleton, index) => {
    const commandEl = skeleton.querySelector('.skeleton-command');
    const progressTextEl = skeleton.querySelector('.skeleton-progress-text');
    const metaTextEl = skeleton.querySelector('.skeleton-meta-text');
    const passwordInput = skeleton.querySelector('.skeleton-password-input');
    const progressBar = skeleton.querySelector('.skeleton-progress-bar');
    
    // Each skeleton gets completely independent timing - use index-based randomization
    // This ensures each skeleton has different behavior
    const baseRandom = () => Math.random();
    const indexOffset = index * 0.3; // Offset based on index
    
    // Animation timing constants (extracted from magic numbers)
    const ANIMATION_DELAYS = {
      COMMAND_MAX_DELAY: 600,           // Max initial delay for command glitch (ms)
      COMMAND_GLITCH_MIN: 30,           // Min timeout for command glitch reset (ms)
      COMMAND_GLITCH_MAX: 170,          // Max timeout for command glitch reset (ms)
      PROGRESS_TEXT_DELAY_MAX: 800,     // Max delay for progress text animation (ms)
      PROGRESS_TEXT_RESET_MIN: 40,      // Min timeout for progress text reset (ms)
      PROGRESS_TEXT_RESET_MAX: 140      // Max timeout for progress text reset (ms)
    };
    
    const ANIMATION_PROBABILITIES = {
      COMMAND_BASE: 0.25,               // Base probability for command glitch
      COMMAND_INDEX_MULTIPLIER: 0.1,    // Probability increase per index
      PROGRESS_BASE: 0.2,               // Base probability for progress text glitch
      PROGRESS_INDEX_MULTIPLIER: 0.08   // Probability increase per index
    };
    
    const GLITCH_INTENSITY = {
      COMMAND_MIN: 0.1,                 // Min glitch intensity for commands
      COMMAND_MAX: 0.2,                 // Max glitch intensity for commands
      PROGRESS_MIN: 0.15,               // Min glitch intensity for progress text
      PROGRESS_MAX: 0.2                 // Max glitch intensity for progress text
    };
    
    // Animate password for this skeleton with much more varied delay
    if (passwordInput) {
      const messageType = skeleton.dataset.messageType || '[>] Cracking password...';
      const passwordDelay = index * 400 + baseRandom() * 1200; // Much wider range: 0-3600ms
      animateSkeletonPassword(passwordInput, messageType, passwordDelay);
    }
    
    // Independent progress bar animation - each progresses at different rate
    if (progressBar) {
      const initialWidth = parseFloat(progressBar.style.width) || (10 + baseRandom() * 40);
      let currentWidth = initialWidth;
      const progressSpeed = 600 + baseRandom() * 2400; // 600-3000ms per update (very varied)
      const progressIncrement = 0.3 + baseRandom() * 2.7; // 0.3-3% per update
      
      const animateProgress = () => {
        if (skeleton.parentElement && currentWidth < 100) {
          currentWidth += progressIncrement;
          if (currentWidth > 100) currentWidth = 100;
          progressBar.style.width = currentWidth + '%';
          
          // Update progress text
          if (progressTextEl) {
            progressTextEl.textContent = Math.floor(currentWidth) + '%';
            progressTextEl.dataset.original = Math.floor(currentWidth) + '%';
          }
          
          // Variable delay for next update
          const nextDelay = progressSpeed + (baseRandom() * 600 - 300); // ±300ms variation
          setTimeout(animateProgress, nextDelay);
        }
      };
      
      // Start at different times
      setTimeout(animateProgress, baseRandom() * 800);
    }
    
    // Add random screen flicker to entire skeleton - independent timing
    const flickerInterval = 200 + baseRandom() * 1800; // 200-2000ms (very varied)
    const flickerDelay = baseRandom() * 1000; // Initial delay 0-1000ms
    setTimeout(() => {
      setInterval(() => {
        if (baseRandom() < 0.1 + indexOffset * 0.05) { // 10-25% chance (varies by index)
          skeleton.style.filter = 'brightness(' + (1.2 + baseRandom() * 0.5) + ') contrast(' + (1.1 + baseRandom() * 0.4) + ')';
          skeleton.style.transform = 'translateX(' + ((baseRandom() * 5 - 2.5)) + 'px) translateY(' + ((baseRandom() * 3 - 1.5)) + 'px)';
          setTimeout(() => {
            skeleton.style.filter = '';
            skeleton.style.transform = '';
          }, 20 + baseRandom() * 150);
        }
      }, flickerInterval);
    }, flickerDelay);
    
    if (commandEl) {
      const original = commandEl.dataset.original || commandEl.textContent;
      const commandInterval = 250 + baseRandom() * 1500; // 250-1750ms
      const commandDelay = baseRandom() * ANIMATION_DELAYS.COMMAND_MAX_DELAY;
      setTimeout(() => {
        setInterval(() => {
          const glitchProbability = ANIMATION_PROBABILITIES.COMMAND_BASE + indexOffset * ANIMATION_PROBABILITIES.COMMAND_INDEX_MULTIPLIER;
          if (baseRandom() < glitchProbability) {
            const glitchIntensity = GLITCH_INTENSITY.COMMAND_MIN + baseRandom() * (GLITCH_INTENSITY.COMMAND_MAX - GLITCH_INTENSITY.COMMAND_MIN);
            commandEl.textContent = glitchText(original, glitchIntensity);
            commandEl.style.color = ['var(--color-error)', 'var(--color-warning)', 'var(--color-accent)', 'var(--color-success)'][Math.floor(baseRandom() * 4)];
            const resetDelay = ANIMATION_DELAYS.COMMAND_GLITCH_MIN + baseRandom() * (ANIMATION_DELAYS.COMMAND_GLITCH_MAX - ANIMATION_DELAYS.COMMAND_GLITCH_MIN);
            setTimeout(() => {
              commandEl.textContent = original;
              commandEl.style.color = '';
            }, resetDelay);
          }
        }, commandInterval);
      }, commandDelay);
    }
    
    if (progressTextEl) {
      const original = progressTextEl.dataset.original || progressTextEl.textContent;
      const progressTextInterval = 400 + baseRandom() * 2000; // 400-2400ms
      const progressTextDelay = baseRandom() * ANIMATION_DELAYS.PROGRESS_TEXT_DELAY_MAX;
      setTimeout(() => {
        setInterval(() => {
          const glitchProbability = ANIMATION_PROBABILITIES.PROGRESS_BASE + indexOffset * ANIMATION_PROBABILITIES.PROGRESS_INDEX_MULTIPLIER;
          if (baseRandom() < glitchProbability) {
            const glitchIntensity = GLITCH_INTENSITY.PROGRESS_MIN + baseRandom() * (GLITCH_INTENSITY.PROGRESS_MAX - GLITCH_INTENSITY.PROGRESS_MIN);
            progressTextEl.textContent = glitchText(original, glitchIntensity);
            progressTextEl.style.transform = 'translateX(' + ((baseRandom() * 4 - 2)) + 'px)';
            const resetDelay = ANIMATION_DELAYS.PROGRESS_TEXT_RESET_MIN + baseRandom() * (ANIMATION_DELAYS.PROGRESS_TEXT_RESET_MAX - ANIMATION_DELAYS.PROGRESS_TEXT_RESET_MIN);
            setTimeout(() => {
              progressTextEl.textContent = original;
              progressTextEl.style.transform = '';
            }, resetDelay);
          }
        }, progressTextInterval);
      }, progressTextDelay);
    }
    
    if (metaTextEl) {
      const original = metaTextEl.dataset.original || metaTextEl.textContent;
      const metaInterval = 500 + baseRandom() * 2200; // 500-2700ms
      const metaDelay = baseRandom() * 1000;
      setTimeout(() => {
        setInterval(() => {
          if (baseRandom() < 0.15 + indexOffset * 0.1) { // 15-45% chance
            metaTextEl.textContent = glitchText(original, 0.08 + baseRandom() * 0.15);
            metaTextEl.style.filter = 'hue-rotate(' + ((baseRandom() * 90 - 45)) + 'deg)';
            setTimeout(() => {
              metaTextEl.textContent = original;
              metaTextEl.style.filter = '';
            }, 50 + baseRandom() * 180);
          }
        }, metaInterval);
      }, metaDelay);
    }
    
    // Random color flash on progress bar - independent timing
    if (progressBar) {
      const flashInterval = 600 + baseRandom() * 2400; // 600-3000ms
      const flashDelay = baseRandom() * 1200;
      setTimeout(() => {
        setInterval(() => {
          if (baseRandom() < 0.12 + indexOffset * 0.06) { // 12-30% chance
            const colors = [
              '0 0 12px var(--color-error), 0 0 20px var(--color-warning)',
              '0 0 8px var(--color-accent), 0 0 16px var(--color-success)',
              '0 0 10px var(--color-warning), 0 0 18px var(--color-error)',
              '0 0 6px var(--color-success), 0 0 14px var(--color-accent)'
            ];
            progressBar.style.boxShadow = colors[Math.floor(baseRandom() * colors.length)];
            progressBar.style.filter = 'brightness(' + (1.2 + baseRandom() * 0.5) + ')';
            setTimeout(() => {
              progressBar.style.boxShadow = '';
              progressBar.style.filter = '';
            }, 60 + baseRandom() * 240);
          }
        }, flashInterval);
      }, flashDelay);
    }
    
    // Glitch the password input occasionally - independent timing
    if (passwordInput) {
      const passwordGlitchInterval = 400 + baseRandom() * 2000; // 400-2400ms
      const passwordGlitchDelay = baseRandom() * 900;
      setTimeout(() => {
        setInterval(() => {
          if (baseRandom() < 0.15 + indexOffset * 0.08) { // 15-39% chance
            const original = passwordInput.value;
            passwordInput.value = glitchText(original, 0.2 + baseRandom() * 0.2);
            passwordInput.style.color = ['var(--color-error)', 'var(--color-warning)', 'var(--color-accent)', 'var(--color-success)'][Math.floor(baseRandom() * 4)];
            setTimeout(() => {
              passwordInput.value = original;
              passwordInput.style.color = '';
            }, 50 + baseRandom() * 150);
          }
        }, passwordGlitchInterval);
      }, passwordGlitchDelay);
    }
  });
}

function createSkeletonArticles(count = 3) {
  const fragment = document.createDocumentFragment();

  const hackMessages = [
    '[>] Cracking password...',
    '[>] Brute forcing credentials...',
    '[>] Testing password hash...',
    '[>] Decrypting credentials...',
    '[>] Bypassing authentication...',
    '[>] Exploiting default creds...',
    '[>] Scanning for weak passwords...',
    '[>] Injecting credential payload...'
  ];

  for (let i = 0; i < count; i++) {
    const skeleton = document.createElement('div');
    skeleton.className = 'skeleton-article';
    // Each skeleton gets a different message
    const messageIndex = (i + Math.floor(Math.random() * hackMessages.length)) % hackMessages.length;
    const message = hackMessages[messageIndex];
    // More varied starting progress - some start very low, some higher
    const progressWidth = 5 + Math.random() * 75; // Random progress 5-80% (wider range)
    const glitchIntensity = Math.random() * 0.3 + 0.1; // 0.1 to 0.4
    const skeletonId = 'skeleton-' + Date.now() + '-' + i + '-' + Math.random().toString(36).substr(2, 5);
    
    skeleton.innerHTML = `
      <div class="skeleton-header">
        <span class="skeleton-prompt">$</span>
        <span class="skeleton-command" data-original="${message}">${message}</span>
        <span class="skeleton-glitch-overlay"></span>
      </div>
      <div class="skeleton-progress">
        <div class="skeleton-progress-bar" style="width: ${progressWidth}%">
          <span class="skeleton-progress-glitch"></span>
        </div>
        <span class="skeleton-progress-text" data-original="${Math.floor(progressWidth)}%">${Math.floor(progressWidth)}%</span>
      </div>
      <div class="skeleton-password-line">
        <span class="skeleton-password-label">Trying:</span>
        <input type="text" class="skeleton-password-input" id="${skeletonId}-password" readonly tabindex="-1" />
      </div>
      <div class="skeleton-meta-line">
        <span class="skeleton-meta-text" data-original="[${String.fromCharCode(65 + i)}] Processing...">[${String.fromCharCode(65 + i)}] Processing...</span>
      </div>
    `;
    
    // Add glitch animation to this specific skeleton
    skeleton.dataset.glitchIntensity = glitchIntensity;
    skeleton.dataset.skeletonId = skeletonId;
    skeleton.dataset.messageType = message; // Store message type for data loading
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
    const skeletons = createSkeletonArticles(3);
    section.appendChild(skeletons);
    
    // Apply glitch effects to skeleton text
    applyGlitchEffects(section);

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
// Password animation is now integrated into skeleton loaders

// ============================================
// LOAD NEWS
// ============================================

async function loadNews() {
  const container = document.getElementById('news-feed');
  const emptyState = document.getElementById('empty-state');

  // Clear previous content
  container.innerHTML = '';
  feedStatus.clear();

  if (emptyState) {
    emptyState.hidden = true;
  }

  const selected = getFeedsInOrder(true);

  if (!selected.length) {
    if (emptyState) {
      emptyState.hidden = false;
    }
    return;
  }

  // Fetch feeds incrementally
  const results = await Promise.all(selected.map(f => handleFeed(f)));
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
// SIDEBAR HOVER & PIN
// ============================================

function initSidebar() {
  const sidebar = document.getElementById('sidebar');
  const sidebarPinBtn = document.getElementById('sidebar-pin');
  const hoverTrigger = document.querySelector('.sidebar-hover-trigger');
  const appLayout = document.querySelector('.app-layout');

  if (!sidebar || !sidebarPinBtn || !hoverTrigger || !appLayout) return;

  // Load pinned state
  const isPinned = localStorage.getItem('sidebarPinned') === 'true';

  // Set initial state
  if (isPinned) {
    sidebar.classList.add('pinned');
    appLayout.classList.add('sidebar-pinned');
    hoverTrigger.style.display = 'none';
  }

  // Pin/unpin handler
  sidebarPinBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const currentlyPinned = sidebar.classList.contains('pinned');

    if (currentlyPinned) {
      sidebar.classList.remove('pinned');
      appLayout.classList.remove('sidebar-pinned');
      hoverTrigger.style.display = '';
      localStorage.setItem('sidebarPinned', 'false');
    } else {
      sidebar.classList.add('pinned');
      appLayout.classList.add('sidebar-pinned');
      hoverTrigger.style.display = 'none';
      localStorage.setItem('sidebarPinned', 'true');
    }
  });

  // Hover behavior - show sidebar on hover of trigger or sidebar itself
  // Delays: time to hover before opening, time to stay open after leaving
  const SHOW_DELAY = 300; // ms - how long to hover before sidebar opens
  const HIDE_DELAY = 750; // ms - how long sidebar stays open after mouse leaves
  
  let showTimeout;
  let hideTimeout;
  
  function showSidebar() {
    if (!sidebar.classList.contains('pinned')) {
      clearTimeout(hideTimeout); // Cancel any pending hide
      clearTimeout(showTimeout); // Cancel any pending show (in case of rapid hover/unhover)
      
      // Delay before showing
      showTimeout = setTimeout(() => {
        sidebar.style.transform = 'translateX(0)';
      }, SHOW_DELAY);
    }
  }

  function hideSidebar() {
    if (!sidebar.classList.contains('pinned')) {
      clearTimeout(showTimeout); // Cancel any pending show
      clearTimeout(hideTimeout); // Cancel any pending hide
      
      // Delay before hiding
      hideTimeout = setTimeout(() => {
        sidebar.style.transform = 'translateX(-100%)';
      }, HIDE_DELAY);
    }
  }

  hoverTrigger.addEventListener('mouseenter', showSidebar);
  sidebar.addEventListener('mouseenter', showSidebar);
  hoverTrigger.addEventListener('mouseleave', hideSidebar);
  sidebar.addEventListener('mouseleave', hideSidebar);
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
  // Preload all message data files
  preloadAllMessageData().catch(() => {});

  // Initialize sidebar
  initSidebar();

  // Initialize refresh button
  const refreshBtn = document.getElementById('refresh-page');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.location.reload();
    });
  } else {
    console.warn('Refresh button not found');
  }

  // Initialize UI components
  renderFeedForm();
  initSearchFilter();
  initSortControl();
  initBackToTop();

  // Load news
  await loadNews();
});
