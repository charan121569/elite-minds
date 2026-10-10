import csv
import io
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select
from fastapi import HTTPException, status
from app.models.test_case import TestCase
from app.models.requirement import Requirement
from app.models.task import DevelopmentTask
from app.models.guidance import ImplementationGuide
from app.schemas.test_case import (
    TestGenerateRequest,
    TestCaseCreate,
    TestCaseUpdate,
    AdaptiveTestExecutionRequest,
    AdaptiveTestExecutionResponse,
    AdaptedTestCaseItem,
    ApplyAdaptedTestsRequest,
)
from app.services.project_service import ProjectService
from app.services.activity_service import ActivityService
from app.agents.test_agent import test_agent


class TestService:
    @staticmethod
    def generate_tests_for_project(
        db: Session,
        user_id: int,
        request: TestGenerateRequest
    ) -> tuple[List[TestCase], bool]:
        project = ProjectService.get_project_by_id_and_owner(db, request.project_id, user_id)

        req: Optional[Requirement] = None
        if request.requirement_id:
            req = db.get(Requirement, request.requirement_id)
        else:
            stmt = select(Requirement).where(Requirement.project_id == project.id).order_by(Requirement.created_at.desc())
            req = db.scalars(stmt).first()

        task_context: Optional[str] = None
        if request.task_id:
            t = db.get(DevelopmentTask, request.task_id)
            if t:
                task_context = f"{t.task_key}: {t.title}"

        acceptance_criteria = req.structured_acceptance_criteria if req and req.structured_acceptance_criteria else ["Standard input validation and access controls"]
        req_title = req.title if req else project.name

        tech_stack = {
            "language": project.programming_language,
            "framework": project.framework,
            "database": project.database_preference
        }

        # Invoke Test Generation Agent
        result, used_live = test_agent.generate_tests(
            project_name=project.name,
            tech_stack=tech_stack,
            requirement_title=req_title,
            acceptance_criteria=acceptance_criteria,
            task_context=task_context,
            focus_category=request.focus_category,
            demo_mode=request.demo_mode
        )

        try:
            created_tests: List[TestCase] = []
            for item in result.test_cases:
                tc = TestCase(
                    project_id=project.id,
                    requirement_id=req.id if req else None,
                    task_id=request.task_id,
                    user_id=user_id,
                    test_key=item.test_key,
                    title=item.title,
                    description=item.description,
                    related_requirement=item.related_requirement,
                    preconditions=item.preconditions,
                    test_steps=item.test_steps,
                    input_data=item.input_data,
                    expected_result=item.expected_result,
                    priority=item.priority,
                    category=item.category,
                    automation_approach=item.automation_approach,
                    execution_status="Not Run",
                    test_code_snippet=item.test_code_snippet
                )
                db.add(tc)
                created_tests.append(tc)

            db.commit()
            for t in created_tests:
                db.refresh(t)

            ActivityService.log(
                db=db,
                user_id=user_id,
                project_id=project.id,
                action_type="TESTS_GENERATED",
                description=f"Generated {len(created_tests)} test cases for {project.name}",
                entity_type="TestCase",
                entity_id=created_tests[0].id if created_tests else None
            )

            return created_tests, used_live
        except Exception as exc:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to persist test cases in MySQL: {str(exc)}"
            )

    @staticmethod
    def get_project_tests(
        db: Session,
        project_id: int,
        user_id: int,
        category: Optional[str] = None,
        priority: Optional[str] = None,
        execution_status: Optional[str] = None,
        search: Optional[str] = None
    ) -> List[TestCase]:
        ProjectService.get_project_by_id_and_owner(db, project_id, user_id)
        stmt = select(TestCase).where(TestCase.project_id == project_id)

        if category:
            stmt = stmt.where(TestCase.category == category)
        if priority:
            stmt = stmt.where(TestCase.priority == priority)
        if execution_status:
            stmt = stmt.where(TestCase.execution_status == execution_status)
        if search:
            s = f"%{search.strip()}%"
            stmt = stmt.where(TestCase.title.ilike(s) | TestCase.description.ilike(s) | TestCase.test_key.ilike(s))

        stmt = stmt.order_by(TestCase.created_at.desc())
        return list(db.scalars(stmt).all())

    @staticmethod
    def update_test(db: Session, test_id: int, user_id: int, request: TestCaseUpdate) -> TestCase:
        test = db.get(TestCase, test_id)
        if not test:
            raise HTTPException(status_code=404, detail="Test case not found.")
        ProjectService.get_project_by_id_and_owner(db, test.project_id, user_id)

        if request.title is not None:
            test.title = request.title
        if request.description is not None:
            test.description = request.description
        if request.preconditions is not None:
            test.preconditions = request.preconditions
        if request.test_steps is not None:
            test.test_steps = request.test_steps
        if request.input_data is not None:
            test.input_data = request.input_data
        if request.expected_result is not None:
            test.expected_result = request.expected_result
        if request.priority is not None:
            test.priority = request.priority
        if request.category is not None:
            test.category = request.category
        if request.automation_approach is not None:
            test.automation_approach = request.automation_approach
        if request.execution_status is not None:
            test.execution_status = request.execution_status
        if request.execution_notes is not None:
            test.execution_notes = request.execution_notes
        if request.test_code_snippet is not None:
            test.test_code_snippet = request.test_code_snippet

        db.commit()
        db.refresh(test)

        ActivityService.log(
            db=db,
            user_id=user_id,
            project_id=test.project_id,
            action_type="TEST_STATUS_UPDATED",
            description=f"Updated test {test.test_key} execution status to '{test.execution_status}'",
            entity_type="TestCase",
            entity_id=test.id
        )

        return test

    @staticmethod
    def delete_test(db: Session, test_id: int, user_id: int) -> bool:
        test = db.get(TestCase, test_id)
        if not test:
            raise HTTPException(status_code=404, detail="Test case not found.")
        ProjectService.get_project_by_id_and_owner(db, test.project_id, user_id)
        db.delete(test)
        db.commit()
        return True

    @staticmethod
    def export_tests_csv(db: Session, project_id: int, user_id: int) -> str:
        project = ProjectService.get_project_by_id_and_owner(db, project_id, user_id)
        tests = TestService.get_project_tests(db, project_id, user_id)
        output = io.StringIO()
        # Prepend UTF-8 BOM so Excel opens special characters and formatting cleanly
        output.write('\ufeff')
        writer = csv.writer(output, quoting=csv.QUOTE_MINIMAL)
        writer.writerow([
            "Test Case ID",
            "Test Title / Scenario",
            "Description & Objective",
            "Target Requirement",
            "Category / Test Type",
            "Priority",
            "Execution Status",
            "Preconditions",
            "Step-by-Step Test Instructions",
            "Test Input Data / Parameters",
            "Expected Result",
            "Actual Result / Execution Notes",
            "Automation Approach",
            "Date Created"
        ])
        for t in tests:
            steps_formatted = ""
            if isinstance(t.test_steps, list):
                steps_formatted = "\n".join([f"{idx+1}. {step}" for idx, step in enumerate(t.test_steps)])
            elif t.test_steps:
                steps_formatted = str(t.test_steps)

            input_data_formatted = ""
            if isinstance(t.input_data, dict):
                input_data_formatted = "; ".join([f"{k}: {v}" for k, v in t.input_data.items()])
            elif t.input_data:
                input_data_formatted = str(t.input_data).strip()

            writer.writerow([
                t.test_key,
                t.title,
                t.description or "",
                t.related_requirement or "",
                t.category,
                t.priority,
                t.execution_status,
                t.preconditions or "",
                steps_formatted,
                input_data_formatted,
                t.expected_result,
                t.execution_notes or "",
                t.automation_approach,
                t.created_at.strftime("%Y-%m-%d %H:%M:%S") if t.created_at else ""
            ])
        return output.getvalue()


    @staticmethod
    def execute_and_adapt_tests(
        db: Session,
        user_id: int,
        request: AdaptiveTestExecutionRequest
    ) -> tuple[AdaptiveTestExecutionResponse, bool]:
        project = ProjectService.get_project_by_id_and_owner(db, request.project_id, user_id)

        # Retrieve target tests to adapt
        target_tests: List[TestCase] = []
        if request.test_case_id:
            tc = db.get(TestCase, request.test_case_id)
            if not tc or tc.project_id != project.id:
                raise HTTPException(status_code=404, detail="Specified test case not found in project.")
            target_tests = [tc]
        else:
            target_tests = TestService.get_project_tests(db, project.id, user_id)

        # If project has no test cases yet, generate baseline test cases first
        if not target_tests:
            gen_res, _ = TestService.generate_tests_for_project(
                db, user_id, TestGenerateRequest(project_id=project.id, demo_mode=request.demo_mode)
            )
            target_tests = gen_res

        # Retrieve guide context if provided
        guide_context: Optional[str] = None
        if request.guide_id:
            g = db.get(ImplementationGuide, request.guide_id)
            if g and g.project_id == project.id:
                guide_context = f"Guide Title: {g.title}\nArchitecture: {g.architecture_overview}\nAPI Specs: {g.api_specifications}"

        # Prepare test cases dict representation
        existing_tests_payload = [
            {
                "id": t.id,
                "test_key": t.test_key,
                "title": t.title,
                "category": t.category,
                "priority": t.priority,
                "test_steps": t.test_steps or [],
                "input_data": t.input_data,
                "expected_result": t.expected_result,
                "execution_status": t.execution_status
            }
            for t in target_tests
        ]

        tech_stack = {
            "language": project.programming_language,
            "framework": project.framework,
            "database": project.database_preference
        }

        # Invoke adaptive test generation agent
        result, used_live = test_agent.adapt_tests_from_code(
            project_name=project.name,
            tech_stack=tech_stack,
            implemented_code=request.implemented_code,
            language=request.language or project.programming_language or "python",
            existing_tests=existing_tests_payload,
            guide_context=guide_context,
            demo_mode=request.demo_mode
        )

        # If auto_apply requested, persist modified test cases directly to MySQL
        if request.auto_apply and result.adapted_tests:
            for item in result.adapted_tests:
                tc = db.get(TestCase, item.test_id)
                if tc and tc.project_id == project.id:
                    tc.expected_result = item.new_expected_result
                    tc.test_steps = item.new_test_steps
                    if item.new_input_data:
                        tc.input_data = item.new_input_data
                    if item.updated_test_code_snippet:
                        tc.test_code_snippet = item.updated_test_code_snippet
                    tc.execution_status = item.execution_status
                    tc.execution_notes = item.execution_notes
            db.commit()
            result.applied_to_db = True

            ActivityService.log(
                db=db,
                user_id=user_id,
                project_id=project.id,
                action_type="TESTS_ADAPTED_FROM_CODE",
                description=f"Auto-adapted {len(result.adapted_tests)} test cases based on user implemented code ({result.verdict})",
                entity_type="TestCase",
                entity_id=result.adapted_tests[0].test_id if result.adapted_tests else None
            )

        # Automatically generate and persist Code Review directly in MySQL based on test case results
        try:
            from app.services.review_service import ReviewService
            review = ReviewService.create_review_from_test_results(
                db=db,
                user_id=user_id,
                project_id=project.id,
                code=request.implemented_code,
                language=request.language or project.programming_language or "python",
                verdict=result.verdict,
                summary=result.summary,
                execution_output=result.execution_output,
                gaps_found=result.gaps_found,
                adapted_tests=result.adapted_tests,
                file_name=f"implemented_{project.name.lower().replace(' ', '_')}.{'py' if 'python' in (request.language or '').lower() else 'ts'}"
            )
            result.generated_review_id = review.id
            result.generated_review_summary = f"Code Review #{review.id} generated with {len(review.findings)} finding(s) ({review.overall_assessment})."
        except Exception as rev_err:
            from app.core.logging import logger
            logger.error(f"Failed to auto-generate code review from test results: {rev_err}")

        return result, used_live


    @staticmethod
    def apply_adapted_tests(
        db: Session,
        user_id: int,
        request: ApplyAdaptedTestsRequest
    ) -> List[TestCase]:
        project = ProjectService.get_project_by_id_and_owner(db, request.project_id, user_id)
        updated_records: List[TestCase] = []

        for item in request.adapted_tests:
            tc = db.get(TestCase, item.test_id)
            if tc and tc.project_id == project.id:
                tc.expected_result = item.new_expected_result
                tc.test_steps = item.new_test_steps
                if item.new_input_data:
                    tc.input_data = item.new_input_data
                if item.updated_test_code_snippet:
                    tc.test_code_snippet = item.updated_test_code_snippet
                tc.execution_status = item.execution_status
                tc.execution_notes = item.execution_notes
                updated_records.append(tc)

        db.commit()
        for r in updated_records:
            db.refresh(r)

        if updated_records:
            ActivityService.log(
                db=db,
                user_id=user_id,
                project_id=project.id,
                action_type="TESTS_ADAPTED_APPLIED",
                description=f"Applied adaptive modifications to {len(updated_records)} test cases from implemented code",
                entity_type="TestCase",
                entity_id=updated_records[0].id
            )

        return updated_records

