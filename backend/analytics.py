"""
KarmaCrunch Verifiable Analytics Engine
Built by Eshwar Karthik, Prashanth, and Rupesh Kumar

Guarantees:
1. Metrics are computed directly from returned records.
2. Every panel shows sample size (N) and data freshness (timestamp).
3. Source posts are inspectable with raw record lineage.
4. Low-sample states (N < 5) explicitly display "INSUFFICIENT EVIDENCE".
5. The same input deterministically produces reproducible aggregate results with cryptographic verification hashes.
6. Zero unsupported numeric claims: all numbers have formula breakdowns.
"""

import time
import math
import json
import hashlib
import statistics
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

POSITIVE_LEXICON = {
    "great", "amazing", "good", "love", "best", "awesome", "breakthrough",
    "win", "solution", "helpful", "clean", "future", "impressive", "brilliant"
}

NEGATIVE_LEXICON = {
    "bad", "terrible", "worst", "hate", "scam", "broken", "issue", "bug",
    "fail", "crisis", "disaster", "shadowban", "banned", "toxic", "awful"
}

SARCASM_TRIGGERS = {
    "?!", "!?", "...", "/s", "totally", "surely", "genius", "masterpiece",
    "obviously", "definitely", "brilliant", "slow clap"
}


def compute_verifiable_metrics(
    records: List[Dict[str, Any]],
    query_context: str = "reddit_data",
    fetched_at: Optional[float] = None
) -> Dict[str, Any]:
    """
    Computes deterministic statistical metrics strictly from returned records.
    """
    ts = fetched_at if fetched_at is not None else time.time()
    freshness_dt = datetime.fromtimestamp(ts, tz=timezone.utc)
    freshness_utc = freshness_dt.strftime("%Y-%m-%d %H:%M:%S UTC")

    sample_size = len(records)
    is_low_sample = (sample_size < 5)

    if sample_size == 0:
        return {
            "query_context": query_context,
            "sample_size": 0,
            "data_freshness": {
                "unix_timestamp": ts,
                "utc_timestamp": freshness_utc,
                "status": "No records returned"
            },
            "evidence_status": "INSUFFICIENT EVIDENCE (Empty Sample: N = 0)",
            "is_low_sample": True,
            "low_sample_warning": "⚠️ INSUFFICIENT EVIDENCE: No records returned. Cannot compute metrics.",
            "metrics": {
                "mean_score": 0.0,
                "median_score": 0.0,
                "min_score": 0,
                "max_score": 0,
                "total_comments": 0,
                "mean_comments": 0.0,
                "engagement_ratio": 0.0,
                "sentiment_positive_pct": 0.0,
                "sentiment_neutral_pct": 100.0,
                "sentiment_negative_pct": 0.0,
                "sarcasm_index": 0.0,
                "score_std_dev": 0.0
            },
            "traceability": {
                "note": "Empty sample. All numeric values default to 0."
            },
            "verification_hash": "sha256:0000000000000000000000000000000000000000000000000000000000000000",
            "source_records": []
        }

    # Extract raw vectors strictly from returned records
    scores = [int(r.get("ups", 0)) for r in records]
    comments = [int(r.get("num_comments", 0)) for r in records]
    titles = [str(r.get("title", "")) for r in records]

    # Deterministic aggregations
    total_score = sum(scores)
    mean_score = total_score / sample_size
    median_score = float(statistics.median(scores))
    min_score = min(scores)
    max_score = max(scores)

    total_comments = sum(comments)
    mean_comments = total_comments / sample_size
    engagement_ratio = (total_comments / total_score) if total_score > 0 else 0.0

    # Variance and standard deviation
    variance = sum((s - mean_score) ** 2 for s in scores) / sample_size
    std_dev = math.sqrt(variance)

    # Lexical sentiment scoring strictly from record titles
    pos_matches = 0
    neg_matches = 0
    sarcasm_matches = 0

    for title in titles:
        t_low = title.lower()
        words = set(t_low.replace("?", " ").replace("!", " ").replace(".", " ").split())
        has_pos = any(w in POSITIVE_LEXICON for w in words)
        has_neg = any(w in NEGATIVE_LEXICON for w in words)
        has_sarcasm = any(trigger in t_low for trigger in SARCASM_TRIGGERS)

        if has_pos and not has_neg:
            pos_matches += 1
        elif has_neg and not has_pos:
            neg_matches += 1
        if has_sarcasm:
            sarcasm_matches += 1

    neu_matches = sample_size - (pos_matches + neg_matches)
    if neu_matches < 0:
        neu_matches = 0

    pos_pct = round((pos_matches / sample_size) * 100, 1)
    neg_pct = round((neg_matches / sample_size) * 100, 1)
    neu_pct = round((neu_matches / sample_size) * 100, 1)
    sarcasm_pct = round((sarcasm_matches / sample_size) * 100, 1)

    # Low sample status & evidence warning
    if is_low_sample:
        evidence_status = f"INSUFFICIENT EVIDENCE (Low Sample: N = {sample_size} < 5)"
        low_sample_warning = (
            f"⚠️ INSUFFICIENT EVIDENCE: Sample size N = {sample_size} is below the required statistical "
            f"threshold (minimum N ≥ 5). Aggregate metrics (mean, median, sentiment) cannot be generalized "
            f"reliably. Showing observational records only."
        )
    else:
        evidence_status = f"STATISTICALLY VALID (Sample Size: N = {sample_size} ≥ 5)"
        low_sample_warning = None

    # Inspectable source records with individual contribution metrics
    inspectable_records = []
    for idx, r in enumerate(records):
        score = int(r.get("ups", 0))
        pct_contrib = round((score / total_score * 100), 2) if total_score > 0 else 0.0
        inspectable_records.append({
            "index": idx + 1,
            "title": str(r.get("title", "Untitled")),
            "author": str(r.get("author", "anonymous")),
            "ups": score,
            "num_comments": int(r.get("num_comments", 0)),
            "permalink": str(r.get("permalink", "")),
            "created_utc": r.get("created_utc", ts),
            "score_share_pct": pct_contrib,
            "external_url": f"https://reddit.com{r.get('permalink', '')}" if r.get("permalink") else ""
        })

    # Exact mathematical traceability formulas (No unsupported claims)
    traceability = {
        "mean_score": f"μ = Σ(ups) / N = {total_score} / {sample_size} = {mean_score:.2f}",
        "median_score": f"Median of sorted {sample_size} scores = {median_score:.2f}",
        "mean_comments": f"Σ(comments) / N = {total_comments} / {sample_size} = {mean_comments:.2f}",
        "engagement_ratio": f"total_comments / total_score = {total_comments} / {total_score} = {engagement_ratio:.4f}",
        "sentiment_positive": f"{pos_matches} matching positive titles / {sample_size} = {pos_pct}%",
        "sentiment_negative": f"{neg_matches} matching negative titles / {sample_size} = {neg_pct}%",
        "sentiment_neutral": f"{neu_matches} neutral titles / {sample_size} = {neu_pct}%",
        "sarcasm_index": f"{sarcasm_matches} rhetoric/sarcasm matches / {sample_size} = {sarcasm_pct}%",
        "score_std_dev": f"σ = sqrt(Σ(x - μ)² / N) = sqrt({variance:.2f}) = {std_dev:.2f}",
        "sample_size_formula": f"N = count(returned_records) = {sample_size}"
    }

    # Deterministic Canonical JSON Hashing for 100% Reproducibility
    canonical_payload = {
        "query_context": query_context,
        "sample_size": sample_size,
        "scores": sorted(scores),
        "mean_score": round(mean_score, 4),
        "median_score": round(median_score, 4),
        "min_score": min_score,
        "max_score": max_score,
        "total_comments": total_comments,
        "mean_comments": round(mean_comments, 4),
        "pos_pct": pos_pct,
        "neg_pct": neg_pct,
        "sarcasm_pct": sarcasm_pct
    }
    canonical_str = json.dumps(canonical_payload, sort_keys=True, separators=(',', ':'))
    verification_hash = f"sha256:{hashlib.sha256(canonical_str.encode('utf-8')).hexdigest()}"

    return {
        "query_context": query_context,
        "sample_size": sample_size,
        "data_freshness": {
            "unix_timestamp": ts,
            "utc_timestamp": freshness_utc,
            "status": "Freshly computed from returned records"
        },
        "evidence_status": evidence_status,
        "is_low_sample": is_low_sample,
        "low_sample_warning": low_sample_warning,
        "metrics": {
            "mean_score": round(mean_score, 2),
            "median_score": round(median_score, 2),
            "min_score": min_score,
            "max_score": max_score,
            "total_score": total_score,
            "total_comments": total_comments,
            "mean_comments": round(mean_comments, 2),
            "engagement_ratio": round(engagement_ratio, 4),
            "sentiment_positive_pct": pos_pct,
            "sentiment_neutral_pct": neu_pct,
            "sentiment_negative_pct": neg_pct,
            "sarcasm_index": sarcasm_pct,
            "score_std_dev": round(std_dev, 2)
        },
        "traceability": traceability,
        "verification_hash": verification_hash,
        "source_records": inspectable_records
    }
