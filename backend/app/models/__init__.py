"""
Model registry. Importing this package (`import app.models`) guarantees
every ORM model is registered on Base.metadata — required before
Base.metadata.create_all() or `alembic revision --autogenerate` will see
every table. Individual model modules only import Base (one-directional),
so there is no circular-import risk here regardless of import order.
"""
from app.models.user import User, UserRole, UserStatus
from app.models.business import (
    Business, VerificationRecord, Document,
    VerificationStatus, VerificationType, DocumentType, DocumentStatus,
)
from app.models.financial import FinancialProfile, RepaymentRecord, RepaymentStatus
from app.models.dependency import DependencyRecord, DependencyType
from app.models.trust_health import BusinessTrustHealthSnapshot
from app.models.loan import LoanOpportunity, Loan, OpportunityStatus, LoanStatus
from app.models.monitoring import MonitoringEvent
from app.models.alert import Alert, AlertSeverity, AlertCategory, AlertStatus
from app.models.fraud import FraudCase, FraudCaseStatus
from app.models.ml_model import MLModel, MLModelStatus
from app.models.message import Message, Notification
from app.models.audit import AuditLog
from app.models.consent import ConsentRecord
from app.models.token import RevokedToken
from app.models.email_verification import EmailVerificationToken
from app.models.escrow import EscrowTransaction, EscrowStatus
__all__ = [
    "User", "UserRole", "UserStatus",
    "Business", "VerificationRecord", "Document",
    "VerificationStatus", "VerificationType", "DocumentType", "DocumentStatus",
    "FinancialProfile", "RepaymentRecord", "RepaymentStatus",
    "DependencyRecord", "DependencyType",
    "BusinessTrustHealthSnapshot",
    "LoanOpportunity", "Loan", "OpportunityStatus", "LoanStatus",
    "MonitoringEvent",
    "Alert", "AlertSeverity", "AlertCategory", "AlertStatus",
    "FraudCase", "FraudCaseStatus",
    "MLModel", "MLModelStatus",
    "Message", "Notification",
    "AuditLog",
    "ConsentRecord",
    "RevokedToken",
    "EmailVerificationToken",
]
