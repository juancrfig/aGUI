# Task: Plugin Manifest

**Status:** Ready for implementation  
**Priority:** P0 (blocks all other tasks)  
**Estimated time:** 10 minutes  
**Assignee:** Any subagent  

---

## Goal

Create the plugin manifest that registers aGUI with the Hermes dashboard. This is the entry point — without it, the dashboard won't load our plugin.

---

## Output

File: `src/plugin/manifest.json`

---

## Requirements

### Fields (from AGENTS.md reference)

| Field | Value | Notes |
|-------|-------|-------|
| `name` | `"agui"` | Unique plugin identifier |
| `label` | `"aGUI"` | Display name in UI |
| `description` | `"Adaptive GUI — an atom-inspired floating cluster interface that grows with you"` | Short, catchy |
| `icon` | `"Zap"` | Lucide icon name (bolt/lightning) |
| `version` | `"1.0.0"` | Semver |
| `tab` | `{ "path": "/agui", "position": "after:home" }` | Plugin gets its own tab |
| `slots` | `["sessions:top", "home:bottom"]` | Inject cluster into sessions page top + home page bottom |
| `entry` | `"dist/index.js"` | Main JS bundle (IIFE) |
| `css` | `"dist/style.css"` | Custom styles |
| `api` | `"plugin_api.py"` | FastAPI router |

### Slot Strategy

- `sessions:top` — Inject the atom cluster at the top of the Sessions tab
- `home:bottom` — Also available on Home tab bottom (fallback)

The cluster should be a floating overlay, not inline. Use `position: fixed` in CSS.

---

## Reference

See `AGENTS.md` § "Plugin Manifest Reference" for full schema.

---

## Acceptance Criteria

- [ ] Valid JSON, no syntax errors
- [ ] All required fields present
- [ ] `name` is unique (not conflicting with existing plugins)
- [ ] `slots` are valid slot identifiers
- [ ] File committed to repo

---

## Dependencies

None. This is the first task.

---

## Notes

- The manifest is read once at dashboard startup. After editing, rescan: `curl http://127.0.0.1:9119/api/dashboard/plugins/rescan`
- If the dashboard doesn't pick it up, check browser console for plugin load errors.
