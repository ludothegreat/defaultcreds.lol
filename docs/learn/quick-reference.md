# Quick Reference

## Key Files

- `index.html` — Page layout and script loading.
- `styles.css` — Design system and styling.
- `js/news.js` — Main orchestrator.
- `js/modules/` — Feed, state, UI, and rendering modules.
- `creds.js` — Faux URL bar logic.
- `widget.js` — Cred of the Week widget.

## Local Run

- `python3 -m http.server 8000`
- `python3 app.py` (Flask, see `README-SERVER.md`)

## External Services

- RSS proxy: `https://api.allorigins.win/raw?url=`
- RSS parser: `rss-parser` CDN
- SecLists: GitHub API in `widget.js`

## Local Storage Keys

- `feedOrder`, `selectedFeeds`, `feedFilterTerm`, `activeFeedCategories`, `sortMode`, `newsSearchTerm`, `sidebarPinned`, `secListCache`, `xmlCache_<feedKey>`

## Minimal Architecture Diagram

```
index.html
  -> styles.css
  -> js/news.js
       -> modules/* (state, feed-config, rss-fetcher, feed-renderer, UI)
  -> creds.js
  -> widget.js
```
