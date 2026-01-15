# Project Structure

## Directory Tree

```
defaultcreds.lol/
├── index.html              # Main HTML entry point
├── styles.css              # Complete design system and styles
├── news.js                 # Core application logic (1030 lines)
├── widget.js               # "Cred of the Week" widget
├── creds.js               # Faux URL bar and credential management
├── ui.js                   # Placeholder for future UI enhancements
├── creds.json              # Default credentials database
├── top_1000_passwords.txt  # Password wordlist for loading animation
├── server.py               # Simple HTTPS server for local development
├── ui-refactor-brief.md    # UI refactor specifications
├── .gitignore              # Git ignore patterns
├── guides/
│   └── dbi.html            # Guide/documentation page
├── weather/
│   ├── index.html          # Weather-related page
│   └── test.html           # Weather test page
└── jdownloader/
    ├── index.html          # JDownloader guide
    └── jdownload*.png      # Guide images
```

## File Organization Patterns

### Core Application Files
- **index.html**: Single-page application structure
- **news.js**: All core functionality (feed fetching, parsing, rendering, state management)
- **styles.css**: Complete design system with CSS variables
- **widget.js**: Isolated widget functionality
- **creds.js**: Isolated credential display functionality

### Organization Philosophy
- **Monolithic core**: `news.js` contains most application logic
- **Modular widgets**: Separate files for distinct features (widget, creds)
- **No build step**: All files are served directly
- **Flat structure**: Most files at root level for simplicity

### Entry Points
- **index.html**: Main entry point, loads all scripts in order
- **server.py**: Optional local development server

### Configuration
- **creds.json**: Static credential database
- **top_1000_passwords.txt**: Password wordlist
- No environment variables or config files (uses localStorage for state)

### Documentation
- **ui-refactor-brief.md**: Design specifications
- **guides/**: Additional documentation pages

## Naming Conventions

- **Files**: kebab-case (e.g., `ui-refactor-brief.md`)
- **JavaScript**: camelCase for variables/functions
- **CSS classes**: kebab-case (e.g., `feed-section`, `panel-header`)
- **IDs**: kebab-case (e.g., `news-feed`, `feed-list`)

## Architectural Patterns Visible in Structure

1. **Single Page Application**: One HTML file, JavaScript manages all state
2. **Progressive Enhancement**: Works without JavaScript (basic HTML structure)
3. **Separation of Concerns**: 
   - HTML = structure
   - CSS = presentation
   - JS = behavior
4. **No Framework**: Vanilla JavaScript, no build tools
