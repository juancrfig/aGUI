# Task: Satellite System (Draggable Widgets)

**Status:** Ready for implementation  
**Priority:** P1 (overflow management)  
**Estimated time:** 40 minutes  
**Assignee:** Any subagent  

---

## Goal

Implement the Satellite system — draggable floating widgets that hold "promoted" electrons when the cluster overflows (>7 items).

---

## Output

File: `src/plugin/dist/index.js` (satellite section)

---

## Requirements

### Component: `<Satellite />`

**Trigger:** When cluster has >7 electrons, the least-recently-used electron is "promoted" to a Satellite.

**Visual:**
- Mini floating panel, ~200px × 120px
- Title bar with electron icon + label + close button
- Content area: Brief info or preview (e.g., "3 cron jobs running")
- Style: Glassmorphism, matching dashboard theme
- Glow: Same color as the electron it represents

**Behavior:**
- **Draggable:** Click and drag title bar to move anywhere on screen
- **Position:** Stored in `localStorage` per-satellite (`agui-satellite-{id}-position`)
- **Close:** X button removes satellite (returns to trash, not destroyed)
- **Demote:** Drag satellite close to nucleus (within 100px) → returns to electron orbit
- **Click:** Opens the corresponding dashboard tab

### Promotion Animation

1. Electron in cluster fades out (200ms)
2. Satellite appears at electron's last position
3. Satellite scales from 0.5 to 1.0 with bounce easing
4. Duration: 300ms

### Demotion Animation (Drag-to-Nucleus)

1. User drags satellite within 100px of nucleus
2. Nucleus glows brighter (feedback)
3. On release within zone: Satellite shrinks to 0, electron reappears in cluster
4. Duration: 250ms

### Trash System

- Closed satellites go to "Trash" (not fully deleted)
- Trash is a small bin icon near the cluster (appears when there are trashed items)
- Click trash → modal/panel showing deleted satellites
- Restore: Click to bring back as electron
- Permanent delete: Secondary action (e.g., shift+click)

### State Management

```javascript
// Satellite data structure
{
  id: "sat-cron-001",
  electronId: "cron-001",
  label: "Cron Jobs",
  icon: "Clock",
  color: "#f97316",
  position: { x: 400, y: 300 },
  trashed: false,
  lastUsed: 1714089600000, // timestamp
}
```

---

## Reference

- Cluster component: See `tasks/03-cluster-component.md`
- Concept: `screenshots/floating-cluster-mockup.png`

---

## Testing (Visual + Functional)

### Functional Tests

```javascript
1. test_promotion_trigger:
   - Setup: Add 8 electrons to cluster
   - Assert: 7th electron is promoted to satellite
   - Assert: Satellite appears with correct icon/label

2. test_demotion_drag:
   - Action: Drag satellite within 100px of nucleus
   - Assert: Nucleus glows brighter (feedback class)
   - Action: Release
   - Assert: Satellite disappears
   - Assert: Electron reappears in cluster

3. test_trash_restore:
   - Action: Close satellite (trash it)
   - Assert: Satellite hidden, trash count +1
   - Action: Open trash, click restore
   - Assert: Satellite back as electron

4. test_position_persist:
   - Action: Drag satellite to (300, 400)
   - Assert: localStorage has position
   - Reload
   - Assert: Satellite at (300, 400)
```

### Visual Tests (Browser Tools)

1. **test_satellite_appearance**:
   - Screenshot satellite
   - Assert: Glassmorphism panel, correct glow color
   - Assert: Title bar with icon + label + close button

2. **test_drag_feedback**:
   - Drag satellite near nucleus
   - Screenshot
   - Assert: Nucleus glows brighter
   - Assert: Satellite has 'dragging' style

3. **test_trash_ui**:
   - Trash a satellite
   - Screenshot
   - Assert: Trash icon appears near cluster
   - Assert: Badge shows count

## Acceptance Criteria

- [ ] Satellites render as draggable mini-panels
- [ ] Promotion works when >7 electrons (LRU eviction)
- [ ] Demotion works when dragged close to nucleus
- [ ] Positions persist in localStorage
- [ ] Trash system works (restore + permanent delete)
- [ ] Animations are smooth (300-400ms, ease-out)
- [ ] Satellites use theme CSS variables
- [ ] **Visual tests pass (screenshots verified)**
- [ ] **Functional tests pass (assertions verified)**

---

## Dependencies

- Task 03: Cluster Component (for nucleus position reference, promotion trigger)

---

## Notes

- Use `position: fixed` for satellites
- z-index: 9998 (below cluster at 9999)
- For drag detection near nucleus, calculate distance: `Math.sqrt((sx-nx)^2 + (sy-ny)^2)`
- Use `transform: translate()` for drag, NOT `left/top` (performance)
- Consider using a simple drag hook:
  ```javascript
  function useDrag(onDragEnd) {
    const [dragging, setDragging] = useState(false);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    // ... mouse/touch event handlers
  }
  ```
- **Browser tools REQUIRED for visual verification**
