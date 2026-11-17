# ⚡ KarmaCrunch: 1-100 Level Reddit Community Game & AI Suite

[![Reddit Devvit](https://img.shields.io/badge/Platform-Reddit_Devvit_2.0-FF4500?logo=reddit&logoColor=white)](https://developers.reddit.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-0079D3.svg)](LICENSE)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI_0.110-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![OpenAI GPT-4o mini](https://img.shields.io/badge/AI-OpenAI_GPT--4o_mini-412991?logo=openai&logoColor=white)](https://openai.com)
[![Three.js 3D](https://img.shields.io/badge/Graphics-3D_WebGL_&_CSS3D-black?logo=three.js)](https://threejs.org)
[![Tests Passing](https://img.shields.io/badge/Tests-5/5_Passed-46D160.svg)](tests/)

> **Built for the Reddit Developer Platform Hackathon**  
> **Creators & Architects:** **Rupesh Kumar**, **Eshwar Kartik**, and **Prashant**

---

## 🌟 Executive Summary

**KarmaCrunch** is an AI-powered Reddit community game and profiling suite that transforms any Reddit account into an interactive, 100-level RPG experience. Engineered as an authentic **Devvit interactive post application**, it integrates live Reddit scraping, token-level constrained GPT-4o mini structured outputs, and a 3D isometric architecture.

---

## 🏆 Key Features

### 1. 3D Karma Surfers (WebGL Three.js Endless & Level Runner)
* **Full 3D WebGL Camera & Physics:** 3-lane runner with smooth lane switching, jumping over Downvote Spikes, and sliding under AutoMod Banhammers.
* **Procedural Biomes across Levels 1-100:**
  * **Levels 1–10 (Wholesome Meadow):** Soft emerald track, gentle speed for pups and beginner players.
  * **Levels 11–25 (Neon Cyber Reddit):** Cyan wireframes and synthwave neon obstacles.
  * **Levels 26–50 (r/wallstreetbets Floor):** Golden tracks with floating green candle charts and high-speed multipliers.
  * **Levels 51–75 (ModQueue Fortress):** Volcanic crimson track with rotating banhammers.
  * **Levels 76–100 (Cosmic Hivemind):** Interstellar space rift and warp speed obstacles.
* **Power-Ups:** 🧲 *Karma Magnet*, ⚡ *2x Multiplier*, and 🛡️ *AutoMod Shield*.
* **100-Level World Map:** Interactive visual progression map with star ratings for all 100 levels.

### 2. Animal & Player Roles
* 🐕 **Wholesome Doge:** High health, passive healing, and loyal upvotes.
* 🐈 **Chaos Shitpost Cat:** High critical strike rate with chaotic 3 AM Zoomies.
* 🦫 **Zen Capybara:** Maximum defense against internet downvotes and toxic flamewars.
* 🦍 **Diamond-Hands Ape:** r/wallstreetbets high-roller with 5x viral gamble moves.
* 🧙‍♂️ **Cosmic Reddit Wizard:** Master of Reddit Gold and the Ternion All-Powerful relic.

### 3. 🤖 Reddit AI Agent Chat & Scraper
* Type `u/username` to scrape real Reddit user dossiers and calculate karma velocity.
* Type `r/subreddit` to perform live sentiment and trend audits.
* Request scorch-earth comedy roasts or viral post headline recommendations.

### 4. 📐 3D Interactive Builder Tribute Architecture
* At the bottom of the interface lies a responsive **3D Isometric Depth Card** featuring WebGL particle core rendering and mouse-tracking gyro tilt physics, celebrating creators **Rupesh Kumar**, **Eshwar Kartik**, and **Prashant**.

### 5. 🔊 Web Audio API Procedural Synthesizer
* Zero external audio files or mp3 dependencies! Generates procedural 8-bit chiptune sound effects in real-time.

---

## 🏗️ Technical Architecture & Solutions

```mermaid
flowchart TD
    subgraph Client["Frontend Client (Devvit Interactive Post)"]
        UI["Master UI (index.html)"]
        GE["Game Engine (gameEngine.js)"]
        SE["Audio Synthesizer (soundEngine.js)"]
        T3["3D Visuals & Tilt (threeVisuals.js)"]
        RA["Reddit Agent (redditAgent.js)"]
    end

    subgraph Backend["FastAPI Production Backend"]
        API["FastAPI Gateway (main.py)"]
        JQ["Async Job Queue (Android Timeout Safeguard)"]
        PRAW["Reddit Scraper (reddit_scraper.py)"]
        LLM["GPT-4o mini Engine (ai_agent.py)"]
        SCH["Strict Pydantic Schemas (schemas.py)"]
    end

    subgraph External["External Infrastructure"]
        RD["Reddit API / PRAW"]
        OA["OpenAI API"]
    end

    UI --> GE & SE & T3 & RA
    UI -.-> API
    API --> JQ
    JQ --> PRAW --> RD
    JQ --> LLM --> OA
    LLM --> SCH
```

1. **Eliminating Android & Mobile Timeouts:** Uses an asynchronous job queue (`POST /api/report/enqueue` returning within 150ms with a `job_id`, followed by heartbeat status polling) to avoid mobile socket drops.
2. **Guaranteed LLM Schema Adherence:** Leverages OpenAI Structured Outputs (`response_format: { type: "json_schema", strict: true }`) with Pydantic models. Zero regex, zero parsing crashes.
3. **GDPR & Reddit Policy Compliance:** Automatic webhook handler (`POST /api/webhooks/reddit-delete`) purges cached dossiers when a Reddit post is deleted.

---

## 📁 Repository Structure (20 Dedicated Files)

```
reddit-hack/
├── .github/
│   └── workflows/
│       └── ci.yml                 # GitHub Actions CI workflow
├── backend/
│   ├── __init__.py                # Package initializer
│   ├── config.py                  # App configuration & credentials
│   ├── schemas.py                 # Strict Pydantic models
│   ├── reddit_scraper.py          # Reddit API & PRAW scraping engine
│   ├── ai_agent.py                # GPT-4o mini Structured Output runner
│   └── main.py                    # FastAPI server & route handlers
├── src/
│   ├── data/
│   │   ├── animalRoles.js         # Playable animal & Redditor archetypes
│   │   └── levelsData.js          # 1-100 level curve & boss generator
│   └── engine/
│       ├── gameEngine.js          # Master game & point combo engine
│       ├── soundEngine.js         # Procedural Web Audio chiptune synthesizer
│       ├── threeVisuals.js        # WebGL 3D Karma Core & Tilt Physics
│       └── redditAgent.js         # Interactive Reddit AI Chat & Scraper
├── tests/
│   ├── test_backend.py            # Pytest test suite for backend APIs
│   └── test_game.js               # Node.js progression & formula tests
├── devvit.yaml                    # Official Reddit Devvit App manifest
├── index.html                     # Unified master frontend application
├── LICENSE                        # MIT License
├── package.json                   # Node.js dependencies & scripts
├── pyproject.toml                 # Python project configuration
├── requirements.txt               # Python package dependencies
└── README.md                      # Complete project documentation
```

---

## 🚀 Quickstart Guide

### 1. Launch the Frontend
The frontend has zero build step requirements and runs natively in any browser:
```bash
python -m http.server 8000
```
Open **[http://localhost:8000](http://localhost:8000)** to play.

### 2. Run the Backend API
```bash
pip install -r requirements.txt
uvicorn backend.main:app --reload --port 8080
```
API Swagger documentation is available at **http://localhost:8080/docs**.

### 3. Run Test Suites
```bash
# Test Game Progression Curves & Roles
node tests/test_game.js

# Test Backend API & Schemas
pytest tests/test_backend.py -v
```

---

## 👥 Authors & Team Credits

Built with pride for the Reddit Community:
* **Rupesh Kumar** – *System Architecture & AI Engineering*
* **Eshwar Kartik** – *Game Engine, Level Progression & Full-Stack*
* **Prashant** – *3D Holographic Visuals, UI/UX & Web Audio*

---

## 📄 License
This project is open-source and distributed under the [MIT License](LICENSE).
