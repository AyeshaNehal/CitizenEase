import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"ok": True}

def test_list_services():
    response = client.get("/api/v1/services")
    assert response.status_code == 200
    services = response.json()
    assert len(services) >= 2
    slugs = [s["slug"] for s in services]
    assert "domicile_prc" in slugs
    assert "first_cnic" in slugs

def test_service_detail():
    response = client.get("/api/v1/services/domicile_prc")
    assert response.status_code == 200
    data = response.json()
    assert data["service"]["slug"] == "domicile_prc"
    assert "source_summary" in data
    assert data["source_summary"]["verified_count"] >= 1

def test_questionnaire_flow_and_checklist_generation():
    # 1. Start questionnaire
    start_resp = client.post("/api/v1/questionnaire/start", json={
        "service_slug": "domicile_prc",
        "language": "en"
    })
    assert start_resp.status_code == 200
    session_data = start_resp.json()
    session_id = session_data["session_id"]
    assert session_id is not None

    # 2. Answer questions
    ans1 = client.post("/api/v1/questionnaire/answer", json={
        "session_id": session_id,
        "question_key": "applicant_age_group",
        "answer": True
    })
    assert ans1.status_code == 200

    ans2 = client.post("/api/v1/questionnaire/answer", json={
        "session_id": session_id,
        "question_key": "district",
        "answer": "karachi_south"
    })
    assert ans2.status_code == 200

    ans3 = client.post("/api/v1/questionnaire/answer", json={
        "session_id": session_id,
        "question_key": "application_goal",
        "answer": "university_admission"
    })
    assert ans3.status_code == 200

    ans4 = client.post("/api/v1/questionnaire/answer", json={
        "session_id": session_id,
        "question_key": "has_father_domicile",
        "answer": True
    })
    assert ans4.status_code == 200

    # 3. Generate checklist
    chk_resp = client.post("/api/v1/checklist/generate", json={
        "session_id": session_id
    })
    assert chk_resp.status_code == 200
    checklist_data = chk_resp.json()
    assert "checklist_id" in checklist_data
    items = checklist_data["items"]
    assert len(items) >= 3

    # Check readiness structure
    readiness = checklist_data["readiness"]
    assert readiness["score"] == 0 # None marked have yet
    assert readiness["total"] >= 1

    # 4. Patch items status
    chk_id = checklist_data["checklist_id"]
    first_item_id = items[0]["item_id"]
    patch_resp = client.patch(f"/api/v1/checklist/{chk_id}/items", json={
        "updates": [{"item_id": first_item_id, "user_status": "have"}]
    })
    assert patch_resp.status_code == 200
    updated_readiness = patch_resp.json()["readiness"]
    assert updated_readiness["ready"] >= 1
    assert updated_readiness["score"] > 0
