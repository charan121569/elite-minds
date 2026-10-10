from typing import List, Optional
from fastapi import APIRouter, Depends, Query, Response, status
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.test_case import (
    TestGenerateRequest,
    TestCaseUpdate,
    TestCaseResponse,
    AdaptiveTestExecutionRequest,
    AdaptiveTestExecutionResponse,
    ApplyAdaptedTestsRequest,
)
from app.services.test_service import TestService

router = APIRouter(tags=["Test Cases"])

@router.post("/tests/adapt", response_model=AdaptiveTestExecutionResponse)
def adapt_tests(
    request: AdaptiveTestExecutionRequest,
    response: Response,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    result, used_live = TestService.execute_and_adapt_tests(db, current_user.id, request)
    response.headers["X-AI-Generated-By"] = "Google-Gemini-Live" if used_live else "Local-AST-Analyzer"
    return result

@router.post("/tests/apply-adapted", response_model=List[TestCaseResponse])
def apply_adapted_tests(
    request: ApplyAdaptedTestsRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    updated = TestService.apply_adapted_tests(db, current_user.id, request)
    return [TestCaseResponse.model_validate(t) for t in updated]


@router.post("/tests/generate", response_model=List[TestCaseResponse], status_code=status.HTTP_201_CREATED)
def generate_tests(
    request: TestGenerateRequest,
    response: Response,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tests, used_live = TestService.generate_tests_for_project(db, current_user.id, request)
    response.headers["X-AI-Generated-By"] = "Google-Gemini-Live" if used_live else "Demo-Fixture"
    return [TestCaseResponse.model_validate(t) for t in tests]

@router.get("/projects/{project_id}/tests", response_model=List[TestCaseResponse])
def get_project_tests(
    project_id: int,
    category: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    execution_status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tests = TestService.get_project_tests(
        db, project_id, current_user.id,
        category=category, priority=priority, execution_status=execution_status, search=search
    )
    return [TestCaseResponse.model_validate(t) for t in tests]

@router.put("/tests/{test_id}", response_model=TestCaseResponse)
def update_test(
    test_id: int,
    request: TestCaseUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    test = TestService.update_test(db, test_id, current_user.id, request)
    return TestCaseResponse.model_validate(test)

@router.delete("/tests/{test_id}")
def delete_test(
    test_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    TestService.delete_test(db, test_id, current_user.id)
    return {"message": "Test case deleted successfully."}

@router.get("/projects/{project_id}/tests/export")
def export_tests(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    csv_data = TestService.export_tests_csv(db, project_id, current_user.id)
    return PlainTextResponse(
        content=csv_data,
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f"attachment; filename=project_{project_id}_tests.csv"}
    )
