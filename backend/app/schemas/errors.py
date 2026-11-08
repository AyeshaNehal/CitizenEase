from pydantic import BaseModel

class ErrorDetail(BaseModel):
    code: str
    message: str
    retryable: bool = False

class ErrorResponse(BaseModel):
    error: ErrorDetail
