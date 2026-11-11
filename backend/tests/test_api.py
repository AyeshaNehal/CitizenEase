import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"ok": True}

def test_list_services():
    response = client.get("/api/v1/services")
    assert response.status_code == 200
    services = response.json()
    assert len(services) >= 4
    slugs = [s["slug"] for s in services]
    assert "domicile_prc" in slugs
    assert "first_cnic" in slugs
    assert "passport" in slugs
    assert "frc" in slugs

def test_service_detail():
    for slug in ["domicile_prc", "first_cnic", "passport", "frc"]:
        response = client.get(f"/api/v1/services/{slug}")
        assert response.status_code == 200
        data = response.json()
        assert data["service"]["slug"] == slug
        assert "source_summary" in data
        assert data["source_summary"]["verified_count"] >= 1

def test_passport_questionnaire_flow():
    # 1. Start passport questionnaire
    start_resp = client.post("/api/v1/questionnaire/start", json={
        "service_slug": "passport",
        "language": "en"
    })
    assert start_resp.status_code == 200
    session_id = start_resp.json()["session_id"]

    # 2. Answer renewal questions
    ans1 = client.post("/api/v1/questionnaire/answer", json={
        "session_id": session_id,
        "question_key": "passport_application_type",
        "answer": "renewal"
    })
    assert ans1.status_code == 200

    ans2 = client.post("/api/v1/questionnaire/answer", json={
        "session_id": session_id,
        "question_key": "is_applicant_minor",
        "answer": False
    })
    assert ans2.status_code == 200

    ans3 = client.post("/api/v1/questionnaire/answer", json={
        "session_id": session_id,
        "question_key": "is_government_employee",
        "answer": False
    })
    assert ans3.status_code == 200

    # 3. Generate checklist
    chk_resp = client.post("/api/v1/checklist/generate", json={
        "session_id": session_id
    })
    assert chk_resp.status_code == 200
    checklist_data = chk_resp.json()
    items = checklist_data["items"]
    codes = [i["code"] for i in items]
    assert "REQ_PASS_ORIG_CNIC" in codes
    assert "REQ_PASS_FEE_CHALLAN" in codes
    assert "REQ_PASS_PREV_PASSPORT" in codes

def test_frc_questionnaire_flow():
    start_resp = client.post("/api/v1/questionnaire/start", json={
        "service_slug": "frc",
        "language": "en"
    })
    assert start_resp.status_code == 200
    session_id = start_resp.json()["session_id"]

    ans1 = client.post("/api/v1/questionnaire/answer", json={
        "session_id": session_id,
        "question_key": "frc_category",
        "answer": "by_marriage"
    })
    assert ans1.status_code == 200

    ans2 = client.post("/api/v1/questionnaire/answer", json={
        "session_id": session_id,
        "question_key": "family_nadra_registered",
        "answer": True
    })
    assert ans2.status_code == 200

    chk_resp = client.post("/api/v1/checklist/generate", json={
        "session_id": session_id
    })
    assert chk_resp.status_code == 200
    items = chk_resp.json()["items"]
    codes = [i["code"] for i in items]
    assert "REQ_FRC_ORIG_CNIC" in codes
    assert "REQ_FRC_FAMILY_NUMBERS" in codes
    assert "REQ_FRC_MARRIAGE_RECORD" in codes

def test_sources_and_stale_detection():
    # 1. Full sources list
    resp = client.get("/api/v1/sources")
    assert resp.status_code == 200
    sources = resp.json()
    assert len(sources) >= 5

    # 2. Staleness audit endpoint
    stale_resp = client.get("/api/v1/sources/stale?threshold_days=30")
    assert stale_resp.status_code == 200
    stale_data = stale_resp.json()
    assert "threshold_days" in stale_data
    assert "stale_count" in stale_data
    assert "stale_sources" in stale_data

def test_b_form_flow():
    start_resp = client.post("/api/v1/questionnaire/start", json={
        "service_slug": "b_form",
        "language": "en"
    })
    assert start_resp.status_code == 200
    session_id = start_resp.json()["session_id"]

    client.post("/api/v1/questionnaire/answer", json={
        "session_id": session_id,
        "question_key": "has_birth_certificate",
        "answer": True
    })
    client.post("/api/v1/questionnaire/answer", json={
        "session_id": session_id,
        "question_key": "parents_marital_status_updated",
        "answer": True
    })
    client.post("/api/v1/questionnaire/answer", json={
        "session_id": session_id,
        "question_key": "parent_available_bform",
        "answer": True
    })

    chk_resp = client.post("/api/v1/checklist/generate", json={"session_id": session_id})
    assert chk_resp.status_code == 200
    data = chk_resp.json()
    codes = [i["code"] for i in data["items"]]
    assert "REQ_BFORM_UC_CERT" in codes
    assert "REQ_BFORM_PARENTS_CNIC" in codes
    assert "REQ_PARENT_BIOMETRIC" in codes
    assert data["readiness"]["score"] == 0

