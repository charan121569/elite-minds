def test_register_success(client):
    payload = {
        "email": "newuser@eliteminds.ai",
        "password": "StrongPassword123!",
        "full_name": "New Developer"
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "newuser@eliteminds.ai"
    assert "hashed_password" not in data["user"]

def test_register_duplicate_email(client, test_user):
    payload = {
        "email": test_user.email,
        "password": "AnyPassword123!",
        "full_name": "Duplicate User"
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 409
    assert "already exists" in response.json()["detail"]

def test_login_success(client, test_user):
    payload = {
        "email": test_user.email,
        "password": "SecurePassword123!"
    }
    response = client.post("/api/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == test_user.email

def test_login_invalid_password(client, test_user):
    payload = {
        "email": test_user.email,
        "password": "WrongPassword!"
    }
    response = client.post("/api/auth/login", json=payload)
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]

def test_me_authenticated(client, auth_headers, test_user):
    response = client.get("/api/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_user.id
    assert data["email"] == test_user.email

def test_me_unauthorized(client):
    response = client.get("/api/auth/me")
    assert response.status_code == 401

def test_logout(client):
    response = client.post("/api/auth/logout")
    assert response.status_code == 200
    assert "Successfully logged out" in response.json()["message"]
