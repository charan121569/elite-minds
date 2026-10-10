from fastapi import APIRouter
from app.core.config import settings
from app.database.session import verify_database_connection
from app.schemas.system import HealthResponse

router = APIRouter(tags=["System"])

@router.get("/health", response_model=HealthResponse)
def health_check():
    db_ok, db_msg = verify_database_connection()
    return HealthResponse(
        status="healthy" if db_ok else "degraded",
        database_connected=db_ok,
        database_message=db_msg,
        ai_provider=settings.AI_PROVIDER,
        ai_configured=settings.is_ai_configured,
        ai_model=settings.AI_MODEL,
        app_env=settings.APP_ENV
    )
