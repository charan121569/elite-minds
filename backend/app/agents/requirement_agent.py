from app.agents.base import BaseAIAgent
from app.agents.demo_fixtures import DEMO_REQUIREMENT_ANALYSIS
from app.schemas.requirement import RequirementAnalysisResult

SYSTEM_INSTRUCTION = """You are an expert Senior Systems Analyst and Software Architect.
Analyze the provided software requirement deeply. You must output ONLY a valid JSON object matching this schema:
{
  "summary": "Concise executive summary of what is being built",
  "problem_statement": "The core business problem or technical challenge being solved",
  "functional_requirements": [
    {"id": "FR-1", "feature": "Feature Title", "description": "Detailed explanation", "priority": "Critical|High|Medium|Low"}
  ],
  "non_functional_requirements": ["Performance, security, scalability, reliability requirements"],
  "user_roles": [
    {"role": "Role Name", "description": "Role scope", "permissions": ["perm1", "perm2"]}
  ],
  "assumptions": ["Key operational or domain assumptions"],
  "missing_information": ["Gaps or ambiguities that need specification"],
  "clarification_questions": ["Questions for product managers or stakeholders"],
  "technical_constraints": ["Database, API, framework, or architectural constraints"],
  "suggested_architecture": ["Recommended system patterns, layers, or integrations"],
  "potential_risks": ["Security, data integrity, or scalability risks"],
  "acceptance_criteria": ["Testable verification conditions"],
  "suggested_phases": [
    {"phase_number": 1, "title": "Phase title", "description": "Phase goals", "estimated_duration": "2 weeks (AI estimate)", "key_deliverables": ["item1", "item2"]}
  ]
}
Do not include any prose outside the JSON object.
"""

class RequirementAnalysisAgent(BaseAIAgent):
    def __init__(self):
        super().__init__(
            name="RequirementAnalysisAgent",
            description="Transforms natural language software specifications into detailed, structured architectural requirements."
        )

    def analyze(
        self,
        title: str,
        raw_requirement: str,
        tech_stack: dict,
        constraints: str | None = None,
        acceptance_criteria: str | None = None,
        demo_mode: bool = False
    ) -> tuple[RequirementAnalysisResult, bool]:
        prompt = f"""Requirement Title: {title}
Tech Stack Context:
- Language: {tech_stack.get('language', 'TypeScript')}
- Framework: {tech_stack.get('framework', 'React')}
- Database: {tech_stack.get('database', 'MySQL')}

Requirement Description:
{raw_requirement}

Additional Constraints:
{constraints or 'None specified'}

Initial Acceptance Criteria:
{acceptance_criteria or 'None specified'}
"""
        return self.execute_structured(
            prompt=prompt,
            system_instruction=SYSTEM_INSTRUCTION,
            response_model=RequirementAnalysisResult,
            fallback_data=DEMO_REQUIREMENT_ANALYSIS,
            force_demo=demo_mode
        )

requirement_agent = RequirementAnalysisAgent()
