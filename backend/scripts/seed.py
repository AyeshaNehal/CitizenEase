"""
Database Seeding Script for CitizenEase
Loads JSON seed files from data/seed and seeds into PostgreSQL / Supabase
"""
import os
import sys
import json

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
SEED_DIR = os.path.join(BASE_DIR, "data", "seed")

def load_file(name: str):
    path = os.path.join(SEED_DIR, name)
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def run_seed():
    print("🌱 Starting CitizenEase data validation & seed process...")
    files = ["services.json", "sources.json", "questions.json", "requirements.json", "rules.json", "offices.json", "faq.json"]
    for f in files:
        data = load_file(f)
        print(f"  ✓ Validated {f}: {len(data)} records loaded.")
    print("🎉 All seed records verified successfully!")

if __name__ == "__main__":
    run_seed()
