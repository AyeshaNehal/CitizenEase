from fastapi import APIRouter, HTTPException
from backend.app.schemas.checklist import (
    ChecklistGenerateRequest,
    ChecklistResponse,
    ChecklistBatchUpdateRequest,
    ChecklistUpdateResponse
)
from backend.app.modules.checklist.service import ChecklistService

router = APIRouter(prefix="/checklist", tags=["checklist"])

@router.post("/generate", response_model=ChecklistResponse)
def generate_checklist(payload: ChecklistGenerateRequest):
    try:
        return ChecklistService.generate_checklist(payload.session_id)
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{checklist_id}", response_model=ChecklistResponse)
def get_checklist(checklist_id: str):
    checklist = ChecklistService.get_checklist(checklist_id)
    if not checklist:
        raise HTTPException(status_code=404, detail="Checklist not found")
    return checklist

@router.patch("/{checklist_id}/items", response_model=ChecklistUpdateResponse)
def update_checklist_items(checklist_id: str, payload: ChecklistBatchUpdateRequest):
    try:
        updates = [u.model_dump() for u in payload.updates]
        return ChecklistService.update_items(checklist_id, updates)
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))
