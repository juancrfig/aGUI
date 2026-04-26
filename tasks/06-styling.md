# Task: Styling & Animations (style.css)

**Status:** Ready for implementation  
**Priority:** P1 (visual polish)  
**Estimated time:** 35 minutes  
**Assignee:** Any subagent  

---

## Goal

Create the custom CSS that powers aGUI's sci-fi aesthetic: glassmorphism, glows, animations, and responsive behavior. This is the visual soul of the project.

---

## Output

File: `src/plugin/dist/style.css`

---

## Requirements

### CSS Architecture

```css
/* 1. CSS Variables (semantic, theme-aware) */
/* 2. Base cluster styles */
/* 3. Nucleus styles */
/* 4. Electron styles */
/* 5. Satellite styles */
/* 6. Notification styles */
/* 7. Animation keyframes */
/* 8. Utility classes */
```

### 1. CSS Variables

```css
:root {
  /* Nucleus */
  --agui-nucleus-glow: var(--primary, #3fd3ff);
  --agui-nucleus-size: 56px;
  --agui-nucleus-glow-spread: 20px;
  
  /* Electrons */
  --agui-electron-size: 40px;
  --agui-electron-glow-spread: 12px;
  --agui-ring-1-radius: 80px;
  --agui-ring-2-radius: 140px;
  --agui-ring-3-radius: 200px;
  
  /* Semantic colors (fallbacks if theme doesn't define) */
  --agui-electron-sessions: #a855f7;
  --agui-electron-config: #f59e0b;
  --agui-electron-skills: #22c55e;
  --agui-electron-cron: #f97316;
  --agui-electron-logs: #3b82f6;
  
  /* Animation */
  --agui-animation-fast: 200ms;
  --agui-animation-normal: 400ms;
  --agui-animation-slow: 600ms;
  --agui-animation-easing-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
  --agui-animation-easing-smooth: cubic-bezier(0.22, 1, 0.36, 1);
  --agui-animation-easing-standard: cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Glassmorphism */
  --agui-glass-bg: rgba(var(--background-rgb, 15 23 42), 0.6);
  --agui-glass-border: rgba(255, 255, 255, 0.1);
  --agui-glass-blur: 12px;
}
```

### 2. Nucleus Styles

```css
.agui-nucleus {
  width: var(--agui-nucleus-size);
  height: var(--agui-nucleus-size);
  border-radius: 50%;
  background: var(--agui-glass-bg);
  backdrop-filter: blur(var(--agui-glass-blur));
  -webkit-backdrop-filter: blur(var(--agui-glass-blur));
  border: 1px solid var(--agui-glass-border);
  box-shadow: 
    0 0 var(--agui-nucleus-glow-spread) var(--agui-nucleus-glow),
    inset 0 0 20px rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform var(--agui-animation-normal) var(--agui-animation-easing-bounce),
              box-shadow var(--agui-animation-normal) var(--agui-animation-easing-standard);
  position: relative;
  z-index: 9999;
}

.agui-nucleus:hover {
  transform: scale(1.1);
  box-shadow: 
    0 0 calc(var(--agui-nucleus-glow-spread) * 1.5) var(--agui-nucleus-glow),
    inset 0 0 30px rgba(255, 255, 255, 0.1);
}

.agui-nucleus.open {
  box-shadow: 
    0 0 calc(var(--agui-nucleus-glow-spread) * 2) var(--agui-nucleus-glow),
    inset 0 0 40px rgba(255, 255, 255, 0.15);
}

/* Breathing animation when open */
@keyframes agui-nucleus-breathe {
  0%, 100% { box-shadow: 0 0 20px var(--agui-nucleus-glow), inset 0 0 40px rgba(255,255,255,0.15); }
  50% { box-shadow: 0 0 30px var(--agui-nucleus-glow), inset 0 0 50px rgba(255,255,255,0.2); }
}

.agui-nucleus.open {
  animation: agui-nucleus-breathe 3s ease-in-out infinite;
}
```

### 3. Electron Styles

```css
.agui-electron {
  width: var(--agui-electron-size);
  height: var(--agui-electron-size);
  border-radius: 50%;
  background: var(--agui-glass-bg);
  backdrop-filter: blur(var(--agui-glass-blur));
  border: 1px solid var(--agui-glass-border);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: absolute;
  transition: transform var(--agui-animation-normal) var(--agui-animation-easing-bounce),
              opacity var(--agui-animation-fast) var(--agui-animation-easing-standard);
  opacity: 0;
  transform: scale(0) translate(0, 0);
}

.agui-electron.visible {
  opacity: 1;
  transform: scale(1) translate(var(--electron-x), var(--electron-y));
}

.agui-electron:hover {
  transform: scale(1.15) translate(var(--electron-x), var(--electron-y));
  z-index: 10000;
}

/* Per-electron glow colors */
.agui-electron[data-type="sessions"] { --electron-glow: var(--agui-electron-sessions); }
.agui-electron[data-type="config"] { --electron-glow: var(--agui-electron-config); }
.agui-electron[data-type="skills"] { --electron-glow: var(--agui-electron-skills); }
.agui-electron[data-type="cron"] { --electron-glow: var(--agui-electron-cron); }
.agui-electron[data-type="logs"] { --electron-glow: var(--agui-electron-logs); }

.agui-electron {
  box-shadow: 0 0 var(--agui-electron-glow-spread) var(--electron-glow, var(--agui-nucleus-glow));
}

.agui-electron:hover {
  box-shadow: 0 0 calc(var(--agui-electron-glow-spread) * 1.5) var(--electron-glow, var(--agui-nucleus-glow));
}
```

