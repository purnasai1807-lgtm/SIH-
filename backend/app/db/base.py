from sqlalchemy.orm import DeclarativeBase
class Base(DeclarativeBase):
    """
    Shared declarative base for all ORM models.
    Deliberately has NO knowledge of individual model modules — model
    modules import Base one-directionally. Full metadata registration
    (needed by Base.metadata.create_all() and Alembic autogenerate) is
    handled by importing app.models (see app/models/__init__.py), not by
    this module, to avoid a circular-import trap.
    """
    pass
