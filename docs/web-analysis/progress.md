# Debug Progress Tracker

Last updated: 2026-02-04T18-26-30Z

## General Code Issues
- [x] Medium: RSS items injected via `innerHTML` (XSS risk) - `js/modules/feed-renderer.js:35` (fixed 2026-02-04T18-26-30Z)
- [ ] Low: Weather page injects API text via `innerHTML` - `weather/index.html:118`
- [ ] Low: External RSS parser script unpinned / no SRI - `index.html`
- [ ] Low: Input fields missing `id`/`name` (console a11y warning) - `index.html`

## Feature-Specific Issues
- [ ] Feature: Weather forecast page shows incorrect units / low-temp formatting - `weather/index.html`

## Overlapping Issues
- [ ] Weather forecast uses `innerHTML` with API data - `weather/index.html:118`
