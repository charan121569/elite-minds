from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import select
from fastapi import HTTPException, status
from app.models.requirement import Requirement
from app.schemas.requirement import RequirementAnalyzeRequest
from app.services.project_service import ProjectService
from app.services.activity_service import ActivityService
from app.agents.requirement_agent import requirement_agent

class RequirementService:
    @staticmethod
    def analyze_and_create(
        db: Session,
        user_id: int,
        request: RequirementAnalyzeRequest
    ) -> tuple[Requirement, bool]:
        # Enforce project ownership
        project = ProjectService.get_project_by_id_and_owner(db, request.project_id, user_id)

        tech_stack = {
            "language": project.programming_language,
            "framework": project.framework,
            "database": project.database_preference
        }

        # Invoke Requirement Analysis Agent
        result, used_live = requirement_agent.analyze(
            title=request.title,
            raw_requirement=request.raw_requirement,
            tech_stack=tech_stack,
            constraints=request.constraints,
            acceptance_criteria=request.acceptance_criteria,
            demo_mode=request.demo_mode
        )

        try:
            req_model = Requirement(
                project_id=project.id,
                user_id=user_id,
                title=request.title.strip(),
                raw_requirement=request.raw_requirement.strip(),
                constraints=request.constraints,
                acceptance_criteria=request.acceptance_criteria,
                summary=result.summary,
                problem_statement=result.problem_statement,
                functional_requirements=[f.model_dump() for f in result.functional_requirements],
                non_functional_requirements=result.non_functional_requirements,
                user_roles=[r.model_dump() for r in result.user_roles],
                assumptions=result.assumptions,
                missing_information=result.missing_information,
                clarification_questions=result.clarification_questions,
                technical_constraints=result.technical_constraints,
                suggested_architecture=result.suggested_architecture,
                potential_risks=result.potential_risks,
                structured_acceptance_criteria=result.acceptance_criteria,
                suggested_phases=[p.model_dump() for p in result.suggested_phases]
            )
            db.add(req_model)
            db.commit()
            db.refresh(req_model)

            ActivityService.log(
                db=db,
                user_id=user_id,
                project_id=project.id,
                action_type="REQUIREMENT_ANALYZED",
                description=f"Analyzed requirement: {req_model.title}",
                entity_type="Requirement",
                entity_id=req_model.id
            )

            return req_model, used_live
        except Exception as exc:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to persist requirement analysis to MySQL: {str(exc)}"
            )

    @staticmethod
    def get_project_requirements(db: Session, project_id: int, user_id: int) -> List[Requirement]:
        ProjectService.get_project_by_id_and_owner(db, project_id, user_id)
        stmt = select(Requirement).where(Requirement.project_id == project_id).order_by(Requirement.created_at.desc())
        return list(db.scalars(stmt).all())

    @staticmethod
    def get_requirement_by_id(db: Session, requirement_id: int, user_id: int) -> Requirement:
        req = db.get(Requirement, requirement_id)
        if not req:
            raise HTTPException(status_code=404, detail="Requirement not found.")
        ProjectService.get_project_by_id_and_owner(db, req.project_id, user_id)
        return req
