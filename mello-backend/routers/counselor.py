from datetime import datetime, timedelta, timezone
from typing import Optional

from auth import get_current_user
from database import get_db
from fastapi import APIRouter, Depends, HTTPException, status
from models import (
    Assessment,
    Booking,
    ChatbotLog,
    CounselorReport,
    Feedback,
    MoodEntry,
    User,
)
from pydantic import BaseModel
from schemas import CounselorStatus
from sqlalchemy import and_, func
from sqlalchemy.orm import Session

router = APIRouter()


def get_counselor_user(current_user: User = Depends(get_current_user)) -> User:
    """Dependency to ensure current user is a counselor"""
    if current_user.role != "counselor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Counselor role required.",
        )
    return current_user


class AppointmentUpdate(BaseModel):
    booking_id: int
    status: str  # confirmed, completed, cancelled, rescheduled
    notes: Optional[str] = None
    new_datetime: Optional[datetime] = None


class CounselorReportCreate(BaseModel):
    patient_id: int
    session_date: datetime
    session_type: str  # individual, group, crisis
    notes: str
    recommendations: Optional[str] = None
    follow_up_required: bool = False
    next_session_date: Optional[datetime] = None


class PatientFeedbackResponse(BaseModel):
    feedback_id: int
    counselor_response: str


@router.get("/appointments")
async def get_appointments(
    counselor: User = Depends(get_counselor_user),
    db: Session = Depends(get_db),
    status: Optional[str] = None,
    days_ahead: int = 30,
):
    """Get counselor's appointments"""
    if counselor.counselor_status != CounselorStatus.APPROVED:
        raise HTTPException(status_code=403, detail="Counselor not approved")

    query = db.query(Booking).filter(Booking.counselor_id == counselor.id)

    if status:
        query = query.filter(Booking.status == status)

    # Filter for upcoming appointments
    end_date = datetime.now() + timedelta(days=days_ahead)
    query = query.filter(Booking.preferred_datetime <= end_date)

    appointments = query.order_by(Booking.preferred_datetime).all()

    return [
        {
            "id": booking.id,
            "patient_name": "Anonymous Patient",  # Keep patient identity private
            "preferred_datetime": booking.preferred_datetime,
            "status": booking.status,
            "issue_description": booking.issue_description,
            "urgency": booking.urgency,
            "created_at": booking.created_at,
            "notes": booking.notes,
        }
        for booking in appointments
    ]


@router.put("/appointments/update")
async def update_appointment(
    update: AppointmentUpdate,
    counselor: User = Depends(get_counselor_user),
    db: Session = Depends(get_db),
):
    """Update appointment status and details"""
    booking = (
        db.query(Booking)
        .filter(
            and_(Booking.id == update.booking_id, Booking.counselor_id == counselor.id)
        )
        .first()
    )

    if not booking:
        raise HTTPException(status_code=404, detail="Appointment not found")

    booking.status = update.status
    if update.notes:
        booking.notes = update.notes
    if update.new_datetime:
        booking.preferred_datetime = update.new_datetime

    db.commit()
    return {"message": "Appointment updated successfully"}


