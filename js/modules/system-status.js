// system-status.js - System status updates

import { getFeedStatus, getLastUpdateTime } from './state.js';

export function updateSystemStatus() {
  // Update last updated time
  const lastUpdatedEl = document.getElementById('last-updated');
  const lastUpdateTime = getLastUpdateTime();
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
    const feedStatus = getFeedStatus();
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
