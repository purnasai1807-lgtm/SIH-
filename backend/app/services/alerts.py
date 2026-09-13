from sqlalchemy.orm import Session
from app.models.alert import Alert
def list_alerts(
    db: Session,
    business_id: int | None = None,
    lender_id: int | None = None,
    severity: str | None = None,
    status: str | None = None,
    limit: int = 100,
) -> list[Alert]:
    query = db.query(Alert)
    if business_id is not None:
        query = query.filter(Alert.business_id == business_id)
    if lender_id is not None:
        query = query.filter(Alert.lender_id == lender_id)
    if severity is not None:
        query = query.filter(Alert.severity == severity)
    if status is not None:
        query = query.filter(Alert.status == status)
    return query.order_by(Alert.created_at.desc()).limit(limit).all()
