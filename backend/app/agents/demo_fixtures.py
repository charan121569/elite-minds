"""
High-quality, realistic demo fixtures for hackathon demonstration
when live Gemini API key is not configured or demo mode is toggled.
Demonstrates the student management system domain workflow cleanly.
"""

DEMO_REQUIREMENT_ANALYSIS = {
    "summary": "Production-grade Student Management System (SMS) facilitating student onboarding, course enrollments, role-based administration, and academic dashboard analytics.",
    "problem_statement": "Educational institutions struggle with fragmented student records, manual grade audits, and insecure multi-role access control. This solution provides an integrated, role-governed platform.",
    "functional_requirements": [
        {
            "id": "FR-1",
            "feature": "Role-Based Authentication & Authorization",
            "description": "Secure JWT login with Argon2 password hashing for Admins, Faculty, and Students with specific access scopes.",
            "priority": "Critical"
        },
        {
            "id": "FR-2",
            "feature": "Student CRUD & Lifecycle Management",
            "description": "Full student record management with validation, enrollment numbers, status toggles, and academic batch assignment.",
            "priority": "High"
        },
        {
            "id": "FR-3",
            "feature": "Course Enrollment & Attendance Tracking",
            "description": "Facilitate elective course registrations, enforce prerequisite checks, and log daily lecture attendance.",
            "priority": "Medium"
        },
        {
            "id": "FR-4",
            "feature": "Executive Analytics Dashboard",
            "description": "Visual KPIs aggregating student retention, GPA distributions, and active enrollment metrics.",
            "priority": "Medium"
        }
    ],
    "non_functional_requirements": [
        "P95 API response times under 200ms for read endpoints.",
        "Strict adherence to OWASP Top 10 security standards and zero plaintext password storage.",
        "Database ACID transaction compliance for all financial and grading mutations.",
        "Responsive desktop and tablet UI support."
    ],
    "user_roles": [
        {
            "role": "Super Admin",
            "description": "Complete system governance, role allocation, and audit log inspection.",
            "permissions": ["users:write", "students:write", "analytics:view", "system:configure"]
        },
        {
            "role": "Instructor/Faculty",
            "description": "Course management, attendance recording, and grading.",
            "permissions": ["students:read", "grades:write", "attendance:write"]
        },
        {
            "role": "Student",
            "description": "Self-service profile viewing, course enrollment, and grade progress checking.",
            "permissions": ["profile:read", "courses:enroll", "grades:read_own"]
        }
    ],
    "assumptions": [
        "Institutions assign a unique national ID or institutional roll number to each student.",
        "Initial deployments target single-tenant institutional infrastructure.",
        "Term schedules follow semester-based calendars."
    ],
    "missing_information": [
        "Third-party payment gateway integration requirements for tuition fees.",
        "Single Sign-On (SSO) or OAuth2 identity provider integration preference.",
        "Bulk import formats for historical student CSV/Excel archives."
    ],
    "clarification_questions": [
        "Should grading support GPA, percentage scales, or custom institutional rubrics?",
        "Are parents or guardians required to have dedicated read-only portal accounts?",
        "What data retention and GDPR/FERPA compliance rules apply to archived student records?"
    ],
    "technical_constraints": [
        "Must use MySQL 8.x with InnoDB engine for transactional reliability.",
        "All API payloads must enforce schema validation before business logic execution.",
        "Authentication tokens must expire after 24 hours with secure rotation."
    ],
    "suggested_architecture": [
        "Layered Clean Architecture: API Controllers -> Service Layer -> Repository/ORM Layer -> MySQL Database.",
        "Stateless JWT session handling with client-side memory token storage and CSRF mitigation.",
        "TanStack Query on frontend for optimistic UI updates and server-state caching."
    ],
    "potential_risks": [
        "IDOR (Insecure Direct Object Reference) vulnerabilities if student ID authorization is not verified per request.",
        "Concurrent course registrations exceeding classroom seat capacity.",
        "Database performance degradation during peak exam enrollment windows without appropriate indexes."
    ],
    "acceptance_criteria": [
        "User registration rejects passwords with fewer than 8 characters or lacking complexity.",
        "Admins can create, read, update, and soft-delete student profiles with immediate UI reflection.",
        "Students cannot view or mutate other students' private profile data or academic records.",
        "Dashboard metrics dynamically refresh based on verified database counts."
    ],
    "suggested_phases": [
        {
            "phase_number": 1,
            "title": "Core Domain Models & Authentication Infrastructure",
            "description": "Setup MySQL tables, migrations, user authentication, and RBAC middleware.",
            "estimated_duration": "1-2 sprints (AI estimate)",
            "key_deliverables": ["Users & Roles DB Schema", "JWT Auth Endpoints", "Password Hashing Utility"]
        },
        {
            "phase_number": 2,
            "title": "Student Entity CRUD & Validation Engine",
            "description": "Implement student profile APIs, search filters, and frontend data table.",
            "estimated_duration": "2 sprints (AI estimate)",
            "key_deliverables": ["Student API endpoints", "Frontend Student Management Table", "Form Validation"]
        },
        {
            "phase_number": 3,
            "title": "Enrollment Workflows & Analytics Dashboard",
            "description": "Build course registration logic, metric aggregations, and dashboard visualizations.",
            "estimated_duration": "2 sprints (AI estimate)",
            "key_deliverables": ["Enrollment Transaction Handler", "Dashboard KPI Charts", "Activity Auditing"]
        }
    ]
}

