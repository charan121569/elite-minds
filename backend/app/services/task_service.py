from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select, delete
from fastapi import HTTPException, status
from app.models.task import DevelopmentTask
from app.models.requirement import Requirement
from app.schemas.task import TaskGenerateRequest, TaskCreate, TaskUpdate
from app.services.project_service import ProjectService
from app.services.activity_service import ActivityService
from app.agents.task_agent import task_agent

class TaskService:
    @staticmethod
    def generate_tasks_for_project(
        db: Session,
        user_id: int,
        request: TaskGenerateRequest
    ) -> tuple[List[DevelopmentTask], bool]:
        project = ProjectService.get_project_by_id_and_owner(db, request.project_id, user_id)

        req: Optional[Requirement] = None
        if request.requirement_id:
            req = db.get(Requirement, request.requirement_id)
            if not req or req.project_id != project.id:
                raise HTTPException(status_code=400, detail="Invalid requirement specified for this project.")
        else:
            # Pick latest requirement if available
            stmt = select(Requirement).where(Requirement.project_id == project.id).order_by(Requirement.created_at.desc())
            req = db.scalars(stmt).first()

        req_title = req.title if req else project.name
        req_summary = req.summary if req and req.summary else (project.description or "Complete system implementation")
        functional_reqs = req.functional_requirements if req and req.functional_requirements else []

        tech_stack = {
            "language": project.programming_language,
            "framework": project.framework,
            "database": project.database_preference
        }

        # Invoke AI Task Agent
        result, used_live = task_agent.generate_tasks(
            requirement_title=req_title,
            requirement_summary=req_summary,
            functional_reqs=functional_reqs,
            tech_stack=tech_stack,
            custom_instructions=request.custom_instructions,
            demo_mode=request.demo_mode
        )

        try:
            # Handle replace vs append
            if request.replace_existing:
                del_stmt = delete(DevelopmentTask).where(DevelopmentTask.project_id == project.id)
                db.execute(del_stmt)

            created_tasks: List[DevelopmentTask] = []
            for idx, task_data in enumerate(result.tasks):
                task_model = DevelopmentTask(
                    project_id=project.id,
                    requirement_id=req.id if req else None,
                    user_id=user_id,
                    task_key=task_data.task_key,
                    title=task_data.title,
                    description=task_data.description,
                    category=task_data.category,
                    priority=task_data.priority,
                    complexity=task_data.complexity,
                    status=task_data.status,
                    dependencies=task_data.dependencies,
                    implementation_steps=task_data.implementation_steps,
                    expected_deliverables=task_data.expected_deliverables,
                    acceptance_criteria=task_data.acceptance_criteria,
                    estimated_duration=task_data.estimated_duration,
                    order_index=idx
                )
                db.add(task_model)
                created_tasks.append(task_model)

            db.commit()
            for t in created_tasks:
                db.refresh(t)

            ActivityService.log(
                db=db,
                user_id=user_id,
                project_id=project.id,
                action_type="TASKS_GENERATED",
                description=f"Generated {len(created_tasks)} development tasks for {project.name}",
                entity_type="Task",
                entity_id=created_tasks[0].id if created_tasks else None
            )

            return created_tasks, used_live
        except Exception as exc:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to persist generated tasks in MySQL: {str(exc)}"
            )

    @staticmethod
    def get_project_tasks(
        db: Session,
        project_id: int,
        user_id: int,
        status_filter: Optional[str] = None,
        priority_filter: Optional[str] = None
    ) -> List[DevelopmentTask]:
        ProjectService.get_project_by_id_and_owner(db, project_id, user_id)
        stmt = select(DevelopmentTask).where(DevelopmentTask.project_id == project_id)
        if status_filter:
            stmt = stmt.where(DevelopmentTask.status == status_filter)
        if priority_filter:
            stmt = stmt.where(DevelopmentTask.priority == priority_filter)
        stmt = stmt.order_by(DevelopmentTask.order_index.asc(), DevelopmentTask.created_at.asc())
        return list(db.scalars(stmt).all())

    @staticmethod
    def update_task(db: Session, task_id: int, user_id: int, request: TaskUpdate) -> DevelopmentTask:
        task = db.get(DevelopmentTask, task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found.")
        ProjectService.get_project_by_id_and_owner(db, task.project_id, user_id)

        if request.title is not None:
            task.title = request.title
        if request.description is not None:
            task.description = request.description
        if request.category is not None:
            task.category = request.category
        if request.priority is not None:
            task.priority = request.priority
        if request.complexity is not None:
            task.complexity = request.complexity
        if request.status is not None:
            task.status = request.status
        if request.dependencies is not None:
            task.dependencies = request.dependencies
        if request.implementation_steps is not None:
            task.implementation_steps = request.implementation_steps
        if request.expected_deliverables is not None:
            task.expected_deliverables = request.expected_deliverables
        if request.acceptance_criteria is not None:
            task.acceptance_criteria = request.acceptance_criteria
        if request.estimated_duration is not None:
            task.estimated_duration = request.estimated_duration

        db.commit()
        db.refresh(task)

        ActivityService.log(
            db=db,
            user_id=user_id,
            project_id=task.project_id,
            action_type="TASK_UPDATED",
            description=f"Updated task {task.task_key} status to '{task.status}'",
            entity_type="Task",
            entity_id=task.id
        )

        return task

    @staticmethod
    def delete_task(db: Session, task_id: int, user_id: int) -> bool:
        task = db.get(DevelopmentTask, task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found.")
        ProjectService.get_project_by_id_and_owner(db, task.project_id, user_id)
        
        db.delete(task)
        db.commit()
        return True
