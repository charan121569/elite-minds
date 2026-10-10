import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database.base import Base
from app.database.session import get_db
from app.models.user import User
from app.models.project import Project
from app.core.security import hash_password, create_access_token

# Isolated SQLite in-memory engine for safe automated testing
TEST_DATABASE_URL = "sqlite:///:memory:"

test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)

@pytest.fixture
def db_session():
    connection = test_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    
    yield session

    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def test_user(db_session) -> User:
    user = User(
        email="developer@eliteminds.ai",
        hashed_password=hash_password("SecurePassword123!"),
        full_name="Lead Engineer",
        is_active=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture
def test_user_token(test_user) -> str:
    return create_access_token(subject=str(test_user.id))

@pytest.fixture
def auth_headers(test_user_token) -> dict:
    return {"Authorization": f"Bearer {test_user_token}"}

@pytest.fixture
def other_user(db_session) -> User:
    user = User(
        email="competitor@othercompany.io",
        hashed_password=hash_password("AnotherPassword456!"),
        full_name="External User",
        is_active=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture
def other_auth_headers(other_user) -> dict:
    token = create_access_token(subject=str(other_user.id))
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def test_project(db_session, test_user) -> Project:
    project = Project(
        user_id=test_user.id,
        name="Student Information Platform",
        description="Comprehensive university portal for students and faculty.",
        programming_language="Python",
        framework="FastAPI",
        database_preference="MySQL",
        status="active"
    )
    db_session.add(project)
    db_session.commit()
    db_session.refresh(project)
    return project
