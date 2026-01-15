# Learning Path for New Developers

This guide suggests an order for learning about defaultcreds.lol, from high-level overview to deep implementation details.

---

## Phase 1: Get the Big Picture (15 minutes)

### Start Here: Project Overview
**Read**: [project-overview.md](project-overview.md)

**What you'll learn**:
- What the project does
- Main features
- Target users
- Current state

**Key Takeaways**:
- It's a cybersecurity news aggregator
- No build tools, pure vanilla JS
- Currently on refactor-interface branch
- Terminal aesthetic design

### Then: Quick Reference
**Read**: [quick-reference.md](quick-reference.md)

**What you'll learn**:
- Key commands
- Important file locations
- Common tasks
- Quick troubleshooting

**Key Takeaways**:
- Main file is `news.js` (1030 lines)
- State stored in localStorage
- 7 feeds configured
- No build step needed

---

## Phase 2: Understand the Structure (20 minutes)

### Project Structure
**Read**: [project-structure.md](project-structure.md)

**What you'll learn**:
- How files are organized
- What each file does
- Naming conventions
- Entry points

**Key Takeaways**:
- Flat structure (most files at root)
- `news.js` is the core
- `styles.css` is complete design system
- Widgets are independent modules

### Technology Stack
**Read**: [technology-stack.md](technology-stack.md)

**What you'll learn**:
- What technologies are used
- Why these choices
- Dependencies
- What's missing (no frameworks)

**Key Takeaways**:
- Vanilla JavaScript only
- rss-parser from CDN
- CORS proxy for feeds
- No build tools

---

## Phase 3: Dive into Architecture (30 minutes)

### Architecture Deep Dive
**Read**: [architecture.md](architecture.md)

**What you'll learn**:
- Design patterns used
- Data flow
- State management
- Component communication
- Performance optimizations

**Key Takeaways**:
- SPA with event-driven architecture
- Cache-first strategy
- Incremental rendering
- localStorage for persistence

### Key Components
**Read**: [key-components.md](key-components.md)

**What you'll learn**:
- What each major component does
- Key functions in each file
- Component relationships
- Dependencies

**Key Takeaways**:
- `news.js` is the main app
- `widget.js` and `creds.js` are independent
- Clear module boundaries
- DOM as communication channel

---

## Phase 4: Learn the Code Style (15 minutes)

### Code Conventions
**Read**: [conventions.md](conventions.md)

**What you'll learn**:
- Naming conventions
- Code formatting
- Organization patterns
- Error handling

**Key Takeaways**:
- camelCase for JS, kebab-case for CSS
- 2 space indentation
- Semicolons used
- Try/catch for errors

---

## Phase 5: Understand Features (20 minutes)

### Features Overview
**Read**: [features.md](features.md)

**What you'll learn**:
- All 13 features
- How each is implemented
- User flows
- Feature relationships

**Key Takeaways**:
- 7 RSS feeds
- Search, filter, sort
- Incremental loading
- Status tracking

### Configuration
**Read**: [configuration.md](configuration.md)

**What you'll learn**:
- How configuration works
- localStorage keys
- Default values
- Static config files

**Key Takeaways**:
- All state in localStorage
- Feeds hardcoded in `news.js`
- CSS variables for theming
- No environment variables

---

## Phase 6: Get Hands-On (30 minutes)

### Development Workflow
**Read**: [development-workflow.md](development-workflow.md)

**What you'll learn**:
- How to set up
- How to run locally
- How to make changes
- How to debug

**Try It**:
1. Clone the repo
2. Start local server
3. Open in browser
4. Make a small change (e.g., add a feed)
5. Test it works

**Key Takeaways**:
- No setup needed (just clone)
- Edit files, refresh browser
- Use DevTools for debugging
- No build step

---

## Phase 7: Explore the Code (45+ minutes)

### Read the Source

**Start with**: `index.html`
- Understand the structure
- See how scripts are loaded
- Note the HTML structure

**Then**: `styles.css`
- Browse the design system
- See CSS variables
- Understand responsive breakpoints

**Then**: `news.js` (section by section)
1. Feed configuration (top)
2. Color generation
3. State management
4. Feed panel UI
5. Fetch & parse
6. Rendering
7. Search/filter
8. Sorting
9. Initialization

**Finally**: `widget.js` and `creds.js`
- See how independent modules work
- Understand their simplicity

### Experiment

1. **Add a Feed**:
   - Edit `feeds` array in `news.js`
   - Refresh and see it appear

2. **Change Colors**:
   - Edit CSS variables in `styles.css`
   - See theme change

3. **Modify Search**:
   - Change search behavior
   - Test different filters

---

## Phase 8: Deep Understanding (Optional)

### Testing
**Read**: [testing.md](testing.md)

**What you'll learn**:
- Current state (no tests)
- What should be tested
- Recommendations

**Consider**: Adding your first test

### Architecture Patterns
**Re-read**: [architecture.md](architecture.md) (focus on patterns)

**Think about**:
- Why these patterns were chosen
- How you'd extend the system
- What you'd change

---

## Recommended Reading Order Summary

1. ✅ **project-overview.md** - What is this?
2. ✅ **quick-reference.md** - Quick lookup
3. ✅ **project-structure.md** - How is it organized?
4. ✅ **technology-stack.md** - What technologies?
5. ✅ **architecture.md** - How does it work?
6. ✅ **key-components.md** - What are the parts?
7. ✅ **conventions.md** - How is code written?
8. ✅ **features.md** - What can it do?
9. ✅ **configuration.md** - How is it configured?
10. ✅ **development-workflow.md** - How do I work with it?
11. ✅ **Read source code** - See it in action
12. ✅ **testing.md** - How is it tested? (optional)

---

## Time Estimates

- **Quick Overview**: 30 minutes (Phases 1-2)
- **Understanding**: 1 hour (Phases 3-4)
- **Features & Config**: 45 minutes (Phase 5)
- **Hands-On**: 1 hour (Phase 6)
- **Code Exploration**: 2+ hours (Phase 7)
- **Deep Dive**: Variable (Phase 8)

**Total for Full Understanding**: ~5-6 hours

**Minimum to Get Started**: 1-2 hours (Phases 1-6)

---

## Next Steps After Learning

1. **Make a Small Change**: Add a feed, change a color
2. **Fix a Bug**: If you find one
3. **Add a Feature**: Start small
4. **Add Tests**: Begin with core functions
5. **Refactor**: Improve code organization
6. **Document**: Update docs as you learn

---

## Tips for Learning

1. **Read with Code Open**: Have the files open while reading docs
2. **Experiment**: Make changes, see what happens
3. **Use DevTools**: Inspect state, network, DOM
4. **Ask Questions**: If something is unclear, investigate
5. **Take Notes**: Document your understanding

---

*Happy learning! 🚀*
