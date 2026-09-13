"""
Populate the database with demo data spanning all three roles so the
prototype can be exercised end-to-end immediately after setup.
Usage:
    python seed.py
"""
from datetime import date, timedelta
import app.models  # noqa: F401  registers all models on Base.metadata — import before create_all
from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.core.security import hash_password
from app.models import (
    User, UserRole, Business, VerificationStatus,
    FinancialProfile, RepaymentRecord, RepaymentStatus,
    DependencyRecord, DependencyType,
    LoanOpportunity, Loan, OpportunityStatus, LoanStatus,
    FraudCase, MLModel, MLModelStatus,
)
from app.services.trust_health import compute_and_store_trust_health
Base.metadata.create_all(bind=engine)
db = SessionLocal()
try:
    admin = User(
        email="admin@codevest.dev", hashed_password=hash_password("Admin1234!"),
        full_name="Platform Admin", role=UserRole.ADMIN, email_verified=True,
    )
    lender1 = User(
        email="lender1@codevest.dev", hashed_password=hash_password("Lender123!"),
        full_name="Asha Rao", role=UserRole.LENDER, email_verified=True,
    )
    borrower1_user = User(
        email="borrower1@codevest.dev", hashed_password=hash_password("Borrower123!"),
        full_name="Vikram Shah", role=UserRole.BORROWER, email_verified=True,
    )
    borrower2_user = User(
        email="borrower2@codevest.dev", hashed_password=hash_password("Borrower123!"),
        full_name="Meera Nair", role=UserRole.BORROWER, email_verified=True,
    )
    db.add_all([admin, lender1, borrower1_user, borrower2_user])
    db.commit()
    for u in (admin, lender1, borrower1_user, borrower2_user):
        db.refresh(u)
    biz1 = Business(
        owner_user_id=borrower1_user.id, legal_name="Shah Textiles Pvt Ltd",
        registration_number="U17119MH2015PTC123456", industry="Textiles", region="Maharashtra",
        operating_history_years=6.5, verification_status=VerificationStatus.VERIFIED,
    )
    biz2 = Business(
        owner_user_id=borrower2_user.id, legal_name="Nair Foods & Exports",
        registration_number="U15139KL2019PTC654321", industry="Food Processing", region="Kerala",
        operating_history_years=2.0, verification_status=VerificationStatus.VERIFIED,
    )
    db.add_all([biz1, biz2])
    db.commit()
    for b in (biz1, biz2):
        db.refresh(b)
    today = date.today()
    for i in range(6, 0, -1):
        period = today.replace(day=1) - timedelta(days=30 * i)
        db.add(FinancialProfile(
            business_id=biz1.id, period=period,
            revenue=1200000 - i * 20000, expenses=900000 - i * 10000,
            cash_flow=150000 - i * 5000, outstanding_debt=300000,
        ))
        db.add(FinancialProfile(
            business_id=biz2.id, period=period,
            revenue=400000 + i * 15000, expenses=320000 + i * 8000,
            cash_flow=40000 + i * 2000, outstanding_debt=100000,
        ))
    db.commit()
    # biz1 has a heavy, growing dependency on one customer -> should trigger warnings.
    db.add(DependencyRecord(
        business_id=biz1.id, type=DependencyType.CUSTOMER, entity_name="MetroMart Retail",
        share_pct=0.42, period=today.replace(day=1) - timedelta(days=60),
    ))
    db.add(DependencyRecord(
        business_id=biz1.id, type=DependencyType.CUSTOMER, entity_name="MetroMart Retail",
        share_pct=0.51, period=today.replace(day=1) - timedelta(days=30),
    ))
    db.add(DependencyRecord(
        business_id=biz1.id, type=DependencyType.SUPPLIER, entity_name="Gujarat Cotton Mills",
        share_pct=0.30, period=today.replace(day=1) - timedelta(days=30),
    ))
    # biz2 is well diversified.
    db.add(DependencyRecord(
        business_id=biz2.id, type=DependencyType.CUSTOMER, entity_name="Local Distributors Co-op",
        share_pct=0.18, period=today.replace(day=1) - timedelta(days=30),
    ))
    db.commit()
    for i in range(4):
        db.add(RepaymentRecord(
            business_id=biz1.id, due_date=today - timedelta(days=30 * (4 - i)),
            paid_date=today - timedelta(days=30 * (4 - i)),
            amount_due=25000, amount_paid=25000, status=RepaymentStatus.ON_TIME,
        ))
    db.add(RepaymentRecord(
        business_id=biz2.id, due_date=today - timedelta(days=15),
        paid_date=today - timedelta(days=10), amount_due=15000, amount_paid=15000,
        status=RepaymentStatus.LATE,
    ))
    db.commit()
    opp1 = LoanOpportunity(business_id=biz1.id, amount_requested=500000, purpose="Working capital")
    opp2 = LoanOpportunity(business_id=biz2.id, amount_requested=200000, purpose="Cold storage expansion")
    db.add_all([opp1, opp2])
    db.commit()
    for o in (opp1, opp2):
        db.refresh(o)
    compute_and_store_trust_health(db, biz1)
    compute_and_store_trust_health(db, biz2)
    db.add(MLModel(
        name="trust_health_scorer", version="0.1.0", status=MLModelStatus.DEPLOYED,
        metrics={"note": "rule-based explainable scorer, not yet ML-trained"},
    ))
    db.add(FraudCase(
        business_id=biz2.id, type="document_mismatch",
        description="Uploaded bank statement name does not exactly match registered owner name.",
        severity="low",
    ))
    db.commit()
    print("Seed complete.")
    print(f"  Admin login:    admin@codevest.dev / Admin1234!")
    print(f"  Lender login:   lender1@codevest.dev / Lender123!")
    print(f"  Borrower logins: borrower1@codevest.dev / Borrower123!  (Shah Textiles, dependency risk demo)")
    print(f"                   borrower2@codevest.dev / Borrower123!  (Nair Foods, healthy profile demo)")
    print(f"  Open opportunities: opportunity_id={opp1.id} (Shah Textiles), opportunity_id={opp2.id} (Nair Foods)")
finally:
    db.close()
