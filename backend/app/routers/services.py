from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.schemas.catalog import ServiceListItem, ServiceDetailResponse
from app.modules.catalog.service import CatalogService

router = APIRouter(tags=["services"])

@router.get("/services", response_model=List[ServiceListItem])
def list_services(q: Optional[str] = None, lang: str = Query("en", pattern="^(en|ur)$")):
    services = CatalogService.get_services(lang=lang)
    if q:
        q_lower = q.lower()
        services = [s for s in services if q_lower in s["title"].lower() or q_lower in s["description"].lower()]
    return services

@router.get("/services/{slug}", response_model=ServiceDetailResponse)
def get_service_detail(slug: str):
    detail = CatalogService.get_service_by_slug(slug)
    if not detail:
        raise HTTPException(status_code=404, detail="Service slug not found")
    return detail
