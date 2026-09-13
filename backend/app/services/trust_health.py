"""
Business Trust Health: a composite, explainable 0-100 score combining
verification, financial health, repayment behaviour, business stability,
and dependency risk. Every component is computed from concrete, auditable
inputs so a lender can always see *why* a score is what it is.
"""
from datetime import date
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.business import Business, VerificationStatus
from app.models.financial import FinancialProfile, RepaymentRecord, RepaymentStatus
from app.models.trust_health import BusinessTrustHealthSnapshot
from app.services.dependency_risk import compute_dependency_risk
def _verification_component(business: Business) -> tuple[float, str]:
    mapping = {
        VerificationStatus.VERIFIED: (100.0, "Business and owner identity fully verified."),
        VerificationStatus.PENDING: (50.0, "Verification is in progress."),
        VerificationStatus.UNVERIFIED: (20.0, "Business has not yet submitted verification."),
        VerificationStatus.REJECTED: (0.0, "Verification was rejected."),
    }
    return mapping[business.verification_status]
def _financial_component(profiles: list[FinancialProfile]) -> tuple[float, str]:
    if not profiles:
        return 0.0, "No financial data submitted."
    recent = profiles[-6:]  # last up to 6 periods
    margins = [p.profitability_margin for p in recent]
    avg_margin = sum(margins) / len(margins)
    cash_flows = [float(p.cash_flow) for p in recent]
    positive_cf_ratio = sum(1 for c in cash_flows if c > 0) / len(cash_flows)
    # Margin normalized to 0-100 assuming -20%..+30% realistic range for SMEs.
    margin_score = max(0.0, min(100.0, (avg_margin + 0.20) / 0.50 * 100))
    cf_score = positive_cf_ratio * 100
    score = round(0.6 * margin_score + 0.4 * cf_score, 2)
    explanation = (
        f"Average profitability margin over last {len(recent)} period(s) is "
        f"{avg_margin:.1%}; cash flow was positive in {positive_cf_ratio:.0%} of those periods."
    )
    return score, explanation
def _repayment_component(records: list[RepaymentRecord]) -> tuple[float, str]:
    if not records:
        return 70.0, "No repayment history yet (neutral default for new borrowers)."
    total = len(records)
    on_time = sum(1 for r in records if r.status == RepaymentStatus.ON_TIME)
    late = sum(1 for r in records if r.status == RepaymentStatus.LATE)
    missed = sum(1 for r in records if r.status == RepaymentStatus.MISSED)
    score = round(((on_time * 1.0) + (late * 0.4) + (missed * 0.0)) / total * 100, 2)
    explanation = (
        f"Of {total} repayment obligation(s): {on_time} on time, {late} late, {missed} missed."
    )
    return score, explanation
def _stability_component(business: Business) -> tuple[float, str]:
    years = business.operating_history_years or 0
    # Saturates at 100 after 8 years of operating history.
    score = round(min(100.0, (years / 8.0) * 100), 2)
    explanation = f"Business has {years:.1f} year(s) of operating history."
    return score, explanation
def _dependency_component(db: Session, business: Business) -> tuple[float, str]:
    report = compute_dependency_risk(db, business)
    # Higher concentration index -> lower score. HHI-style index is 0-1.
    score = round(max(0.0, (1 - report.concentration_index)) * 100, 2)
    if report.warnings:
        causes = "; ".join(w.explanation for w in report.warnings[:2])
        explanation = f"Concentration index {report.concentration_index:.2f}. {causes}"
    else:
        explanation = f"Concentration index {report.concentration_index:.2f}; no material dependency concentration detected."
    return score, explanation
def compute_business_trust_health(db: Session, business: Business) -> dict:
    weights = settings.TRUST_HEALTH_WEIGHTS
    v_score, v_expl = _verification_component(business)
    f_score, f_expl = _financial_component(list(business.financial_profiles))
    repayment_records = (
        db.query(RepaymentRecord).filter(RepaymentRecord.business_id == business.id).all()
    )
    r_score, r_expl = _repayment_component(repayment_records)
    s_score, s_expl = _stability_component(business)
    d_score, d_expl = _dependency_component(db, business)
    composite = round(
        v_score * weights["verification"]
        + f_score * weights["financial"]
        + r_score * weights["repayment"]
        + s_score * weights["stability"]
        + d_score * weights["dependency"],
        2,
    )
    return {
        "score": composite,
        "verification_component": v_score,
        "financial_component": f_score,
        "repayment_component": r_score,
        "stability_component": s_score,
        "dependency_component": d_score,
        "explanation": [v_expl, f_expl, r_expl, s_expl, d_expl],
    }
def compute_and_store_trust_health(db: Session, business: Business) -> BusinessTrustHealthSnapshot:
    result = compute_business_trust_health(db, business)
    snapshot = BusinessTrustHealthSnapshot(
        business_id=business.id,
        score=result["score"],
        verification_component=result["verification_component"],
        financial_component=result["financial_component"],
        repayment_component=result["repayment_component"],
        stability_component=result["stability_component"],
        dependency_component=result["dependency_component"],
    )
    db.add(snapshot)
    db.commit()
    db.refresh(snapshot)
    return snapshot
