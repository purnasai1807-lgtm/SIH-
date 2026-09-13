from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.deps import get_db, require_role
from app.models.user import User, UserRole
from app.models.business import Business, Document
from app.models.financial import FinancialProfile, RepaymentRecord
from app.models.dependency import DependencyRecord, DependencyType
from app.models.loan import LoanOpportunity
from app.models.message import Notification
from app.schemas.business import (
    BusinessCreate, BusinessUpdate, BusinessOut, DocumentCreate, DocumentOut,
    FinancialProfileCreate, FinancialProfileOut, DependencyRecordCreate, DependencyRecordOut,
)
from app.schemas.risk import TrustHealthBreakdown, DependencyRiskReport
from app.schemas.loan import OpportunityCreate, OpportunityOut, RepaymentOut
from app.services.trust_health import compute_business_trust_health, compute_and_store_trust_health
from app.services.dependency_risk import compute_dependency_risk
router = APIRouter(prefix="/borrower", tags=["borrower"])
borrower_only = require_role(UserRole.BORROWER)
def _get_own_business(db: Session, user: User) -> Business:
    business = db.query(Business).filter(Business.owner_user_id == user.id).first()
    if not business:
        raise HTTPException(status_code=404, detail="No business profile found. Create one first.")
    return business
# ---- My Business ----
@router.post("/business", response_model=BusinessOut, status_code=201)
def create_business(
    payload: BusinessCreate, db: Session = Depends(get_db), user: User = Depends(borrower_only)
):
    existing = db.query(Business).filter(Business.owner_user_id == user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Business profile already exists")
    business = Business(owner_user_id=user.id, **payload.model_dump())
    db.add(business)
    db.commit()
    db.refresh(business)
    return business
@router.get("/business", response_model=BusinessOut)
def get_business(db: Session = Depends(get_db), user: User = Depends(borrower_only)):
    return _get_own_business(db, user)
@router.patch("/business", response_model=BusinessOut)
def update_business(
    payload: BusinessUpdate, db: Session = Depends(get_db), user: User = Depends(borrower_only)
):
    business = _get_own_business(db, user)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(business, field, value)
    db.commit()
    db.refresh(business)
    return business
# ---- Overview / Dashboard ----
@router.get("/dashboard")
def dashboard(db: Session = Depends(get_db), user: User = Depends(borrower_only)):
    business = _get_own_business(db, user)
    trust_health = compute_business_trust_health(db, business)
    dependency_report = compute_dependency_risk(db, business)
    latest_financials = sorted(business.financial_profiles, key=lambda p: p.period)[-1:] or None
    return {
        "business_health": trust_health,
        "financial_snapshot": (
            {
                "period": str(latest_financials[0].period),
                "revenue": float(latest_financials[0].revenue),
                "cash_flow": float(latest_financials[0].cash_flow),
                "profitability_margin": latest_financials[0].profitability_margin,
            }
            if latest_financials
            else None
        ),
        "risk_factors": [w.explanation for w in dependency_report.warnings],
        "application_status": business.verification_status.value,
    }
# ---- Application (funding request) ----
@router.post("/application", response_model=OpportunityOut, status_code=201)
def submit_application(
    payload: OpportunityCreate, db: Session = Depends(get_db), user: User = Depends(borrower_only)
):
    business = _get_own_business(db, user)
    opportunity = LoanOpportunity(business_id=business.id, **payload.model_dump())
    db.add(opportunity)
    db.commit()
    db.refresh(opportunity)
    return opportunity
@router.get("/application", response_model=list[OpportunityOut])
def list_applications(db: Session = Depends(get_db), user: User = Depends(borrower_only)):
    business = _get_own_business(db, user)
    return business.opportunities
# ---- Business Health ----
@router.get("/business-health", response_model=TrustHealthBreakdown)
def business_health(db: Session = Depends(get_db), user: User = Depends(borrower_only)):
    business = _get_own_business(db, user)
    snapshot = compute_and_store_trust_health(db, business)
    result = compute_business_trust_health(db, business)
    return TrustHealthBreakdown(
        score=float(snapshot.score),
        verification_component=float(snapshot.verification_component),
        financial_component=float(snapshot.financial_component),
        repayment_component=float(snapshot.repayment_component),
        stability_component=float(snapshot.stability_component),
        dependency_component=float(snapshot.dependency_component),
        computed_at=snapshot.computed_at,
        explanation=result["explanation"],
    )
# ---- Financial Profile ----
@router.post("/financial-profile", response_model=FinancialProfileOut, status_code=201)
def add_financial_profile(
    payload: FinancialProfileCreate, db: Session = Depends(get_db), user: User = Depends(borrower_only)
):
    business = _get_own_business(db, user)
    profile = FinancialProfile(business_id=business.id, **payload.model_dump())
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile
@router.get("/financial-profile", response_model=list[FinancialProfileOut])
def list_financial_profile(db: Session = Depends(get_db), user: User = Depends(borrower_only)):
    business = _get_own_business(db, user)
    return sorted(business.financial_profiles, key=lambda p: p.period)
# ---- Repayment Behaviour (read-only; lenders record actual repayments) ----
@router.get("/repayments", response_model=list[RepaymentOut])
def list_repayments(db: Session = Depends(get_db), user: User = Depends(borrower_only)):
    business = _get_own_business(db, user)
    return (
        db.query(RepaymentRecord)
        .filter(RepaymentRecord.business_id == business.id)
        .order_by(RepaymentRecord.due_date)
        .all()
    )
# ---- Dependency Profile ----
@router.post("/dependencies", response_model=DependencyRecordOut, status_code=201)
def add_dependency_record(
    payload: DependencyRecordCreate, db: Session = Depends(get_db), user: User = Depends(borrower_only)
):
    business = _get_own_business(db, user)
    record = DependencyRecord(
        business_id=business.id,
        type=DependencyType(payload.type),
        entity_name=payload.entity_name,
        share_pct=payload.share_pct,
        period=payload.period,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record
@router.get("/dependencies", response_model=DependencyRiskReport)
def dependency_profile(db: Session = Depends(get_db), user: User = Depends(borrower_only)):
    business = _get_own_business(db, user)
    return compute_dependency_risk(db, business)
# ---- Improvement Insights ----
@router.get("/improvement-insights")
def improvement_insights(db: Session = Depends(get_db), user: User = Depends(borrower_only)):
    business = _get_own_business(db, user)
    result = compute_business_trust_health(db, business)
    dependency_report = compute_dependency_risk(db, business)
    insights = []
    if result["verification_component"] < 80:
        insights.append("Complete business and owner verification to raise your trust health score.")
    if result["financial_component"] < 60:
        insights.append("Submit more recent financial periods with positive cash flow to strengthen your financial health signal.")
    if result["repayment_component"] < 70:
        insights.append("Keep upcoming repayments on schedule — repayment consistency is weighted heavily in your score.")
    if result["stability_component"] < 50:
        insights.append("Longer operating history steadily improves your stability score over time.")
    for w in dependency_report.warnings:
        if w.is_material:
            insights.append(f"Consider diversifying away from {w.entity_name} — {w.explanation}")
    if not insights:
        insights.append("Your business health profile looks strong across all tracked components.")
    return {"insights": insights}
# ---- Documents ----
@router.post("/documents", response_model=DocumentOut, status_code=201)
def upload_document(
    payload: DocumentCreate, db: Session = Depends(get_db), user: User = Depends(borrower_only)
):
    business = _get_own_business(db, user)
    document = Document(business_id=business.id, **payload.model_dump())
    db.add(document)
    db.commit()
    db.refresh(document)
    return document
@router.get("/documents", response_model=list[DocumentOut])
def list_documents(db: Session = Depends(get_db), user: User = Depends(borrower_only)):
    business = _get_own_business(db, user)
    return business.documents
# ---- Notifications ----
@router.get("/notifications")
def list_notifications(db: Session = Depends(get_db), user: User = Depends(borrower_only)):
    notifications = (
        db.query(Notification)
        .filter(Notification.user_id == user.id)
        .order_by(Notification.created_at.desc())
        .all()
    )
    return notifications
