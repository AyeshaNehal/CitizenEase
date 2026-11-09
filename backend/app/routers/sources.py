from fastapi import APIRouter
from typing import List, Optional
from backend.app.schemas.catalog import SourceItem
from backend.app.modules.catalog.service import CatalogService

router = APIRouter(tags=["sources"])

@router.get("/sources/{service_slug}", response_model=List[SourceItem])
def get_sources(service_slug: str):
    return CatalogService.get_sources(service_slug)
