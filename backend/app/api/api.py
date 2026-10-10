from fastapi import APIRouter
from app.api.routes import auth, projects, requirements, tasks, guidance, tests, reviews, dashboard, system

api_router = APIRouter()

api_router.include_router(system.router)
api_router.include_router(auth.router)
api_router.include_router(projects.router)
api_router.include_router(requirements.router)
api_router.include_router(tasks.router)
api_router.include_router(guidance.router)
api_router.include_router(tests.router)
api_router.include_router(reviews.router)
api_router.include_router(dashboard.router)
