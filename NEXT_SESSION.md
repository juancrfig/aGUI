# aGUI — Next Session Checklist

**Date:** 2026-04-25
**Status:** All open questions resolved. Implementation ready.
**Time remaining:** ~4 hours until hackathon deadline

---

## What's Decided (Locked)

### Architecture
- **MVP:** Plugin-only (Option 2) — works within Hermes dashboard constraints
- **Long-term:** Full dashboard fork (Option 1) if well-received

### Seed Interface
1. **Taskbar** — Pre-defined buttons (cron, skills, config, etc.) as hardcoded starter set
2. **"+" Button** — Opens chat/voice input; agent creates animated taskbar item
3. **Notification Trail** — Dynamic island showing real Hermes events

### "+" Button Flow
- User types intent → agent processes → new button appears with smooth animation
- Button is a **link** to existing dashboard tabs (not live widget)
- Animation loops until clicked (like an unopened gift)
- Voice input included (backend already supports it)

### GitHub Issue Flow
- Agent tries to fulfill request first
- If requires source code modification: transparently tells user
- Offers: report issue, contribute PR, or do nothing
- Generates pre-filled GitHub issue draft with link

### Widget Management (MVP)
- Rearrange taskbar items
- Close/remove items
- Trash (recover deleted)
- Taskbar movable to 4 edges
- Items sized by usage counter

---

## Open Questions for Next Session

### 1. Session Architecture (CRITICAL — blocks implementation)
How does the "+" button chat session work?
- **Option A:** One fresh session per use (stateless, simple)
- **Option B:** One persistent session that accumulates context (smarter, more complex)
- **Option C:** Hybrid — persistent session but auto-compacts old messages

### 2. Taskbar Visual Style
- **DECIDED: Option C — Floating cluster (sci-fi atom style)**
- Closed state: Single bolt button (Lucide `Zap` icon)
- Opened state: Electrons orbit nucleus with smooth animation
- Overflow behavior: When >7 electrons, least-used items promoted to "Satellites" (draggable floating widgets)
- Demotion: Drag Satellite close to nucleus to return it to electron orbit
- Reference images: `screenshots/cluster-closed.png`, `screenshots/cluster-opened.png`

### 3. Notification Triggers (MVP)
- **DECIDED: Task completion + Errors**
- Leverages existing Hermes backend events that are already traceable
- Notification trail (dynamic island) shows real Hermes events
- Other events (cron, skills) can be added post-hackathon

### 4. Button Animation Specifics
- **DECIDED:**
  - No constant orbiting — electrons appear with smooth entrance animation when cluster opens, then settle into fixed positions
  - Subtle initial movement for smoothness, then static
  - No orbit path lines drawn
  - New electron added while open: smooth "push aside" animation, luxury/modern feel
  - Electrons arranged in concentric rings around nucleus (not scattered randomly)

---

## Implementation Order (Suggested)

1. **Theme YAML** — Base colors, sci-fi palette
2. **Plugin Manifest** — Register tab, slots, backend API
3. **Backend API** (`plugin_api.py`) — Session handling, intent routing, GitHub issue generation
4. **Frontend JS** — Taskbar component, "+" button, notification trail, animations
5. **CSS** — Sci-fi styling, animations, responsive layout
6. **Integration** — Wire real Hermes events to notifications
7. **Polish** — Visual testing, animation refinement, edge cases

---

## Files to Create

```
src/
├── theme/
│   ├── agui.yaml              # Theme definition
│   └── assets/                # Images, icons
└── plugin/
    ├── manifest.json          # Plugin registration
    ├── dist/
    │   ├── index.js           # Main IIFE bundle
    │   └── style.css          # Custom styles
    └── plugin_api.py          # FastAPI router
```

---

## Context from Previous Sessions

### Session 1
- Explored Strike Freedom theme as example
- Fixed vision tool (configured OpenRouter)
- Identified two implementation paths (plugin vs fork)

### Session 2
- Locked design decisions
- Defined MVP scope
- Identified open questions
- Committed to GitHub

---

## Design Philosophy Reminders

- **Bottom-up emergence:** Interface grows with user, not imposed
- **Agent grows with you:** Align with Hermes core principle
- **Sci-fi command center:** Jarvis-inspired, dynamic, adaptive
- **User control:** Rearrange, resize, close, trash
- **Transparency:** Clear about capabilities vs source code modifications

---

*End of Session 2. Ready for fresh implementation session.*
