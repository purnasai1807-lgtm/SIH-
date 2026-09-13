"""
Cross-cutting HTTP middleware: security response headers, a request ID
for traceability across logs, and a login rate limiter.
The rate limiter auto-selects its backend: Redis-backed (coordinates
correctly across multiple worker processes/instances) when REDIS_URL is
configured, otherwise an in-process fallback suitable for single-worker
deployments only. Set REDIS_URL before running more than one worker/
instance in production.
"""
import time
import uuid
from collections import defaultdict
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.config import settings
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "no-referrer"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        if settings.ENVIRONMENT == "production":
            response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains"
        return response
class RequestIDMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
        request.state.request_id = request_id
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response
class _InMemoryLoginRateLimiter:
    """Single-process fixed-window limiter keyed by client IP + attempted email."""
    def __init__(self):
        self._attempts: dict[str, list[float]] = defaultdict(list)
    def check(self, key: str):
        now = time.time()
        window_start = now - settings.LOGIN_RATE_LIMIT_WINDOW_SECONDS
        attempts = [t for t in self._attempts[key] if t > window_start]
        if len(attempts) >= settings.LOGIN_RATE_LIMIT_ATTEMPTS:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many login attempts. Please wait before trying again.",
            )
        attempts.append(now)
        self._attempts[key] = attempts
    def reset(self, key: str):
        self._attempts.pop(key, None)
class _RedisLoginRateLimiter:
    """
    Redis-backed fixed-window limiter — coordinates correctly across
    multiple worker processes/instances behind a load balancer, unlike
    the in-memory version. Selected automatically when REDIS_URL is set.
    """
    def __init__(self, redis_url: str):
        import redis  # local import: only required if REDIS_URL is actually configured
        self._client = redis.Redis.from_url(redis_url, decode_responses=True)
    def _redis_key(self, key: str) -> str:
        return f"login_rate_limit:{key}"
    def check(self, key: str):
        redis_key = self._redis_key(key)
        current = self._client.incr(redis_key)
        if current == 1:
            self._client.expire(redis_key, settings.LOGIN_RATE_LIMIT_WINDOW_SECONDS)
        if current > settings.LOGIN_RATE_LIMIT_ATTEMPTS:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many login attempts. Please wait before trying again.",
            )
    def reset(self, key: str):
        self._client.delete(self._redis_key(key))
def _build_login_rate_limiter():
    if settings.REDIS_URL:
        return _RedisLoginRateLimiter(settings.REDIS_URL)
    return _InMemoryLoginRateLimiter()
login_rate_limiter = _build_login_rate_limiter()