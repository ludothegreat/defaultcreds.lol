# Architecture

## High-Level Pattern

- Static, client-side app.
- Orchestrator module (`js/news.js`) wires UI setup, state management, and feed rendering.
- State stored in-memory and persisted to `localStorage` via `js/modules/state.js`.

## Major Subsystems

- **Feed configuration**: `js/modules/feed-config.js` defines feed list, categories, and order.
- **State management**: `js/modules/state.js` holds feed order, selection, filters, sort mode, and feed status.
- **RSS fetch and parse**: `js/modules/rss-fetcher.js` fetches via CORS proxy and parses via `RSSParser`.
- **Feed rendering**: `js/modules/feed-renderer.js` renders sections and articles with cache-first behavior.
- **UI controls**: `js/modules/feed-panel.js`, `js/modules/search-filter.js`, `js/modules/sorting.js`, `js/modules/ui-components.js`.
- **System status**: `js/modules/system-status.js` updates “last updated” and feed health indicators.
- **Themed extras**: `creds.js` for faux URL + history and `widget.js` for “Cred of the Week.”

## Data Flow

1. `index.html` loads CSS and JS, including `rss-parser` CDN.
2. `js/news.js` initializes UI and preloads message data.
3. `loadNews()` determines selected feeds and calls `handleFeed()` per feed.
4. `handleFeed()` renders skeletons, reads cached XML from `localStorage`, then fetches fresh XML via the proxy.
5. Parsed feed items are rendered as sections and articles.
6. Search/sort UI applies client-side filtering on rendered articles.
7. Status indicators update based on feed fetch timing and outcomes.

## Caching

- RSS XML cached per-feed in `localStorage` as `xmlCache_<feedKey>`.
- “Cred of the Week” data cached as `secListCache` in `localStorage`.
- User preferences persisted via `localStorage` for feed order, selection, filters, and sidebar state.

## Key Design Patterns

- Module-based organization with small single-purpose files.
- Cache-first rendering with background refresh.
- UI state synchronized between DOM and `localStorage`.
