# defaultcreds.lol

> A cybersecurity news aggregator with a sense of humor about default credentials.

**defaultcreds.lol** is a sleek, dark-mode RSS feed aggregator that curates the latest cybersecurity news from trusted sources, wrapped in a playful UI themed around default credentials. Because nothing says "security" quite like `admin:password123`.

## Features

### News Aggregation
- **Multi-source RSS feeds** - Aggregates from 7+ cybersecurity news sources including:
  - Krebs on Security
  - BleepingComputer
  - The Register Security
  - Hacker News
  - ThreatPost
  - Dark Reading
  - SecurityWeek

### Smart Feed Management
- **Category filtering** - Organize feeds by Newsrooms, Industry Press, Communities, and Analysis & Research
- **Feed selection** - Toggle individual feeds on/off
- **Feed ordering** - Reorder feeds with up/down controls
- **Keyword search** - Filter articles in real-time

### The "Cred of the Week" Widget
- Displays a random default credential from the legendary [SecLists](https://github.com/danielmiessler/SecLists) repository
- Pulls from real-world default credential databases
- Refresh button to see more terrible password choices
- Because we all need a reminder of what NOT to do

### Technical Features
- **Dark mode by default** - Easy on the eyes
- **Resilient CORS proxy system** - Multiple fallbacks for reliable feed fetching
- **Client-side caching** - Fast load times with localStorage
- **Responsive design** - Works on desktop, tablet, and mobile
- **Zero backend** - Pure client-side application

## UI Highlights

- **Faux browser address bar** - Shows credentials in URL format (`admin:admin@defaultcreds.lol`)
- **Credential history dropdown** - Click the credentials to see a list of common defaults
- **Smooth animations** - Polished hover effects and transitions throughout
- **Feed-colored borders** - Each feed gets a unique color for easy identification

## Getting Started

### Prerequisites
- A web server (Python's SimpleHTTPServer, Node's http-server, etc.)
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/defaultcreds.lol.git
   cd defaultcreds.lol
   ```

2. **Start a local web server**

   Using Python:
   ```bash
   python -m http.server 8000
   ```

   Or using Node.js:
   ```bash
   npx http-server -p 8000
   ```

3. **Open in browser**
   ```
   http://localhost:8000
   ```

That's it! No build process, no dependencies to install.

## Project Structure

```
defaultcreds.lol/
├── index.html              # Main HTML structure
├── styles.css              # All styling and visual polish
├── news.js                 # RSS feed fetching, parsing, and rendering
├── widget.js               # "Cred of the Week" functionality
├── theme.js                # Dark/light mode toggle
├── ui.js                   # UI interactions (bookmark, back-to-top)
├── creds.js                # Faux address bar credential logic
├── creds.json              # List of common default credentials
└── top_1000_passwords.txt  # Password wordlist for animations
```

## Technology Stack

- **Vanilla JavaScript** - No frameworks, just pure JS
- **Pico CSS** - Minimal CSS framework for base styling
- **RSS Parser** - Client-side RSS/Atom feed parsing
- **CORS Proxies** - Multiple fallback proxies for cross-origin requests
  - allorigins.win
  - corsproxy.io
  - codetabs.com
- **localStorage API** - Client-side caching for performance
- **GitHub API** - Fetching credentials from SecLists repository

## Key Implementation Details

### CORS Proxy Fallbacks
The site uses multiple CORS proxies with smart retry logic:
- Validates responses are XML (not HTML error pages)
- Automatically tries next proxy if current one fails
- Skips retrying same proxy for consistent failures
- Falls back to cached content gracefully

### Feed Caching Strategy
- Cache-first approach for instant load times
- Background refresh for fresh content
- One-week expiration for "Cred of the Week"
- Corrupted cache auto-cleanup

### Performance Optimizations
- Category toggling uses DOM manipulation (no re-fetch)
- Debounced search filtering
- Lazy loading of feed content
- Minimal DOM updates

## Customization

### Adding New Feeds

Edit `news.js` and add to the `FEEDS` array:

```javascript
{
  name: 'Your Feed Name',
  url: 'https://example.com/feed.rss',
  category: 'Newsrooms' // or 'Industry Press', 'Communities', 'Analysis & Research'
}
```

### Changing Theme Colors

Edit CSS custom properties in `styles.css`:

```css
:root {
  --accent-color: #4a90e2;  /* Change accent color */
  --bg-color: #212424;       /* Background color */
  --text-color: #c9d1d9;     /* Text color */
}
```

### Adding Credentials

Edit `creds.json` to add more default credentials to the rotation:

```json
{
  "user": "admin",
  "pass": "password123"
}
```

## Known Issues

- Some RSS feeds may fail to load due to CORS proxy rate limiting
- ThreatPost feed appears to be discontinued (shows old articles)
- First load may be slow as it fetches multiple feeds

## Contributing

Contributions are welcome! Some ideas:
- Add more cybersecurity news sources
- Improve mobile responsive design
- Add more credential animations
- Create backend API for better CORS handling
- Add unit tests

## License

[MIT License](LICENSE) - feel free to use this project however you'd like.

## Credits

- **SecLists** - Daniel Miessler's excellent security testing wordlists
- **Pico CSS** - Minimal CSS framework
- **RSS Parser** - Bobby Mozumder's RSS parsing library
- All the cybersecurity news sources for their RSS feeds

## Disclaimer

This site is for educational and informational purposes. The default credentials displayed are publicly available and should **never** be used in production systems. Always use strong, unique passwords.

---

**Remember**: If you're using default credentials in production, you're not just on defaultcreds.lol - you're the reason it exists.
