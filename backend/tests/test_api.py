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

