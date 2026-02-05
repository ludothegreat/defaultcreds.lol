// search-filter.js - Search and filter functionality

import { getSelectedFeeds } from './state.js';

export function escapeRegExp(string) {
  return string.replace(/([.*+?^${}()|[\]\\])/g, '\\$1');
}

function renderHighlightedText(element, text, term) {
  if (!element) return;
  element.textContent = '';

  if (!term) {
    element.textContent = text;
    return;
  }

  const highlightRegex = new RegExp(escapeRegExp(term), 'gi');
  let lastIndex = 0;
  let match = highlightRegex.exec(text);

  while (match) {
    const matchIndex = match.index;
    if (matchIndex > lastIndex) {
      element.appendChild(document.createTextNode(text.slice(lastIndex, matchIndex)));
    }
    const mark = document.createElement('mark');
    mark.className = 'search-highlight';
    mark.textContent = text.slice(matchIndex, matchIndex + match[0].length);
    element.appendChild(mark);
    lastIndex = matchIndex + match[0].length;
    match = highlightRegex.exec(text);
  }

  if (lastIndex < text.length) {
    element.appendChild(document.createTextNode(text.slice(lastIndex)));
  }
}

export function applySearchFilter(rawTerm = '') {
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
      renderHighlightedText(link, originalTitle, '');
    } else if (titleMatches) {
      renderHighlightedText(link, originalTitle, trimmedTerm);
    } else {
      renderHighlightedText(link, originalTitle, '');
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
    const selectedFeeds = getSelectedFeeds();
    emptyState.hidden = hasArticles || visibleCount > 0 || selectedFeeds.length === 0;
  }
}

export function initSearchFilter() {
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
