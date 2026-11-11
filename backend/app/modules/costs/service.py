from typing import List, Dict, Any, Optional
from backend.app.modules.catalog.service import load_json_seed
from backend.app.modules.rules.evaluator import evaluate_condition

class CostCalculatorService:
    @classmethod
    def get_service_fees(cls, service_slug: str) -> Dict[str, Any]:
        """
        Returns all fee configurations and options for a given service.
        """
        all_fees = load_json_seed("fees.json")
        sources = {s["id"]: s for s in load_json_seed("sources.json")}
        services = {s["slug"]: s for s in load_json_seed("services.json")}

        service = services.get(service_slug)
        if not service:
            raise KeyError(f"Unknown service slug: {service_slug}")

        fees = [f for f in all_fees if f.get("service_slug") == service_slug]

        enriched_fees = []
        for f in fees:
            src = sources.get(f.get("source_id"), {})
            enriched_fees.append({
                "id": f.get("id"),
                "service_slug": service_slug,
                "label_en": f.get("label_en"),
                "label_ur": f.get("label_ur"),
                "amount_pkr": f.get("amount_pkr"),
                "verification_status": f.get("verification_status", "unverified"),
                "source_id": f.get("source_id"),
                "source_title": src.get("title", f.get("source_id", "Official Schedule")),
                "source_url": src.get("url"),
                "last_verified_on": f.get("last_verified_on", src.get("last_verified_on", "2026-11-08")),
                "conditions": f.get("conditions")
            })

        return {
            "service_slug": service_slug,
            "service_title_en": service.get("title_en"),
            "service_title_ur": service.get("title_ur"),
            "fees": enriched_fees,
            "disclaimer_en": "Estimate for preparation only, not an official quote.",
            "disclaimer_ur": "یہ تخمینہ صرف تیاری کے لیے ہے، سرکاری یا حتمی فیس کا دعویٰ نہیں۔"
        }

    @classmethod
    def estimate_costs(
        cls,
        requests: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Calculates fee estimates across one or more services given specific user options.
        Rules strictly applied:
          - Sum ONLY verified fees with non-null amount_pkr.
          - Put unverified/unknown fees in a separate 'Not yet confirmed' block labeled 'Confirm with office'.
          - If any applicable fee is unverified, show total as 'At least Rs X (verified fees only)'.
          - If NO verified fees exist, show 'No verified fees yet. Confirm with the office' and NO number.
          - Each fee row shows source chip and last_verified_on date.
          - Always shows preparation disclaimer.
        """
        all_fees = load_json_seed("fees.json")
        sources = {s["id"]: s for s in load_json_seed("sources.json")}
        services = {s["slug"]: s for s in load_json_seed("services.json")}

        service_breakdowns = []
        total_verified_sum = 0.0
        has_any_verified = False
        has_any_unverified = False
        all_not_confirmed_items = []

        for req in requests:
            slug = req.get("service_slug")
            options = req.get("options", {})
            svc = services.get(slug, {})

            matching_fees = []
            for f in all_fees:
                if f.get("service_slug") != slug:
                    continue
                cond = f.get("conditions")
                if cond:
                    if evaluate_condition(cond, options) is not True:
                        continue
                matching_fees.append(f)

            verified_items = []
            unverified_items = []
            svc_verified_subtotal = 0.0

            for f in matching_fees:
                src = sources.get(f.get("source_id"), {})
                is_verified = (
                    f.get("verification_status") == "verified"
                    and f.get("amount_pkr") is not None
                )
                fee_dto = {
                    "id": f.get("id"),
                    "label_en": f.get("label_en"),
                    "label_ur": f.get("label_ur"),
                    "amount_pkr": f.get("amount_pkr"),
                    "verification_status": f.get("verification_status", "unverified"),
                    "source_id": f.get("source_id"),
                    "source_title": src.get("title", f.get("source_id", "Official Reference")),
                    "source_url": src.get("url"),
                    "last_verified_on": f.get("last_verified_on", src.get("last_verified_on", "2026-11-08")),
                    "office_confirmation_note_en": "Confirm with office" if not is_verified else None,
                    "office_confirmation_note_ur": "دفتر سے تصدیق کریں" if not is_verified else None
                }

                if is_verified:
                    verified_items.append(fee_dto)
                    svc_verified_subtotal += float(f["amount_pkr"])
                    has_any_verified = True
                else:
                    unverified_items.append(fee_dto)
                    all_not_confirmed_items.append(fee_dto)
                    has_any_unverified = True

            total_verified_sum += svc_verified_subtotal

            service_breakdowns.append({
                "service_slug": slug,
                "service_title_en": svc.get("title_en", slug),
                "service_title_ur": svc.get("title_ur", slug),
                "verified_fees": verified_items,
                "unverified_fees": unverified_items,
                "subtotal_verified": svc_verified_subtotal if verified_items else None,
                "has_unverified": len(unverified_items) > 0
            })

        # Determine summary label and total presentation
        if not has_any_verified:
            total_verified_amount = None
            summary_label_en = "No verified fees yet. Confirm with the office"
            summary_label_ur = "ابھی تک کوئی فیس مصدقہ نہیں، دفتر سے تصدیق کریں"
        elif has_any_unverified:
            total_verified_amount = total_verified_sum
            formatted_num = f"{int(total_verified_sum):,}" if total_verified_sum.is_integer() else f"{total_verified_sum:,.2f}"
            summary_label_en = f"At least Rs {formatted_num} (verified fees only)"
            summary_label_ur = f"کم از کم {formatted_num} روپے (صرف مصدقہ فیسیں)"
        else:
            total_verified_amount = total_verified_sum
            formatted_num = f"{int(total_verified_sum):,}" if total_verified_sum.is_integer() else f"{total_verified_sum:,.2f}"
            summary_label_en = f"Rs {formatted_num}"
            summary_label_ur = f"{formatted_num} روپے"

        return {
            "services": service_breakdowns,
            "total_verified_amount": total_verified_amount,
            "has_verified": has_any_verified,
            "has_unverified": has_any_unverified,
            "all_verified": has_any_verified and not has_any_unverified,
            "summary_label_en": summary_label_en,
            "summary_label_ur": summary_label_ur,
            "not_confirmed_block": {
                "label_en": "Confirm with office",
                "label_ur": "دفتر سے تصدیق کریں",
                "items": all_not_confirmed_items
            },
            "disclaimer_en": "Estimate for preparation only, not an official quote.",
            "disclaimer_ur": "یہ تخمینہ صرف تیاری کے لیے ہے، سرکاری یا حتمی فیس کا دعویٰ نہیں۔"
        }
