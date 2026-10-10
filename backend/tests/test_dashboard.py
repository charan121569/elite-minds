def test_dashboard_stats_and_activity(client, auth_headers, test_project):
    # Stats endpoint returns real aggregations
    res = client.get("/api/dashboard/stats", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert "total_projects" in data
    assert data["total_projects"] >= 1
    assert "task_status_distribution" in data
    assert "review_severity_distribution" in data
    assert "recent_projects" in data

    # Activity endpoint returns chronological logs
    act_res = client.get("/api/dashboard/activity", headers=auth_headers)
    assert act_res.status_code == 200
    activities = act_res.json()
    assert isinstance(activities, list)
