import uuid
from typing import Dict, Any, List, Optional
from backend.app.modules.catalog.service import load_json_seed, CatalogService
from backend.app.modules.rules.evaluator import evaluate_condition
from backend.app.db.storage import DatabaseStorage

# Fast in-memory cache synchronized with persistent DatabaseStorage
SESSIONS: Dict[str, Dict[str, Any]] = {}

class QuestionnaireService:
    @classmethod
    def start_session(cls, service_slug: str, language: str = "en") -> Dict[str, Any]:
        svc = CatalogService.get_service_by_slug(service_slug)
        if not svc:
            raise ValueError(f"Unknown service slug: {service_slug}")

        service_id = svc["service"]["id"]
        questions = [q for q in load_json_seed("questions.json") if q.get("service_id") == service_id]
        questions.sort(key=lambda q: q.get("order_index", 0))

        session_id = str(uuid.uuid4())
        session_data = {
            "session_id": session_id,
            "service_slug": service_slug,
            "service_id": service_id,
            "language": language,
            "answers": {},
            "message_count": 0
        }
        SESSIONS[session_id] = session_data
        try:
            DatabaseStorage.save_session(session_id, session_data)
        except Exception as e:
            print(f"Session DB sync note: {e}")

        first_q = questions[0] if questions else None
        return {
            "session_id": session_id,
            "question": first_q,
            "progress": {
                "current_step": 1 if first_q else 0,
                "total_estimated": len(questions)
            }
        }

    @classmethod
    def answer_question(cls, session_id: str, question_key: str, answer: Any) -> Dict[str, Any]:
        session = cls.get_session(session_id)
        if not session:
            raise KeyError(f"Session {session_id} not found")

        session["answers"][question_key] = answer
        SESSIONS[session_id] = session
        try:
            DatabaseStorage.save_session(session_id, session)
        except Exception as e:
            print(f"Session DB sync note: {e}")

        # Load service questions
        service_id = session["service_id"]
        questions = [q for q in load_json_seed("questions.json") if q.get("service_id") == service_id]
        questions.sort(key=lambda q: q.get("order_index", 0))

        # Find unanswered questions in sequence, respecting conditional branching
        answered_keys = list(session["answers"].keys())
        next_question: Optional[Dict[str, Any]] = None

        for q in questions:
            if q["key"] not in session["answers"]:
                cond = q.get("conditions")
                if cond:
                    res = evaluate_condition(cond, session["answers"])
                    if res is False:
                        continue
                next_question = q
                break

        done = next_question is None
        current_step = len(answered_keys) + (1 if not done else 0)

        return {
            "next_question": next_question,
            "done": done,
            "progress": {
                "current_step": min(current_step, len(questions)),
                "total_estimated": len(questions)
            },
            "visible_keys": answered_keys
        }

    @classmethod
    def get_session(cls, session_id: str) -> Optional[Dict[str, Any]]:
        if session_id in SESSIONS:
            return SESSIONS[session_id]
        try:
            stored = DatabaseStorage.get_session(session_id)
            if stored:
                SESSIONS[session_id] = stored
                return stored
        except Exception:
            pass
        return None
