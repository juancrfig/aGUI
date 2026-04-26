# aGUI — Agent GUI

> A dashboard plugin/theme for the Hermes Agent web dashboard.
> Built for the Hermes Dashboard Hackathon (April 2026).

## Vision

**"The agent that grows with you"** — this is Hermes' core principle. aGUI extends that principle to the dashboard itself.

Instead of presenting every capability upfront and overwhelming newcomers, aGUI starts minimal and evolves based on user behavior and agent reasoning. The interface adapts to each person's unique needs, priorities, and usage patterns.

## Design Philosophy: Bottom-Up Emergence

We do not enforce a final interface design. The GUI emerges through use:
- User behavior shapes what appears
- Agent reasoning helps surface relevant capabilities
- The layout adapts to individual workflows
- Users control their workspace — rearrange, resize, close, trash widgets

This is inspired by sci-fi command centers (Jarvis in Iron Man) where interface elements appear, move, and disappear dynamically based on context and intent.

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
