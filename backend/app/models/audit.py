"""
Immutable audit trail. Every state-changing, security-relevant, or
financially-relevant action gets a row here — who did it, what changed,
and when. This table is intentionally append-only at the application
level (no update/delete endpoints exist anywhere in the API for it).
Government / regulated-fintech reviewers will expect exactly this:
non-repudiation of who approved a verification, who funded a loan, who
suspended a user, who changed a fraud case's status.
"""
from datetime import datetime
from sqlalchemy import String, Text, DateTime, ForeignKey, JSON, func
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base
class AuditLog(Base):
    __tablename__ = "audit_logs"
    id: Mapped[int] = mapped_column(primary_key=True)
    actor_user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    actor_role: Mapped[str | None] = mapped_column(String(32), nullable=True)
    action: Mapped[str] = mapped_column(String(128), nullable=False)  # e.g. "verification.approve"
    resource_type: Mapped[str] = mapped_column(String(64), nullable=False)  # e.g. "business", "loan", "user"
    resource_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    detail: Mapped[dict] = mapped_column(JSON, default=dict)  # before/after or contextual fields
    ip_address: Mapped[str | None] = mapped_column(String(64), nullable=True)
    outcome: Mapped[str] = mapped_column(String(16), default="success")  # "success" | "failure"
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
