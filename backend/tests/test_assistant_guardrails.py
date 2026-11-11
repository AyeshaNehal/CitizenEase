import pytest
from fastapi import HTTPException
from backend.app.modules.assistant.service import AssistantService

def test_cnic_sanitization():
    raw_1 = "My CNIC is 42101-1234567-1 please assist"
    raw_2 = "Number: 4210112345671"
    assert "[REDACTED_CNIC]" in AssistantService.sanitize_input(raw_1)
    assert "42101-1234567-1" not in AssistantService.sanitize_input(raw_1)
    assert "[REDACTED_CNIC]" in AssistantService.sanitize_input(raw_2)

def test_fee_refusal_guardrail():
    res = AssistantService.chat(
        session_id="test",
        checklist_id=None,
        message="What is the exact urgent fee in rupees?"
    )
    assert res["needs_confirmation"] is True
    assert "Official fees are determined by the respective government department" in res["answer"]
    assert "confirm the exact fee" in res["answer"]

def test_guarantee_refusal_guardrail():
    res = AssistantService.chat(
        session_id="test",
        checklist_id=None,
        message="Can you guarantee my approval?"
    )
    assert res["needs_confirmation"] is True
    assert "Legal eligibility and final document approval" in res["answer"]

def test_intent_discovery():
    dom_intent = AssistantService.discover_intent("I need proof I belong to Karachi for university")
    assert dom_intent["service_slug"] == "domicile_prc"
    assert dom_intent["confidence"] > 0.8

    cnic_intent = AssistantService.discover_intent("I am turning 18 and need my first CNIC from nadra")
    assert cnic_intent["service_slug"] == "first_cnic"

def test_message_length_limit():
    long_msg = "A" * 501
    with pytest.raises(HTTPException) as excinfo:
        AssistantService.chat(
            session_id="length-test",
            checklist_id=None,
            message=long_msg
        )
    assert excinfo.value.status_code == 400
    assert "exceeds maximum allowed length" in excinfo.value.detail

def test_per_session_rate_limit():
    import uuid
    sess_id = f"quota-test-session-{uuid.uuid4()}"
    for i in range(20):
        res = AssistantService.chat(
            session_id=sess_id,
            checklist_id=None,
            message=f"Question number {i+1}"
        )
        assert "answer" in res

    # 21st question must hit rate limit
    with pytest.raises(HTTPException) as excinfo:
        AssistantService.chat(
            session_id=sess_id,
            checklist_id=None,
            message="Question number 21"
        )
    assert excinfo.value.status_code == 429
    assert "Per-session limit of 20 messages reached" in excinfo.value.detail
