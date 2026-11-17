"""
KarmaCrunch Configuration Module
Built by Rupesh Kumar, Eshwar Kartik, and Prashant
"""

import os
from pydantic import BaseModel

class Settings(BaseModel):
    APP_NAME: str = "KarmaCrunch"
    VERSION: str = "2.0.0"
    AUTHORS: list[str] = ["Rupesh Kumar", "Eshwar Kartik", "Prashant"]
    
    # OpenAI Settings
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "mock-openai-key")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    
    # Reddit API Credentials (PRAW)
    REDDIT_CLIENT_ID: str = os.getenv("REDDIT_CLIENT_ID", "")
    REDDIT_CLIENT_SECRET: str = os.getenv("REDDIT_CLIENT_SECRET", "")
    REDDIT_USER_AGENT: str = os.getenv("REDDIT_USER_AGENT", "KarmaCrunch:v2.0 (by /u/KarmaCrunchDevs)")
    
    # Mobile & Timeout Safeguards
    MOBILE_TIMEOUT_SAFETY_MS: int = 15000
    CACHE_TTL_SECONDS: int = 86400  # 24 hours

settings = Settings()
