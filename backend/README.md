# CodeVest Backend
FastAPI + PostgreSQL backend implementing the CodeVest prototype architecture:
one platform, three role-based experiences (Lender / Borrower / Admin), and
the explainable risk-intelligence modules (Business Trust Health, Dependency
& Concentration Risk, Continuous Monitoring, Early-Warning Alerts, Lender
Health).
## What's implemented
- **Auth**: register/login/me, JWT bearer tokens, bcrypt password hashing,
  role-based access control (`require_role` dependency).
- **Data model** (`app/models/`): users, businesses, verification records,
  documents, financial profiles, repayment records, dependency records,
  business trust health snapshots, loan opportunities, loans, monitoring
  events, alerts, fraud cases, ML model registry, messages, notifications.
- **Core intelligence services** (`app/services/`):
  - `trust_health.py` — composite 0–100 Business Trust Health score from
    verification, financial health, repayment behaviour, stability, and
    dependency risk, with a plain-language explanation per component.
  - `dependency_risk.py` — customer/supplier/sector/region concentration
    (Herfindahl-style index) with trend detection and explainable warnings.
  - `monitoring.py` — compares each new snapshot/financial period/dependency
    reading against the prior one and raises severity-graded Alerts when a
    metric deteriorates beyond a configurable threshold.
  - `lender_health.py` — portfolio diversification index, sector/region
    concentration, and detection of *hidden shared dependencies* (multiple
    funded businesses relying on the same customer/supplier).
  - `alerts.py` — filtered alert querying shared by all three dashboards.
- **Routers** (`app/routers/`): `auth`, `lender`, `borrower`, `admin` —
  covering every module listed in section 2–4 of the architecture doc
  (dashboards, opportunities, portfolio, risk monitor, alerts, business
  profile, application, financial/dependency profile, improvement insights,
  documents, notifications, users, businesses, verification queue, loans,
  monitoring, fraud, ML model registry, analytics).
- **Scheduler**: APScheduler background job re-runs the monitoring cycle
  for every business every 6 hours (in addition to the on-demand
  `/admin/monitoring/run/{business_id}` endpoint).
- **Seed script** (`seed.py`): creates one admin, one lender, and two
  borrowers — one with a deliberately concentrated, worsening customer
  dependency (to demonstrate warnings/alerts) and one with a healthy,
  diversified profile — plus financial history, repayments, and open
  funding opportunities.
## Important product rule encoded in the data model
`Loan.amount_lent` is the real, actual lending exposure. `downside_tolerance`
(set per loan and surfaced on opportunities) is only a lender risk-preference
parameter — it is never treated anywhere in this codebase as insurance, a
reserve, a compensation mechanism, or a cap on realized loss. See the
docstring on `app/models/loan.py::Loan`.
## Setup
```bash
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# edit .env: set DATABASE_URL to your Postgres instance, and a real JWT_SECRET_KEY
# REQUIRED before the next step — seed.py and any PII write will raise without this:
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
# paste the output into .env as FIELD_ENCRYPTION_KEY=...
# Option A — quick start (dev): tables auto-create on app startup, then seed:
python seed.py
# Option B — versioned migrations:
alembic revision --autogenerate -m "init"
alembic upgrade head
python seed.py
uvicorn app.main:app --reload
```
API docs: http://localhost:8000/docs
## Demo credentials (after running seed.py)
| Role     | Email                     | Password      |
|----------|----------------------------|---------------|
| Admin    | admin@codevest.dev         | Admin1234!     |
| Lender   | lender1@codevest.dev       | Lender123!    |
| Borrower | borrower1@codevest.dev     | Borrower123!  |
| Borrower | borrower2@codevest.dev     | Borrower123!  |
Login via `POST /auth/login` (OAuth2 password form: `username`=email,
`password`=password), then send the returned `access_token` as
`Authorization: Bearer <token>` on subsequent requests.
## Security & compliance
This codebase includes audit logging, MFA (TOTP), field-level encryption for
PII, hardened auth (rate limiting — Redis-backed when `REDIS_URL` is set,
password policy, token revocation), security headers, consent tracking, a
pluggable KYC-provider interface, and a right-to-erasure workflow. See
**COMPLIANCE.md** for a full, honest breakdown of what's covered vs. what
still requires an infrastructure choice, a contract with an external
provider, or a human auditor (encryption at rest, data residency, a real
KYC/bank-escrow integration, third-party security audit/certification) —
none of which can be completed by writing more code.
## Suggested next steps (not yet built)
- Supabase Storage / S3 integration for actual document file uploads
  (currently `Document.file_url` just stores a URL string).
- Real ML models (the `ml_models` table and trust-health scorer are
  currently a transparent rule-based system, matching "explainable" intent
  from the architecture doc — swap in trained models behind the same
  service interface when ready).
- A real KYC provider behind `app/services/kyc.py` (only a mock is wired up)
  and a real payment/escrow rail behind `app/services/payments.py` (same).
- WebSocket or push notifications for real-time alerts.
- Refresh tokens and email verification for auth (logout/revocation and MFA
  are already implemented).
- pytest test suite — everything so far has been verified by static
  compilation and standalone re-implementation of the core algorithms; see
  COMPLIANCE.md and the conversation history for what that did and didn't
  cover. A real `pytest` suite run against a live Postgres instance is the
  next trust-building step.
