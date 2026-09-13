import pyotp
import smtplib
from fastapi import APIRouter, Depends, HTTPException, Request, status
from datetime import datetime, timezone
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.deps import get_current_user, get_current_token_payload
from app.core.middleware import login_rate_limiter
from app.core.security import (
    hash_password, verify_password, create_access_token, validate_password_strength,
)
from app.db.session import get_db
from app.models.user import User
from app.models.token import RevokedToken
from app.models.consent import ConsentRecord
from app.schemas.auth import (
    UserRegister, Token, UserOut, MFASetupResponse, MFAVerifyRequest, UserLogin,
    RegistrationResponse, EmailVerificationRequest, ResendVerificationRequest,
)
from app.services.audit import record_audit
from app.services.data_retention import anonymize_user
from app.services.email_verification import create_verification_token, send_verification_email, verify_email_token
router = APIRouter(prefix="/auth", tags=["auth"])
@router.post("/register", response_model=RegistrationResponse, status_code=status.HTTP_201_CREATED)
def register(payload: UserRegister, request: Request, db: Session = Depends(get_db)):
    problems = validate_password_strength(payload.password)
    if problems:
        raise HTTPException(
            status_code=400,
            detail=f"Password does not meet requirements: needs {', '.join(problems)}.",
        )
    existing = db.query(User).filter(User.email == payload.email.lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        email=payload.email.lower(),
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name,
        phone=payload.phone,
        role=payload.role,
        email_verified=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    # Data-processing consent is required, not optional, for a regulated
    # platform handling financial/identity data — recorded at signup time.
    db.add(ConsentRecord(user_id=user.id, consent_type="data_processing", granted=True, version="1.0"))
    db.commit()
    record_audit(
        db, action="user.register", resource_type="user", resource_id=user.id, actor=user,
        detail={"role": user.role.value}, ip_address=request.client.host if request.client else None,
    )
    token = create_verification_token(db, user)
    try:
        verification_link = send_verification_email(user, token)
    except (OSError, smtplib.SMTPException) as exc:
        db.delete(user)
        db.commit()
        raise HTTPException(status_code=503, detail="Unable to send verification email. Please try again later.") from exc
    return RegistrationResponse(
        user=user,
        verification_required=True,
        verification_url=verification_link,
    )
@router.post("/login")
def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    OAuth2 password-flow login. `form_data.username` is the email;
    an MFA code, if the account has MFA enabled, goes in the standard
    OAuth2 `client_secret`... no — this flow doesn't carry a spare field,
    so MFA-enabled accounts must call POST /auth/login/mfa instead once
    they receive `mfa_required` back from this endpoint (see below).
    """
    client_ip = request.client.host if request.client else "unknown"
    rate_limit_key = f"{client_ip}:{form_data.username.lower()}"
    login_rate_limiter.check(rate_limit_key)
    user = db.query(User).filter(User.email == form_data.username.lower()).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        record_audit(
            db, action="user.login", resource_type="user", resource_id=None, actor=None,
            detail={"attempted_email": form_data.username.lower()}, ip_address=client_ip,
            outcome="failure",
        )
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    if not user.is_active:
        record_audit(
            db, action="user.login", resource_type="user", resource_id=user.id, actor=user,
            ip_address=client_ip, outcome="failure", detail={"reason": "account_inactive"},
        )
        raise HTTPException(status_code=403, detail="Account is not active")
    if not user.email_verified:
        raise HTTPException(status_code=403, detail="Please verify your email address before signing in.")
    if user.mfa_enabled:
        # Password verified, but not done yet — the client must present
        # the TOTP code to POST /auth/login/mfa to actually receive a token.
        # We do NOT issue any token here, so a stolen password alone is
        # never sufficient for an MFA-enabled account.
        record_audit(
            db, action="user.login", resource_type="user", resource_id=user.id, actor=user,
            ip_address=client_ip, outcome="success", detail={"stage": "password_ok_awaiting_mfa"},
        )
        return {"mfa_required": True, "detail": "Password verified. Submit your MFA code to POST /auth/login/mfa."}
    login_rate_limiter.reset(rate_limit_key)
    token = create_access_token(subject=str(user.id), role=user.role.value)
    record_audit(
        db, action="user.login", resource_type="user", resource_id=user.id, actor=user, ip_address=client_ip,
    )
    return Token(access_token=token, role=user.role)
@router.post("/login/mfa", response_model=Token)
def login_mfa(payload: UserLogin, request: Request, db: Session = Depends(get_db)):
    """Second step for MFA-enabled accounts: email + password + current TOTP code."""
    client_ip = request.client.host if request.client else "unknown"
    rate_limit_key = f"{client_ip}:{payload.email.lower()}"
    login_rate_limiter.check(rate_limit_key)
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        record_audit(
            db, action="user.login_mfa", resource_type="user", resource_id=None, actor=None,
            ip_address=client_ip, outcome="failure",
        )
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    if not user.mfa_enabled or not user.mfa_secret:
        raise HTTPException(status_code=400, detail="MFA is not enabled on this account")
    if not payload.mfa_code or not pyotp.TOTP(user.mfa_secret).verify(payload.mfa_code, valid_window=1):
        record_audit(
            db, action="user.login_mfa", resource_type="user", resource_id=user.id, actor=user,
            ip_address=client_ip, outcome="failure", detail={"reason": "invalid_mfa_code"},
        )
        raise HTTPException(status_code=401, detail="Invalid or expired MFA code")
    login_rate_limiter.reset(rate_limit_key)
    token = create_access_token(subject=str(user.id), role=user.role.value)
    record_audit(
        db, action="user.login_mfa", resource_type="user", resource_id=user.id, actor=user, ip_address=client_ip,
    )
    return Token(access_token=token, role=user.role)
@router.post("/mfa/setup", response_model=MFASetupResponse)
def mfa_setup(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Generates a new TOTP secret and returns the otpauth:// provisioning
    URI (render as a QR code client-side; the secret is also given as
    plain text for manual entry). MFA is NOT enabled yet — the user must
    confirm they've set it up correctly via POST /auth/mfa/verify first,
    so a botched setup can't lock someone out of their own account.
    """
    secret = pyotp.random_base32()
    current_user.mfa_secret = secret  # stored encrypted (EncryptedString column); not yet enabled
    db.commit()
    uri = pyotp.TOTP(secret).provisioning_uri(name=current_user.email, issuer_name=settings.MFA_ISSUER_NAME)
    return MFASetupResponse(secret=secret, provisioning_uri=uri)
@router.post("/mfa/verify", status_code=status.HTTP_204_NO_CONTENT)
def mfa_verify(
    payload: MFAVerifyRequest, request: Request,
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user),
):
    """Confirms the authenticator app is correctly configured, then turns MFA on."""
    if not current_user.mfa_secret:
        raise HTTPException(status_code=400, detail="Call /auth/mfa/setup first")
    if not pyotp.TOTP(current_user.mfa_secret).verify(payload.code, valid_window=1):
        raise HTTPException(status_code=401, detail="Invalid code")
    current_user.mfa_enabled = True
    db.commit()
    record_audit(
        db, action="user.mfa_enabled", resource_type="user", resource_id=current_user.id, actor=current_user,
        ip_address=request.client.host if request.client else None,
    )
    return None
