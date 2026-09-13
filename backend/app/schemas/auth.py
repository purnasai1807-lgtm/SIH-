from pydantic import BaseModel, EmailStr, Field
from app.models.user import UserRole
class UserRegister(BaseModel):
    email: EmailStr
    # Length floor here is a cheap early rejection; the authoritative check
    # (length + complexity, both driven by settings.PASSWORD_MIN_LENGTH) runs
    # in the /auth/register handler via validate_password_strength().
    password: str = Field(min_length=8)
    full_name: str
    phone: str | None = None
    role: UserRole
class UserLogin(BaseModel):
    email: EmailStr
    password: str
    mfa_code: str | None = None  # required only if the account has MFA enabled


class ResendVerificationRequest(BaseModel):
    email: EmailStr
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: UserRole
class MFARequiredResponse(BaseModel):
    mfa_required: bool = True
    detail: str = "MFA code required to complete login."
class MFASetupResponse(BaseModel):
    secret: str
    provisioning_uri: str  # otpauth:// URI — render as a QR code client-side
class MFAVerifyRequest(BaseModel):
    code: str = Field(min_length=6, max_length=6)
class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: UserRole
    status: str
    mfa_enabled: bool
    email_verified: bool
    class Config:
        from_attributes = True
