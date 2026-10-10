from datetime import datetime
from typing import List, Optional, Any
from pydantic import BaseModel, Field

class TaskGenerateRequest(BaseModel):
    project_id: int
    requirement_id: Optional[int] = None
    replace_existing: bool = False
    custom_instructions: Optional[str] = None
    demo_mode: bool = False

class TaskItemSchema(BaseModel):
    task_key: str
    title: str
    description: str
    category: str = "Backend"  # Architecture, Database, Backend, Frontend, Authentication, Integration, Testing, Deployment
    priority: str = "Medium"   # Critical, High, Medium, Low
    complexity: str = "Medium" # Small, Medium, Large
    status: str = "To Do"      # To Do, In Progress, Completed
    dependencies: List[str] = []
    implementation_steps: List[str] = []
    expected_deliverables: List[str] = []
    acceptance_criteria: List[str] = []
    estimated_duration: Optional[str] = "2-4 hours (AI estimate)"

class TaskListGenerationResult(BaseModel):
    tasks: List[TaskItemSchema]

class TaskCreate(BaseModel):
    project_id: int
    requirement_id: Optional[int] = None
    task_key: str
    title: str
    description: str
    category: str = "Backend"
    priority: str = "Medium"
    complexity: str = "Medium"
    status: str = "To Do"
    dependencies: List[str] = []
    implementation_steps: List[str] = []
    expected_deliverables: List[str] = []
    acceptance_criteria: List[str] = []
    estimated_duration: Optional[str] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str] = None
    complexity: Optional[str] = None
    status: Optional[str] = None
    dependencies: Optional[List[str]] = None
    implementation_steps: Optional[List[str]] = None
    expected_deliverables: Optional[List[str]] = None
    acceptance_criteria: Optional[List[str]] = None
    estimated_duration: Optional[str] = None

class TaskResponse(BaseModel):
    id: int
    project_id: int
    requirement_id: Optional[int] = None
    user_id: int
    task_key: str
    title: str
    description: str
    category: str
    priority: str
    complexity: str
    status: str
    dependencies: Optional[Any] = None
    implementation_steps: Optional[Any] = None
    expected_deliverables: Optional[Any] = None
    acceptance_criteria: Optional[Any] = None
    estimated_duration: Optional[str] = None
    order_index: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
