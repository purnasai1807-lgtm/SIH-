"""
If real money movement is ever required (as opposed to this platform
purely being the matching/risk-intelligence layer), regulated lending
typically requires funds to flow through a bank-mediated escrow account,
not directly lender-to-borrower. This table models that transaction
record; app/services/payments.py is the pluggable interface to an actual
bank/escrow API. Only a mock provider is implemented today — this is
scaffolding for a real payment-rail integration, not a substitute for one.
"""
import enum
from datetime import datetime
from sqlalchemy import String, DateTime, ForeignKey, Numeric, Enum, func
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base
class EscrowStatus(str, enum.Enum):
    PENDING = "pending"
    SETTLED = "settled"
    FAILED = "failed"
    REVERSED = "reversed"
class EscrowTransaction(Base):
    __tablename__ = "escrow_transactions"
    id: Mapped[int] = mapped_column(primary_key=True)
    loan_id: Mapped[int] = mapped_column(ForeignKey("loans.id"), nullable=False)
    amount: Mapped[float] = mapped_column(Numeric(14, 2), nullable=False)
    status: Mapped[EscrowStatus] = mapped_column(Enum(EscrowStatus), default=EscrowStatus.PENDING)
    provider: Mapped[str] = mapped_column(String(32), nullable=False)
    provider_reference: Mapped[str | None] = mapped_column(String(128), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    settled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
