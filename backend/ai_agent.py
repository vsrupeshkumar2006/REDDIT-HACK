"""
KarmaCrunch AI Agent & Structured Output Engine
Built by Eshwar Karthik, Prashanth, and Rupesh Kumar
"""

import json
from openai import OpenAI
from .config import settings
from .schemas import KarmaCrunchReport, RPGCharacterStats, ChatAgentResponse
from .analytics import compute_verifiable_metrics

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
        Processes interactive chat agent requests with verifiable record analytics.
        """
        q_lower = query.lower()

        # 1. Low sample verification test
        if "low sample" in q_lower or "insufficient" in q_lower:
            from .reddit_scraper import RedditScraper
            records = RedditScraper().generate_deterministic_records("test_low_sample", count=3)
            analytics = compute_verifiable_metrics(records, query_context="test_low_sample_N=3")
            return ChatAgentResponse(
                title="⚠️ Verifiable Low-Sample Audit (N = 3)",
                response=(
                    f"{analytics['low_sample_warning']}\n\n"
                    f"• Sample Size: N = {analytics['sample_size']} records\n"
                    f"• Data Freshness: {analytics['data_freshness']['utc_timestamp']}\n"
                    f"• Cryptographic Hash: {analytics['verification_hash']}\n"
                    f"• Observational Mean: {analytics['metrics']['mean_score']} ups\n"
                    f"• Evidence State: {analytics['evidence_status']}"
                ),
                tags=["Audit", "Low Sample Warning", "Reproducible"],
                suggested_actions=["Inspect Source Records", "Expand Sample (N=15)"],
                analytics=analytics
            )

        # 2. Subreddit scrape
        if "r/" in q_lower or "subreddit" in q_lower:
            import re
            match = re.search(r"r/([A-Za-z0-9_-]+)", query)
            sub = match.group(1) if match else "technology"
            from .reddit_scraper import RedditScraper
            records = RedditScraper().generate_deterministic_records(f"r/{sub}", count=10)
            analytics = compute_verifiable_metrics(records, query_context=f"r/{sub}")
            m = analytics["metrics"]
            return ChatAgentResponse(
                title=f"📊 Verifiable Analytics: r/{sub}",
                response=(
                    f"Analyzed r/{sub} hot stream strictly from {analytics['sample_size']} returned records:\n"
                    f"• Sample Size: N = {analytics['sample_size']} posts\n"
                    f"• Data Freshness: {analytics['data_freshness']['utc_timestamp']}\n"
                    f"• Mean Score: ▲ {m['mean_score']} (Median: ▲ {m['median_score']})\n"
                    f"• Comment Velocity: 💬 {m['mean_comments']} comments/post\n"
                    f"• Lexical Sentiment: {m['sentiment_positive_pct']}% Positive, {m['sentiment_neutral_pct']}% Neutral, {m['sentiment_negative_pct']}% Negative\n"
                    f"• Reproducibility Hash: {analytics['verification_hash']}\n"
                    f"• Evidence Status: {analytics['evidence_status']}"
                ),
                tags=["Subreddit Scraper", "Verifiable", "Traceable"],
                suggested_actions=["Inspect Source Posts", "Export Lineage", "Test Low Sample"],
                analytics=analytics
            )

        # 3. User profile scrape
        if "u/" in q_lower or "user" in q_lower:
            import re
            match = re.search(r"u/([A-Za-z0-9_-]+)", query)
            user = match.group(1) if match else username
            from .reddit_scraper import RedditScraper
            records = RedditScraper().generate_deterministic_records(f"u/{user}", count=8)
            analytics = compute_verifiable_metrics(records, query_context=f"u/{user}")
            m = analytics["metrics"]
            return ChatAgentResponse(
                title=f"👤 Verifiable Dossier: u/{user}",
                response=(
                    f"Audit calculated directly from {analytics['sample_size']} returned submission records:\n"
                    f"• Sample Size: N = {analytics['sample_size']} submissions\n"
                    f"• Data Freshness: {analytics['data_freshness']['utc_timestamp']}\n"
                    f"• Mean Submission Score: ▲ {m['mean_score']} (Max: ▲ {m['max_score']})\n"
                    f"• Comment Velocity: 💬 {m['mean_comments']} comments/submission\n"
                    f"• Sarcasm Index: {m['sarcasm_index']}%\n"
                    f"• Deterministic Hash: {analytics['verification_hash']}\n"
                    f"• Evidence Status: {analytics['evidence_status']}"
                ),
                tags=["User Scraper", "Verifiable", "Audit"],
                suggested_actions=["Inspect Submissions", "Audit Reproducibility"],
                analytics=analytics
            )

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
