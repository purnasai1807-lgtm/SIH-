from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.token import RevokedToken
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None or "sub" not in payload or "jti" not in payload:
        raise credentials_exception
    if db.query(RevokedToken).filter(RevokedToken.jti == payload["jti"]).first():
        raise credentials_exception
    user = db.query(User).filter(User.id == int(payload["sub"])).first()
    if user is None or not user.is_active:
        raise credentials_exception
    return user
def get_current_token_payload(token: str = Depends(oauth2_scheme)) -> dict:
    """Exposes the raw decoded token (needed by /auth/logout to get the jti)."""
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    return payload
def require_role(*roles: UserRole):
    """
    FastAPI dependency factory for role-based access control.
    Usage: current_user: User = Depends(require_role(UserRole.LENDER))
    """
    def _checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Requires one of roles: {[r.value for r in roles]}",
            )
        return current_user
    return _checker
