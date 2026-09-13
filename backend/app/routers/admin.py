from datetime import date, datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.core.deps import get_db, require_role
from app.models.user import User, UserRole, UserStatus
from app.models.business import Business, VerificationRecord, VerificationStatus, VerificationType
from app.models.loan import Loan, LoanOpportunity, LoanStatus
from app.models.monitoring import MonitoringEvent
from app.models.financial import RepaymentRecord
from app.models.alert import Alert
from app.models.fraud import FraudCase, FraudCaseStatus
from app.models.ml_model import MLModel
from app.schemas.risk import AlertOut, MonitoringEventOut
from app.schemas.loan import RepaymentOut
from app.services.monitoring import run_monitoring_cycle
from app.services.alerts import list_alerts
from app.services.audit import record_audit
from app.services.data_retention import anonymize_user
router = APIRouter(prefix="/admin", tags=["admin"])
admin_only = require_role(UserRole.ADMIN)
# ---- Overview / Dashboard ----
@router.get("/dashboard")
def dashboard(db: Session = Depends(get_db), user: User = Depends(admin_only)):
    return {
        "total_users": db.query(User).count(),
        "total_businesses": db.query(Business).count(),
        "pending_verifications": db.query(VerificationRecord)
            .filter(VerificationRecord.status == VerificationStatus.PENDING).count(),
        "active_loans": db.query(Loan).filter(Loan.status == LoanStatus.ACTIVE).count(),
        "open_alerts": db.query(Alert).filter(Alert.status == "open").count(),
        "open_fraud_cases": db.query(FraudCase).filter(FraudCase.status == FraudCaseStatus.OPEN).count(),
    }
# ---- Users ----
@router.get("/users")
def list_users(role: UserRole | None = None, db: Session = Depends(get_db), user: User = Depends(admin_only)):
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    return query.all()
@router.patch("/users/{user_id}/status")
def update_user_status(
    user_id: int, status_value: UserStatus, request: Request,
    db: Session = Depends(get_db), user: User = Depends(admin_only),
):
    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    previous_status = target.status.value
    target.status = status_value
    target.is_active = status_value == UserStatus.ACTIVE
    db.commit()
    db.refresh(target)
    record_audit(
        db, action="user.status_change", resource_type="user", resource_id=user_id, actor=user,
        detail={"from": previous_status, "to": status_value.value},
        ip_address=request.client.host if request.client else None,
    )
    return target
@router.post("/users/{user_id}/erase")
def erase_user_pii(
    user_id: int, request: Request, reason: str,
    db: Session = Depends(get_db), user: User = Depends(admin_only),
):
    """
    Right-to-erasure / data-minimization action: scrubs the target user's
    directly-identifying PII. Does NOT delete their loan/financial/audit
    history — see app/services/data_retention.py for why. Requires a
    stated reason, which is recorded in the audit trail alongside who
    approved it.
    """
    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    if target.is_anonymized:
        raise HTTPException(status_code=400, detail="User data has already been erased")
    anonymize_user(db, target)
    record_audit(
        db, action="user.pii_erased", resource_type="user", resource_id=user_id, actor=user,
        detail={"reason": reason},
        ip_address=request.client.host if request.client else None,
    )
    return {"status": "erased", "user_id": user_id}
# ---- Businesses ----
@router.get("/businesses")
def list_businesses(db: Session = Depends(get_db), user: User = Depends(admin_only)):
    return db.query(Business).all()
@router.get("/businesses/{business_id}")
def get_business(business_id: int, db: Session = Depends(get_db), user: User = Depends(admin_only)):
    business = db.query(Business).filter(Business.id == business_id).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    return business
# ---- Verification ----
@router.get("/verification")
def verification_queue(
    status_filter: VerificationStatus = VerificationStatus.PENDING,
    db: Session = Depends(get_db), user: User = Depends(admin_only),
):
    return db.query(VerificationRecord).filter(VerificationRecord.status == status_filter).all()
@router.post("/verification/{business_id}")
def submit_verification_record(
    business_id: int, type: VerificationType, db: Session = Depends(get_db), user: User = Depends(admin_only)
):
    business = db.query(Business).filter(Business.id == business_id).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    record = VerificationRecord(business_id=business_id, type=type, status=VerificationStatus.PENDING)
    db.add(record)
    db.commit()
    db.refresh(record)
    return record
