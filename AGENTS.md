# AGENTS.md — aGUI

## Project Overview

aGUI is a dashboard plugin/theme for the Hermes Agent web dashboard (`hermes dashboard`).
It extends the dashboard with custom UI components, backend API routes, and optionally a visual theme.

## Tech Stack

- **Frontend**: Vanilla JS IIFE using `window.__HERMES_PLUGIN_SDK__` (React, hooks, shadcn/ui components)
- **Backend**: Python FastAPI `APIRouter` mounted under `/api/plugins/agui/`
- **Theme**: YAML file(s) in `src/theme/` dropped into `~/.hermes/dashboard-themes/`
- **Styling**: Tailwind CSS classes + custom CSS via manifest `css` field

## Repository Layout

```
aGUI/
├── src/
│   ├── theme/              # Dashboard theme YAML + image assets
│   │   ├── agui.yaml
│   │   └── assets/
│   └── plugin/             # Dashboard plugin
│       ├── manifest.json   # Plugin manifest
│       ├── dist/
│       │   ├── index.js    # IIFE bundle (entry point)
│       │   └── style.css   # Optional custom styles
│       └── plugin_api.py   # FastAPI router (optional)
├── docs/
│   ├── decisions/          # ADRs
│   ├── requirements/       # PRD, user stories
│   └── design/             # Visual specs, wireframes
├── screenshots/            # Submission screenshots/videos
└── AGENTS.md               # This file
```

## Hermes Plugin SDK Reference

Plugins MUST NOT import React directly. Use the SDK globals:

```javascript
const SDK = window.__HERMES_PLUGIN_SDK__;
const { React } = SDK;
const { useState, useEffect, useCallback, useMemo, useRef } = SDK.hooks;
const { Card, CardHeader, CardTitle, CardContent, Badge, Button, Input, Label, Select, Separator, Tabs, TabsList, TabsTrigger, PluginSlot } = SDK.components;
const { cn, timeAgo, isoTimeAgo } = SDK.utils;
const api = SDK.api;           // getStatus(), getSessions(), getConfig(), ...
const fetchJSON = SDK.fetchJSON; // raw fetch for plugin backend routes
```

## Plugin Manifest Reference

```json
{
  "name": "agui",
  "label": "aGUI",
  "description": "...",
  "icon": "Activity",
  "version": "1.0.0",
  "tab": { "path": "/agui", "position": "after:analytics" },
  "slots": ["sessions:top"],
  "entry": "dist/index.js",
  "css": "dist/style.css",
  "api": "plugin_api.py"
}
```

## Backend API

`plugin_api.py` must export a module-level `router = APIRouter()`. Routes are mounted at `/api/plugins/agui/`.

## Theme System

Themes are YAML files in `~/.hermes/dashboard-themes/`. They control palette, typography, layout, assets, component chrome, color overrides, and raw customCSS. See `docs/design/theme-spec.md` once it exists.

## Development Workflow

1. Edit `src/plugin/dist/index.js` or `src/theme/*.yaml`
2. Copy to `~/.hermes/plugins/agui/` or `~/.hermes/dashboard-themes/`
3. Rescan: `curl http://127.0.0.1:9119/api/dashboard/plugins/rescan`
4. Refresh browser

## Testing

- Dashboard runs at `http://127.0.0.1:9119`
- Plugin API: `curl http://127.0.0.1:9119/api/plugins/agui/<route>`
- Themes: `curl http://127.0.0.1:9119/api/dashboard/themes`

## Constraints

- Plugin JS bundle must be a single IIFE file loadable via `<script>`
- React is external — never bundle it
- Plugin has 2 seconds after script load to call `register()`
- `customCSS` in themes is capped at 32 KiB
- Backend routes are mounted once at startup — restart `hermes dashboard` after editing `plugin_api.py`

## Design Principles (from Matt Pocock's talk)

- **Shared design concept**: Every decision is documented in `docs/decisions/`
- **Ubiquitous language**: Terms are defined in `docs/requirements/ubiquitous-language.md`
- **Deep modules**: Simple interfaces, hidden complexity
- **TDD**: Small steps, test first, refactor after green
- **Invest in design daily**: The AGENTS.md and docs are living documents

## Next Session Note

Design phase is complete. See `NEXT_SESSION.md` for open questions and implementation order. When a new session starts, resolve any remaining open questions quickly (not more than 1-2 minutes) then proceed directly to implementation.
