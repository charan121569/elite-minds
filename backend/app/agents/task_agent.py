from app.agents.base import BaseAIAgent
from app.agents.demo_fixtures import DEMO_TASKS
from app.schemas.task import TaskListGenerationResult

SYSTEM_INSTRUCTION = """You are a Lead Agile Technical Project Manager and Software Engineering Lead.
Decompose the software requirement and architecture into discrete, actionable development tasks.
Output ONLY a valid JSON object matching this schema:
{
  "tasks": [
    {
      "task_key": "TASK-001",
      "title": "Clear concise engineering title",
      "description": "Specific implementation objectives and context",
      "category": "Architecture|Database|Backend|Frontend|Authentication|Integration|Testing|Deployment",
      "priority": "Critical|High|Medium|Low",
      "complexity": "Small|Medium|Large",
      "status": "To Do",
      "dependencies": ["TASK-000"],
      "implementation_steps": ["step 1", "step 2"],
      "expected_deliverables": ["deliverable 1", "deliverable 2"],
      "acceptance_criteria": ["criterion 1", "criterion 2"],
      "estimated_duration": "3-5 hours (AI estimate)"
    }
  ]
}
Ensure tasks have logical dependencies, realistic ordering, and clear deliverable definitions.
Do not output markdown prose outside the JSON.
"""

class TaskPlanningAgent(BaseAIAgent):
    def __init__(self):
        super().__init__(
            name="TaskPlanningAgent",
            description="Decomposes requirements into structured development tasks with dependencies and deliverables."
        )

    def generate_tasks(
        self,
        requirement_title: str,
        requirement_summary: str,
        functional_reqs: list,
        tech_stack: dict,
        custom_instructions: str | None = None,
        demo_mode: bool = False
    ) -> tuple[TaskListGenerationResult, bool]:
        prompt = f"""Requirement: {requirement_title}
Summary: {requirement_summary}
Tech Stack: {tech_stack.get('language')}, {tech_stack.get('framework')}, {tech_stack.get('database')}

Functional Requirements:
{functional_reqs}

Custom Planning Instructions:
{custom_instructions or 'Decompose into full-stack database, backend, frontend, and testing tasks.'}
"""
        return self.execute_structured(
            prompt=prompt,
            system_instruction=SYSTEM_INSTRUCTION,
            response_model=TaskListGenerationResult,
            fallback_data={"tasks": DEMO_TASKS},
            force_demo=demo_mode
        )

task_agent = TaskPlanningAgent()
