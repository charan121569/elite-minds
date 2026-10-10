from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select, or_, func
from fastapi import HTTPException, status
from app.models.project import Project
from app.models.requirement import Requirement
from app.models.task import DevelopmentTask
from app.models.guidance import ImplementationGuide
from app.models.test_case import TestCase
from app.models.code_review import CodeReview
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectDetailResponse
from app.services.activity_service import ActivityService

class ProjectService:
    @staticmethod
    def get_user_projects(
        db: Session,
        user_id: int,
        search: Optional[str] = None,
        language: Optional[str] = None,
        sort_by: str = "updated_at",
        sort_order: str = "desc"
    ) -> List[Project]:
        query = select(Project).where(Project.user_id == user_id)

        if search:
            search_filter = f"%{search.strip()}%"
            query = query.where(
                or_(
                    Project.name.ilike(search_filter),
                    Project.description.ilike(search_filter),
                    Project.framework.ilike(search_filter),
                    Project.programming_language.ilike(search_filter)
                )
            )

        if language:
            query = query.where(Project.programming_language == language)

        if sort_by == "name":
            order_col = Project.name.desc() if sort_order == "desc" else Project.name.asc()
        elif sort_by == "created_at":
            order_col = Project.created_at.desc() if sort_order == "desc" else Project.created_at.asc()
        else:
            order_col = Project.updated_at.desc() if sort_order == "desc" else Project.updated_at.asc()

        query = query.order_by(order_col)
        return list(db.scalars(query).all())

    @staticmethod
    def get_project_by_id_and_owner(db: Session, project_id: int, user_id: int) -> Project:
        project = db.get(Project, project_id)
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Project with ID {project_id} not found."
            )
        if project.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this project."
            )
        return project

    @staticmethod
    def get_project_detail(db: Session, project_id: int, user_id: int) -> ProjectDetailResponse:
        project = ProjectService.get_project_by_id_and_owner(db, project_id, user_id)
        
        req_count = db.scalar(select(func.count(Requirement.id)).where(Requirement.project_id == project_id)) or 0
        task_count = db.scalar(select(func.count(DevelopmentTask.id)).where(DevelopmentTask.project_id == project_id)) or 0
        guidance_count = db.scalar(select(func.count(ImplementationGuide.id)).where(ImplementationGuide.project_id == project_id)) or 0
        test_count = db.scalar(select(func.count(TestCase.id)).where(TestCase.project_id == project_id)) or 0
        review_count = db.scalar(select(func.count(CodeReview.id)).where(CodeReview.project_id == project_id)) or 0

        res = ProjectDetailResponse.model_validate(project)
        res.requirement_count = req_count
        res.task_count = task_count
        res.guidance_count = guidance_count
        res.test_count = test_count
        res.review_count = review_count
        return res

    @staticmethod
    def create_project(db: Session, user_id: int, request: ProjectCreate) -> Project:
        project = Project(
            user_id=user_id,
            name=request.name.strip(),
            description=request.description.strip() if request.description else None,
            programming_language=request.programming_language,
            framework=request.framework,
            database_preference=request.database_preference,
            status=request.status or "active"
        )
        db.add(project)
        db.commit()
        db.refresh(project)

        ActivityService.log(
            db=db,
            user_id=user_id,
            project_id=project.id,
            action_type="PROJECT_CREATED",
            description=f"Created new project: {project.name}",
            entity_type="Project",
            entity_id=project.id
        )

        return project

    @staticmethod
    def update_project(db: Session, project_id: int, user_id: int, request: ProjectUpdate) -> Project:
        project = ProjectService.get_project_by_id_and_owner(db, project_id, user_id)

        if request.name is not None:
            project.name = request.name.strip()
        if request.description is not None:
            project.description = request.description.strip()
        if request.programming_language is not None:
            project.programming_language = request.programming_language
        if request.framework is not None:
            project.framework = request.framework
        if request.database_preference is not None:
            project.database_preference = request.database_preference
        if request.status is not None:
            project.status = request.status

        db.commit()
        db.refresh(project)

        ActivityService.log(
            db=db,
            user_id=user_id,
            project_id=project.id,
            action_type="PROJECT_UPDATED",
            description=f"Updated details for project: {project.name}",
            entity_type="Project",
            entity_id=project.id
        )

        return project

    @staticmethod
    def delete_project(db: Session, project_id: int, user_id: int) -> bool:
        project = ProjectService.get_project_by_id_and_owner(db, project_id, user_id)
        name = project.name
        db.delete(project)
        db.commit()

        ActivityService.log(
            db=db,
            user_id=user_id,
            action_type="PROJECT_DELETED",
            description=f"Deleted project: {name}",
            entity_type="Project",
            entity_id=project_id
        )

        return True
