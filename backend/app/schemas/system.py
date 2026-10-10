from typing import Optional
from pydantic import BaseModel

class HealthResponse(BaseModel):
    status: str
    database_connected: bool
    database_message: str
    ai_provider: str
    ai_configured: bool
    ai_model: str
    app_env: str
