# Security & Compliance Posture
An honest map of what this codebase does today, and — just as
important — what it still cannot do, because those items require
infrastructure choices, contracts with external providers, or human
auditors that no amount of code can substitute for. Treat this as a
checklist for whoever owns compliance sign-off, not a claim of
certification.
## Implemented in code
**Authentication & session control**
- Bcrypt password hashing
- Password policy: configurable minimum length (default 10) + upper/
  lower/digit/special character required (`app/core/security.py`)
- **MFA (TOTP)**: `/auth/mfa/setup` → `/auth/mfa/verify` → enabled;
  `/auth/login` returns `mfa_required: true` for MFA-enabled accounts,
  which then complete via `/auth/login/mfa` with email + password +
  current code (`pyotp`, secret stored encrypted)
- Short-lived JWTs (30 min) carrying a unique `jti`; `/auth/logout`
  revokes that specific token immediately via a revocation list
- Login rate limiting: Redis-backed (coordinates correctly across
  multiple worker processes/instances) when `REDIS_URL` is set,
  in-process fallback otherwise
- App refuses to boot with `ENVIRONMENT=production` if the JWT secret
  is the default, CORS origins are unset, or `FIELD_ENCRYPTION_KEY` is
  unset
**Authorization** — role-based access control on every route
(`require_role`).
**Field-level encryption** — `User.phone`, `User.mfa_secret`, and
`Business.registration_number` are encrypted at the application layer
(Fernet/AES via `app/core/encryption.py`), independent of whatever disk
encryption the hosting environment provides. Protects the data even
against a raw database dump. Email stays plaintext+indexed deliberately
(it's the login lookup key; encrypted values aren't queryable).
**Audit trail (non-repudiation)** — append-only `AuditLog`. Logged:
registration, every login attempt (success and failure, both the
password step and the MFA step), logout, MFA enable/disable,
verification decisions, user status changes, PII erasure, fraud case
status changes, and every funded loan. `GET /admin/audit-log` to review.
**Data protection & retention**
- `ConsentRecord` captures data-processing consent at registration
  (append-only, versioned)
- **Right to erasure**: `POST /auth/erase-my-data` (self-service) and
  `POST /admin/users/{id}/erase` (admin-initiated, reason required and
  audited) scrub directly-identifying PII (name, email, phone, MFA
  secret, business registration number) and permanently disable the
  account. Deliberately does **not** delete loan/financial/audit
  history — regulated financial platforms are near-universally required
  to retain transactional records for a statutory period regardless of
  an erasure request; see `app/services/data_retention.py` for the
  reasoning and the TODO where a specific retention window should be
  encoded once you know your regulatory framework.
**Pluggable external-integration points** (mocked, not real, but
structured so a real provider is a swap-in, not a rewrite):
- `app/services/kyc.py` — `KYCProvider` interface; only `MockKYCProvider`
  is implemented. Wiring DigiLocker/Aadhaar eKYC or an equivalent means
  implementing this interface, nothing else in the codebase changes.
- `app/services/payments.py` — `PaymentProvider` interface for
  bank/escrow-mediated fund movement; only `MockPaymentProvider` is
  implemented (it does not move real money).
**Transport / HTTP hardening** — security headers on every response
(`X-Frame-Options: DENY`, HSTS in production, etc.), no-wildcard CORS by
default, `X-Request-ID` tracing, API docs force-disabled in production.
**Operational** — `/health` and `/readiness` endpoints, structured JSON
logging, Alembic migrations as an alternative to dev-only auto-create.
## Still NOT implemented — genuinely outside what code can complete
- **Encryption at rest for the database/disk itself** — this is a
  hosting/infrastructure configuration (managed Postgres with encrypted
  volumes, a KMS), not an application concern. Field-level encryption
  above is a second, independent layer on top of whatever your hosting
  environment provides — confirm the latter separately.
- **Data residency** — a hosting/region decision, not a code change.
- **A real KYC/eKYC integration** — the interface exists; the actual
  government/bank API integration, credentials, and legal agreement
  with that provider do not.
- **A real escrow/bank-mediated payment rail** — same story: the
  interface exists, a real integration requires a banking partner.
- **Third-party security audit, penetration testing, dependency
  vulnerability scanning, SBOM generation, and any formal certification**
  (e.g. STQC empanelment or an equivalent in your jurisdiction) — these
  require human auditors and a defined process; none of it can happen
  inside a code-generation session.
- **Distributed rate limiting is now supported but untested against a
  real Redis instance** — the Redis backend is implemented
  (`app/core/middleware.py`) but, like the rest of this codebase, has
  only been statically verified, not run against live infrastructure.
## What changed since the last review
Closed in this pass: MFA, field-level PII encryption, a pluggable KYC
provider interface, a pluggable payment/escrow provider interface,
Redis-backed distributed rate limiting, and a right-to-erasure workflow.
## Recommended next step
The items in the "genuinely outside what code can complete" section are
the actual remaining path to a government-ready deployment. They need a
decision-maker (which regulatory framework, which KYC/bank partner,
which auditor) more than they need more code. Once that framework is
known, the pluggable interfaces above make the remaining integration
work scoped and mechanical rather than architectural.
