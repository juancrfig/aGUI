# Task: Cluster Component (Atom UI)

**Status:** Ready for implementation  
**Priority:** P1 (core visual feature)  
**Estimated time:** 45 minutes  
**Assignee:** Any subagent  

---

## Goal

Implement the floating atom cluster — aGUI's centerpiece. A nucleus button (bolt icon) that opens to reveal electrons (dashboard links) in concentric rings.

---

## Output

File: `src/plugin/dist/index.js` (cluster component section)

---

## Requirements

### Component: `<AtomCluster />`

**States:**
1. **Closed** — Single nucleus button, floating at bottom-right (or user-dragged position)
2. **Opening** — Nucleus pulses, electrons spiral outward to their positions
3. **Opened** — Electrons static in concentric rings, nucleus glows brighter
4. **Closing** — Electrons spiral inward, fade out

### Nucleus Button

- **Icon:** Lucide `Zap` (bolt)
- **Size:** 56px diameter
- **Style:** Glassmorphism circle with glow
- **Glow color:** `--agui-nucleus-glow` (defaults to `var(--primary)`)
- **Position:** Fixed, bottom-right corner (24px from edges), draggable
- **Click:** Toggles open/close

### Electrons

- **Arrangement:** Concentric rings around nucleus
  - Ring 1 (inner): 3 positions, radius ~80px
  - Ring 2 (outer): 4 positions, radius ~140px
  - Ring 3 (overflow): 5 positions, radius ~200px (triggers Satellite promotion)
- **Size:** 40px diameter each
- **Icons:** Sessions (MessageSquare), Config (Settings), Skills (Brain), Cron (Clock), Logs (FileText)
- **Colors:** Each electron has semantic glow color:
  - Sessions: `--agui-electron-sessions` (purple, default `#a855f7`)
  - Config: `--agui-electron-config` (amber, default `#f59e0b`)
  - Skills: `--agui-electron-skills` (green, default `#22c55e`)
  - Cron: `--agui-electron-cron` (orange, default `#f97316`)
  - Logs: `--agui-electron-logs` (blue, default `#3b82f6`)
- **Click:** Navigates to corresponding dashboard tab
- **Hover:** Scale 1.15, glow intensifies, tooltip shows label

### Entrance Animation (Opening)

1. Nucleus scales down slightly (0.9) then back to 1.0 with pulse
2. Electrons appear one by one, spiraling from nucleus center to their ring position
3. Duration: ~400ms per electron, staggered 50ms apart
4. Easing: `cubic-bezier(0.34, 1.56, 0.64, 1)` (slight overshoot for bouncy feel)
5. After all settled: subtle "breathing" glow on nucleus only (not electrons)

### New Electron Animation (While Open)

1. New electron starts at nucleus center
2. Existing electrons smoothly shift to make room ("push aside")
3. New electron spirals to its position
4. Duration: 600ms, easing: `cubic-bezier(0.22, 1, 0.36, 1)` (luxury feel)
5. All movements use `transform` only (GPU-accelerated)

### Positioning Math

```javascript
// Ring positions (angles in radians)
function getElectronPosition(ringIndex, indexInRing, totalInRing) {
  const ringRadius = [80, 140, 200][ringIndex];
  const angle = (indexInRing / totalInRing) * 2 * Math.PI - Math.PI / 2; // Start from top
  return {
    x: Math.cos(angle) * ringRadius,
    y: Math.sin(angle) * ringRadius,
  };
}
```

### Dragging

- Entire cluster is draggable when closed (nucleus only visible)
- When opened, dragging the nucleus moves the whole cluster
- Store position in `localStorage` (`agui-cluster-position`)
- Default: `{ x: window.innerWidth - 80, y: window.innerHeight - 80 }`

---

## Reference

- Concept images: `screenshots/cluster-closed.png`, `screenshots/cluster-opened.png`
- SDK: `AGENTS.md` § "Hermes Plugin SDK Reference"
- CSS vars: See `SESSION_3_KICKOFF.md` § "Key Technical Details"

---

## Testing (Visual + Functional)

This is a visual component. TDD applies to behavior, not pixels. Test the behavior:

