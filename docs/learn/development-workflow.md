# Development Workflow

## Development Setup

### Prerequisites

1. **Git**: For version control
2. **Web Server**: For local development
   - Python 3 (for `server.py`)
   - OR any static file server
3. **Text Editor/IDE**: Any editor works (no specific requirements)
4. **Browser**: Modern browser with DevTools

### Initial Setup

1. **Clone Repository**
   ```bash
   git clone ssh://git@gitforge.online:27665/srv/git/repos/defaultcreds-lol.git
   cd defaultcreds.lol
   ```

2. **Checkout Branch** (if working on feature)
   ```bash
   git checkout refactor-interface
   ```

3. **No Dependencies to Install**
   - No npm/pip install needed
   - All dependencies are CDN or built-in

4. **Optional: Local Server Setup**
   ```bash
   # Generate SSL certificates (if using server.py)
   openssl req -x509 -newkey rsa:4096 -nodes -keyout key.pem -out cert.pem -days 365
   
   # Start server
   python server.py
   ```

5. **Open in Browser**
   - Navigate to `https://localhost:8000` (if using server.py)
   - OR open `index.html` directly in browser

---

## Common Development Tasks

### Running the Project

**Option 1: Python Server** (with SSL)
```bash
python server.py
# Opens on https://localhost:8000
```

**Option 2: Python Simple Server** (without SSL)
```bash
python -m http.server 8000
# Opens on http://localhost:8000
```

**Option 3: Direct File**
- Open `index.html` in browser
- Some features may not work (CORS, localStorage)

**Option 4: Any Static Server**
- nginx, Apache, etc.
- Serve the directory

---

### Making Changes

1. **Edit Files**
   - Edit HTML, CSS, or JS files directly
   - No build step required
   - Changes visible immediately on refresh

2. **Test Changes**
   - Refresh browser
   - Check console for errors
   - Test functionality manually

3. **Debug**
   - Use browser DevTools
   - Check Console tab for errors
   - Use Network tab to inspect requests
   - Use Application tab to inspect localStorage

---

### Running Tests

**Current State**: No tests exist

**If tests were added**:
```bash
# Would be something like:
npm test
# or
npm run test:watch
```

---

### Building

**Not Applicable**: No build process

- Files are served directly
- No compilation
- No bundling
- No minification

---

### Linting/Formatting

**Current State**: No linting/formatting configured

**If added**:
```bash
# Would be something like:
npm run lint
npm run format
```

**Manual**: Follow conventions in `docs/learn/conventions.md`

---

## Git Workflow

### Branch Strategy

**Current**: Feature branch (`refactor-interface`)

**Typical Flow**:
1. Create feature branch
2. Make changes
3. Commit changes
4. Push to remote
5. Merge when ready (or keep separate)

### Commit Messages

**Observed Pattern**:
- Short, descriptive messages
- Examples:
  - "WIP: UI refactor - moving to branch"
  - "Trigger bundle backup"
  - "Initial commit: defaultscreds.lol website"

**Recommendation**: 
- Use present tense ("Add feature" not "Added feature")
- Be descriptive
- Reference issues if applicable

### Remote Repository

**Location**: gitforge.online
- SSH: `ssh://git@gitforge.online:27665/srv/git/repos/defaultcreds-lol.git`
- Self-hosted git server

---

## Debugging

### Browser DevTools

**Console**:
- Check for JavaScript errors
- Log state changes: `console.log(selectedFeeds)`
- Inspect objects: `console.dir(feedStatus)`

**Network Tab**:
- Inspect RSS feed requests
- Check CORS proxy responses
- Verify cache behavior

**Application Tab**:
- Inspect localStorage
- View stored preferences
- Clear storage if needed

**Elements Tab**:
- Inspect DOM structure
- Check CSS applied
- Test CSS changes in real-time

### Common Issues

1. **Feeds Not Loading**
   - Check CORS proxy is accessible
   - Check console for errors
   - Verify feed URLs are valid

