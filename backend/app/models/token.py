"""
Revoked-token registry, so a logout or forced session termination can
actually invalidate a JWT before its natural expiry. Without this, any
issued JWT stays valid until it expires no matter what the user or an
admin does — unacceptable for a regulated platform.
"""
from datetime import datetime
from sqlalchemy import String, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base
class RevokedToken(Base):
    __tablename__ = "revoked_tokens"
    id: Mapped[int] = mapped_column(primary_key=True)
    jti: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    revoked_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
