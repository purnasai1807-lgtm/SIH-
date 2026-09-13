from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.core.deps import get_db, require_role
from app.services.audit import record_audit
from app.models.user import User, UserRole
from app.models.business import Business, VerificationStatus
from app.models.loan import LoanOpportunity, Loan, OpportunityStatus, LoanStatus
from app.models.trust_health import BusinessTrustHealthSnapshot
from app.models.message import Message
from app.models.financial import RepaymentRecord
from app.schemas.risk import TrustHealthBreakdown, DependencyRiskReport, AlertOut, LenderHealthReport
from app.schemas.loan import (
    OpportunityOut, OpportunityWithHealth, LendRequest, LoanOut,
    RepaymentCreate, RepaymentOut, MessageCreate,
)
from app.services.trust_health import compute_business_trust_health
from app.services.dependency_risk import compute_dependency_risk
from app.services.lender_health import compute_lender_portfolio_health
from app.services.alerts import list_alerts
router = APIRouter(prefix="/lender", tags=["lender"])
lender_only = require_role(UserRole.LENDER)
# ---- Overview / Dashboard ----
@router.get("/dashboard")
def dashboard(db: Session = Depends(get_db), user: User = Depends(lender_only)):
    health = compute_lender_portfolio_health(db, user.id)
    active_loans = (
        db.query(Loan).filter(Loan.lender_id == user.id, Loan.status == LoanStatus.ACTIVE).all()
    )
    open_opportunities = (
        db.query(LoanOpportunity)
        .join(Business, Business.id == LoanOpportunity.business_id)
        .filter(
            LoanOpportunity.status == OpportunityStatus.OPEN,
            Business.verification_status == VerificationStatus.VERIFIED,
        )
        .limit(10)
        .all()
    )
    recent_alerts = list_alerts(db, lender_id=user.id, limit=10)
    business_ids = [l.business_id for l in active_loans]
    attention_needed = []
    if business_ids:
        low_scores = (
            db.query(BusinessTrustHealthSnapshot)
            .filter(BusinessTrustHealthSnapshot.business_id.in_(business_ids))
            .order_by(BusinessTrustHealthSnapshot.computed_at.desc())
            .all()
        )
        seen = set()
        for snap in low_scores:
            if snap.business_id in seen:
                continue
            seen.add(snap.business_id)
            if float(snap.score) < 50:
                attention_needed.append({"business_id": snap.business_id, "score": float(snap.score)})
    return {
        "portfolio_health": health,
        "active_exposure": health.total_exposure,
        "opportunities_available": len(open_opportunities),
        "businesses_requiring_attention": attention_needed,
        "recent_alerts": [AlertOut.model_validate(a) for a in recent_alerts],
    }
# ---- Opportunities ----
@router.get("/opportunities", response_model=list[OpportunityWithHealth])
def list_opportunities(db: Session = Depends(get_db), user: User = Depends(lender_only)):
    opportunities = (
        db.query(LoanOpportunity)
        .join(Business, Business.id == LoanOpportunity.business_id)
        .filter(
            LoanOpportunity.status == OpportunityStatus.OPEN,
            Business.verification_status == VerificationStatus.VERIFIED,
        )
        .all()
    )
    results = []
    for opp in opportunities:
        biz = opp.business
        latest_snapshot = (
            db.query(BusinessTrustHealthSnapshot)
            .filter(BusinessTrustHealthSnapshot.business_id == biz.id)
            .order_by(BusinessTrustHealthSnapshot.computed_at.desc())
            .first()
        )
        results.append(
            OpportunityWithHealth(
                id=opp.id, business_id=opp.business_id, amount_requested=float(opp.amount_requested),
                purpose=opp.purpose, status=opp.status, created_at=opp.created_at,
                business_name=biz.legal_name, industry=biz.industry, region=biz.region,
                trust_health_score=float(latest_snapshot.score) if latest_snapshot else None,
                verification_status=biz.verification_status.value,
            )
        )
    return results
@router.get("/opportunities/{business_id}")
def get_opportunity_detail(
    business_id: int, db: Session = Depends(get_db), user: User = Depends(lender_only)
):
    business = db.query(Business).filter(Business.id == business_id).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    trust_health = compute_business_trust_health(db, business)
    return {
        "business": {
            "id": business.id, "legal_name": business.legal_name, "industry": business.industry,
            "region": business.region, "verification_status": business.verification_status.value,
            "operating_history_years": business.operating_history_years,
        },
        "trust_health": trust_health,
        "open_opportunities": [
            {"id": o.id, "amount_requested": float(o.amount_requested), "purpose": o.purpose}
            for o in business.opportunities if o.status == OpportunityStatus.OPEN
        ],
    }
@router.get("/opportunities/{business_id}/health", response_model=TrustHealthBreakdown)
def get_opportunity_health(
    business_id: int, db: Session = Depends(get_db), user: User = Depends(lender_only)
):
    business = db.query(Business).filter(Business.id == business_id).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    result = compute_business_trust_health(db, business)
    from datetime import datetime, timezone
    return TrustHealthBreakdown(computed_at=datetime.now(timezone.utc), **result)
