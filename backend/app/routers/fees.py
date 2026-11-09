from fastapi import APIRouter
from typing import List
from app.schemas.catalog import FeeItem
from app.modules.catalog.service import CatalogService

router = APIRouter(tags=["fees"])

@router.get("/fees/{service_slug}", response_model=List[FeeItem])
def get_fees(service_slug: str):
    return CatalogService.get_fees(service_slug)
