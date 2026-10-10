from datetime import datetime
from typing import List, Optional, Any
from pydantic import BaseModel, Field

class ApiSpecItem(BaseModel):
    method: str
    endpoint: str
    purpose: str
    request_body: Optional[str] = None
    response_format: str
    validation_rules: List[str] = []
    error_responses: List[str] = []

class CodeExampleItem(BaseModel):
    title: str
    language: str
    filename: str
    code: str
    description: str

class GuidanceGenerateRequest(BaseModel):
    project_id: int
    task_id: Optional[int] = None
    custom_focus: Optional[str] = None
    demo_mode: bool = False

class GuidanceGenerationResult(BaseModel):
    title: str
    architecture_overview: str
    directory_structure: str
    dependencies: List[str]
    database_schema: str
    api_specifications: List[ApiSpecItem]
    data_models: str
    implementation_sequence: List[str]
    code_examples: List[CodeExampleItem]
    integration_steps: List[str]
    validation_recommendations: List[str]
    error_handling: str
    security_recommendations: List[str]
    performance_considerations: List[str]
    deployment_considerations: List[str]

class GuidanceResponse(BaseModel):
    id: int
    project_id: int
    task_id: Optional[int] = None
    user_id: int
    title: str
    architecture_overview: str
    directory_structure: Optional[str] = None
    dependencies: Optional[Any] = None
    database_schema: Optional[str] = None
    api_specifications: Optional[Any] = None
    data_models: Optional[str] = None
    implementation_sequence: Optional[Any] = None
    code_examples: Optional[Any] = None
    integration_steps: Optional[Any] = None
    validation_recommendations: Optional[Any] = None
    error_handling: Optional[str] = None
    security_recommendations: Optional[Any] = None
    performance_considerations: Optional[Any] = None
    deployment_considerations: Optional[Any] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
