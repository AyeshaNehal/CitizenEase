from fastapi import APIRouter, HTTPException
from backend.app.schemas.questionnaire import (
    StartQuestionnaireRequest,
    StartQuestionnaireResponse,
    AnswerQuestionnaireRequest,
    AnswerQuestionnaireResponse
)
from backend.app.modules.questionnaire.service import QuestionnaireService

router = APIRouter(prefix="/questionnaire", tags=["questionnaire"])

@router.post("/start", response_model=StartQuestionnaireResponse)
def start_questionnaire(payload: StartQuestionnaireRequest):
    try:
        return QuestionnaireService.start_session(payload.service_slug, payload.language)
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