@router.get("/patients/analytics")
async def get_patient_analytics(
    counselor: User = Depends(get_counselor_user), db: Session = Depends(get_db)
):
    """Get analytics for counselor's patients"""
    # Get all patients who have appointments with this counselor
    patient_ids = (
        db.query(Booking.user_id)
        .filter(Booking.counselor_id == counselor.id)
        .distinct()
        .subquery()
    )

    # Assessment trends for counselor's patients
    assessments = (
        db.query(Assessment)
        .filter(Assessment.user_id.in_(patient_ids))
        .order_by(Assessment.completed_at.desc())
        .limit(100)
        .all()
    )

    # Mood trends for counselor's patients
    mood_entries = (
        db.query(MoodEntry)
        .filter(MoodEntry.user_id.in_(patient_ids))
        .filter(MoodEntry.date >= datetime.now() - timedelta(days=30))
        .all()
    )

    # Chat activity for counselor's patients
    chat_activity = (
        db.query(ChatbotLog.category, func.count(ChatbotLog.id).label("count"))
        .filter(ChatbotLog.user_id.in_(patient_ids))
        .filter(ChatbotLog.timestamp >= datetime.now() - timedelta(days=30))
        .group_by(ChatbotLog.category)
        .all()
    )

    # Assessment severity distribution
    severity_distribution = {}
    for assessment in assessments:
        severity = assessment.severity_level
        if severity not in severity_distribution:
            severity_distribution[severity] = 0
        severity_distribution[severity] += 1

    # Average mood scores
    avg_mood = {}
    if mood_entries:
        total_mood = sum(entry.mood_score for entry in mood_entries)
        total_energy = sum(entry.energy_level for entry in mood_entries)
        total_stress = sum(entry.stress_level for entry in mood_entries)
        count = len(mood_entries)

        avg_mood = {
            "mood": round(total_mood / count, 2),
            "energy": round(total_energy / count, 2),
            "stress": round(total_stress / count, 2),
        }

    return {
        "total_patients": len(list(patient_ids)),
        "assessment_severity_distribution": severity_distribution,
        "average_mood_scores": avg_mood,
        "chat_categories": {category: count for category, count in chat_activity},
        "recent_assessments_count": len(assessments),
    }


@router.get("/patients/mood-trends")
async def get_patient_mood_trends(
    counselor: User = Depends(get_counselor_user),
    db: Session = Depends(get_db),
    days: int = 30,
):
    """Get mood trends for counselor's patients"""
    start_date = datetime.now() - timedelta(days=days)

    # Get patient IDs for this counselor
    patient_ids = (
        db.query(Booking.user_id)
        .filter(Booking.counselor_id == counselor.id)
        .distinct()
        .subquery()
    )

    # Daily mood averages
    daily_mood = (
        db.query(
            func.date(MoodEntry.date).label("date"),
            func.avg(MoodEntry.mood_score).label("avg_mood"),
            func.avg(MoodEntry.energy_level).label("avg_energy"),
            func.avg(MoodEntry.stress_level).label("avg_stress"),
            func.count(MoodEntry.id).label("entry_count"),
        )
        .filter(and_(MoodEntry.user_id.in_(patient_ids), MoodEntry.date >= start_date))
        .group_by(func.date(MoodEntry.date))
        .order_by(func.date(MoodEntry.date))
        .all()
    )

    return [
        {
            "date": str(entry.date),
            "avg_mood": round(float(entry.avg_mood), 2),
            "avg_energy": round(float(entry.avg_energy), 2),
            "avg_stress": round(float(entry.avg_stress), 2),
            "entry_count": entry.entry_count,
        }
        for entry in daily_mood
    ]


@router.post("/reports")
async def create_counselor_report(
    report: CounselorReportCreate,
    counselor: User = Depends(get_counselor_user),
    db: Session = Depends(get_db),
):
    """Create a counselor report for a patient session"""
    # Verify the patient is assigned to this counselor
    booking_exists = (
        db.query(Booking)
        .filter(
            and_(
                Booking.user_id == report.patient_id,
                Booking.counselor_id == counselor.id,
            )
        )
        .first()
    )

    if not booking_exists:
        raise HTTPException(
            status_code=403, detail="Patient not assigned to this counselor"
        )

    new_report = CounselorReport(
        counselor_id=counselor.id,
        patient_id=report.patient_id,
        session_date=report.session_date,
        session_type=report.session_type,
        notes=report.notes,
        recommendations=report.recommendations,
        follow_up_required=report.follow_up_required,
        next_session_date=report.next_session_date,
    )

    db.add(new_report)
    db.commit()
    db.refresh(new_report)

    return {"message": "Report created successfully", "report_id": new_report.id}


