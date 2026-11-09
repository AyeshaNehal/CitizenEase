from typing import List, Optional, Any
from pydantic import BaseModel, Field, model_validator

class Citation(BaseModel):
    id: Optional[str] = None
    source_id: Optional[str] = None
    title: str
    url: Optional[str] = None
    issuing_authority: Optional[str] = "Official Authority"
    last_verified_on: Optional[str] = None
    verification_status: Optional[str] = "verified"

    @model_validator(mode="before")
    @classmethod
    def sync_id(cls, values):
        if isinstance(values, dict):
            if "source_id" in values and "id" not in values:
                values["id"] = values["source_id"]
            elif "id" in values and "source_id" not in values:
                values["source_id"] = values["id"]
        return values

class ChatRequest(BaseModel):
    session_id: Optional[str] = "anonymous"
    checklist_id: Optional[str] = None
    message: Optional[str] = None
    question: Optional[str] = None
    checklist_items: Optional[List[Any]] = []
    language: str = "en"

    @model_validator(mode="before")
    @classmethod
    def resolve_message(cls, values):
        if isinstance(values, dict):
            if not values.get("message") and values.get("question"):
                values["message"] = values["question"]
            elif not values.get("question") and values.get("message"):
                values["question"] = values["message"]
        return values

class ChatResponse(BaseModel):
    answer: str
    citations: List[Citation] = []
    needs_confirmation: bool = False
    needs_official_confirmation: Optional[bool] = False
    suggested_actions: List[str] = []

    @model_validator(mode="before")
    @classmethod
    def sync_confirmation(cls, values):
        if isinstance(values, dict):
            if "needs_official_confirmation" in values and "needs_confirmation" not in values:
                values["needs_confirmation"] = values["needs_official_confirmation"]
            elif "needs_confirmation" in values and "needs_official_confirmation" not in values:
                values["needs_official_confirmation"] = values["needs_confirmation"]
        return values

class DiscoverRequest(BaseModel):
    text: str = Field(..., max_length=500)
    language: str = "en"

class DiscoverResponse(BaseModel):
    service_slug: Optional[str] = None
    confidence: float
    clarifying_question: Optional[str] = None
    clarifying_question_en: Optional[str] = None
    clarifying_question_ur: Optional[str] = None
    summary_en: Optional[str] = None
    summary_ur: Optional[str] = None
