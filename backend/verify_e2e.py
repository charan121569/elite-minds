"""
End-to-End Verification Script
Tests all 14 required workflows against the live running FastAPI server,
real MySQL database, and AI pipeline.
"""
import httpx
import pymysql
import sys

BASE_URL = "http://127.0.0.1:8000/api"

def run_tests():
    print("=" * 60)
    print("STARTING END-TO-END VERIFICATION ON LIVE APPLICATION")
    print("=" * 60)

    client = httpx.Client(base_url=BASE_URL, timeout=30.0)

    # 1. Health Endpoint
    print("\n[1] Testing Health Endpoint...")
    res = client.get("/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    health_data = res.json()
    print(" -> Health response:", health_data)
    assert health_data["database_connected"] is True, "Database is not connected!"

    # 2. User Registration
    print("\n[2] Testing User Registration...")
    reg_payload = {
        "email": "e2e_lead@eliteminds.ai",
        "password": "SecurePassword123!",
        "full_name": "E2E Lead Engineer"
    }
    # If already exists from earlier run, login directly
    res = client.post("/auth/register", json=reg_payload)
    if res.status_code == 409:
        print(" -> User already registered. Proceeding to login.")
    else:
        assert res.status_code == 201, f"Registration failed: {res.text}"
        print(" -> User registration successful.")

    # 3. User Login
    print("\n[3] Testing User Login...")
    login_payload = {
        "email": "e2e_lead@eliteminds.ai",
        "password": "SecurePassword123!"
    }
    res = client.post("/auth/login", json=login_payload)
    assert res.status_code == 200, f"Login failed: {res.text}"
    token_data = res.json()
    token = token_data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print(f" -> Login successful. User ID: {token_data['user']['id']}")

    # 4. Session Profile (/auth/me)
    print("\n[4] Testing /auth/me Profile...")
    res = client.get("/auth/me", headers=headers)
    assert res.status_code == 200, f"Profile query failed: {res.text}"
    print(f" -> Profile verified: {res.json()['full_name']} ({res.json()['email']})")

    # 5. Project Creation
    print("\n[5] Testing Project Creation...")
    proj_payload = {
        "name": "Student Management System",
        "description": "Production-grade educational portal with roles and dashboard",
        "programming_language": "Python",
        "framework": "FastAPI",
        "database_preference": "MySQL",
        "status": "active"
    }
    res = client.post("/projects", json=proj_payload, headers=headers)
    assert res.status_code == 201, f"Project creation failed: {res.text}"
    project = res.json()
    project_id = project["id"]
    print(f" -> Project created in MySQL with ID: {project_id}")

    # 6. Requirement Analysis
    print("\n[6] Testing Requirement Analysis...")
    req_payload = {
        "project_id": project_id,
        "title": "Student Registration & Onboarding Lifecycle",
        "raw_requirement": "Build a student management system with student registration, secure login, role-based access, student CRUD operations, input validation, and a dashboard.",
        "constraints": "Strict MySQL transactions and password hashing with Argon2.",
        "acceptance_criteria": "Passwords must be at least 8 chars. Reject duplicate roll numbers."
    }
    res = client.post("/requirements/analyze", json=req_payload, headers=headers)
    assert res.status_code == 201, f"Requirement analysis failed: {res.text}"
    req_result = res.json()
    req_id = req_result["id"]
    ai_provider_header = res.headers.get("x-ai-generated-by", "Unknown")
    print(f" -> Requirement analyzed successfully! ID: {req_id} (Engine: {ai_provider_header})")
    print(f" -> Functional Requirements extracted: {len(req_result.get('functional_requirements', []))}")
    print(f" -> User Roles extracted: {len(req_result.get('user_roles', []))}")
    print(f" -> Implementation Phases: {len(req_result.get('suggested_phases', []))}")

    # 7. Task Planning & Generation
    print("\n[7] Testing Development Task Planning...")
    task_gen_payload = {
        "project_id": project_id,
        "requirement_id": req_id,
        "replace_existing": False
    }
    res = client.post("/tasks/generate", json=task_gen_payload, headers=headers)
    assert res.status_code == 201, f"Task generation failed: {res.text}"
    tasks = res.json()
    assert len(tasks) > 0, "No tasks were generated!"
    print(f" -> Generated {len(tasks)} tasks in MySQL.")
    
    first_task = tasks[0]
    task_id = first_task["id"]
    print(f" -> First task: {first_task['task_key']} - '{first_task['title']}' (Status: {first_task['status']})")

    # Update Task Status
    res = client.put(f"/tasks/{task_id}", json={"status": "In Progress"}, headers=headers)
    assert res.status_code == 200, f"Task update failed: {res.text}"
    assert res.json()["status"] == "In Progress", "Task status was not updated!"
    print(" -> Task status successfully updated to 'In Progress'.")

    # 8. Technical Implementation Guidance
    print("\n[8] Testing Implementation Guidance Generation...")
    guidance_payload = {
        "project_id": project_id,
        "custom_focus": "FastAPI REST endpoints and MySQL schema"
    }
    res = client.post("/guidance/generate", json=guidance_payload, headers=headers)
    assert res.status_code == 201, f"Guidance generation failed: {res.text}"
    guide = res.json()
    print(f" -> Implementation Guide created: '{guide['title']}'")
    print(f" -> API Specifications included: {len(guide.get('api_specifications', []))}")
    print(f" -> Code Examples generated: {len(guide.get('code_examples', []))}")

    # 9. Test Case Generation & CSV Export
    print("\n[9] Testing Test Case Generation & CSV Export...")
    test_gen_payload = {
        "project_id": project_id,
        "requirement_id": req_id
    }
    res = client.post("/tests/generate", json=test_gen_payload, headers=headers)
    assert res.status_code == 201, f"Test generation failed: {res.text}"
    test_cases = res.json()
    assert len(test_cases) > 0, "No test cases generated!"
    print(f" -> Generated {len(test_cases)} test cases in MySQL.")

    first_test = test_cases[0]
    test_id = first_test["id"]
    
    # Update Execution Status to Passed
    res = client.put(f"/tests/{test_id}", json={"execution_status": "Passed"}, headers=headers)
    assert res.status_code == 200
    assert res.json()["execution_status"] == "Passed"
    print(" -> Updated test execution status to 'Passed'.")

    # CSV Export
    res = client.get(f"/projects/{project_id}/tests/export", headers=headers)
    assert res.status_code == 200, f"CSV export failed: {res.text}"
    assert "text/csv" in res.headers["content-type"]
    assert "Key,Title,Category" in res.text
    print(f" -> CSV export verified ({len(res.text)} bytes).")

    # 10. AI Code Review & Markdown Export
    print("\n[10] Testing AI Code Review & Markdown Export...")
    flawed_code = '''
import sqlite3

def authenticate(email, password):
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()
    # CRITICAL: SQL Injection vulnerability
    query = f"SELECT * FROM users WHERE email='{email}'"
    cursor.execute(query)
    user = cursor.fetchone()
    # HIGH: Plaintext password check
    if user and user[2] == password:
        return True
    return False
'''
    review_payload = {
        "project_id": project_id,
        "source_code": flawed_code,
        "language": "Python",
        "file_name": "student_auth.py"
    }
    res = client.post("/reviews/analyze", json=review_payload, headers=headers)
    assert res.status_code == 201, f"Code review failed: {res.text}"
    review = res.json()
    review_id = review["id"]
    findings = review.get("findings", [])
    print(f" -> Code review audit completed. Overall Assessment: {review['overall_assessment']}")
    print(f" -> Security Findings: {len(findings)}")
    for f in findings:
        print(f"    - [{f['severity']}] {f['title']} ({f['category']})")

    # Markdown Export
    res = client.get(f"/reviews/{review_id}/export", headers=headers)
    assert res.status_code == 200
    assert "text/markdown" in res.headers["content-type"]
    assert "# AI Code Review Report" in res.text
    print(f" -> Markdown export verified ({len(res.text)} bytes).")

    # 11. Dashboard Metrics Verification
    print("\n[11] Verifying Real MySQL Dashboard Statistics...")
    res = client.get("/dashboard/stats", headers=headers)
    assert res.status_code == 200
    stats = res.json()
    print(" -> Live Dashboard Metrics:")
    print(f"    Total Projects: {stats['total_projects']}")
    print(f"    Total Requirements: {stats['total_requirements']}")
    print(f"    Total Tasks: {stats['total_tasks']}")
    print(f"    Total Test Cases: {stats['total_test_cases']}")
    print(f"    Total Code Reviews: {stats['total_code_reviews']}")
    print(f"    Task Status Breakdown: {stats['task_status_distribution']}")
    print(f"    Finding Severity Breakdown: {stats['review_severity_distribution']}")
    assert stats["total_projects"] >= 1
    assert stats["total_requirements"] >= 1
    assert stats["total_tasks"] >= 1

    # 12. Activity Audit Log
    print("\n[12] Verifying Activity Audit Log...")
    res = client.get("/dashboard/activity", headers=headers)
    assert res.status_code == 200
    acts = res.json()
    print(f" -> Recent audit activity items: {len(acts)}")
    for act in acts[:3]:
        print(f"    - [{act['action_type']}] {act['description']}")

    # 13. Tenant Isolation / Access Control Security Check
    print("\n[13] Testing Cross-Tenant Authorization Isolation...")
    comp_payload = {
        "email": "competitor@external.org",
        "password": "CompPassword123!",
        "full_name": "External Competitor"
    }
    client.post("/auth/register", json=comp_payload)
    login_res = client.post("/auth/login", json={"email": comp_payload["email"], "password": comp_payload["password"]})
    comp_token = login_res.json()["access_token"]
    comp_headers = {"Authorization": f"Bearer {comp_token}"}

    # Attempt to read first user's project
    forbidden_res = client.get(f"/projects/{project_id}", headers=comp_headers)
    assert forbidden_res.status_code == 403, f"Expected 403 Forbidden, got {forbidden_res.status_code}"
    print(" -> Verified 403 Forbidden on cross-user project access attempt.")

    # 14. Code-Driven Adaptive Test Case Calibration
    print("\n[14] Testing Code-Driven Adaptive Test Case Modification...")
    implemented_code = '''
def register_student(first_name: str, last_name: str, email: str, department: str, enrollment_number: str) -> dict:
    if not email or "@" not in email:
        raise ValueError("Invalid email format")
    return {"id": 101, "enrollment_number": enrollment_number, "status": "active"}
'''
    adapt_payload = {
        "project_id": project_id,
        "implemented_code": implemented_code,
        "language": "python",
        "auto_apply": True,
        "demo_mode": True
    }
    adapt_res = client.post("/tests/adapt", json=adapt_payload, headers=headers)
    assert adapt_res.status_code == 200, f"Adaptive test modification failed: {adapt_res.text}"
    adapt_data = adapt_res.json()
    assert len(adapt_data.get("adapted_tests", [])) > 0, "No tests adapted!"
    assert adapt_data["applied_to_db"] is True, "Expected auto_apply to save to database!"
    print(f" -> Successfully adapted and calibrated {len(adapt_data['adapted_tests'])} test cases to implemented code!")

    # 15. MySQL Direct Database Verification
    print("\n[15] Direct Database Query on MySQL ai_dev_agent...")
    db_conn = pymysql.connect(host="localhost", port=3306, user="root", password="9100", database="ai_dev_agent")
    with db_conn.cursor() as cur:
        for tbl in ['users', 'projects', 'requirements', 'development_tasks', 'implementation_guides', 'test_cases', 'code_reviews', 'activity_logs']:
            cur.execute(f"SELECT COUNT(*) FROM `{tbl}`")
            cnt = cur.fetchone()[0]
            print(f"    Table `{tbl}`: {cnt} records")
            assert cnt > 0, f"Table `{tbl}` has 0 records!"
    db_conn.close()

    print("\n" + "=" * 60)
    print("ALL 15 END-TO-END WORKFLOW TESTS COMPLETED AND PASSED!")
    print("=" * 60)


if __name__ == "__main__":
    run_tests()