def test_birth_certificate_zero_verified_mandatory_null_score():
    start_resp = client.post("/api/v1/questionnaire/start", json={
        "service_slug": "birth_certificate",
        "language": "en"
    })
    assert start_resp.status_code == 200
    session_id = start_resp.json()["session_id"]

    client.post("/api/v1/questionnaire/answer", json={
        "session_id": session_id,
        "question_key": "birth_place_type",
        "answer": "hospital"
    })
    client.post("/api/v1/questionnaire/answer", json={
        "session_id": session_id,
        "question_key": "has_hospital_slip",
        "answer": True
    })
    client.post("/api/v1/questionnaire/answer", json={
        "session_id": session_id,
        "question_key": "parents_cnic_valid",
        "answer": True
    })
    client.post("/api/v1/questionnaire/answer", json={
        "session_id": session_id,
        "question_key": "has_parents_nikahnama",
        "answer": True
    })

    chk_resp = client.post("/api/v1/checklist/generate", json={"session_id": session_id})
    assert chk_resp.status_code == 200
    data = chk_resp.json()
    # Zero verified mandatory items -> readiness score MUST be None/null
    assert data["readiness"]["total"] == 0
    assert data["readiness"]["score"] is None
    assert "No verified requirements yet" in data["readiness"]["explanation"]

def test_smart_card_flow():
    start_resp = client.post("/api/v1/questionnaire/start", json={
        "service_slug": "smart_card",
        "language": "en"
    })
    assert start_resp.status_code == 200
    session_id = start_resp.json()["session_id"]

    client.post("/api/v1/questionnaire/answer", json={
        "session_id": session_id,
        "question_key": "smart_card_purpose",
        "answer": "fresh_18"
    })
    client.post("/api/v1/questionnaire/answer", json={
        "session_id": session_id,
        "question_key": "has_existing_id_doc",
        "answer": True
    })
    client.post("/api/v1/questionnaire/answer", json={
        "session_id": session_id,
        "question_key": "blood_relative_available",
        "answer": True
    })

    chk_resp = client.post("/api/v1/checklist/generate", json={"session_id": session_id})
    assert chk_resp.status_code == 200
    codes = [i["code"] for i in chk_resp.json()["items"]]
    assert "REQ_SMART_PREV_DOC" in codes
    assert "REQ_SMART_BIOMETRICS" in codes
    assert "REQ_SMART_ATTESTOR" in codes

def test_costs_endpoint_all_verified():
    # Passport 36 pages, 5 years, normal
    resp = client.post("/api/v1/costs/estimate", json={
        "items": [
            {
                "service_slug": "passport",
                "options": {"pages": 36, "validity_years": 5, "urgency": "normal"}
            }
        ]
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["all_verified"] is True
    assert data["total_verified_amount"] == 4500.0
    assert data["summary_label_en"] == "Rs 4,500"
    assert "estimate for preparation" in data["disclaimer_en"].lower()

def test_costs_endpoint_mixed_verified_unverified():
    # FRC has verified 1000 fee and unverified executive surcharge
    resp = client.post("/api/v1/costs/estimate", json={
        "items": [
            {
                "service_slug": "frc",
                "options": {}
            }
        ]
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["has_unverified"] is True
    assert data["total_verified_amount"] == 1000.0
    assert "At least Rs 1,000 (verified fees only)" in data["summary_label_en"]
    assert len(data["not_confirmed_block"]["items"]) >= 1
    assert data["not_confirmed_block"]["label_en"] == "Confirm with office"

def test_costs_endpoint_none_verified():
    # Birth Certificate has only unverified fees
    resp = client.post("/api/v1/costs/estimate", json={
        "items": [
            {
                "service_slug": "birth_certificate",
                "options": {}
            }
        ]
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_verified_amount"] is None
    assert data["summary_label_en"] == "No verified fees yet. Confirm with the office"

def test_costs_endpoint_option_changes():
    # Normal 5-year 36 pages -> 4,500
    resp1 = client.post("/api/v1/costs/estimate", json={
        "items": [{"service_slug": "passport", "options": {"pages": 36, "validity_years": 5, "urgency": "normal"}}]
    })
    assert resp1.status_code == 200
    assert resp1.json()["total_verified_amount"] == 4500.0

    # Urgent 10-year 36 pages -> 11,200
    resp2 = client.post("/api/v1/costs/estimate", json={
        "items": [{"service_slug": "passport", "options": {"pages": 36, "validity_years": 10, "urgency": "urgent"}}]
    })
    assert resp2.status_code == 200
    assert resp2.json()["total_verified_amount"] == 11200.0


