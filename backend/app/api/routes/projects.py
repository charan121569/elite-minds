from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse, ProjectDetailResponse
from app.services.project_service import ProjectService

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    request: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = ProjectService.create_project(db, current_user.id, request)
    return ProjectResponse.model_validate(project)

@router.get("", response_model=List[ProjectResponse])
def get_projects(
    search: Optional[str] = Query(None, description="Search term for project name or description"),
    language: Optional[str] = Query(None, description="Filter by programming language"),
    sort_by: str = Query("updated_at", pattern="^(updated_at|created_at|name)$"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    projects = ProjectService.get_user_projects(
        db, current_user.id, search=search, language=language, sort_by=sort_by, sort_order=sort_order
    )
    return [ProjectResponse.model_validate(p) for p in projects]

@router.get("/{project_id}", response_model=ProjectDetailResponse)
def get_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return ProjectService.get_project_detail(db, project_id, current_user.id)

@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: int,
    request: ProjectUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = ProjectService.update_project(db, project_id, current_user.id, request)
    return ProjectResponse.model_validate(project)

@router.delete("/{project_id}")
def delete_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ProjectService.delete_project(db, project_id, current_user.id)
    return {"message": "Project deleted successfully."}
