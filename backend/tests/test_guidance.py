def test_guidance_generation_and_specs(client, auth_headers, test_project):
    payload = {
        "project_id": test_project.id,
        "custom_focus": "FastAPI REST controllers and MySQL schema",
        "demo_mode": True
    }
    response = client.post("/api/guidance/generate", json=payload, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert "title" in data
    assert "architecture_overview" in data
    assert isinstance(data["api_specifications"], list)
    assert isinstance(data["code_examples"], list)
    assert len(data["code_examples"]) > 0

    # Retrieve guidance list for project
    list_res = client.get(f"/api/projects/{test_project.id}/guidance", headers=auth_headers)
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1
