import enum
from datetime import datetime
from sqlalchemy import String, Boolean, DateTime, Enum, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.encryption import EncryptedString
from app.db.base import Base
class UserRole(str, enum.Enum):
    LENDER = "lender"
    BORROWER = "borrower"
    ADMIN = "admin"
class UserStatus(str, enum.Enum):
    ACTIVE = "active"
    SUSPENDED = "suspended"
    PENDING = "pending"
class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    # Stays plaintext + uniquely indexed deliberately: it's the login
    # lookup key, and encrypted values can't be indexed/queried directly.
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str | None] = mapped_column(EncryptedString(32), nullable=True)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), nullable=False, index=True)
    status: Mapped[UserStatus] = mapped_column(
        Enum(UserStatus), nullable=False, default=UserStatus.ACTIVE
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_anonymized: Mapped[bool] = mapped_column(Boolean, default=False)
    # --- MFA (TOTP) ---
    mfa_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    mfa_secret: Mapped[str | None] = mapped_column(EncryptedString(64), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    business: Mapped["Business"] = relationship(
        "Business", back_populates="owner", uselist=False, foreign_keys="Business.owner_user_id"
    )
