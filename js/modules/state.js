// state.js - Application state management

import { DEFAULT_FEED_ORDER, feedMap, feeds } from './feed-config.js';

// Feed order state
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
  }
});

// Selected feeds state
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

// Feed filter term
const storedFeedFilterTerm = localStorage.getItem('feedFilterTerm');
let feedFilterTerm = storedFeedFilterTerm || '';

// Active feed categories
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

// Export state getters and setters
export function getFeedOrder() { return feedOrder; }
export function setFeedOrder(order) { feedOrder = order; feedOrderChanged = true; }
export function getFeedOrderChanged() { return feedOrderChanged; }
export function setFeedOrderChanged(value) { feedOrderChanged = value; }

export function getSelectedFeeds() { return selectedFeeds; }
export function setSelectedFeeds(feeds) { 
  selectedFeeds = feeds; 
  localStorage.setItem('selectedFeeds', JSON.stringify(selectedFeeds));
}

export function getFeedFilterTerm() { return feedFilterTerm; }
export function setFeedFilterTerm(term) { 
  feedFilterTerm = term; 
  localStorage.setItem('feedFilterTerm', feedFilterTerm);
}

export function getActiveFeedCategories() { return activeFeedCategories; }
export function setActiveFeedCategories(categories) { 
  activeFeedCategories = categories; 
  localStorage.setItem('activeFeedCategories', JSON.stringify(activeFeedCategories));
}

export function getCurrentSort() { return currentSort; }
export function setCurrentSort(sort) { 
  currentSort = sort; 
  localStorage.setItem('sortMode', currentSort);
}

export function getFeedStatus() { return feedStatus; }
export function getLastUpdateTime() { return lastUpdateTime; }
export function setLastUpdateTime(time) { lastUpdateTime = time; }
