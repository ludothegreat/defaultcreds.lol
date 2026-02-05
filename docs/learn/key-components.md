# Key Components

## Core Application

- `index.html` — Layout and script loading order. Establishes DOM anchors used by all modules.
- `styles.css` — Global design system and component styling.
- `js/news.js` — App orchestrator; initializes UI, loads feeds, wires handlers.

## Feed Pipeline

- `js/modules/feed-config.js` — Feed definitions, categories, and ordering helpers.
- `js/modules/rss-fetcher.js` — Fetches RSS via CORS proxy; loads message data for animations.
- `js/modules/feed-renderer.js` — Renders feed sections and articles, handles cache and errors.

## UI and State

- `js/modules/state.js` — In-memory + `localStorage` persistence for feed order, selection, filters, sort mode.
- `js/modules/feed-panel.js` — Sidebar feed list, ordering, and category filters.
- `js/modules/search-filter.js` — Article keyword filtering and highlights.
- `js/modules/sorting.js` — Article sort logic (newest/oldest/source).
- `js/modules/ui-components.js` — Sidebar hover/pin behavior and back-to-top button.
- `js/modules/system-status.js` — Feed health and “last updated” display.

## Themed Extras

- `creds.js` — Faux URL bar, credential randomization, and history dropdown.
- `creds.json` — Default credential dataset for faux URL history.
- `widget.js` — “Cred of the Week” widget using SecLists from GitHub.

## Supporting Content

- `*.txt` — Wordlists and demo data for loading animations and fallback content.
- `README-SERVER.md` — Local server instructions.
