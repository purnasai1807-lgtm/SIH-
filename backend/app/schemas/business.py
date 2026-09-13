from datetime import date, datetime
from pydantic import BaseModel, Field
from app.models.business import VerificationStatus, DocumentType, DocumentStatus
class BusinessCreate(BaseModel):
    legal_name: str
    registration_number: str | None = None
    industry: str
    region: str
    operating_history_years: float = 0
class BusinessUpdate(BaseModel):
    legal_name: str | None = None
    registration_number: str | None = None
    industry: str | None = None
    region: str | None = None
    operating_history_years: float | None = None
class BusinessOut(BaseModel):
    id: int
    owner_user_id: int
    legal_name: str
    registration_number: str | None
    industry: str
    region: str
    operating_history_years: float
    verification_status: VerificationStatus
    created_at: datetime
    class Config:
        from_attributes = True
class DocumentOut(BaseModel):
    id: int
    doc_type: DocumentType
    file_url: str
    status: DocumentStatus
    uploaded_at: datetime
    class Config:
        from_attributes = True
class DocumentCreate(BaseModel):
    doc_type: DocumentType
    file_url: str
class FinancialProfileCreate(BaseModel):
    period: date
    revenue: float
    expenses: float
    cash_flow: float
    outstanding_debt: float = 0
class FinancialProfileOut(BaseModel):
    id: int
    period: date
    revenue: float
    expenses: float
    cash_flow: float
    outstanding_debt: float
    profitability_margin: float
    class Config:
        from_attributes = True
class DependencyRecordCreate(BaseModel):
    type: str
    entity_name: str
    share_pct: float = Field(ge=0, le=1)
    period: date
class DependencyRecordOut(BaseModel):
    id: int
    type: str
    entity_name: str
    share_pct: float
    period: date
    class Config:
        from_attributes = True
