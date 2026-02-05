# Technology Stack

## Core Technologies

- HTML5 for structure (`index.html`).
- CSS3 for layout/design (`styles.css`).
- Vanilla JavaScript (ES modules) for behavior (`js/` and `js/modules/`).

## External Libraries and Services

- RSS parsing via `rss-parser` loaded from a CDN in `index.html`.
- CORS proxy for feeds: `https://api.allorigins.win/raw?url=` used in `js/modules/rss-fetcher.js`.
- SecLists data via GitHub API in `widget.js`.
- Fonts from Google Fonts in `index.html`.

## Build and Tooling

- No build system, bundler, or transpilation step.
- Local dev via simple HTTP server (`README-SERVER.md`).

## Testing and Linting

- No test framework or linting configuration present.
- Optional local scripts exist but are not part of the web build.

## Deployment

- Static file hosting.
- Historical deployment state is tracked by `.ftp-deploy-sync-state.json` but it is now ignored by Git.
