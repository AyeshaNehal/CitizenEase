from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from backend.app.config import settings
from backend.app.routers import (
    services,
    questionnaire,
    checklist,
    assistant,
    offices,
    fees,
    sources,
    discover
)

app = FastAPI(
    title="CitizenEase API",
    description="Karachi citizen preparation and guidance API for Domicile/PRC & first-time CNIC.",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins if settings.cors_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Uniform error handlers
@app.exception_handler(StarletteHTTPException)
async def custom_http_exception_handler(request: Request, exc: StarletteHTTPException):
    code_map = {
        400: "validation_error",
        404: "not_found",
        409: "conflict",
        422: "schema_error",
        429: "rate_limited",
        502: "provider_unavailable",
        500: "internal"
    }
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": code_map.get(exc.status_code, "error"),
                "message": str(exc.detail),
                "retryable": exc.status_code in [429, 502, 503]
            }
        }
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": {
                "code": "schema_error",
                "message": str(exc.errors()),
                "retryable": False
            }
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "code": "internal",
                "message": "An internal server error occurred.",
                "retryable": True
            }
        }
    )

# Health endpoint (both at root and /api/v1/health)
@app.get("/health", tags=["health"])
@app.get("/api/v1/health", tags=["health"])
def health_check():
    return {"ok": True}

# Register /api/v1 routers
api_prefix = "/api/v1"
app.include_router(services.router, prefix=api_prefix)
app.include_router(questionnaire.router, prefix=api_prefix)
app.include_router(checklist.router, prefix=api_prefix)
app.include_router(assistant.router, prefix=api_prefix)
app.include_router(offices.router, prefix=api_prefix)
app.include_router(fees.router, prefix=api_prefix)
app.include_router(sources.router, prefix=api_prefix)
app.include_router(discover.router, prefix=api_prefix)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
