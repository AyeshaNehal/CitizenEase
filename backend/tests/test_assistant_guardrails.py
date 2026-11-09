import pytest
from app.modules.assistant.service import AssistantService

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
    assert dom_intent["confidence"] > 0.9

    cnic_intent = AssistantService.discover_intent("I am turning 18 and need my first CNIC from nadra")
    assert cnic_intent["service_slug"] == "first_cnic"
