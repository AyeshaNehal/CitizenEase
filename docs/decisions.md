# Architecture Decision Records (ADRs)

## ADR-001: Modular Monolith Architecture
- **Status**: Accepted
- **Context**: 7-day hackathon timeline with a team of four. Microservices or complex multi-repo setups introduce massive deployment overhead, contract breakage, and integration hurdles.
- **Decision**: Single unified repo with one Next.js frontend, one FastAPI backend, and shared seed JSON files. Both deployed independently (e.g. Vercel + Render).

## ADR-002: Deterministic Rules Engine vs LLM Decision-Making
- **Status**: Accepted
- **Context**: LLMs hallucinate requirements, make up legal interpretations, and cannot be trusted to guarantee government compliance.
- **Decision**: Requirements and checklist generation are calculated by a pure Python rules engine (`evaluate(answers, rules) -> checklist`). The LLM is strictly restricted to an explanatory assistant role over verified context blocks.

## ADR-003: Pure Python Rules & Readiness Engine
- **Status**: Accepted
- **Context**: Need to avoid cross-module coupling and enable 100% test coverage without running a live database or calling external APIs.
- **Decision**: `modules/rules` and `modules/readiness` receive standard Python dictionaries and return standard dictionaries. Zero database, network, or AI imports.

## ADR-004: Retrieval-Augmented Generation (RAG) Without Vector DB
- **Status**: Accepted
- **Context**: The catalog has 2 services and ~30-50 verified records/rules/fees. Setting up Pinecone/pgvector/embeddings adds unnecessary latency, complexity, and failure modes.
- **Decision**: Structured retrieval directly filters relevant database records (checklist snapshot + verified service fees/offices/sources/FAQ) and builds a clean ~2,000 token context block for the LLM.

## ADR-005: LLM Client Failover & Guardrails
- **Status**: Accepted
- **Context**: Free-tier LLMs (Groq, OpenRouter) can experience rate limits (429) or transient outages.
- **Decision**: Implement an `LLMClient` with automatic failover (Groq -> OpenRouter -> static fallback explanation). Output is validated as strict JSON. Server-side regex filters strip any 13-digit CNIC numbers and reject ungrounded currency/timings.

## ADR-006: Leaflet & Deep Links over OSRM Routing
- **Status**: Accepted
- **Context**: Public OSRM routing demo servers are unreliable, rate-limited, and often fail.
- **Decision**: Render interactive Leaflet + OpenStreetMap for office locations and provide reliable "Open in Google Maps / Apple Maps" deep links with exact GPS coordinates.
