import pytest
from app.modules.readiness.calculator import calculate_readiness

def test_readiness_score_calculation():
    # 2 verified mandatory (1 have, 1 missing) -> 50%
    # 1 unverified mandatory (have) -> excluded from denominator!
    # 1 verified conditional -> excluded from denominator!
    items = [
        {"title_en": "Item 1", "verification_status": "verified", "applicability": "mandatory", "user_status": "have"},
        {"title_en": "Item 2", "verification_status": "verified", "applicability": "mandatory", "user_status": "missing"},
        {"title_en": "Item 3", "verification_status": "unverified", "applicability": "mandatory", "user_status": "have"},
        {"title_en": "Item 4", "verification_status": "verified", "applicability": "conditional", "user_status": "have"},
    ]
    res = calculate_readiness(items)
    assert res["total"] == 2
    assert res["ready"] == 1
    assert res["score"] == 50
    assert "Item 2" in res["missing"]
    assert "Item 3" in res["unverified"]
    assert "Item 4" in res["conditional"]
    assert res["is_guarantee"] is False

def test_readiness_zero_verified():
    # When total verified mandatory is 0, score must be null (never 0% or 100%)
    items = [
        {"title_en": "Item 1", "verification_status": "unverified", "applicability": "mandatory", "user_status": "have"}
    ]
    res = calculate_readiness(items)
    assert res["total"] == 0
    assert res["score"] is None
    assert "No verified requirements yet" in res["explanation"]
