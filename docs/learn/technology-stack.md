# Technology Stack

## Core Technologies

### Frontend
- **HTML5**: Semantic markup, modern features
- **CSS3**: Custom properties (CSS variables), Grid, Flexbox
- **Vanilla JavaScript (ES6+)**: No frameworks, modern JS features
  - Async/await
  - Fetch API
  - LocalStorage API
  - DOM manipulation
  - Event delegation

### External Dependencies
- **rss-parser** (via CDN): RSS/Atom feed parsing
  - Loaded from: `https://unpkg.com/rss-parser/dist/rss-parser.min.js`
  - Used for parsing RSS/Atom XML into JavaScript objects

### CORS Proxy
- **api.allorigins.win**: CORS proxy for fetching RSS feeds
  - Used because RSS feeds often don't allow direct browser access
  - Pattern: `https://api.allorigins.win/raw?url=<encoded-feed-url>`

### Fonts
- **Google Fonts**:
  - Inter (sans-serif for content)
  - JetBrains Mono (monospace for UI elements)

## Development Tools

### Local Development Server
- **Python 3**: Simple HTTPS server (`server.py`)
  - Uses `http.server` and `ssl` modules
  - Serves on port 8000 with SSL
  - Requires `cert.pem` and `key.pem` (not in repo)

### Version Control
- **Git**: Standard git workflow
- **Remote**: gitforge.online (self-hosted git server)

## Build & Deployment

### Build Process
- **None**: No build step, transpilation, or bundling
- Files are served directly as-is
- No minification or optimization step

### Deployment
- Static file hosting (any web server)
- No server-side processing required
- All logic runs client-side

## Why These Choices?

1. **Vanilla JavaScript**: 
   - No framework overhead
   - Fast load times
   - Simple deployment
   - Full control

2. **No Build Tools**:
   - Faster development iteration
   - Easier debugging
   - No build configuration complexity

3. **CDN for rss-parser**:
   - No npm/node dependency
   - Works in browser directly
   - Easy to update

4. **CORS Proxy**:
   - Necessary for browser-based RSS fetching
   - No backend required
   - Free service (api.allorigins.win)

5. **CSS Variables**:
   - Easy theming
   - Consistent design system
   - Runtime customization possible

## Technology Versions

- **JavaScript**: ES6+ (no specific version requirement)
- **CSS**: CSS3 with custom properties support
- **HTML**: HTML5
- **Python**: 3.x (for local server only)

## Notable Absences

- No package manager (npm, yarn, etc.)
- No bundler (webpack, rollup, etc.)
- No framework (React, Vue, etc.)
- No TypeScript
- No CSS preprocessor (Sass, Less, etc.)
- No testing framework
- No linter/formatter configuration

## Future Considerations

The `ui-refactor-brief.md` explicitly states:
- **Hard constraint**: HTML, CSS, and vanilla JS/TS only
- No frameworks, no build tools beyond what exists
- This is a deliberate architectural choice
