from datetime import datetime
from typing import List, Dict, Optional
from pydantic import BaseModel
from app.schemas.project import ProjectResponse

class ActivityItemResponse(BaseModel):
    id: int
    user_id: int
    project_id: Optional[int] = None
    action_type: str
    description: str
    entity_type: str
    entity_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True

class DashboardStatsResponse(BaseModel):
    total_projects: int
    total_requirements: int
    total_tasks: int
    total_test_cases: int
    total_code_reviews: int
    task_status_distribution: Dict[str, int]
    review_severity_distribution: Dict[str, int]
    recent_projects: List[ProjectResponse]
    recent_activities: List[ActivityItemResponse]