2. **State Not Persisting**
   - Check localStorage in DevTools
   - Verify JSON is valid
   - Check for localStorage errors

3. **Styling Issues**
   - Check CSS variables are defined
   - Verify class names match
   - Check responsive breakpoints

---

## Adding New Features

### Process

1. **Plan Feature**
   - Understand requirements
   - Identify where code goes
   - Consider state management

2. **Implement**
   - Add HTML structure (if needed)
   - Add CSS styles (if needed)
   - Add JavaScript logic
   - Update state management

3. **Test**
   - Manual testing in browser
   - Test edge cases
   - Test responsive design

4. **Commit**
   - Descriptive commit message
   - Logical commit grouping

### Example: Adding a New Feed

1. **Edit `news.js`**
   ```javascript
   const feeds = [
     // ... existing feeds
     { url: 'https://newfeed.com/rss', name: 'New Feed', category: 'Newsrooms' }
   ];
   ```

2. **Test**
   - Refresh page
   - Verify feed appears in list
   - Select feed and verify it loads

3. **Commit**
   ```bash
   git add news.js
   git commit -m "Add New Feed to feed list"
   ```

---

## Code Review Process

### Current State

**No formal process** - Self-review or ad-hoc

### Recommendations

1. **Self-Review Checklist**
   - [ ] Code follows conventions
   - [ ] No console errors
   - [ ] Works in multiple browsers
   - [ ] Responsive design works
   - [ ] State persists correctly
   - [ ] No obvious bugs

2. **If Collaborating**
   - Create pull request
   - Request review
   - Address feedback
   - Merge when approved

---

## Deployment

### Current Process

**Not documented** - Appears to be static file hosting

### Typical Static Site Deployment

1. **Build** (if needed): N/A for this project
2. **Upload Files**: Upload HTML, CSS, JS files
3. **Configure Server**: Set up web server
4. **Test**: Verify site works

### Deployment Options

- **Static Hosting**: GitHub Pages, Netlify, Vercel
- **VPS**: nginx, Apache
- **CDN**: Cloudflare, AWS CloudFront

---

## Development Tools

### Recommended

1. **Browser DevTools**: Essential
2. **Git**: Version control
3. **Text Editor**: VS Code, Vim, etc.
4. **Local Server**: Python, Node.js http-server, etc.

### Optional

1. **Live Reload**: Browser extension or tool
2. **CSS Validator**: Online or extension
3. **JavaScript Linter**: ESLint extension
4. **Accessibility Checker**: axe DevTools

---

## Troubleshooting

### Common Problems

1. **CORS Errors**
   - CORS proxy may be down
   - Check `api.allorigins.win` status
   - Try alternative proxy

2. **localStorage Full**
   - Clear old cache entries
   - Reduce cache size
   - Implement cache expiration

3. **RSS Parser Errors**
   - Feed may be malformed
   - Check feed URL directly
   - Verify feed format

4. **Styling Issues**
   - Check CSS variables are defined
   - Verify class names match
   - Check for CSS conflicts

---

## Best Practices

### Code Quality

1. **Follow Conventions**: See `docs/learn/conventions.md`
2. **Keep Functions Focused**: Single responsibility
3. **Comment Complex Logic**: Explain why, not what
4. **Handle Errors**: Try/catch, fallbacks

### Performance

1. **Cache Aggressively**: Use localStorage
2. **Lazy Load**: Load feeds incrementally
3. **Debounce**: Consider for search (not currently)
4. **Minimize DOM Manipulation**: Batch updates

### Maintainability

1. **Organize Code**: Group related functions
2. **Clear Naming**: Descriptive variable/function names
3. **Document Changes**: Update docs if needed
4. **Test Manually**: Verify before committing

---

## Summary

**Workflow**: Simple, straightforward
- Edit files
- Refresh browser
- Test manually
- Commit changes

**No Build Step**: Fast iteration
- Changes visible immediately
- No compilation wait time

**Minimal Tooling**: Low barrier to entry
- Just a text editor and browser
- No complex setup required
