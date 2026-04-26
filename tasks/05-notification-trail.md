# Task: Notification Trail (Dynamic Island)

**Status:** Ready for implementation  
**Priority:** P1 (real Hermes integration)  
**Estimated time:** 30 minutes  
**Assignee:** Any subagent  

---

## Goal

Implement the notification trail — a dynamic island that shows real Hermes events (task completion, errors) in a sleek, unobtrusive way.

---

## Output

File: `src/plugin/dist/index.js` (notification section)

---

## Requirements

### Component: `<NotificationTrail />`

**Position:** Fixed, top-center of screen, below the dashboard header  
**Style:** Pill-shaped container, glassmorphism, subtle border glow  
**Behavior:** Events slide in from top, stack vertically (max 3 visible), auto-dismiss after 5s

### Event Types

| Type | Icon | Color | Sound | Duration |
|------|------|-------|-------|----------|
| `task_complete` | CheckCircle | Green (`--success`) | None | 5s |
| `error` | AlertTriangle | Red (`--destructive`) | None | 8s (longer, needs attention) |

### Animation

1. **Enter:** Slide down from `-100%` to `0`, fade in, 300ms, `cubic-bezier(0.22, 1, 0.36, 1)`
2. **Idle:** Subtle pulse glow on border
3. **Exit:** Slide up + fade out, 200ms
4. **Stack:** New notifications push existing ones down with 50ms stagger

### Data Source

Connect to backend SSE stream: `GET /api/plugins/agui/notifications`

```javascript
const eventSource = new EventSource('/api/plugins/agui/notifications');
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  addNotification(data);
};
```

### Notification Data Structure

```javascript
{
  id: "notif-001",
  type: "task_complete", // or "error"
  title: "Task finished",
  message: "Code review completed for PR #42",
  timestamp: 1714089600000,
  action: { label: "View", url: "/sessions/abc123" } // optional
}
```

### Interaction

- **Click:** If notification has `action`, navigate to URL
- **Hover:** Pause auto-dismiss timer
- **Swipe up / Click X:** Dismiss immediately
- **Multiple:** Stack with 8px gap, max 3 visible, older ones hidden with fade

### Visual Design

```
┌─────────────────────────────────────┐
│  ✓  Task finished          [×]       │
│     Code review completed for PR #42 │
│     ────────────────                 │
│     [View Session]                   │
└─────────────────────────────────────┘
```

- Width: `min(480px, 90vw)`
- Padding: 16px
- Border-radius: 16px
- Background: `rgba(var(--background-rgb), 0.85)` + backdrop-blur
- Border: 1px solid `var(--border)` with glow matching notification type color
- Icon: 20px, left side
- Title: 14px, font-weight 600
- Message: 13px, opacity 0.8
- Action button: small, outlined, matches type color

---

## Reference

- Backend: `tasks/02-backend-api.md` § "Route: GET /notifications"
- SDK: `AGENTS.md` § "Hermes Plugin SDK Reference"

---

## Testing (Visual + Functional)

### Functional Tests

```javascript
1. test_sse_connection:
   - Assert: new EventSource('/api/plugins/agui/notifications') connects
   - Assert: onopen fires within 2s

2. test_task_complete_notification:
   - Trigger: Backend sends {type: "task_complete", title: "Done", message: "Task finished"}
   - Assert: Notification appears in trail
   - Assert: Has green border (success color)
   - Assert: Auto-dismisses after 5s

3. test_error_notification:
   - Trigger: Backend sends {type: "error", message: "Connection failed"}
   - Assert: Notification appears with red border
   - Assert: Persists for 8s

4. test_hover_pause:
   - Action: Hover over notification at 4s
   - Assert: Timer paused (notification still visible at 6s)
   - Action: Mouse leave
   - Assert: Dismisses within 1s

5. test_max_stack:
   - Trigger: Send 5 notifications rapidly
   - Assert: Only 3 visible
   - Assert: Older ones hidden or stacked with opacity
```

### Visual Tests (Browser Tools)

1. **test_notification_appearance**:
   - Trigger task_complete notification
   - Screenshot
   - Assert: Pill shape, glassmorphism, green glow
   - Assert: Icon + title + message + action button

2. **test_stack_layout**:
   - Trigger 3 notifications
   - Screenshot
   - Assert: 8px gap between them
   - Assert: Centered horizontally

3. **test_dismiss_animation**:
   - Wait for auto-dismiss
   - Record/screenshot sequence
   - Assert: Slides up + fades out smoothly

## Acceptance Criteria

- [ ] Connects to SSE stream and receives events
- [ ] Notifications slide in smoothly from top
- [ ] Auto-dismiss after correct duration
- [ ] Hover pauses timer
- [ ] Click action navigates to URL
- [ ] Max 3 visible, older ones hidden
- [ ] Task completion = green, Error = red
- [ ] Uses theme CSS variables
- [ ] Doesn't block dashboard interactions (pointer-events: none on container)
- [ ] **Visual tests pass (screenshots verified)**
- [ ] **Functional tests pass (assertions verified)**

---

## Dependencies

- Task 02: Backend API (for SSE endpoint)

---

## Notes

- Use `EventSource` API — it's built into browsers, no library needed
- For auto-dismiss, use `setTimeout` per notification, clear on hover
- For the stack layout, use CSS `transform: translateY()` with staggered delays
- Consider a "Do not disturb" mode (future feature) — store in localStorage
- Error notifications should have higher z-index than task completions
- **Browser tools REQUIRED for visual verification**
