from typing import List, Optional
from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.task import TaskGenerateRequest, TaskUpdate, TaskResponse
from app.services.task_service import TaskService

router = APIRouter(tags=["Tasks"])

@router.post("/tasks/generate", response_model=List[TaskResponse], status_code=status.HTTP_201_CREATED)
def generate_tasks(
    request: TaskGenerateRequest,
    response: Response,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tasks, used_live = TaskService.generate_tasks_for_project(db, current_user.id, request)
    response.headers["X-AI-Generated-By"] = "Google-Gemini-Live" if used_live else "Demo-Fixture"
    return [TaskResponse.model_validate(t) for t in tasks]

@router.get("/projects/{project_id}/tasks", response_model=List[TaskResponse])
def get_project_tasks(
    project_id: int,
    status_filter: Optional[str] = Query(None, alias="status"),
    priority_filter: Optional[str] = Query(None, alias="priority"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tasks = TaskService.get_project_tasks(
        db, project_id, current_user.id, status_filter=status_filter, priority_filter=priority_filter
    )
    return [TaskResponse.model_validate(t) for t in tasks]

@router.put("/tasks/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    request: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = TaskService.update_task(db, task_id, current_user.id, request)
    return TaskResponse.model_validate(task)

@router.delete("/tasks/{task_id}")
def delete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    TaskService.delete_task(db, task_id, current_user.id)
    return {"message": "Task deleted successfully."}
