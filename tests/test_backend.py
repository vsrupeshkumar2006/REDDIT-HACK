"""
Backend Test Suite for KarmaCrunch
Built by Eshwar Karthik, Prashanth, and Rupesh Kumar
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
    assert data["app"] == "ONLYSONS"
    assert "Eshwar Karthik" in data["authors"]
    assert "Prashanth" in data["authors"]
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

def test_tasks_history_and_log():
    # Log a systematic task
    payload = {
        "task_id": "test_task_42",
        "task_name": "Test Systematic Mission",
        "category": "open_world_mission",
        "points": 250,
        "details": {"zone": "Mod Wizard Tower"}
    }
    log_resp = client.post("/api/tasks/log", json=payload)
    assert log_resp.status_code == 200
    assert log_resp.json()["status"] == "recorded"
    assert "verification_hash" in log_resp.json()["task"]

    # Retrieve history
    hist_resp = client.get("/api/tasks/history")
    assert hist_resp.status_code == 200
    assert len(hist_resp.json()["tasks"]) >= 1

def test_fintech_audits_and_simulate():
    response = client.get("/api/fintech/audits")
    assert response.status_code == 200
    assert len(response.json()["audits"]) >= 1

    sim_payload = {
        "provider": "CoreWeave",
        "invoice_amount": 4800.0,
        "flagged_amount": 1600.0
    }
    sim_resp = client.post("/api/fintech/simulate", json=sim_payload)
    assert sim_resp.status_code == 200
    assert sim_resp.json()["status"] == "audit_completed"
    assert sim_resp.json()["karma_reward"] == 3200

def test_data_lineage():
    response = client.get("/api/data/lineage")
    assert response.status_code == 200
    data = response.json()
    assert "nodes" in data
    assert "schema_table" in data
    assert len(data["schema_table"]) >= 4

def test_agent_council_and_memory():
    council_resp = client.get("/api/agent/council")
    assert council_resp.status_code == 200
    assert len(council_resp.json()["agents"]) == 5

    mem_payload = {
        "agent_id": "wizard",
        "agent_name": "Mod Wizard",
        "role": "Controls Lead",
        "key": "last_audit_clause",
        "val": "Clause 4.2 ceiling applied",
        "priority": 2
    }
    mem_post = client.post("/api/agent/memory", json=mem_payload)
    assert mem_post.status_code == 200

    mem_get = client.get("/api/agent/memory?agent_id=wizard")
    assert mem_get.status_code == 200
    assert len(mem_get.json()["memory_stream"]) >= 1

def test_provably_fair_verify():
    payload = {
        "server_seed": "server_secret_seed_123",
        "client_seed": "client_custom_seed_456",
        "nonce": 1,
        "result": "50.00"
    }
    resp = client.post("/api/provably-fair/verify", json=payload)
    assert resp.status_code == 200
    assert resp.json()["verified"] is True
    assert len(resp.json()["computed_hash"]) == 64
