// feed-panel.js - Feed panel UI and management

import { feeds, feedMap, feedKey } from './feed-config.js';
import { getFeedColors, getCategoryColors } from './colors.js';
import { 
  getFeedOrder, setFeedOrder, setFeedOrderChanged,
  getSelectedFeeds, setSelectedFeeds,
  getFeedFilterTerm, setFeedFilterTerm,
  getActiveFeedCategories, setActiveFeedCategories
} from './state.js';

// Export functions that need to be called from main
let feedOptionsContainer = null;

export function feedCheckboxId(url) {
  return 'chk-' + btoa(url).replace(/[^a-z0-9]/gi, '');
}

export function getAllCategories() {
  return Array.from(new Set(feeds.map(feed => feed.category || 'Feeds')));
}

export function isFeedInActiveCategory(url) {
  const feed = feedMap.get(url);
  const category = feed ? (feed.category || 'Feeds') : 'Feeds';
  return getActiveFeedCategories().includes(category);
}

export function getFeedsInOrder(onlySelected = false) {
  const feedOrder = getFeedOrder();
  const selectedFeeds = getSelectedFeeds();
  const ordered = feedOrder
    .map(url => feedMap.get(url))
    .filter(Boolean);
  return onlySelected
    ? ordered.filter(feed => selectedFeeds.includes(feed.url) && isFeedInActiveCategory(feed.url))
    : ordered;
}

export function toggleCategory(category) {
  const activeFeedCategories = getActiveFeedCategories();
  const index = activeFeedCategories.indexOf(category);
  if (index === -1) {
    activeFeedCategories.push(category);
  } else {
    activeFeedCategories.splice(index, 1);
  }
  if (!activeFeedCategories.length) {
    activeFeedCategories.push(...getAllCategories());
  }
  setActiveFeedCategories(activeFeedCategories);
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function renderFeedOptions(container) {
  if (!container) return;
  container.innerHTML = '';

  const feedFilterTerm = getFeedFilterTerm();
  const selectedFeeds = getSelectedFeeds();
  const feedOrder = getFeedOrder();
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
    checkbox.addEventListener('change', (e) => {
      if (handleFeedCheckboxChangeCallback) {
        handleFeedCheckboxChangeCallback(e);
      }
    });
    upBtn.addEventListener('click', (e) => {
      if (handleFeedMoveCallback) {
        handleFeedMoveCallback(e, feed, 'up');
      }
    });
    downBtn.addEventListener('click', (e) => {
      if (handleFeedMoveCallback) {
        handleFeedMoveCallback(e, feed, 'down');
      }
    });

    container.appendChild(option);
  });

  if (!renderedCount) {
    const emptyMessage = document.createElement('p');
    emptyMessage.className = 'status';
    emptyMessage.textContent = 'No feeds match that filter.';
    container.appendChild(emptyMessage);
  }
}

export function updateFeedStatusCount() {
  const countEl = document.getElementById('feed-status-count');
  if (countEl) {
    const selectedFeeds = getSelectedFeeds();
    const activeCount = selectedFeeds.filter(url => isFeedInActiveCategory(url)).length;
    const totalCount = feeds.length;
    countEl.textContent = `${activeCount}/${totalCount}`;
  }
}

export function applyFeedOrderToDom() {
  const container = document.getElementById('news-feed');
  if (!container) return;

  const feedOrder = getFeedOrder();
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

// This will be set by the main module
export function setFeedOptionsContainer(container) {
  feedOptionsContainer = container;
}

export function getFeedOptionsContainer() {
  return feedOptionsContainer;
}

// Export for use in other modules
export { escapeRegExp };

// Event handlers that need access to other modules
let handleFeedCheckboxChangeCallback;
let handleFeedMoveCallback;
let loadNewsCallback;

export function setEventHandlers(callbacks) {
  handleFeedCheckboxChangeCallback = callbacks.handleFeedCheckboxChange;
  handleFeedMoveCallback = callbacks.handleFeedMove;
  loadNewsCallback = callbacks.loadNews;
}

export function renderFeedForm() {
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

      const feedOrder = getFeedOrder();
      const selectedFeeds = getSelectedFeeds();
      
      if (action === 'select-all') {
        const newSelected = feedOrder.filter(url => isFeedInActiveCategory(url));
        setSelectedFeeds(newSelected);
      } else if (action === 'select-none') {
        setSelectedFeeds([]);
      }

      renderFeedOptions(getFeedOptionsContainer());
      updateFeedStatusCount();
      if (loadNewsCallback) loadNewsCallback();
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
      const activeFeedCategories = getActiveFeedCategories();
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
          renderFeedOptions(getFeedOptionsContainer());
          updateFeedStatusCount();
          if (loadNewsCallback) loadNewsCallback();
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
    searchInput.value = getFeedFilterTerm();
    if (!searchInput.dataset.bound) {
      searchInput.addEventListener('input', () => {
        setFeedFilterTerm(searchInput.value);
        renderFeedOptions(getFeedOptionsContainer());
      });
      searchInput.dataset.bound = 'true';
    }
  }

  // Feed list
  const container = document.getElementById('feed-list');
  setFeedOptionsContainer(container);
  renderFeedOptions(container);
  updateFeedStatusCount();
  
}
