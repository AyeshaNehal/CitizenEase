from fastapi import APIRouter, HTTPException, Depends
from typing import Optional, Dict, Any
from backend.app.schemas.questionnaire import (
    StartQuestionnaireRequest,
    StartQuestionnaireResponse,
    AnswerQuestionnaireRequest,
    AnswerQuestionnaireResponse
)
from backend.app.modules.questionnaire.service import QuestionnaireService
from backend.app.dependencies.auth import get_current_user_optional

router = APIRouter(prefix="/questionnaire", tags=["questionnaire"])

@router.post("/start", response_model=StartQuestionnaireResponse)
def start_questionnaire(payload: StartQuestionnaireRequest, current_user: Optional[Dict[str, Any]] = Depends(get_current_user_optional)):
    try:
        user_id = current_user.get("id") if current_user else None
        return QuestionnaireService.start_session(payload.service_slug, payload.language, user_id=user_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/answer", response_model=AnswerQuestionnaireResponse)
def answer_question(payload: AnswerQuestionnaireRequest):
    try:
        return QuestionnaireService.answer_question(payload.session_id, payload.question_key, payload.answer)
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