DEMO_TASKS = [
    {
        "task_key": "TASK-001",
        "title": "Setup MySQL Database Schema & SQLAlchemy Migrations",
        "description": "Design normalized tables for students, courses, enrollments, and users with foreign keys and indexes.",
        "category": "Database",
        "priority": "Critical",
        "complexity": "Medium",
        "status": "Completed",
        "dependencies": [],
        "implementation_steps": [
            "Define declarative models for Student, Course, and Enrollment entities.",
            "Add unique constraints on email and student_registration_number.",
            "Generate and verify Alembic initial migration script."
        ],
        "expected_deliverables": ["SQLAlchemy models", "Alembic revision script", "Database ER diagram"],
        "acceptance_criteria": ["All tables created with InnoDB engine", "Foreign key cascades enforced"],
        "estimated_duration": "3 hours (AI estimate)"
    },
    {
        "task_key": "TASK-002",
        "title": "Implement JWT Authentication & Role-Based Authorization Guard",
        "description": "Develop secure login, token generation, password hashing, and role verification middleware.",
        "category": "Authentication",
        "priority": "Critical",
        "complexity": "Medium",
        "status": "In Progress",
        "dependencies": ["TASK-001"],
        "implementation_steps": [
            "Implement Argon2 password hasher in core security module.",
            "Create login and registration endpoints returning signed JWT tokens.",
            "Write FastAPI dependency to verify current user and enforce role permissions."
        ],
        "expected_deliverables": ["Auth endpoints", "Security middleware", "Token unit tests"],
        "acceptance_criteria": ["Passwords hashed securely", "Expired tokens return 401 Unauthorized"],
        "estimated_duration": "4 hours (AI estimate)"
    },
    {
        "task_key": "TASK-003",
        "title": "Build Student Management REST API Endpoints",
        "description": "Create CRUD endpoints for student profiles with pagination, search, and validation.",
        "category": "Backend",
        "priority": "High",
        "complexity": "Medium",
        "status": "To Do",
        "dependencies": ["TASK-002"],
        "implementation_steps": [
            "Define Pydantic schemas for StudentCreate, StudentUpdate, and StudentResponse.",
            "Implement GET /students with name/batch filtering and offset pagination.",
            "Implement POST, PUT, and DELETE endpoints with ownership and role checks."
        ],
        "expected_deliverables": ["Student router file", "Service layer with business validation"],
        "acceptance_criteria": ["Input validation handles malformed emails and invalid birthdates"],
        "estimated_duration": "5 hours (AI estimate)"
    },
    {
        "task_key": "TASK-004",
        "title": "Develop Interactive Student Directory & Dashboard Workspace",
        "description": "Create responsive React UI with search, sortable tables, creation modals, and KPI cards.",
        "category": "Frontend",
        "priority": "High",
        "complexity": "Large",
        "status": "To Do",
        "dependencies": ["TASK-003"],
        "implementation_steps": [
            "Build reusable DataCard, Badge, and Modal components.",
            "Integrate TanStack Query for server state caching and optimistic updates.",
            "Create responsive grid layout with quick stats and action triggers."
        ],
        "expected_deliverables": ["StudentDirectory page", "StudentDialog component", "KPI stat widgets"],
        "acceptance_criteria": ["Search responds instantly with debouncing", "Responsive on mobile devices"],
        "estimated_duration": "6 hours (AI estimate)"
    },
    {
        "task_key": "TASK-005",
        "title": "Create Automated Integration Test Suite & CI Verification",
        "description": "Write pytest suites covering auth flows, student lifecycle, and unauthorized permission tests.",
        "category": "Testing",
        "priority": "Medium",
        "complexity": "Medium",
        "status": "To Do",
        "dependencies": ["TASK-003"],
        "implementation_steps": [
            "Setup SQLite in-memory test database fixture in pytest conftest.",
            "Write positive and negative test cases for student creation.",
            "Verify that regular students cannot delete admin accounts or edit peer grades."
        ],
        "expected_deliverables": ["pytest test files", "Test coverage report"],
        "acceptance_criteria": ["All tests pass with 100% assertions succeeded"],
        "estimated_duration": "3 hours (AI estimate)"
    }
]

