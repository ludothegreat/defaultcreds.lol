# Quick Reference Card

## Key Commands

```bash
# Development
python server.py                    # Start HTTPS server (port 8000)
python -m http.server 8000          # Start HTTP server

# Git
git status                          # Check status
git checkout refactor-interface     # Switch to refactor branch
git push origin refactor-interface  # Push branch
```

## Important File Locations

| File | Purpose | Lines |
|------|---------|-------|
| `index.html` | Application shell | 182 |
| `news.js` | Core application | 1030 |
| `styles.css` | Design system | 1139 |
| `widget.js` | Cred widget | 114 |
| `creds.js` | Cred display | 124 |
| `creds.json` | Credentials DB | 22 entries |
| `ui-refactor-brief.md` | Design specs | 76 |

## Common Tasks

### Add a New Feed
1. Edit `news.js`, add to `feeds` array:
   ```javascript
   { url: 'https://feed.com/rss', name: 'Feed Name', category: 'Newsrooms' }
   ```

### Change Colors
1. Edit CSS variables in `styles.css`:
   ```css
   :root {
     --color-accent: #818cf8;
   }
   ```

### Clear User Preferences
1. Open browser DevTools
2. Application → Local Storage
3. Delete keys or clear all

### Debug Feed Loading
1. Open DevTools Console
2. Check for errors
3. Network tab: Check CORS proxy requests
4. Application tab: Check localStorage cache

## State Keys (localStorage)

- `selectedFeeds`: Selected feed URLs (JSON array)
- `feedOrder`: Feed display order (JSON array)
- `sortMode`: Sort mode ('newest', 'oldest', 'source')
- `newsSearchTerm`: Keyword search term
- `feedFilterTerm`: Feed search term
- `feedPanelOpen`: Panel state ('true'/'false')
- `activeFeedCategories`: Active categories (JSON array)
- `xmlCache_<feedKey>`: Cached feed XML

## Feed Configuration

**Location**: `news.js` (top of file)

**Current Feeds**: 7
- Krebs on Security
- BleepingComputer
- The Register Security
- Hacker News
- ThreatPost
- Dark Reading
- SecurityWeek

**Categories**: 4
- Newsrooms
- Industry Press
- Communities
- Analysis & Research

## CSS Variables Reference

### Colors
```css
--color-bg: #121212
--color-accent: #818cf8
--color-text: #e5e5e5
--color-success: #34d399
--color-warning: #fbbf24
--color-error: #f87171
```

### Typography
```css
--font-sans: 'Inter', ...
--font-mono: 'JetBrains Mono', ...
--text-base: 1rem
```

### Spacing
```css
--space-1: 0.25rem
--space-4: 1rem
--space-6: 1.5rem
```

## Architecture Diagram (ASCII)

```
index.html
├── styles.css (styling)
├── creds.js (faux URL bar)
├── widget.js (cred widget)
└── news.js (main app)
    ├── Feed Config
    ├── State Management
    ├── Fetch & Parse
    ├── Rendering
    ├── Search/Filter
    └── Sorting
```

## Data Flow

```
User Action
    ↓
Event Handler
    ↓
State Update (localStorage)
    ↓
DOM Update
    ↓
Visual Feedback
```

## Key Functions

### Feed Management
- `loadNews()`: Main entry point
- `handleFeed()`: Process single feed
- `fetchXml()`: Fetch RSS (with retry)
- `parseXml()`: Parse XML

### Rendering
- `renderItems()`: Render articles
- `renderFeedOptions()`: Render feed list
- `createSkeletonArticles()`: Loading placeholders

### State
- `applySearchFilter()`: Filter articles
- `applySorting()`: Sort articles
- `updateSystemStatus()`: Update status panel

## Browser DevTools Tips

### Console
```javascript
// Check selected feeds
JSON.parse(localStorage.getItem('selectedFeeds'))

// Check feed status
feedStatus  // Map object

// Clear cache
localStorage.clear()
```

### Network Tab
- Filter: "allorigins" to see CORS proxy requests
- Check response times
- Verify cache headers

### Application Tab
- Local Storage: View all keys
- Clear storage: Reset preferences
- Check cache entries: `xmlCache_*`

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Feeds not loading | Check CORS proxy, console errors |
| State not persisting | Check localStorage, JSON validity |
| Styling broken | Check CSS variables, class names |
| Search not working | Check search term, DOM structure |

## External Services

- **CORS Proxy**: `api.allorigins.win`
- **RSS Parser**: `unpkg.com/rss-parser`
- **Fonts**: `fonts.googleapis.com`
- **GitHub API**: `api.github.com` (for cred widget)

## Quick Edits

### Change CORS Proxy
Edit `news.js` line ~166:
```javascript
const CORS_PROXY = "https://new-proxy.com/raw?url=";
```

### Change Articles Per Feed
Edit `news.js` line ~587:
```javascript
items.slice(0, 10)  // Change 5 to 10
```

### Change Cache TTL
Edit `widget.js` line ~6:
```javascript
const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;  // Adjust days
```

---

*Keep this handy for quick lookups!*
