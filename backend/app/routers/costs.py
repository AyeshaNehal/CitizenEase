from fastapi import APIRouter, HTTPException, Body
from typing import List, Dict, Any, Optional, Union
from pydantic import BaseModel, Field
from backend.app.modules.costs.service import CostCalculatorService

router = APIRouter(tags=["costs"])

class ServiceCostOption(BaseModel):
    service_slug: str
    options: Dict[str, Any] = Field(default_factory=dict)

class EstimateCostRequest(BaseModel):
    items: Optional[List[ServiceCostOption]] = None
    services: Optional[List[ServiceCostOption]] = None

@router.get("/costs/{service_slug}")
def get_service_costs(service_slug: str):
    try:
        return CostCalculatorService.get_service_fees(service_slug)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Service '{service_slug}' not found.")

@router.post("/costs/estimate")
def estimate_costs(
    payload: Union[EstimateCostRequest, List[Dict[str, Any]], Dict[str, Any]] = Body(...)
):
    requests_list: List[Dict[str, Any]] = []

    if isinstance(payload, list):
        requests_list = payload
    elif isinstance(payload, EstimateCostRequest):
        items = payload.items or payload.services or []
        requests_list = [item.model_dump() for item in items]
    elif isinstance(payload, dict):
        if "items" in payload and isinstance(payload["items"], list):
            requests_list = payload["items"]
        elif "services" in payload and isinstance(payload["services"], list):
            requests_list = payload["services"]
        elif "service_slug" in payload:
            requests_list = [payload]
        else:
            requests_list = []

    if not requests_list:
        raise HTTPException(status_code=400, detail="Must provide at least one service request in 'items' or 'services'.")

    return CostCalculatorService.estimate_costs(requests_list)
