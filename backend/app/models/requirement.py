from typing import List, Optional, Any, TYPE_CHECKING
from sqlalchemy import String, Text, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.project import Project
    from app.models.task import DevelopmentTask

class Requirement(Base, TimestampMixin):
    __tablename__ = "requirements"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"), index=True, nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    raw_requirement: Mapped[str] = mapped_column(Text, nullable=False)
    constraints: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    acceptance_criteria: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Analyzed AI Output Fields
    summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    problem_statement: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    functional_requirements: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    non_functional_requirements: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    user_roles: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    permissions: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    assumptions: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    missing_information: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    clarification_questions: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    technical_constraints: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    suggested_architecture: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    potential_risks: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    structured_acceptance_criteria: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    suggested_phases: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)

    # Relationships
    project: Mapped["Project"] = relationship("Project", back_populates="requirements")
    tasks: Mapped[List["DevelopmentTask"]] = relationship("DevelopmentTask", back_populates="requirement")
