import enum
from datetime import datetime
from sqlalchemy import String, Integer, DateTime, ForeignKey, Enum, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.encryption import EncryptedString
from app.db.base import Base
class VerificationStatus(str, enum.Enum):
    UNVERIFIED = "unverified"
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"
class Business(Base):
    __tablename__ = "businesses"
    id: Mapped[int] = mapped_column(primary_key=True)
    owner_user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True, nullable=False)
    legal_name: Mapped[str] = mapped_column(String(255), nullable=False)
    registration_number: Mapped[str | None] = mapped_column(EncryptedString(128), nullable=True)
    industry: Mapped[str] = mapped_column(String(128), nullable=False)
    region: Mapped[str] = mapped_column(String(128), nullable=False)
    operating_history_years: Mapped[float] = mapped_column(default=0)
    verification_status: Mapped[VerificationStatus] = mapped_column(
        Enum(VerificationStatus), default=VerificationStatus.UNVERIFIED, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    owner: Mapped["User"] = relationship("User", back_populates="business", foreign_keys=[owner_user_id])
    verification_records: Mapped[list["VerificationRecord"]] = relationship(
        "VerificationRecord", back_populates="business", cascade="all, delete-orphan"
    )
    documents: Mapped[list["Document"]] = relationship(
        "Document", back_populates="business", cascade="all, delete-orphan"
    )
    financial_profiles: Mapped[list["FinancialProfile"]] = relationship(
        "FinancialProfile", back_populates="business", cascade="all, delete-orphan",
        order_by="FinancialProfile.period"
    )
    dependency_records: Mapped[list["DependencyRecord"]] = relationship(
        "DependencyRecord", back_populates="business", cascade="all, delete-orphan"
    )
    trust_health_snapshots: Mapped[list["BusinessTrustHealthSnapshot"]] = relationship(
        "BusinessTrustHealthSnapshot", back_populates="business", cascade="all, delete-orphan",
        order_by="BusinessTrustHealthSnapshot.computed_at"
    )
    opportunities: Mapped[list["LoanOpportunity"]] = relationship(
        "LoanOpportunity", back_populates="business", cascade="all, delete-orphan"
    )
class VerificationType(str, enum.Enum):
    BUSINESS = "business"
    OWNER = "owner"
    DOCUMENT = "document"
class VerificationRecord(Base):
    __tablename__ = "verification_records"
    id: Mapped[int] = mapped_column(primary_key=True)
    business_id: Mapped[int] = mapped_column(ForeignKey("businesses.id"), nullable=False)
    type: Mapped[VerificationType] = mapped_column(Enum(VerificationType), nullable=False)
    status: Mapped[VerificationStatus] = mapped_column(
        Enum(VerificationStatus), default=VerificationStatus.PENDING
    )
    reviewer_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    business: Mapped["Business"] = relationship("Business", back_populates="verification_records")
class DocumentType(str, enum.Enum):
    REGISTRATION_CERTIFICATE = "registration_certificate"
    TAX_RECORD = "tax_record"
    BANK_STATEMENT = "bank_statement"
    OWNER_ID = "owner_id"
    OTHER = "other"
class DocumentStatus(str, enum.Enum):
    UPLOADED = "uploaded"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    REJECTED = "rejected"
class Document(Base):
    __tablename__ = "documents"
    id: Mapped[int] = mapped_column(primary_key=True)
    business_id: Mapped[int] = mapped_column(ForeignKey("businesses.id"), nullable=False)
    doc_type: Mapped[DocumentType] = mapped_column(Enum(DocumentType), nullable=False)
    file_url: Mapped[str] = mapped_column(String(1024), nullable=False)
    status: Mapped[DocumentStatus] = mapped_column(Enum(DocumentStatus), default=DocumentStatus.UPLOADED)
    uploaded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    business: Mapped["Business"] = relationship("Business", back_populates="documents")
