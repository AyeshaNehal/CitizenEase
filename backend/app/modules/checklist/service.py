import uuid
from typing import Dict, Any, List, Optional
from backend.app.modules.catalog.service import load_json_seed
from backend.app.modules.questionnaire.service import QuestionnaireService
from backend.app.modules.rules.evaluator import evaluate_rules
from backend.app.modules.readiness.calculator import calculate_readiness
from backend.app.db.storage import DatabaseStorage

CHECKLISTS: Dict[str, Dict[str, Any]] = {}

class ChecklistService:
    @classmethod
    def generate_checklist(cls, session_id: str, user_id: Optional[str] = None) -> Dict[str, Any]:
        session = QuestionnaireService.get_session(session_id)
        if not session:
            raise KeyError(f"Session {session_id} not found")

        resolved_user_id = user_id or session.get("user_id")
        answers = session.get("answers", {})
        service_id = session.get("service_id")
        lang = session.get("language", "en")

        all_rules = load_json_seed("rules.json")
        all_reqs = load_json_seed("requirements.json")
        all_sources = {s["id"]: s for s in load_json_seed("sources.json")}

        service_reqs = [
            r for r in all_reqs
            if r.get("service_id") == service_id
            or (isinstance(r.get("service_ids"), list) and service_id in r.get("service_ids"))
        ]
        eval_result = evaluate_rules(answers, all_rules, service_reqs)

        items: List[Dict[str, Any]] = []
        for i, item_data in enumerate(eval_result["items"]):
            src = all_sources.get(item_data.get("source_id"), {})
            title = item_data.get("title_ur") if lang == "ur" else item_data.get("title_en")
            why_needed = item_data.get("why_needed_ur") if lang == "ur" else item_data.get("why_needed_en")

            items.append({
                "item_id": f"item-{i+1}",
                "code": item_data.get("code"),
                "title": title or item_data.get("title_en"),
                "title_en": item_data.get("title_en"),
                "why_needed": why_needed or item_data.get("why_needed_en"),
                "applicability": item_data.get("applicability"),
                "verification_status": item_data.get("verification_status"),
                "user_status": "missing",
                "source": {
                    "title": src.get("title", "Official Reference"),
                    "url": src.get("url"),
                    "last_verified_on": src.get("last_verified_on", "2026-11-08")
                }
            })

        readiness = calculate_readiness(items)
        checklist_id = str(uuid.uuid4())

        checklist_obj = {
            "checklist_id": checklist_id,
            "session_id": session_id,
            "items": items,
            "readiness": readiness,
            "disclaimers": [
                "Guidance only. This is preparation, not official government approval."
            ]
        }
        CHECKLISTS[checklist_id] = checklist_obj
        try:
            DatabaseStorage.save_checklist(checklist_id, {
                "user_id": resolved_user_id,
                "session_id": session_id,
                "service_id": service_id,
                "items": items,
                "readiness": readiness,
                "disclaimers": checklist_obj["disclaimers"]
            })
        except Exception as e:
            print(f"Checklist DB sync note: {e}")

        return checklist_obj

    @classmethod
    def get_checklist(cls, checklist_id: str) -> Optional[Dict[str, Any]]:
        if checklist_id in CHECKLISTS:
            return CHECKLISTS[checklist_id]
        try:
            stored = DatabaseStorage.get_checklist(checklist_id)
            if stored:
                obj = {
                    "checklist_id": stored["id"],
                    "session_id": stored["session_id"],
                    "items": stored["items"],
                    "readiness": stored["readiness"],
                    "disclaimers": stored["disclaimers"]
                }
                CHECKLISTS[checklist_id] = obj
                return obj
        except Exception:
            pass
        return None

    @classmethod
    def update_items(cls, checklist_id: str, updates: List[Dict[str, str]]) -> Dict[str, Any]:
        checklist = cls.get_checklist(checklist_id)
        if not checklist:
            raise KeyError(f"Checklist {checklist_id} not found")

        item_map = {item["item_id"]: item for item in checklist["items"]}
        for update in updates:
            target_id = update.get("item_id")
            new_status = update.get("user_status")
            if target_id in item_map and new_status in ["have", "missing", "not_sure"]:
                item_map[target_id]["user_status"] = new_status

        checklist["readiness"] = calculate_readiness(checklist["items"])
        CHECKLISTS[checklist_id] = checklist
        try:
            DatabaseStorage.save_checklist(checklist_id, {
                "session_id": checklist.get("session_id", ""),
                "items": checklist["items"],
                "readiness": checklist["readiness"],
                "disclaimers": checklist.get("disclaimers", [])
            })
        except Exception as e:
            print(f"Checklist update DB sync note: {e}")

        return {
            "items": checklist["items"],
            "readiness": checklist["readiness"]
        }
