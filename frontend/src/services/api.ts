import {
  AuthResponse,
  User,
  Project,
  Requirement,
  DevelopmentTask,
  ImplementationGuide,
  TestCase,
  AdaptiveTestExecutionRequest,
  AdaptiveTestExecutionResponse,
  ApplyAdaptedTestsRequest,
  CodeReview,
  DashboardStats,
  ActivityItem,
  HealthStatus,
} from '../types';


const API_BASE = '/api';

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');

    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    const config: RequestInit = {
      ...options,
      headers,
      credentials: 'include', // Support HttpOnly cookies
    };

    const response = await fetch(`${API_BASE}${endpoint}`, config);

    if (response.status === 401) {
      // Clear token on unauthorized
      if (this.token && !endpoint.includes('/auth/login')) {
        this.setToken(null);
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
    }

    if (!response.ok) {
      let errorMessage = 'An unexpected error occurred.';
      try {
        const errorJson = await response.json();
        if (errorJson.detail) {
          errorMessage = typeof errorJson.detail === 'string' 
            ? errorJson.detail 
            : JSON.stringify(errorJson.detail);
        }
      } catch {
        errorMessage = `HTTP error ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    // Check if empty response or plain text
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return (await response.json()) as T;
    }
    return (await response.text()) as unknown as T;
  }

  // Auth
  async register(data: { email: string; password: string; full_name: string }): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(res.access_token);
    return res;
  }

  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(res.access_token);
    return res;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.setToken(null);
    }
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  // Projects
  async getProjects(params?: { search?: string; language?: string; sort_by?: string; sort_order?: string }): Promise<Project[]> {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.language) query.set('language', params.language);
    if (params?.sort_by) query.set('sort_by', params.sort_by);
    if (params?.sort_order) query.set('sort_order', params.sort_order);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request<Project[]>(`/projects${qs}`);
  }

  async getProject(id: number): Promise<Project> {
    return this.request<Project>(`/projects/${id}`);
  }

  async createProject(data: Partial<Project>): Promise<Project> {
    return this.request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProject(id: number, data: Partial<Project>): Promise<Project> {
    return this.request<Project>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProject(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/projects/${id}`, {
      method: 'DELETE',
    });
  }

  // Requirements
  async analyzeRequirement(data: {
    project_id: number;
    title: string;
    raw_requirement: string;
    constraints?: string;
    acceptance_criteria?: string;
    demo_mode?: boolean;
  }): Promise<Requirement> {
    return this.request<Requirement>('/requirements/analyze', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getProjectRequirements(projectId: number): Promise<Requirement[]> {
    return this.request<Requirement[]>(`/projects/${projectId}/requirements`);
  }

  async getRequirement(id: number): Promise<Requirement> {
    return this.request<Requirement>(`/requirements/${id}`);
  }

  // Tasks
  async generateTasks(data: {
    project_id: number;
    requirement_id?: number;
    replace_existing?: boolean;
    custom_instructions?: string;
    demo_mode?: boolean;
  }): Promise<DevelopmentTask[]> {
    return this.request<DevelopmentTask[]>('/tasks/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getProjectTasks(projectId: number, filters?: { status?: string; priority?: string }): Promise<DevelopmentTask[]> {
    const query = new URLSearchParams();
    if (filters?.status) query.set('status', filters.status);
    if (filters?.priority) query.set('priority', filters.priority);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request<DevelopmentTask[]>(`/projects/${projectId}/tasks${qs}`);
  }

  async updateTask(id: number, data: Partial<DevelopmentTask>): Promise<DevelopmentTask> {
    return this.request<DevelopmentTask>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTask(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  // Guidance
  async generateGuidance(data: {
    project_id: number;
    task_id?: number;
    custom_focus?: string;
    demo_mode?: boolean;
  }): Promise<ImplementationGuide> {
    return this.request<ImplementationGuide>('/guidance/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getProjectGuidance(projectId: number): Promise<ImplementationGuide[]> {
    return this.request<ImplementationGuide[]>(`/projects/${projectId}/guidance`);
  }

  // Test Cases
  async generateTests(data: {
    project_id: number;
    requirement_id?: number;
    task_id?: number;
    focus_category?: string;
    demo_mode?: boolean;
  }): Promise<TestCase[]> {
    return this.request<TestCase[]>('/tests/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getProjectTests(projectId: number, filters?: { category?: string; priority?: string; execution_status?: string; search?: string }): Promise<TestCase[]> {
    const query = new URLSearchParams();
    if (filters?.category) query.set('category', filters.category);
    if (filters?.priority) query.set('priority', filters.priority);
    if (filters?.execution_status) query.set('execution_status', filters.execution_status);
    if (filters?.search) query.set('search', filters.search);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request<TestCase[]>(`/projects/${projectId}/tests${qs}`);
  }

  async updateTest(id: number, data: Partial<TestCase>): Promise<TestCase> {
    return this.request<TestCase>(`/tests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTest(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/tests/${id}`, {
      method: 'DELETE',
    });
  }

  async exportTestsCsv(projectId: number): Promise<string> {
    const headers = new Headers();
    if (this.token) headers.set('Authorization', `Bearer ${this.token}`);
    const res = await fetch(`${API_BASE}/projects/${projectId}/tests/export`, {
      headers,
      credentials: 'include',
    });
    if (!res.ok) {
      throw new Error(`Export failed with status ${res.status}`);
    }
    return res.text();
  }

  async adaptTestsFromCode(data: AdaptiveTestExecutionRequest): Promise<AdaptiveTestExecutionResponse> {
    return this.request<AdaptiveTestExecutionResponse>('/tests/adapt', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async applyAdaptedTests(data: ApplyAdaptedTestsRequest): Promise<TestCase[]> {
    return this.request<TestCase[]>('/tests/apply-adapted', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Code Review
  async analyzeCode(data: {
    project_id: number;
    source_code: string;
    language?: string;
    framework?: string;
    file_name?: string;
    context_description?: string;
    review_focus?: string;
    demo_mode?: boolean;
  }): Promise<CodeReview> {
    return this.request<CodeReview>('/reviews/analyze', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getProjectReviews(projectId: number): Promise<CodeReview[]> {
    return this.request<CodeReview[]>(`/projects/${projectId}/reviews`);
  }

  async getReview(id: number): Promise<CodeReview> {
    return this.request<CodeReview>(`/reviews/${id}`);
  }

  async exportReviewMarkdown(reviewId: number): Promise<string> {
    const headers = new Headers();
    if (this.token) headers.set('Authorization', `Bearer ${this.token}`);
    const res = await fetch(`${API_BASE}/reviews/${reviewId}/export`, {
      headers,
      credentials: 'include',
    });
    if (!res.ok) {
      throw new Error(`Export failed with status ${res.status}`);
    }
    return res.text();
  }


  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    return this.request<DashboardStats>('/dashboard/stats');
  }

  async getActivities(limit = 50): Promise<ActivityItem[]> {
    return this.request<ActivityItem[]>(`/dashboard/activity?limit=${limit}`);
  }

  // System
  async getHealth(): Promise<HealthStatus> {
    return this.request<HealthStatus>('/health');
  }
}

export const api = new ApiClient();
