# Configuration and Environment

## Configuration Mechanisms

### 1. localStorage (Primary)

**Purpose**: Persistent user preferences and cache

**Keys Used**:
- `selectedFeeds`: JSON array of selected feed URLs
- `feedOrder`: JSON array of feed URLs in display order
- `sortMode`: String ('newest', 'oldest', 'source')
- `newsSearchTerm`: String (keyword search term)
- `feedFilterTerm`: String (feed search term)
- `feedPanelOpen`: String ('true' or 'false')
- `activeFeedCategories`: JSON array of category names
- `xmlCache_<feedKey>`: JSON object with `{ timestamp, xml }`
- `secListCache`: JSON object for cred widget cache

**Access Pattern**:
```javascript
// Save
localStorage.setItem('key', JSON.stringify(value));

// Load
const value = JSON.parse(localStorage.getItem('key') || 'null');
```

**Validation**: 
- Basic JSON parsing with try/catch
- Fallback to defaults if invalid
- No schema validation

---

### 2. Static Configuration Files

#### creds.json
**Purpose**: Default credentials database

**Structure**:
```json
[
  { "user": "admin", "pass": "password" },
  { "user": "root", "pass": "root" },
  ...
]
```

**Usage**: Loaded by `creds.js` on page load

**Location**: Root directory

---

#### top_1000_passwords.txt
**Purpose**: Password wordlist for loading animation

**Format**: One password per line

**Usage**: Loaded by `news.js` for password ticker

**Location**: Root directory

**Fallback**: Hardcoded array if file fails to load

---

### 3. Hardcoded Configuration

#### Feed Definitions (news.js)
**Location**: Top of `news.js`

**Structure**:
```javascript
const feeds = [
  { url: '...', name: '...', category: '...' },
  ...
];
```

**Modification**: Edit directly in code

---

#### CORS Proxy (news.js)
**Location**: `news.js` line ~166

**Value**: `"https://api.allorigins.win/raw?url="`

**Modification**: Edit directly in code

---

#### RSS Parser (index.html)
**Location**: CDN script tag in `index.html`

**Value**: `"https://unpkg.com/rss-parser/dist/rss-parser.min.js"`

**Modification**: Edit HTML directly

---

### 4. CSS Variables (styles.css)

**Purpose**: Theming and design system

**Location**: `:root` selector in `styles.css`

**Categories**:
- Colors (bg, text, accent, etc.)
- Typography (fonts, sizes)
- Spacing (space-1 through space-12)
- Layout (sidebar-width, header-height)
- Shadows
- Transitions

**Example**:
```css
:root {
  --color-bg: #121212;
  --color-accent: #818cf8;
  --font-sans: 'Inter', ...;
  --space-4: 1rem;
}
```

**Modification**: Edit CSS directly

**Runtime Changes**: Possible via JavaScript (not currently implemented)

---

## Configuration Options

### User-Configurable (via UI)

1. **Selected Feeds**: Checkboxes in sidebar
2. **Feed Order**: Up/down arrows
3. **Sort Mode**: Dropdown selector
4. **Keyword Search**: Text input
5. **Feed Search**: Text input in sidebar
6. **Category Filter**: Chip toggles
7. **Panel State**: Collapsible panels

### Developer-Configurable (code changes)

1. **Feed List**: Edit `feeds` array in `news.js`
2. **CORS Proxy**: Change `CORS_PROXY` constant
3. **Colors**: Edit CSS variables
4. **Fonts**: Edit CSS variables or HTML font links
5. **Cache TTL**: Edit cache expiration logic
6. **Retry Logic**: Edit `fetchXml()` retry count/delay
7. **Articles Per Feed**: Edit `renderItems()` slice limit

---

## Default Values

### Application Defaults

**Selected Feeds**: All feeds selected on first load
```javascript
selectedFeeds = [...DEFAULT_FEED_ORDER];
```

**Sort Mode**: 'newest'
```javascript
currentSort = localStorage.getItem('sortMode') || 'newest';
```

**Feed Panel**: Open
```javascript
feedPanelOpen = storedFeedPanelState !== 'false';
```

**Active Categories**: All categories
```javascript
activeFeedCategories = Array.from(new Set(feeds.map(feed => feed.category || 'Feeds')));
```

**Feed Order**: Order defined in `feeds` array

---

## Configuration Loading

### On Page Load

1. **creds.js**: Fetches `creds.json`, randomizes credential
2. **news.js**: Loads all localStorage preferences
3. **news.js**: Loads password list from `top_1000_passwords.txt`
4. **widget.js**: Loads or creates credential cache

### Loading Order

1. HTML loads
2. CSS loads
3. Scripts load in order:
   - creds.js
   - rss-parser (CDN)
   - news.js
   - widget.js
   - ui.js

---

## Environment Variables

### None Used

- No `.env` file
- No environment-specific config
- No build-time configuration
- All config is runtime or hardcoded

---

## Configuration Validation

### Minimal Validation

- JSON parsing with try/catch
- Fallback to defaults on error
- No schema validation
- No type checking
- No range validation

### Error Handling

```javascript
try {
  const parsed = JSON.parse(storedValue);
  if (Array.isArray(parsed)) {
    return parsed;
  }
} catch (err) {
  console.warn('Failed to parse', err);
}
return defaultValue;
```

---

## Different Environments

### Development

- Local server: `python server.py`
- Port: 8000
- SSL: Requires `cert.pem` and `key.pem`

### Production

- Static file hosting
- Any web server (nginx, Apache, etc.)
- No server-side requirements

### No Environment-Specific Config

- Same code for all environments
- No feature flags
- No environment variables
- No build-time differences

---

## Secrets and Sensitive Data

### None Stored

- No API keys
- No passwords (except public default creds)
- No tokens
- No user data
- All data is public or client-side only

### Credentials

- `creds.json`: Public default credentials (not sensitive)
- Used for UI display only
- Not used for authentication

---

## Configuration Best Practices

### Current Approach

✅ **Good**:
- User preferences in localStorage
- CSS variables for theming
- Clear separation of config and code

⚠️ **Could Improve**:
- No configuration file for feeds (hardcoded)
- No validation of localStorage data
- No migration strategy for config changes
- No way to reset configuration

### Recommendations

1. **Feed Configuration**: Move to separate JSON file
2. **Validation**: Add schema validation for localStorage
3. **Reset**: Add "Reset to defaults" button
4. **Export/Import**: Allow users to export/import settings
5. **Versioning**: Version localStorage schema for migrations
