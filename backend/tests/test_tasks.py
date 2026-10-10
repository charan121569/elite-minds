def test_task_generation_and_updates(client, auth_headers, test_project):
    payload = {
        "project_id": test_project.id,
        "replace_existing": False,
        "demo_mode": True
    }
    response = client.post("/api/tasks/generate", json=payload, headers=auth_headers)
    assert response.status_code == 201
    tasks = response.json()
    assert isinstance(tasks, list)
    assert len(tasks) > 0

    first_task = tasks[0]
    task_id = first_task["id"]
    assert "task_key" in first_task
    assert "priority" in first_task
    assert "complexity" in first_task

    # Update task status to In Progress
    up_res = client.put(f"/api/tasks/{task_id}", json={"status": "In Progress"}, headers=auth_headers)
    assert up_res.status_code == 200
    assert up_res.json()["status"] == "In Progress"

    # Verify project tasks list
    get_res = client.get(f"/api/projects/{test_project.id}/tasks", headers=auth_headers)
    assert get_res.status_code == 200
    assert len(get_res.json()) >= len(tasks)

    # Delete task
    del_res = client.delete(f"/api/tasks/{task_id}", headers=auth_headers)
    assert del_res.status_code == 200
