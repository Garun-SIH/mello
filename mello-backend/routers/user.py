from datetime import date, datetime, timedelta
from typing import Optional

from auth import get_current_user
from database import get_db
from fastapi import APIRouter, Depends
from models import (
    Assessment,
    Booking,
    ChatbotLog,
    Feedback,
    MoodEntry,
    Newsletter,
    User,
)
from pydantic import BaseModel
from sqlalchemy import and_, desc, func
from sqlalchemy.orm import Session

router = APIRouter()


class MoodEntryCreate(BaseModel):
    mood_score: int  # 1-10
    energy_level: int  # 1-10
    stress_level: int  # 1-10
    sleep_hours: Optional[float] = None
    notes: Optional[str] = None


class FeedbackCreate(BaseModel):
    feedback_type: str  # app, counselor, general
    rating: int  # 1-5
    comments: Optional[str] = None
    counselor_id: Optional[int] = None


@router.post("/mood")
async def create_mood_entry(
    mood_data: MoodEntryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a daily mood entry"""
    # Check if user already has an entry for today
    today = date.today()
    existing_entry = (
        db.query(MoodEntry)
        .filter(
            and_(
                MoodEntry.user_id == current_user.id, func.date(MoodEntry.date) == today
            )
        )
        .first()
    )

    if existing_entry:
        # Update existing entry
        existing_entry.mood_score = mood_data.mood_score
        existing_entry.energy_level = mood_data.energy_level
        existing_entry.stress_level = mood_data.stress_level
        existing_entry.sleep_hours = mood_data.sleep_hours
        existing_entry.notes = mood_data.notes
        db.commit()
        return {"message": "Mood entry updated for today"}
    else:
        # Create new entry
        new_entry = MoodEntry(
            user_id=current_user.id,
            date=today,
            mood_score=mood_data.mood_score,
            energy_level=mood_data.energy_level,
            stress_level=mood_data.stress_level,
            sleep_hours=mood_data.sleep_hours,
            notes=mood_data.notes,
        )
        db.add(new_entry)
        db.commit()
        db.refresh(new_entry)
        return {"message": "Mood entry created successfully", "entry_id": new_entry.id}


@router.get("/mood/history")
async def get_mood_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    days: int = 30,
):
    """Get user's mood history"""
    mood_entries = (
        db.query(MoodEntry)
        .filter(MoodEntry.user_id == current_user.id)
        .order_by(desc(MoodEntry.date))
        .limit(days)
        .all()
    )

    return [
        {
            "id": entry.id,
            "date": entry.date,
            "mood_score": entry.mood_score,
            "energy_level": entry.energy_level,
            "stress_level": entry.stress_level,
            "sleep_hours": entry.sleep_hours,
            "notes": entry.notes,
        }
        for entry in mood_entries
    ]


@router.get("/mood/analytics")
async def get_personal_mood_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    days: int = 30,
):
    """Get personal mood analytics"""
    mood_entries = (
        db.query(MoodEntry)
        .filter(MoodEntry.user_id == current_user.id)
        .order_by(desc(MoodEntry.date))
        .limit(days)
        .all()
    )

    if not mood_entries:
        return {"message": "No mood data available"}

    # Calculate averages
    avg_mood = sum(entry.mood_score for entry in mood_entries) / len(mood_entries)
    avg_energy = sum(entry.energy_level for entry in mood_entries) / len(mood_entries)
    avg_stress = sum(entry.stress_level for entry in mood_entries) / len(mood_entries)

    # Calculate trends (comparing first half vs second half)
    mid_point = len(mood_entries) // 2
    if mid_point > 0:
        recent_avg_mood = (
            sum(entry.mood_score for entry in mood_entries[:mid_point]) / mid_point
        )
        older_avg_mood = sum(entry.mood_score for entry in mood_entries[mid_point:]) / (
            len(mood_entries) - mid_point
        )
        mood_trend = (
            "improving"
            if recent_avg_mood > older_avg_mood
            else "declining"
            if recent_avg_mood < older_avg_mood
            else "stable"
        )
    else:
        mood_trend = "stable"

    # Sleep correlation
    sleep_entries = [entry for entry in mood_entries if entry.sleep_hours]
    sleep_mood_correlation = None
    if len(sleep_entries) > 5:
        # Simple correlation: good sleep (7-9 hours) vs mood
        good_sleep_moods = [
            entry.mood_score for entry in sleep_entries if 7 <= entry.sleep_hours <= 9
        ]
        poor_sleep_moods = [
            entry.mood_score
            for entry in sleep_entries
            if entry.sleep_hours < 6 or entry.sleep_hours > 10
        ]

        if good_sleep_moods and poor_sleep_moods:
            good_sleep_avg = sum(good_sleep_moods) / len(good_sleep_moods)
            poor_sleep_avg = sum(poor_sleep_moods) / len(poor_sleep_moods)
            sleep_mood_correlation = (
                "positive" if good_sleep_avg > poor_sleep_avg else "negative"
            )

    return {
        "averages": {
            "mood": round(avg_mood, 2),
            "energy": round(avg_energy, 2),
            "stress": round(avg_stress, 2),
        },
        "trend": mood_trend,
        "sleep_mood_correlation": sleep_mood_correlation,
        "total_entries": len(mood_entries),
        "streak_days": len(mood_entries),  # Simplified streak calculation
    }


