# Development Workflow

## Setup

- No dependencies are required for the static site itself.
- For local serving, see `README-SERVER.md`.

## Run Locally

- Flask option (from `README-SERVER.md`):
  - `pip3 install Flask flask-cors --user`
  - `python3 app.py`
- Simple HTTP server:
  - `python3 -m http.server 8000`

## Common Tasks

- Edit `index.html`, `styles.css`, and JS modules in `js/`.
- Refresh the page to reload static assets.
- Clear `localStorage` when testing state defaults.

## Build and Deploy

- No build step. Deploy as static assets.

## Git Workflow

- No explicit branching or PR conventions are documented in this repo.
