def test_test_case_generation_and_export(client, auth_headers, test_project):
    payload = {
        "project_id": test_project.id,
        "demo_mode": True
    }
    response = client.post("/api/tests/generate", json=payload, headers=auth_headers)
    assert response.status_code == 201
    tests = response.json()
    assert isinstance(tests, list)
    assert len(tests) > 0

    first_test = tests[0]
    test_id = first_test["id"]
    assert first_test["execution_status"] == "Not Run"

    # Update execution status to Passed
    up_res = client.put(f"/api/tests/{test_id}", json={"execution_status": "Passed"}, headers=auth_headers)
    assert up_res.status_code == 200
    assert up_res.json()["execution_status"] == "Passed"

    # Export CSV
    csv_res = client.get(f"/api/projects/{test_project.id}/tests/export", headers=auth_headers)
    assert csv_res.status_code == 200
    assert "text/csv" in csv_res.headers["content-type"]
    assert "Key,Title,Category" in csv_res.text
    assert first_test["test_key"] in csv_res.text
