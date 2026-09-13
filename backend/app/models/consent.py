"""
Explicit consent records for data processing / KYC data sharing, kept
separately from the User table so consent history is never overwritten —
only appended to. This is the minimum structure most data-protection
regimes (e.g. India's DPDP Act, GDPR-style frameworks) expect: what was
consented to, when, and that it can be looked up per user on demand.
"""
from datetime import datetime
from sqlalchemy import String, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base
class ConsentRecord(Base):
    __tablename__ = "consent_records"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    consent_type: Mapped[str] = mapped_column(String(64), nullable=False)  # e.g. "data_processing", "credit_check"
    granted: Mapped[bool] = mapped_column(Boolean, nullable=False)
    version: Mapped[str] = mapped_column(String(16), default="1.0")  # policy version consented to
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