DEMO_GUIDANCE = {
    "title": "Implementation Architecture & Technical Guide for Student Management System",
    "architecture_overview": "This architecture employs a clean 3-tier architectural model utilizing FastAPI (REST backend), SQLAlchemy 2.0 (ORM with connection pooling), and React + TypeScript (Vite frontend). State is decoupled through service layers and typed DTO schemas.",
    "directory_structure": """sms-project/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes/ (auth.py, students.py, courses.py, dashboard.py)
│   │   ├── core/ (config.py, security.py, permissions.py)
│   │   ├── models/ (student.py, course.py, enrollment.py)
│   │   ├── schemas/ (student.py, course.py)
│   │   └── services/ (student_service.py, enrollment_service.py)
│   └── main.py
└── frontend/
    └── src/
        ├── components/ (students/, ui/, layout/)
        ├── hooks/ (useStudents.ts, useAuth.ts)
        └── pages/ (StudentsPage.tsx, DashboardPage.tsx)""",
    "dependencies": [
        "fastapi>=0.115.0",
        "uvicorn[standard]>=0.32.0",
        "sqlalchemy>=2.0.36",
        "pymysql>=1.1.1",
        "pydantic>=2.10.0",
        "pyjwt>=2.10.0",
        "argon2-cffi>=23.1.0"
    ],
    "database_schema": """-- MySQL 8.x Schema Definition
CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    enrollment_number VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    department VARCHAR(100) NOT NULL,
    gpa DECIMAL(3, 2) DEFAULT 0.00,
    status ENUM('active', 'probation', 'graduated', 'suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_students_dept (department),
    INDEX idx_students_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;""",
    "api_specifications": [
        {
            "method": "GET",
            "endpoint": "/api/students",
            "purpose": "Fetch paginated students list with optional department and search queries",
            "request_body": "None (Query params: search, department, page=1, limit=20)",
            "response_format": "{ items: Student[], total: number, page: number, total_pages: number }",
            "validation_rules": ["page >= 1", "limit between 1 and 100"],
            "error_responses": ["401 Unauthorized - Invalid or expired token", "403 Forbidden - Insufficient scope"]
        },
        {
            "method": "POST",
            "endpoint": "/api/students",
            "purpose": "Enroll and create a new student record",
            "request_body": "{ enrollment_number: string, first_name: string, last_name: string, email: string, department: string }",
            "response_format": "Student object with generated id and timestamps",
            "validation_rules": ["valid email syntax", "enrollment_number must be alphanumeric", "first_name and last_name >= 2 chars"],
            "error_responses": ["400 Bad Request - Validation error", "409 Conflict - Enrollment number or email already registered"]
        }
    ],
    "data_models": """class StudentModel(Base):
    __tablename__ = 'students'
    id: Mapped[int] = mapped_column(primary_key=True)
    enrollment_number: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    first_name: Mapped[str] = mapped_column(String(100))
    last_name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(255), unique=True)
    department: Mapped[str] = mapped_column(String(100))
    gpa: Mapped[float] = mapped_column(Numeric(3, 2), default=0.0)""",
    "implementation_sequence": [
        "Phase 1: Database Migration & Entity Models",
        "Phase 2: Authentication & RBAC Dependencies",
        "Phase 3: Repository & Service Layer Business Logic",
        "Phase 4: API Routes & OpenAPI Swagger Specification",
        "Phase 5: Frontend React Queries & Form Integration"
    ],
    "code_examples": [
        {
            "title": "FastAPI Student Creation Route with Role Guard",
            "language": "python",
            "filename": "backend/app/api/routes/students.py",
            "code": """from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.security import get_current_user
from app.schemas.student import StudentCreate, StudentResponse
from app.services.student_service import StudentService

router = APIRouter(prefix="/students", tags=["students"])

@router.post("/", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
def create_student(
    payload: StudentCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if "admin" not in current_user.roles:
        raise HTTPException(status_code=403, detail="Admin authorization required to enroll students.")
    return StudentService.create_student(db, payload)""",
            "description": "Standard REST endpoint demonstrating dependency injection, role enforcement, and clean service separation."
        },
        {
            "title": "React Hook with TanStack Query for Student Mutation",
            "language": "typescript",
            "filename": "frontend/src/hooks/useStudentMutations.ts",
            "code": """import { useMutation, useQueryClient } from '@tanstack/react-query';
import { studentApi } from '../services/studentApi';

export function useCreateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newStudent: StudentFormInput) => studentApi.create(newStudent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}""",
            "description": "React hook providing optimistic cache invalidation upon successful student registration."
        }
    ],
    "integration_steps": [
        "Step 1: Configure backend database credentials in .env and verify connection pool.",
        "Step 2: Initialize database tables via Alembic revision scripts.",
        "Step 3: Test auth flow with /api/auth/login to obtain bearer token.",
        "Step 4: Attach Authorization: Bearer <token> header to all frontend API client calls."
    ],
    "validation_recommendations": [
        "Enforce RFC-compliant email regex validation on both client and server.",
        "Sanitize all free-text fields to prevent Cross-Site Scripting (XSS).",
        "Validate GPA numeric range between 0.00 and 4.00 inclusive."
    ],
    "error_handling": "Implement a global FastAPI exception handler converting SQLAlchemy IntegrityErrors into structured 409 Conflict messages without leaking internal SQL error strings.",
    "security_recommendations": [
        "Always enforce parameterized queries via SQLAlchemy to prevent SQL Injection.",
        "Configure CORS strictly for the designated frontend domain.",
        "Store JWT tokens in memory or HttpOnly cookies to thwart XSS token theft."
    ],
    "performance_considerations": [
        "Add composite index on (department, status) for filtered directory queries.",
        "Use offset pagination or cursor-based pagination for large datasets.",
        "Enable Gzip compression in FastAPI middleware for response payloads exceeding 1KB."
    ],
    "deployment_considerations": [
        "Deploy backend using Gunicorn with Uvicorn worker class behind NGINX reverse proxy.",
        "Run database migrations in CI/CD pipeline prior to traffic redirection.",
        "Ensure environment variables are injected via secure secrets manager."
    ]
}

