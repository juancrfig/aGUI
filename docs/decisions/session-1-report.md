# aGUI Design Report — Session 1

**Date:** 2026-04-25
**Status:** Vision tool fixed, Strike Freedom theme explored, design direction TBD

---

## 1. The Core Idea (from Juanes)

aGUI is a **dashboard plugin/theme for the Hermes Agent web dashboard** (`hermes dashboard`).

The vision is a **futuristic, adaptive interface** that:
- Evolves and reveals features based on user behavior (not showing everything upfront)
- Uses **bottom-up / emergent design** — letting the interface discover itself as the user interacts
- Adapts to each individual user, surfacing relevant tools/sessions/skills as they ask their agents things
- Feels like a **sci-fi command center** with beautiful animations and a cohesive aesthetic
- Solves the "newcomer overwhelm" problem — instead of dumping all functionality at once, the interface grows with the user

This is inspired by the philosophy of **letting emergent properties show up by themselves** rather than top-down rigid UI design.

---

## 2. Technical Context Discovered

### Dashboard Architecture
- Runs at `http://127.0.0.1:9119`
- **Theme system**: YAML files controlling palette, typography, layout variants (`standard`, `cockpit`, `tiled`), component chrome, custom CSS (32 KiB cap), assets
- **Plugin system**: JS IIFE bundles using `window.__HERMES_PLUGIN_SDK__` (React, hooks, shadcn/ui components)
- **Slots**: 20+ injection points — `sidebar`, `header-left`, `header-right`, `overlay`, `pre-main`, `post-main`, `footer-*`, page-scoped slots (`sessions:top`, etc.)
- **Backend**: FastAPI `APIRouter` for plugin routes
- **Limitation**: Built-in tabs (Status, Sessions, Analytics, etc.) cannot be removed; nav structure is fixed

### Strike Freedom Example
- Theme + slot-only plugin combo
- Transforms colors, fonts, shapes, adds scanlines, notched cards, telemetry sidebar
- **But**: Same skeleton underneath — tabs, nav, routing all unchanged
- Proves radical visual transformation is possible, but not structural transformation

### Vision Tool
- Was broken (Kimi API doesn't support vision)
- **Fixed**: Configured OpenRouter API key for vision tasks
- Now working — can analyze screenshots to iterate on UI

---

## 3. Two Implementation Options

### Option A: "Rebel Light" — Extreme CSS + JS within Plugin System

**Approach:** Push the existing plugin/theme system to its absolute limits.

**What we can do:**
- Use `customCSS` (32 KiB) to hide default nav (`display: none`), restyle everything
- Use `overlay` slot to draw a completely new UI layer on top of the default one
- Inject JavaScript through the plugin bundle to manipulate DOM dynamically — add event listeners, create new elements, restructure pages client-side
- Use `pre-main` / `post-main` slots to inject adaptive content before/after page content
- Backend API tracks user behavior and feeds data to the frontend

**Trade-offs:**
- ✅ **Stays within hackathon rules** — technically a "plugin + theme"
- ✅ **No backend changes needed** — works with existing dashboard
- ✅ **Easier to distribute** — just drop files into `~/.hermes/plugins/`
- ❌ **Fragile** — CSS hacks can break with dashboard updates
- ❌ **Limited** — can't truly change routing or remove built-in pages
- ❌ **Performance** — overlay + DOM manipulation adds overhead

---

### Option B: "Rebel Hard" — Fork and Modify Dashboard React Source

**Approach:** Edit the actual dashboard frontend code at `~/.hermes/hermes-agent/web/`.

**What we can do:**
- Modify React components directly — shell layout, routing, page structure
- Add new layout variants beyond `standard`/`cockpit`/`tiled`
- Create entirely new shell behaviors — collapsible nav, floating command palette, adaptive sidebars
- Total freedom over the UI skeleton
- Can still expose a "plugin API" for extensibility

**Trade-offs:**
- ✅ **Total freedom** — can redesign the entire dashboard structure
- ✅ **Clean implementation** — no CSS hacks or DOM manipulation hacks
- ✅ **True emergent UI** — can build adaptive routing, dynamic page generation
- ❌ **Breaks hackathon rules** — not a "plugin/theme", it's a core modification
- ❌ **Harder to distribute** — requires users to patch their hermes installation
- ❌ **Maintenance burden** — breaks with hermes updates
- ❌ **More work** — need to understand and modify React codebase

---

## 4. Next Session Plan

**Context will be cleared. We will:**

1. **Forget technical limitations** — no discussion of what the dashboard allows or doesn't allow
2. **Deep design grilling** — I will interview Juanes relentlessly about every aspect of the aGUI vision:
   - What does "adaptive" mean exactly? What features emerge when?
   - What does the interface look like on first boot vs. after 100 interactions?
   - What animations? What color palette? What typography?
   - How does the user discover new capabilities?
   - What data drives the adaptation? (session history, tool usage, time patterns?)
   - What is the "command center" metaphor? HUD elements? Spatial layout?
3. **No implementation talk** — pure design, pure vision
4. **At the end** — revisit Options A and B, decide which serves the design best

**This report is committed to GitHub for continuity across sessions.**

---

## 5. Files Changed This Session

- `~/.hermes/hermes-agent/agent/auxiliary_client.py` — patched to add `kimi-coding` to vision provider list (line 2134)
- `~/.hermes/.env` — uncommented `OPENROUTER_API_KEY`
- `~/.hermes/config.yaml` — set `auxiliary.vision.provider: openrouter`, `auxiliary.vision.model: openai/gpt-4o-mini`
- `~/.hermes/dashboard-themes/strike-freedom.yaml` — installed (copied from bundled plugin)
- `~/.hermes/plugins/strike-freedom-cockpit/` — installed (copied from bundled plugin)

---

*End of Session 1 Report*
