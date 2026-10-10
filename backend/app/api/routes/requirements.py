from typing import List
from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.requirement import RequirementAnalyzeRequest, RequirementResponse
from app.services.requirement_service import RequirementService

router = APIRouter(tags=["Requirements"])

@router.post("/requirements/analyze", response_model=RequirementResponse, status_code=status.HTTP_201_CREATED)
def analyze_requirement(
    request: RequirementAnalyzeRequest,
    response: Response,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    req_model, used_live = RequirementService.analyze_and_create(db, current_user.id, request)
    response.headers["X-AI-Generated-By"] = "Google-Gemini-Live" if used_live else "Demo-Fixture"
    return RequirementResponse.model_validate(req_model)

@router.get("/projects/{project_id}/requirements", response_model=List[RequirementResponse])
def get_project_requirements(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    requirements = RequirementService.get_project_requirements(db, project_id, current_user.id)
    return [RequirementResponse.model_validate(r) for r in requirements]

@router.get("/requirements/{requirement_id}", response_model=RequirementResponse)
def get_requirement(
    requirement_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    requirement = RequirementService.get_requirement_by_id(db, requirement_id, current_user.id)
    return RequirementResponse.model_validate(requirement)
