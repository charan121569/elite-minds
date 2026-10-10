def test_health_endpoint(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "database_connected" in data
    assert "ai_provider" in data
    assert "ai_configured" in data
    assert "app_env" in data
