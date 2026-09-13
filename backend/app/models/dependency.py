import enum
from datetime import date, datetime
from sqlalchemy import String, Date, DateTime, ForeignKey, Numeric, Enum, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
class DependencyType(str, enum.Enum):
    CUSTOMER = "customer"
    SUPPLIER = "supplier"
    SECTOR = "sector"
    REGION = "region"
class DependencyRecord(Base):
    """
    One row per (business, dependency entity, period). share_pct is the
    fraction of revenue (customer) or input spend (supplier) attributable
    to `entity_name` in that period — the basis for concentration and
    trend analysis described in the Dependency & Concentration Risk module.
    """
    __tablename__ = "dependency_records"
    id: Mapped[int] = mapped_column(primary_key=True)
    business_id: Mapped[int] = mapped_column(ForeignKey("businesses.id"), nullable=False)
    type: Mapped[DependencyType] = mapped_column(Enum(DependencyType), nullable=False)
    entity_name: Mapped[str] = mapped_column(String(255), nullable=False)
    share_pct: Mapped[float] = mapped_column(Numeric(5, 4), nullable=False)  # 0.0 - 1.0
    period: Mapped[date] = mapped_column(Date, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    business: Mapped["Business"] = relationship("Business", back_populates="dependency_records")
