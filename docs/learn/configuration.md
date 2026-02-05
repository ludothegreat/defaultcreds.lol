# Configuration

## Runtime Configuration

There is no server-side configuration. The app is configured via JS constants and `localStorage`.

## Feed Configuration

- `js/modules/feed-config.js` defines the RSS/Atom sources and categories.
- `DEFAULT_FEED_ORDER` provides the default order.

## External Endpoints

- RSS proxy: `https://api.allorigins.win/raw?url=` in `js/modules/rss-fetcher.js`.
- RSS parsing: `rss-parser` from CDN in `index.html`.
- SecLists API: `https://api.github.com/repos/danielmiessler/SecLists/contents/Passwords/Default-Credentials` in `widget.js`.

## Local Storage Keys

- `feedOrder` — ordered list of feed URLs.
- `selectedFeeds` — enabled feeds.
- `feedFilterTerm` — sidebar feed search term.
- `activeFeedCategories` — enabled feed categories.
- `sortMode` — `newest`, `oldest`, or `source`.
- `newsSearchTerm` — keyword search term.
- `sidebarPinned` — pinned state for the sidebar.
- `xmlCache_<feedKey>` — cached RSS XML per feed.
- `secListCache` — SecLists credential cache (1 week TTL).

## Data Files

- `creds.json` — default credentials used in faux URL history.
- `*.txt` — wordlists and animation payloads used in loading states.
