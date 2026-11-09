import pytest
from app.modules.rules.evaluator import evaluate_condition, evaluate_rules, compute_rules_version

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
