def test_analyze_requirement_workflow(client, auth_headers, test_project):
    payload = {
        "project_id": test_project.id,
        "title": "Student Registration & Onboarding Module",
        "raw_requirement": "Build a student management system with student registration, secure login, role-based access, student CRUD operations, input validation, and a dashboard.",
        "constraints": "Strict MySQL transactions and password hashing with Argon2.",
        "acceptance_criteria": "Passwords must be at least 8 chars.",
        "demo_mode": True
    }
    response = client.post("/api/requirements/analyze", json=payload, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == payload["title"]
    assert "summary" in data and len(data["summary"]) > 0
    assert "problem_statement" in data
    assert isinstance(data["functional_requirements"], list)
    assert len(data["functional_requirements"]) > 0
    assert isinstance(data["user_roles"], list)
    assert isinstance(data["suggested_phases"], list)

    req_id = data["id"]

    # Verify retrieval
    get_res = client.get(f"/api/requirements/{req_id}", headers=auth_headers)
    assert get_res.status_code == 200
    assert get_res.json()["id"] == req_id

    # Verify project list
    list_res = client.get(f"/api/projects/{test_project.id}/requirements", headers=auth_headers)
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1
