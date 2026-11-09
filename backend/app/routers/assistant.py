from fastapi import APIRouter
from backend.app.schemas.assistant import ChatRequest, ChatResponse
from backend.app.modules.assistant.service import AssistantService

router = APIRouter(tags=["assistant"])

@router.post("/assistant/chat", response_model=ChatResponse)
def assistant_chat(payload: ChatRequest):
    return AssistantService.chat(
        session_id=payload.session_id or "anonymous",
        checklist_id=payload.checklist_id,
        message=payload.message or payload.question or "",
        language=payload.language,
        checklist_items=payload.checklist_items
    )
