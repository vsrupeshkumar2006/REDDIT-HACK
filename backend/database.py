"""
ONLYSONS Persistent SQLite Task Database & Fintech Ledger
Built by Eshwar Karthik, Prashanth, and Rupesh Kumar

Provides persistent tracking of:
 - Systematic Task & User History with SHA-256 Cryptographic Verification
 - Fintech & GPU/Cloud Billing Audits (Lambda, CoreWeave, Nebius, K8s)
 - Circular Multi-Agent Memory & Prioritized Context
 - Provably Fair Cryptographic Hashes & Statistical Ledgers
"""

import sqlite3
import json
import time
import hashlib
from typing import List, Dict, Any, Optional

DB_FILE = "onlysons_ledger.db"

def get_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    # 1. User & Task History
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS task_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_id TEXT NOT NULL,
        task_name TEXT NOT NULL,
        category TEXT NOT NULL,
        points_earned INTEGER NOT NULL,
        details_json TEXT,
        verification_hash TEXT NOT NULL,
        timestamp REAL NOT NULL
    );
    """)

    # 2. Fintech & Cloud Billing Invoices
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS fintech_audits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        audit_id TEXT UNIQUE NOT NULL,
        provider TEXT NOT NULL,
        invoice_amount REAL NOT NULL,
        flagged_amount REAL NOT NULL,
        rules_checked INTEGER NOT NULL,
        findings_json TEXT,
        status TEXT NOT NULL,
        timestamp REAL NOT NULL
    );
    """)

    # 3. Agent Memory Store (Prioritized Memory Stream)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS agent_memory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        agent_id TEXT NOT NULL,
        agent_name TEXT NOT NULL,
        role TEXT NOT NULL,
        memory_key TEXT NOT NULL,
        memory_val TEXT NOT NULL,
        priority INTEGER DEFAULT 1,
        timestamp REAL NOT NULL
    );
    """)

    # 4. Provably Fair Seeds & Hashes
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS provably_fair_ledger (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        game_id TEXT NOT NULL,
        server_seed TEXT NOT NULL,
        client_seed TEXT NOT NULL,
        nonce INTEGER NOT NULL,
        outcome_result TEXT NOT NULL,
        proof_hash TEXT NOT NULL,
        timestamp REAL NOT NULL
    );
    """)

    # 5. Undercover Spy Campaign Progress ("Dhurandhar" Indian Spy Narrative)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS spy_campaign_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        act_number INTEGER NOT NULL,
        mission_title TEXT NOT NULL,
        status TEXT NOT NULL,
        family_trust INTEGER NOT NULL,
        syndicate_suspicion INTEGER NOT NULL,
        agency_rating INTEGER NOT NULL,
        choice_index INTEGER DEFAULT 0,
        timestamp REAL NOT NULL
    );
    """)

    # 6. Social Media Reels & Reddit Interactions
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS social_media_interactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_id TEXT NOT NULL,
        item_type TEXT NOT NULL,
        action TEXT NOT NULL,
        karma_awarded INTEGER NOT NULL,
        timestamp REAL NOT NULL
    );
    """)

    # 7. Character Customization & Photo Avatar
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS character_customization (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        archetype TEXT NOT NULL,
        custom_photo_url TEXT,
        paint_color TEXT,
        timestamp REAL NOT NULL
    );
    """)

    conn.commit()
    conn.close()

# Initialize on module import
init_db()

class DatabaseManager:
    @staticmethod
    def log_task(task_id: str, task_name: str, category: str, points: int, details: dict) -> Dict[str, Any]:
        conn = get_connection()
        cursor = conn.cursor()
        now = time.time()
        raw_proof = f"{task_id}:{category}:{points}:{now}"
        proof_hash = hashlib.sha256(raw_proof.encode('utf-8')).hexdigest()

        cursor.execute("""
            INSERT INTO task_history (task_id, task_name, category, points_earned, details_json, verification_hash, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (task_id, task_name, category, points, json.dumps(details), proof_hash, now))

        inserted_id = cursor.lastrowid
        conn.commit()
        conn.close()

        return {
            "id": inserted_id,
            "task_id": task_id,
            "task_name": task_name,
            "category": category,
            "points_earned": points,
            "verification_hash": proof_hash,
            "timestamp": now
        }

    @staticmethod
    def get_task_history(limit: int = 50) -> List[Dict[str, Any]]:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, task_id, task_name, category, points_earned, details_json, verification_hash, timestamp
            FROM task_history ORDER BY id DESC LIMIT ?
        """, (limit,))
        rows = cursor.fetchall()
        conn.close()

        res = []
        for r in rows:
            res.append({
                "id": r["id"],
                "task_id": r["task_id"],
                "task_name": r["task_name"],
                "category": r["category"],
                "points_earned": r["points_earned"],
                "details": json.loads(r["details_json"] or "{}"),
                "verification_hash": r["verification_hash"],
                "timestamp": r["timestamp"]
            })
        return res

    @staticmethod
    def log_fintech_audit(audit_id: str, provider: str, invoice_amount: float, flagged_amount: float, rules_checked: int, findings: List[str], status: str = "verified") -> Dict[str, Any]:
        conn = get_connection()
        cursor = conn.cursor()
        now = time.time()
        cursor.execute("""
            INSERT OR REPLACE INTO fintech_audits (audit_id, provider, invoice_amount, flagged_amount, rules_checked, findings_json, status, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (audit_id, provider, invoice_amount, flagged_amount, rules_checked, json.dumps(findings), status, now))
        conn.commit()
        conn.close()

        return {
            "audit_id": audit_id,
            "provider": provider,
            "invoice_amount": invoice_amount,
            "flagged_amount": flagged_amount,
            "rules_checked": rules_checked,
            "findings": findings,
            "status": status,
            "timestamp": now
        }

    @staticmethod
    def get_fintech_audits() -> List[Dict[str, Any]]:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM fintech_audits ORDER BY id DESC LIMIT 20")
        rows = cursor.fetchall()
        conn.close()
        return [
            {
                "audit_id": r["audit_id"],
                "provider": r["provider"],
                "invoice_amount": r["invoice_amount"],
                "flagged_amount": r["flagged_amount"],
                "rules_checked": r["rules_checked"],
                "findings": json.loads(r["findings_json"] or "[]"),
                "status": r["status"],
                "timestamp": r["timestamp"]
            } for r in rows
        ]

    @staticmethod
    def save_agent_memory(agent_id: str, agent_name: str, role: str, key: str, val: str, priority: int = 1):
        conn = get_connection()
        cursor = conn.cursor()
        now = time.time()
        cursor.execute("""
            INSERT INTO agent_memory (agent_id, agent_name, role, memory_key, memory_val, priority, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (agent_id, agent_name, role, key, val, priority, now))
        conn.commit()
        conn.close()

    @staticmethod
    def get_agent_memory(agent_id: Optional[str] = None) -> List[Dict[str, Any]]:
        conn = get_connection()
        cursor = conn.cursor()
        if agent_id:
            cursor.execute("SELECT * FROM agent_memory WHERE agent_id = ? ORDER BY priority DESC, id DESC LIMIT 25", (agent_id,))
        else:
            cursor.execute("SELECT * FROM agent_memory ORDER BY priority DESC, id DESC LIMIT 50")
        rows = cursor.fetchall()
        conn.close()
        return [
            {
                "id": r["id"],
                "agent_id": r["agent_id"],
                "agent_name": r["agent_name"],
                "role": r["role"],
                "key": r["memory_key"],
                "val": r["memory_val"],
                "priority": r["priority"],
                "timestamp": r["timestamp"]
            } for r in rows
        ]

    @staticmethod
    def log_provably_fair(game_id: str, server_seed: str, client_seed: str, nonce: int, result: str) -> Dict[str, Any]:
        conn = get_connection()
        cursor = conn.cursor()
        now = time.time()
        combined = f"{server_seed}:{client_seed}:{nonce}:{result}"
        proof_hash = hashlib.sha256(combined.encode('utf-8')).hexdigest()

        cursor.execute("""
            INSERT INTO provably_fair_ledger (game_id, server_seed, client_seed, nonce, outcome_result, proof_hash, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (game_id, server_seed, client_seed, nonce, result, proof_hash, now))
        conn.commit()
        conn.close()

        return {
            "game_id": game_id,
            "server_seed": server_seed,
            "client_seed": client_seed,
            "nonce": nonce,
            "result": result,
            "proof_hash": proof_hash,
            "timestamp": now
        }

    @staticmethod
    def get_spy_campaign() -> Dict[str, Any]:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM spy_campaign_progress ORDER BY id DESC LIMIT 1")
        row = cursor.fetchone()
        conn.close()
        if not row:
            return {
                "act_number": 1,
                "mission_title": "Act I: The Midnight Sprint",
                "status": "active",
                "family_trust": 85,
                "syndicate_suspicion": 15,
                "agency_rating": 80,
                "choice_index": 0
            }
        return {
            "act_number": row["act_number"],
            "mission_title": row["mission_title"],
            "status": row["status"],
            "family_trust": row["family_trust"],
            "syndicate_suspicion": row["syndicate_suspicion"],
            "agency_rating": row["agency_rating"],
            "choice_index": row["choice_index"]
        }

    @staticmethod
    def advance_spy_campaign(act_number: int, mission_title: str, family_trust: int, syndicate_suspicion: int, agency_rating: int, choice_index: int = 0) -> Dict[str, Any]:
        conn = get_connection()
        cursor = conn.cursor()
        now = time.time()
        cursor.execute("""
            INSERT INTO spy_campaign_progress (act_number, mission_title, status, family_trust, syndicate_suspicion, agency_rating, choice_index, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (act_number, mission_title, "completed", family_trust, syndicate_suspicion, agency_rating, choice_index, now))
        conn.commit()
        conn.close()
        return {
            "act_number": act_number,
            "mission_title": mission_title,
            "family_trust": family_trust,
            "syndicate_suspicion": syndicate_suspicion,
            "agency_rating": agency_rating,
            "status": "completed",
            "timestamp": now
        }

    @staticmethod
    def log_social_interaction(item_id: str, item_type: str, action: str, karma_awarded: int) -> Dict[str, Any]:
        conn = get_connection()
        cursor = conn.cursor()
        now = time.time()
        cursor.execute("""
            INSERT INTO social_media_interactions (item_id, item_type, action, karma_awarded, timestamp)
            VALUES (?, ?, ?, ?, ?)
        """, (item_id, item_type, action, karma_awarded, now))
        conn.commit()
        conn.close()
        return {
            "item_id": item_id,
            "item_type": item_type,
            "action": action,
            "karma_awarded": karma_awarded,
            "timestamp": now
        }

    @staticmethod
    def save_character_customization(archetype: str, custom_photo_url: str = None, paint_color: str = "#d91e18") -> Dict[str, Any]:
        conn = get_connection()
        cursor = conn.cursor()
        now = time.time()
        cursor.execute("""
            INSERT INTO character_customization (archetype, custom_photo_url, paint_color, timestamp)
            VALUES (?, ?, ?, ?)
        """, (archetype, custom_photo_url, paint_color, now))
        conn.commit()
        conn.close()
        return {
            "archetype": archetype,
            "custom_photo_url": custom_photo_url,
            "paint_color": paint_color,
            "timestamp": now
        }

    @staticmethod
    def get_character_customization() -> Dict[str, Any]:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM character_customization ORDER BY id DESC LIMIT 1")
        row = cursor.fetchone()
        conn.close()
        if not row:
            return {
                "archetype": "human",
                "custom_photo_url": None,
                "paint_color": "#d91e18"
            }
        return {
            "archetype": row["archetype"],
            "custom_photo_url": row["custom_photo_url"],
            "paint_color": row["paint_color"]
        }
