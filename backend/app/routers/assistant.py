from fastapi import APIRouter
from app.schemas.assistant import ChatRequest, ChatResponse
from app.modules.assistant.service import AssistantService

router = APIRouter(prefix="/assistant", tags=["assistant"])

@router.post("/chat", response_model=ChatResponse)
def assistant_chat(payload: ChatRequest):
    return AssistantService.chat(
        session_id=payload.session_id,
        checklist_id=payload.checklist_id,
        message=payload.message,
        language=payload.language
    )
