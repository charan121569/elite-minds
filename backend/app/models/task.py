from typing import List, Optional, Any, TYPE_CHECKING
from sqlalchemy import String, Text, JSON, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.project import Project
    from app.models.requirement import Requirement
    from app.models.test_case import TestCase

class DevelopmentTask(Base, TimestampMixin):
    __tablename__ = "development_tasks"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"), index=True, nullable=False)
    requirement_id: Mapped[Optional[int]] = mapped_column(ForeignKey("requirements.id", ondelete="SET NULL"), index=True, nullable=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)

    task_key: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(50), default="Backend", nullable=False)  # Architecture, Database, Backend, Frontend, Authentication, Integration, Testing, Deployment
    priority: Mapped[str] = mapped_column(String(50), default="Medium", nullable=False)   # Critical, High, Medium, Low
    complexity: Mapped[str] = mapped_column(String(50), default="Medium", nullable=False) # Small, Medium, Large
    status: Mapped[str] = mapped_column(String(50), default="To Do", nullable=False)      # To Do, In Progress, Completed
    
    dependencies: Mapped[Optional[Any]] = mapped_column(JSON, default=list, nullable=True)
    implementation_steps: Mapped[Optional[Any]] = mapped_column(JSON, default=list, nullable=True)
    expected_deliverables: Mapped[Optional[Any]] = mapped_column(JSON, default=list, nullable=True)
    acceptance_criteria: Mapped[Optional[Any]] = mapped_column(JSON, default=list, nullable=True)
    estimated_duration: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    order_index: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Relationships
    project: Mapped["Project"] = relationship("Project", back_populates="tasks")
    requirement: Mapped[Optional["Requirement"]] = relationship("Requirement", back_populates="tasks")
    test_cases: Mapped[List["TestCase"]] = relationship("TestCase", back_populates="task")