@router.get("/reports")
async def get_counselor_reports(
    counselor: User = Depends(get_counselor_user),
    db: Session = Depends(get_db),
    patient_id: Optional[int] = None,
):
    """Get counselor's reports"""
    query = db.query(CounselorReport).filter(
        CounselorReport.counselor_id == counselor.id
    )

    if patient_id:
        query = query.filter(CounselorReport.patient_id == patient_id)

    reports = query.order_by(CounselorReport.session_date.desc()).all()

    return [
        {
            "id": report.id,
            "patient_id": report.patient_id,
            "session_date": report.session_date,
            "session_type": report.session_type,
            "notes": report.notes,
            "recommendations": report.recommendations,
            "follow_up_required": report.follow_up_required,
            "next_session_date": report.next_session_date,
            "created_at": report.created_at,
        }
        for report in reports
    ]


@router.get("/feedback")
async def get_patient_feedback(
    counselor: User = Depends(get_counselor_user), db: Session = Depends(get_db)
):
    """Get feedback from patients"""
    # Get feedback for this counselor
    feedback = (
        db.query(Feedback)
        .filter(Feedback.counselor_id == counselor.id)
        .order_by(Feedback.created_at.desc())
        .all()
    )

    return [
        {
            "id": feedback_item.id,
            "rating": feedback_item.rating,
            "comments": feedback_item.comments,
            "feedback_type": feedback_item.feedback_type,
            "counselor_response": feedback_item.counselor_response,
            "created_at": feedback_item.created_at,
        }
        for feedback_item in feedback
    ]


@router.put("/feedback/respond")
async def respond_to_feedback(
    response: PatientFeedbackResponse,
    counselor: User = Depends(get_counselor_user),
    db: Session = Depends(get_db),
):
    """Respond to patient feedback"""
    feedback = (
        db.query(Feedback)
        .filter(
            and_(
                Feedback.id == response.feedback_id,
                Feedback.counselor_id == counselor.id,
            )
        )
        .first()
    )

    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")

    feedback.counselor_response = response.counselor_response
    db.commit()

    return {"message": "Response added to feedback"}


@router.get("/schedule")
async def get_counselor_schedule(
    counselor: User = Depends(get_counselor_user),
    db: Session = Depends(get_db),
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
):
    """Get counselor's schedule"""
    if not start_date:
        start_date = datetime.now()
    if not end_date:
        end_date = start_date + timedelta(days=7)

    appointments = (
        db.query(Booking)
        .filter(
            and_(
                Booking.counselor_id == counselor.id,
                Booking.preferred_datetime >= start_date,
                Booking.preferred_datetime <= end_date,
                Booking.status.in_(["pending", "confirmed"]),
            )
        )
        .order_by(Booking.preferred_datetime)
        .all()
    )

    return [
        {
            "id": booking.id,
            "datetime": booking.preferred_datetime,
            "status": booking.status,
            "duration": "60 minutes",  # Default session duration
            "issue_type": booking.issue_description[:50] + "..."
            if len(booking.issue_description) > 50
            else booking.issue_description,
        }
        for booking in appointments
    ]


