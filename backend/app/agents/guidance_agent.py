from app.agents.base import BaseAIAgent
from app.agents.demo_fixtures import DEMO_GUIDANCE
from app.schemas.guidance import GuidanceGenerationResult

SYSTEM_INSTRUCTION = """You are a Principal Solutions Architect.
Generate deep, stack-specific technical implementation guidance. You must tailor all code snippets, schemas, and directories to the exact programming language, framework, and database provided.
Output ONLY a valid JSON object matching this schema:
{
  "title": "Comprehensive Implementation Guide Title",
  "architecture_overview": "Detailed explanation of application layers, data flow, and pattern usage",
  "directory_structure": "Recommended ASCII directory tree matching the tech stack",
  "dependencies": ["list of packages or maven/npm/pip dependencies"],
  "database_schema": "SQL DDL statements with primary keys, indexes, and foreign keys",
  "api_specifications": [
    {
      "method": "GET|POST|PUT|DELETE",
      "endpoint": "/api/...",
      "purpose": "Endpoint purpose",
      "request_body": "Schema or JSON description",
      "response_format": "Expected HTTP response JSON",
      "validation_rules": ["rule 1"],
      "error_responses": ["400 Bad Request", "401 Unauthorized"]
    }
  ],
  "data_models": "ORM model code or entity class definitions",
  "implementation_sequence": ["Ordered step 1", "Ordered step 2"],
  "code_examples": [
    {
      "title": "Example Title",
      "language": "python|typescript|java|sql",
      "filename": "path/to/file.ext",
      "code": "Realistic, non-pseudocode implementation snippet",
      "description": "What this code demonstrates"
    }
  ],
  "integration_steps": ["step 1", "step 2"],
  "validation_recommendations": ["recommendation 1"],
  "error_handling": "Concrete error handling strategy",
  "security_recommendations": ["Security recommendation 1"],
  "performance_considerations": ["Performance note 1"],
  "deployment_considerations": ["Containerization and deploy step 1"]
}
Do not include any prose outside the JSON object.
"""

class ImplementationGuidanceAgent(BaseAIAgent):
    def __init__(self):
        super().__init__(
            name="ImplementationGuidanceAgent",
            description="Generates stack-tailored technical architecture, API contracts, schemas, and production code patterns."
        )

    def generate_guidance(
        self,
        project_name: str,
        tech_stack: dict,
        requirements_summary: str,
        task_context: str | None = None,
        custom_focus: str | None = None,
        demo_mode: bool = False
    ) -> tuple[GuidanceGenerationResult, bool]:
        prompt = f"""Project Name: {project_name}
Target Tech Stack:
- Programming Language: {tech_stack.get('language')}
- Framework: {tech_stack.get('framework')}
- Database: {tech_stack.get('database')}

Requirement Context:
{requirements_summary}

Specific Task Context:
{task_context or 'General full-stack system implementation'}

Architectural Focus:
{custom_focus or 'Complete end-to-end implementation including database schema, API specification, and secure patterns.'}
"""
        return self.execute_structured(
            prompt=prompt,
            system_instruction=SYSTEM_INSTRUCTION,
            response_model=GuidanceGenerationResult,
            fallback_data=DEMO_GUIDANCE,
            force_demo=demo_mode
        )

guidance_agent = ImplementationGuidanceAgent()
