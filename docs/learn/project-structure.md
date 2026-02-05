# Project Structure

## Top-Level Layout

- `index.html` — Main page markup and layout.
- `styles.css` — Global design system and UI styling.
- `js/` — Modular JavaScript for feed orchestration and UI.
- `creds.js` — Faux URL bar and credential history logic.
- `widget.js` — “Cred of the Week” widget (SecLists integration).
- `ui.js` — Placeholder for future UI logic.
- `creds.json` — Default credential list for faux URL and history.
- `*.txt` — Wordlists and data for animations and placeholders.
- `docs/` — Project documentation and reports.
- `guides/`, `jdownloader/`, `weather/` — Static content/pages and assets.
- `README-SERVER.md` — Local dev server instructions.

## Directory Tree (Key Areas)

- `docs/`
- `docs/learn/`
- `docs/web-analysis/`
- `guides/`
- `jdownloader/`
- `js/`
- `js/modules/`
- `scripts/`
- `weather/`

## Entry Points

- Web app entry: `index.html`
- JS orchestrator: `js/news.js`

## Organization Patterns

- UI is defined in `index.html` and `styles.css`.
- Client logic is split into small modules under `js/modules/`.
- “Theming” data and demo content live in plain text files in repo root.
- Documentation lives in `docs/` with subfolders by topic.