@router.patch("/verification/{record_id}")
def review_verification_record(
    record_id: int, decision: VerificationStatus, request: Request, notes: str | None = None,
    db: Session = Depends(get_db), user: User = Depends(admin_only),
):
    record = db.query(VerificationRecord).filter(VerificationRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Verification record not found")
    record.status = decision
    record.reviewer_id = user.id
    record.notes = notes
    record.reviewed_at = datetime.now(timezone.utc)
    db.commit()
    # If this is a business-level (or all records approved), propagate to Business.verification_status.
    business = db.query(Business).filter(Business.id == record.business_id).first()
    if decision == VerificationStatus.VERIFIED and record.type == VerificationType.BUSINESS:
        business.verification_status = VerificationStatus.VERIFIED
    elif decision == VerificationStatus.REJECTED:
        business.verification_status = VerificationStatus.REJECTED
    db.commit()
    db.refresh(record)
    # Non-repudiation: a lending platform must always be able to show who
    # approved/rejected which business's verification, and when.
    record_audit(
        db, action=f"verification.{decision.value}", resource_type="business",
        resource_id=record.business_id, actor=user,
        detail={"verification_record_id": record.id, "type": record.type.value, "notes": notes},
        ip_address=request.client.host if request.client else None,
    )
    return record
# ---- Loans ----
@router.get("/loans")
def list_loans(status_filter: LoanStatus | None = None, db: Session = Depends(get_db), user: User = Depends(admin_only)):
    query = db.query(Loan)
    if status_filter:
        query = query.filter(Loan.status == status_filter)
    return query.all()
@router.get("/loans/{loan_id}/repayments", response_model=list[RepaymentOut])
def loan_repayments(loan_id: int, db: Session = Depends(get_db), user: User = Depends(admin_only)):
    loan = db.query(Loan).filter(Loan.id == loan_id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
    return (
        db.query(RepaymentRecord)
        .filter(RepaymentRecord.loan_id == loan.id)
        .order_by(RepaymentRecord.due_date)
        .all()
    )
@router.get("/opportunities")
def list_all_opportunities(db: Session = Depends(get_db), user: User = Depends(admin_only)):
    return db.query(LoanOpportunity).all()
# ---- Monitoring ----
@router.post("/monitoring/run/{business_id}", response_model=list[AlertOut])
def trigger_monitoring(business_id: int, db: Session = Depends(get_db), user: User = Depends(admin_only)):
    business = db.query(Business).filter(Business.id == business_id).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    return run_monitoring_cycle(db, business)
@router.post("/monitoring/run-all", response_model=list[AlertOut])
def trigger_monitoring_all(db: Session = Depends(get_db), user: User = Depends(admin_only)):
    businesses = db.query(Business).all()
    all_alerts = []
    for business in businesses:
        all_alerts.extend(run_monitoring_cycle(db, business))
    return all_alerts
@router.get("/monitoring", response_model=list[MonitoringEventOut])
def monitoring_events(db: Session = Depends(get_db), user: User = Depends(admin_only)):
    return db.query(MonitoringEvent).order_by(MonitoringEvent.detected_at.desc()).limit(200).all()
# ---- Alerts ----
@router.get("/alerts", response_model=list[AlertOut])
def all_alerts(
    severity: str | None = None, status: str | None = None,
    db: Session = Depends(get_db), user: User = Depends(admin_only),
):
    return list_alerts(db, severity=severity, status=status, limit=500)
# ---- Fraud & Anomalies ----
@router.get("/fraud")
def list_fraud_cases(status_filter: FraudCaseStatus | None = None, db: Session = Depends(get_db), user: User = Depends(admin_only)):
    query = db.query(FraudCase)
    if status_filter:
        query = query.filter(FraudCase.status == status_filter)
    return query.order_by(FraudCase.created_at.desc()).all()
@router.patch("/fraud/{case_id}")
def update_fraud_case(
    case_id: int, status_value: FraudCaseStatus, request: Request,
    db: Session = Depends(get_db), user: User = Depends(admin_only),
):
    case = db.query(FraudCase).filter(FraudCase.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Fraud case not found")
    previous_status = case.status.value
    case.status = status_value
    db.commit()
    db.refresh(case)
    record_audit(
        db, action="fraud_case.status_change", resource_type="fraud_case", resource_id=case_id, actor=user,
        detail={"from": previous_status, "to": status_value.value, "business_id": case.business_id},
        ip_address=request.client.host if request.client else None,
    )
    return case
# ---- Audit Log ----
@router.get("/audit-log")
def audit_log(
    resource_type: str | None = None, actor_user_id: int | None = None, limit: int = 200,
    db: Session = Depends(get_db), user: User = Depends(admin_only),
):
    from app.models.audit import AuditLog
    query = db.query(AuditLog)
    if resource_type:
        query = query.filter(AuditLog.resource_type == resource_type)
    if actor_user_id:
        query = query.filter(AuditLog.actor_user_id == actor_user_id)
    return query.order_by(AuditLog.created_at.desc()).limit(min(limit, 1000)).all()
# ---- ML Models ----
@router.get("/ml-models")
def list_ml_models(db: Session = Depends(get_db), user: User = Depends(admin_only)):
    return db.query(MLModel).all()
@router.post("/ml-models", status_code=201)
def register_ml_model(
    name: str, version: str, db: Session = Depends(get_db), user: User = Depends(admin_only)
):
    model = MLModel(name=name, version=version)
    db.add(model)
    db.commit()
    db.refresh(model)
    return model
# ---- Analytics ----
@router.get("/analytics")
def analytics(db: Session = Depends(get_db), user: User = Depends(admin_only)):
    total_exposure = sum(
        float(l.amount_lent) for l in db.query(Loan).filter(Loan.status == LoanStatus.ACTIVE).all()
    )
    by_severity = {}
    for a in db.query(Alert).all():
        by_severity[a.severity.value] = by_severity.get(a.severity.value, 0) + 1
    return {
        "total_active_exposure": round(total_exposure, 2),
        "total_verified_businesses": db.query(Business)
            .filter(Business.verification_status == VerificationStatus.VERIFIED).count(),
        "alerts_by_severity": by_severity,
        "total_lenders": db.query(User).filter(User.role == UserRole.LENDER).count(),
        "total_borrowers": db.query(User).filter(User.role == UserRole.BORROWER).count(),
    }
