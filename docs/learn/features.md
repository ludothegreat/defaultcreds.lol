# Features

## RSS Aggregation

- Fetches multiple security feeds defined in `js/modules/feed-config.js`.
- Uses `js/modules/rss-fetcher.js` to fetch XML via CORS proxy and parse with `RSSParser`.
- Caches raw XML per feed in `localStorage` for fast reloads.

## Feed Selection and Ordering

- Sidebar allows selecting/deselecting feeds and ordering them.
- Logic lives in `js/modules/feed-panel.js` and state is stored in `js/modules/state.js`.

## Category Filtering

- Feeds are categorized (Newsrooms, Communities, etc.) via `feed-config.js`.
- Category toggles are rendered in the feed filter popup in `feed-panel.js`.

## Search and Sorting

- Keyword search filters rendered articles and highlights matches (`js/modules/search-filter.js`).
- Sorting toggles order by newest/oldest or source (`js/modules/sorting.js`).

## Loading and Perceived Performance

- Skeleton placeholders with glitchy animations via `js/modules/animations.js`.
- Cache-first rendering: cached XML is rendered before fresh fetch completes.
- Feed health statuses (OK/Slow/Failed) are shown in the sidebar (`js/modules/system-status.js`).

## Faux URL Bar

- Displays randomized default credentials on load.
- Dropdown history with randomized timestamps.
- Implemented in `creds.js` using data from `creds.json`.

## Cred of the Week

- Fetches default credentials from SecLists via GitHub API.
- Caches results for one week and provides manual refresh.
- Implemented in `widget.js` with local fallback.

## Auxiliary Content

- Static guides and assets in `guides/`, `jdownloader/`, and `weather/`.
