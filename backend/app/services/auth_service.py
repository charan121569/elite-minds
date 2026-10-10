from sqlalchemy.orm import Session
from sqlalchemy import select
from fastapi import HTTPException, status
from app.models.user import User
from app.schemas.auth import UserRegisterRequest, UserLoginRequest
from app.core.security import hash_password, verify_password, create_access_token

class AuthService:
    @staticmethod
    def register_user(db: Session, request: UserRegisterRequest) -> User:
        # Check if email is already taken
        stmt = select(User).where(User.email == request.email.lower().strip())
        existing = db.scalars(stmt).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A user with this email address already exists."
            )

        hashed = hash_password(request.password)
        new_user = User(
            email=request.email.lower().strip(),
            hashed_password=hashed,
            full_name=request.full_name.strip(),
            is_active=True
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user

    @staticmethod
    def authenticate_user(db: Session, request: UserLoginRequest) -> tuple[User, str]:
        stmt = select(User).where(User.email == request.email.lower().strip())
        user = db.scalars(stmt).first()
        if not user or not verify_password(request.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password."
            )
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This user account has been deactivated."
            )

        access_token = create_access_token(subject=str(user.id))
        return user, access_token

    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> User | None:
        return db.get(User, user_id)
