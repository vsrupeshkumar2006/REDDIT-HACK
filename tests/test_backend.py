"""
Backend Test Suite for KarmaCrunch
Built by Rupesh Kumar, Eshwar Kartik, and Prashant
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.schemas import KarmaCrunchReport, RPGCharacterStats

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["app"] == "KarmaCrunch"
    assert "Prashant" in data["authors"]
    assert "Rishir Kartik" in data["authors"]
    assert "Rupesh Kumar" in data["authors"]

def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_enqueue_report_and_status():
    # Enqueue a report
    response = client.post("/api/report/enqueue?username=TestRedditor&sarcasm_level=80")
    assert response.status_code == 200
    data = response.json()
    assert "job_id" in data
    assert data["status"] == "enqueued"

    job_id = data["job_id"]
    # Check status
    status_resp = client.get(f"/api/report/status/{job_id}")
    assert status_resp.status_code == 200
    status_data = status_resp.json()
    assert status_data["job_id"] == job_id
    assert status_data["progress"] >= 10

def test_chat_agent():
    response = client.post("/api/agent/chat", json={"query": "How do I reach level 50?"})
    assert response.status_code == 200
    data = response.json()
    assert "title" in data
    assert len(data["response"]) > 10

def test_subreddit_scraper():
    response = client.get("/api/scraper/subreddit/AskReddit")
    assert response.status_code == 200
    data = response.json()
    assert data["subreddit"] == "AskReddit"
    assert "posts" in data
