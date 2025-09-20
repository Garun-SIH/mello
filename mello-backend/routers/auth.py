from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import get_db
from models import User, UserRole, CounselorStatus
from auth import get_current_user, get_admin_user

router = APIRouter()

class UserRegistration(BaseModel):
    firebase_uid: str
    email: str
    name: str
    age: int
    university: str
    preferred_language: str = "en"

class CounselorRegistration(BaseModel):
    firebase_uid: str
    email: str
    name: str
    specialization: str
    license_number: str
    phone_number: str
    address: str

class AdminRegistration(BaseModel):
    firebase_uid: str
    email: str
    name: str

@router.post("/register/user")
async def register_user(user_data: UserRegistration, db: Session = Depends(get_db)):
    """Register a new user"""
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.firebase_uid == user_data.firebase_uid).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="User already registered")
        
        # Create new user
        new_user = User(
            firebase_uid=user_data.firebase_uid,
            email=user_data.email,
            name=user_data.name,
            role=UserRole.USER,
            age=user_data.age,
            university=user_data.university,
            preferred_language=user_data.preferred_language
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        return {"message": "User registered successfully", "user_id": new_user.id}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@router.post("/register/counselor")
async def register_counselor(counselor_data: CounselorRegistration, db: Session = Depends(get_db)):
    """Register a new counselor (pending approval)"""
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.firebase_uid == counselor_data.firebase_uid).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="User already registered")
        
        # Create new counselor (pending approval)
        new_counselor = User(
            firebase_uid=counselor_data.firebase_uid,
            email=counselor_data.email,
            name=counselor_data.name,
            role=UserRole.COUNSELOR,
            specialization=counselor_data.specialization,
            license_number=counselor_data.license_number,
            phone_number=counselor_data.phone_number,
            address=counselor_data.address,
            counselor_status=CounselorStatus.PENDING
        )
        
        db.add(new_counselor)
        db.commit()
        db.refresh(new_counselor)
        
        return {"message": "Counselor registration submitted for approval", "user_id": new_counselor.id}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@router.post("/register/admin")
async def register_admin(
    admin_data: AdminRegistration, 
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_admin_user)
):
    """Register a new admin (only existing admins can create new admins)"""
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.firebase_uid == admin_data.firebase_uid).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="User already registered")
        
        # Create new admin
        new_admin = User(
            firebase_uid=admin_data.firebase_uid,
            email=admin_data.email,
            name=admin_data.name,
            role=UserRole.ADMIN
        )
        
        db.add(new_admin)
        db.commit()
        db.refresh(new_admin)
        
        return {"message": "Admin registered successfully", "user_id": new_admin.id}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@router.get("/profile")
async def get_profile(current_user: User = Depends(get_current_user)):
    """Get current user profile"""
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role.value,
        "age": current_user.age,
        "university": current_user.university,
        "specialization": current_user.specialization,
        "counselor_status": current_user.counselor_status.value if current_user.counselor_status else None,
        "created_at": current_user.created_at
    }

@router.put("/profile")
async def update_profile(
    profile_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user profile"""
    try:
        # Update allowed fields based on role
        if current_user.role == UserRole.USER:
            allowed_fields = ["name", "age", "university", "preferred_language"]
        elif current_user.role == UserRole.COUNSELOR:
            allowed_fields = ["name", "phone_number", "address"]
        else:
            allowed_fields = ["name"]
        
        for field, value in profile_data.items():
            if field in allowed_fields and hasattr(current_user, field):
                setattr(current_user, field, value)
        
        db.commit()
        return {"message": "Profile updated successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Profile update failed: {str(e)}")
