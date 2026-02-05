# Project Overview

**Project Name:** defaultcreds.lol  
**Type:** Static website (cybersecurity news dashboard)  
**Primary Languages:** HTML, CSS, JavaScript  
**Local Tooling:** Optional Python helpers for local serving and inspection  
**Repo Root:** `/hoard/workspace/defaultcreds.lol`

## Purpose

defaultcreds.lol is a static, client-side cybersecurity news dashboard. It aggregates RSS/Atom feeds via a CORS proxy, renders a multi-feed headline view, and layers in playful “default credentials” themed UI elements (faux URL bar, credential widgets, loading animations).

## Target Users

- Security professionals or researchers wanting quick RSS headline scanning.
- Anyone interested in curated cybersecurity news in a dashboard-style UI.

## Primary Features

- Multi-feed RSS aggregation with cached rendering and background refresh.
- Sidebar feed management: search, select all/none, per-feed reordering, category filtering.
- Search and sort for headlines (keyword highlight, newest/oldest/source).
- Status indicators for feed health and last update time.
- Themed extras: faux URL bar with rotating credentials, “Cred of the Week” widget, glitch/skeleton loading.

## What Makes It Distinct

- Terminal-inspired dark UI with strong typography and animated skeleton states.
- No build tooling or framework dependency; the app is served as plain static files.
- Small, modular JS structure for UI, feeds, state, and rendering.

## Entry Points

- Primary UI: `index.html`
- Orchestrator JS: `js/news.js` (module-based)
- Styles: `styles.css`

## Local Development

There is no build step. The site should be served via HTTP to avoid `file://` CORS issues. See `README-SERVER.md` for local server options.
