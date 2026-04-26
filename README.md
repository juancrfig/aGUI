# aGUI — Agent GUI

> A dashboard plugin/theme for the Hermes Agent web dashboard.
> Built for the Hermes Dashboard Hackathon (April 2026).

## Repository Structure

```
aGUI/
├── README.md              # Project overview and install instructions
├── AGENTS.md              # Guide for AI assistants working on this codebase
├── docs/
│   ├── decisions/         # ADRs — Architecture Decision Records
│   ├── requirements/      # PRD, user stories, constraints
│   └── design/            # Design docs, wireframes, visual specs
├── src/
│   ├── theme/             # Dashboard theme YAML + assets
│   └── plugin/            # Dashboard plugin JS + CSS + Python API
└── screenshots/             # Screenshots and demo videos for submission
```

## Quick Install

```bash
# Theme
cp src/theme/*.yaml ~/.hermes/dashboard-themes/

# Plugin
cp -r src/plugin ~/.hermes/plugins/agui/
```

Then restart `hermes dashboard` or hit `/api/dashboard/plugins/rescan`.

## Decision Log

See `docs/decisions/` for the full ADR record.

## Requirements

See `docs/requirements/` for the PRD and user stories.

## Design

See `docs/design/` for visual specs and wireframes.
