# Architecture and Design Patterns

## Architectural Pattern

**Single Page Application (SPA)** with **Event-Driven Architecture**

- Single HTML file (`index.html`) serves as the shell
- JavaScript manages all state and DOM manipulation
- No routing (single page)
- Event-driven updates based on user interactions

## Design Patterns

### 1. **Module Pattern** (Implicit)
- Each JS file (`news.js`, `widget.js`, `creds.js`) acts as a module
- No explicit module system (no imports/exports)
- Global scope used for shared state
- Functions organized by purpose within files

### 2. **State Management Pattern**
- Centralized state in `news.js`:
  - `selectedFeeds`: Array of selected feed URLs
  - `feedOrder`: Order of feeds for display
  - `currentSort`: Sort mode
  - `feedFilterTerm`: Search term for feeds
  - `activeFeedCategories`: Active category filters
- **Persistence**: localStorage for all user preferences
- **Reactive Updates**: State changes trigger UI updates

### 3. **Observer Pattern** (Implicit)
- Event listeners watch for changes
- DOM updates react to state changes
- No explicit observer implementation, but pattern is present

### 4. **Cache-Aside Pattern**
- Feed XML cached in localStorage
- Cache key: `xmlCache_<feedKey>`
- Cache structure: `{ timestamp, xml }`
- Render from cache immediately, fetch fresh in background

### 5. **Incremental Rendering Pattern**
- Render cached content first (if available)
- Fetch fresh content in background
- Update DOM only if content changed
- Show skeleton placeholders while loading

## Data Flow

```
User Action
    ↓
Event Handler (news.js)
    ↓
State Update (localStorage + in-memory)
    ↓
UI Update (DOM manipulation)
    ↓
Visual Feedback
```

### Feed Loading Flow

```
1. User selects feeds
   ↓
2. loadNews() called
   ↓
3. For each selected feed:
   a. Check localStorage cache
   b. Render cached content immediately (if exists)
   c. Fetch fresh XML via CORS proxy
   d. Parse XML with rss-parser
   e. Compare with cached version
   f. Update DOM if changed
   ↓
4. Apply filters and sorting
   ↓
5. Update system status
```

## Code Organization

### Separation of Concerns

1. **HTML (index.html)**: Structure only
   - Semantic markup
   - No inline styles or scripts (except year display)
   - Data attributes for JavaScript hooks

2. **CSS (styles.css)**: Presentation only
   - Complete design system
   - CSS variables for theming
   - Responsive breakpoints
   - No JavaScript dependencies

3. **JavaScript**: Behavior only
   - DOM manipulation
   - State management
   - API calls
   - Event handling

### Module Responsibilities

**news.js** (Core Application):
- Feed configuration
- Feed fetching and parsing
- State management
- UI rendering
- Search and filtering
- Sorting
- System status

**widget.js** (Cred of the Week):
- GitHub API calls
- Credential caching
- Widget rendering
- Independent of main app

**creds.js** (Credential Display):
- Credential loading
- Faux URL bar updates
- Dropdown interaction
- Independent of main app

## Key Abstractions

### Feed Object
```javascript
{
  url: string,      // RSS feed URL
  name: string,     // Display name
  category: string  // Category for filtering
}
```

### Feed Status
```javascript
{
  status: 'loaded' | 'slow' | 'failed',
  time: number,     // Load time in ms
  error?: string    // Error message if failed
}
```

### Article Item (from rss-parser)
```javascript
{
  title: string,
  link: string,
  pubDate: string,
  author?: string,
  content?: string,
  contentSnippet?: string
}
```

## State Management Details

### Persistent State (localStorage)
- `selectedFeeds`: JSON array of feed URLs
- `feedOrder`: JSON array of feed URLs in display order
- `sortMode`: String ('newest', 'oldest', 'source')
- `newsSearchTerm`: String (keyword filter)
- `feedFilterTerm`: String (feed search)
- `feedPanelOpen`: Boolean (sidebar panel state)
- `activeFeedCategories`: JSON array of category names
- `xmlCache_<feedKey>`: JSON object with timestamp and XML

### In-Memory State
- `feedStatus`: Map of feed URL → status object
- `lastUpdateTime`: Date object
- `feedColorCache`: Map of feed URL → color object
- `categoryColorCache`: Map of category → color object
- `passwordList`: Array of passwords for animation

## Component Communication

### Direct Function Calls
- Functions call each other directly
- No message passing or event bus
- Shared state via global variables

### Event Delegation
- Used for dynamic content (feed list, articles)
- Single event listener on parent
- Checks `event.target.closest()` for actual element

### DOM as Communication Channel
- State changes reflected in DOM
- Other components read from DOM if needed
- Data attributes used for state (`data-selected`, `data-active`, etc.)

## Error Handling

### Feed Fetching
- Retry logic: 3 attempts with 500ms delay
- Status tracking: 'loaded', 'slow', 'failed'
- Error display: User-friendly messages
- Graceful degradation: Shows cached content if fetch fails

### Parsing
- Try/catch around XML parsing
- Error flags: `isProxyError`, `isParserError`
- Fallback: Show error message, keep cached content

### Cache
- JSON.parse with try/catch
- Fallback to empty/default values
- localStorage errors handled gracefully

## Performance Optimizations

1. **Incremental Rendering**: Show cached content immediately
2. **Lazy Loading**: Feeds loaded asynchronously
3. **Event Delegation**: Single listeners instead of many
4. **CSS Variables**: Efficient theming without recalculation
5. **LocalStorage Caching**: Avoid redundant network requests
6. **Skeleton Placeholders**: Prevent layout shift
7. **Debouncing**: (Not currently implemented, but could be added)

## Coupling and Cohesion

### Low Coupling
- `widget.js` and `creds.js` are independent
- `news.js` is self-contained
- No circular dependencies

### High Cohesion
- Related functionality grouped together
- Each file has a clear purpose
- Functions organized by feature

## Scalability Considerations

### Current Limitations
- All feeds loaded in parallel (could overwhelm with many feeds)
- No pagination (shows all articles)
- No rate limiting on CORS proxy
- localStorage size limits (5-10MB typically)

### Design Decisions for Scale
- Feed limit: Shows 5 articles per feed (hardcoded)
- Category filtering: Reduces visible feeds
- Search filtering: Reduces visible articles
- Caching: Reduces redundant fetches
