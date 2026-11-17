# ⚡ ONLYSONS: 1-100 Level Reddit Community Game & AI Suite

> **Built for the Reddit Developer Platform Hackathon**  
>
> ### 👥 Project Creators & Core Contributors
> 1. **eshwar Karthik** – *Game Engine and Full-Stack Development*
> 2.  **Prashanth** – *Visualization and the Entire Game Development*
> 2. **Rupesh Kumar** – *Architecture and AI System Development*

[![Reddit Devvit](https://img.shields.io/badge/Platform-Reddit_Devvit_2.0-FF4500?logo=reddit&logoColor=white)](https://developers.reddit.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-0079D3.svg)](LICENSE)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI_0.110-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![OpenAI GPT-4o mini](https://img.shields.io/badge/AI-OpenAI_GPT--4o_mini-412991?logo=openai&logoColor=white)](https://openai.com)
[![Three.js 3D](https://img.shields.io/badge/Graphics-3D_WebGL_&_CSS3D-black?logo=three.js)](https://threejs.org)
[![Tests Passing](https://img.shields.io/badge/Tests-5/5_Passed-46D160.svg)](tests/)

---

## 🌟 Executive Summary

**KarmaCrunch** is an AI-powered Reddit community game and profiling suite that transforms any Reddit account into an interactive, 100-level RPG experience. Engineered as an authentic **Devvit interactive post application**, it integrates live Reddit scraping, token-level constrained GPT-4o mini structured outputs, and a 3D isometric architecture.

---

## 📊 System Architecture & Data Flow

### 1. High-Level System Architecture
```mermaid
flowchart TD
    subgraph Client["Frontend Client (Reddit Devvit 2.0 Webview)"]
        UI["Master UI (index.html)"]
        subgraph EngineGroup["Game Engines"]
            SURF["3D Karma Surfers (karmaSurfers3D.js)"]
            MAP["100-Level World Map (levelMap.js)"]
            GE["Points & Combo Core (gameEngine.js)"]
            SE["Web Audio Synthesizer (soundEngine.js)"]
            T3["3D Visuals & Tilt (threeVisuals.js)"]
            RA["Reddit AI Agent (redditAgent.js)"]
            ACH["Achievements & Trophies (achievements.js)"]
        end
    end

    subgraph Backend["FastAPI Production Backend (backend/main.py)"]
        API["FastAPI REST & SSE Gateway"]
        JQ["Asynchronous Job Queue (Timeout Safeguard)"]
        PRAW["Reddit Scraper (reddit_scraper.py)"]
        LLM["GPT-4o mini Engine (ai_agent.py)"]
        SCH["Strict Pydantic Validation (schemas.py)"]
    end

    subgraph External["External Cloud & API Infrastructure"]
        RD["Reddit Official API / PRAW"]
        OA["OpenAI API (GPT-4o mini)"]
    end

    UI --> EngineGroup
    UI -.->|"Async HTTP / SSE"| API
    API --> JQ
    JQ --> PRAW --> RD
    JQ --> LLM --> OA
    LLM --> SCH
```

---

### 2. Android & Mobile Timeout Prevention Sequence
Mobile networks (OkHttp, Android webviews, and Devvit) terminate requests with `SocketTimeoutException` if operations exceed 10–15s. KarmaCrunch solves this with a two-phase async queue:

```mermaid
sequenceDiagram
    autonumber
    actor Android as Android App / Devvit Webview
    participant Gateway as FastAPI Gateway
    participant Worker as BackgroundTask Worker
    participant Reddit as Reddit API
    participant OpenAI as OpenAI GPT-4o mini

    Android->>Gateway: POST /api/report/enqueue {username, sarcasm: 75}
    Gateway->>Worker: Enqueue background job (job_id: "job_9421")
    Gateway-->>Android: 202 Accepted {job_id: "job_9421", eta: 3s}

    par Background Pipeline
        Worker->>Reddit: Fetch top submissions & comment history
        Reddit-->>Worker: Raw Reddit JSON
        Worker->>OpenAI: Structured Output parse (Strict Pydantic)
        OpenAI-->>Worker: Validated KarmaCrunchReport
        Worker->>Worker: Cache completed report (TTL: 24h)
    and Heartbeat Polling Loop
        loop Every 1.5 seconds
            Android->>Gateway: GET /api/report/status/job_9421
            Gateway-->>Android: {status: "processing", progress: 70%}
        end
    end

    Android->>Gateway: GET /api/report/status/job_9421
    Gateway-->>Android: 200 OK {status: "completed", data: KarmaCrunchReport}
```

---

### 3. 100-Level Progression & Procedural Biomes Flow
The game scales dynamically across 5 progressive brackets up to Level 100:

```mermaid
flowchart LR
    subgraph Tier1["Tier 1: Wholesome Meadow (Lvl 1-10)"]
        T1["Pups & Casual Lurkers<br>Soft emerald track<br>Gentle speed"]
    end

    subgraph Tier2["Tier 2: Neon Cyber Reddit (Lvl 11-25)"]
        T2["Meme Uprising<br>Cyan grid & night skyline<br>Snarky comment streams"]
    end

    subgraph Tier3["Tier 3: r/wallstreetbets (Lvl 26-50)"]
        T3["Stonk Market Floor<br>Golden tracks & green candles<br>5x Viral Gamble Moves"]
    end

    subgraph Tier4["Tier 4: ModQueue Citadel (Lvl 51-75)"]
        T4["Volcanic Crimson Track<br>AutoMod Banhammers<br>High-speed Obstacles"]
    end

    subgraph Tier5["Tier 5: Cosmic Hivemind (Lvl 76-100)"]
        T5["Interstellar Space Nebula<br>Algorithmic Hivemind Raid<br>Ternion God Mode"]
    end

    Tier1 -->|"Pass Lvl 10"| Tier2
    Tier2 -->|"Pass Lvl 25"| Tier3
    Tier3 -->|"Pass Lvl 50"| Tier4
    Tier4 -->|"Pass Lvl 75"| Tier5
```

---

### 4. 3D Karma Surfers Real-Time Gameplay State Machine
```mermaid
stateDiagram-v2
    [*] --> IdleMenu : Launch 3D Surfers
    IdleMenu --> Running : Start Level
    
    state Running {
        [*] --> InLaneCenter
        InLaneCenter --> LaneLeft : Press A or Left Arrow
        LaneLeft --> InLaneCenter : Press D or Right Arrow
        InLaneCenter --> LaneRight : Press D or Right Arrow
        LaneRight --> InLaneCenter : Press A or Left Arrow
        
        InLaneCenter --> Jumping : Press W, Space, or Up Arrow
        Jumping --> InLaneCenter : Gravity Landing
        
        InLaneCenter --> Sliding : Press S or Down Arrow
        Sliding --> InLaneCenter : Slide Duration Ends
    }
    
    Running --> PowerupCollected : Touch Gem, Magnet, Shield, 2x
    PowerupCollected --> Running : Buff Applied
    
    Running --> ObstacleCollision : Hit Downvote Spike or Banhammer
    
    state ObstacleCollision <<choice>>
    ObstacleCollision --> ShieldAbsorbed : Shield Active
    ShieldAbsorbed --> Running : Shield Broken (Continue)
    ObstacleCollision --> Defeat : No Shield
    
    Running --> LevelClear : Distance Target Reached
    LevelClear --> IdleMenu : Unlock Next Level on Map
    Defeat --> IdleMenu : Retry Level
```

---

### 5. OpenAI Structured Outputs & AI Dossier Pipeline
```mermaid
flowchart LR
    A["Raw User Reddit Data<br>(Posts, Comments, Karma)"] --> B["System Prompt Interpolator<br>(Sarcasm Slider 0-100%)"]
    B --> C["GPT-4o mini<br>(Constrained Grammar Decoder)"]
    C --> D["Pydantic Validation<br>(Strict JSON Schema)"]
    D --> E["KarmaCrunch Dossier<br>• RPG Stats & Class<br>• AI Scorched Earth Roast<br>• 3D Portrait Prompt"]
    E --> F["Interactive UI Preview<br>& r/KarmaCrunch Post"]
```

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

## 📁 Repository Structure

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
│       ├── karmaSurfers3D.js      # 3D WebGL runner engine
│       ├── levelMap.js            # 100-Level interactive world map
│       ├── achievements.js        # 9 unlockable Reddit achievements
│       ├── gameEngine.js          # Master game & point combo engine
│       ├── soundEngine.js         # Procedural Web Audio chiptune synthesizer
│       ├── threeVisuals.js        # WebGL 3D Karma Core & Tilt Physics
│       ├── three.min.js           # Offline Three.js library
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
1. **Prashant** – *Visualization and the entire game development*
2. **Rishir Kartik** – *Game engine and full-stack development*
3. **Rupesh Kumar** – *Architecture and AI system development with system-level deep integration*

---

## 📄 License
This project is open-source and distributed under the [MIT License](LICENSE).
