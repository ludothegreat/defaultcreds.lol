// news.js - Main orchestrator (refactored from monolithic file)
// Imports all modules and wires everything together

import { feeds, feedMap, DEFAULT_FEED_ORDER, feedKey } from './modules/feed-config.js';
import { getFeedColors } from './modules/colors.js';
import {
  getFeedOrder, setFeedOrder, getFeedOrderChanged, setFeedOrderChanged,
  getSelectedFeeds, setSelectedFeeds,
  getFeedFilterTerm, setFeedFilterTerm,
  getActiveFeedCategories, setActiveFeedCategories,
  getCurrentSort, setCurrentSort,
  getFeedStatus, getLastUpdateTime, setLastUpdateTime
} from './modules/state.js';
import { preloadAllMessageData } from './modules/rss-fetcher.js';
import {
  renderFeedForm, setFeedOptionsContainer, getFeedOptionsContainer,
  feedCheckboxId, getAllCategories, isFeedInActiveCategory,
  getFeedsInOrder, renderFeedOptions, updateFeedStatusCount,
  applyFeedOrderToDom, toggleCategory, setEventHandlers
} from './modules/feed-panel.js';
import { handleFeed, clearAnimationInterval } from './modules/feed-renderer.js';
import { updateSystemStatus } from './modules/system-status.js';
import { applySearchFilter, initSearchFilter } from './modules/search-filter.js';
import { initSortControl, applySorting } from './modules/sorting.js';
import { initBackToTop, initSidebar } from './modules/ui-components.js';

// Pre-generate colors for all feeds
const feedOrder = getFeedOrder();
feedOrder.forEach(url => getFeedColors(url));

// Ensure feedOrder includes all default feeds
DEFAULT_FEED_ORDER.forEach(url => {
  if (!feedOrder.includes(url)) {
    feedOrder.push(url);
    setFeedOrderChanged(true);
  }
});
if (getFeedOrderChanged()) {
  setFeedOrder(feedOrder);
  setFeedOrderChanged(false);
}

// Feed panel event handlers
function handleFeedCheckboxChange(event) {
  const checkbox = event.target;
  const url = checkbox.value;
  const selectedFeeds = getSelectedFeeds();

  if (checkbox.checked) {
    if (!selectedFeeds.includes(url)) {
      selectedFeeds.push(url);
    }
  } else {
    selectedFeeds.splice(selectedFeeds.indexOf(url), 1);
  }

  setSelectedFeeds(selectedFeeds);
  renderFeedOptions(getFeedOptionsContainer());
  updateFeedStatusCount();
  loadNews();
}

function handleFeedMove(event, feed, direction) {
  event.preventDefault();
  const feedOrder = getFeedOrder();
  const currentIndex = feedOrder.indexOf(feed.url);
  if (currentIndex === -1) return;

  if (direction === 'up' && currentIndex > 0) {
    [feedOrder[currentIndex - 1], feedOrder[currentIndex]] = [feedOrder[currentIndex], feedOrder[currentIndex - 1]];
  } else if (direction === 'down' && currentIndex < feedOrder.length - 1) {
    [feedOrder[currentIndex + 1], feedOrder[currentIndex]] = [feedOrder[currentIndex], feedOrder[currentIndex + 1]];
  } else {
    return;
  }

  setFeedOrder(feedOrder);
  renderFeedOptions(getFeedOptionsContainer());
  applyFeedOrderToDom();
}

// Set event handlers for feed panel
setEventHandlers({
  handleFeedCheckboxChange,
  handleFeedMove,
  loadNews
});

// Main load news function
async function loadNews() {
  const container = document.getElementById('news-feed');
  const emptyState = document.getElementById('empty-state');

  // Clear previous content
  container.innerHTML = '';
  getFeedStatus().clear();

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

  // Fetch feeds incrementally with error boundaries
  try {
    const results = await Promise.allSettled(selected.map(f => handleFeed(f).catch(err => {
      console.error(`Failed to load feed ${f.name}:`, err);
      return { error: err, feed: f };
    })));
    
    // Log any failures for debugging
    const failures = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && r.value && r.value.error));
    if (failures.length > 0) {
      console.warn(`${failures.length} feed(s) failed to load`);
    }
  } catch (err) {
    console.error('Critical error in loadNews:', err);
    if (emptyState) {
      emptyState.hidden = false;
    }
  } finally {
    clearAnimationInterval();
  }

  // Apply search filter and sorting
  const searchBar = document.getElementById('search-bar');
  if (searchBar) {
    applySearchFilter(searchBar.value);
  }

  applySorting();
  updateSystemStatus();
}

// Export loadNews for use in event handlers and make it available globally
window.loadNews = loadNews;

// Initialization
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