@router.get("/patients")
async def get_counselor_patients(
    counselor: User = Depends(get_counselor_user), db: Session = Depends(get_db)
):
    """Get list of patients assigned to this counselor"""
    if counselor.counselor_status != CounselorStatus.APPROVED:
        raise HTTPException(status_code=403, detail="Counselor not approved")

    # Get unique patients who have bookings with this counselor
    patient_ids = (
        db.query(Booking.user_id)
        .filter(Booking.counselor_id == counselor.id)
        .distinct()
        .all()
    )

    patients = []
    for (patient_id,) in patient_ids:
        patient = db.query(User).filter(User.id == patient_id).first()
        if patient:
            # Get latest booking for this patient
            latest_booking = (
                db.query(Booking)
                .filter(
                    and_(
                        Booking.user_id == patient_id,
                        Booking.counselor_id == counselor.id,
                    )
                )
                .order_by(Booking.preferred_datetime.desc())
                .first()
            )

            # Get total sessions count
            total_sessions = (
                db.query(Booking)
                .filter(
                    and_(
                        Booking.user_id == patient_id,
                        Booking.counselor_id == counselor.id,
                        Booking.status == "completed",
                    )
                )
                .count()
            )

            patients.append(
                {
                    "id": patient.id,
                    "name": patient.name,
                    "email": patient.email,
                    "age": patient.age,
                    "university": patient.university,
                    "last_session": latest_booking.preferred_datetime
                    if latest_booking
                    else None,
                    "total_sessions": total_sessions,
                    "status": latest_booking.status
                    if latest_booking
                    else "no_sessions",
                }
            )

    return patients


