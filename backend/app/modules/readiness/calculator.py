from typing import List, Dict, Any, Optional

def calculate_readiness(items: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Pure Python readiness score calculator.
    Only VERIFIED + MANDATORY + APPLICABLE items count towards score denominator.
    Unverified items and conditional items are reported separately and excluded from the denominator.
    """
    verified_mandatory = [
        item for item in items
        if item.get("verification_status") == "verified"
        and item.get("applicability") == "mandatory"
    ]

    total = len(verified_mandatory)
    ready_items = [
        item for item in verified_mandatory
        if item.get("user_status") == "have"
    ]
    ready = len(ready_items)

    missing_titles = [
        item.get("title_en") or item.get("title")
        for item in verified_mandatory
        if item.get("user_status") != "have"
    ]

    conditional_titles = [
        item.get("title_en") or item.get("title")
        for item in items
        if item.get("applicability") == "conditional"
    ]

    unverified_titles = [
        item.get("title_en") or item.get("title")
        for item in items
        if item.get("verification_status") == "unverified"
    ]

    if total == 0:
        score: Optional[int] = None
        explanation = "No verified requirements yet. Confirm with the office."
    else:
        score = int(round((ready / total) * 100))
        explanation = f"{ready} of {total} verified required items ready."

    return {
        "score": score,
        "ready": ready,
        "total": total,
        "missing": missing_titles,
        "conditional": conditional_titles,
        "unverified": unverified_titles,
        "explanation": explanation,
        "is_guarantee": False
    }
