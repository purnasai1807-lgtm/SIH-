from datetime import date, datetime
from pydantic import BaseModel
from app.models.loan import OpportunityStatus, LoanStatus
from app.models.financial import RepaymentStatus
class OpportunityCreate(BaseModel):
    amount_requested: float
    purpose: str | None = None
class OpportunityOut(BaseModel):
    id: int
    business_id: int
    amount_requested: float
    purpose: str | None
    status: OpportunityStatus
    created_at: datetime
    class Config:
        from_attributes = True
class OpportunityWithHealth(OpportunityOut):
    business_name: str
    industry: str
    region: str
    trust_health_score: float | None
    verification_status: str
class LendRequest(BaseModel):
    opportunity_id: int
    amount_lent: float
    downside_tolerance: float
class LoanOut(BaseModel):
    id: int
    opportunity_id: int
    lender_id: int
    business_id: int
    amount_lent: float
    downside_tolerance: float
    status: LoanStatus
    funded_at: datetime
    class Config:
        from_attributes = True
class RepaymentCreate(BaseModel):
    due_date: date
    amount_due: float
    paid_date: date | None = None
    amount_paid: float = 0
    status: RepaymentStatus = RepaymentStatus.ON_TIME
class RepaymentOut(BaseModel):
    id: int
    business_id: int
    loan_id: int | None
    due_date: date
    paid_date: date | None
    amount_due: float
    amount_paid: float
    status: RepaymentStatus
    class Config:
        from_attributes = True
class MessageCreate(BaseModel):
    recipient_id: int
    body: str
    loan_id: int | None = None
