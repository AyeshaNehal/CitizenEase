from typing import List, Optional
from pydantic import BaseModel

class SourceRef(BaseModel):
    title: str
    url: Optional[str] = None
    last_verified_on: Optional[str] = None

class ChecklistItemResponse(BaseModel):
    item_id: str
    code: str
    title: str
    why_needed: str
    applicability: str # mandatory, conditional, optional
    verification_status: str # verified, unverified
    user_status: str = "missing" # have, missing, not_sure
    source: SourceRef

class ReadinessResponse(BaseModel):
    score: Optional[int] = None # null if total == 0
    ready: int
    total: int
    missing: List[str] = []
    conditional: List[str] = []
    unverified: List[str] = []
    explanation: str
    is_guarantee: bool = False

class ChecklistResponse(BaseModel):
    checklist_id: str
    items: List[ChecklistItemResponse]
    readiness: ReadinessResponse
    disclaimers: List[str] = [
        "Guidance only. This is preparation, not official government approval."
    ]

class ChecklistGenerateRequest(BaseModel):
    session_id: str

class ItemStatusUpdate(BaseModel):
    item_id: str
    user_status: str # have, missing, not_sure

class ChecklistBatchUpdateRequest(BaseModel):
    updates: List[ItemStatusUpdate]

class ChecklistUpdateResponse(BaseModel):
    items: List[ChecklistItemResponse]
    readiness: ReadinessResponse