DEMO_TEST_CASES = [
    {
        "test_key": "TC-001",
        "title": "Positive: Create Student with Valid Attributes",
        "description": "Verify that an authorized administrator can register a new student with complete, valid information.",
        "related_requirement": "FR-2",
        "preconditions": "Admin user is logged in with valid bearer token.",
        "test_steps": [
            "Send POST /api/students with unique email and valid registration code.",
            "Verify HTTP status code is 201 Created.",
            "Verify returned JSON payload contains generated student ID and active status."
        ],
        "input_data": "{ 'first_name': 'Aria', 'last_name': 'Vance', 'email': 'aria.vance@university.edu', 'department': 'Computer Science' }",
        "expected_result": "Student record is created in MySQL and returned with 201 Created.",
        "priority": "Critical",
        "category": "Positive",
        "automation_approach": "API",
        "test_code_snippet": """def test_create_student_success(client, auth_headers):
    payload = {"first_name": "Aria", "last_name": "Vance", "email": "aria.vance@university.edu", "department": "Computer Science", "enrollment_number": "CS-2026-001"}
    response = client.post("/api/students", json=payload, headers=auth_headers)
    assert response.status_code == 201
    assert response.json()["email"] == "aria.vance@university.edu" """
    },
    {
        "test_key": "TC-002",
        "title": "Negative: Duplicate Student Email Conflict",
        "description": "Verify system prohibits registering a student with an email address already registered.",
        "related_requirement": "FR-2",
        "preconditions": "A student with email 'aria.vance@university.edu' already exists in MySQL.",
        "test_steps": [
            "Send POST /api/students using existing email.",
            "Verify response status code is 409 Conflict.",
            "Verify error message indicates duplicate email."
        ],
        "input_data": "{ 'email': 'aria.vance@university.edu', 'enrollment_number': 'CS-2026-002' }",
        "expected_result": "Returns 409 Conflict with informative error message without 500 server crash.",
        "priority": "High",
        "category": "Negative",
        "automation_approach": "API",
        "test_code_snippet": """def test_duplicate_student_conflict(client, auth_headers):
    payload = {"first_name": "Duplicate", "last_name": "User", "email": "aria.vance@university.edu", "department": "Biology", "enrollment_number": "BIO-2026-001"}
    response = client.post("/api/students", json=payload, headers=auth_headers)
    assert response.status_code == 409"""
    },
    {
        "test_key": "TC-003",
        "title": "Boundary: Student GPA Limits Validation",
        "description": "Verify that GPA values strictly below 0.0 or above 4.0 are rejected.",
        "related_requirement": "FR-2",
        "preconditions": "Admin user authenticated.",
        "test_steps": [
            "Attempt student update with GPA = 4.01.",
            "Verify HTTP 422 Unprocessable Entity is returned.",
            "Attempt update with GPA = -0.1 and verify rejection.",
            "Attempt update with GPA = 4.00 and verify success."
        ],
        "input_data": "{ 'gpa': 4.01 }",
        "expected_result": "Out-of-bounds GPA values trigger validation error 422; boundary value 4.00 is accepted.",
        "priority": "Medium",
        "category": "Boundary",
        "automation_approach": "Unit",
        "test_code_snippet": """def test_gpa_boundary_validation():
    with pytest.raises(ValidationError):
        StudentCreate(first_name="Test", last_name="User", email="test@uni.edu", gpa=4.01)"""
    },
    {
        "test_key": "TC-004",
        "title": "Security: Unauthorized Student Deletion Attempt",
        "description": "Verify non-admin student account cannot invoke DELETE endpoint on other student records.",
        "related_requirement": "FR-1",
        "preconditions": "User logged in with role 'Student'.",
        "test_steps": [
            "Send DELETE /api/students/12 using Student role bearer token.",
            "Verify HTTP 403 Forbidden is returned.",
            "Verify record still exists in MySQL."
        ],
        "input_data": "Student Token, Target ID = 12",
        "expected_result": "HTTP 403 Forbidden returned; database record remains untouched.",
        "priority": "Critical",
        "category": "Security",
        "automation_approach": "API",
        "test_code_snippet": """def test_unauthorized_deletion_rejected(client, student_headers):
    response = client.delete("/api/students/12", headers=student_headers)
    assert response.status_code == 403"""
    }
]

