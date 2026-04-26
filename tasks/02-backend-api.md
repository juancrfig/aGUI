# Task: Backend API (plugin_api.py)

**Status:** Ready for implementation  
**Priority:** P0 (blocks integration tasks)  
**Estimated time:** 30 minutes  
**Assignee:** Any subagent  

---

## Goal

Create the FastAPI router that serves as aGUI's backend. Handles: session management for the "+" button, intent processing, notification event streaming, and GitHub issue generation.

---

## Output

File: `src/plugin/plugin_api.py`

---

## Requirements

### Route: `POST /api/plugins/agui/chat`

**Purpose:** Handle "+" button user intent  
**Request body:**
```json
{
  "message": "I want to see my cron jobs",
  "session_id": "optional-existing-session-id"
}
```

**Response:**
```json
{
  "action": "navigate",
  "target": "/cron",
  "label": "Cron Jobs",
  "icon": "Clock",
  "electron_id": "cron-001"
}
```

**Actions supported:**
- `navigate` — Create a new electron linking to an existing dashboard tab
- `github_issue` — Generate pre-filled GitHub issue draft
- `info` — Return informational text (no UI change)

**Logic:**
1. Parse user intent from message
2. Map intent to known dashboard tabs (sessions, cron, skills, config, logs, analytics)
3. If intent matches a tab → return `navigate` action
4. If intent requires source code modification → return `github_issue` action with pre-filled template
5. Otherwise → return `info` action with helpful text

### Route: `GET /api/plugins/agui/notifications`

**Purpose:** SSE (Server-Sent Events) stream of Hermes events  
**Response format:** `text/event-stream`

**Event types:**
- `task_complete` — `{ "type": "task_complete", "task_id": "...", "summary": "..." }`
- `error` — `{ "type": "error", "message": "...", "source": "..." }`

**Implementation:**
- For MVP, poll Hermes internal APIs every 5s and emit new events
- Use asyncio Queue to push events to SSE stream
- Keep connection alive with heartbeat comments (`:heartbeat`)

### Route: `POST /api/plugins/agui/github-draft`

**Purpose:** Generate pre-filled GitHub issue  
**Request body:**
```json
{
  "title": "Feature request: ...",
  "body": "User wants...",
  "labels": ["enhancement", "agui"]
}
```

**Response:**
```json
{
  "issue_url": "https://github.com/NousResearch/hermes-agent/issues/new?title=...&body=...&labels=..."
}
```

---

## Reference

See `AGENTS.md` § "Backend API" for constraints.

---

## Acceptance Criteria

- [ ] `router = APIRouter()` exported at module level
- [ ] All 3 routes implemented and return correct schemas
- [ ] SSE stream works (test with `curl -N`)
- [ ] Intent mapping covers all dashboard tabs
- [ ] GitHub issue URL is properly URL-encoded
- [ ] File committed to repo

---

## Dependencies

- Task 01: Plugin Manifest (for `name` and route prefix consistency)

---

## Notes

- Backend routes are mounted once at startup — restart `hermes dashboard` after editing
- For intent parsing, use simple keyword matching for MVP (no LLM call needed)
- Keywords → tabs mapping:
  - "session", "chat", "conversation" → `/sessions`
  - "cron", "schedule", "job" → `/cron`
  - "skill", "tool", "mcp" → `/skills`
  - "config", "setting", "preference" → `/config`
  - "log", "history" → `/logs`
  - "analytics", "stats", "metric" → `/analytics`
