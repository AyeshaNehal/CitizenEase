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

        app_types = [
            {"id": "app-both", "slug": "both", "title_en": "Both Domicile & PRC", "title_ur": "ڈومیسائل اور پی آر سی دونوں"},
            {"id": "app-dom-only", "slug": "domicile_only", "title_en": "Domicile Only", "title_ur": "صرف ڈومیسائل"},
            {"id": "app-prc-only", "slug": "prc_only", "title_en": "PRC Only", "title_ur": "صرف پی آر سی"}
        ] if slug == "domicile_prc" else [
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
    def get_fees(cls, service_slug: str) -> List[Dict[str, Any]]:
        # Per spec: A null amount means unknown; UI shows "Confirm with office".
        if service_slug == "first_cnic":
            return [
                {
                    "label": "NADRA Normal Issuance (Subject to periodic revision)",
                    "amount_pkr": None,
                    "verification_status": "unverified",
                    "source": "NADRA Schedule of Charges"
                }
            ]
        return [
            {
                "label": "Sindh Domicile / PRC District Magistrate Challan",
                "amount_pkr": None,
                "verification_status": "unverified",
                "source": "DC Office Notice Board"
            }
        ]
