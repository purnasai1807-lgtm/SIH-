from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
INSECURE_DEFAULT_SECRET = "insecure-dev-secret-change-me"
class Settings(BaseSettings):
    """Central application configuration, loaded from environment / .env."""
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    PROJECT_NAME: str = "CodeVest API"
    ENVIRONMENT: str = "development"  # "development" | "staging" | "production"
    DATABASE_URL: str = "postgresql://codevest:codevest@localhost:5432/codevest"
    JWT_SECRET_KEY: str = INSECURE_DEFAULT_SECRET
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30  
    ALLOWED_ORIGINS: list[str] = []
    PASSWORD_MIN_LENGTH: int = 10
    LOGIN_RATE_LIMIT_ATTEMPTS: int = 5
    LOGIN_RATE_LIMIT_WINDOW_SECONDS: int = 300
    EXPOSE_API_DOCS: bool = True
    FIELD_ENCRYPTION_KEY: str = ""
    MFA_ISSUER_NAME: str = "CodeVest"
    KYC_PROVIDER: str = "mock"
    PAYMENT_PROVIDER: str = "mock"
    REDIS_URL: str = ""
    @model_validator(mode="after")
    def _enforce_production_safety(self):
        if self.ENVIRONMENT == "production":
            if self.JWT_SECRET_KEY == INSECURE_DEFAULT_SECRET:
                raise ValueError(
                    "Refusing to start with ENVIRONMENT=production and the default "
                    "JWT_SECRET_KEY. Set a real secret via the JWT_SECRET_KEY env var."
                )
            if not self.ALLOWED_ORIGINS:
                raise ValueError(
                    "Refusing to start with ENVIRONMENT=production and no ALLOWED_ORIGINS "
                    "configured. Set ALLOWED_ORIGINS to your actual frontend origin(s)."
                )
            if not self.FIELD_ENCRYPTION_KEY:
                raise ValueError(
                    "Refusing to start with ENVIRONMENT=production and no FIELD_ENCRYPTION_KEY "
                    "configured — PII columns (phone, registration numbers, MFA secrets) require it."
                )
            self.EXPOSE_API_DOCS = False
        return self
    # Weights for the explainable Business Trust Health composite score.
    TRUST_HEALTH_WEIGHTS: dict = {
        "verification": 0.20,
        "financial": 0.30,
        "repayment": 0.30,
        "stability": 0.10,
        "dependency": 0.10,
    }
    # Concentration ratio above which a single customer/supplier/sector is
    DEPENDENCY_CONCENTRATION_THRESHOLD: float = 0.35
    # Relative decline in a monitored metric that triggers a.
    DETERIORATION_TRIGGER_PCT: float = 0.15
settings = Settings()