DEMO_CODE_REVIEW = {
    "summary": "AI code review completed across submitted student authentication and database logic. Identified 1 Critical security vulnerability (SQL Injection), 1 High vulnerability (Plaintext Password Comparison), and 2 Medium readability/reliability issues.",
    "overall_assessment": "Needs Work - Contains severe security flaws that must be resolved prior to production deployment.",
    "positive_observations": [
        "Endpoint structure adheres to standard REST naming conventions.",
        "Includes preliminary input parameter typing."
    ],
    "recommended_priorities": [
        "Immediately replace raw string SQL concatenation with SQLAlchemy parameterized queries.",
        "Migrate password verification to constant-time Argon2 hashing.",
        "Implement proper HTTP status codes instead of returning error text strings with 200 OK."
    ],
    "suggested_tests": [
        "Unit test for SQL injection payloads in username parameter.",
        "Test with timing-attack resistant password verification.",
        "Integration test for expired JWT token rejection."
    ],
    "findings": [
        {
            "title": "Critical SQL Injection Vulnerability in User Query",
            "severity": "Critical",
            "category": "Security",
            "description": "User-supplied input is directly formatted into a SQL query string without escaping or parameter binding. An attacker can submit \"' OR '1'='1\" to bypass authentication or drop tables.",
            "code_location": "Line 8: cursor.execute(f'SELECT * FROM users WHERE email=\"{email}\"')",
            "impact_explanation": "Full database compromise, unauthorized data extraction, and potential privilege escalation to superuser.",
            "recommended_fix": "Use SQLAlchemy parameterized queries or prepared statements with placeholder parameters.",
            "suggested_code": """# Corrected Implementation
stmt = select(User).where(User.email == email)
user = db.scalars(stmt).first()"""
        },
        {
            "title": "Plaintext Password Comparison & Timing Attack Exposure",
            "severity": "High",
            "category": "Security",
            "description": "User password is compared using standard '==' equality operator against unhashed database values, leaking credential length and susceptible to timing attacks.",
            "code_location": "Line 12: if user.password == input_password:",
            "impact_explanation": "Plaintext credentials exposed in data breaches; susceptible to timing-based side-channel analysis.",
            "recommended_fix": "Store only salted Argon2 hashes and verify using password_hasher.verify() in constant time.",
            "suggested_code": """# Corrected Implementation
from app.core.security import verify_password

if not verify_password(input_password, user.hashed_password):
    raise HTTPException(status_code=401, detail='Invalid credentials')"""
        },
        {
            "title": "Missing Global Exception Handling and Transaction Rollback",
            "severity": "Medium",
            "category": "Exception Handling",
            "description": "Database operations are not wrapped in a try/except block with rollback, causing connection pool exhaustion and transaction lock leaks upon failure.",
            "code_location": "Line 22: db.commit()",
            "impact_explanation": "Database connection pool can become starved during unexpected failures, leading to service downtime.",
            "recommended_fix": "Use context managers or explicit try/except with db.rollback().",
            "suggested_code": """# Corrected Implementation
try:
    db.commit()
    db.refresh(student)
except Exception:
    db.rollback()
    raise HTTPException(status_code=500, detail='Database operation failed')"""
        }
    ]
}

