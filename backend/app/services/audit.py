"""
Central helper for writing to the audit trail. Call this from any router
action that changes state or matters for compliance review — never write
to AuditLog directly from elsewhere, so the shape of the trail stays
consistent and easy to query/export for an auditor.
"""
from sqlalchemy.orm import Session
from app.models.audit import AuditLog
from app.models.user import User
def record_audit(
    db: Session,
    action: str,
    resource_type: str,
    resource_id: str | int | None = None,
    actor: User | None = None,
    detail: dict | None = None,
    ip_address: str | None = None,
    outcome: str = "success",
    commit: bool = True,
) -> AuditLog:
    entry = AuditLog(
        actor_user_id=actor.id if actor else None,
        actor_role=actor.role.value if actor else None,
        action=action,
        resource_type=resource_type,
        resource_id=str(resource_id) if resource_id is not None else None,
        detail=detail or {},
        ip_address=ip_address,
        outcome=outcome,
    )
    db.add(entry)
    if commit:
        db.commit()
        db.refresh(entry)
    return entry
