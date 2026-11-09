from fastapi import APIRouter
from typing import List, Optional
from app.schemas.catalog import OfficeItem
from app.modules.catalog.service import CatalogService

router = APIRouter(tags=["offices"])

@router.get("/offices", response_model=List[OfficeItem])
def get_offices(service: Optional[str] = None, district: Optional[str] = None):
    return CatalogService.get_offices(service_slug=service, district=district)
