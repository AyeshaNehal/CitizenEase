from fastapi import APIRouter, HTTPException, Depends
from typing import Optional, Dict, Any, List
from backend.app.schemas.checklist import (
    ChecklistGenerateRequest,
    ChecklistResponse,
    ChecklistBatchUpdateRequest,
    ChecklistUpdateResponse
)
from backend.app.modules.checklist.service import ChecklistService
from backend.app.dependencies.auth import get_current_user_optional, get_current_user_required
from backend.app.db.storage import DatabaseStorage

router = APIRouter(prefix="/checklist", tags=["checklist"])

@router.post("/generate", response_model=ChecklistResponse)
def generate_checklist(payload: ChecklistGenerateRequest, current_user: Optional[Dict[str, Any]] = Depends(get_current_user_optional)):
    try:
        user_id = current_user.get("id") if current_user else None
        return ChecklistService.generate_checklist(payload.session_id, user_id=user_id)
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/user/all")
def get_user_checklists(current_user: Dict[str, Any] = Depends(get_current_user_required)):
    return DatabaseStorage.list_checklists_for_user(current_user["id"])

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
