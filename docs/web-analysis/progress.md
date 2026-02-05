# Debug Progress Tracker

Last updated: 2026-02-05T03-57-17Z

## General Code Issues
- [x] Medium: Potential XSS in search highlighting (RSS titles re-injected via `innerHTML`) - `js/modules/search-filter.js:33-46` (fixed 2026-02-05T03-46-40Z)
- [x] Medium: RSS items injected via `innerHTML` (XSS risk) - `js/modules/feed-renderer.js:35` (fixed 2026-02-04T18-26-30Z)
- [x] Low: Weather page injects API text via `innerHTML` - `weather/index.html:118` (fixed 2026-02-04T18-41-38Z)
- [x] Low: External RSS parser script unpinned / no SRI - `index.html` (fixed 2026-02-05T00-47-49Z)
- [x] Low: Input fields missing `id`/`name` (console a11y warning) - `index.html` (fixed 2026-02-05T03-25-20Z)
- [ ] Low: CORS enabled for all routes in Flask dev server - `app.py:10-14` (skipped: server files are excluded from commits)
- [ ] Low: HTTPS dev server binds to all interfaces with bundled key - `server.py:6-15`

## Feature-Specific Issues
- [x] Feature: Weather forecast page shows incorrect units / low-temp formatting - `weather/index.html` (fixed 2026-02-05T03-30-33Z)

## Overlapping Issues
- [x] Weather forecast uses `innerHTML` with API data - `weather/index.html:118` (fixed 2026-02-04T18-41-38Z)
