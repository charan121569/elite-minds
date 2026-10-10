from typing import List, Optional, Any, TYPE_CHECKING
from sqlalchemy import String, Text, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.project import Project

class CodeReview(Base, TimestampMixin):
    __tablename__ = "code_reviews"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"), index=True, nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)

    file_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    language: Mapped[str] = mapped_column(String(100), default="Python", nullable=False)
    framework: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    context_description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    focus_area: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    submitted_code: Mapped[str] = mapped_column(Text, nullable=False)
    
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    overall_assessment: Mapped[str] = mapped_column(String(100), default="Needs Work", nullable=False)
    positive_observations: Mapped[Optional[Any]] = mapped_column(JSON, default=list, nullable=True)
    recommended_priorities: Mapped[Optional[Any]] = mapped_column(JSON, default=list, nullable=True)
    suggested_tests: Mapped[Optional[Any]] = mapped_column(JSON, default=list, nullable=True)

    # Relationships
    project: Mapped["Project"] = relationship("Project", back_populates="code_reviews")
    findings: Mapped[List["CodeReviewFinding"]] = relationship("CodeReviewFinding", back_populates="review", cascade="all, delete-orphan")

class CodeReviewFinding(Base, TimestampMixin):
    __tablename__ = "code_review_findings"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    review_id: Mapped[int] = mapped_column(ForeignKey("code_reviews.id", ondelete="CASCADE"), index=True, nullable=False)

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    severity: Mapped[str] = mapped_column(String(50), default="Medium", nullable=False) # Critical, High, Medium, Low, Informational
    category: Mapped[str] = mapped_column(String(100), default="Logic Bug", nullable=False) # Security, Logic Bug, Input Validation, Performance, Exception Handling, Readability, Architecture
    description: Mapped[str] = mapped_column(Text, nullable=False)
    code_location: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    impact_explanation: Mapped[str] = mapped_column(Text, nullable=False)
    recommended_fix: Mapped[str] = mapped_column(Text, nullable=False)
    suggested_code: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    review: Mapped["CodeReview"] = relationship("CodeReview", back_populates="findings")
