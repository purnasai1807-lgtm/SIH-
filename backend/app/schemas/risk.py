from datetime import datetime
from pydantic import BaseModel
class TrustHealthBreakdown(BaseModel):
    score: float
    verification_component: float
    financial_component: float
    repayment_component: float
    stability_component: float
    dependency_component: float
    computed_at: datetime
    explanation: list[str]
    class Config:
        from_attributes = True
class DependencyWarning(BaseModel):
    type: str
    entity_name: str
    share_pct: float
    trend: str  # "increasing" | "decreasing" | "stable"
    is_material: bool
    explanation: str
class DependencyRiskReport(BaseModel):
    business_id: int
    concentration_index: float  # Herfindahl-style index, 0-1
    warnings: list[DependencyWarning]
class AlertOut(BaseModel):
    id: int
    business_id: int
    severity: str
    category: str
    cause: str
    description: str
    trend: str | None
    status: str
    created_at: datetime
    class Config:
        from_attributes = True
class MonitoringEventOut(BaseModel):
    id: int
    business_id: int
    metric: str
    previous_value: float
    new_value: float
    change_pct: float
    detected_at: datetime
    class Config:
        from_attributes = True
class LenderHealthReport(BaseModel):
    lender_id: int
    total_exposure: float
    diversification_index: float  # 0-1, higher = more diversified
    sector_concentration: dict[str, float]
    region_concentration: dict[str, float]
    shared_dependency_warnings: list[str]
