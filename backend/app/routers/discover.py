from fastapi import APIRouter
from backend.app.schemas.assistant import DiscoverRequest, DiscoverResponse
from backend.app.modules.assistant.service import AssistantService

router = APIRouter(tags=["discovery"])

@router.post("/discover", response_model=DiscoverResponse)
def discover_service(payload: DiscoverRequest):
    return AssistantService.discover_intent(payload.text, payload.language)
