from typing import List
from fastapi import APIRouter, Depends, Response, status
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.code_review import CodeReviewRequest, CodeReviewResponse
from app.services.review_service import ReviewService

router = APIRouter(tags=["Code Review"])

@router.post("/reviews/analyze", response_model=CodeReviewResponse, status_code=status.HTTP_201_CREATED)
def analyze_code(
    request: CodeReviewRequest,
    response: Response,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    review, used_live = ReviewService.analyze_and_create(db, current_user.id, request)
    response.headers["X-AI-Generated-By"] = "Google-Gemini-Live" if used_live else "Demo-Fixture"
    return CodeReviewResponse.model_validate(review)

@router.get("/projects/{project_id}/reviews", response_model=List[CodeReviewResponse])
def get_project_reviews(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    reviews = ReviewService.get_project_reviews(db, project_id, current_user.id)
    return [CodeReviewResponse.model_validate(r) for r in reviews]

@router.get("/reviews/{review_id}", response_model=CodeReviewResponse)
def get_review(
    review_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    review = ReviewService.get_review_by_id(db, review_id, current_user.id)
    return CodeReviewResponse.model_validate(review)

@router.get("/reviews/{review_id}/export")
def export_review(
    review_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    md_content = ReviewService.export_review_markdown(db, review_id, current_user.id)
    return PlainTextResponse(
        content=md_content,
        media_type="text/markdown",
        headers={"Content-Disposition": f"attachment; filename=code_review_{review_id}.md"}
    )
