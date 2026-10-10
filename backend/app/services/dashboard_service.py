from sqlalchemy.orm import Session
from sqlalchemy import select, func
from app.models.project import Project
from app.models.requirement import Requirement
from app.models.task import DevelopmentTask
from app.models.test_case import TestCase
from app.models.code_review import CodeReview, CodeReviewFinding
from app.models.activity import ActivityLog
from app.schemas.dashboard import DashboardStatsResponse, ActivityItemResponse
from app.schemas.project import ProjectResponse

class DashboardService:
    @staticmethod
    def get_user_dashboard_stats(db: Session, user_id: int) -> DashboardStatsResponse:
        # Real MySQL counts for the authenticated user
        total_projects = db.scalar(
            select(func.count(Project.id)).where(Project.user_id == user_id)
        ) or 0

        total_reqs = db.scalar(
            select(func.count(Requirement.id)).where(Requirement.user_id == user_id)
        ) or 0

        total_tasks = db.scalar(
            select(func.count(DevelopmentTask.id)).where(DevelopmentTask.user_id == user_id)
        ) or 0

        total_tests = db.scalar(
            select(func.count(TestCase.id)).where(TestCase.user_id == user_id)
        ) or 0

        total_reviews = db.scalar(
            select(func.count(CodeReview.id)).where(CodeReview.user_id == user_id)
        ) or 0

        # Task status distribution
        task_status_rows = db.execute(
            select(DevelopmentTask.status, func.count(DevelopmentTask.id))
            .where(DevelopmentTask.user_id == user_id)
            .group_by(DevelopmentTask.status)
        ).all()
        task_status_dist = {"To Do": 0, "In Progress": 0, "Completed": 0}
        for st, count in task_status_rows:
            task_status_dist[st] = count

        # Code review finding severity distribution
        # Join findings with reviews owned by user
        severity_rows = db.execute(
            select(CodeReviewFinding.severity, func.count(CodeReviewFinding.id))
            .join(CodeReview, CodeReviewFinding.review_id == CodeReview.id)
            .where(CodeReview.user_id == user_id)
            .group_by(CodeReviewFinding.severity)
        ).all()
        severity_dist = {
            "Critical": 0,
            "High": 0,
            "Medium": 0,
            "Low": 0,
            "Informational": 0
        }
        for sev, count in severity_rows:
            if sev in severity_dist:
                severity_dist[sev] = count
            else:
                severity_dist[sev] = count

        # Recent projects (top 5)
        recent_proj_rows = db.scalars(
            select(Project)
            .where(Project.user_id == user_id)
            .order_by(Project.updated_at.desc())
            .limit(5)
        ).all()
        recent_projects = [ProjectResponse.model_validate(p) for p in recent_proj_rows]

        # Recent activity (top 8)
        recent_act_rows = db.scalars(
            select(ActivityLog)
            .where(ActivityLog.user_id == user_id)
            .order_by(ActivityLog.created_at.desc())
            .limit(8)
        ).all()
        recent_activities = [ActivityItemResponse.model_validate(a) for a in recent_act_rows]

        return DashboardStatsResponse(
            total_projects=total_projects,
            total_requirements=total_reqs,
            total_tasks=total_tasks,
            total_test_cases=total_tests,
            total_code_reviews=total_reviews,
            task_status_distribution=task_status_dist,
            review_severity_distribution=severity_dist,
            recent_projects=recent_projects,
            recent_activities=recent_activities
        )

    @staticmethod
    def get_user_activities(db: Session, user_id: int, limit: int = 50) -> list[ActivityItemResponse]:
        rows = db.scalars(
            select(ActivityLog)
            .where(ActivityLog.user_id == user_id)
            .order_by(ActivityLog.created_at.desc())
            .limit(limit)
        ).all()
        return [ActivityItemResponse.model_validate(a) for a in rows]
