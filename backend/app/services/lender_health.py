"""
Lender Health: portfolio-level diversification and hidden correlated
exposure across a lender's active loans (e.g. multiple funded businesses
that all depend heavily on the same customer, or that are concentrated
in one sector/region).
"""
from collections import defaultdict
from sqlalchemy.orm import Session
from app.models.loan import Loan, LoanStatus
from app.models.business import Business
from app.models.dependency import DependencyRecord
from app.schemas.risk import LenderHealthReport
def compute_lender_portfolio_health(db: Session, lender_id: int) -> LenderHealthReport:
    loans = (
        db.query(Loan)
        .filter(Loan.lender_id == lender_id, Loan.status == LoanStatus.ACTIVE)
        .all()
    )
    total_exposure = sum(float(l.amount_lent) for l in loans)
    if not loans:
        return LenderHealthReport(
            lender_id=lender_id,
            total_exposure=0.0,
            diversification_index=1.0,
            sector_concentration={},
            region_concentration={},
            shared_dependency_warnings=[],
        )
    business_ids = [l.business_id for l in loans]
    businesses = db.query(Business).filter(Business.id.in_(business_ids)).all()
    business_by_id = {b.id: b for b in businesses}
    sector_exposure: dict[str, float] = defaultdict(float)
    region_exposure: dict[str, float] = defaultdict(float)
    for loan in loans:
        biz = business_by_id.get(loan.business_id)
        if not biz:
            continue
        sector_exposure[biz.industry] += float(loan.amount_lent)
        region_exposure[biz.region] += float(loan.amount_lent)
    def _shares(exposure_map: dict[str, float]) -> dict[str, float]:
        return {k: round(v / total_exposure, 4) for k, v in exposure_map.items()} if total_exposure else {}
    sector_shares = _shares(sector_exposure)
    region_shares = _shares(region_exposure)
    # Diversification index: 1 - HHI across sectors (0 = fully concentrated
    # in one sector, close to 1 = evenly spread across many sectors).
    hhi = sum(s ** 2 for s in sector_shares.values())
    diversification_index = round(max(0.0, 1 - hhi), 4)
    # Hidden shared dependency: do two or more portfolio businesses rely
    # heavily on the same named customer/supplier? That's correlated risk
    # invisible from any single business's own dashboard.
    dep_records = (
        db.query(DependencyRecord)
        .filter(DependencyRecord.business_id.in_(business_ids))
        .all()
    )
    entity_to_businesses: dict[str, set[int]] = defaultdict(set)
    for r in dep_records:
        if float(r.share_pct) >= 0.25:
            entity_to_businesses[f"{r.type.value}:{r.entity_name}"].add(r.business_id)
    shared_dependency_warnings = []
    for entity_key, biz_ids in entity_to_businesses.items():
        if len(biz_ids) >= 2:
            names = [business_by_id[b].legal_name for b in biz_ids if b in business_by_id]
            dep_type, entity_name = entity_key.split(":", 1)
            shared_dependency_warnings.append(
                f"{len(names)} portfolio businesses ({', '.join(names)}) are all materially "
                f"dependent on the same {dep_type} '{entity_name}' — correlated exposure if "
                f"that relationship deteriorates."
            )
    return LenderHealthReport(
        lender_id=lender_id,
        total_exposure=round(total_exposure, 2),
        diversification_index=diversification_index,
        sector_concentration=sector_shares,
        region_concentration=region_shares,
        shared_dependency_warnings=shared_dependency_warnings,
    )