### Functional Tests (Jest-like, in JS)

```javascript
// tests/cluster.test.js (run with node + jsdom or in browser)
// These are assertions you verify with browser tools

1. test_nucleus_renders:
   - Assert: document.querySelector('.agui-nucleus') exists
   - Assert: innerHTML contains bolt icon (Zap)

2. test_click_toggles_state:
   - Action: click nucleus
   - Assert: cluster has class 'open'
   - Assert: electrons are visible (opacity > 0)
   - Action: click nucleus again
   - Assert: cluster has class 'closed'
   - Assert: electrons are hidden (opacity = 0)

3. test_electron_count:
   - Assert: document.querySelectorAll('.agui-electron').length === 5

4. test_electron_navigation:
   - Action: click electron[data-type="cron"]
   - Assert: window.location.hash or dashboard navigates to /cron

5. test_drag_position_persists:
   - Action: drag cluster to (500, 500)
   - Assert: localStorage.getItem('agui-cluster-position') === '{"x":500,"y":500}'
   - Reload page
   - Assert: cluster is at (500, 500)
```

### Visual Tests (Browser Tools — CRITICAL)

Use `browser_navigate`, `browser_vision`, `browser_snapshot` to verify:

1. **test_closed_state_looks_correct**:
   - Navigate to dashboard with plugin loaded
   - Screenshot
   - Assert: Single bolt button visible, bottom-right
   - Assert: No electrons visible

2. **test_opened_state_looks_correct**:
   - Click nucleus
   - Screenshot
   - Assert: 5 electrons visible in rings
   - Assert: No orbit lines
   - Assert: Colors match semantic mapping

3. **test_animation_smoothness**:
   - Record interaction (or take screenshots at 100ms intervals)
   - Assert: No jank, 60fps

4. **test_theme_adaptation**:
   - Switch dashboard theme to Midnight
   - Screenshot cluster
   - Assert: Colors adapt (glow changes)

### Run Visual Tests

```bash
# Ensure dashboard is running
hermes dashboard &

# Use browser tools to navigate and screenshot
# Verify each state visually
```

## Acceptance Criteria

- [ ] Nucleus button renders with bolt icon
- [ ] Click toggles open/close with smooth animation
- [ ] Electrons appear in concentric rings when opened
- [ ] Each electron has correct icon and color
- [ ] Clicking electron navigates to correct dashboard tab
- [ ] Cluster is draggable and position persists
- [ ] New electron animation is smooth and luxurious
- [ ] No orbit path lines visible
- [ ] Uses CSS custom properties for theming
- [ ] GPU-accelerated animations only (transform, opacity)
- [ ] **Visual tests pass (screenshots verified)**
- [ ] **Functional tests pass (assertions verified)**

---

## Dependencies

- Task 01: Plugin Manifest (for slot injection)
- Task 02: Backend API (for fetching initial electron list)

---

## Notes

- Use `React.useState` and `React.useRef` from SDK hooks
- Use `SDK.components.Button` for nucleus base styling, override with custom CSS
- Animations: Use CSS transitions + React state, NOT continuous JS animation loops
- For the spiral motion, use CSS `@keyframes` with `transform: translate()` + `scale()`
- The cluster should have `pointer-events: none` on the container, `pointer-events: auto` on buttons
- z-index: 9999 (above dashboard content)
- **Browser tools are REQUIRED for visual verification** — the agent must take screenshots and verify them

---

## CSS Variables to Define (in style.css)

```css
:root {
  --agui-nucleus-glow: var(--primary, #3fd3ff);
  --agui-nucleus-size: 56px;
  --agui-electron-size: 40px;
  --agui-ring-1-radius: 80px;
  --agui-ring-2-radius: 140px;
  --agui-ring-3-radius: 200px;
  --agui-electron-sessions: #a855f7;
  --agui-electron-config: #f59e0b;
  --agui-electron-skills: #22c55e;
  --agui-electron-cron: #f97316;
  --agui-electron-logs: #3b82f6;
  --agui-animation-duration: 400ms;
  --agui-animation-easing: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```
