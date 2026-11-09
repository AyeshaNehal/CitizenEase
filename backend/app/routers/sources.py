from fastapi import APIRouter
from typing import List, Optional, Dict, Any
from backend.app.schemas.catalog import SourceItem
from backend.app.modules.catalog.service import CatalogService

router = APIRouter(tags=["sources"])

@router.get("/sources", response_model=List[SourceItem])
def list_all_sources():
    """Retrieve full verification registry across all civic services."""
    return CatalogService.get_sources()

@router.get("/sources/stale")
def get_stale_sources(threshold_days: int = 90):
    """Auto-detect sources needing periodic audit per Section 6 & 15 of blueprint."""
    stale = CatalogService.get_stale_sources(threshold_days=threshold_days)
    return {
        "threshold_days": threshold_days,
        "stale_count": len(stale),
        "stale_sources": stale
    }

@router.get("/sources/{service_slug}", response_model=List[SourceItem])
def get_sources_by_service(service_slug: str):
    """Retrieve verified sources filtered by civic service slug."""
    return CatalogService.get_sources(service_slug)
