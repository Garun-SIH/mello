from typing import Optional

from auth import get_current_user
from database import get_db
from fastapi import APIRouter, Depends, HTTPException
from models import Booking, Feedback, User
from pydantic import BaseModel
from sqlalchemy.orm import Session

router = APIRouter()


class FeedbackCreate(BaseModel):
    counselor_id: int
    booking_id: int
    rating: int  # 1-5 scale
    comments: Optional[str] = None
    feedback_type: str = "session"  # session, general
    helpful_aspects: Optional[str] = None
    improvement_suggestions: Optional[str] = None
    would_recommend: Optional[bool] = None


@router.post("/")
async def create_feedback(
    feedback_data: FeedbackCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create feedback for a counselor"""
    # Verify the booking exists and belongs to the user
    booking = (
        db.query(Booking)
        .filter(
            Booking.id == feedback_data.booking_id,
            Booking.user_id == current_user.id,
            Booking.counselor_id == feedback_data.counselor_id,
        )
        .first()
    )

    if not booking:
        raise HTTPException(
            status_code=404, detail="Booking not found or not authorized"
        )

    # Check if feedback already exists for this booking
    existing_feedback = (
        db.query(Feedback)
        .filter(Feedback.booking_id == feedback_data.booking_id)
        .first()
    )

    if existing_feedback:
        raise HTTPException(
            status_code=400, detail="Feedback already exists for this booking"
        )

    new_feedback = Feedback(
        user_id=current_user.id,
        counselor_id=feedback_data.counselor_id,
        booking_id=feedback_data.booking_id,
        rating=feedback_data.rating,
        comments=feedback_data.comments,
        feedback_type=feedback_data.feedback_type,
        helpful_aspects=feedback_data.helpful_aspects,
        improvement_suggestions=feedback_data.improvement_suggestions,
        would_recommend=feedback_data.would_recommend,
    )

    db.add(new_feedback)
    db.commit()
    db.refresh(new_feedback)

    return {
        "message": "Feedback submitted successfully",
        "feedback_id": new_feedback.id,
    }


@router.get("/my-feedback")
async def get_my_feedback(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """Get user's submitted feedback"""
    feedback = (
        db.query(Feedback)
        .filter(Feedback.user_id == current_user.id)
        .order_by(Feedback.created_at.desc())
        .all()
    )

    result = []
    for fb in feedback:
        counselor = db.query(User).filter(User.id == fb.counselor_id).first()
        # booking = db.query(Booking).filter(Booking.id == fb.booking_id).first()

        result.append(
            {
                "id": fb.id,
                "counselor_name": counselor.name if counselor else "Unknown",
                "counselor_specialization": counselor.specialization
                if counselor
                else None,
                "session_date": fb.session_date,
                "rating": fb.rating,
                "feedback_text": fb.feedback_text,
                "helpful_aspects": fb.helpful_aspects,
                "improvement_suggestions": fb.improvement_suggestions,
                "would_recommend": fb.would_recommend,
                "feedback_type": fb.feedback_type,
                "counselor_response": fb.counselor_response,
                "created_at": fb.created_at,
            }
        )

    return result


@router.get("/pending")
async def get_pending_feedback(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """Get bookings that need feedback"""
    # Get completed bookings without feedback
    completed_bookings = (
        db.query(Booking)
        .filter(Booking.user_id == current_user.id, Booking.status == "completed")
        .all()
    )

    pending_feedback = []
    for booking in completed_bookings:
        existing_feedback = (
            db.query(Feedback).filter(Feedback.booking_id == booking.id).first()
        )

        if not existing_feedback:
            counselor = db.query(User).filter(User.id == booking.counselor_id).first()
            pending_feedback.append(
                {
                    "booking_id": booking.id,
                    "counselor_id": booking.counselor_id,
                    "counselor_name": counselor.name if counselor else "Unknown",
                    "counselor_specialization": counselor.specialization
                    if counselor
                    else None,
                    "session_date": booking.preferred_datetime,
                    "issue_description": booking.issue_description,
                }
            )

    return pending_feedback
