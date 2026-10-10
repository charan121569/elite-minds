def test_code_review_analysis_and_export(client, auth_headers, test_project):
    flawed_code = """
import sqlite3

def login_user(email, password):
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()
    # Flawed SQL Injection
    query = f"SELECT * FROM users WHERE email='{email}'"
    cursor.execute(query)
    user = cursor.fetchone()
    # Flawed plaintext check
    if user and user[2] == password:
        return True
    return False
"""
    payload = {
        "project_id": test_project.id,
        "source_code": flawed_code,
        "language": "Python",
        "file_name": "auth_controller.py",
        "demo_mode": True
    }
    response = client.post("/api/reviews/analyze", json=payload, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert "summary" in data
    assert "findings" in data
    assert len(data["findings"]) > 0

    review_id = data["id"]

    # Retrieve review
    get_res = client.get(f"/api/reviews/{review_id}", headers=auth_headers)
    assert get_res.status_code == 200
    assert get_res.json()["id"] == review_id

    # Export Markdown
    md_res = client.get(f"/api/reviews/{review_id}/export", headers=auth_headers)
    assert md_res.status_code == 200
    assert "text/markdown" in md_res.headers["content-type"]
    assert "# AI Code Review Report" in md_res.text
    assert "CRITICAL" in md_res.text or "HIGH" in md_res.text