@router.get("/opportunities/{business_id}/dependencies", response_model=DependencyRiskReport)
def get_opportunity_dependencies(
    business_id: int, db: Session = Depends(get_db), user: User = Depends(lender_only)
):
    business = db.query(Business).filter(Business.id == business_id).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    return compute_dependency_risk(db, business)
# ---- Lend action ----
@router.post("/lend", response_model=LoanOut, status_code=201)
def lend(payload: LendRequest, request: Request, db: Session = Depends(get_db), user: User = Depends(lender_only)):
    opportunity = db.query(LoanOpportunity).filter(LoanOpportunity.id == payload.opportunity_id).first()
    if not opportunity:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    if opportunity.status != OpportunityStatus.OPEN:
        raise HTTPException(status_code=400, detail="Opportunity is not open for funding")
    loan = Loan(
        opportunity_id=opportunity.id,
        lender_id=user.id,
        business_id=opportunity.business_id,
        amount_lent=payload.amount_lent,
        downside_tolerance=payload.downside_tolerance,
    )
    opportunity.status = OpportunityStatus.FUNDED
    db.add(loan)
    db.commit()
    db.refresh(loan)
    # Financially consequential action — always traceable to who funded
    # what, how much, and under what stated risk preference.
    record_audit(
        db, action="loan.funded", resource_type="loan", resource_id=loan.id, actor=user,
        detail={
            "business_id": loan.business_id, "amount_lent": float(loan.amount_lent),
            "downside_tolerance": float(loan.downside_tolerance),
        },
        ip_address=request.client.host if request.client else None,
    )
    return loan
# ---- Repayments ----
def _get_own_loan(db: Session, user: User, loan_id: int) -> Loan:
    loan = db.query(Loan).filter(Loan.id == loan_id, Loan.lender_id == user.id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found in your portfolio")
    return loan
@router.post("/loans/{loan_id}/repayments", response_model=RepaymentOut, status_code=201)
def record_repayment(
    loan_id: int, payload: RepaymentCreate, db: Session = Depends(get_db), user: User = Depends(lender_only)
):
    """
    Record a repayment event against one of the lender's own funded loans.
    This is the source data Repayment Behaviour scoring and monitoring
    read from — recording it here keeps Business Trust Health accurate.
    """
    loan = _get_own_loan(db, user, loan_id)
    record = RepaymentRecord(
        business_id=loan.business_id, loan_id=loan.id, **payload.model_dump()
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record
@router.get("/loans/{loan_id}/repayments", response_model=list[RepaymentOut])
def list_repayments(loan_id: int, db: Session = Depends(get_db), user: User = Depends(lender_only)):
    loan = _get_own_loan(db, user, loan_id)
    return (
        db.query(RepaymentRecord)
        .filter(RepaymentRecord.loan_id == loan.id)
        .order_by(RepaymentRecord.due_date)
        .all()
    )
# ---- Portfolio ----
@router.get("/portfolio", response_model=list[LoanOut])
def portfolio(db: Session = Depends(get_db), user: User = Depends(lender_only)):
    return db.query(Loan).filter(Loan.lender_id == user.id).all()
# ---- Risk Monitor ----
@router.get("/risk-monitor")
def risk_monitor(db: Session = Depends(get_db), user: User = Depends(lender_only)):
    loans = db.query(Loan).filter(Loan.lender_id == user.id, Loan.status == LoanStatus.ACTIVE).all()
    results = []
    for loan in loans:
        business = db.query(Business).filter(Business.id == loan.business_id).first()
        if not business:
            continue
        results.append({
            "business_id": business.id,
            "business_name": business.legal_name,
            "trust_health": compute_business_trust_health(db, business),
        })
    return results
@router.get("/risk-monitor/health", response_model=LenderHealthReport)
def risk_monitor_health(db: Session = Depends(get_db), user: User = Depends(lender_only)):
    return compute_lender_portfolio_health(db, user.id)
# ---- Alerts ----
@router.get("/alerts", response_model=list[AlertOut])
def alerts(db: Session = Depends(get_db), user: User = Depends(lender_only)):
    return list_alerts(db, lender_id=user.id)
# ---- Lender Health ----
@router.get("/lender-health", response_model=LenderHealthReport)
def lender_health(db: Session = Depends(get_db), user: User = Depends(lender_only)):
    return compute_lender_portfolio_health(db, user.id)
# ---- Messages ----
@router.get("/messages")
def list_messages(db: Session = Depends(get_db), user: User = Depends(lender_only)):
    return (
        db.query(Message)
        .filter((Message.sender_id == user.id) | (Message.recipient_id == user.id))
        .order_by(Message.created_at.desc())
        .all()
    )
@router.post("/messages", status_code=201)
def send_message(
    payload: MessageCreate, db: Session = Depends(get_db), user: User = Depends(lender_only)
):
    message = Message(sender_id=user.id, **payload.model_dump())
    db.add(message)
    db.commit()
    db.refresh(message)
    return message
