# Application State

Last updated: 2026-01-16T16:50:47Z

## Runtime/Framework

- **Language:** Python 3.x (Flask), JavaScript (ES6+)
- **Framework:** Flask (development server)
- **Frontend:** Vanilla JavaScript (no framework)
- **CSS:** Custom CSS with CSS variables

## Start Command

```bash
python3 app.py
```

Server runs at: `http://127.0.0.1:8000`

## Important Ports/URLs

- **Development Server:** http://127.0.0.1:8000
- **Main Application:** http://127.0.0.1:8000/
- **Static Files:** http://127.0.0.1:8000/<filename>

## Important Files and Their Purposes

### Python Files
- **app.py** - Flask development server, serves static files
- **server.py** - Alternative HTTPS server (requires cert.pem and key.pem)
- **scripts/cred_gen.py** - Credential generator utility script

### JavaScript Files
- **news.js** - Main application logic (1425 lines)
  - RSS feed fetching and parsing
  - Article rendering
  - Feed management (select, filter, search, reorder)
  - Sidebar interactions
  - Loading skeleton animations
  - Search and sort functionality
- **creds.js** - Address bar credential randomization and dropdown
- **widget.js** - "Cred of the Week" widget (fetches from GitHub SecLists)
- **ui.js** - Placeholder file (currently empty)

### HTML Files
- **index.html** - Main application shell and structure

### CSS Files
- **styles.css** - Complete styling system with CSS variables

### Configuration Files
- **creds.json** - Default credentials data
- **requirements.txt** - Python dependencies (Flask, flask-cors)
- **.gitignore** - Git ignore rules

### Data Files (for skeleton loaders)
- `cracking_passwords.txt` - Password data
- `brute_force_creds.txt` - Credential pairs
- `password_hashes.txt` - Hash data
- `decrypting_creds.txt` - Encrypted credential data
- `bypassing_auth.txt` - Token/session data
- `default_creds.txt` - Default credential pairs
- `weak_passwords.txt` - Weak password data
- `injection_payloads.txt` - Injection payload data
- `top_1000_passwords.txt` - Password wordlist

## External Dependencies

### APIs
- **RSS Feeds:** Multiple security news RSS feeds (via CORS proxy: api.allorigins.win)
- **GitHub API:** https://api.github.com/repos/danielmiessler/SecLists/contents/Passwords/Default-Credentials
- **RSS Parser:** https://unpkg.com/rss-parser/dist/rss-parser.min.js (CDN)

### Libraries
- **Flask** - Python web framework
- **flask-cors** - CORS support for Flask
- **rss-parser** - RSS feed parsing (via CDN)

## Configuration Locations

- **User Preferences:** localStorage (browser)
  - `feedOrder` - Feed display order
  - `selectedFeeds` - Selected feed URLs
  - `activeFeedCategories` - Active category filters
  - `feedFilterTerm` - Feed search term
  - `sidebarPinned` - Sidebar pinned state
  - `secListCache` - SecLists cache (1 week TTL)

## Known Working Features

1. ✅ Select/Deselect Feeds
2. ✅ Filter by Category
3. ✅ Search Feeds
4. ✅ Reorder Feeds
5. ✅ Display RSS Articles
6. ✅ Search Articles
7. ✅ Sort Articles
8. ✅ Sidebar Hover/Pin
9. ✅ Address Bar Credential Display
10. ✅ Credential History Dropdown
11. ✅ Refresh Cred Widget

## Known Issues

### Partially Working
- **Cred of the Week Widget** - Depends on external GitHub API, has proper fallback

### Code Issues
- See `progress.md` for detailed issue list

## Development Notes

- Flask server runs with `debug=True` (acceptable for local dev)
- Application is primarily client-side with Flask only serving static files
- No database - all state stored in localStorage
- No authentication required
- CORS proxy used for RSS feeds to avoid CORS issues
