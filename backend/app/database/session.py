from typing import Generator
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings
from app.core.logging import logger

# Create engine with MySQL connection pooling and sensible timeouts
engine = create_engine(
    settings.sync_database_url,
    pool_pre_ping=True,
    pool_recycle=3600,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db() -> Generator[Session, None, None]:
    """Dependency that provides a database session and handles rollback on error."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def verify_database_connection() -> tuple[bool, str]:
    """
    Checks if MySQL connection can be established.
    Returns (success: bool, message: str)
    """
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True, "Connected to MySQL successfully."
    except Exception as exc:
        msg = (
            f"Failed to connect to MySQL database '{settings.DB_NAME}' at {settings.DB_HOST}:{settings.DB_PORT}. "
            f"Reason: {str(exc)}. Please check your .env credentials and ensure MySQL is running."
        )
        logger.warning(msg)
        return False, msg
