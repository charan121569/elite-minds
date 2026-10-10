from typing import List
from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.guidance import GuidanceGenerateRequest, GuidanceResponse
from app.services.guidance_service import GuidanceService

router = APIRouter(tags=["Implementation Guidance"])

@router.post("/guidance/generate", response_model=GuidanceResponse, status_code=status.HTTP_201_CREATED)
def generate_guidance(
    request: GuidanceGenerateRequest,
    response: Response,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    guide, used_live = GuidanceService.generate_guidance_for_project(db, current_user.id, request)
    response.headers["X-AI-Generated-By"] = "Google-Gemini-Live" if used_live else "Demo-Fixture"
    return GuidanceResponse.model_validate(guide)

@router.get("/projects/{project_id}/guidance", response_model=List[GuidanceResponse])
def get_project_guidance(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    guides = GuidanceService.get_project_guidance(db, project_id, current_user.id)
    return [GuidanceResponse.model_validate(g) for g in guides]
