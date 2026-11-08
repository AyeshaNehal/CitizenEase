"""
Stale Sources Audit Script
Checks if any sources in data/seed/sources.json exceed the 90-day verification threshold.
"""
import os
import json
from datetime import datetime, date

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
SOURCES_PATH = os.path.join(BASE_DIR, "data", "seed", "sources.json")

def check_stale_sources(days_threshold: int = 90):
    with open(SOURCES_PATH, "r", encoding="utf-8") as f:
        sources = json.load(f)

    today = date.today()
    stale_sources = []

    print(f"🔍 Auditing {len(sources)} sources against {days_threshold}-day threshold...")
    for src in sources:
        ver_date_str = src.get("last_verified_on")
        if not ver_date_str:
            stale_sources.append((src["id"], "No verification date"))
            continue
        ver_date = datetime.strptime(ver_date_str, "%Y-%m-%d").date()
        age = (today - ver_date).days
        if age > days_threshold:
            stale_sources.append((src["id"], f"{age} days old"))

    if stale_sources:
        print(f"⚠️ Found {len(stale_sources)} stale or unverified sources:")
        for s_id, reason in stale_sources:
            print(f"  - {s_id}: {reason}")
    else:
        print("✅ All sources are fresh and within the verification window.")

if __name__ == "__main__":
    check_stale_sources()
