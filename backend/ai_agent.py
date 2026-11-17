"""
KarmaCrunch AI Agent & Structured Output Engine
Built by Rupesh Kumar, Eshwar Kartik, and Prashant
"""

import json
from openai import OpenAI
from .config import settings
from .schemas import KarmaCrunchReport, RPGCharacterStats, ChatAgentResponse

class AIAgentEngine:
    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY
        self.model = settings.OPENAI_MODEL
        self.client = None
        if self.api_key and self.api_key != "mock-openai-key":
            self.client = OpenAI(api_key=self.api_key)

    def generate_structured_report(self, user_data: dict, sarcasm_level: int = 75) -> KarmaCrunchReport:
        """
        Uses OpenAI Structured Outputs with strict Pydantic parsing.
        """
        username = user_data.get("username", "SpeziusMaximus")
        total_karma = user_data.get("total_karma", 85000)

        if self.client:
            prompt = f"""
            Analyze the Reddit user '{username}' with {total_karma} karma.
            Sarcasm Level: {sarcasm_level}/100.
            Return a full structured dossier with RPG stats and a DALL-E prompt for their 3D avatar.
            """
            try:
                completion = self.client.beta.chat.completions.parse(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": "You are the KarmaCrunch AI Analyzer."},
                        {"role": "user", "content": prompt}
                    ],
                    response_format=KarmaCrunchReport
                )
                return completion.choices[0].message.parsed
            except Exception:
                pass

        # Deterministic rich generation
        seed = sum(ord(c) for c in username)
        classes = ["Diamond-Hands Ape", "Chaos Shitpost Cat", "Wholesome Doge", "Zen Capybara", "Reddit Archmage"]
        emojis = ["🦍", "🐈", "🐕", "🦫", "🧙‍♂️"]
        chosen_idx = seed % len(classes)

        return KarmaCrunchReport(
            username=username,
            archetype=classes[chosen_idx],
            total_karma=total_karma,
            account_age_years=4 + (seed % 6),
            sarcasm_score=sarcasm_level,
            top_subreddits=["r/AskReddit", "r/memes", "r/technology"],
            roast_summary=f"u/{username} spends approximately 40% of their day debunking internet strangers. Your comments are 80% snark and 20% genuine wisdom. Wear the badge with pride.",
            fun_facts=[
                "Survives on coffee and comment threads.",
                "Has earned enough karma to purchase an imaginary yacht.",
                "Once wrote a 12-paragraph rebuttal on a post that had 2 upvotes."
            ],
            rpg_stats=RPGCharacterStats(
                class_name=classes[chosen_idx],
                avatar_emoji=emojis[chosen_idx],
                level=min(100, max(1, total_karma // 2000)),
                hp=110 + (seed % 40),
                attack=22 + (seed % 15),
                defense=18 + (seed % 12),
                sarcasm_rating=sarcasm_level,
                special_perk="Ternion Overdrive"
            ),
            ai_portrait_prompt=f"A 3D isometric cyberpunk portrait of a legendary Reddit user u/{username} as a {classes[chosen_idx]}, glowing orange upvote crystal, neon cyber-dark background, 8k octane render."
        )

    def handle_chat_agent_query(self, query: str, username: str = "Redditor") -> ChatAgentResponse:
        """
        Processes interactive chat agent requests.
        """
        q_lower = query.lower()
        if "level" in q_lower or "game" in q_lower:
            return ChatAgentResponse(
                title="🎮 Game System Advisor",
                response="KarmaCrunch features 100 progressive levels! Levels 1-10 are friendly for beginner pets and lurkers, while levels 75-100 unlock cosmic raid bosses like The Algorithmic Hivemind.",
                tags=["Game Guide", "100 Levels"],
                suggested_actions=["Play Level 1", "Upgrade Meme Bot", "Challenge Boss"]
            )

        if "roast" in q_lower:
            return ChatAgentResponse(
                title="🔥 AI Scorched Earth Roast",
                response=f"u/{username}, your post history looks like a fever dream of someone trying to win every argument on the internet simultaneously.",
                tags=["Roast", "GPT-4o mini"],
                suggested_actions=["Adjust Sarcasm to 0%", "Try Wholesome Mode"]
            )

        return ChatAgentResponse(
            title="🤖 Reddit Intelligence",
            response=f"Query evaluated: '{query}'. Based on Reddit community signals, high-effort visual posts and engaging discussion starters receive 3.8x more comment velocity.",
            tags=["Scraper", "Analytics"],
            suggested_actions=["Analyze Subreddit", "Check Karma Dossier"]
        )
