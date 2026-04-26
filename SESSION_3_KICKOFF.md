# aGUI — Session 3 Kickoff Note

**Date:** 2026-04-25  
**Status:** Design phase COMPLETE. All 4 open questions resolved. Ready for parallel implementation.  
**Time remaining:** ~4 hours until hackathon deadline  

---

## What We Decided (ALL LOCKED)

### 1. Session Architecture — Option A
- Fresh session per "+" button use (stateless, simple)
- No persistent context accumulation

### 2. Visual Style — Floating Atom Cluster
- **Closed:** Single bolt button (Lucide `Zap` icon)
- **Opened:** Electrons in concentric rings around nucleus
- **No constant orbiting** — smooth entrance animation, then static positions
- **No orbit path lines**
- **New electron added while open:** smooth "push aside" animation (luxury feel)
- **Overflow (>7 electrons):** Least-used items promoted to "Satellites" (draggable floating widgets)
- **Demotion:** Drag Satellite close to nucleus to return to electron orbit
- Reference images: `screenshots/cluster-closed.png`, `screenshots/cluster-opened.png`

### 3. Notification Triggers — Task completion + Errors
- Leverages existing Hermes backend events
- Dynamic island notification trail
- Other events post-hackathon

### 4. Animations — Static after entrance
- Subtle movement on open, then settle
- Push-aside for new items
- No continuous motion

### 5. Color Palette — Inherit from active dashboard theme
- Default: Hermes Teal (`#041c1c` background, `#ffe6cb` midground)
- Use CSS custom properties (`--background-base`, `--warm-glow`, `--primary`, etc.)
- Semantic aGUI variables (e.g., `--agui-nucleus-glow`) default to theme vars
- User theme switching works out of the box (6 built-in themes + custom YAML)

---

## Implementation Plan

We will create `tasks/` folder with self-contained task files. Each task can be delegated to a parallel subagent. Tasks should be implemented in this order (some can be parallel):

### Phase 1: Foundation (sequential)
| # | Task | File | Description |
|---|------|------|-------------|
| 1 | Plugin Manifest | `src/plugin/manifest.json` | Register tab, slots, backend API |
| 2 | Backend API | `src/plugin/plugin_api.py` | FastAPI router: session handling, intent routing, notifications |

### Phase 2: Core Components (parallel after Phase 1)
| # | Task | File | Description |
|---|------|------|-------------|
| 3 | Cluster Component | `src/plugin/dist/index.js` | Atom cluster: nucleus + electrons, open/close states, entrance animations |
| 4 | Satellite System | `src/plugin/dist/index.js` | Draggable floating widgets, promote/demote logic, drag-to-nucleus |
| 5 | Notification Trail | `src/plugin/dist/index.js` | Dynamic island for task completion + error events |
| 6 | Styling | `src/plugin/dist/style.css` | Sci-fi animations, glassmorphism, glow effects, responsive |

### Phase 3: Integration (sequential after Phase 2)
| # | Task | File | Description |
|---|------|------|-------------|
| 7 | Event Wiring | `src/plugin/plugin_api.py` + `index.js` | Wire real Hermes events to notification trail |
| 8 | Polish | All | Visual testing, animation refinement, edge cases |

---

## Key Technical Details

### Hermes Plugin SDK (MUST USE — never import React directly)
```javascript
const SDK = window.__HERMES_PLUGIN_SDK__;
const { React, hooks, components, utils, api, fetchJSON } = SDK;
```

### Plugin Registration
```javascript
window.__HERMES_PLUGIN_SDK__.register({
  name: 'agui',
  render: (props) => { /* ... */ }
});
```

### Backend Routes
Mounted at `/api/plugins/agui/`. Must export `router = APIRouter()`.

### Theme Integration
- Read CSS vars: `getComputedStyle(document.documentElement).getPropertyValue('--primary')`
- aGUI semantic vars: `--agui-nucleus-glow`, `--agui-electron-sessions`, etc.
- These default to dashboard theme vars

### File Layout
```
src/
├── plugin/
│   ├── manifest.json
│   ├── dist/
│   │   ├── index.js      # Main IIFE bundle
│   │   └── style.css     # Custom styles
│   └── plugin_api.py     # FastAPI router
└── theme/
    └── agui.yaml         # Optional theme override (deferred post-MVP)
```

---

## Context from Previous Sessions

- **Session 1:** Explored Strike Freedom theme, identified plugin vs fork paths
- **Session 2:** Locked all design decisions, defined MVP scope, committed to GitHub
- **Session 3 (this session):** Resolved all open questions, generated concept images, defined color palette strategy

---

## Design Philosophy Reminders

- **Bottom-up emergence:** Interface grows with user, not imposed
- **Agent grows with you:** Align with Hermes core principle
- **Sci-fi command center:** Jarvis-inspired, dynamic, adaptive
- **User control:** Rearrange, resize, close, trash
- **Transparency:** Clear about capabilities vs source code modifications

---

*Ready for parallel implementation. Spin up subagents for each task in `tasks/`.*
