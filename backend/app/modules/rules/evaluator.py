import hashlib
import json
from typing import Dict, Any, List, Optional, Tuple

def evaluate_condition_atom(atom: Dict[str, Any], answers: Dict[str, Any]) -> Optional[bool]:
    """
    Evaluates a single condition atom: {"key": "...", "op": "...", "value": ...}
    Returns True, False, or None (if answer key is missing/unknown).
    """
    key = atom.get("key")
    op = atom.get("op")
    expected = atom.get("value")

    if key not in answers:
        return None

    actual = answers[key]

    if op == "eq":
        return actual == expected
    elif op == "neq":
        return actual != expected
    elif op == "in":
        if isinstance(expected, list):
            return actual in expected
        return False
    else:
        return False

def evaluate_condition(condition: Optional[Dict[str, Any]], answers: Dict[str, Any]) -> Optional[bool]:
    """
    Evaluates condition dict with 'all' or 'any'.
    Returns True, False, or None (if evaluation cannot be determined due to missing answers).
    """
    if not condition:
        return True

    if "all" in condition:
        atoms = condition["all"]
        results = [evaluate_condition_atom(a, answers) for a in atoms]
        if False in results:
            return False
        if None in results:
            return None
        return True

    if "any" in condition:
        atoms = condition["any"]
        results = [evaluate_condition_atom(a, answers) for a in atoms]
        if True in results:
            return True
        if all(r is False for r in results):
            return False
        return None

    return False

def compute_rules_version(rules: List[Dict[str, Any]]) -> str:
    """Generates an MD5/SHA256 hash of active rule definitions for reproducibility."""
    payload = json.dumps(rules, sort_keys=True)
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()[:12]

def evaluate_rules(
    answers: Dict[str, Any],
    rules: List[Dict[str, Any]],
    requirements: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Pure Python rules evaluator.
    No database, no AI, no network.
    Evaluates answers against rules to output applicable requirements.
    """
    user_district = answers.get("district")
    req_map = {r["id"]: r for r in requirements}

    # Track requirement evaluations: req_id -> list of (applied, applicability, is_district_specific, rule)
    evaluations: Dict[str, List[Dict[str, Any]]] = {}

    for rule in rules:
        if not rule.get("is_active", True):
            continue

        req_id = rule.get("requirement_id")
        if req_id not in req_map:
            continue

        rule_district = rule.get("district")
        is_district_specific = rule_district is not None

        # If rule is district-specific, it only applies if district matches
        if is_district_specific and rule_district != user_district:
            continue

        res = evaluate_condition(rule.get("condition"), answers)
        # res can be True, False, or None (unknown)
        if res is not False:
            if req_id not in evaluations:
                evaluations[req_id] = []
            evaluations[req_id].append({
                "applies": res, # True or None
                "applicability": rule.get("applicability", "mandatory"),
                "is_district_specific": is_district_specific,
                "priority": rule.get("priority", 0),
                "rule": rule
            })

    # Resolve duplicates/conflicts per requirement
    applicable_items = []
    confirm_with_office_items = []

    for req_id, eval_list in evaluations.items():
        req = req_map[req_id]

        # Prioritize district-specific rules over general ones
        district_specific = [e for e in eval_list if e["is_district_specific"]]
        chosen_candidates = district_specific if district_specific else eval_list

        # Pick candidate with highest priority (preferring True over None)
        chosen_candidates.sort(
            key=lambda x: (1 if x["applies"] is True else 0, x["priority"]),
            reverse=True
        )
        chosen = chosen_candidates[0]

        verification_status = req.get("verification_status", "unverified")

        # If conflicting rules exist with same priority and differing applicability, mark unverified
        if len(chosen_candidates) > 1:
            applicabilities = {c["applicability"] for c in chosen_candidates}
            if len(applicabilities) > 1:
                verification_status = "unverified"

        item_result = {
            "requirement_id": req_id,
            "code": req.get("code"),
            "title_en": req.get("title_en"),
            "title_ur": req.get("title_ur"),
            "why_needed_en": req.get("why_needed_en"),
            "why_needed_ur": req.get("why_needed_ur"),
            "kind": req.get("kind", "document"),
            "applicability": chosen["applicability"],
            "verification_status": verification_status,
            "source_id": req.get("source_id"),
            "last_verified_on": req.get("last_verified_on"),
            "user_status": "missing"
        }

        if chosen["applies"] is None:
            # Condition is unknown (missing answers) -> place in confirm with office
            confirm_with_office_items.append(item_result)
        else:
            applicable_items.append(item_result)

    return {
        "rules_version": compute_rules_version(rules),
        "items": applicable_items,
        "confirm_with_office": confirm_with_office_items
    }
