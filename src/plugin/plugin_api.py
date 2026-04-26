"""aGUI Backend API — FastAPI router for the Adaptive GUI plugin.

Routes:
  POST /api/plugins/agui/chat        — Handle user intent from the "+" button
  GET  /api/plugins/agui/notifications — SSE stream of Hermes events
  POST /api/plugins/agui/github-draft  — Generate pre-filled GitHub issue URL
"""

import asyncio
import json
import urllib.parse
from typing import AsyncGenerator

from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse

router = APIRouter()

# ---------------------------------------------------------------------------
# Intent mapping — simple keyword → dashboard tab
# ---------------------------------------------------------------------------

INTENT_MAP = [
    # (keywords, target_path, label, icon)
    (["session", "chat", "conversation", "talk"], "/sessions", "Sessions", "MessageSquare"),
    (["cron", "schedule", "job", "task", "timer"], "/cron", "Cron Jobs", "Clock"),
    (["skill", "tool", "mcp", "ability"], "/skills", "Skills", "Wrench"),
    (["config", "setting", "preference", "option"], "/config", "Config", "Settings"),
    (["log", "history", "record"], "/logs", "Logs", "ScrollText"),
    (["analytics", "stats", "metric", "dashboard"], "/analytics", "Analytics", "BarChart3"),
]

GITHUB_REPO = "NousResearch/hermes-agent"

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _parse_intent(message: str) -> dict:
    """Parse user message and return an action dict."""
    msg_lower = message.lower()

    # 1. Check for known dashboard tabs
    for keywords, target, label, icon in INTENT_MAP:
        if any(kw in msg_lower for kw in keywords):
            return {
                "action": "navigate",
                "target": target,
                "label": label,
                "icon": icon,
                "electron_id": f"electron-{target.strip('/').replace('/', '-')}",
            }

    # 2. Check for source-code-modification signals
    source_code_keywords = [
        "add", "create", "build", "implement", "fix", "modify",
        "change", "update", "new feature", "support", "enable",
    ]
    if any(kw in msg_lower for kw in source_code_keywords):
        return {
            "action": "github_issue",
            "title": f"Feature request: {message}",
            "body": f"User requested via aGUI:\n\n> {message}\n\n",
            "labels": ["enhancement", "agui"],
        }

    # 3. Fallback — informational response
    return {
        "action": "info",
        "message": (
            f"I heard: '{message}'. "
            "Try asking about: sessions, cron jobs, skills, config, logs, or analytics."
        ),
    }


def _build_github_url(title: str, body: str, labels: list[str]) -> str:
    """Build a pre-filled GitHub 'new issue' URL."""
    base = f"https://github.com/{GITHUB_REPO}/issues/new"
    params = {
        "title": title,
        "body": body,
        "labels": ",".join(labels),
    }
    query = urllib.parse.urlencode(params)
    return f"{base}?{query}"


# ---------------------------------------------------------------------------
# SSE notification queue (in-memory for MVP)
# ---------------------------------------------------------------------------

_notification_queues: list[asyncio.Queue] = []


async def _notification_generator() -> AsyncGenerator[str, None]:
    """Yield SSE events from the shared queue."""
    queue: asyncio.Queue[dict] = asyncio.Queue()
    _notification_queues.append(queue)
    try:
        while True:
            try:
                event = await asyncio.wait_for(queue.get(), timeout=5.0)
                yield f"data: {json.dumps(event)}\n\n"
            except asyncio.TimeoutError:
                yield ":heartbeat\n\n"
    finally:
        _notification_queues.remove(queue)


def _broadcast_event(event: dict) -> None:
    """Push an event to every connected SSE client."""
    for queue in _notification_queues:
        try:
            queue.put_nowait(event)
        except asyncio.QueueFull:
            pass


# ---------------------------------------------------------------------------
# Hermes Event Polling (MVP: simulated events)
# ---------------------------------------------------------------------------

async def _hermes_event_poller():
    """Poll for Hermes events and broadcast to SSE clients."""
    # For MVP, we emit synthetic events to demonstrate the system.
    # Post-hackathon: replace with real Hermes API polling.
    import random
    demo_tasks = [
        "Cron job 'backup' completed",
        "Skill 'web-search' loaded",
        "Session #42 archived",
        "Config updated: theme switched",
    ]
    while True:
        await asyncio.sleep(8)
        if _notification_queues:
            event = {
                "type": "task_complete",
                "message": random.choice(demo_tasks),
                "timestamp": asyncio.get_event_loop().time(),
            }
            _broadcast_event(event)


# Start the poller as a background task
_poller_task = None


def _ensure_poller():
    global _poller_task
    if _poller_task is None or _poller_task.done():
        try:
            loop = asyncio.get_running_loop()
            _poller_task = loop.create_task(_hermes_event_poller())
        except RuntimeError:
            pass


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@router.post("/chat")
async def chat(request: Request):
    """Handle a user message from the '+' button."""
    body = await request.json()
    message = body.get("message", "").strip()
    session_id = body.get("session_id")  # ignored for now (stateless)

    if not message:
        return {"action": "info", "message": "Please type something!"}

    result = _parse_intent(message)
    return result


@router.get("/notifications")
async def notifications():
    """SSE stream of Hermes task-completion and error events."""
    _ensure_poller()
    return StreamingResponse(
        _notification_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )


@router.post("/github-draft")
async def github_draft(request: Request):
    """Return a pre-filled GitHub 'new issue' URL."""
    body = await request.json()
    title = body.get("title", "")
    issue_body = body.get("body", "")
    labels = body.get("labels", ["enhancement", "agui"])

    url = _build_github_url(title, issue_body, labels)
    return {"issue_url": url}
