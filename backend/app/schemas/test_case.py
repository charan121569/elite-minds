from datetime import datetime
from typing import List, Optional, Any
from pydantic import BaseModel, Field

class TestCaseItemSchema(BaseModel):
    test_key: str
    title: str
    description: str
    related_requirement: Optional[str] = None
    preconditions: Optional[str] = None
    test_steps: List[str]
    input_data: Optional[str] = None
    expected_result: str
    priority: str = "Medium" # Critical, High, Medium, Low
    category: str = "Positive" # Positive, Negative, Boundary, Input Validation, Authentication, Security, etc.
    automation_approach: str = "API" # Unit, Integration, API, E2E, Manual
    test_code_snippet: Optional[str] = None

class TestGenerationResult(BaseModel):
    test_cases: List[TestCaseItemSchema]

class TestGenerateRequest(BaseModel):
    project_id: int
    requirement_id: Optional[int] = None
    task_id: Optional[int] = None
    focus_category: Optional[str] = None
    demo_mode: bool = False

class TestCaseCreate(BaseModel):
    project_id: int
    requirement_id: Optional[int] = None
    task_id: Optional[int] = None
    test_key: str
    title: str
    description: str
    related_requirement: Optional[str] = None
    preconditions: Optional[str] = None
    test_steps: List[str] = []
    input_data: Optional[str] = None
    expected_result: str
    priority: str = "Medium"
    category: str = "Positive"
    automation_approach: str = "API"
    execution_status: str = "Not Run"
    execution_notes: Optional[str] = None
    test_code_snippet: Optional[str] = None

class TestCaseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    preconditions: Optional[str] = None
    test_steps: Optional[List[str]] = None
    input_data: Optional[str] = None
    expected_result: Optional[str] = None
    priority: Optional[str] = None
    category: Optional[str] = None
    automation_approach: Optional[str] = None
    execution_status: Optional[str] = None
    execution_notes: Optional[str] = None
    test_code_snippet: Optional[str] = None

class TestCaseResponse(BaseModel):
    id: int
    project_id: int
    requirement_id: Optional[int] = None
    task_id: Optional[int] = None
    user_id: int
    test_key: str
    title: str
    description: str
    related_requirement: Optional[str] = None
    preconditions: Optional[str] = None
    test_steps: Optional[Any] = None
    input_data: Optional[str] = None
    expected_result: str
    priority: str
    category: str
    automation_approach: str
    execution_status: str
    execution_notes: Optional[str] = None
    test_code_snippet: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class CodeVerificationGap(BaseModel):
    issue: str
    severity: str = "Medium" # Critical, High, Medium, Low
    location: Optional[str] = None
    explanation: str

class CodeTestVerificationResult(BaseModel):
    verdict: str # PASS, FAIL, PARTIAL, NOT_TESTABLE
    confidence_score: int = 90
    summary: str
    test_query_evaluated: str
    strengths: List[str] = []
    gaps_and_bugs: List[CodeVerificationGap] = []
    suggested_fix: Optional[str] = None
    generated_test_code: Optional[str] = None

class CodeTestVerificationRequest(BaseModel):
    project_id: int
    test_case_id: Optional[int] = None
    test_query: str
    implemented_code: str
    language: Optional[str] = "python"
    expected_behavior: Optional[str] = None
    demo_mode: bool = False

class AdaptedTestCaseItem(BaseModel):
    test_id: int
    test_key: str
    title: str
    old_expected_result: str
    new_expected_result: str
    old_test_steps: List[str] = []
    new_test_steps: List[str] = []
    old_input_data: Optional[str] = None
    new_input_data: Optional[str] = None
    execution_status: str = "Passed" # Passed, Failed, Adapted
    execution_notes: str
    updated_test_code_snippet: Optional[str] = None
    modifications_summary: List[str] = []

class AdaptiveTestExecutionResponse(BaseModel):
    verdict: str # PASS, FAIL, ADAPTED
    execution_output: str
    summary: str
    gaps_found: List[str] = []
    adapted_tests: List[AdaptedTestCaseItem] = []
    applied_to_db: bool = False
    generated_review_id: Optional[int] = None
    generated_review_summary: Optional[str] = None


class AdaptiveTestExecutionRequest(BaseModel):
    project_id: int
    test_case_id: Optional[int] = None
    implemented_code: str
    language: Optional[str] = "python"
    guide_id: Optional[int] = None
    auto_apply: bool = False
    demo_mode: bool = False

class ApplyAdaptedTestsRequest(BaseModel):
    project_id: int
    adapted_tests: List[AdaptedTestCaseItem]