@router.post("/mfa/disable", status_code=status.HTTP_204_NO_CONTENT)
def mfa_disable(
    request: Request, db: Session = Depends(get_db), current_user: User = Depends(get_current_user),
):
    current_user.mfa_enabled = False
    current_user.mfa_secret = None
    db.commit()
    record_audit(
        db, action="user.mfa_disabled", resource_type="user", resource_id=current_user.id, actor=current_user,
        ip_address=request.client.host if request.client else None,
    )
    return None
@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    payload: dict = Depends(get_current_token_payload),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Revokes the presented access token immediately, ahead of its natural expiry."""
    db.add(RevokedToken(jti=payload["jti"]))
    record_audit(db, action="user.logout", resource_type="user", resource_id=current_user.id, actor=current_user, commit=False)
    db.commit()
    return None
@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/verify-email", response_model=UserOut)
def verify_email(payload: EmailVerificationRequest, db: Session = Depends(get_db)):
    try:
        return verify_email_token(db, payload.token)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/resend-verification", status_code=status.HTTP_202_ACCEPTED)
def resend_verification(payload: ResendVerificationRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if user and not user.email_verified and user.is_active:
        token = create_verification_token(db, user)
        try:
            send_verification_email(user, token)
        except (OSError, smtplib.SMTPException) as exc:
            raise HTTPException(status_code=503, detail="Unable to send verification email.") from exc
    return {"status": "accepted"}
@router.post("/erase-my-data", status_code=status.HTTP_200_OK)
def erase_my_data(
    request: Request, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """
    Self-service right-to-erasure: scrubs the caller's own directly-
    identifying PII (name, email, phone, MFA secret) and permanently
    disables the account. Financial/loan/audit history tied to this
    account is retained — see app/services/data_retention.py for why
    that's a deliberate exception, not an oversight.
    """
    if current_user.is_anonymized:
        raise HTTPException(status_code=400, detail="Your data has already been erased")
    anonymize_user(db, current_user)
    record_audit(
        db, action="user.pii_erased", resource_type="user", resource_id=current_user.id,
        actor=None,  # the acting account no longer has real identity info to attribute to itself
        detail={"self_service": True, "erased_user_id": current_user.id},
        ip_address=request.client.host if request.client else None,
    )
    return {"status": "erased"}
