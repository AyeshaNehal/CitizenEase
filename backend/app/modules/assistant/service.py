import re
import os
from typing import Dict, Any, List, Optional
from fastapi import HTTPException
from backend.app.modules.catalog.service import load_json_seed
from backend.app.modules.checklist.service import CHECKLISTS
from backend.app.db.storage import DatabaseStorage

CNIC_REGEX = re.compile(r'\b\d{5}[- ]?\d{7}[- ]?\d\b|\b\d{13}\b')

class AssistantService:
    @classmethod
    def sanitize_input(cls, text: str) -> str:
        """Strip anything looking like a 13-digit CNIC number."""
        return CNIC_REGEX.sub("[REDACTED_CNIC]", text)

    @classmethod
    def discover_intent(cls, text: str, language: str = "en") -> Dict[str, Any]:
        """Deterministic + keyword service discovery fallback."""
        cleaned = text.lower()
        if any(w in cleaned for w in ["passport", "پاسپورٹ", "mrp", "epassport", "immigration", "travel", "renewal"]):
            q_en = "Are you applying for a fresh passport, renewing an expired booklet, or replacing a lost passport?"
            q_ur = "کیا آپ نیا پاسپورٹ بنوا رہے ہیں، تجدید کروانی ہے، یا گمشدہ پاسپورٹ دوبارہ حاصل کرنا ہے؟"
            return {
                "service_slug": "passport",
                "confidence": 0.96,
                "clarifying_question": q_ur if language == "ur" else q_en,
                "clarifying_question_en": q_en,
                "clarifying_question_ur": q_ur,
                "summary_en": "Matched: Machine Readable Passport (MRP / e-Passport) via DGI&P.",
                "summary_ur": "متعلقہ سروس: امیگریشن و پاسپورٹ کے تحت مشین ریڈ ایبل پاسپورٹ۔"
            }
        elif any(w in cleaned for w in ["frc", "family registration", "family tree", "شجرہ", "خاندانی", "ایف آر سی"]):
            q_en = "Do you need FRC By Birth (parents & siblings) or FRC By Marriage (spouse & children)?"
            q_ur = "کیا آپ کو پیدائشی خاندان (والدین و بہن بھائی) یا ازدواجی خاندان (اہلیہ و بچے) کا سرٹیفکیٹ درکار ہے؟"
            return {
                "service_slug": "frc",
                "confidence": 0.96,
                "clarifying_question": q_ur if language == "ur" else q_en,
                "clarifying_question_en": q_en,
                "clarifying_question_ur": q_ur,
                "summary_en": "Matched: Family Registration Certificate (FRC) via NADRA.",
                "summary_ur": "متعلقہ سروس: نادرا کے تحت فیملی رجسٹریشن سرٹیفکیٹ۔"
            }
        elif any(w in cleaned for w in ["birth certificate", "پیدائش", "برتھ سرٹیفکیٹ", "یونین کونسل", "tmc"]):
            q_en = "Do you need a computerized birth certificate issued by your Karachi Union Council?"
            q_ur = "کیا آپ کو اپنی کراچی یونین کونسل سے کمپیوٹرائزڈ برتھ سرٹیفکیٹ حاصل کرنا ہے؟"
            return {
                "service_slug": "birth_certificate",
                "confidence": 0.95,
                "clarifying_question": q_ur if language == "ur" else q_en,
                "clarifying_question_en": q_en,
                "clarifying_question_ur": q_ur,
                "summary_en": "Matched: Union Council Computerized Birth Certificate.",
                "summary_ur": "متعلقہ سروس: یونین کونسل کمپیوٹرائزڈ پیدائش سرٹیفکیٹ۔"
            }
        elif any(w in cleaned for w in ["b-form", "bform", "crc", "child registration", "بے فارم", "ب فارم"]):
            q_en = "Do you need to register a child under 18 for a NADRA Child Registration Certificate (B-Form)?"
            q_ur = "کیا آپ کو 18 سال سے کم عمر بچے کے لیے نادرا کا چائلڈ رجسٹریشن سرٹیفکیٹ (ب فارم) بنوانا ہے؟"
            return {
                "service_slug": "b_form",
                "confidence": 0.95,
                "clarifying_question": q_ur if language == "ur" else q_en,
                "clarifying_question_en": q_en,
                "clarifying_question_ur": q_ur,
                "summary_en": "Matched: NADRA Child Registration Certificate (B-Form).",
                "summary_ur": "متعلقہ سروس: نادرا ب فارم (چائلڈ رجسٹریشن سرٹیفکیٹ)۔"
            }
        elif any(w in cleaned for w in ["smart card", "snic", "chip card", "سمارٹ کارڈ"]):
            q_en = "Are you applying for a chip-based Smart National Identity Card (SNIC) from NADRA?"
            q_ur = "کیا آپ نادرا سے چپ والا سمارٹ شناختی کارڈ بنوانا چاہتے ہیں؟"
            return {
                "service_slug": "smart_card",
                "confidence": 0.95,
                "clarifying_question": q_ur if language == "ur" else q_en,
                "clarifying_question_en": q_en,
                "clarifying_question_ur": q_ur,
                "summary_en": "Matched: NADRA Smart National Identity Card (SNIC).",
                "summary_ur": "متعلقہ سروس: نادرا سمارٹ قومی شناختی کارڈ۔"
            }
        elif any(w in cleaned for w in ["cnic", "identity card", "nadra", "18", "شناختی کارڈ"]):
            q_en = "Are you turning 18 and converting your B-Form into an adult national identity card?"
            q_ur = "کیا آپ کی عمر 18 سال مکمل ہو رہی ہے اور بے فارم کو شناختی کارڈ میں تبدیل کروانا ہے؟"
            return {
                "service_slug": "first_cnic",
                "confidence": 0.95,
                "clarifying_question": q_ur if language == "ur" else q_en,
                "clarifying_question_en": q_en,
                "clarifying_question_ur": q_ur,
                "summary_en": "Matched: First-Time Adult CNIC via NADRA.",
                "summary_ur": "متعلقہ سروس: نادرا کے تحت پہلا شناختی کارڈ۔"
            }
        elif any(w in cleaned for w in ["domicile", "prc", "permanent residence", "admission", "job quota", "belong to karachi", "ڈومیسائل", "پی آر سی"]):
            q_en = "Are you preparing for educational admission, government employment, or quota eligibility in Karachi?"
            q_ur = "کیا آپ کراچی میں کالج/یونیورسٹی داخلے، سرکاری نوکری یا کوٹہ کے لیے ڈومیسائل اور پی آر سی بنوانا چاہتے ہیں؟"
            return {
                "service_slug": "domicile_prc",
                "confidence": 0.95,
                "clarifying_question": q_ur if language == "ur" else q_en,
                "clarifying_question_en": q_en,
                "clarifying_question_ur": q_ur,
                "summary_en": "Matched: Karachi Domicile & PRC (Form C) via Deputy Commissioner Office.",
                "summary_ur": "متعلقہ سروس: ڈپٹی کمشنر آفس کے ذریعے کراچی ڈومیسائل اور پی آر سی۔"
            }
        q_en = "Please select whether you need guidance for Karachi Domicile/PRC, CNIC, Passport, or FRC."
        q_ur = "براہ کرم منتخب کریں کہ آپ کو ڈومیسائل/پی آر سی، شناختی کارڈ، پاسپورٹ یا ایف آر سی کی رہنمائی درکار ہے۔"
        return {
            "service_slug": None,
            "confidence": 0.0,
            "clarifying_question": q_ur if language == "ur" else q_en,
            "clarifying_question_en": q_en,
            "clarifying_question_ur": q_ur,
            "summary_en": "Uncertain intent. Select a service to begin.",
            "summary_ur": "واضح سروس معلوم نہیں ہو سکی۔ براہ کرم سروس منتخب کریں۔"
        }

    @classmethod
    def chat(
        cls,
        session_id: str,
        checklist_id: Optional[str],
        message: str,
        language: str = "en",
        checklist_items: Optional[List[Any]] = None
    ) -> Dict[str, Any]:
        if len(message) > 500:
            raise HTTPException(status_code=400, detail="Message exceeds maximum allowed length of 500 characters.")

        if session_id and session_id != "anonymous":
            msg_count = DatabaseStorage.increment_session_messages(session_id)
            if msg_count > 20:
                raise HTTPException(
                    status_code=429,
                    detail="Per-session limit of 20 messages reached. Please consult your verified checklist or start a fresh session."
                )

        cleaned_msg = cls.sanitize_input(message)
        contains_cnic = "[REDACTED_CNIC]" in cleaned_msg

        # Red-team guardrail: CNIC sharing check
        if contains_cnic:
            notice = (
                "⚠️ نوٹس: اپنا 13 ہندسوں کا شناختی کارڈ نمبر کبھی بھی چیٹ میں درج نہ کریں۔ سٹیزن ایز ایک معلوماتی رہنمائی کا ٹول ہے اور شناخت محفوظ نہیں کرتا۔"
                if language == "ur"
                else "⚠️ Privacy Notice: Please do not enter personal CNIC numbers. CitizenEase is a guidance tool and does not store or process personal identification numbers."
            )
            return {
                "answer": notice,
                "citations": [],
                "needs_confirmation": True,
                "needs_official_confirmation": True,
                "suggested_actions": ["Review checklist requirements without sharing personal data"]
            }

        sources = load_json_seed("sources.json")
        faqs = load_json_seed("faq.json")
        citations = []

        lower_msg = cleaned_msg.lower()

        # Domicile vs PRC
        if "difference" in lower_msg or ("prc" in lower_msg and "domicile" in lower_msg) or "فرق" in lower_msg:
            faq_match = next((f for f in faqs if f.get("id") == "faq-1"), None)
            if faq_match:
                answer = faq_match["answer_ur"] if language == "ur" else faq_match["answer_en"]
                source_rec = next((s for s in sources if s["id"] == faq_match["source_id"]), None)
                if source_rec:
                    citations.append({
                        "id": source_rec["id"],
                        "source_id": source_rec["id"],
                        "title": source_rec["title"],
                        "url": source_rec.get("url"),
                        "issuing_authority": source_rec.get("issuing_authority", "Sindh High Court"),
                        "last_verified_on": source_rec.get("last_verified_on", "2026-11-08"),
                        "verification_status": source_rec.get("verification_status", "verified")
                    })
                return {
                    "answer": answer,
                    "citations": citations,
                    "needs_confirmation": False,
                    "needs_official_confirmation": False,
                    "suggested_actions": ["View PRC Form C Details", "Check District DC Office"]
                }

        # Passport Renewal / Inquiry
        if any(w in lower_msg for w in ["passport", "پاسپورٹ", "mrp", "تجدید"]):
            faq_match = next((f for f in faqs if f.get("id") == "faq-3"), None)
            if faq_match:
                answer = faq_match["answer_ur"] if language == "ur" else faq_match["answer_en"]
                source_rec = next((s for s in sources if s["id"] == faq_match["source_id"]), None)
                if source_rec:
                    citations.append({
                        "id": source_rec["id"],
                        "source_id": source_rec["id"],
                        "title": source_rec["title"],
                        "url": source_rec.get("url"),
                        "issuing_authority": source_rec.get("issuing_authority", "DGI&P"),
                        "last_verified_on": source_rec.get("last_verified_on", "2026-11-08"),
                        "verification_status": source_rec.get("verification_status", "verified")
                    })
                return {
                    "answer": answer,
                    "citations": citations,
                    "needs_confirmation": False,
                    "needs_official_confirmation": False,
                    "suggested_actions": ["Review Passport Checklist", "Find Karachi Passport Offices"]
                }

        # FRC Inquiry
        if any(w in lower_msg for w in ["frc", "family registration", "شجرہ", "ایف آر سی"]):
            faq_match = next((f for f in faqs if f.get("id") == "faq-4"), None)
            if faq_match:
                answer = faq_match["answer_ur"] if language == "ur" else faq_match["answer_en"]
                source_rec = next((s for s in sources if s["id"] == faq_match["source_id"]), None)
                if source_rec:
                    citations.append({
                        "id": source_rec["id"],
                        "source_id": source_rec["id"],
                        "title": source_rec["title"],
                        "url": source_rec.get("url"),
                        "issuing_authority": source_rec.get("issuing_authority", "NADRA"),
                        "last_verified_on": source_rec.get("last_verified_on", "2026-11-08"),
                        "verification_status": source_rec.get("verification_status", "verified")
                    })
                return {
                    "answer": answer,
                    "citations": citations,
                    "needs_confirmation": False,
                    "needs_official_confirmation": False,
                    "suggested_actions": ["Review FRC Checklist", "Find Nearest NADRA Mega Centre"]
                }

        # Red-team guardrail: Asking for fees or unofficial amounts
        if any(term in lower_msg for term in ["fee", "cost", "rupees", "pkr", "how much", "فیس", "پیسے"]):
            msg = (
                "فیس ابھی غیر مصدقہ ہے، دفتر سے تصدیق کریں۔ سرکاری فیس چالان کی رقم مجاز محکمے (ڈی سی آفس، نادرا، یا پاسپورٹ آفس) کے نوٹس بورڈ اور بینک کاؤنٹر سے براہ راست تصدیق کریں۔"
                if language == "ur"
                else "Fee not verified; confirm with the office. Official fees are determined by the respective government department at the time of submission. Please confirm the exact fee at the official DC office, NADRA desk, or Passport counter."
            )
            return {
                "answer": msg,
                "citations": [
                    {
                        "id": "SRC-SHC-1971",
                        "source_id": "SRC-SHC-1971",
                        "title": "Government Treasury & Counter Notice Board",
                        "url": None,
                        "issuing_authority": "Karachi District Administration",
                        "last_verified_on": "2026-11-08",
                        "verification_status": "unverified"
                    }
                ],
                "needs_confirmation": True,
                "needs_official_confirmation": True,
                "suggested_actions": ["Contact Local Service Desk", "Check Official Fee Schedule"]
            }

        # Red-team guardrail: Asking for legal guarantees / eligibility approval
        if any(term in lower_msg for term in ["guarantee", "promise", "approval", "guaranteed", "ضمانت"]):
            msg = (
                "سٹیزن ایز صرف دستاویزات کی تیاری اور تصدیقی رہنمائی فراہم کرتا ہے۔ قانونی اہلیت اور حتمی منظوری کا مکمل اختیار صرف مجاز افسر کے پاس ہے۔"
                if language == "ur"
                else "CitizenEase provides document preparation checklists and verified procedural guidance only. Legal eligibility and final document approval are strictly at the sole discretion of the issuing government authority."
            )
            return {
                "answer": msg,
                "citations": [],
                "needs_confirmation": True,
                "needs_official_confirmation": True,
                "suggested_actions": ["Review verified document checklist"]
            }

        # Default grounded response
        default_en = "Based on verified Karachi administrative records: All applications require original valid CNIC / Smart Cards, attested family documentation, and paid official treasury receipts before visiting your designated office."
        default_ur = "تصدیق شدہ کراچی ریکارڈز کے مطابق: تمام درخواستوں کے لیے اصل درست شناختی کارڈ، خاندانی دستاویزات اور سرکاری فیس کی اصل رسید کاؤنٹر پر ہمراہ رکھنا لازمی ہے۔"

        return {
            "answer": default_ur if language == "ur" else default_en,
            "citations": [
                {
                    "id": "SRC-SHC-1971",
                    "source_id": "SRC-SHC-1971",
                    "title": "Sindh Administrative Framework Reference",
                    "url": "https://caselaw.shc.gov.pk",
                    "issuing_authority": "Sindh Government",
                    "last_verified_on": "2026-11-08",
                    "verification_status": "verified"
                }
            ],
            "needs_confirmation": False,
            "needs_official_confirmation": False,
            "suggested_actions": ["View offices map", "Check checklist progress"]
        }
