# AI Software Development Agent
> **Autonomous Developer Productivity Platform for the Elite Minds Hackathon**

[![Python 3.13](https://img.shields.io/badge/Python-3.13-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com/)
[![React 19](https://img.shields.io/badge/Frontend-React%2019-61DAFB.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6.svg)](https://www.typescriptlang.org/)
[![MySQL 8.x](https://img.shields.io/badge/Database-MySQL%208.x-4479A1.svg)](https://www.mysql.com/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC.svg)](https://tailwindcss.com/)
[![Google Gemini 2.0](https://img.shields.io/badge/AI-Google%20Gemini%202.0-8E75C2.svg)](https://ai.google.dev/)
[![Tests](https://img.shields.io/badge/Pytest-18%20Passed-brightgreen.svg)](https://docs.pytest.org/)

---

## 1. Project Overview & Problem Statement

Modern software engineering teams frequently lose critical hours translating ambiguous, natural-language business specifications into actionable architecture. The handoff between product managers, architects, developers, and QA leads often causes:
- **Architectural Ambiguity:** Unstated business constraints lead to flawed database designs.
- **Fragmented Development Workflows:** Developers jump across disjointed tools for task management, architecture diagrams, test writing, and code reviews.
- **Security Vulnerabilities:** Hand-rolled security checks and unparameterized SQL queries slip into production unnoticed.

### The Solution: AI Software Development Agent
**AI Dev Agent** is an end-to-end, enterprise-grade AI developer productivity platform. It connects the entire software development lifecycle into a coherent, continuous pipeline:

```
Software Requirements
       │
       ▼
AI Requirement Analysis (Functional, Roles, Architecture, Phases)
       │
       ▼
Development Task Generation (Agile breakdown with Kanban & MySQL persistence)
       │
       ▼
Implementation Guidance (Stack-tailored blueprints, REST specs, code snippets)
       │
       ▼
Test Case Generation (Positive, negative, boundary, security test suites + CSV export)
       │
       ▼
AI Assisted Code Review (Static security vulnerability audit, diffs + Markdown export)
       │
       ▼
Real MySQL Dashboard Analytics & Compliance Audit Trail
```

---

## 2. Technology Stack

### Frontend
- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Vanilla Tailwind CSS with custom SaaS dark sidebar and light slate workspace
- **Routing:** React Router v7
- **Server-State Management:** TanStack Query (React Query)
- **Icons:** Lucide React
- **Notifications:** Built-in floating Toast notification system

### Backend
- **Framework:** FastAPI (Modular ASGI REST Backend)
- **Runtime:** Python 3.13 + Uvicorn
- **ORM & Database:** SQLAlchemy 2.0 with connection pooling + PyMySQL
- **Schema Migrations:** Alembic
- **Validation:** Pydantic v2 schemas for all API payloads and structured AI responses
- **Security & Auth:** JWT bearer & HttpOnly cookie strategy with Argon2id salted password hashing
- **Testing:** Pytest with isolated in-memory test database and mocked AI provider

### Database
- **Primary Database:** MySQL 8.x (`ai_dev_agent`)
- **Engine:** InnoDB with full transactional integrity, foreign key cascades, and JSON columns

### AI Engine
- **SDK:** Google GenAI SDK (`google-genai` 2.x)
- **Model:** Google Gemini 2.0 Flash
- **Architecture:** Provider Adapter Pattern with transparent fail-safe demo fixture mode

---

## 3. Database Schema Overview

The MySQL database schema contains 8 relational entities:

| Entity | Table Name | Purpose | Key Relationships |
| :--- | :--- | :--- | :--- |
| **Users** | `users` | Authenticated developers & admins | `projects`, `activities` |
| **Projects** | `projects` | Workspaces with target tech stacks | `owner`, `requirements`, `tasks`, `guidance`, `tests`, `reviews` |
| **Requirements** | `requirements` | Structured specifications & phases | Belongs to `project` & `user` |
| **DevelopmentTasks** | `development_tasks` | Actionable work items (Kanban state) | Belongs to `project` & `requirement` |
| **ImplementationGuides** | `implementation_guides` | Technical blueprints & API contracts | Belongs to `project` |
| **TestCases** | `test_cases` | Validation vectors & execution status | Belongs to `project` |
| **CodeReviews** | `code_reviews` | Audited code snippets & evaluations | Belongs to `project` |
| **CodeReviewFindings** | `code_review_findings` | Vulnerability findings & corrected code | Cascades from `code_reviews` |
| **ActivityLogs** | `activity_logs` | Immutable audit log of all operations | Belongs to `user` & `project` |

---

## 4. Windows Installation & Setup Guide

### Prerequisites
1. **Python 3.13 or compatible (3.10+)**
   Verify installation in PowerShell:
   ```powershell
   python --version
   ```
2. **Node.js 20+ & npm**
   Verify installation in PowerShell:
   ```powershell
   node --version
   npm --version
   ```
3. **MySQL Server 8.0 & MySQL Workbench**
   Ensure MySQL service is running:
   ```powershell
   Get-Service -Name *mysql*
   ```

---

### Step 1: MySQL Database Configuration in MySQL Workbench

1. Launch **MySQL Workbench**.
2. Connect to your local MySQL connection (typically `localhost:3306`, user `root`).
3. Open a SQL Query tab and execute:
   ```sql
   CREATE DATABASE IF NOT EXISTS ai_dev_agent CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
4. (Optional) Create a dedicated application user:
   ```sql
   CREATE USER IF NOT EXISTS 'ai_dev_user'@'localhost' IDENTIFIED BY 'Password123!';
   GRANT ALL PRIVILEGES ON ai_dev_agent.* TO 'ai_dev_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

---

### Step 2: Backend Setup & Virtual Environment

Open PowerShell in the project directory:

```powershell
# 1. Navigate to the backend directory
cd backend

# 2. Activate the virtual environment
.\venv\Scripts\Activate.ps1

# 3. Configure environment variables
# Copy .env.example to .env and configure your MySQL password
Copy-Item .env.example .env
```

Open `backend\.env` and ensure your database credentials match:
```env
APP_ENV=development
APP_SECRET_KEY=super_secure_random_elite_minds_jwt_secret_key_2026_change_in_production
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ai_dev_agent
DB_USER=root
DB_PASSWORD=your_mysql_password_here
AI_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key_here
AI_MODEL=gemini-2.0-flash
FRONTEND_ORIGIN=http://localhost:5173
```

Verify or initialize the MySQL database via the automated helper:
```powershell
python create_db.py
```

Apply database migrations via Alembic:
```powershell
alembic upgrade head
```

Run the backend server:
```powershell
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
- API Docs (Swagger): [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Health Check: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

---

### Step 3: Frontend Setup & Dev Server

In a new terminal window:

```powershell
# 1. Navigate to frontend directory
cd frontend

# 2. Run Vite development server
npm run dev
```

Open your browser at **[http://localhost:5173](http://localhost:5173)**.

---

## 5. Automated Testing Suite

The backend test suite runs in complete isolation using a dedicated SQLite in-memory engine and mocked LLM fixtures, guaranteeing zero destructive modifications to your local MySQL database.

To execute all 18 automated tests:

```powershell
cd backend
.\venv\Scripts\Activate.ps1
pytest -v
```

### Verified Test Results
```
============================= test session starts =============================
platform win32 -- Python 3.13.16, pytest-9.1.1
rootdir: C:\Users\chara\OneDrive\Desktop\Elite minds\backend
configfile: pytest.ini
collected 18 items

tests/test_auth.py::test_register_success PASSED                         [  5%]
tests/test_auth.py::test_register_duplicate_email PASSED                 [ 11%]
tests/test_auth.py::test_login_success PASSED                            [ 16%]
tests/test_auth.py::test_login_invalid_password PASSED                   [ 22%]
tests/test_auth.py::test_me_authenticated PASSED                         [ 27%]
tests/test_auth.py::test_me_unauthorized PASSED                          [ 33%]
tests/test_auth.py::test_logout PASSED                                   [ 38%]
tests/test_dashboard.py::test_dashboard_stats_and_activity PASSED        [ 44%]
tests/test_guidance.py::test_guidance_generation_and_specs PASSED        [ 50%]
tests/test_health.py::test_health_endpoint PASSED                        [ 55%]
tests/test_projects.py::test_create_project PASSED                       [ 61%]
tests/test_projects.py::test_list_projects_and_isolation PASSED          [ 66%]
tests/test_projects.py::test_project_ownership_forbidden_cross_access PASSED [ 72%]
tests/test_projects.py::test_delete_project_by_owner PASSED              [ 77%]
tests/test_requirements.py::test_analyze_requirement_workflow PASSED     [ 83%]
tests/test_reviews.py::test_code_review_analysis_and_export PASSED       [ 88%]
tests/test_tasks.py::test_task_generation_and_updates PASSED             [ 94%]
tests/test_tests.py::test_test_case_generation_and_export PASSED         [100%]

======================== 18 passed in 4.60s ========================
```

---

## 6. Repeatable Hackathon Demonstration Workflow

Follow these steps for the **Elite Minds Hackathon presentation**:

1. **Authentication:**
   - Navigate to `/login`.
   - Click **"Fill Demo User"** (fills `developer@eliteminds.ai` / `SecurePassword123!`).
   - Click **Sign In**.

2. **Project Management:**
   - Click **Create Project**.
   - Name: `Student Information Platform`.
   - Language: `Python`, Framework: `FastAPI`, Database: `MySQL`.
   - Click **Create Project**. Notice the project immediately sets as your active pipeline workspace.

3. **Requirement Analysis:**
   - Navigate to **Requirement Analyzer** from the sidebar.
   - Click **"Load Sample"** to populate the Student Management System requirement.
   - Click **Analyze Requirements**.
   - Inspect the structured output: Executive Summary, Functional Requirements with priority badges, User Roles & Permissions, and Implementation Phases.

4. **Task Planning & Kanban:**
   - Click **"Plan Tasks"** directly from the requirement result.
   - Click **Generate Tasks**.
   - Drag/toggle tasks between **To Do**, **In Progress**, and **Completed**. Refresh the page to demonstrate instant MySQL state persistence.

5. **Implementation Guidance:**
   - Click **Implementation Guide** in the sidebar.
   - Inspect the stack-tailored architecture blueprint: ASCII directory structure, MySQL DDL schema, REST API specification table, and copyable code examples.

6. **Automated Test Generation:**
   - Click **Test Case Generator**.
   - Click **Generate Test Cases**.
   - Review generated Positive, Negative, Boundary, and Security test cases.
   - Toggle an execution status to **"Passed"** or **"Failed"**.
   - Click **"Export CSV"** to download the test specification spreadsheet.

7. **Security Code Review:**
   - Navigate to **Code Review**.
   - Click **"Load Flawed Sample"** (loads intentionally flawed code with SQL injection and plaintext credential checks).
   - Click **Analyze & Audit Code**.
   - Inspect the **Critical SQL Injection** and **Plaintext Comparison** findings, remediation steps, and copyable corrected code.
   - Click **"Export Markdown"** to download the formal report.

8. **Dashboard KPI Refresh:**
   - Return to **Dashboard**.
   - Observe that all 5 metric cards, task status breakdown, code review severity distribution, and chronological audit activity feed are updated based on real stored records in MySQL.

---

## 7. Security & Reliability Highlights

- **Sandboxed Static Analysis:** Untrusted source code submitted for review is strictly analyzed statically and never executed.
- **Argon2 Password Hashing:** Salted, constant-time verification immune to dictionary attacks and timing leaks.
- **Tenant Isolation:** Enforced user-level project ownership verification on every single database query.
- **Fail-Safe AI Adapter:** Transparent indicator distinguishing live Gemini 2.0 execution from calibrated demo mode.
