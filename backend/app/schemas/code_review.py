from datetime import datetime
from typing import List, Optional, Any
from pydantic import BaseModel, Field

class CodeReviewRequest(BaseModel):
    project_id: int
    source_code: str = Field(..., min_length=5, max_length=100000)
    language: str = Field("Python", max_length=100)
    framework: Optional[str] = None
    file_name: Optional[str] = None
    context_description: Optional[str] = None
    review_focus: Optional[str] = None
    demo_mode: bool = False

class CodeReviewFindingItem(BaseModel):
    title: str
    severity: str = "Medium" # Critical, High, Medium, Low, Informational
    category: str = "Logic Bug" # Security, Logic Bug, Input Validation, Performance, Exception Handling, Readability
    description: str
    code_location: Optional[str] = None
    impact_explanation: str
    recommended_fix: str
    suggested_code: Optional[str] = None

class CodeReviewResult(BaseModel):
    summary: str
    overall_assessment: str
    positive_observations: List[str]
    findings: List[CodeReviewFindingItem]
    recommended_priorities: List[str]
    suggested_tests: List[str]

class CodeReviewFindingResponse(BaseModel):
    id: int
    review_id: int
    title: str
    severity: str
    category: str
    description: str
    code_location: Optional[str] = None
    impact_explanation: str
    recommended_fix: str
    suggested_code: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class CodeReviewResponse(BaseModel):
    id: int
    project_id: int
    user_id: int
    file_name: Optional[str] = None
    language: str
    framework: Optional[str] = None
    context_description: Optional[str] = None
    focus_area: Optional[str] = None
    submitted_code: str
    summary: str
    overall_assessment: str
    positive_observations: Optional[Any] = None
    recommended_priorities: Optional[Any] = None
    suggested_tests: Optional[Any] = None
    findings: List[CodeReviewFindingResponse] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
