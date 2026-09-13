"""
Continuous Monitoring: detects meaningful changes in business health over
time by comparing the two most recent Business Trust Health snapshots and
the two most recent financial/dependency data points, recording
MonitoringEvents and raising Alerts for significant deterioration.
"""
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.business import Business
from app.models.financial import FinancialProfile
from app.models.dependency import DependencyRecord
from app.models.trust_health import BusinessTrustHealthSnapshot
from app.models.monitoring import MonitoringEvent
from app.models.alert import Alert, AlertSeverity, AlertCategory
from app.services.trust_health import compute_and_store_trust_health
from app.services.dependency_risk import compute_dependency_risk
def _pct_change(previous: float, new: float) -> float:
    if previous == 0:
        return 0.0 if new == 0 else 1.0
    return (new - previous) / abs(previous)
def _severity_for_change(change_pct: float) -> AlertSeverity:
    magnitude = abs(change_pct)
    if magnitude >= 0.40:
        return AlertSeverity.CRITICAL
    if magnitude >= 0.25:
        return AlertSeverity.HIGH
    if magnitude >= settings.DETERIORATION_TRIGGER_PCT:
        return AlertSeverity.MEDIUM
    return AlertSeverity.LOW
def run_monitoring_cycle(db: Session, business: Business) -> list[Alert]:
    """
    Recompute trust health, diff it against the previous snapshot and raw
    financial/dependency data, and emit MonitoringEvents + Alerts for any
    change beyond DETERIORATION_TRIGGER_PCT. Returns newly created alerts.
    """
    new_alerts: list[Alert] = []
    prior_snapshots = (
        db.query(BusinessTrustHealthSnapshot)
        .filter(BusinessTrustHealthSnapshot.business_id == business.id)
        .order_by(BusinessTrustHealthSnapshot.computed_at.desc())
        .limit(1)
        .all()
    )
    previous_score = float(prior_snapshots[0].score) if prior_snapshots else None
    snapshot = compute_and_store_trust_health(db, business)
    if previous_score is not None:
        change = _pct_change(previous_score, float(snapshot.score))
        if change <= -settings.DETERIORATION_TRIGGER_PCT:
            event = MonitoringEvent(
                business_id=business.id,
                metric="business_trust_health_score",
                previous_value=previous_score,
                new_value=float(snapshot.score),
                change_pct=change,
            )
            db.add(event)
            alert = Alert(
                business_id=business.id,
                severity=_severity_for_change(change),
                category=AlertCategory.FINANCIAL_HEALTH,
                cause="Business Trust Health decline",
                description=(
                    f"Trust Health score fell from {previous_score:.1f} to {float(snapshot.score):.1f} "
                    f"({change:.0%})."
                ),
                trend="worsening",
            )
            db.add(alert)
            new_alerts.append(alert)
    # Revenue deterioration check
    profiles = sorted(business.financial_profiles, key=lambda p: p.period)
    if len(profiles) >= 2:
        prev_rev, new_rev = float(profiles[-2].revenue), float(profiles[-1].revenue)
        change = _pct_change(prev_rev, new_rev)
        if change <= -settings.DETERIORATION_TRIGGER_PCT:
            db.add(MonitoringEvent(
                business_id=business.id, metric="revenue",
                previous_value=prev_rev, new_value=new_rev, change_pct=change,
            ))
            alert = Alert(
                business_id=business.id,
                severity=_severity_for_change(change),
                category=AlertCategory.FINANCIAL_HEALTH,
                cause="Revenue decline",
                description=f"Revenue dropped {abs(change):.0%} period-over-period.",
                trend="worsening",
            )
            db.add(alert)
            new_alerts.append(alert)
    # Dependency deterioration check (major customer/supplier pulling back)
    dep_records = sorted(
        [r for r in business.dependency_records if r.type.value == "customer"],
        key=lambda r: r.period,
    )
    by_entity: dict[str, list[DependencyRecord]] = {}
    for r in dep_records:
        by_entity.setdefault(r.entity_name, []).append(r)
    for entity, recs in by_entity.items():
        if len(recs) < 2:
            continue
        prev_share, new_share = float(recs[-2].share_pct), float(recs[-1].share_pct)
        if prev_share >= settings.DEPENDENCY_CONCENTRATION_THRESHOLD:
            change = _pct_change(prev_share, new_share)
            if change <= -settings.DETERIORATION_TRIGGER_PCT:
                db.add(MonitoringEvent(
                    business_id=business.id, metric=f"customer_share:{entity}",
                    previous_value=prev_share, new_value=new_share, change_pct=change,
                ))
                alert = Alert(
                    business_id=business.id,
                    severity=_severity_for_change(change),
                    category=AlertCategory.DEPENDENCY_CONCENTRATION,
                    cause=f"Major customer ({entity}) pulling back",
                    description=(
                        f"{entity}'s share of revenue fell from {prev_share:.0%} to {new_share:.0%}, "
                        f"a material change given prior dependency on this customer."
                    ),
                    trend="worsening",
                )
                db.add(alert)
                new_alerts.append(alert)
    db.commit()
    for a in new_alerts:
        db.refresh(a)
    return new_alerts
