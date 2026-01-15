# Features and Functionality

## Core Features

### 1. RSS Feed Aggregation

**Description**: Pulls headlines from multiple cybersecurity news sources

**Implementation**:
- 7 feeds configured in `news.js`
- Categories: Newsrooms, Industry Press, Communities, Analysis & Research
- Fetched via CORS proxy (`api.allorigins.win`)
- Parsed with `rss-parser` library

**Feed Sources**:
1. Krebs on Security (Newsrooms)
2. BleepingComputer (Newsrooms)
3. The Register Security (Industry Press)
4. Hacker News (Communities)
5. ThreatPost (Newsrooms)
6. Dark Reading (Analysis & Research)
7. SecurityWeek (Newsrooms)

**User Flow**:
1. Feeds load automatically on page load
2. Shows cached content immediately
3. Fetches fresh content in background
4. Updates if content changed

---

### 2. Feed Selection & Management

**Description**: Users can select which feeds to display

**Features**:
- Checkbox list of all feeds
- "Select all" / "Clear" buttons
- Category-based filtering (chips)
- Feed search (filter by name)
- Feed reordering (up/down arrows)
- Selected count display (X/7)

**Implementation**:
- State: `selectedFeeds` array in localStorage
- UI: Sidebar panel with collapsible content
- Persistence: Survives page reload

**User Flow**:
1. Open sidebar "Feeds" panel
2. Use category chips to filter visible feeds
3. Search feeds by name (optional)
4. Check/uncheck feeds to select
5. Reorder with up/down buttons
6. Selection persists automatically

---

### 3. Keyword Search & Filtering

**Description**: Filter articles by keyword

**Features**:
- Real-time search as you type
- Highlights matching text
- Shows result count
- Clear button
- Searches title and URL
- Case-insensitive

**Implementation**:
- State: `newsSearchTerm` in localStorage
- Filtering: DOM manipulation (show/hide articles)
- Highlighting: Regex replacement with `<mark>` tags

**User Flow**:
1. Type in search bar
2. Articles filter instantly
3. Matching text highlighted
4. Result count displayed
5. Click X to clear

---

### 4. Sorting

**Description**: Sort articles by different criteria

**Options**:
- **Newest first**: Most recent articles first
- **Oldest first**: Oldest articles first
- **By source**: Alphabetical by feed name

**Implementation**:
- State: `sortMode` in localStorage
- Sorting: DOM manipulation (reorder elements)
- Uses `dataset.pubDate` for date sorting

**User Flow**:
1. Select sort option from dropdown
2. Articles reorder immediately
3. Preference saved automatically

---

### 5. Incremental Loading

**Description**: Shows content immediately from cache, updates in background

**Features**:
- Renders cached content instantly
- Fetches fresh content asynchronously
- Updates only if content changed
- Skeleton placeholders while loading
- Per-feed status indicators

**Implementation**:
- Cache: localStorage with `xmlCache_<feedKey>` keys
- Cache structure: `{ timestamp, xml }`
- Comparison: String comparison of XML

**User Flow**:
1. Page loads
2. Cached content appears immediately
3. Fresh content loads in background
4. Updates if changed
5. Status indicators show load state

---

### 6. Feed Status Tracking

**Description**: Visual indicators for feed health

**Status Types**:
- **Loaded**: Successfully loaded (< 3 seconds)
- **Slow**: Loaded but took > 3 seconds
- **Failed**: Failed to load after retries

**Display**:
- System status panel in sidebar
- Counts: "X OK", "Y Slow", "Z Failed"
- Color-coded indicators

**Implementation**:
- Tracking: `feedStatus` Map
- Updates: After each feed fetch
- Display: System status panel

---

### 7. Category Filtering

**Description**: Filter feeds by category

**Categories**:
- Newsrooms
- Industry Press
- Communities
- Analysis & Research

**Features**:
- Category chips in sidebar
- Toggle categories on/off
- Active categories highlighted
- Feeds filtered by active categories
- If no categories active, all shown

