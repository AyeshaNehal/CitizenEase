import pytest
from backend.app.modules.rules.evaluator import evaluate_condition, evaluate_rules, compute_rules_version

def test_evaluate_condition():
    # eq operator
    cond_eq = {"all": [{"key": "age_18", "op": "eq", "value": True}]}
    assert evaluate_condition(cond_eq, {"age_18": True}) is True
    assert evaluate_condition(cond_eq, {"age_18": False}) is False
    assert evaluate_condition(cond_eq, {}) is None # Unknown

    # in operator
    cond_in = {"all": [{"key": "district", "op": "in", "value": ["karachi_south", "karachi_east"]}]}
    assert evaluate_condition(cond_in, {"district": "karachi_south"}) is True
    assert evaluate_condition(cond_in, {"district": "malir"}) is False

    # any operator
    cond_any = {"any": [
        {"key": "goal", "op": "eq", "value": "job"},
        {"key": "goal", "op": "eq", "value": "admission"}
    ]}
    assert evaluate_condition(cond_any, {"goal": "job"}) is True
    assert evaluate_condition(cond_any, {"goal": "admission"}) is True
    assert evaluate_condition(cond_any, {"goal": "other"}) is False

def test_evaluate_rules_district_specificity():
    requirements = [
        {
            "id": "req-1",
            "code": "REQ_TEST",
            "title_en": "Test Req",
            "verification_status": "verified"
        }
    ]
    # General rule gives optional; district-specific rule gives mandatory
    rules = [
        {
            "id": "rule-general",
            "requirement_id": "req-1",
            "applicability": "optional",
            "condition": {"all": [{"key": "test", "op": "eq", "value": True}]},
            "district": None,
            "priority": 10,
            "is_active": True
        },
        {
            "id": "rule-specific",
            "requirement_id": "req-1",
            "applicability": "mandatory",
            "condition": {"all": [{"key": "test", "op": "eq", "value": True}]},
            "district": "karachi_south",
            "priority": 20,
            "is_active": True
        }
    ]

    # For karachi_south, district-specific should win -> mandatory
    res_south = evaluate_rules({"test": True, "district": "karachi_south"}, rules, requirements)
    assert len(res_south["items"]) == 1
    assert res_south["items"][0]["applicability"] == "mandatory"

    # For malir, only general rule matches -> optional
    res_malir = evaluate_rules({"test": True, "district": "malir"}, rules, requirements)
    assert len(res_malir["items"]) == 1
    assert res_malir["items"][0]["applicability"] == "optional"

def test_new_services_rules_evaluation():
    from backend.app.modules.catalog.service import load_json_seed
    from backend.app.modules.readiness.calculator import calculate_readiness

    all_rules = load_json_seed("rules.json")
    all_reqs = load_json_seed("requirements.json")

    # 1. Birth Certificate: All mandatory items are unverified -> score must be None
    bc_reqs = [r for r in all_reqs if r.get("service_id") == "s-birth-certificate"]
    bc_res = evaluate_rules(
        {"birth_place_type": "hospital", "parents_cnic_valid": True, "has_parents_nikahnama": True},
        all_rules,
        bc_reqs
    )
    assert len(bc_res["items"]) >= 2
    readiness = calculate_readiness(bc_res["items"])
    assert readiness["total"] == 0
    assert readiness["score"] is None
    assert "No verified requirements yet" in readiness["explanation"]

    # 2. B-Form: Verified mandatory items
    bform_reqs = [
        r for r in all_reqs
        if r.get("service_id") == "s-b-form" or "s-b-form" in r.get("service_ids", [])
    ]
    bform_res = evaluate_rules(
        {"has_birth_certificate": True, "parents_marital_status_updated": True, "parent_available_bform": True},
        all_rules,
        bform_reqs
    )
    bform_codes = [i["code"] for i in bform_res["items"]]
    assert "REQ_BFORM_UC_CERT" in bform_codes
    assert "REQ_BFORM_PARENTS_CNIC" in bform_codes
    assert "REQ_PARENT_BIOMETRIC" in bform_codes
    bform_readiness = calculate_readiness(bform_res["items"])
    assert bform_readiness["total"] >= 2
    assert bform_readiness["score"] is not None

    # 3. Smart Card: Verified mandatory items
    smart_reqs = [r for r in all_reqs if r.get("service_id") == "s-smart-card"]
    smart_res = evaluate_rules(
        {"smart_card_purpose": "fresh_18", "has_existing_id_doc": True, "blood_relative_available": True},
        all_rules,
        smart_reqs
    )
    smart_codes = [i["code"] for i in smart_res["items"]]
    assert "REQ_SMART_PREV_DOC" in smart_codes
    assert "REQ_SMART_BIOMETRICS" in smart_codes
    assert "REQ_SMART_ATTESTOR" in smart_codes

