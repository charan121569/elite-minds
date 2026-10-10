from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select
from fastapi import HTTPException, status
from app.models.guidance import ImplementationGuide
from app.models.requirement import Requirement
from app.models.task import DevelopmentTask
from app.schemas.guidance import GuidanceGenerateRequest
from app.services.project_service import ProjectService
from app.services.activity_service import ActivityService
from app.agents.guidance_agent import guidance_agent

class GuidanceService:
    @staticmethod
    def generate_guidance_for_project(
        db: Session,
        user_id: int,
        request: GuidanceGenerateRequest
    ) -> tuple[ImplementationGuide, bool]:
        project = ProjectService.get_project_by_id_and_owner(db, request.project_id, user_id)

        task_context: Optional[str] = None
        if request.task_id:
            task = db.get(DevelopmentTask, request.task_id)
            if task and task.project_id == project.id:
                task_context = f"Focused Task: {task.task_key} - {task.title}\nCategory: {task.category}\nComplexity: {task.complexity}\nDescription: {task.description}"
        else:
            task_stmt = select(DevelopmentTask).where(DevelopmentTask.project_id == project.id).order_by(DevelopmentTask.order_index.asc())
            all_tasks = list(db.scalars(task_stmt).all())
            if all_tasks:
                task_lines = [
                    f"- [{t.task_key}] {t.title} ({t.category}, Priority: {t.priority}) - {t.description}"
                    for t in all_tasks[:10]
                ]
                task_context = f"All Planned Project Tasks ({len(all_tasks)} total):\n" + "\n".join(task_lines)


        # Fetch latest requirement if available
        stmt = select(Requirement).where(Requirement.project_id == project.id).order_by(Requirement.created_at.desc())
        latest_req = db.scalars(stmt).first()
        req_summary = latest_req.summary if latest_req and latest_req.summary else (project.description or "Standard software architecture")

        tech_stack = {
            "language": project.programming_language,
            "framework": project.framework,
            "database": project.database_preference
        }

        # Invoke Implementation Guidance Agent
        result, used_live = guidance_agent.generate_guidance(
            project_name=project.name,
            tech_stack=tech_stack,
            requirements_summary=req_summary,
            task_context=task_context,
            custom_focus=request.custom_focus,
            demo_mode=request.demo_mode
        )

        try:
            guide = ImplementationGuide(
                project_id=project.id,
                task_id=request.task_id,
                user_id=user_id,
                title=result.title,
                architecture_overview=result.architecture_overview,
                directory_structure=result.directory_structure,
                dependencies=result.dependencies,
                database_schema=result.database_schema,
                api_specifications=[a.model_dump() for a in result.api_specifications],
                data_models=result.data_models,
                implementation_sequence=result.implementation_sequence,
                code_examples=[c.model_dump() for c in result.code_examples],
                integration_steps=result.integration_steps,
                validation_recommendations=result.validation_recommendations,
                error_handling=result.error_handling,
                security_recommendations=result.security_recommendations,
                performance_considerations=result.performance_considerations,
                deployment_considerations=result.deployment_considerations
            )
            db.add(guide)
            db.commit()
            db.refresh(guide)

            ActivityService.log(
                db=db,
                user_id=user_id,
                project_id=project.id,
                action_type="GUIDANCE_CREATED",
                description=f"Generated technical blueprint: {guide.title}",
                entity_type="Guidance",
                entity_id=guide.id
            )

            return guide, used_live
        except Exception as exc:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to persist implementation guide in MySQL: {str(exc)}"
            )

    @staticmethod
    def get_project_guidance(db: Session, project_id: int, user_id: int) -> List[ImplementationGuide]:
        ProjectService.get_project_by_id_and_owner(db, project_id, user_id)
        stmt = select(ImplementationGuide).where(ImplementationGuide.project_id == project_id).order_by(ImplementationGuide.created_at.desc())
        return list(db.scalars(stmt).all())
