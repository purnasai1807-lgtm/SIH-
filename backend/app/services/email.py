import smtplib
from email.message import EmailMessage
from app.core.config import settings


def send_verification_email(recipient: str, name: str, verification_url: str) -> None:
    if not all((settings.SMTP_HOST, settings.SMTP_USERNAME, settings.SMTP_PASSWORD, settings.SMTP_FROM_EMAIL)):
        raise RuntimeError("Email delivery is not configured. Set the SMTP_* environment variables.")
    message = EmailMessage()
    message["Subject"] = "Verify your CodeVest email address"
    message["From"] = settings.SMTP_FROM_EMAIL
    message["To"] = recipient
    message.set_content(
        f"Hi {name},\n\nVerify your CodeVest email address within "
        f"{settings.EMAIL_VERIFICATION_EXPIRE_MINUTES} minutes:\n\n{verification_url}\n\n"
        "If you did not create this account, you can ignore this email."
    )
    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15) as server:
        if settings.SMTP_USE_TLS:
            server.starttls()
        server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
        server.send_message(message)
