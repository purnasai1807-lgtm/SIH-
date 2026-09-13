"""
Right-to-erasure / data-minimization support.
This does NOT delete a user's row or their financial/loan/audit history —
regulated financial platforms are almost always required to retain
transactional records for a statutory period regardless of an erasure
request (this is a standard, deliberate exception under GDPR-style and
India's DPDP Act frameworks alike). What this DOES do is scrub the
directly-identifying PII fields, leaving the account unusable and
unlinkable to a real person while the numeric/transactional trail a
regulator or auditor might need stays intact and internally consistent
(foreign keys, loan history, audit log actor_user_id, etc. are untouched).
If your specific regulatory framework has a defined retention period,
encode it here (e.g. only allow erasure once loans are closed and the
retention window has passed) — that's a policy decision this function
deliberately leaves as a TODO rather than guessing at.
"""
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.business import Business
def anonymize_user(db: Session, user: User) -> User:
    user.full_name = "Erased User"
    user.phone = None
    user.email = f"erased-user-{user.id}@erased.invalid"
    user.hashed_password = "!erased!"  # not a valid bcrypt hash — login becomes impossible
    user.mfa_enabled = False
    user.mfa_secret = None
    user.is_active = False
    user.is_anonymized = True
    business = db.query(Business).filter(Business.owner_user_id == user.id).first()
    if business is not None:
        # legal_name and industry/region are kept: they describe the
        # business entity (relevant to aggregate/regulatory reporting),
        # not an individual — only the owner's personal PII is scrubbed.
        business.registration_number = None
    db.commit()
    db.refresh(user)
    return user
