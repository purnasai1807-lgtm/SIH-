"""
Field-level (application-layer) encryption for PII columns, independent
of whatever disk/volume encryption the hosting environment provides.
This protects the data even if someone gets a raw database dump or
backup file without the application's key.
Uses Fernet (AES-128-CBC + HMAC, from the `cryptography` package) —
symmetric, authenticated, and simple to rotate. This is deliberately NOT
used on columns that need to be searched/filtered on (email, for
instance stays plaintext+unique-indexed) since encrypted values aren't
directly queryable; that tradeoff is documented wherever it applies.
"""
from cryptography.fernet import Fernet, InvalidToken
from sqlalchemy import String
from sqlalchemy.types import TypeDecorator
from app.core.config import settings
_fernet = Fernet(settings.FIELD_ENCRYPTION_KEY.encode()) if settings.FIELD_ENCRYPTION_KEY else None
def encrypt_value(value: str) -> str:
    if _fernet is None:
        raise RuntimeError(
            "FIELD_ENCRYPTION_KEY is not configured. Generate one with "
            "`python -c \"from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())\"` "
            "and set it in the environment before storing PII."
        )
    return _fernet.encrypt(value.encode()).decode()
def decrypt_value(token: str) -> str | None:
    if _fernet is None:
        raise RuntimeError("FIELD_ENCRYPTION_KEY is not configured.")
    try:
        return _fernet.decrypt(token.encode()).decode()
    except InvalidToken:
        return None
class EncryptedString(TypeDecorator):
    """
    A SQLAlchemy column type that transparently encrypts on write and
    decrypts on read. Usage is identical to a normal String column from
    the ORM's point of view: `phone: Mapped[str] = mapped_column(EncryptedString(255))`.
    Stored column width must accommodate ciphertext, which is larger than
    the plaintext — the impl_length below pads generously.
    """
    impl = String
    cache_ok = True
    def __init__(self, plaintext_max_length: int = 255, *args, **kwargs):
        # Fernet tokens run roughly 1.35x base64 overhead + fixed header;
        # this multiplier keeps reasonable headroom for typical PII fields.
        super().__init__(plaintext_max_length * 2 + 100, *args, **kwargs)
    def process_bind_param(self, value, dialect):
        if value is None:
            return None
        return encrypt_value(value)
    def process_result_value(self, value, dialect):
        if value is None:
            return None
        return decrypt_value(value)
