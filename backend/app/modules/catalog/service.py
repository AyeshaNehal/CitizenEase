import json
import os
from typing import List, Dict, Any, Optional

SEED_DIR = os.path.join(os.path.dirname(__file__), "../../../../data/seed")

def load_json_seed(filename: str) -> List[Dict[str, Any]]:
    path = os.path.abspath(os.path.join(SEED_DIR, filename))
    if not os.path.exists(path):
        return []
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

class CatalogService:
    @classmethod
    def get_services(cls, lang: str = "en") -> List[Dict[str, Any]]:
        services = load_json_seed("services.json")
        result = []
        for s in services:
            if not s.get("is_active", True):
                continue
            title = s.get("title_ur") if lang == "ur" else s.get("title_en")
            desc = s.get("description_ur") if lang == "ur" else s.get("description_en")
            result.append({
                "id": s.get("id"),
                "slug": s.get("slug"),
                "title": title or s.get("title_en"),
                "description": desc or s.get("description_en"),
                "icon": s.get("icon", "file-badge")
            })
        return result

    @classmethod
    def get_service_by_slug(cls, slug: str) -> Optional[Dict[str, Any]]:
        services = load_json_seed("services.json")
        svc = next((s for s in services if s.get("slug") == slug), None)
        if not svc:
            return None

        # Calculate sources summary
        sources = load_json_seed("sources.json")
        service_sources = [src for src in sources if src.get("service_id") == svc["id"]]
        verified = sum(1 for src in service_sources if src.get("verification_status") == "verified")
        unverified = sum(1 for src in service_sources if src.get("verification_status") != "verified")
        dates = [src.get("last_verified_on") for src in service_sources if src.get("last_verified_on")]
        latest_date = max(dates) if dates else "2026-11-08"

        if slug == "domicile_prc":
            app_types = [
                {"id": "app-both", "slug": "both", "title_en": "Both Domicile & PRC", "title_ur": "ڈومیسائل اور پی آر سی دونوں"},
                {"id": "app-dom-only", "slug": "domicile_only", "title_en": "Domicile Only", "title_ur": "صرف ڈومیسائل"},
                {"id": "app-prc-only", "slug": "prc_only", "title_en": "PRC Only", "title_ur": "صرف پی آر سی"}
            ]
        elif slug == "passport":
            app_types = [
                {"id": "app-pass-fresh", "slug": "fresh", "title_en": "Fresh / New Passport", "title_ur": "نیا پاسپورٹ"},
                {"id": "app-pass-renewal", "slug": "renewal", "title_en": "Passport Renewal", "title_ur": "پاسپورٹ تجدید"},
                {"id": "app-pass-lost", "slug": "lost", "title_en": "Lost Passport Replacement", "title_ur": "گمشدہ پاسپورٹ"}
            ]
        elif slug == "frc":
            app_types = [
                {"id": "app-frc-birth", "slug": "by_birth", "title_en": "FRC By Birth (Parents & Siblings)", "title_ur": "پیدائشی خاندانی شجرہ"},
                {"id": "app-frc-marriage", "slug": "by_marriage", "title_en": "FRC By Marriage (Spouse & Children)", "title_ur": "ازدواجی خاندانی شجرہ"}
            ]
        elif slug == "b_form":
            app_types = [
                {"id": "app-bform-std", "slug": "standard", "title_en": "Child Registration Certificate (B-Form)", "title_ur": "چائلڈ رجسٹریشن سرٹیفکیٹ (ب فارم)"}
            ]
        elif slug == "birth_certificate":
            app_types = [
                {"id": "app-bc-standard", "slug": "standard", "title_en": "Union Council Computerized Birth Certificate", "title_ur": "یونین کونسل کمپیوٹرائزڈ پیدائش سرٹیفکیٹ"}
            ]
        elif slug == "smart_card":
            app_types = [
                {"id": "app-smart-fresh", "slug": "fresh", "title_en": "Fresh Smart Card", "title_ur": "نیا سمارٹ کارڈ"},
                {"id": "app-smart-upgrade", "slug": "upgrade", "title_en": "Upgrade to Smart Card", "title_ur": "سمارٹ کارڈ میں اپ گریڈ"},
                {"id": "app-smart-renewal", "slug": "renewal", "title_en": "Smart Card Renewal / Duplicate", "title_ur": "سمارٹ کارڈ تجدید یا گمشدہ"}
            ]
        else:
            app_types = [
                {"id": "app-cnic-reg", "slug": "standard", "title_en": "Standard First-Time Adult CNIC", "title_ur": "پہلا شناختی کارڈ (معیاری)"}
            ]

        return {
            "service": svc,
            "application_types": app_types,
            "source_summary": {
                "verified_count": verified,
                "unverified_count": unverified,
                "last_verified_on": latest_date
            }
        }

    @classmethod
    def get_offices(cls, service_slug: Optional[str] = None, district: Optional[str] = None) -> List[Dict[str, Any]]:
        offices = load_json_seed("offices.json")
        filtered = offices
        if service_slug:
            filtered = [o for o in filtered if service_slug in o.get("services", [])]
        if district:
            filtered = [o for o in filtered if o.get("district") == district]
        return filtered

    @classmethod
    def get_sources(cls, service_slug: Optional[str] = None) -> List[Dict[str, Any]]:
        sources = load_json_seed("sources.json")
        if not service_slug:
            return sources
        svc = cls.get_service_by_slug(service_slug)
        if not svc:
            return []
        svc_id = svc["service"]["id"]
        return [src for src in sources if src.get("service_id") == svc_id or src.get("service_id") is None]

    @classmethod
    def get_stale_sources(cls, threshold_days: int = 90) -> List[Dict[str, Any]]:
        from datetime import datetime, date
        sources = load_json_seed("sources.json")
        stale = []
        today = date.today()
        for src in sources:
            d_str = src.get("last_verified_on")
            if d_str:
                try:
                    d = datetime.strptime(d_str, "%Y-%m-%d").date()
                    delta = (today - d).days
                    if delta > threshold_days:
                        stale.append({**src, "days_since_verified": delta, "is_stale": True})
                except Exception:
                    pass
        return stale

    @classmethod
    def get_fees(cls, service_slug: str) -> List[Dict[str, Any]]:
        fees = load_json_seed("fees.json")
        sources = {s["id"]: s for s in load_json_seed("sources.json")}
        service_fees = [f for f in fees if f.get("service_slug") == service_slug]
        result = []
        for f in service_fees:
            src = sources.get(f.get("source_id"), {})
            result.append({
                "label": f.get("label_en", "Official Fee"),
                "label_ur": f.get("label_ur"),
                "amount_pkr": f.get("amount_pkr"),
                "verification_status": f.get("verification_status", "unverified"),
                "source": src.get("title", f.get("source_id", "Official Reference")),
                "source_id": f.get("source_id"),
                "last_verified_on": f.get("last_verified_on", src.get("last_verified_on", "2026-11-08"))
            })
        return result
