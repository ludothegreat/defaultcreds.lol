# Project Knowledge Base

## Executive Summary

defaultcreds.lol is a static cybersecurity news dashboard. It aggregates RSS/Atom feeds in the browser, caches results in `localStorage`, and presents a terminal-inspired UI with filtering, sorting, and default-credential themed UX elements.

## Quick Facts

- Entry point: `index.html`
- Orchestrator: `js/news.js`
- Styling: `styles.css`
- Feed definitions: `js/modules/feed-config.js`
- RSS fetch/parse: `js/modules/rss-fetcher.js`
- State persistence: `js/modules/state.js`
- Deploy model: static hosting, no build step

## Mental Model

- HTML provides a fixed layout for header, sidebar, and feed content.
- `js/news.js` initializes modules, loads cached data, then fetches and renders feeds.
- Feed items are rendered into sections; client-side search and sort operate on rendered DOM.
- UI state and preferences persist in `localStorage` to keep the experience consistent across visits.

## Documentation Index

- Overview: `docs/learn/project-overview.md`
- Structure: `docs/learn/project-structure.md`
- Technology: `docs/learn/technology-stack.md`
- Architecture: `docs/learn/architecture.md`
- Conventions: `docs/learn/conventions.md`
- Components: `docs/learn/key-components.md`
- Features: `docs/learn/features.md`
- Configuration: `docs/learn/configuration.md`
- Testing: `docs/learn/testing.md`
- Workflow: `docs/learn/development-workflow.md`
- Quick reference: `docs/learn/quick-reference.md`
- Learning path: `docs/learn/learning-path.md`
