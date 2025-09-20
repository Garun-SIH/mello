from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from pydantic import BaseModel

from database import get_db
from models import Booking, User, UserRole, CounselorStatus
from auth import get_current_user

router = APIRouter()

class BookingCreate(BaseModel):
    counselor_id: int
    preferred_datetime: datetime
    issue_description: str
    urgency: str = "medium"

class BookingResponse(BaseModel):
    id: int
    user_id: int
    counselor_id: int
    preferred_datetime: datetime
    status: str
    issue_description: str
    urgency: str
    counselor_name: str

class CounselorResponse(BaseModel):
    id: int
    name: str
    specialization: str
    email: str

@router.get("/counselors")
async def get_counselors(db: Session = Depends(get_db)):
    """Get all available counselors"""
    counselors = db.query(User).filter(
        User.role == UserRole.COUNSELOR,
        User.counselor_status == CounselorStatus.APPROVED
    ).all()
    
    return [{
        "id": counselor.id,
        "name": counselor.name,
        "specialization": counselor.specialization,
        "email": counselor.email
    } for counselor in counselors]

@router.post("/book")
async def create_booking(
    booking: BookingCreate, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new counseling session booking"""
    try:
        # Check if counselor exists and is approved
        counselor = db.query(User).filter(
            User.id == booking.counselor_id,
            User.role == UserRole.COUNSELOR,
            User.counselor_status == CounselorStatus.APPROVED
        ).first()
        
        if not counselor:
            raise HTTPException(status_code=404, detail="Counselor not found or not approved")
        
        # Check for conflicting bookings
        existing_booking = db.query(Booking).filter(
            Booking.counselor_id == booking.counselor_id,
            Booking.preferred_datetime == booking.preferred_datetime,
            Booking.status.in_(["pending", "confirmed"])
        ).first()
        
        if existing_booking:
            raise HTTPException(status_code=400, detail="Time slot already booked")
        
        # Create booking
        new_booking = Booking(
            user_id=current_user.id,
            counselor_id=booking.counselor_id,
            preferred_datetime=booking.preferred_datetime,
            issue_description=booking.issue_description,
            urgency=booking.urgency,
            status="pending"
        )
        
        db.add(new_booking)
        db.commit()
        db.refresh(new_booking)
        
        return {
            "id": new_booking.id,
            "user_id": new_booking.user_id,
            "counselor_id": new_booking.counselor_id,
            "preferred_datetime": new_booking.preferred_datetime,
            "status": new_booking.status,
            "issue_description": new_booking.issue_description,
            "urgency": new_booking.urgency,
            "counselor_name": counselor.name
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating booking: {str(e)}")

@router.get("/my-bookings")
async def get_my_bookings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all bookings for current user"""
    bookings = db.query(Booking).filter(Booking.user_id == current_user.id).all()
    
    result = []
    for booking in bookings:
        counselor = db.query(User).filter(User.id == booking.counselor_id).first()
        result.append({
            "id": booking.id,
            "user_id": booking.user_id,
            "counselor_id": booking.counselor_id,
            "preferred_datetime": booking.preferred_datetime,
            "status": booking.status,
            "issue_description": booking.issue_description,
            "urgency": booking.urgency,
            "counselor_name": counselor.name if counselor else "Unknown",
            "notes": booking.notes
        })
    
    return result

@router.put("/bookings/{booking_id}/status")
async def update_booking_status(
    booking_id: int, 
    status: str, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update booking status (for counselor/admin use)"""
    valid_statuses = ["pending", "confirmed", "completed", "cancelled"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Check permissions
    if current_user.role == UserRole.USER and booking.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this booking")
    elif current_user.role == UserRole.COUNSELOR and booking.counselor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this booking")
    
    booking.status = status
    db.commit()
    
    return {"message": "Booking status updated successfully"}

@router.get("/counselors/{counselor_id}/available-slots")
async def get_available_slots(counselor_id: int, db: Session = Depends(get_db)):
    """Get available time slots for a counselor"""
    counselor = db.query(User).filter(
        User.id == counselor_id,
        User.role == UserRole.COUNSELOR,
        User.counselor_status == CounselorStatus.APPROVED
    ).first()
    
    if not counselor:
        raise HTTPException(status_code=404, detail="Counselor not found")
    
    # Get existing bookings
    existing_bookings = db.query(Booking).filter(
        Booking.counselor_id == counselor_id,
        Booking.status.in_(["pending", "confirmed"]),
        Booking.preferred_datetime >= datetime.now()
    ).all()
    
    booked_slots = [booking.preferred_datetime for booking in existing_bookings]
    
    # Generate available slots for next 7 days (9 AM to 5 PM)
    available_slots = []
    for day in range(7):
        date = datetime.now().date() + timedelta(days=day)
        for hour in range(9, 17):  # 9 AM to 5 PM
            slot_time = datetime.combine(date, datetime.min.time().replace(hour=hour))
            if slot_time not in booked_slots and slot_time > datetime.now():
                available_slots.append(slot_time)
    
    return {"available_slots": available_slots}
