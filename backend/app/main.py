from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.logging import setup_logging, logger
from app.database.base import Base
from app.database.session import engine, verify_database_connection
from app.api.api import api_router
# Import all models to ensure metadata registration
import app.models # noqa: F401

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Setup structured logging
    setup_logging()
    logger.info("Initializing AI Software Development Agent backend...")

    # Check database connection and create tables if connected
    db_ok, msg = verify_database_connection()
    if db_ok:
        try:
            logger.info("Connected to MySQL. Ensuring tables are created...")
            Base.metadata.create_all(bind=engine)
            logger.info("Database schema initialized successfully.")
        except Exception as e:
            logger.error(f"Error initializing database schema: {e}")
    else:
        logger.warning(f"Database check warning: {msg}")

    yield
    logger.info("Shutting down AI Software Development Agent backend...")

app = FastAPI(
    title="AI Software Development Agent API",
    description="Enterprise-grade AI-powered assistant transforming requirements into tasks, guidance, test suites, and code reviews.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-AI-Generated-By"]
)

# Mount all domain routers under /api
app.include_router(api_router, prefix="/api")

@app.get("/", include_in_schema=False)
def root_redirect():
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url="http://localhost:5173")

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.method} {request.url}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Please verify backend logs or database connectivity."}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
