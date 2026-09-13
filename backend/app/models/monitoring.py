from datetime import datetime
from sqlalchemy import String, DateTime, ForeignKey, Numeric, func
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base
class MonitoringEvent(Base):
    """
    A detected, quantified change in a monitored business metric
    (revenue, cash flow, a dependency's share_pct, repayment behaviour,
    etc). This is the raw signal; Alerts are the explainable, human-facing
    output derived from significant MonitoringEvents.
    """
    __tablename__ = "monitoring_events"
    id: Mapped[int] = mapped_column(primary_key=True)
    business_id: Mapped[int] = mapped_column(ForeignKey("businesses.id"), nullable=False)
    metric: Mapped[str] = mapped_column(String(128), nullable=False)  # e.g. "revenue", "customer:Acme Corp"
    previous_value: Mapped[float] = mapped_column(Numeric(14, 4), nullable=False)
    new_value: Mapped[float] = mapped_column(Numeric(14, 4), nullable=False)
    change_pct: Mapped[float] = mapped_column(Numeric(6, 4), nullable=False)
    detected_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
