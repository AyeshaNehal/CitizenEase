# CitizenEase

> **A Karachi citizen preparation and guidance layer for government services (Domicile / PRC & first-time CNIC).**
> Built as a 7-day hackathon MVP for Karachi, Sindh.

---

## 📌 One-Line Pitch
CitizenEase tells a Karachi citizen exactly what to bring, what is still missing, and where to go before they queue, in Urdu or English, without pretending to be the government.

### What it is
A preparation and guidance layer.

### What it is NOT
An application submitter, a legal authority, or a data store for CNICs / personal identity.

---

## 🏛️ Core Principles
1. **Deterministic rules decide requirements.** The LLM never decides requirements or legal eligibility.
2. **Every fact shows its source, status, and verification date.**
3. **Unknown means "confirm with the office", never a guess.**
4. **No sensitive personal data:** no CNIC numbers, scans, or names are ever collected or stored.
5. **One connected journey:** Landing → Discovery / Service → Questionnaire → Checklist (+ Readiness score) → Assistant / Office locator.

---

## 📂 Monorepo Structure

```text
citizenease/
├─ README.md                # Project documentation and roadmap
├─ .gitignore              # Monorepo ignore rules
├─ .env.example            # Backend and frontend environment variables template
├─ docs/                   # Sources log, API contract, and architecture decisions
│  ├─ api_contract.md
│  ├─ sources_log.md
│  └─ decisions.md
├─ data/                   # Seed data and test suites
│  ├─ seed/                # Source-of-truth JSON files
│  │  ├─ services.json
│  │  ├─ questions.json
│  │  ├─ requirements.json
│  │  ├─ rules.json
│  │  ├─ sources.json
│  │  ├─ offices.json
│  │  └─ faq.json
│  └─ test_cases/          # Evaluation and red-team datasets
│     ├─ checklist_cases.yaml
│     └─ assistant_redteam.yaml
├─ backend/                # Modular monolith FastAPI backend
│  ├─ app/
│  │  ├─ main.py           # FastAPI application entrypoint with CORS & error handling
│  │  ├─ config.py         # Settings & environment validation
│  │  ├─ schemas/          # Pydantic models (API contract)
│  │  ├─ modules/          # Pure business logic modules
│  │  │  ├─ catalog/       # Read-only services, fees, offices, sources
│  │  │  ├─ questionnaire/ # Step-by-step conditional question evaluator
│  │  │  ├─ rules/         # Pure Python rules interpreter (zero DB/AI dependencies)
│  │  │  ├─ checklist/     # Checklist assembler from rules evaluation
│  │  │  ├─ readiness/     # Verified readiness score calculation
│  │  │  └─ assistant/     # Grounded RAG + guardrails + JSON structured output
│  │  ├─ routers/          # Thin API route controllers
│  │  │  ├─ services.py
│  │  │  ├─ questionnaire.py
│  │  │  ├─ checklist.py
│  │  │  ├─ assistant.py
│  │  │  ├─ offices.py
│  │  │  ├─ fees.py
│  │  │  ├─ sources.py
│  │  │  └─ discover.py
│  │  └─ db/               # Supabase/PostgreSQL connection and migration scripts
│  ├─ scripts/             # Data seeding and validation tools
│  │  ├─ seed.py
│  │  └─ check_sources_stale.py
│  └─ tests/               # Pytest suite (pure rules, readiness, guardrails, API)
└─ frontend/               # Next.js 14 App Router, TypeScript & Tailwind CSS
   ├─ src/
   │  ├─ app/              # Routes: /, /services, /services/[slug], /questionnaire, /checklist/[id], /offices, /sources
   │  ├─ components/       # UI components (ui/, checklist/, questionnaire/, assistant/, map/)
   │  └─ lib/              # API client, TypeScript definitions, i18n (en/ur), and mocks
   └─ public/              # Public assets and fonts
```

---

## 🚀 Quickstart

### Backend (FastAPI + Python 3.10+)
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\Activate.ps1
# Or without activating the environment:
# .\venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
# On Linux/macOS:
# source venv/bin/activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```
Open [http://localhost:8000/docs](http://localhost:8000/docs) for the interactive Swagger documentation.

### Frontend (Next.js 14 + Tailwind)
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.
