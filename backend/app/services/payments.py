"""
Pluggable payment-rail interface for moving real money against a Loan.
Only MockPaymentProvider is implemented — it immediately marks the
transaction settled, which is fine for a demo/prototype but is NOT a
real fund movement of any kind. Wiring an actual bank/escrow API
(required if this platform is ultimately regulated, e.g. as P2P lending)
means implementing PaymentProvider against that API's real endpoints.
"""
from abc import ABC, abstractmethod
from dataclasses import dataclass
from app.core.config import settings
@dataclass
class PaymentResult:
    success: bool
    provider: str
    reference_id: str
    detail: str
class PaymentProvider(ABC):
    @abstractmethod
    def initiate_escrow_transfer(self, loan_id: int, amount: float) -> PaymentResult:
        ...
class MockPaymentProvider(PaymentProvider):
    def initiate_escrow_transfer(self, loan_id: int, amount: float) -> PaymentResult:
        return PaymentResult(
            success=True, provider="mock", reference_id=f"MOCK-ESCROW-{loan_id}",
            detail="Simulated settlement — no real funds moved.",
        )
def get_payment_provider() -> PaymentProvider:
    if settings.PAYMENT_PROVIDER == "mock":
        return MockPaymentProvider()
    raise NotImplementedError(
        f"PAYMENT_PROVIDER='{settings.PAYMENT_PROVIDER}' has no implementation yet. "
        f"Implement a PaymentProvider subclass against your actual bank/escrow API and register it here."
    )