DEMO_CODE_VERIFICATION = {
    "verdict": "PARTIAL",
    "confidence_score": 92,
    "summary": "The implemented code successfully implements basic positive authentication workflows and hashed password checking, but fails to satisfy boundary constraints, rate limiting, and explicit validation for empty/malformed email formats specified in the test case query.",
    "test_query_evaluated": "Verify user authentication handles valid credentials, rejects empty or invalid email formats with 400 Bad Request, and enforces constant-time hash comparison.",
    "strengths": [
        "Uses Argon2 / secure password verification rather than plain-text comparison.",
        "Correctly executes database lookup for active users.",
        "Generates JWT access token with defined expiration claim upon successful verification."
    ],
    "gaps_and_bugs": [
        {
            "issue": "Missing input validation for whitespace or empty email values",
            "severity": "High",
            "location": "def login(request: UserLoginRequest):",
            "explanation": "If an empty string or whitespace-only email is submitted, the code still queries the database without raising an early 400 Bad Request validation exception."
        },
        {
            "issue": "Generic 500 error on unexpected database connection drop",
            "severity": "Medium",
            "location": "user = db.scalars(stmt).first()",
            "explanation": "Database query exceptions are unhandled, leaking internal server error stack traces instead of returning a sanitized response."
        }
    ],
    "suggested_fix": """# Improved Implementation resolving Test Case requirements
@router.post("/auth/login", response_model=TokenResponse)
def login(request: UserLoginRequest, response: Response, db: Session = Depends(get_db)):
    cleaned_email = (request.email or "").strip().lower()
    if not cleaned_email or "@" not in cleaned_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A valid non-empty email address is required."
        )
    if not request.password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password cannot be empty."
        )

    user, token = AuthService.authenticate_user(db, cleaned_email, request.password)
    response.set_cookie(key="access_token", value=token, httponly=True, samesite="lax")
    return TokenResponse(access_token=token, token_type="bearer", user=UserResponse.model_validate(user))""",
    "generated_test_code": """# Executable Pytest Test Suite for the Test Case Query
import pytest
from fastapi.testclient import TestClient

def test_login_rejects_empty_email_with_400(client: TestClient):
    response = client.post("/api/auth/login", json={"email": "   ", "password": "ValidPassword123!"})
    assert response.status_code == 400
    assert "email" in response.json()["detail"].lower()

def test_login_success_with_valid_credentials(client: TestClient):
    response = client.post("/api/auth/login", json={"email": "developer@eliteminds.ai", "password": "SecurePassword123!"})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
"""
}
