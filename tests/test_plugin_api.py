import pytest
from httpx import AsyncClient
from fastapi import FastAPI
from fastapi.testclient import TestClient
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from src.plugin.plugin_api import router

app = FastAPI()
app.include_router(router, prefix="/api/plugins/agui")

@pytest.fixture
def client():
    return TestClient(app)

def test_chat_navigate(client):
    """POST /chat with 'show cron jobs' -> returns navigate action."""
    r = client.post("/api/plugins/agui/chat", json={"message": "show cron jobs"})
    assert r.status_code == 200
    data = r.json()
    assert data["action"] == "navigate"
    assert data["target"] == "/cron"
    assert data["label"] == "Cron Jobs"

def test_chat_github_issue(client):
    """POST /chat with 'add dark mode' -> returns github_issue action."""
    r = client.post("/api/plugins/agui/chat", json={"message": "add dark mode"})
    assert r.status_code == 200
    data = r.json()
    assert data["action"] == "github_issue"
    assert "dark mode" in data["title"].lower()

def test_chat_info(client):
    """POST /chat with 'hello' -> returns info action."""
    r = client.post("/api/plugins/agui/chat", json={"message": "hello"})
    assert r.status_code == 200
    data = r.json()
    assert data["action"] == "info"

def test_notifications_stream(client):
    """GET /notifications returns SSE stream with correct content-type."""
    # Close the response immediately to avoid hanging on infinite stream
    with client.stream("GET", "/api/plugins/agui/notifications") as r:
        assert r.status_code == 200
        assert "text/event-stream" in r.headers.get("content-type", "")

def test_github_draft_url(client):
    """POST /github-draft returns properly encoded URL."""
    r = client.post("/api/plugins/agui/github-draft", json={
        "title": "Feature: test",
        "body": "User wants...",
        "labels": ["enhancement", "agui"]
    })
    assert r.status_code == 200
    data = r.json()
    assert "github.com" in data["issue_url"]
    assert "Feature%3A+test" in data["issue_url"] or "Feature: test" in data["issue_url"]

def test_intent_mapping_coverage(client):
    """All 6 dashboard tabs are covered by keywords."""
    tests = [
        ("show sessions", "/sessions"),
        ("cron jobs", "/cron"),
        ("skills", "/skills"),
        ("config", "/config"),
        ("logs", "/logs"),
        ("analytics", "/analytics"),
    ]
    for msg, expected_target in tests:
        r = client.post("/api/plugins/agui/chat", json={"message": msg})
        data = r.json()
        assert data["action"] == "navigate", f"Failed for '{msg}': {data}"
        assert data["target"] == expected_target, f"Wrong target for '{msg}': {data}"
