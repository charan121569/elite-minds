from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = Field(None, max_length=2000)
    programming_language: str = Field("TypeScript", max_length=100)
    framework: str = Field("React", max_length=100)
    database_preference: str = Field("MySQL", max_length=100)
    status: str = Field("active", max_length=50)

class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    description: Optional[str] = Field(None, max_length=2000)
    programming_language: Optional[str] = Field(None, max_length=100)
    framework: Optional[str] = Field(None, max_length=100)
    database_preference: Optional[str] = Field(None, max_length=100)
    status: Optional[str] = Field(None, max_length=50)

class ProjectResponse(BaseModel):
    id: int
    user_id: int
    name: str
    description: Optional[str] = None
    programming_language: str
    framework: str
    database_preference: str
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ProjectDetailResponse(ProjectResponse):
    requirement_count: int = 0
    task_count: int = 0
    guidance_count: int = 0
    test_count: int = 0
    review_count: int = 0
