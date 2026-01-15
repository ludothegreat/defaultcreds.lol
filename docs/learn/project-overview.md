# Project Overview

**Project Name:** defaultcreds.lol  
**Type:** Static Website / Cybersecurity News Aggregator  
**Language:** JavaScript (vanilla), HTML, CSS  
**Created:** Initial commit on 2025 (eb42265)  
**Current Branch:** refactor-interface (UI refactor in progress)

## Purpose

defaultcreds.lol is a lightweight cybersecurity news aggregator that pulls headlines from multiple RSS feeds and displays them in a clean, terminal-style interface. The site serves as an intelligence console for security professionals and enthusiasts to quickly scan headlines from trusted sources.

## Main Features

1. **RSS Feed Aggregation**
   - Pulls from 7+ cybersecurity news sources
   - Categories: Newsrooms, Industry Press, Communities, Analysis & Research
   - Real-time feed fetching via CORS proxy

2. **Feed Management**
   - Select/deselect individual feeds
   - Category-based filtering
   - Feed reordering
   - Search feeds by name
   - Feed status indicators (Loaded/Slow/Failed)

3. **Content Filtering & Sorting**
   - Keyword search with highlighting
   - Sort by: newest first, oldest first, by source
   - Result count display
   - Instant filtering

4. **User Experience**
   - Incremental rendering (shows cached content immediately)
   - Skeleton placeholders during loading
   - Dark theme with terminal aesthetic
   - Responsive design
   - Persistent preferences (localStorage)

5. **Special Features**
   - "Cred of the Week" widget (random default credentials from SecLists)
   - Faux URL bar with credential randomization
   - Credential history dropdown
   - Loading animation with password ticker

## Target Users

- Cybersecurity professionals
- Security researchers
- News aggregator users
- Anyone interested in staying current with security news

## What Makes It Unique

- **Terminal aesthetic**: Monospace fonts, dense layout, dark theme
- **Intelligence console feel**: Professional, minimalist design
- **No build tools**: Pure vanilla JavaScript, HTML, CSS
- **Fast incremental loading**: Shows cached content immediately
- **Playful branding**: Default credentials theme throughout UI

## Current State

The project is currently on the `refactor-interface` branch, which implements a modern UI refactor based on the `ui-refactor-brief.md` specifications. The refactor maintains all existing functionality while improving the visual design and user experience.

## Installation & Setup

This is a static website with no build process:
1. Clone the repository
2. Serve files via HTTP (e.g., `python server.py` for local development)
3. Open `index.html` in a browser

## Usage

1. Select feeds from the sidebar
2. Use keyword search to filter articles
3. Sort by date or source
4. Click headlines to read full articles (opens in new tab)
5. Use category chips to filter feeds by category
