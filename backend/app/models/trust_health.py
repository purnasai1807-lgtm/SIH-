from datetime import datetime
from sqlalchemy import DateTime, ForeignKey, Numeric, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
class BusinessTrustHealthSnapshot(Base):
    """
    A point-in-time snapshot of the composite Business Trust Health score
    and its explainable component breakdown. New snapshots are appended
    (never overwritten) so trend charts and monitoring can diff them.
    """
    __tablename__ = "business_trust_health_snapshots"
    id: Mapped[int] = mapped_column(primary_key=True)
    business_id: Mapped[int] = mapped_column(ForeignKey("businesses.id"), nullable=False)
    score: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)  # 0-100
    verification_component: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    financial_component: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    repayment_component: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    stability_component: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    dependency_component: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    computed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    business: Mapped["Business"] = relationship("Business", back_populates="trust_health_snapshots")
