# CitizenEase

> **A Karachi citizen preparation and guidance platform for government civil services.**
> Tells a Karachi citizen exactly what to bring, what is still missing, what fees are verified, and where to go before they queue — in English or Urdu (Nastaliq) — without pretending to be the government.

---

## 📌 Core Overview

### What it is
A deterministic preparation, readiness scoring, fee calculation, and guidance platform for Karachi citizens navigating civil procedures across Deputy Commissioner offices, NADRA registration centres, Passport offices, and Union Councils.

### What it is NOT
An application submitter, a legal authority, a fee processor, or a data store for personal identification. No CNICs, scans, or citizen names are ever collected or stored.

---

## 🏛️ Core Principles & Non-Negotiables
1. **Deterministic rules decide requirements:** The AI assistant never decides legal requirements or eligibility. Rules are evaluated purely in deterministic code.
2. **Every fact shows its source and verification date:** Every requirement, fee, and office timing cites its official gazette, court judgment, or field notice board.
3. **Unknown means "confirm with the office":** If a fee or requirement is not verified by official sources, it is marked unverified with an explicit confirmation note; the system never guesses.
4. **Zero Sensitive PII:** 13-digit Pakistani CNICs are automatically detected and redacted (`[REDACTED_CNIC]`).
5. **One connected tabbed journey:** Accessible tab navigation across Services, Checklist, Cost Calculator, Karachi Offices, AI Guide, and Legal Provenance Ledger.

---

## 📋 Supported Civil Services (All 7 Data-Driven)

All service requirements, questions, rules, and fees are defined as structured data in `data/seed/`:

| # | Service | Issuing Authority | Prerequisite ("Do this first") |
|---|---|---|---|
| 1 | **Birth Certificate** | Union Council / Town Municipal Corp (TMC) | *Root civil document (No prerequisite)* |
| 2 | **B-Form / Child Registration Certificate (CRC)** | NADRA | **Union Council Birth Certificate** |
| 3 | **First-Time Adult CNIC (Age 18)** | NADRA | **NADRA B-Form / CRC** |
| 4 | **Smart CNIC / SNIC (Chip Card)** | NADRA | **First-Time CNIC or B-Form Record** |
| 5 | **Machine Readable Passport (MRP / e-Passport)** | DGI&P / Ministry of Interior | **Valid CNIC / Smart Card (or B-Form for minors)** |
| 6 | **Family Registration Certificate (FRC)** | NADRA (By Birth / By Marriage) | **Valid CNICs for all adult family members** |
| 7 | **Domicile & PRC (Karachi Districts)** | Relevant District Deputy Commissioner (DC) Office | **Valid CNIC / Smart Card (or B-Form for minors)** |

---

## 💰 Official Fee & Cost Calculator

Enforces strict verification and presentation rules:
- **Verified Sum Only:** Sums only fees backed by an official schedule with non-null amounts.
- **Unconfirmed Block:** Lists unverified or variable fees in a separate *"Not yet confirmed"* section labeled **"Confirm with office"**.
- **Partial Total Labeling:** If any applicable fee is unverified, displays `"At least Rs X (verified fees only)"` and never claims to be a final quote.
- **No-Verified-Fee Fallback:** If zero verified fees exist (e.g. Birth Certificate or Domicile challans), displays `"No verified fees yet. Confirm with the office"` with **no number**.
- **Interactive Options:** Real-time calculation for Passport options (36/72/100 pages, 5 vs 10 year validity, Normal vs Urgent), Smart Card delivery tiers, and B-Form tracks.
- **API Endpoints:**
  - `GET /api/v1/costs/{service_slug}`: Retrieves fee schedule and option conditions for a service.
  - `POST /api/v1/costs/estimate`: Calculates combined verified estimates and unconfirmed blocks.

---

## 🛡️ AI Assistant Guardrails (§7, §15)

- **Strict Zero-PII Regex Redaction:** Automatically detects 13-digit Pakistani CNIC patterns (`XXXXX-XXXXXXX-X`) and replaces them with `[REDACTED_CNIC]`.
- **Max Message Length Validation:** Enforces a maximum input length of $\le 500$ characters (`400 Bad Request`).
- **Per-Session Rate Limiting:** Enforces a strict ceiling of max 20 messages per session (`429 Too Many Requests`).
- **Fee Guardrail:** Never hallucinates unofficial fee numbers. Fee inquiries return: *"Fee not verified; confirm with the office"*.
- **No Guarantee Guardrail:** Refuses requests for legal guarantees, approvals, or shortcuts.

---

## 🖥️ User Interface & Accessibility

