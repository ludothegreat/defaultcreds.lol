// sorting.js - Article sorting functionality

import { getCurrentSort, setCurrentSort } from './state.js';
import { applyFeedOrderToDom } from './feed-panel.js';

export function initSortControl() {
  const sortSelect = document.getElementById('sort-select');
  if (!sortSelect) return;

  sortSelect.value = getCurrentSort();

  sortSelect.addEventListener('change', () => {
    setCurrentSort(sortSelect.value);
    applySorting();
  });
}

export function applySorting() {
  const container = document.getElementById('news-feed');
  if (!container) return;

  const currentSort = getCurrentSort();
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
