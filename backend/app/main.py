import logging
from contextlib import asynccontextmanager
from apscheduler.schedulers.background import BackgroundScheduler
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from app.core.config import settings
from app.core.middleware import SecurityHeadersMiddleware, RequestIDMiddleware
import app.models  # noqa: F401  registers all models on Base.metadata — import before create_all
from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.routers import auth, lender, borrower, admin
from app.services.monitoring import run_monitoring_cycle
from app.models import Business
# Structured-ish logging: consistent format with a request-correlatable
# shape, so log aggregation (ELK/CloudWatch/whatever a government
# deployment already runs) can index it without a custom parser.
logging.basicConfig(
    level=logging.INFO if settings.ENVIRONMENT != "development" else logging.DEBUG,
    format='{"time":"%(asctime)s","level":"%(levelname)s","logger":"%(name)s","message":"%(message)s"}',
)
logger = logging.getLogger("codevest")
scheduler = BackgroundScheduler()
def scheduled_monitoring_job():
    """Runs the continuous-monitoring cycle for every business on a fixed
    interval, turning deterioration signals into explainable alerts."""
    db = SessionLocal()
    try:
        for business in db.query(Business).all():
            run_monitoring_cycle(db, business)
        logger.info("Scheduled monitoring cycle completed")
    except Exception:
        logger.exception("Scheduled monitoring cycle failed")
    finally:
        db.close()
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Dev convenience: auto-create tables if they don't exist yet.
    # In staging/production, use Alembic migrations instead (see alembic/) —
    # migrations are reviewable and reversible; silent auto-create is not.
    if settings.ENVIRONMENT == "development":
        Base.metadata.create_all(bind=engine)
    else:
        # Fail fast and loud if the database isn't reachable at boot,
        # rather than accepting traffic and erroring on the first request.
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info("Database connectivity check passed")
    scheduler.add_job(scheduled_monitoring_job, "interval", hours=6, id="monitoring_cycle")
    scheduler.start()
    logger.info(f"CodeVest API starting in {settings.ENVIRONMENT} mode")
    yield
    scheduler.shutdown()
app = FastAPI(
    title=settings.PROJECT_NAME,
    lifespan=lifespan,
    docs_url="/docs" if settings.EXPOSE_API_DOCS else None,
    redoc_url="/redoc" if settings.EXPOSE_API_DOCS else None,
    openapi_url="/openapi.json" if settings.EXPOSE_API_DOCS else None,
)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestIDMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,  # empty by default — no cross-origin access until configured
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth.router)
app.include_router(lender.router)
app.include_router(borrower.router)
app.include_router(admin.router)
@app.get("/")
def root():
    return {"service": settings.PROJECT_NAME, "status": "ok", "environment": settings.ENVIRONMENT}
@app.get("/health")
def health():
    """Liveness probe — process is up. Does not check dependencies."""
    return {"status": "healthy"}
@app.get("/readiness")
def readiness():
    """Readiness probe — process is up AND its database dependency is reachable."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"status": "ready"}
    except Exception as exc:
        logger.error(f"Readiness check failed: {exc}")
        return JSONResponse(status_code=503, content={"status": "not_ready"})
