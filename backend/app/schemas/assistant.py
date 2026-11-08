from typing import List, Optional
from pydantic import BaseModel, Field

class Citation(BaseModel):
    source_id: str
    title: str
    url: Optional[str] = None
    last_verified_on: Optional[str] = None

class ChatRequest(BaseModel):
    session_id: str
    checklist_id: Optional[str] = None
    message: str = Field(..., max_length=500)
    language: str = "en"

class ChatResponse(BaseModel):
    answer: str
    citations: List[Citation] = []
    needs_confirmation: bool = False
    suggested_actions: List[str] = []

class DiscoverRequest(BaseModel):
    text: str = Field(..., max_length=500)
    language: str = "en"

class DiscoverResponse(BaseModel):
    service_slug: Optional[str] = None
    confidence: float
    clarifying_question: Optional[str] = None