**Implementation**:
- State: `activeFeedCategories` array in localStorage
- UI: Clickable chips
- Filtering: Hides feeds not in active categories

---

### 8. Cred of the Week Widget

**Description**: Displays random default credential from SecLists

**Features**:
- Random credential on load
- Refresh button for new credential
- Source file displayed
- Link to raw list
- Entry number (X of Y)
- Cached for 1 week
- Fallback on error

**Implementation**:
- Fetches from GitHub API (SecLists repo)
- Samples 10 random files
- Caches credentials for 1 week
- Independent module (`widget.js`)

---

### 9. Faux URL Bar

**Description**: Playful credential display in header

**Features**:
- Random credential on load
- Format: `https://admin:password123@defaultcreds.lol`
- Clickable dropdown
- Shows all credentials
- Click to select different credential
- Keyboard accessible (Escape)

**Implementation**:
- Loads from `creds.json`
- Random selection on load
- Dropdown with all credentials
- Independent module (`creds.js`)

---

### 10. Loading Animation

**Description**: Password ticker during feed loading

**Features**:
- Animated password list
- Cycles through passwords
- Monospace font
- Loading spinner
- "Cracking passwords..." text

**Implementation**:
- Loads from `top_1000_passwords.txt`
- Falls back to hardcoded list
- Updates every 200ms
- Stops when loading complete

---

### 11. Responsive Design

**Description**: Works on mobile and desktop

**Breakpoints**:
- Desktop: > 1024px (sidebar + main)
- Tablet: 768px - 1024px (stacked layout)
- Mobile: < 768px (simplified header, stacked)

**Features**:
- Collapsible sidebar on mobile
- Responsive grid layout
- Touch-friendly controls
- Simplified header on mobile

---

### 12. Empty State

**Description**: Helpful message when no articles to show

**Triggers**:
- No feeds selected
- Search returns no results
- All articles filtered out

**Display**:
- Icon
- Title: "No articles to display"
- Description: Helpful guidance

---

### 13. Back to Top Button

**Description**: Quick scroll to top

**Features**:
- Appears after scrolling 400px
- Smooth scroll animation
- Fixed position (bottom right)
- Accessible (aria-label)

---

## Feature Relationships

### Dependencies
- **Search** depends on **Feed Aggregation** (needs articles to search)
- **Sorting** depends on **Feed Aggregation** (needs articles to sort)
- **Category Filtering** affects **Feed Selection** (filters visible feeds)

### Independent Features
- **Cred Widget**: Completely independent
- **Faux URL Bar**: Completely independent
- **Loading Animation**: Independent, triggered by feed loading

## Feature Flags/Configuration

### None
- All features always enabled
- No feature flags
- No A/B testing
- No gradual rollouts

## Optional Features

### None Currently
- All features are core
- No optional/experimental features

## Feature Implementation Status

| Feature | Status | Notes |
|---------|--------|-------|
| RSS Aggregation | ✅ Complete | 7 feeds configured |
| Feed Selection | ✅ Complete | Full UI implemented |
| Keyword Search | ✅ Complete | Real-time filtering |
| Sorting | ✅ Complete | 3 sort modes |
| Incremental Loading | ✅ Complete | Cache + background fetch |
| Status Tracking | ✅ Complete | Visual indicators |
| Category Filtering | ✅ Complete | Chip-based UI |
| Cred Widget | ✅ Complete | Independent module |
| Faux URL Bar | ✅ Complete | Independent module |
| Loading Animation | ✅ Complete | Password ticker |
| Responsive Design | ✅ Complete | 3 breakpoints |
| Empty State | ✅ Complete | Helpful messages |
| Back to Top | ✅ Complete | Smooth scroll |

## Future Features (from ui-refactor-brief.md)

### Not Yet Implemented
- **Two viewing densities**: Briefing view vs Terminal view
- **Dark mode toggle**: Currently always dark
- **Content chips**: CVE, vendor, breach tags
- **Summary/snippets**: One-line summaries in Briefing view

These are planned but not yet implemented in the current refactor-interface branch.