- **Tabbed Architecture:** 
  - `Services` (#services) — Selectable cards with "Do this first" prerequisite alerts.
  - `My Checklist` (#checklist) — Interactive readiness gauge ring, grouped requirements (Verified Mandatory, Conditional, Confirm with Office), with empty state handling.
  - `Cost Calculator` (#cost) — Real-time options selector and verified fee breakdown.
  - `Offices` (#offices) — Karachi DC, NADRA Mega, and Union Council office locator with district filtering.
  - `Assistant` (#assistant) — Grounded citizen preparation assistant.
  - `Sources` (#sources) — Legal provenance ledger with 90-day staleness auditing.
- **Deep Linking:** Bidirectional plain `#hash` sync (`#services`, `#checklist`, `#cost`, `#offices`, `#assistant`, `#sources`).
- **Persistence:** Tab selection, answers, and dark/light mode persist across reloads via `localStorage` (no PII).
- **Accessibility:** Full WAI-ARIA `role="tablist"`, `role="tab"`, `role="tabpanel"`, arrow-key navigation (`ArrowRight`, `ArrowLeft`, `Home`, `End`), min 44px touch targets.
- **Bilingual & Dark Mode:** English (LTR) and Urdu Nastaliq (RTL) with logical CSS (`ms-`, `me-`, `ps-`, `pe-`).

---

## 📂 Repository Structure

```text
CitizenEase/
├── docker-compose.yml              # Production multi-container stack (Postgres 16, Backend, Frontend)
├── backend/
│   ├── Dockerfile                  # Multi-stage Python 3.11-slim container
│   ├── requirements.txt            # FastAPI, Uvicorn, SQLAlchemy, Psycopg, Pytest
│   ├── app/
│   │   ├── main.py                 # FastAPI application, CORS, error handlers, and routers
│   │   ├── config.py               # Pydantic BaseSettings (.env loading)
│   │   ├── db/
│   │   │   └── storage.py          # SQLAlchemy persistence (SQLite/PostgreSQL fallback)
│   │   ├── modules/
│   │   │   ├── catalog/            # Data-driven loader for services, offices, sources
│   │   │   ├── questionnaire/      # Conditional branching questionnaire engine
│   │   │   ├── rules/              # Pure Python eligibility rules engine (eq/neq/in)
│   │   │   ├── checklist/          # Dynamic checklist generator with database sync
│   │   │   ├── readiness/          # Verified readiness score calculator (null if total=0)
│   │   │   ├── costs/              # Cost calculator service (verified sums & unconfirmed blocks)
│   │   │   └── assistant/          # Redaction, message caps, rate limits, grounded guidance
│   │   └── routers/                # services, questionnaire, checklist, costs, assistant, offices, sources
│   └── tests/
│       ├── test_rules.py           # Pure rules evaluation, priority, district specificity, null score
│       ├── test_readiness.py       # Readiness formula and zero-verified denominator handling
│       ├── test_assistant_guardrails.py # PII redaction, 500-char cap, 20-message session rate limit
│       └── test_api.py             # End-to-end service flows, costs calculator, staleness audits
├── data/
│   └── seed/
│       ├── services.json           # All 7 civil services and prerequisite definitions
│       ├── questions.json          # Conditional branching questions
│       ├── requirements.json       # Document & step requirements with shared references
│       ├── rules.json              # Eligibility rules with eq/neq/in conditions
│       ├── fees.json               # Data-driven fee schedules with amounts, sources, conditions
│       ├── sources.json            # Official legal sources, gazettes, and notice boards
│       ├── offices.json            # Karachi DC offices, NADRA Mega Centres, RPOs, UC offices
│       └── faq.json                # Verified answers to common citizen questions
└── frontend/
    ├── Dockerfile                  # Multi-stage Node 20-alpine container with standalone runner
    ├── package.json                # Next.js 14, React 18, Tailwind CSS, Lucide icons
    └── src/
        ├── app/
        │   ├── page.tsx            # Unified Tabbed UI (#services, #checklist, #cost, #offices, #assistant, #sources)
        │   ├── layout.tsx          # Root layout with fonts & metadata
        │   └── globals.css         # Tailwind & RTL Nastaliq typography styles
        ├── components/
        │   ├── CostCalculator.tsx  # Dynamic fee calculator with verified totals & unconfirmed blocks
        │   ├── ServiceDiscovery.tsx# 7 service cards with "Do this first" prerequisite alerts
        │   ├── ChecklistHub.tsx    # Interactive checklist and readiness gauge ring
        │   ├── QuestionnaireModal.tsx # Step-by-step assessment modal
        │   ├── OfficeLocator.tsx   # Karachi offices directory with district filters
        │   ├── AssistantPanel.tsx  # Grounded citizen AI assistant
        │   └── SourcesLedger.tsx   # Verified sources and provenance ledger
        ├── data/
        │   └── catalog.ts          # Strongly typed client-side catalog definitions
        └── lib/
            ├── rulesEngine.ts      # Pure client-side rules interpreter & readiness calculator
            ├── i18n.ts             # Complete English and Urdu dictionary
            └── api.ts              # Type-safe API client
```

---

## 🚀 Running the Project

### Prerequisites
- Python 3.10+ (Tested on Python 3.11 & 3.14)
- Node.js 18+ (Node 20 Recommended)

### 1. Backend Setup
```bash
# From repository root
pip install -r backend/requirements.txt

# Run FastAPI backend
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
- Interactive Swagger API Documentation: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Health Check: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

### 2. Frontend Setup
```bash
# In a separate terminal
cd frontend
npm install
npm run dev
```
- Web Application: [http://localhost:3000](http://localhost:3000)

### 3. Docker Deployment (Single Command)
```bash
# Starts PostgreSQL 16, FastAPI backend, and Next.js frontend
docker compose up --build
```

---

## 🧪 Running Tests

Run the full backend test suite:
```bash
python -m pytest backend/tests
```
**Results:** `24 passed, 0 failures`
- Tests deterministic rules evaluation (`test_rules.py`)
- Tests zero-verified mandatory items yielding `score is None` (`test_readiness.py`, `test_api.py`)
- Tests assistant guardrails, 500-character max message length, and 20-message per-session rate limit (`test_assistant_guardrails.py`)
- Tests end-to-end flows for Domicile, First CNIC, Passport, FRC, B-Form, Birth Certificate, Smart Card, and Cost Calculator scenarios (`test_api.py`)

Verify frontend production build:
```bash
cd frontend && npm run build
```
**Results:** `✓ Compiled successfully`, `8/8 static pages generated`, 0 errors.

---

## 📜 Legal & Preparation Disclaimer
CitizenEase provides civil preparation checklists and verified procedural guidance only. Legal eligibility and final document approval remain strictly at the sole discretion of the issuing government authority (Deputy Commissioner, NADRA, or Directorate General Immigration & Passports). Official fee amounts must be confirmed at the issuing office counter.
