import enum
from datetime import datetime
from sqlalchemy import String, Text, DateTime, ForeignKey, Enum, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
class AlertSeverity(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"
class AlertCategory(str, enum.Enum):
    FINANCIAL_HEALTH = "financial_health"
    REPAYMENT_BEHAVIOUR = "repayment_behaviour"
    DEPENDENCY_CONCENTRATION = "dependency_concentration"
    VERIFICATION = "verification"
    PORTFOLIO_CONCENTRATION = "portfolio_concentration"
    FRAUD = "fraud"
class AlertStatus(str, enum.Enum):
    OPEN = "open"
    ACKNOWLEDGED = "acknowledged"
    RESOLVED = "resolved"
class Alert(Base):
    """
    Explainable early-warning alert: what changed, why it matters, and
    (via `cause` + `trend`) enough context to review without digging
    through raw monitoring events.
    """
    __tablename__ = "alerts"
    id: Mapped[int] = mapped_column(primary_key=True)
    business_id: Mapped[int] = mapped_column(ForeignKey("businesses.id"), nullable=False)
    lender_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    severity: Mapped[AlertSeverity] = mapped_column(Enum(AlertSeverity), nullable=False)
    category: Mapped[AlertCategory] = mapped_column(Enum(AlertCategory), nullable=False)
    cause: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    trend: Mapped[str | None] = mapped_column(String(32), nullable=True)  # "worsening" | "improving" | "stable"
    status: Mapped[AlertStatus] = mapped_column(Enum(AlertStatus), default=AlertStatus.OPEN)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
