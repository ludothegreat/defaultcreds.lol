# Web Analysis State

## Runtime / Framework

- Static HTML/CSS/JS (no build tooling)
- Optional local server: Python `http.server`

## Start Command

- `python3 -m http.server 8000`

## URLs / Ports

- App: `http://localhost:8000/`
- Weather demo: `http://localhost:8000/weather/index.html`
- DevTools: `http://127.0.0.1:9222`

## Important Files

- `index.html` — main UI layout
- `styles.css` — design system + UI styles
- `js/news.js` — orchestration
- `js/modules/*` — feed config, fetching, rendering, state, UI
- `creds.js` — faux URL bar logic
- `widget.js` — “Cred of the Week”
- `creds.json` — default credential list
- `guides/dbi.html` — static guide
- `jdownloader/index.html` — static guide + lightbox
- `weather/index.html` — weather demo
- `weather/test.html` — weather demo

## External Dependencies / Services

- RSS parsing: `rss-parser` CDN
- RSS proxy: `https://api.allorigins.win/raw?url=`
- Cred of the Week data: GitHub API + SecLists
- Weather demo data: `https://api.weather.gov`
- Fonts: Google Fonts

## Configuration

- `localStorage` keys for feed order, selection, filters, sort, sidebar pinned, RSS cache, SecLists cache

## Known Working Features

- Feed aggregation and rendering
- Feed selection, ordering, category filtering, search
- Keyword search and sorting
- Faux URL bar + history
- Cred of the Week widget (refresh works via DOM click)
- Empty state when no feeds selected
- Back to top
- Static pages under `guides/` and `jdownloader/`

## Known Broken / Buggy Features

- None noted
