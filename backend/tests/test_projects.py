def test_create_project(client, auth_headers):
    payload = {
        "name": "E-Commerce Gateway",
        "description": "Payment microservices architecture",
        "programming_language": "TypeScript",
        "framework": "Next.js",
        "database_preference": "PostgreSQL",
        "status": "active"
    }
    response = client.post("/api/projects", json=payload, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "E-Commerce Gateway"
    assert data["framework"] == "Next.js"

def test_list_projects_and_isolation(client, auth_headers, other_auth_headers, test_project):
    # Test user can see their own project
    res1 = client.get("/api/projects", headers=auth_headers)
    assert res1.status_code == 200
    ids = [p["id"] for p in res1.json()]
    assert test_project.id in ids

    # Other user CANNOT see test user's project
    res2 = client.get("/api/projects", headers=other_auth_headers)
    assert res2.status_code == 200
    other_ids = [p["id"] for p in res2.json()]
    assert test_project.id not in other_ids

def test_project_ownership_forbidden_cross_access(client, other_auth_headers, test_project):
    # Other user attempts to GET project detail -> 403 Forbidden
    res = client.get(f"/api/projects/{test_project.id}", headers=other_auth_headers)
    assert res.status_code == 403

    # Other user attempts to UPDATE project -> 403 Forbidden
    res_update = client.put(f"/api/projects/{test_project.id}", json={"name": "Hacked Title"}, headers=other_auth_headers)
    assert res_update.status_code == 403

    # Other user attempts to DELETE project -> 403 Forbidden
    res_del = client.delete(f"/api/projects/{test_project.id}", headers=other_auth_headers)
    assert res_del.status_code == 403

def test_delete_project_by_owner(client, auth_headers, test_project):
    res = client.delete(f"/api/projects/{test_project.id}", headers=auth_headers)
    assert res.status_code == 200
    assert "deleted successfully" in res.json()["message"]