### 4. Entrance Animation Keyframes

```css
/* Spiral from center to position */
@keyframes agui-electron-enter {
  0% {
    opacity: 0;
    transform: scale(0) rotate(-180deg);
  }
  60% {
    opacity: 1;
    transform: scale(1.1) rotate(10deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

.agui-electron.entering {
  animation: agui-electron-enter var(--agui-animation-normal) var(--agui-animation-easing-bounce) forwards;
}

/* Push aside animation */
@keyframes agui-electron-push {
  0% { transform: scale(1) translate(var(--electron-x), var(--electron-y)); }
  50% { transform: scale(0.9) translate(var(--electron-x-new), var(--electron-y-new)); }
  100% { transform: scale(1) translate(var(--electron-x-new), var(--electron-y-new)); }
}
```

### 5. Satellite Styles

```css
.agui-satellite {
  position: fixed;
  width: 200px;
  background: var(--agui-glass-bg);
  backdrop-filter: blur(var(--agui-glass-blur));
  border: 1px solid var(--agui-glass-border);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3),
              0 0 var(--agui-electron-glow-spread) var(--electron-glow);
  overflow: hidden;
  z-index: 9998;
  transition: transform var(--agui-animation-fast) var(--agui-animation-easing-standard),
              opacity var(--agui-animation-fast) var(--agui-animation-easing-standard);
}

.agui-satellite.dragging {
  opacity: 0.9;
  transform: scale(1.02);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4),
               0 0 calc(var(--agui-electron-glow-spread) * 1.5) var(--electron-glow);
}

.agui-satellite.demoting {
  animation: agui-satellite-demote 250ms var(--agui-animation-easing-smooth) forwards;
}

@keyframes agui-satellite-demote {
  to {
    transform: scale(0) translate(var(--nucleus-x), var(--nucleus-y));
    opacity: 0;
  }
}
```

### 6. Notification Styles

```css
.agui-notification-trail {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 10000;
  pointer-events: none;
}

.agui-notification {
  width: min(480px, 90vw);
  background: rgba(var(--background-rgb, 15 23 42), 0.85);
  backdrop-filter: blur(16px);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  pointer-events: auto;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
  transition: transform 300ms var(--agui-animation-easing-smooth),
              opacity 200ms var(--agui-animation-easing-standard);
}

.agui-notification.entering {
  animation: agui-notification-enter 300ms var(--agui-animation-easing-smooth) forwards;
}

.agui-notification.exiting {
  animation: agui-notification-exit 200ms var(--agui-animation-easing-standard) forwards;
}

@keyframes agui-notification-enter {
  from {
    opacity: 0;
    transform: translateY(-100%);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes agui-notification-exit {
  to {
    opacity: 0;
    transform: translateY(-50%);
  }
}

/* Type-specific glows */
.agui-notification[data-type="task_complete"] {
  border-color: var(--success, #22c55e);
  box-shadow: 0 0 12px rgba(var(--success-rgb, 34 197 94), 0.3);
}

.agui-notification[data-type="error"] {
  border-color: var(--destructive, #ef4444);
  box-shadow: 0 0 12px rgba(var(--destructive-rgb, 239 68 68), 0.3);
}
```

### 7. Utility Classes

```css
.agui-hidden { opacity: 0; pointer-events: none; }
.agui-visible { opacity: 1; pointer-events: auto; }

/* Tooltip */
.agui-tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 150ms;
  pointer-events: none;
}

.agui-electron:hover .agui-tooltip,
.agui-satellite:hover .agui-tooltip {
  opacity: 1;
}
```

---

## Reference

- Concept images: `screenshots/cluster-closed.png`, `screenshots/cluster-opened.png`
- Dashboard themes: `SESSION_3_KICKOFF.md` § "Color Palette"
- Glassmorphism: Use `backdrop-filter: blur()` + semi-transparent bg + subtle border

---

## Acceptance Criteria

- [ ] All CSS variables defined with fallbacks
- [ ] Nucleus has glow + breathing animation
- [ ] Electrons have per-type glow colors
- [ ] Entrance animations are smooth and bouncy
- [ ] Satellites have glassmorphism style
- [ ] Notifications have type-specific glows
- [ ] All animations use GPU-accelerated properties
- [ ] Responsive (works on mobile widths)
- [ ] Respects `prefers-reduced-motion` (disable animations)

---

## Dependencies

- Task 03: Cluster Component (for selector names)
- Task 04: Satellite System (for selector names)
- Task 05: Notification Trail (for selector names)

---

## Notes

- Use CSS custom properties heavily — this is how we adapt to any dashboard theme
- The `var(--background-rgb)` trick: dashboard themes set this as space-separated RGB values (e.g., `15 23 42`), which works in `rgba()` — check if Hermes actually does this, otherwise use hex fallbacks
- For `prefers-reduced-motion`:
  ```css
  @media (prefers-reduced-motion: reduce) {
    .agui-electron, .agui-nucleus, .agui-satellite, .agui-notification {
      transition: none !important;
      animation: none !important;
    }
  }
  ```
- Test on both light and dark themes (if dashboard supports light mode)
