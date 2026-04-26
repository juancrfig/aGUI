# Task: Polish & Testing

**Status:** Ready for implementation  
**Priority:** P3 (final quality check)  
**Estimated time:** 30 minutes  
**Assignee:** Any subagent  

---

## Goal

Final pass: fix visual bugs, refine animations, test edge cases, and ensure the hackathon demo is smooth.

---

## Output

Files touched: All `src/plugin/dist/*`, `src/plugin/plugin_api.py`

---

## Checklist

### Visual Polish

- [ ] **Animation timing** — All animations feel "luxury" (not too fast, not sluggish)
  - Entrance: 400ms with overshoot
  - Hover: 150ms quick response
  - Exit: 200ms snappy
- [ ] **Glow refinement** — Glows don't bleed into each other, subtle not overwhelming
- [ ] **Glassmorphism** — Backdrop blur works on all dashboard themes
- [ ] **Position persistence** — Cluster and satellites remember positions across reloads
- [ ] **Mobile** — Cluster doesn't obscure content on small screens (scale down or move)

### Edge Cases

- [ ] **Empty cluster** — What if all electrons are promoted to satellites? Show hint
- [ ] **Many satellites** — 10+ satellites don't clutter screen (consider minimize/maximize)
- [ ] **Rapid open/close** — Spam-clicking nucleus doesn't break animations
- [ ] **Theme switching** — Colors update when user switches dashboard theme
- [ ] **Dashboard resize** — Cluster stays in viewport when window resizes
- [ ] **Error state** — Backend down → graceful degradation (show offline indicator)

### Performance

- [ ] **GPU acceleration** — Only `transform` and `opacity` animated
- [ ] **No layout thrashing** — Avoid reading `offsetWidth` during animations
- [ ] **Memory** — No leaked event listeners or timers
- [ ] **Bundle size** — `index.js` stays under 50KB (we're using SDK, so this should be easy)

### Demo Script (for Hackathon Judges)

Prepare a 2-minute demo flow:

1. **Show closed cluster** — "Here's aGUI, minimal by default"
2. **Click nucleus** — "It opens to reveal your tools"
3. **Click an electron** — "Navigate to any dashboard section"
4. **Type intent in "+"** — "Ask for what you need"
5. **Watch new electron appear** — "The interface grows with you"
6. **Drag to create satellite** — "Promote frequently-used items"
7. **Show notification** — "Real-time event awareness"
8. **Switch theme** — "Adapts to any dashboard theme"

---

## Reference

- All previous task files
- Hackathon submission requirements (if any)

---

## Testing (Visual Regression + Performance)

### Visual Regression Tests (Browser Tools — CRITICAL)

For each checklist item below, take a screenshot and verify:

```javascript
1. test_empty_cluster_state:
   - Setup: All electrons promoted to satellites
   - Screenshot
   - Assert: Hint text visible ("Click + to add tools")
   - Assert: Nucleus still visible

2. test_many_satellites:
   - Setup: Create 10 satellites
   - Screenshot
   - Assert: Screen not cluttered (satellites may be minimized or stacked)

3. test_rapid_toggle:
   - Action: Click nucleus 5 times rapidly
   - Assert: No broken state
   - Assert: Animations don't pile up (queue managed)

4. test_theme_switch:
   - Switch to each theme: Hermes Teal, Midnight, Ember, Mono, Cyberpunk, Rosé
   - Screenshot cluster on each
   - Assert: Colors adapt correctly
   - Assert: Glows visible on all themes

5. test_resize:
   - Resize window to 375px width (mobile)
   - Screenshot
   - Assert: Cluster fits in viewport
   - Assert: No overflow

6. test_error_state:
   - Disconnect backend
   - Screenshot
   - Assert: Offline indicator visible (subtle, not intrusive)
```

### Performance Tests

```bash
1. test_bundle_size:
   - Run: `wc -c src/plugin/dist/index.js`
   - Assert: < 50KB

2. test_css_size:
   - Run: `wc -c src/plugin/dist/style.css`
   - Assert: < 20KB

3. test_no_layout_thrashing:
   - Script: Search for `offsetWidth`, `offsetHeight`, `getBoundingClientRect` in index.js
   - Assert: None found (or only in initialization, not animation loop)

4. test_gpu_compositing:
   - Browser devtools: Enable "Layer borders" and "Paint flashing"
   - Interact with cluster
   - Assert: Only cluster layer repaints (not entire dashboard)
```

### Demo Script Verification

Walk through the 2-minute demo and verify each step:

1. **Show closed cluster** — Screenshot ✓
2. **Click nucleus** — Screenshot + screen recording ✓
3. **Click electron** — Verify navigation works ✓
4. **Type intent** — Verify backend responds ✓
5. **Watch new electron** — Screen recording ✓
6. **Drag to satellite** — Screen recording ✓
7. **Show notification** — Screenshot ✓
8. **Switch theme** — Screenshots of each ✓

## Acceptance Criteria

- [ ] All checklist items verified
- [ ] Demo script practiced and smooth
- [ ] No console errors
- [ ] Works on Chrome, Firefox, Safari (latest)
- [ ] README updated with final screenshots
- [ ] All files committed
- [ ] **Visual regression tests pass (screenshots verified)**
- [ ] **Performance tests pass**
- [ ] **Demo script verified end-to-end**

---

## Dependencies

- All previous tasks complete

---

## Notes

- Test with `hermes dashboard` running locally
- Use browser DevTools to verify GPU compositing (Paint flashing, Layer borders)
- For theme switching test, switch between Hermes Teal, Midnight, Cyberpunk
- Record a short screen capture for the hackathon submission
- If time is short, prioritize: (1) No console errors, (2) Smooth demo flow, (3) Visual polish
- **Browser tools REQUIRED for all visual verification**
- **Screen recordings are valuable for hackathon submission**
