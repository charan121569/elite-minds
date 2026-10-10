from typing import Any, Optional
from app.agents.requirement_agent import requirement_agent
from app.agents.task_agent import task_agent
from app.agents.guidance_agent import guidance_agent
from app.agents.test_agent import test_agent
from app.agents.review_agent import code_review_agent
from app.core.logging import logger

class WorkflowCoordinator:
    """
    Coordinates AI agent services across the software development lifecycle,
    transferring structured artifacts across requirements, task breakdown, guidance,
    test creation, and code review without redundant inputs.
    """

    def __init__(self):
        self.requirement_agent = requirement_agent
        self.task_agent = task_agent
        self.guidance_agent = guidance_agent
        self.test_agent = test_agent
        self.review_agent = code_review_agent

    def get_agent_status(self) -> dict[str, Any]:
        """Provides operational status of all registered agents."""
        return {
            "requirement_agent": {"name": self.requirement_agent.name, "active": True},
            "task_agent": {"name": self.task_agent.name, "active": True},
            "guidance_agent": {"name": self.guidance_agent.name, "active": True},
            "test_agent": {"name": self.test_agent.name, "active": True},
            "review_agent": {"name": self.review_agent.name, "active": True},
        }

workflow_coordinator = WorkflowCoordinator()
