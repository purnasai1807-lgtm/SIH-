import enum
from datetime import datetime
from sqlalchemy import String, Text, DateTime, ForeignKey, Enum, func
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base
class FraudCaseStatus(str, enum.Enum):
    OPEN = "open"
    INVESTIGATING = "investigating"
    CONFIRMED = "confirmed"
    DISMISSED = "dismissed"
class FraudCase(Base):
    __tablename__ = "fraud_cases"
    id: Mapped[int] = mapped_column(primary_key=True)
    business_id: Mapped[int] = mapped_column(ForeignKey("businesses.id"), nullable=False)
    type: Mapped[str] = mapped_column(String(128), nullable=False)  # e.g. "document_mismatch", "identity_anomaly"
    description: Mapped[str] = mapped_column(Text, nullable=False)
    severity: Mapped[str] = mapped_column(String(32), default="medium")
    status: Mapped[FraudCaseStatus] = mapped_column(Enum(FraudCaseStatus), default=FraudCaseStatus.OPEN)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
