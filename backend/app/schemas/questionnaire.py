from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field

class QuestionOption(BaseModel):
    value: Any
    label_en: str
    label_ur: str
    order_index: int = 0

class QuestionCondition(BaseModel):
    depends_on_key: str
    operator: str # eq, neq, in
    value: Any

class QuestionSchema(BaseModel):
    key: str
    text_en: str
    text_ur: str
    input_type: str # single_choice, boolean, district
    order_index: int
    required: bool = True
    options: List[QuestionOption] = []
    conditions: Optional[Dict[str, Any]] = None

class ProgressSchema(BaseModel):
    current_step: int
    total_estimated: int

class StartQuestionnaireRequest(BaseModel):
    service_slug: str
    language: str = "en"

class StartQuestionnaireResponse(BaseModel):
    session_id: str
    question: Optional[QuestionSchema] = None
    progress: ProgressSchema

class AnswerQuestionnaireRequest(BaseModel):
    session_id: str
    question_key: str
    answer: Any

class AnswerQuestionnaireResponse(BaseModel):
    next_question: Optional[QuestionSchema] = None
    done: bool
    progress: ProgressSchema
    visible_keys: List[str] = []
