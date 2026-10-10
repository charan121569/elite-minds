from typing import Optional, Any, TYPE_CHECKING
from sqlalchemy import String, Text, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.project import Project
    from app.models.task import DevelopmentTask

class TestCase(Base, TimestampMixin):
    __tablename__ = "test_cases"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"), index=True, nullable=False)
    requirement_id: Mapped[Optional[int]] = mapped_column(ForeignKey("requirements.id", ondelete="SET NULL"), nullable=True)
    task_id: Mapped[Optional[int]] = mapped_column(ForeignKey("development_tasks.id", ondelete="SET NULL"), nullable=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)

    test_key: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    related_requirement: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    preconditions: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    test_steps: Mapped[Optional[Any]] = mapped_column(JSON, default=list, nullable=True)
    input_data: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    expected_result: Mapped[str] = mapped_column(Text, nullable=False)
    priority: Mapped[str] = mapped_column(String(50), default="Medium", nullable=False) # Critical, High, Medium, Low
    category: Mapped[str] = mapped_column(String(50), default="Positive", nullable=False) # Positive, Negative, Boundary, Input Validation, Authentication, Security, etc.
    automation_approach: Mapped[str] = mapped_column(String(50), default="API", nullable=False) # Unit, Integration, API, E2E, Manual
    execution_status: Mapped[str] = mapped_column(String(50), default="Not Run", nullable=False) # Not Run, Passed, Failed
    execution_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    test_code_snippet: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    project: Mapped["Project"] = relationship("Project", back_populates="test_cases")
    task: Mapped[Optional["DevelopmentTask"]] = relationship("DevelopmentTask", back_populates="test_cases")
