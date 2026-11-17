"""
KarmaCrunch High-Performance FastAPI Server
Built by Eshwar Karthik, Prashanth, and Rupesh Kumar
"""

import asyncio
import time
from typing import Dict, Any
from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .schemas import (
    KarmaCrunchReport,
    ChatAgentRequest,
    ChatAgentResponse,
    EnqueueJobResponse,
    JobStatusResponse
)
from .reddit_scraper import RedditScraper
from .ai_agent import AIAgentEngine

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="Backend API for KarmaCrunch: Reddit Analytics, AI Agent, and 100-Level RPG Community Game Suite."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

scraper = RedditScraper()
ai_engine = AIAgentEngine()
job_store: Dict[str, Dict[str, Any]] = {}

@app.get("/")
def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.VERSION,
        "authors": settings.AUTHORS,
        "status": "online",
        "documentation": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {"status": "ok", "timestamp": time.time()}

# -------------------------------------------------------------
# ASYNC JOB QUEUE (Prevents Android & Mobile Timeouts)
# -------------------------------------------------------------
@app.post("/api/report/enqueue", response_model=EnqueueJobResponse)
async def enqueue_report(username: str, sarcasm_level: int = 75, bg_tasks: BackgroundTasks = BackgroundTasks()):
    job_id = f"job_{username}_{int(time.time() * 1000)}"
    job_store[job_id] = {
        "status": "queued",
        "progress": 10,
        "data": None
    }

    async def process_report_task():
        try:
            job_store[job_id]["status"] = "scraping_reddit"
            job_store[job_id]["progress"] = 35
            user_data = await scraper.fetch_user_overview(username)

            job_store[job_id]["status"] = "running_llm"
            job_store[job_id]["progress"] = 75
            report = ai_engine.generate_structured_report(user_data, sarcasm_level)

            job_store[job_id]["status"] = "completed"
            job_store[job_id]["progress"] = 100
            job_store[job_id]["data"] = report
        except Exception as e:
            job_store[job_id]["status"] = "failed"
            job_store[job_id]["error"] = str(e)

    bg_tasks.add_task(process_report_task)
    return EnqueueJobResponse(job_id=job_id, status="enqueued", eta_seconds=3)

@app.get("/api/report/status/{job_id}", response_model=JobStatusResponse)
async def get_job_status(job_id: str):
    if job_id not in job_store:
        raise HTTPException(status_code=404, detail="Job not found")
    item = job_store[job_id]
    return JobStatusResponse(
        job_id=job_id,
        status=item["status"],
        progress=item["progress"],
        data=item.get("data")
    )

# -------------------------------------------------------------
# REDDIT AI AGENT CHAT
# -------------------------------------------------------------
@app.post("/api/agent/chat", response_model=ChatAgentResponse)
async def chat_with_reddit_agent(payload: ChatAgentRequest):
    return ai_engine.handle_chat_agent_query(payload.query, payload.username or "Redditor")

# -------------------------------------------------------------
# SUBREDDIT LIVE SCRAPER
# -------------------------------------------------------------
@app.get("/api/scraper/subreddit/{subreddit}")
async def scrape_subreddit(subreddit: str):
    posts = await scraper.fetch_subreddit_hot(subreddit, limit=8)
    return {"subreddit": subreddit, "count": len(posts), "posts": posts}

# -------------------------------------------------------------
# REDDIT POST DELETION COMPLIANCE WEBHOOK
# -------------------------------------------------------------
@app.post("/api/webhooks/reddit-delete")
async def reddit_post_deleted(payload: dict):
    post_id = payload.get("post_id")
    author = payload.get("author")
    # Clean cached jobs for this user
    to_delete = [jid for jid in job_store if author and author in jid]
    for jid in to_delete:
        del job_store[jid]
    return {"success": True, "message": f"Purged data for author {author} (post: {post_id})"}
