import re
import os
from typing import Dict, Any, List, Optional
from app.modules.catalog.service import load_json_seed
from app.modules.checklist.service import CHECKLISTS

CNIC_REGEX = re.compile(r'\b\d{5}[- ]?\d{7}[- ]?\d\b|\b\d{13}\b')

class AssistantService:
    @classmethod
    def sanitize_input(cls, text: str) -> str:
        """Strip anything looking like a 13-digit CNIC number."""
        return CNIC_REGEX.sub("[REDACTED_CNIC]", text)

    @classmethod
    def discover_intent(cls, text: str, language: str = "en") -> Dict[str, Any]:
        """Simple deterministic + keyword service discovery fallback."""
        cleaned = text.lower()
        if any(w in cleaned for w in ["cnic", "identity card", "nadra", "b-form", "18", "شناختی کارڈ", "نادرا"]):
            return {
                "service_slug": "first_cnic",
                "confidence": 0.92,
                "clarifying_question": "Are you turning 18 and applying for your first CNIC, or renewing an existing card?"
            }
        elif any(w in cleaned for w in ["domicile", "prc", "permanent residence", "admission", "job quota", "belong to karachi", "ڈومیسائل", "پی آر سی"]):
            return {
                "service_slug": "domicile_prc",
                "confidence": 0.95,
                "clarifying_question": "Are you applying for educational admission, government job quota, or general record?"
            }
        return {
            "service_slug": None,
            "confidence": 0.0,
            "clarifying_question": "Please select whether you need guidance for Karachi Domicile/PRC or first-time CNIC."
        }

    @classmethod
    def chat(
        cls,
        session_id: str,
        checklist_id: Optional[str],
        message: str,
        language: str = "en"
    ) -> Dict[str, Any]:
        cleaned_msg = cls.sanitize_input(message)
        contains_cnic = "[REDACTED_CNIC]" in cleaned_msg

        # Red-team guardrail: CNIC sharing check
        if contains_cnic:
            return {
                "answer": "Notice: Please do not enter personal CNIC numbers. CitizenEase is a guidance tool and does not store or process personal identification numbers.",
                "citations": [],
                "needs_confirmation": True,
                "suggested_actions": ["Review checklist requirements without sharing personal data"]
            }

        # Load context block: FAQ, sources, and checklist if provided
        sources = load_json_seed("sources.json")
        faqs = load_json_seed("faq.json")
        citations = []

        # Check FAQ matches first (grounded retrieval without vector DB)
        lower_msg = cleaned_msg.lower()
        if "difference" in lower_msg or "prc" in lower_msg and "domicile" in lower_msg or "فرق" in lower_msg:
            faq_match = next((f for f in faqs if f.get("id") == "faq-1"), None)
            if faq_match:
                answer = faq_match["answer_ur"] if language == "ur" else faq_match["answer_en"]
                source_rec = next((s for s in sources if s["id"] == faq_match["source_id"]), None)
                if source_rec:
                    citations.append({
                        "source_id": source_rec["id"],
                        "title": source_rec["title"],
                        "url": source_rec.get("url"),
                        "last_verified_on": source_rec.get("last_verified_on")
                    })
                return {
                    "answer": answer,
                    "citations": citations,
                    "needs_confirmation": False,
                    "suggested_actions": ["View PRC Form C Details", "Check District DC Office"]
                }

        # Red-team guardrail: Asking for fees or unofficial amounts
        if any(term in lower_msg for term in ["fee", "cost", "rupees", "pkr", "how much", "فیس"]):
            return {
                "answer": "Official fees are determined by the respective government department at the time of submission. To avoid misleading or outdated amounts, please confirm the exact fee at the official DC office or NADRA service counter.",
                "citations": [],
                "needs_confirmation": True,
                "suggested_actions": ["Contact local DC Office", "Check NADRA Official Fee Schedule"]
            }

        # Red-team guardrail: Asking for legal guarantees / eligibility approval
        if any(term in lower_msg for term in ["guarantee", "promise", "approval", "guaranteed"]):
            return {
                "answer": "CitizenEase provides document preparation checklists and verified procedural guidance only. Legal eligibility and final document approval are strictly at the sole discretion of the Deputy Commissioner or authorized NADRA officer.",
                "citations": [],
                "needs_confirmation": True,
                "suggested_actions": ["Review verified document checklist"]
            }

        # Default grounded response
        return {
            "answer": "Make sure all applicant documents, original utility bills, and parent CNIC copies are attested where required before visiting your district office.",
            "citations": [
                {
                    "source_id": "SRC-SHC-1971",
                    "title": "Sindh High Court Legal Framework Reference",
                    "url": "https://caselaw.shc.gov.pk",
                    "last_verified_on": "2026-11-08"
                }
            ],
            "needs_confirmation": False,
            "suggested_actions": ["View offices map", "Check checklist progress"]
        }