@router.post("/feedback")
async def submit_feedback(
    feedback_data: FeedbackCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Submit feedback"""
    new_feedback = Feedback(
        user_id=current_user.id,
        feedback_type=feedback_data.feedback_type,
        rating=feedback_data.rating,
        comments=feedback_data.comments,
        counselor_id=feedback_data.counselor_id,
    )

    db.add(new_feedback)
    db.commit()
    db.refresh(new_feedback)

    return {
        "message": "Feedback submitted successfully",
        "feedback_id": new_feedback.id,
    }


@router.get("/newsletters")
async def get_newsletters(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """Get published newsletters"""
    newsletters = (
        db.query(Newsletter)
        .filter(Newsletter.is_published)
        .order_by(desc(Newsletter.published_at))
        .all()
    )

    return [
        {
            "id": newsletter.id,
            "title": newsletter.title,
            "content": newsletter.content,
            "published_at": newsletter.published_at,
        }
        for newsletter in newsletters
    ]


@router.get("/dashboard")
async def get_user_dashboard(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """Get user dashboard data"""
    # Recent mood entry
    latest_mood = (
        db.query(MoodEntry)
        .filter(MoodEntry.user_id == current_user.id)
        .order_by(desc(MoodEntry.date))
        .first()
    )

    # Upcoming appointments
    upcoming_appointments = (
        db.query(Booking)
        .filter(
            and_(
                Booking.user_id == current_user.id,
                Booking.preferred_datetime > datetime.now(),
                Booking.status.in_(["pending", "confirmed"]),
            )
        )
        .order_by(Booking.preferred_datetime)
        .limit(3)
        .all()
    )

    # Recent assessments
    recent_assessments = (
        db.query(Assessment)
        .filter(Assessment.user_id == current_user.id)
        .order_by(desc(Assessment.created_at))
        .limit(3)
        .all()
    )

    # Chat activity this week
    week_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = week_start - timedelta(days=week_start.weekday())

    weekly_chats = (
        db.query(func.count(ChatbotLog.id))
        .filter(
            and_(
                ChatbotLog.user_id == current_user.id,
                ChatbotLog.timestamp >= week_start,
            )
        )
        .scalar()
    )

    # Mood streak
    mood_streak = (
        db.query(func.count(MoodEntry.id))
        .filter(MoodEntry.user_id == current_user.id)
        .scalar()
    )

    return {
        "latest_mood": {
            "date": latest_mood.date,
            "mood_score": latest_mood.mood_score,
            "energy_level": latest_mood.energy_level,
            "stress_level": latest_mood.stress_level,
        }
        if latest_mood
        else None,
        "upcoming_appointments": [
            {
                "id": booking.id,
                "datetime": booking.preferred_datetime,
                "counselor_name": db.query(User)
                .filter(User.id == booking.counselor_id)
                .first()
                .name,
                "status": booking.status,
            }
            for booking in upcoming_appointments
        ],
        "recent_assessments": [
            {
                "id": assessment.id,
                "assessment_type": assessment.assessment_type,
                "severity_level": assessment.severity_level,
                "created_at": assessment.created_at,
            }
            for assessment in recent_assessments
        ],
        "weekly_chat_count": weekly_chats or 0,
        "mood_tracking_streak": mood_streak or 0,
    }


@router.get("/recommendations")
async def get_personalized_recommendations(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """Get personalized recommendations based on user data"""
    # Get recent mood data
    recent_moods = (
        db.query(MoodEntry)
        .filter(MoodEntry.user_id == current_user.id)
        .order_by(desc(MoodEntry.date))
        .limit(7)
        .all()
    )

    # Get recent assessments
    recent_assessment = (
        db.query(Assessment)
        .filter(Assessment.user_id == current_user.id)
        .order_by(desc(Assessment.completed_at))
        .first()
    )

    recommendations = []

    # Mood-based recommendations
    if recent_moods:
        avg_mood = sum(mood.mood_score for mood in recent_moods) / len(recent_moods)
        avg_stress = sum(mood.stress_level for mood in recent_moods) / len(recent_moods)
        avg_energy = sum(mood.energy_level for mood in recent_moods) / len(recent_moods)

        if avg_mood < 5:
            recommendations.append(
                {
                    "type": "mood_support",
                    "title": "Mood Support Resources",
                    "description": "Your recent mood scores suggest you might benefit from additional support.",
                    "action": "Consider booking a counselor session or exploring our mood-boosting resources.",
                }
            )

        if avg_stress > 7:
            recommendations.append(
                {
                    "type": "stress_management",
                    "title": "Stress Management",
                    "description": "Your stress levels have been high recently.",
                    "action": "Try our guided meditation resources or stress-reduction techniques.",
                }
            )

        if avg_energy < 4:
            recommendations.append(
                {
                    "type": "energy_boost",
                    "title": "Energy & Wellness",
                    "description": "Your energy levels seem low.",
                    "action": "Consider reviewing your sleep patterns and exploring our wellness resources.",
                }
            )

    # Assessment-based recommendations
    if recent_assessment and recent_assessment.severity_level in ["moderate", "severe"]:
        recommendations.append(
            {
                "type": "professional_support",
                "title": "Professional Support Recommended",
                "description": f"Your recent {recent_assessment.assessment_type} assessment indicates {recent_assessment.severity_level} symptoms.",
                "action": "We recommend booking a session with one of our qualified counselors.",
            }
        )

    # Default recommendations if no specific issues
    if not recommendations:
        recommendations.append(
            {
                "type": "maintenance",
                "title": "Keep Up the Great Work!",
                "description": "Your mental health indicators look good.",
                "action": "Continue with regular mood tracking and don't hesitate to reach out if you need support.",
            }
        )

    return {"recommendations": recommendations}
