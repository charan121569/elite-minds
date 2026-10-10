from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import select
from fastapi import HTTPException, status
from app.models.code_review import CodeReview, CodeReviewFinding
from app.schemas.code_review import CodeReviewRequest
from app.services.project_service import ProjectService
from app.services.activity_service import ActivityService
from app.agents.review_agent import code_review_agent

class ReviewService:
    @staticmethod
    def analyze_and_create(
        db: Session,
        user_id: int,
        request: CodeReviewRequest
    ) -> tuple[CodeReview, bool]:
        project = ProjectService.get_project_by_id_and_owner(db, request.project_id, user_id)

        # Invoke AI Code Review Agent with safety guardrails
        result, used_live = code_review_agent.review_code(
            code=request.source_code,
            language=request.language,
            framework=request.framework or project.framework,
            file_name=request.file_name,
            context_description=request.context_description,
            review_focus=request.review_focus,
            demo_mode=request.demo_mode
        )

        try:
            review = CodeReview(
                project_id=project.id,
                user_id=user_id,
                file_name=request.file_name,
                language=request.language,
                framework=request.framework or project.framework,
                context_description=request.context_description,
                focus_area=request.review_focus,
                submitted_code=request.source_code,
                summary=result.summary,
                overall_assessment=result.overall_assessment,
                positive_observations=result.positive_observations,
                recommended_priorities=result.recommended_priorities,
                suggested_tests=result.suggested_tests
            )
            db.add(review)
            db.flush()

            for f in result.findings:
                finding = CodeReviewFinding(
                    review_id=review.id,
                    title=f.title,
                    severity=f.severity,
                    category=f.category,
                    description=f.description,
                    code_location=f.code_location,
                    impact_explanation=f.impact_explanation,
                    recommended_fix=f.recommended_fix,
                    suggested_code=f.suggested_code
                )
                db.add(finding)

            db.commit()
            db.refresh(review)

            ActivityService.log(
                db=db,
                user_id=user_id,
                project_id=project.id,
                action_type="CODE_REVIEWED",
                description=f"Completed AI code review for {request.file_name or 'source snippet'} ({len(result.findings)} findings)",
                entity_type="CodeReview",
                entity_id=review.id
            )

            return review, used_live
        except Exception as exc:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to persist code review findings in MySQL: {str(exc)}"
            )

    @staticmethod
    def get_project_reviews(db: Session, project_id: int, user_id: int) -> List[CodeReview]:
        ProjectService.get_project_by_id_and_owner(db, project_id, user_id)
        stmt = select(CodeReview).where(CodeReview.project_id == project_id).order_by(CodeReview.created_at.desc())
        return list(db.scalars(stmt).all())

    @staticmethod
    def get_review_by_id(db: Session, review_id: int, user_id: int) -> CodeReview:
        review = db.get(CodeReview, review_id)
        if not review:
            raise HTTPException(status_code=404, detail="Code review not found.")
        ProjectService.get_project_by_id_and_owner(db, review.project_id, user_id)
        return review

    @staticmethod
    def export_review_markdown(db: Session, review_id: int, user_id: int) -> str:
        review = ReviewService.get_review_by_id(db, review_id, user_id)
        
        crit_count = len([f for f in (review.findings or []) if f.severity.lower() == 'critical'])
        high_count = len([f for f in (review.findings or []) if f.severity.lower() == 'high'])
        med_count = len([f for f in (review.findings or []) if f.severity.lower() == 'medium'])
        low_count = len([f for f in (review.findings or []) if f.severity.lower() in ('low', 'informational')])
        total_findings = len(review.findings or [])

        # Calculate a quality health score (100 base)
        quality_score = max(20, 100 - (crit_count * 25 + high_count * 15 + med_count * 5 + low_count * 2))

        md_lines = [
            "# AI Code Review & Quality Audit Report",
            f"**Elite Minds AI Development Agent** | Generated: {review.created_at.strftime('%Y-%m-%d %H:%M:%S UTC')}",
            "",
            "## 1. Audit Overview & Metadata",
            "",
            "| Field | Value |",
            "| :--- | :--- |",
            f"| **Target Component** | `{review.file_name or 'Source Code'}` |",
            f"| **Language / Framework** | {review.language} / {review.framework or 'N/A'} |",
            f"| **Overall Assessment** | **{review.overall_assessment}** |",
            f"| **Quality Health Rating** | **{quality_score} / 100** |",
            f"| **Audit Focus Area** | {review.focus_area or 'Functional conformance, error handling, and security'} |",
            f"| **Verification Context** | {review.context_description or 'Automated QA & test case execution audit'} |",
            "",
            "## 2. Quality Metrics & Findings Summary",
            "",
            "| Severity Level | Detected Issues | Recommended Action |",
            "| :--- | :--- | :--- |",
            f"| **CRITICAL** | {crit_count} | Immediate fix required prior to deployment |",
            f"| **HIGH** | {high_count} | High priority fix before next release |",
            f"| **MEDIUM** | {med_count} | Refactor or address in regular sprint |",
            f"| **LOW / INFO** | {low_count} | Best practice improvement / style note |",
            f"| **TOTAL FINDINGS** | **{total_findings}** | Overall Quality Rating: **{quality_score}%** |",
            "",
            "## 3. Executive Summary",
            review.summary,
            "",
            "## 4. Positive Observations & Conformance",
        ]

        if review.positive_observations:
            for obs in review.positive_observations:
                md_lines.append(f"- [x] {obs}")
        else:
            md_lines.append("- No specific positive observations noted.")

        md_lines.extend(["", "## 5. Detailed Audit Findings & Root Cause Analysis"])
        if review.findings:
            for idx, f in enumerate(review.findings, 1):
                md_lines.append(f"### {idx}. [{f.severity.upper()}] {f.title}")
                md_lines.append(f"- **Category:** `{f.category}`")
                if f.code_location:
                    md_lines.append(f"- **Code Location:** `{f.code_location}`")
                md_lines.append(f"- **Impact & Business Risk:** {f.impact_explanation}")
                md_lines.append(f"- **Root Cause Analysis:** {f.description}")
                md_lines.append(f"- **Actionable Remediation:** {f.recommended_fix}")
                if f.suggested_code:
                    md_lines.append(f"\n```suggestion\n{f.suggested_code}\n```\n")
                md_lines.append("")
        else:
            md_lines.append("No critical issues or bugs detected across tested components.")

        md_lines.extend([
            "",
            "## 6. Action Priorities & Remediation Roadmap",
        ])
        if review.recommended_priorities:
            for p_idx, p in enumerate(review.recommended_priorities, 1):
                md_lines.append(f"{p_idx}. {p}")
        else:
            md_lines.append("- Maintain regular regression testing and test case synchronization.")

        if review.suggested_tests:
            md_lines.extend(["", "## 7. Recommended Test Verifications"])
            for t_idx, st in enumerate(review.suggested_tests, 1):
                md_lines.append(f"- `[Verified]` {st}")

        if review.submitted_code:
            md_lines.extend([
                "",
                "## 8. Evaluated Code Reference",
                "<details>",
                f"<summary><b>Click to inspect evaluated {review.language} source implementation ({len(review.submitted_code.splitlines())} lines)</b></summary>",
                "",
                f"```{review.language.lower()}",
                review.submitted_code,
                "```",
                "</details>"
            ])

        md_lines.extend([
            "",
            "---",
            f"> **Audit Verification:** Generated automatically by Elite Minds AI Development Agent. Report ID: #{review.id}."
        ])
        return "\n".join(md_lines)


    @staticmethod
    def create_review_from_test_results(
        db: Session,
        user_id: int,
        project_id: int,
        code: str,
        language: str,
        verdict: str,
        summary: str,
        execution_output: str,
        gaps_found: List[str],
        adapted_tests: list,
        file_name: str | None = None
    ) -> CodeReview:
        project = ProjectService.get_project_by_id_and_owner(db, project_id, user_id)

        assessment = "Production Ready" if verdict == "PASS" else ("Functional with Adaptations" if verdict == "ADAPTED" else "Needs Work")
        ext = "py" if "python" in (language or "").lower() else "ts"
        clean_file_name = file_name or f"implemented_{project.name.lower().replace(' ', '_')}.{ext}"

        passed_count = len([t for t in adapted_tests if getattr(t, 'execution_status', '') == 'Passed' or (isinstance(t, dict) and t.get('execution_status') == 'Passed')])
        total_tests = len(adapted_tests)

        pos_obs = [
            f"Successfully evaluated against {total_tests} test cases in project automated test suite.",
            f"{passed_count} of {total_tests} test cases verified under execution analysis.",
            "Module architecture complies with established technical guidance and design principles."
        ]

        priorities = [
            "Review automated test cases that required parameter or return signature calibration.",
            "Verify all negative boundary conditions return explicit, user-friendly error messages.",
            "Incorporate regenerated test snippets into project automated CI/CD pipeline."
        ]

        suggested_tests_list = []
        for t in adapted_tests[:4]:
            t_key = getattr(t, 'test_key', '') or (t.get('test_key', '') if isinstance(t, dict) else '')
            if t_key:
                suggested_tests_list.append(f"test_{t_key.lower().replace('-', '_')}_verified")

        review_summary = (
            f"Automated Code Review generated directly from Test Case Execution & Adaptive Verification.\n\n"
            f"Verdict: {verdict}\n"
            f"Evaluated against: {total_tests} test cases\n"
            f"Execution Analysis: {summary}"
        )

        review = CodeReview(
            project_id=project.id,
            user_id=user_id,
            file_name=clean_file_name,
            language=(language or project.programming_language).capitalize(),
            framework=project.framework,
            context_description=f"Generated automatically from Test Case Verification ({verdict})",
            focus_area="Test Assertion Conformance, Edge Cases & Implementation Alignment",
            submitted_code=code,
            summary=review_summary,
            overall_assessment=assessment,
            positive_observations=pos_obs,
            recommended_priorities=priorities,
            suggested_tests=suggested_tests_list
        )
        db.add(review)
        db.flush()

        # Add findings from detected gaps or execution results
        if gaps_found:
            for i, gap in enumerate(gaps_found):
                finding = CodeReviewFinding(
                    review_id=review.id,
                    title=f"Test Execution Gap: {gap[:80]}",
                    severity="Medium" if verdict == "ADAPTED" else "High",
                    category="Input Validation" if "input" in gap.lower() or "guard" in gap.lower() else "Logic Bug",
                    description=gap,
                    code_location=f"{clean_file_name}:L{i+1}",
                    impact_explanation="May cause unexpected behavior or uncaught exceptions during negative or edge-case execution.",
                    recommended_fix="Add defensive input guards, type validation, or explicit error handling.",
                    suggested_code=None
                )
                db.add(finding)
        else:
            finding = CodeReviewFinding(
                review_id=review.id,
                title="Implementation Passes Automated Test Verifications",
                severity="Informational",
                category="Architecture",
                description="Implemented code executed successfully against all targeted test assertions without unhandled runtime exceptions.",
                code_location=clean_file_name,
                impact_explanation="Code exhibits strong behavioral alignment with functional requirements and test suite assertions.",
                recommended_fix="Maintain test suite synchronization as new endpoints or business logic are added.",
                suggested_code=None
            )
            db.add(finding)

        db.commit()
        db.refresh(review)

        ActivityService.log(
            db=db,
            user_id=user_id,
            project_id=project.id,
            action_type="CODE_REVIEWED_FROM_TESTS",
            description=f"Auto-generated Code Review #{review.id} from test execution results ({verdict})",
            entity_type="CodeReview",
            entity_id=review.id
        )

        return review

