# Key Components and Modules

## Core Components

### 1. news.js (1030 lines) - Main Application

**Purpose**: Core application logic for feed aggregation and display

**Key Functions**:

#### Feed Configuration
- `feeds`: Array of feed definitions
- `feedMap`: Map for quick lookup
- `getFeedColors()`: Generate unique colors per feed
- `getCategoryColors()`: Generate colors per category

#### State Management
- `selectedFeeds`: Array of selected feed URLs
- `feedOrder`: Display order of feeds
- `currentSort`: Current sort mode
- `feedFilterTerm`: Search term for feeds
- `activeFeedCategories`: Active category filters
- All state persisted to localStorage

#### Feed Panel UI
- `renderFeedForm()`: Initialize feed panel
- `renderFeedOptions()`: Render feed list with checkboxes
- `renderCategoryChips()`: Render category filter chips
- `handleFeedCheckboxChange()`: Handle feed selection
- `handleFeedMove()`: Handle feed reordering
- `updateFeedStatusCount()`: Update selected count

#### Feed Fetching & Parsing
- `fetchXml()`: Fetch RSS feed via CORS proxy (with retry)
- `parseXml()`: Parse XML with rss-parser
- `handleFeed()`: Complete feed handling (cache + fetch)
- `loadNews()`: Main entry point for loading all feeds

#### Rendering
- `renderItems()`: Render articles for a feed
- `createSkeletonArticles()`: Create loading placeholders
- `applyFeedOrderToDom()`: Reorder feed sections

#### Search & Filter
- `applySearchFilter()`: Filter articles by keyword
- `initSearchFilter()`: Initialize search input
- `escapeRegExp()`: Escape regex special chars

#### Sorting
- `initSortControl()`: Initialize sort dropdown
- `applySorting()`: Apply sort to articles/sections

#### System Status
- `updateSystemStatus()`: Update last updated time and feed health

#### Utilities
- `feedKey()`: Generate unique key from feed URL
- `feedCheckboxId()`: Generate checkbox ID
- `getFeedsInOrder()`: Get feeds in display order
- `isFeedInActiveCategory()`: Check if feed matches category filter

**Dependencies**:
- `rss-parser` (global RSSParser)
- DOM APIs
- localStorage API
- Fetch API

**Dependents**: None (top-level module)

---

### 2. widget.js - Cred of the Week Widget

**Purpose**: Display random default credential from SecLists

**Key Functions**:
- `listCredFiles()`: Fetch file list from GitHub API
- `fetchAllCreds()`: Fetch and parse credential files
- `loadCredCache()`: Load or create credential cache (1 week TTL)
- `renderCredOfWeek()`: Render widget content
- `refreshCredOfWeek()`: Get new random credential

**Features**:
- Caches credentials for 1 week
- Samples 10 random files from SecLists
- Fallback credential if fetch fails
- Retry button on error

**Dependencies**:
- GitHub API
- localStorage API
- Fetch API

**Dependents**: None (independent)

---

### 3. creds.js - Credential Display

**Purpose**: Manage faux URL bar and credential dropdown

**Key Functions**:
- `fetchCreds()`: Load credentials from creds.json
- `randomCred()`: Get random credential
- `renderCredsHistory()`: Render dropdown history
- `setFauxUrlCred()`: Update faux URL bar

**Features**:
- Randomizes credential on page load
- Dropdown shows all credentials
- Click to select different credential
- Keyboard accessible (Escape to close)

**Dependencies**:
- creds.json file
- DOM APIs

**Dependents**: None (independent)

---

### 4. index.html - Application Shell

**Purpose**: HTML structure and script loading

**Structure**:
- Header with faux URL bar
- Sidebar with feed controls, widget, status
- Main content with filter bar and news feed
- Footer
- Back to top button

**Script Loading Order**:
1. creds.js
2. rss-parser (CDN)
3. news.js
4. widget.js
5. ui.js (placeholder)

**Dependencies**: None (entry point)

**Dependents**: All JavaScript files

---

### 5. styles.css - Design System

**Purpose**: Complete styling and design system

**Sections**:
- CSS Variables (colors, typography, spacing, etc.)
- Reset & Base styles
- Utilities
- Site Header
- App Layout
- Sidebar & Panels
- Feed Controls
- Cred Widget
- System Status
- Main Content
- Filter Bar
- Loading State
- News Feed
- Empty State
- Back to Top
- Footer
- Credentials History
- Responsive breakpoints

**Key Features**:
- Dark theme (`#121212` base)
- CSS variables for easy theming
- Responsive design (mobile-first)
- Monospace for UI, sans-serif for content
- Consistent spacing scale

**Dependencies**: None

**Dependents**: All HTML elements

---

## Component Relationships

```
index.html
├── styles.css (styles everything)
├── creds.js (independent)
├── widget.js (independent)
└── news.js (main app)
    ├── Uses rss-parser (global)
    ├── Uses localStorage
    └── Manipulates DOM
```

## Data Flow Between Components

### Feed Loading
```
news.js::loadNews()
  → news.js::handleFeed() (for each feed)
    → news.js::fetchXml()
    → news.js::parseXml()
    → news.js::renderItems()
    → DOM update
```

### User Interaction
```
User clicks checkbox
  → news.js::handleFeedCheckboxChange()
    → Update selectedFeeds
    → Save to localStorage
    → news.js::loadNews()
```

### Search
```
User types in search
  → news.js::applySearchFilter()
    → Filter articles in DOM
    → Update result count
```

## Key Files Summary

| File | Lines | Purpose | Complexity |
|------|-------|---------|------------|
| news.js | 1030 | Core application | High |
| styles.css | 1139 | Design system | Medium |
| index.html | 182 | Structure | Low |
| widget.js | 114 | Cred widget | Low |
| creds.js | 124 | Cred display | Low |
| ui.js | 5 | Placeholder | None |

## Module Boundaries

### Clear Boundaries
- Each JS file is independent
- No imports/exports
- Global scope for shared state
- DOM as communication channel

### Shared Resources
- localStorage (all modules can access)
- DOM (all modules manipulate)
- Global objects (RSSParser)

## Component Responsibilities Matrix

| Feature | news.js | widget.js | creds.js | styles.css |
|---------|---------|-----------|----------|------------|
| Feed fetching | ✓ | | | |
| Feed rendering | ✓ | | | |
| Search/filter | ✓ | | | |
| Cred widget | | ✓ | | |
| Faux URL bar | | | ✓ | |
| Styling | | | | ✓ |
| State management | ✓ | | | |
