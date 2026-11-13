-- CitizenEase Database Schema (PostgreSQL)
-- Conventions: id uuid default gen_random_uuid(), created_at timestamptz default now()

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Core catalog tables
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title_en TEXT NOT NULL,
    title_ur TEXT NOT NULL,
    description_en TEXT NOT NULL,
    description_ur TEXT NOT NULL,
    keywords TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS application_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    slug TEXT NOT NULL,
    title_en TEXT NOT NULL,
    title_ur TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    url TEXT,
    issuing_authority TEXT NOT NULL,
    source_type TEXT NOT NULL, -- official_web, official_document, office_visit, court_ruling, news_secondary
    verification_status TEXT NOT NULL, -- verified, unverified, outdated, conflicting
    last_verified_on DATE DEFAULT CURRENT_DATE,
    verified_by TEXT,
    applicable_district TEXT,
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    notes TEXT,
    limitations TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    application_type_id UUID REFERENCES application_types(id) ON DELETE SET NULL,
    code TEXT UNIQUE NOT NULL,
    title_en TEXT NOT NULL,
    title_ur TEXT NOT NULL,
    why_needed_en TEXT NOT NULL,
    why_needed_ur TEXT NOT NULL,
    kind TEXT NOT NULL, -- document, step
    verification_status TEXT NOT NULL, -- verified, unverified
    source_id UUID REFERENCES sources(id) ON DELETE SET NULL,
    last_verified_on DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS eligibility_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requirement_id UUID REFERENCES requirements(id) ON DELETE CASCADE,
    applicability TEXT NOT NULL, -- mandatory, conditional, optional
    condition JSONB NOT NULL,
    district TEXT,
    priority INT DEFAULT 10,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    application_type_id UUID REFERENCES application_types(id) ON DELETE SET NULL,
    amount_pkr NUMERIC,
    label TEXT NOT NULL,
    source_id UUID REFERENCES sources(id) ON DELETE SET NULL,
    verification_status TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS offices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    office_type TEXT NOT NULL,
    district TEXT NOT NULL,
    address TEXT NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    services TEXT[] DEFAULT '{}',
    source_id UUID REFERENCES sources(id) ON DELETE SET NULL,
    verification_status TEXT NOT NULL,
    last_verified_on DATE DEFAULT CURRENT_DATE,
    hours_note TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Questionnaire tables
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    key TEXT NOT NULL,
    text_en TEXT NOT NULL,
    text_ur TEXT NOT NULL,
    input_type TEXT NOT NULL, -- single_choice, boolean, district
    order_index INT NOT NULL,
    required BOOLEAN DEFAULT TRUE,
    validation JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS question_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    value JSONB NOT NULL,
    label_en TEXT NOT NULL,
    label_ur TEXT NOT NULL,
    order_index INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS question_conditions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    depends_on_key TEXT NOT NULL,
    operator TEXT NOT NULL, -- eq, neq, in
    value JSONB NOT NULL
);

-- Runtime tables (User sessions & generated checklists - NO PII)
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    language TEXT DEFAULT 'en',
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS questionnaire_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES user_sessions(id) ON DELETE CASCADE,
    question_key TEXT NOT NULL,
    answer JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (session_id, question_key)
);

CREATE TABLE IF NOT EXISTS generated_checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    session_id UUID REFERENCES user_sessions(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    rules_version TEXT NOT NULL,
    answers_snapshot JSONB NOT NULL,
    readiness JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS checklist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    checklist_id UUID REFERENCES generated_checklists(id) ON DELETE CASCADE,
    requirement_id UUID REFERENCES requirements(id) ON DELETE CASCADE,
    applicability TEXT NOT NULL,
    verification_status TEXT NOT NULL,
    user_status TEXT DEFAULT 'missing', -- have, missing, not_sure
    explanation_snapshot TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on runtime checklists
ALTER TABLE generated_checklists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read by checklist id"
ON generated_checklists FOR SELECT
USING (true);

CREATE POLICY "Allow users to manage their own checklists"
ON generated_checklists FOR ALL
USING (auth.uid() = user_id OR user_id IS NULL)
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

