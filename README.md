# Kirill Kulinkin — game design portfolio

Playable browser games built with AI coding agents, and the evidence-based teardowns they started from.

**Live site:** https://k5302964-sketch.github.io/portfolio/

## What's inside

| Path | What it is |
|---|---|
| `index.html` | The portfolio page |
| `data/projects.js` | All text and the list of games and teardowns; edit this to change the site |
| `assets/` | Styles and the script that renders the page |
| `games/<slug>/index.html` | Playable builds, each one self-contained HTML |
| `teardowns/<slug>.html` | Teardown reports with embedded evidence frames |
| `media/` | Covers and screenshots |

## Adding a project

1. Copy the build to `games/<slug>/index.html` (or a teardown to `teardowns/<slug>.html`).
2. Put a cover and screenshots in `media/<slug>/`.
3. Add an entry to `games` or `teardowns` in `data/projects.js`. A game's `teardown` field links it to the report it was built from.

To preview locally: `python -m http.server` in this folder, then open http://localhost:8000/.

## Credits

Reference games belong to their developers and publishers; they were analysed, not copied. Teardown screenshots are frames from public gameplay videos, used for analysis. Third-party assets in each game are credited in its in-game credits screen.
