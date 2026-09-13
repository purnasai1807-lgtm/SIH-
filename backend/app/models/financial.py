import enum
from datetime import date, datetime
from sqlalchemy import Date, DateTime, ForeignKey, Numeric, Enum, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
class FinancialProfile(Base):
    """
    One row per reporting period (e.g. monthly) for a business. The time
    series here is what Financial Health scoring and deterioration
    monitoring both read from.
    """
    __tablename__ = "financial_profiles"
    id: Mapped[int] = mapped_column(primary_key=True)
    business_id: Mapped[int] = mapped_column(ForeignKey("businesses.id"), nullable=False)
    period: Mapped[date] = mapped_column(Date, nullable=False)
    revenue: Mapped[float] = mapped_column(Numeric(14, 2), nullable=False)
    expenses: Mapped[float] = mapped_column(Numeric(14, 2), nullable=False)
    cash_flow: Mapped[float] = mapped_column(Numeric(14, 2), nullable=False)
    outstanding_debt: Mapped[float] = mapped_column(Numeric(14, 2), default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    business: Mapped["Business"] = relationship("Business", back_populates="financial_profiles")
    @property
    def profitability_margin(self) -> float:
        if not self.revenue:
            return 0.0
        return float(self.revenue - self.expenses) / float(self.revenue)
class RepaymentStatus(str, enum.Enum):
    ON_TIME = "on_time"
    LATE = "late"
    MISSED = "missed"
    WAIVED = "waived"
class RepaymentRecord(Base):
    __tablename__ = "repayment_records"
    id: Mapped[int] = mapped_column(primary_key=True)
    business_id: Mapped[int] = mapped_column(ForeignKey("businesses.id"), nullable=False)
    loan_id: Mapped[int | None] = mapped_column(ForeignKey("loans.id"), nullable=True)
    due_date: Mapped[date] = mapped_column(Date, nullable=False)
    paid_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    amount_due: Mapped[float] = mapped_column(Numeric(14, 2), nullable=False)
    amount_paid: Mapped[float] = mapped_column(Numeric(14, 2), default=0)
    status: Mapped[RepaymentStatus] = mapped_column(Enum(RepaymentStatus), default=RepaymentStatus.ON_TIME)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
