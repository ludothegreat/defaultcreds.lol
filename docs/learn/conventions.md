# Conventions

## File and Directory Naming

- JS modules use kebab-case filenames under `js/modules/`.
- Primary entry files are in repo root (`index.html`, `styles.css`, `creds.js`, `widget.js`).
- Documentation lives under `docs/` with topic subfolders.

## JavaScript Style

- ES module imports/exports for app logic (`js/news.js` and `js/modules/*`).
- Functions are small and focused; modules own single areas of responsibility.
- State access is centralized via getters/setters in `js/modules/state.js`.
- DOM updates prefer safe text assignment (`textContent`) in widget paths to avoid injection.

## CSS Style

- Design tokens set via `:root` custom properties.
- Sections are grouped by component with clear comments.
- Uses BEM-like class naming for components (e.g., `feed-option`, `feed-status-indicator`).

## HTML Structure

- Semantic sections for header, sidebar, main content, footer in `index.html`.
- ARIA labels applied for interactive elements (buttons, faux URL bar, sidebar trigger).

## Data and Content Files

- Default credentials and animations rely on plain text files in repo root (`*.txt`).
- `creds.json` contains the data for faux URL and history dropdown.
