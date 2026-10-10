from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.auth import UserRegisterRequest, UserLoginRequest, UserResponse, TokenResponse
from app.services.auth_service import AuthService
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(request: UserRegisterRequest, response: Response, db: Session = Depends(get_db)):
    user = AuthService.register_user(db, request)
    user, token = AuthService.authenticate_user(db, UserLoginRequest(email=request.email, password=request.password))
    
    # Set HttpOnly cookie for security
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        max_age=86400,
        samesite="lax",
        secure=False # Set True in HTTPS production
    )
    
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.post("/login", response_model=TokenResponse)
def login(request: UserLoginRequest, response: Response, db: Session = Depends(get_db)):
    user, token = AuthService.authenticate_user(db, request)
    
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        max_age=86400,
        samesite="lax",
        secure=False
    )

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key="access_token")
    return {"message": "Successfully logged out."}

@router.get("/me", response_model=UserResponse)
def get_current_profile(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)
