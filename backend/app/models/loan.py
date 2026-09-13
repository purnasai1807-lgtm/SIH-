import enum
from datetime import datetime
from sqlalchemy import DateTime, ForeignKey, Numeric, Enum, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
class OpportunityStatus(str, enum.Enum):
    OPEN = "open"
    FUNDED = "funded"
    CLOSED = "closed"
    WITHDRAWN = "withdrawn"
class LoanOpportunity(Base):
    """
    A borrower's funding request, listed to lenders in /lender/opportunities.
    `downside_tolerance` is a lender-facing risk-preference filter set by
    the platform/business context — NOT insurance or a loss guarantee.
    """
    __tablename__ = "loan_opportunities"
    id: Mapped[int] = mapped_column(primary_key=True)
    business_id: Mapped[int] = mapped_column(ForeignKey("businesses.id"), nullable=False)
    amount_requested: Mapped[float] = mapped_column(Numeric(14, 2), nullable=False)
    purpose: Mapped[str | None] = mapped_column(String(512), nullable=True)
    status: Mapped[OpportunityStatus] = mapped_column(Enum(OpportunityStatus), default=OpportunityStatus.OPEN)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    business: Mapped["Business"] = relationship("Business", back_populates="opportunities")
    loans: Mapped[list["Loan"]] = relationship("Loan", back_populates="opportunity")
class LoanStatus(str, enum.Enum):
    ACTIVE = "active"
    REPAID = "repaid"
    DEFAULTED = "defaulted"
    RESTRUCTURED = "restructured"
class Loan(Base):
    """
    An actual funded lending relationship.
    IMPORTANT: `amount_lent` is the real exposure. `downside_tolerance` is
    only the lender's stated risk-preference parameter at the time of
    lending — it is never a guarantee, insurance, reserve, compensation,
    or maximum-loss protection on that exposure.
    """
    __tablename__ = "loans"
    id: Mapped[int] = mapped_column(primary_key=True)
    opportunity_id: Mapped[int] = mapped_column(ForeignKey("loan_opportunities.id"), nullable=False)
    lender_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    business_id: Mapped[int] = mapped_column(ForeignKey("businesses.id"), nullable=False)
    amount_lent: Mapped[float] = mapped_column(Numeric(14, 2), nullable=False)
    downside_tolerance: Mapped[float] = mapped_column(Numeric(14, 2), nullable=False)
    status: Mapped[LoanStatus] = mapped_column(Enum(LoanStatus), default=LoanStatus.ACTIVE)
    funded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    closed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    opportunity: Mapped["LoanOpportunity"] = relationship("LoanOpportunity", back_populates="loans")