@router.get("/patients/{patient_id}/history")
async def get_patient_history(
    patient_id: int,
    counselor: User = Depends(get_counselor_user),
    db: Session = Depends(get_db),
):
    """Get detailed history for a specific patient"""
    if counselor.counselor_status != CounselorStatus.APPROVED:
        raise HTTPException(status_code=403, detail="Counselor not approved")

    # Verify patient is assigned to this counselor
    booking_exists = (
        db.query(Booking)
        .filter(
            and_(Booking.user_id == patient_id, Booking.counselor_id == counselor.id)
        )
        .first()
    )

    if not booking_exists:
        raise HTTPException(
            status_code=403, detail="Patient not assigned to this counselor"
        )

    patient = db.query(User).filter(User.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Get all bookings
    bookings = (
        db.query(Booking)
        .filter(
            and_(Booking.user_id == patient_id, Booking.counselor_id == counselor.id)
        )
        .order_by(Booking.preferred_datetime.desc())
        .all()
    )

    # Get assessments
    assessments = (
        db.query(Assessment)
        .filter(Assessment.user_id == patient_id)
        .order_by(Assessment.completed_at.desc())
        .limit(5)
        .all()
    )

    # Get recent mood entries
    mood_entries = (
        db.query(MoodEntry)
        .filter(MoodEntry.user_id == patient_id)
        .order_by(MoodEntry.date.desc())
        .limit(10)
        .all()
    )

    # Get counselor reports for this patient
    reports = (
        db.query(CounselorReport)
        .filter(
            and_(
                CounselorReport.patient_id == patient_id,
                CounselorReport.counselor_id == counselor.id,
            )
        )
        .order_by(CounselorReport.session_date.desc())
        .all()
    )

    return {
        "patient_info": {
            "id": patient.id,
            "name": patient.name,
            "age": patient.age,
            "university": patient.university,
            "preferred_language": patient.preferred_language,
        },
        "session_history": [
            {
                "id": booking.id,
                "date": booking.preferred_datetime,
                "status": booking.status,
                "issue_description": booking.issue_description,
                "urgency": booking.urgency,
                "notes": booking.notes,
            }
            for booking in bookings
        ],
        "assessments": [
            {
                "id": assessment.id,
                "severity_level": assessment.severity_level,
                "created_at": assessment.created_at,
                "responses": assessment.responses,
            }
            for assessment in assessments
        ],
        "mood_trends": [
            {
                "date": entry.date,
                "mood_score": entry.mood_score,
                "energy_level": entry.energy_level,
                "stress_level": entry.stress_level,
                "notes": entry.notes,
            }
            for entry in mood_entries
        ],
        "reports": [
            {
                "id": report.id,
                "session_date": report.session_date,
                "session_type": report.session_type,
                "title": report.title,
                "recommendations": report.recommendations,
                "follow_up_required": report.follow_up_required,
            }
            for report in reports
        ],
    }


@router.put("/reports/{report_id}")
async def update_counselor_report(
    report_id: int,
    title: Optional[str] = None,
    content: Optional[str] = None,
    recommendations: Optional[str] = None,
    priority: Optional[str] = None,
    counselor: User = Depends(get_counselor_user),
    db: Session = Depends(get_db),
):
    """Update a counselor report"""
    report = (
        db.query(CounselorReport)
        .filter(
            and_(
                CounselorReport.id == report_id,
                CounselorReport.counselor_id == counselor.id,
            )
        )
        .first()
    )

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    if report.status == "submitted":
        raise HTTPException(status_code=400, detail="Cannot edit submitted report")

    # Update fields if provided
    if title is not None:
        report.title = title
    if content is not None:
        report.content = content
    if recommendations is not None:
        report.recommendations = recommendations
    if priority is not None:
        report.priority = priority

    db.commit()
    return {"message": "Report updated successfully"}


@router.post("/reports/{report_id}/submit")
async def submit_counselor_report(
    report_id: int,
    counselor: User = Depends(get_counselor_user),
    db: Session = Depends(get_db),
):
    """Submit a counselor report to admin"""
    report = (
        db.query(CounselorReport)
        .filter(
            and_(
                CounselorReport.id == report_id,
                CounselorReport.counselor_id == counselor.id,
            )
        )
        .first()
    )

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    if report.status == "submitted":
        raise HTTPException(status_code=400, detail="Report already submitted")

    report.status = "submitted"
    report.submitted_at = datetime.now(timezone.utc)
    db.commit()

    return {"message": "Report submitted successfully"}


@router.get("/dashboard/stats")
async def get_counselor_dashboard_stats(
    counselor: User = Depends(get_counselor_user), db: Session = Depends(get_db)
):
    """Get dashboard statistics for counselor"""
    if counselor.counselor_status != CounselorStatus.APPROVED:
        raise HTTPException(status_code=403, detail="Counselor not approved")

    # Total patients
    total_patients = (
        db.query(Booking.user_id)
        .filter(Booking.counselor_id == counselor.id)
        .distinct()
        .count()
    )

    # Upcoming appointments
    upcoming_appointments = (
        db.query(Booking)
        .filter(
            and_(
                Booking.counselor_id == counselor.id,
                Booking.preferred_datetime >= datetime.now(),
                Booking.status.in_(["pending", "confirmed"]),
            )
        )
        .count()
    )

    # Completed sessions this month
    start_of_month = datetime.now().replace(
        day=1, hour=0, minute=0, second=0, microsecond=0
    )
    completed_sessions = (
        db.query(Booking)
        .filter(
            and_(
                Booking.counselor_id == counselor.id,
                Booking.status == "completed",
                Booking.preferred_datetime >= start_of_month,
            )
        )
        .count()
    )

    # Pending reports
    pending_reports = (
        db.query(CounselorReport)
        .filter(
            and_(
                CounselorReport.counselor_id == counselor.id,
                CounselorReport.status == "draft",
            )
        )
        .count()
    )

    # Average rating from feedback
    avg_rating = (
        db.query(func.avg(Feedback.rating))
        .filter(Feedback.counselor_id == counselor.id)
        .scalar()
    )

    return {
        "total_patients": total_patients,
        "upcoming_appointments": upcoming_appointments,
        "completed_sessions_this_month": completed_sessions,
        "pending_reports": pending_reports,
        "average_rating": round(float(avg_rating), 2) if avg_rating else 0,
        "counselor_status": counselor.counselor_status.value,
    }


@router.get("/list")
async def get_counselor_list(db: Session = Depends(get_db)):
    """Get list of approved counselors for user selection"""
    counselors = (
        db.query(User)
        .filter(
            and_(
                User.role == "counselor",
                User.counselor_status == CounselorStatus.APPROVED,
            )
        )
        .all()
    )

    return [
        {
            "id": counselor.id,
            "name": counselor.name,
            "specialization": counselor.specialization,
            "phone_number": counselor.phone_number,
        }
        for counselor in counselors
    ]
