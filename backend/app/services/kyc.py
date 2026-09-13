"""
Pluggable KYC/identity-verification provider interface.
Only MockKYCProvider is actually implemented — it simulates an instant
"verified" result so the verification workflow can be exercised
end-to-end. Wiring a real provider (India's DigiLocker, Aadhaar eKYC via
UIDAI, or an equivalent for your jurisdiction) means implementing
KYCProvider against that provider's actual API and register it in
get_kyc_provider() — the rest of the codebase (VerificationRecord,
Business.verification_status, the audit trail) doesn't need to change.
"""
from abc import ABC, abstractmethod
from dataclasses import dataclass
from app.core.config import settings
@dataclass
class KYCResult:
    verified: bool
    provider: str
    reference_id: str
    reason: str
class KYCProvider(ABC):
    @abstractmethod
    def verify_business(self, registration_number: str, legal_name: str) -> KYCResult:
        ...
    @abstractmethod
    def verify_individual(self, full_name: str, id_number: str) -> KYCResult:
        ...
class MockKYCProvider(KYCProvider):
    """
    Deterministic mock for development/demo use — NOT a real identity
    check. Rejects obviously-empty input, otherwise reports "verified" so
    the rest of the platform's verification-dependent logic (Business
    Trust Health's verification component, opportunity listing gating)
    can be tested without a live government/bank integration.
    """
    def verify_business(self, registration_number: str, legal_name: str) -> KYCResult:
        if not registration_number or not legal_name:
            return KYCResult(False, "mock", "", "Missing registration number or legal name")
        return KYCResult(True, "mock", f"MOCK-BIZ-{registration_number[-6:]}", "Simulated verification passed")
    def verify_individual(self, full_name: str, id_number: str) -> KYCResult:
        if not full_name or not id_number:
            return KYCResult(False, "mock", "", "Missing name or ID number")
        return KYCResult(True, "mock", f"MOCK-IND-{id_number[-6:]}", "Simulated verification passed")
def get_kyc_provider() -> KYCProvider:
    if settings.KYC_PROVIDER == "mock":
        return MockKYCProvider()
    raise NotImplementedError(
        f"KYC_PROVIDER='{settings.KYC_PROVIDER}' has no implementation yet. "
        f"Implement a KYCProvider subclass for it and register it here."
    )
