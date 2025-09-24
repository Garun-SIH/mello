import firebase_admin
from database import get_db
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from firebase_admin import auth
from firebase_config import initialize_firebase
from models import User, UserRole
from sqlalchemy.orm import Session

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    """Verify Firebase token and return current user"""
    try:
        # Check if Firebase is initialized
        try:
            firebase_admin.get_app()
        except ValueError:
            # Firebase not initialized, try to initialize
            if not initialize_firebase():
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="Authentication service unavailable",
                )

        # Verify the Firebase token
        decoded_token = auth.verify_id_token(credentials.credentials)
        firebase_uid = decoded_token["uid"]

        # Get user from database
        user = db.query(User).filter(User.firebase_uid == firebase_uid).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )

        return user

    except auth.InvalidIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Firebase token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except auth.ExpiredIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Expired Firebase token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        from firebase_config import safe_print

        safe_print(f"Authentication error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_admin_user(current_user: User = Depends(get_current_user)) -> User:
    """Require admin role"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required"
        )
    return current_user


async def get_counselor_user(current_user: User = Depends(get_current_user)) -> User:
    """Require counselor role"""
    if current_user.role != UserRole.COUNSELOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Counselor access required"
        )
    return current_user


async def get_user_or_counselor(current_user: User = Depends(get_current_user)) -> User:
    """Allow both user and counselor roles"""
    if current_user.role not in [UserRole.USER, UserRole.COUNSELOR]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User or counselor access required",
        )
    return current_user
