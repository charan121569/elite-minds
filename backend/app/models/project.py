from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import String, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.requirement import Requirement
    from app.models.task import DevelopmentTask
    from app.models.guidance import ImplementationGuide
    from app.models.test_case import TestCase
    from app.models.code_review import CodeReview
    from app.models.activity import ActivityLog

class Project(Base, TimestampMixin):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    programming_language: Mapped[str] = mapped_column(String(100), default="TypeScript", nullable=False)
    framework: Mapped[str] = mapped_column(String(100), default="React", nullable=False)
    database_preference: Mapped[str] = mapped_column(String(100), default="MySQL", nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="active", nullable=False)

    # Relationships
    owner: Mapped["User"] = relationship("User", back_populates="projects")
    requirements: Mapped[List["Requirement"]] = relationship("Requirement", back_populates="project", cascade="all, delete-orphan")
    tasks: Mapped[List["DevelopmentTask"]] = relationship("DevelopmentTask", back_populates="project", cascade="all, delete-orphan")
    guidance_docs: Mapped[List["ImplementationGuide"]] = relationship("ImplementationGuide", back_populates="project", cascade="all, delete-orphan")
    test_cases: Mapped[List["TestCase"]] = relationship("TestCase", back_populates="project", cascade="all, delete-orphan")
    code_reviews: Mapped[List["CodeReview"]] = relationship("CodeReview", back_populates="project", cascade="all, delete-orphan")
    activities: Mapped[List["ActivityLog"]] = relationship("ActivityLog", back_populates="project", cascade="all, delete-orphan")
