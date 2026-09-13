import enum
from datetime import datetime
from sqlalchemy import String, DateTime, Enum, JSON, func
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base
class MLModelStatus(str, enum.Enum):
    TRAINING = "training"
    STAGED = "staged"
    DEPLOYED = "deployed"
    RETIRED = "retired"
class MLModel(Base):
    __tablename__ = "ml_models"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(128), nullable=False)  # e.g. "trust_health_scorer"
    version: Mapped[str] = mapped_column(String(32), nullable=False)
    status: Mapped[MLModelStatus] = mapped_column(Enum(MLModelStatus), default=MLModelStatus.STAGED)
    metrics: Mapped[dict] = mapped_column(JSON, default=dict)  # e.g. {"auc": 0.84, "precision": 0.77}
    deployed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
