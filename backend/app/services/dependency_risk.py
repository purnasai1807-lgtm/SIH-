"""
Dependency & Concentration Risk: detects excessive reliance on a single
customer, supplier, sector, or region, tracks whether that reliance is
increasing or decreasing, and produces explainable warnings.
"""
from collections import defaultdict
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.business import Business
from app.models.dependency import DependencyRecord
from app.schemas.risk import DependencyRiskReport, DependencyWarning
def _latest_and_previous_by_entity(records: list[DependencyRecord]):
    """
    Group dependency records by (type, entity_name) and return, for each,
    the two most recent periods so a trend can be derived.
    """
    grouped: dict[tuple[str, str], list[DependencyRecord]] = defaultdict(list)
    for r in records:
        grouped[(r.type.value, r.entity_name)].append(r)
    result = {}
    for key, recs in grouped.items():
        recs_sorted = sorted(recs, key=lambda r: r.period)
        result[key] = recs_sorted
    return result
def compute_dependency_risk(db: Session, business: Business) -> DependencyRiskReport:
    records = (
        db.query(DependencyRecord)
        .filter(DependencyRecord.business_id == business.id)
        .all()
    )
    if not records:
        return DependencyRiskReport(business_id=business.id, concentration_index=0.0, warnings=[])
    grouped = _latest_and_previous_by_entity(records)
    # Herfindahl-Hirschman-style concentration index using each entity's
    # latest share_pct within its own type (customer concentration
    # dominates the score since that maps most directly to revenue risk).
    latest_customer_shares = [
        float(recs[-1].share_pct) for key, recs in grouped.items() if key[0] == "customer"
    ]
    concentration_index = sum(s ** 2 for s in latest_customer_shares) if latest_customer_shares else 0.0
    concentration_index = round(min(1.0, concentration_index), 4)
    warnings: list[DependencyWarning] = []
    threshold = settings.DEPENDENCY_CONCENTRATION_THRESHOLD
    for (dep_type, entity_name), recs in grouped.items():
        latest = recs[-1]
        share = float(latest.share_pct)
        is_material = share >= threshold
        if len(recs) >= 2:
            prev_share = float(recs[-2].share_pct)
            if share > prev_share * 1.02:
                trend = "increasing"
            elif share < prev_share * 0.98:
                trend = "decreasing"
            else:
                trend = "stable"
        else:
            trend = "stable"
        if is_material:
            direction = {
                "increasing": "and this dependency is growing",
                "decreasing": "though this dependency is easing",
                "stable": "and this dependency has held steady",
            }[trend]
            explanation = (
                f"{entity_name} ({dep_type}) accounts for {share:.0%} of the business's "
                f"revenue/input base, {direction}."
            )
            warnings.append(
                DependencyWarning(
                    type=dep_type,
                    entity_name=entity_name,
                    share_pct=share,
                    trend=trend,
                    is_material=True,
                    explanation=explanation,
                )
            )
        elif trend == "increasing" and share >= threshold * 0.7:
            # Not yet material, but trending toward it — early warning.
            explanation = (
                f"{entity_name} ({dep_type}) is at {share:.0%} and rising toward a "
                f"concentration threshold of {threshold:.0%}."
            )
            warnings.append(
                DependencyWarning(
                    type=dep_type,
                    entity_name=entity_name,
                    share_pct=share,
                    trend=trend,
                    is_material=False,
                    explanation=explanation,
                )
            )
    warnings.sort(key=lambda w: w.share_pct, reverse=True)
    return DependencyRiskReport(
        business_id=business.id, concentration_index=concentration_index, warnings=warnings
    )
