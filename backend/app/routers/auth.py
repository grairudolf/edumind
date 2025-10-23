from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timedelta
from typing import Optional
import asyncio

from app.core.database import get_db
from app.models.user import User
from app.core.config import get_settings
from app.services.auth_service import AuthService

router = APIRouter()
settings = get_settings()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
auth_service = AuthService()

@router.post("/register")
async def register_user(
    user_data: dict,
    db: AsyncSession = Depends(get_db)
):
    """Register a new user"""
    try:
        email = user_data.get("email")
        username = user_data.get("username")
        password = user_data.get("password")
        full_name = user_data.get("full_name")
        role = user_data.get("role", "student")

        if not email or not username or not password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email, username, and password are required"
            )

        # Check if user already exists
        result = await db.execute(
            select(User).where(
                (User.email == email) | (User.username == username)
            )
        )
        existing_user = result.scalar_one_or_none()

        if existing_user:
            if existing_user.email == email:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered"
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Username already taken"
                )

        # Create new user
        hashed_password = auth_service.get_password_hash(password)
        new_user = User(
            email=email,
            username=username,
            hashed_password=hashed_password,
            full_name=full_name,
            role=role,
            is_active=True,
            is_verified=False
        )

        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)

        # Generate access token
        access_token = auth_service.create_access_token(
            data={"sub": str(new_user.id)}
        )

        return {
            "message": "User registered successfully",
            "user": {
                "id": new_user.id,
                "email": new_user.email,
                "username": new_user.username,
                "full_name": new_user.full_name,
                "role": new_user.role
            },
            "access_token": access_token,
            "token_type": "bearer"
        }

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error registering user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to register user"
        )

@router.post("/login")
async def login_user(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    """Login user and return access token"""
    try:
        # Find user by email or username
        result = await db.execute(
            select(User).where(
                (User.email == form_data.username) |
                (User.username == form_data.username)
            )
        )
        user = result.scalar_one_or_none()

        if not user or not auth_service.verify_password(form_data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inactive user"
            )

        # Update last login
        user.last_login = datetime.utcnow()
        await db.commit()

        # Generate access token
        access_token = auth_service.create_access_token(
            data={"sub": str(user.id)}
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "full_name": user.full_name,
                "role": user.role,
                "language_preference": user.language_preference,
                "learning_style": user.learning_style
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error logging in user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to login"
        )

@router.get("/me")
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """Get current user information"""
    return {
        "id": current_user.id,
        "email": current_user.email,
        "username": current_user.username,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "language_preference": current_user.language_preference,
        "learning_style": current_user.learning_style,
        "is_active": current_user.is_active,
        "is_verified": current_user.is_verified,
        "profile_image": current_user.profile_image,
        "school": current_user.school,
        "grade_level": current_user.grade_level,
        "subjects": current_user.subjects,
        "created_at": current_user.created_at.isoformat() if current_user.created_at else None
    }

@router.put("/me")
async def update_user_profile(
    user_data: dict,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update user profile"""
    try:
        # Update allowed fields
        allowed_fields = [
            "full_name", "language_preference", "learning_style",
            "profile_image", "school", "grade_level", "subjects"
        ]

        for field in allowed_fields:
            if field in user_data:
                setattr(current_user, field, user_data[field])

        current_user.updated_at = datetime.utcnow()
        await db.commit()
        await db.refresh(current_user)

        return {
            "message": "Profile updated successfully",
            "user": await get_current_user_info(current_user)
        }

    except Exception as e:
        await db.rollback()
        logger.error(f"Error updating user profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile"
        )

@router.post("/forgot-password")
async def forgot_password(
    email_data: dict,
    db: AsyncSession = Depends(get_db)
):
    """Send password reset email"""
    try:
        email = email_data.get("email")
        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is required"
            )

        # Check if user exists
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()

        if not user:
            # Don't reveal if email exists or not for security
            return {"message": "If the email exists, a password reset link has been sent"}

        # Generate password reset token
        reset_token = auth_service.create_access_token(
            data={"sub": str(user.id), "type": "reset"},
            expires_delta=timedelta(hours=1)
        )

        # Here you would send the email with the reset token
        # For now, just return success
        return {
            "message": "If the email exists, a password reset link has been sent",
            "reset_token": reset_token  # Remove this in production
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in forgot password: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process password reset request"
        )

@router.post("/reset-password")
async def reset_password(
    reset_data: dict,
    db: AsyncSession = Depends(get_db)
):
    """Reset password with token"""
    try:
        token = reset_data.get("token")
        new_password = reset_data.get("new_password")

        if not token or not new_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Token and new password are required"
            )

        # Verify token and get user
        payload = auth_service.verify_token(token)
        if not payload or payload.get("type") != "reset":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid reset token"
            )

        user_id = payload.get("sub")
        result = await db.execute(select(User).where(User.id == int(user_id)))
        user = result.scalar_one_or_none()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User not found"
            )

        # Update password
        user.hashed_password = auth_service.get_password_hash(new_password)
        await db.commit()

        return {"message": "Password reset successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error resetting password: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to reset password"
        )
