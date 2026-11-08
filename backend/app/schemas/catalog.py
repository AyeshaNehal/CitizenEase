from typing import List, Optional
from pydantic import BaseModel

class ServiceListItem(BaseModel):
    id: str
    slug: str
    title: str
    description: str
    icon: str

class ApplicationType(BaseModel):
    id: str
    slug: str
    title_en: str
    title_ur: str

class ServiceDetail(BaseModel):
    id: str
    slug: str
    title_en: str
    title_ur: str
    description_en: str
    description_ur: str
    keywords: List[str] = []

class SourceSummary(BaseModel):
    verified_count: int
    unverified_count: int
    last_verified_on: Optional[str] = None

class ServiceDetailResponse(BaseModel):
    service: ServiceDetail
    application_types: List[ApplicationType] = []
    source_summary: SourceSummary

class OfficeItem(BaseModel):
    id: str
    name: str
    office_type: str
    district: str
    address: str
    lat: float
    lng: float
    services: List[str]
    source_id: str
    verification_status: str
    last_verified_on: str
    hours_note: Optional[str] = None
    notes: Optional[str] = None

class FeeItem(BaseModel):
    label: str
    amount_pkr: Optional[float] = None
    verification_status: str
    source: str

class SourceItem(BaseModel):
    id: str
    title: str
    url: Optional[str] = None
    issuing_authority: str
    source_type: str
    verification_status: str
    last_verified_on: str
    notes: Optional[str] = None
    limitations: Optional[str] = None
