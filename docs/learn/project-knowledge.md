# Project Knowledge Base - defaultcreds.lol

**Last Updated**: 2026-01-15T23:15:52Z  
**Branch**: refactor-interface  
**Project Type**: Static Website / Cybersecurity News Aggregator

---

## Executive Summary

defaultcreds.lol is a lightweight, vanilla JavaScript cybersecurity news aggregator that pulls headlines from multiple RSS feeds and displays them in a clean, terminal-style interface. The project emphasizes simplicity with no build tools, no frameworks, and direct file serving. It's currently undergoing a UI refactor to create a more professional "intelligence console" aesthetic.

---

## Quick Reference

### Key Facts
- **Language**: JavaScript (ES6+), HTML5, CSS3
- **Dependencies**: rss-parser (CDN), api.allorigins.win (CORS proxy)
- **Build System**: None (static files)
- **State Management**: localStorage
- **Architecture**: Single Page Application, Event-Driven
- **Lines of Code**: ~2,500 (news.js: 1030, styles.css: 1139)

### Important Files
- `index.html`: Application shell
- `news.js`: Core application logic
- `styles.css`: Complete design system
- `widget.js`: Cred of the Week widget
- `creds.js`: Faux URL bar management

### Key Commands
```bash
# Local development
python server.py                    # HTTPS server (port 8000)
python -m http.server 8000          # HTTP server

# Git
git checkout refactor-interface     # Current branch
git push origin refactor-interface  # Push branch
```

### Important URLs
- **Remote**: `ssh://git@gitforge.online:27665/srv/git/repos/defaultcreds-lol.git`
- **CORS Proxy**: `https://api.allorigins.win/raw?url=`
- **RSS Parser**: `https://unpkg.com/rss-parser/dist/rss-parser.min.js`

---

## Mental Model Overview

### Architecture
```
User Interaction
    ↓
Event Handler (news.js)
    ↓
State Update (localStorage + memory)
    ↓
DOM Update
    ↓
Visual Feedback
```

### Data Flow
1. **Page Load**: Load preferences from localStorage, render cached feeds
2. **Feed Selection**: Update `selectedFeeds`, save to localStorage, reload feeds
3. **Feed Fetching**: Check cache → render cached → fetch fresh → update if changed
4. **Search/Filter**: Filter DOM elements, update count
5. **Sorting**: Reorder DOM elements based on criteria

### Key Concepts
- **Incremental Rendering**: Show cached content immediately, update in background
- **State Persistence**: All user preferences in localStorage
- **Event Delegation**: Single listeners on parents for dynamic content
- **Cache-First Strategy**: Always show cached content if available

---

## Detailed Sections

### 1. [Project Overview](project-overview.md)
- Purpose and features
- Target users
- Current state

### 2. [Project Structure](project-structure.md)
- Directory organization
- File purposes
- Naming conventions

### 3. [Technology Stack](technology-stack.md)
- Core technologies
- Dependencies
- Why these choices

### 4. [Architecture](architecture.md)
- Design patterns
- Data flow
- Component communication
- State management

### 5. [Code Conventions](conventions.md)
- Naming conventions
- Code style
- Organization patterns

### 6. [Key Components](key-components.md)
- news.js breakdown
- widget.js overview
- creds.js overview
- Component relationships

### 7. [Features](features.md)
- All 13 features documented
- Implementation details
- User flows

### 8. [Configuration](configuration.md)
- localStorage keys
- Static config files
- CSS variables
- Default values

### 9. [Testing](testing.md)
- Current state (no tests)
- Recommendations
- What should be tested

### 10. [Development Workflow](development-workflow.md)
- Setup instructions
- Common tasks
- Debugging
- Deployment

---

## Key Insights

### Strengths
1. **Simplicity**: No build tools, easy to understand
2. **Performance**: Incremental rendering, aggressive caching
3. **User Experience**: Persistent preferences, instant feedback
4. **Maintainability**: Clear separation of concerns

### Areas for Improvement
1. **Testing**: No tests currently
2. **Code Organization**: Some long functions in news.js
3. **Configuration**: Feeds hardcoded, could be external
4. **Error Handling**: Basic, could be more robust

### Interesting Aspects
1. **Terminal Aesthetic**: Unique design choice for news aggregator
2. **Playful Branding**: Default credentials theme throughout
3. **Cache Strategy**: Smart use of localStorage for performance
4. **No Framework**: Demonstrates vanilla JS capabilities

---

## Architecture Highlights

### Design Patterns
- **Module Pattern**: Each JS file is a module
- **State Management**: Centralized in news.js
- **Cache-Aside**: localStorage caching strategy
- **Incremental Rendering**: Show cached, update fresh

### Key Abstractions
- Feed objects: `{ url, name, category }`
- Feed status: `{ status, time, error? }`
- Article items: From rss-parser

### State Management
- Persistent: localStorage (user preferences)
- In-memory: Maps and arrays (runtime state)
- Reactive: State changes trigger UI updates

---

## Important Conventions

### Naming
- **JavaScript**: camelCase (variables, functions)
- **CSS/HTML**: kebab-case (classes, IDs, attributes)
- **Files**: kebab-case

### Code Style
- 2 space indentation
- Semicolons used
- Single quotes for strings
- Comments for complex logic

### Organization
- Functions grouped by purpose
- Related code near each other
- Clear section headers in large files

---

## Next Steps

### For New Developers
1. Read [Project Overview](project-overview.md)
2. Review [Architecture](architecture.md)
3. Explore [Key Components](key-components.md)
4. Follow [Development Workflow](development-workflow.md)

### For Making Changes
1. Understand current implementation
2. Follow existing conventions
3. Test manually in browser
4. Update documentation if needed

### Recommended Actions
- **Add Tests**: Start with core functionality
- **Refactor**: Break down long functions
- **Externalize Config**: Move feeds to JSON
- **Add Features**: Implement planned features from ui-refactor-brief.md

---

## Related Documentation

- **ui-refactor-brief.md**: Design specifications for current refactor
- **.gitignore**: Ignored files and patterns
- **This Knowledge Base**: Comprehensive project understanding

---

## Questions?

If something is unclear:
1. Check the detailed sections above
2. Read the source code (it's well-commented)
3. Review the architecture documentation
4. Check browser DevTools for runtime behavior

---

*This knowledge base was generated by the learn.md prompt on 2026-01-15T23:15:52Z*
