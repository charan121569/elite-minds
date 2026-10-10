export interface User {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Project {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  programming_language: string;
  framework: string;
  database_preference: string;
  status: string;
  created_at: string;
  updated_at: string;
  requirement_count?: number;
  task_count?: number;
  guidance_count?: number;
  test_count?: number;
  review_count?: number;
}

export interface FunctionalRequirementItem {
  id: string;
  feature: string;
  description: string;
  priority: string;
}

export interface UserRoleItem {
  role: string;
  description: string;
  permissions: string[];
}

export interface PhaseItem {
  phase_number: number;
  title: string;
  description: string;
  estimated_duration?: string;
  key_deliverables: string[];
}

export interface Requirement {
  id: number;
  project_id: number;
  user_id: number;
  title: string;
  raw_requirement: string;
  constraints?: string;
  acceptance_criteria?: string;
  summary?: string;
  problem_statement?: string;
  functional_requirements?: FunctionalRequirementItem[];
  non_functional_requirements?: string[];
  user_roles?: UserRoleItem[];
  permissions?: string[];
  assumptions?: string[];
  missing_information?: string[];
  clarification_questions?: string[];
  technical_constraints?: string[];
  suggested_architecture?: string[];
  potential_risks?: string[];
  structured_acceptance_criteria?: string[];
  suggested_phases?: PhaseItem[];
  created_at: string;
  updated_at: string;
}

export interface DevelopmentTask {
  id: number;
  project_id: number;
  requirement_id?: number;
  user_id: number;
  task_key: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  complexity: string;
  status: string; // 'To Do' | 'In Progress' | 'Completed'
  dependencies?: string[];
  implementation_steps?: string[];
  expected_deliverables?: string[];
  acceptance_criteria?: string[];
  estimated_duration?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface ApiSpecItem {
  method: string;
  endpoint: string;
  purpose: string;
  request_body?: string;
  response_format: string;
  validation_rules?: string[];
  error_responses?: string[];
}

export interface CodeExampleItem {
  title: string;
  language: string;
  filename: string;
  code: string;
  description: string;
}

export interface ImplementationGuide {
  id: number;
  project_id: number;
  task_id?: number;
  user_id: number;
  title: string;
  architecture_overview: string;
  directory_structure?: string;
  dependencies?: string[];
  database_schema?: string;
  api_specifications?: ApiSpecItem[];
  data_models?: string;
  implementation_sequence?: string[];
  code_examples?: CodeExampleItem[];
  integration_steps?: string[];
  validation_recommendations?: string[];
  error_handling?: string;
  security_recommendations?: string[];
  performance_considerations?: string[];
  deployment_considerations?: string[];
  created_at: string;
  updated_at: string;
}

export interface TestCase {
  id: number;
  project_id: number;
  requirement_id?: number;
  task_id?: number;
  user_id: number;
  test_key: string;
  title: string;
  description: string;
  related_requirement?: string;
  preconditions?: string;
  test_steps?: string[];
  input_data?: string;
  expected_result: string;
  priority: string;
  category: string;
  automation_approach: string;
  execution_status: string; // 'Not Run' | 'Passed' | 'Failed'
  execution_notes?: string;
  test_code_snippet?: string;
  created_at: string;
  updated_at: string;
}

export interface AdaptedTestCaseItem {
  test_id: number;
  test_key: string;
  title: string;
  old_expected_result: string;
  new_expected_result: string;
  old_test_steps?: string[];
  new_test_steps?: string[];
  old_input_data?: string;
  new_input_data?: string;
  execution_status: string; // 'Passed' | 'Failed' | 'Adapted'
  execution_notes: string;
  updated_test_code_snippet?: string;
  modifications_summary: string[];
}

export interface AdaptiveTestExecutionResponse {
  verdict: 'PASS' | 'FAIL' | 'ADAPTED';
  execution_output: string;
  summary: string;
  gaps_found: string[];
  adapted_tests: AdaptedTestCaseItem[];
  applied_to_db: boolean;
  generated_review_id?: number;
  generated_review_summary?: string;
}


export interface AdaptiveTestExecutionRequest {
  project_id: number;
  test_case_id?: number;
  implemented_code: string;
  language?: string;
  guide_id?: number;
  auto_apply?: boolean;
  demo_mode?: boolean;
}

export interface ApplyAdaptedTestsRequest {
  project_id: number;
  adapted_tests: AdaptedTestCaseItem[];
}


export interface CodeReviewFinding {
  id: number;
  review_id: number;
  title: string;
  severity: string; // 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational'
  category: string;
  description: string;
  code_location?: string;
  impact_explanation: string;
  recommended_fix: string;
  suggested_code?: string;
  created_at: string;
}

export interface CodeReview {
  id: number;
  project_id: number;
  user_id: number;
  file_name?: string;
  language: string;
  framework?: string;
  context_description?: string;
  focus_area?: string;
  submitted_code: string;
  summary: string;
  overall_assessment: string;
  positive_observations?: string[];
  recommended_priorities?: string[];
  suggested_tests?: string[];
  findings: CodeReviewFinding[];
  created_at: string;
  updated_at: string;
}

export interface ActivityItem {
  id: number;
  user_id: number;
  project_id?: number;
  action_type: string;
  description: string;
  entity_type: string;
  entity_id?: number;
  created_at: string;
}

export interface DashboardStats {
  total_projects: number;
  total_requirements: number;
  total_tasks: number;
  total_test_cases: number;
  total_code_reviews: number;
  task_status_distribution: Record<string, number>;
  review_severity_distribution: Record<string, number>;
  recent_projects: Project[];
  recent_activities: ActivityItem[];
}

export interface HealthStatus {
  status: string;
  database_connected: boolean;
  database_message: string;
  ai_provider: string;
  ai_configured: boolean;
  ai_model: string;
  app_env: string;
}
