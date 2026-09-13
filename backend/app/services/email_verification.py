import hashlib
import secrets
import smtplib
from datetime import datetime, timedelta, timezone
from email.message import EmailMessage
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.email_verification import EmailVerificationToken
from app.models.user import User


def _hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def create_verification_token(db: Session, user: User) -> str:
    db.query(EmailVerificationToken).filter(
        EmailVerificationToken.user_id == user.id,
        EmailVerificationToken.used_at.is_(None),
    ).delete(synchronize_session=False)
    raw_token = secrets.token_urlsafe(48)
    db.add(EmailVerificationToken(
        user_id=user.id,
        token_hash=_hash_token(raw_token),
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=settings.EMAIL_VERIFICATION_EXPIRE_MINUTES),
    ))
    db.commit()
    return raw_token


def verification_url(token: str) -> str:
    return f"{settings.FRONTEND_URL.rstrip('/')}/verify-email?token={token}"


def send_verification_email(user: User, token: str) -> str | None:
    url = verification_url(token)
    if settings.ENVIRONMENT != "production":
        return url
    message = EmailMessage()
    message["Subject"] = "Verify your CodeVest email address"
    message["From"] = settings.SMTP_FROM_EMAIL
    message["To"] = user.email
    message.set_content(
        f"Hello {user.full_name},\n\nVerify your CodeVest email address here:\n{url}\n\n"
        f"This link expires in {settings.EMAIL_VERIFICATION_EXPIRE_MINUTES} minutes."
    )
    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15) as smtp:
        if settings.SMTP_USE_TLS:
            smtp.starttls()
        smtp.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
        smtp.send_message(message)
    return None


def verify_email_token(db: Session, raw_token: str) -> User:
    record = db.query(EmailVerificationToken).filter(
        EmailVerificationToken.token_hash == _hash_token(raw_token),
        EmailVerificationToken.used_at.is_(None),
    ).first()
    if not record or record.expires_at <= datetime.now(timezone.utc):
        raise ValueError("Verification link is invalid or expired.")
    record.used_at = datetime.now(timezone.utc)
    record.user.email_verified = True
    db.commit()
    return record.user
