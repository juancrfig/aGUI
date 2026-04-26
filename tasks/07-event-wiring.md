# Task: Event Wiring & Integration

**Status:** Ready for implementation  
**Priority:** P2 (connects to real Hermes)  
**Estimated time:** 25 minutes  
**Assignee:** Any subagent  

---

## Goal

Wire the notification trail to real Hermes backend events. Connect the frontend SSE stream to actual task completion and error events.

---

## Output

Files:
- `src/plugin/plugin_api.py` (event polling logic)
- `src/plugin/dist/index.js` (SSE connection + notification dispatch)

---

## Requirements

### Backend: Event Polling

Hermes doesn't expose a unified event stream. We poll existing APIs:

**Task Completion Detection:**
```python
# Poll /api/sessions/recent every 5 seconds
# Compare with previous state — new "completed" sessions = task_complete event

async def poll_sessions():
    response = await fetch("/api/sessions/recent?limit=10")
    current = {s["id"]: s["status"] for s in response["sessions"]}
    
    for session_id, status in current.items():
        if status == "completed" and previous.get(session_id) != "completed":
            emit_event("task_complete", {
                "task_id": session_id,
                "summary": current[session_id].get("summary", "Task completed"),
            })
    
    previous = current
```

**Error Detection:**
```python
# Poll /api/logs?level=error every 5 seconds
# New error entries since last check = error event

async def poll_errors():
    response = await fetch("/api/logs?level=error&since={last_check}")
    for log in response["logs"]:
        emit_event("error", {
            "message": log["message"],
            "source": log.get("source", "unknown"),
        })
    last_check = now()
```

**SSE Endpoint:**
```python
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
import asyncio
import json

router = APIRouter()

@router.get("/notifications")
async def notifications_stream():
    async def event_generator():
        while True:
            event = await event_queue.get()
            yield f"data: {json.dumps(event)}\n\n"
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )
```

### Frontend: SSE Connection

```javascript
function useNotifications() {
  const [notifications, setNotifications] = React.useState([]);
  
  React.useEffect(() => {
    const source = new EventSource('/api/plugins/agui/notifications');
    
    source.onmessage = (event) => {
      const data = JSON.parse(event.data);
      addNotification(data);
    };
    
    source.onerror = () => {
      // Reconnect after 3s
      setTimeout(() => {
        source.close();
        // Re-initialize...
      }, 3000);
    };
    
    return () => source.close();
  }, []);
  
  return notifications;
}
```

### Integration Points

1. **Cluster → Backend:** When user clicks "+" and types intent, call `POST /api/plugins/agui/chat`
2. **Backend → Frontend:** Return action (navigate/github_issue/info)
3. **Frontend → Dashboard:** Execute action (navigate to tab / open GitHub issue URL / show info)
4. **Backend Events → Frontend:** SSE stream pushes notifications
5. **Frontend → User:** Notification trail displays events

---

## Reference

- Backend API: `tasks/02-backend-api.md`
- Notification Trail: `tasks/05-notification-trail.md`
- Hermes APIs: Check dashboard network tab or `hermes_cli/web_server.py` for available endpoints

---

## Testing (Integration + End-to-End)

### Integration Tests

```python
# tests/test_event_wiring.py
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_sse_receives_task_complete():
    """End-to-end: Backend event → SSE → Frontend notification"""
    async with AsyncClient() as client:
        # Start SSE connection
        async with client.stream('GET', '/api/plugins/agui/notifications') as response:
            assert response.headers['content-type'] == 'text/event-stream'
            
            # Trigger a task completion (mock or real)
            await client.post('/api/test/trigger-task-complete')
            
            # Read event from stream
            line = await response.aread()
            assert b'task_complete' in line

@pytest.mark.asyncio
async def test_sse_receives_error():
    """End-to-end: Backend error → SSE → Frontend notification"""
    async with AsyncClient() as client:
        async with client.stream('GET', '/api/plugins/agui/notifications') as response:
            await client.post('/api/test/trigger-error')
            line = await response.aread()
            assert b'error' in line
            assert b'message' in line
```

### End-to-End Visual Test (Browser Tools)

```javascript
1. test_full_flow:
   - Setup: Dashboard running, aGUI loaded
   - Action: Trigger a task completion in Hermes (run a quick command)
   - Assert: Notification appears in trail within 10s
   - Assert: Notification has correct type, title, message
   - Screenshot for verification

2. test_reconnection:
   - Action: Kill SSE connection (simulate network drop)
   - Assert: Frontend reconnects within 3s
   - Assert: Notifications resume
```

### Backend Polling Tests

```python
@pytest.mark.asyncio
async def test_poll_sessions_detects_completion():
    """Test that session polling detects status changes"""
    # Mock session data
    previous = {"sess-1": "running"}
    current = {"sess-1": "completed"}
    
    events = detect_changes(previous, current)
    assert len(events) == 1
    assert events[0]["type"] == "task_complete"
    assert events[0]["task_id"] == "sess-1"

@pytest.mark.asyncio
async def test_poll_errors_detects_new_errors():
    """Test that error polling detects new log entries"""
    previous_logs = []
    current_logs = [{"message": "Connection failed", "source": "gateway"}]
    
    events = detect_new_errors(previous_logs, current_logs)
    assert len(events) == 1
    assert events[0]["type"] == "error"
    assert "Connection failed" in events[0]["message"]
```

## Acceptance Criteria

- [ ] SSE stream connects and stays alive
- [ ] Task completion events fire when sessions finish
- [ ] Error events fire when new errors appear in logs
- [ ] Reconnection works after disconnect
- [ ] No memory leaks (EventSource cleaned up on unmount)
- [ ] Polling doesn't overwhelm the backend (5s interval)
- [ ] **Integration tests pass**
- [ ] **End-to-end visual test passes (screenshot verified)**

---

## Dependencies

- Task 02: Backend API (for SSE endpoint structure)
- Task 05: Notification Trail (for frontend notification system)

---

## Notes

- The Hermes dashboard may not have a `/api/logs` endpoint — verify available APIs first
- If no error API exists, mock it for the hackathon (show a demo notification on button click)
- For task completion, the session status transitions from "running" → "completed"
- Consider adding a heartbeat comment in SSE to keep connection alive:
  ```python
  yield ":heartbeat\n\n"  # Every 15 seconds
  ```
- Use `asyncio.create_task()` to run polling loops in background
- **Browser tools REQUIRED for end-to-end verification**
