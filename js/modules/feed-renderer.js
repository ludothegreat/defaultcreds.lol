// feed-renderer.js - Feed and article rendering

import { feedKey } from './feed-config.js';
import { getFeedColors } from './colors.js';
import { getFeedStatus, setLastUpdateTime } from './state.js';
import { fetchXml, parseXml } from './rss-fetcher.js';
import { createSkeletonArticles, applyGlitchEffects } from './animations.js';

export function renderItems(section, feedName, items) {
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

let animationInterval;

export async function handleFeed(feed) {
  try {
    const container = document.getElementById('news-feed');
    if (!container) {
      throw new Error('News feed container not found');
    }
    
    const sectionId = 'sec-' + feedKey(feed);

    let section = document.getElementById(sectionId);
    if (!section) {
      try {
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
      } catch (err) {
        console.error(`Failed to create section for ${feed.name}:`, err);
        throw err;
      }
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
        console.warn(`Cache parse error for ${feed.name}:`, e);
        // Continue to fetch fresh data even if cache fails
      }
    }

    // Fetch fresh in background
    try {
      const freshXml = await fetchXml(feed);
      const prevXml = raw ? JSON.parse(raw).xml : null;

      if (freshXml !== prevXml) {
        try {
          localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), xml: freshXml }));
          const freshData = await parseXml(freshXml);
          section.querySelectorAll('.status, article, .skeleton-article').forEach(n => n.remove());
          renderItems(section, feed.name, freshData.items);
        } catch (parseErr) {
          console.error(`Failed to parse fresh data for ${feed.name}:`, parseErr);
          throw parseErr;
        }
      }

      setLastUpdateTime(new Date());
      // updateSystemStatus will be called from main
    } catch (err) {
      section.querySelectorAll('.retry-button, .skeleton-article').forEach(el => el.remove());

      console.error(`Failed to update ${feed.name}:`, err);

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
      retryButton.addEventListener('click', () => handleFeed(feed).catch(err => {
        console.error(`Retry failed for ${feed.name}:`, err);
      }));
      section.appendChild(retryButton);

      // updateSystemStatus will be called from main
      
      // Re-throw to allow loadNews to track failures
      throw err;
    }

    return section;
  } catch (err) {
    // Top-level error boundary for handleFeed
    console.error(`Critical error in handleFeed for ${feed.name}:`, err);
    throw err;
  }
}

export function setAnimationInterval(interval) {
  animationInterval = interval;
}

export function clearAnimationInterval() {
  if (animationInterval) {
    clearInterval(animationInterval);
    animationInterval = null;
  }
}
