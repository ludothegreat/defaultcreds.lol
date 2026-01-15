# Code Conventions and Style

## Naming Conventions

### JavaScript

**Variables and Functions**: camelCase
```javascript
selectedFeeds
feedOrder
loadNews()
renderFeedOptions()
```

**Constants**: camelCase (no SCREAMING_SNAKE_CASE)
```javascript
const CORS_PROXY = "..."
const ONE_WEEK = 7 * 24 * 60 * 60 * 1000
```

**CSS Classes/IDs**: kebab-case
```javascript
'feed-section'
'panel-header'
'news-feed'
```

**Data Attributes**: kebab-case
```javascript
data-feed-url
data-action
data-category
```

### CSS

**Class Names**: kebab-case
```css
.feed-section
.panel-header
.search-wrapper
```

**CSS Variables**: kebab-case with `--` prefix
```css
--color-bg
--color-text
--space-4
--font-sans
```

**IDs**: kebab-case
```css
#news-feed
#feed-list
#search-bar
```

### HTML

**Attributes**: kebab-case
```html
aria-expanded
data-action
class="feed-option"
```

## Code Formatting

### Indentation
- **2 spaces** (consistent throughout)

### Line Length
- No strict limit observed
- Generally readable, breaks at logical points

### Spacing
- Single space after keywords (`if`, `for`, etc.)
- Single space around operators
- No space before function parentheses: `function()`
- Space after commas in function parameters

### Semicolons
- **Semicolons used** consistently

### Quotes
- **Single quotes** for strings in JavaScript
- **Double quotes** for HTML attributes

## Code Organization

### Function Organization
- Functions grouped by purpose
- Related functions near each other
- Helper functions near their usage

### File Structure (news.js)
1. Feed configuration
2. Color generation
3. State management
4. Feed panel UI
5. Fetch & parse
6. Rendering
7. Search & filter
8. Sorting
9. Loading
10. Initialization

### Comment Style
- **Single-line comments**: `// Comment`
- **Section headers**: `// ============================================`
- **Inline comments**: Minimal, only when needed
- **No JSDoc**: No formal documentation comments

## Error Handling Patterns

### Try/Catch
```javascript
try {
  // operation
} catch (err) {
  console.warn('Error message', err);
  // fallback
}
```

### Error Flags
```javascript
err.isProxyError = true;
err.isParserError = true;
```

### Graceful Degradation
- Always provide fallback behavior
- Show cached content if fetch fails
- Display user-friendly error messages

## DOM Manipulation Patterns

### Element Creation
```javascript
const element = document.createElement('div');
element.className = 'class-name';
element.textContent = 'Text';
container.appendChild(element);
```

### Event Delegation
```javascript
container.addEventListener('click', (e) => {
  const target = e.target.closest('.selector');
  if (target) {
    // handle
  }
});
```

### Data Binding
- Use `dataset` for data attributes
- Store original values in `dataset` for filtering
- Use `hidden` attribute for visibility

## State Management Patterns

### LocalStorage
```javascript
// Save
localStorage.setItem('key', JSON.stringify(value));

// Load
const value = JSON.parse(localStorage.getItem('key') || 'null');
```

### State Updates
1. Update in-memory state
2. Save to localStorage
3. Update UI
4. Trigger side effects (e.g., reload feeds)

## CSS Patterns

### CSS Variables
- Defined in `:root`
- Used throughout stylesheet
- Enables easy theming

### BEM-like Naming
- Not strict BEM, but similar pattern
- Component-based: `.feed-section`
- Modifier-like: `.feed-section.collapsed`
- Element-like: `.feed-section h2`

### Responsive Design
- Mobile-first approach (base styles)
- Media queries for larger screens
- Breakpoints: 1024px, 768px, 480px

## Async Patterns

### Async/Await
```javascript
async function fetchData() {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}
```

### Promise.all for Parallel Operations
```javascript
const results = await Promise.all(feeds.map(f => handleFeed(f)));
```

## Code Style Observations

### Positive Patterns
- Consistent naming
- Clear function names
- Good separation of concerns
- Helpful comments for complex logic

### Areas for Improvement
- Some functions are quite long (100+ lines)
- Could benefit from more helper functions
- Some repeated patterns could be extracted
- No formal style guide file

## No Linting/Formatting Tools

- No `.eslintrc`
- No `.prettierrc`
- No `.editorconfig`
- Manual style enforcement

## Documentation Style

- **Markdown files**: For documentation
- **Inline comments**: For complex logic
- **Section headers**: For code organization
- **No JSDoc**: No formal API documentation
