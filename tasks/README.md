# aGUI — Task Index

**Last updated:** 2026-04-25  
**Session:** 3  
**Status:** Ready for parallel implementation

---

## Quick Start for Next Session

1. Read `SESSION_3_KICKOFF.md` for full context
2. Pick a task from the table below
3. Each task file is self-contained with requirements, acceptance criteria, and notes
4. Tasks can be parallelized after Phase 1

---

## Task Overview

| # | Task | File | Priority | Est. Time | Dependencies | Parallel? |
|---|------|------|----------|-----------|--------------|-----------|
| 01 | Plugin Manifest | `tasks/01-plugin-manifest.md` | P0 | 10m | None | ✅ |
| 02 | Backend API | `tasks/02-backend-api.md` | P0 | 30m | 01 | ✅ |
| 03 | Cluster Component | `tasks/03-cluster-component.md` | P1 | 45m | 01, 02 | ✅ |
| 04 | Satellite System | `tasks/04-satellite-system.md` | P1 | 40m | 03 | ✅ |
| 05 | Notification Trail | `tasks/05-notification-trail.md` | P1 | 30m | 02 | ✅ |
| 06 | Styling | `tasks/06-styling.md` | P1 | 35m | 03, 04, 05 | ✅ |
| 07 | Event Wiring | `tasks/07-event-wiring.md` | P2 | 25m | 02, 05 | ✅ |
| 08 | Polish | `tasks/08-polish.md` | P3 | 30m | All | ❌ (last) |

---

## Implementation Order

```
Phase 1 (Sequential):
  01 → 02

Phase 2 (Parallel):
  03, 04, 05, 06

Phase 3 (Sequential):
  07 → 08
```

---

## Files to Create

```
src/
├── plugin/
│   ├── manifest.json          # Task 01
│   ├── dist/
│   │   ├── index.js           # Tasks 03, 04, 05, 07
│   │   └── style.css          # Task 06
│   └── plugin_api.py          # Tasks 02, 07
└── theme/
    └── agui.yaml              # Deferred post-MVP
```

---

## Key Decisions (Locked)

- **Session architecture:** Fresh session per use (Option A)
- **Visual style:** Floating atom cluster
- **Notifications:** Task completion + Errors
- **Animations:** Static after entrance, no orbit lines
- **Colors:** Inherit from active dashboard theme (Hermes Teal default)

---

## Reference Images

- `screenshots/cluster-closed.png` — Closed state
- `screenshots/cluster-opened.png` — Opened state
- `screenshots/floating-cluster-concept.png` — Full concept
- `screenshots/floating-cluster-mockup.png` — Dashboard integration mockup

---

*Spin up subagents for each task. They are self-contained and parallel-ready.*
