from typing import Optional, Any, TYPE_CHECKING
from sqlalchemy import String, Text, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.project import Project

class ImplementationGuide(Base, TimestampMixin):
    __tablename__ = "implementation_guides"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"), index=True, nullable=False)
    task_id: Mapped[Optional[int]] = mapped_column(ForeignKey("development_tasks.id", ondelete="SET NULL"), nullable=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    architecture_overview: Mapped[str] = mapped_column(Text, nullable=False)
    directory_structure: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    dependencies: Mapped[Optional[Any]] = mapped_column(JSON, default=list, nullable=True)
    database_schema: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    api_specifications: Mapped[Optional[Any]] = mapped_column(JSON, default=list, nullable=True)
    data_models: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    implementation_sequence: Mapped[Optional[Any]] = mapped_column(JSON, default=list, nullable=True)
    code_examples: Mapped[Optional[Any]] = mapped_column(JSON, default=list, nullable=True)
    integration_steps: Mapped[Optional[Any]] = mapped_column(JSON, default=list, nullable=True)
    validation_recommendations: Mapped[Optional[Any]] = mapped_column(JSON, default=list, nullable=True)
    error_handling: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    security_recommendations: Mapped[Optional[Any]] = mapped_column(JSON, default=list, nullable=True)
    performance_considerations: Mapped[Optional[Any]] = mapped_column(JSON, default=list, nullable=True)
    deployment_considerations: Mapped[Optional[Any]] = mapped_column(JSON, default=list, nullable=True)

    # Relationship
    project: Mapped["Project"] = relationship("Project", back_populates="guidance_docs")
