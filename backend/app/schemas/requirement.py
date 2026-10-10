from datetime import datetime
from typing import List, Optional, Any
from pydantic import BaseModel, Field

class RequirementAnalyzeRequest(BaseModel):
    project_id: int
    title: str = Field(..., min_length=2, max_length=255)
    raw_requirement: str = Field(..., min_length=10)
    constraints: Optional[str] = None
    acceptance_criteria: Optional[str] = None
    demo_mode: bool = False

class FunctionalRequirementItem(BaseModel):
    id: str
    feature: str
    description: str
    priority: str = "High"

class UserRoleItem(BaseModel):
    role: str
    description: str
    permissions: List[str]

class PhaseItem(BaseModel):
    phase_number: int
    title: str
    description: str
    estimated_duration: Optional[str] = None
    key_deliverables: List[str]

class RequirementAnalysisResult(BaseModel):
    summary: str
    problem_statement: str
    functional_requirements: List[FunctionalRequirementItem]
    non_functional_requirements: List[str]
    user_roles: List[UserRoleItem]
    assumptions: List[str]
    missing_information: List[str]
    clarification_questions: List[str]
    technical_constraints: List[str]
    suggested_architecture: List[str]
    potential_risks: List[str]
    acceptance_criteria: List[str]
    suggested_phases: List[PhaseItem]

class RequirementResponse(BaseModel):
    id: int
    project_id: int
    user_id: int
    title: str
    raw_requirement: str
    constraints: Optional[str] = None
    acceptance_criteria: Optional[str] = None
    summary: Optional[str] = None
    problem_statement: Optional[str] = None
    functional_requirements: Optional[Any] = None
    non_functional_requirements: Optional[Any] = None
    user_roles: Optional[Any] = None
    permissions: Optional[Any] = None
    assumptions: Optional[Any] = None
    missing_information: Optional[Any] = None
    clarification_questions: Optional[Any] = None
    technical_constraints: Optional[Any] = None
    suggested_architecture: Optional[Any] = None
    potential_risks: Optional[Any] = None
    structured_acceptance_criteria: Optional[Any] = None
    suggested_phases: Optional[Any] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
