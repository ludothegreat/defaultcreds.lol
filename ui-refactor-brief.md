You are refactoring the front end of defaultcreds.lol, a cybersecurity news feed site. The current site is a lightweight headline aggregator pulling from multiple RSS sources via proxy endpoints. Users can select feeds and filter by keyword. The site shows a loading state while feeds load.

## Hard constraints

- HTML, CSS, and vanilla JS/TS only. No frameworks, no build tools beyond what exists.
- Do not redesign the backend or proxy infrastructure.
- Preserve existing feed fetching logic and feed definitions. You may reorganize code but keep the same behavior and endpoints.
- Keep core features: feed selection, keyword filtering, headline rendering, link-out to articles, loading states.

## Design direction

Create a modern, professional news product UI that feels like a clean intelligence console—not a cluttered security portal (BleepingComputer) and not a sparse hobby blog.

Draw inspiration from these references without copying them directly:

- **NewsMuseum.pt**: Study their card grid with uniform dimensions and restrained color palette (neutral base + single accent). Apply this discipline to your feed item cards.
- **Qatar Museums**: Note how whitespace prevents fatigue and navigation is organized by user intent. Apply generous spacing between content sections.
- **Elliott Mangham**: Reference his dark theme execution (`#121212` base, high contrast), dual-typeface approach (humanist sans for content, monospace for technical/UI elements), and smooth easing on transitions. This aesthetic should inform your "Terminal" view.

## First, inspect the repo

Before implementing, identify:
- Where feeds are defined (likely an array/object in JS)
- How items are fetched and parsed
- How "Select Feeds" is wired to the list
- How keyword filtering works
- Current rendering structure (title, date, source, snippet)

## UX requirements (priority order)

1. **Layout**: Clean responsive layout. Primary content column for feed. Sticky sidebar on desktop for controls/status. Minimal navigation—no mega menus.

2. **Two viewing densities**:
   - "Briefing" view: strong readability, scannable summaries, comfortable spacing
   - "Terminal" view: dense rows, tight spacing, monospace-influenced, minimal chrome
   - Persist choice in localStorage

3. **Controls**:
   - Feed selector: searchable, select all/clear all, fast
   - Keyword filter: instant results, clear button, show result count
   - Sorting: newest first, by source (no backend changes needed)

4. **Perceived performance**:
   - Render incrementally as feeds return
   - Skeleton placeholders while loading
   - Per-feed status indicators (Loaded/Slow/Failed) in UI only
   - "Last updated" timestamp
   - Empty state when no items match

5. **Visual system**:
   - Minimalist, professional. Consistent spacing and type scale.
   - One accent color, sparingly. Strong contrast. Accessible focus states.
   - Dark mode toggle with persistence.
   - Monospace restricted to: CVE IDs, hashes, source labels, Terminal view

6. **Content cards**:
   - Show: headline, source/feed name, timestamp, link
   - Briefing view: one-line summary or bullet takeaways if feed provides it
   - Optional chips (CVE, vendor, breach) only if they improve scanning

## Engineering requirements

- Stay vanilla HTML/CSS/JS. No new dependencies.
- Refactor into clear modules: feed config, fetch/normalize, state, rendering
- Keyboard accessible: logical tab order, visible focus ring
- No layout shift during loading—stable containers

## Success criteria

- Looks intentionally designed, not templated
- Remains functional with slow/flaky feeds
- Easy to scan, filter, switch feeds without friction
- Feels like a professional intelligence tool

Now inspect the repo, then implement the refactor.
