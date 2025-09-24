from datetime import datetime, timedelta
from typing import Optional

from auth import get_admin_user
from database import get_db
from fastapi import APIRouter, Depends, HTTPException
from models import (
    Assessment,
    Booking,
    ChatbotLog,
    CounselorReport,
    CounselorStatus,
    ForumPost,
    MoodEntry,
    Newsletter,
    Post,
    Resource,
    User,
    UserRole,
)
from pydantic import BaseModel
from sqlalchemy import and_, func
from sqlalchemy.orm import Session

router = APIRouter()


class CounselorApproval(BaseModel):
    counselor_id: int
    status: str  # approved, rejected, suspended
    notes: Optional[str] = None


class ResourceUpload(BaseModel):
    title: str
    type: str  # video, audio, article
    language: str
    url: str
    description: Optional[str] = None
    category: str
    duration: Optional[str] = None


class NewsletterCreate(BaseModel):
    title: str
    content: str
    is_published: bool = False


@router.get("/counselors/pending")
async def get_pending_counselors(
    admin: User = Depends(get_admin_user), db: Session = Depends(get_db)
):
    """Get all pending counselor applications"""
    pending_counselors = (
        db.query(User)
        .filter(
            and_(
                User.role == UserRole.COUNSELOR,
                User.counselor_status == CounselorStatus.PENDING,
            )
        )
        .all()
    )

    return [
        {
            "id": counselor.id,
            "name": counselor.name,
            "email": counselor.email,
            "specialization": counselor.specialization,
            "license_number": counselor.license_number,
            "phone_number": counselor.phone_number,
            "address": counselor.address,
            "created_at": counselor.created_at,
        }
        for counselor in pending_counselors
    ]


@router.put("/counselors/approve")
async def approve_counselor(
    approval: CounselorApproval,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    """Approve, reject, or suspend a counselor"""
    counselor = db.query(User).filter(User.id == approval.counselor_id).first()
    if not counselor or counselor.role != UserRole.COUNSELOR:
        raise HTTPException(status_code=404, detail="Counselor not found")

    if approval.status == "approved":
        counselor.counselor_status = CounselorStatus.APPROVED
    elif approval.status == "rejected":
        counselor.counselor_status = CounselorStatus.REJECTED
    elif approval.status == "suspended":
        counselor.counselor_status = CounselorStatus.SUSPENDED
    else:
        raise HTTPException(status_code=400, detail="Invalid status")

    db.commit()
    return {"message": f"Counselor {approval.status} successfully"}


@router.post("/resources")
async def upload_resource(
    resource: ResourceUpload,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    """Upload a new resource"""
    new_resource = Resource(
        title=resource.title,
        type=resource.type,
        language=resource.language,
        url=resource.url,
        description=resource.description,
        category=resource.category,
        duration=resource.duration,
        uploaded_by=admin.id,
    )

    db.add(new_resource)
    db.commit()
    db.refresh(new_resource)

    return {"message": "Resource uploaded successfully", "resource_id": new_resource.id}


@router.get("/forum/posts/unmoderated")
async def get_unmoderated_posts(
    admin: User = Depends(get_admin_user), db: Session = Depends(get_db)
):
    """Get all unmoderated forum posts"""
    posts = db.query(Post).filter(Post.moderated.is_(False)).all()

    return [
        {
            "id": post.id,
            "alias": post.alias,
            "content": post.content,
            "category": post.category,
            "timestamp": post.timestamp,
            "likes": post.likes,
        }
        for post in posts
    ]


@router.put("/forum/posts/{post_id}/moderate")
async def moderate_post_v1(
    post_id: int,
    action: str,  # approve or delete
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    """Moderate a forum post"""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    if action == "approve":
        post.moderated = True
        post.moderated_by = admin.id
        db.commit()
        return {"message": "Post approved"}
    elif action == "delete":
        db.delete(post)
        db.commit()
        return {"message": "Post deleted"}
    else:
        raise HTTPException(status_code=400, detail="Invalid action")


@router.get("/analytics/mood")
async def get_mood_analytics(
    admin: User = Depends(get_admin_user), db: Session = Depends(get_db), days: int = 30
):
    """Get mood analytics for the last N days"""
    start_date = datetime.now() - timedelta(days=days)

    # Average mood scores by day
    daily_mood = (
        db.query(
            func.date(MoodEntry.date).label("date"),
            func.avg(MoodEntry.mood_score).label("avg_mood"),
            func.avg(MoodEntry.energy_level).label("avg_energy"),
            func.avg(MoodEntry.stress_level).label("avg_stress"),
            func.count(MoodEntry.id).label("entry_count"),
        )
        .filter(MoodEntry.date >= start_date)
        .group_by(func.date(MoodEntry.date))
        .all()
    )

    # Overall statistics
    total_entries = db.query(MoodEntry).filter(MoodEntry.date >= start_date).count()
    avg_mood = (
        db.query(func.avg(MoodEntry.mood_score))
        .filter(MoodEntry.date >= start_date)
        .scalar()
    )

    return {
        "daily_mood": [
            {
                "date": str(entry.date),
                "avg_mood": round(float(entry.avg_mood), 2),
                "avg_energy": round(float(entry.avg_energy), 2),
                "avg_stress": round(float(entry.avg_stress), 2),
                "entry_count": entry.entry_count,
            }
            for entry in daily_mood
        ],
        "total_entries": total_entries,
        "overall_avg_mood": round(float(avg_mood), 2) if avg_mood else 0,
    }


@router.get("/analytics/appointments")
async def get_appointment_analytics(
    admin: User = Depends(get_admin_user), db: Session = Depends(get_db)
):
    """Get counselor appointment analytics"""
    # Appointments by status
    status_breakdown = (
        db.query(Booking.status, func.count(Booking.id).label("count"))
        .group_by(Booking.status)
        .all()
    )

    # Appointments by counselor
    counselor_stats = (
        db.query(
            User.name,
            User.specialization,
            func.count(Booking.id).label("appointment_count"),
        )
        .join(Booking, User.id == Booking.counselor_id)
        .filter(User.role == UserRole.COUNSELOR)
        .group_by(User.id)
        .all()
    )

    # Assessment-based counselor distribution
    assessment_counselor_match = (
        db.query(Assessment.severity_level, func.count(Assessment.id).label("count"))
        .group_by(Assessment.severity_level)
        .all()
    )

    return {
        "status_breakdown": {status: count for status, count in status_breakdown},
        "counselor_stats": [
            {"name": name, "specialization": specialization, "appointment_count": count}
            for name, specialization, count in counselor_stats
        ],
        "severity_distribution": {
            severity: count for severity, count in assessment_counselor_match
        },
    }


@router.get("/analytics/chats")
async def get_chat_analytics(
    admin: User = Depends(get_admin_user), db: Session = Depends(get_db), days: int = 30
):
    """Get chatbot analytics"""
    start_date = datetime.now() - timedelta(days=days)

    # Chat categories breakdown
    category_breakdown = (
        db.query(ChatbotLog.category, func.count(ChatbotLog.id).label("count"))
        .filter(ChatbotLog.timestamp >= start_date)
        .group_by(ChatbotLog.category)
        .all()
    )

    # Daily chat volume
    daily_chats = (
        db.query(
            func.date(ChatbotLog.timestamp).label("date"),
            func.count(ChatbotLog.id).label("count"),
        )
        .filter(ChatbotLog.timestamp >= start_date)
        .group_by(func.date(ChatbotLog.timestamp))
        .all()
    )

    # Most common issues
    total_chats = (
        db.query(ChatbotLog).filter(ChatbotLog.timestamp >= start_date).count()
    )

    return {
        "total_chats": total_chats,
        "category_breakdown": {
            category: count for category, count in category_breakdown
        },
        "daily_volume": [
            {"date": str(date), "count": count} for date, count in daily_chats
        ],
    }


@router.post("/newsletter")
async def create_newsletter(
    newsletter: NewsletterCreate,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    """Create a newsletter"""
    new_newsletter = Newsletter(
        title=newsletter.title,
        content=newsletter.content,
        author_id=admin.id,
        is_published=newsletter.is_published,
    )

    db.add(new_newsletter)
    db.commit()
    db.refresh(new_newsletter)

    return {
        "message": "Newsletter created successfully",
        "newsletter_id": new_newsletter.id,
    }


@router.get("/newsletter")
async def get_newsletters(
    admin: User = Depends(get_admin_user), db: Session = Depends(get_db)
):
    """Get all newsletters"""
    newsletters = db.query(Newsletter).order_by(Newsletter.published_at.desc()).all()

    return [
        {
            "id": newsletter.id,
            "title": newsletter.title,
            "content": newsletter.content,
            "is_published": newsletter.is_published,
            "published_at": newsletter.published_at,
            "author_name": db.query(User)
            .filter(User.id == newsletter.author_id)
            .first()
            .name,
        }
        for newsletter in newsletters
    ]


@router.put("/newsletter/{newsletter_id}/publish")
async def publish_newsletter(
    newsletter_id: int,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    """Publish or unpublish a newsletter"""
    newsletter = db.query(Newsletter).filter(Newsletter.id == newsletter_id).first()
    if not newsletter:
        raise HTTPException(status_code=404, detail="Newsletter not found")

    newsletter.is_published = not newsletter.is_published
    if newsletter.is_published:
        newsletter.published_at = datetime.utcnow()

    db.commit()
    return {
        "message": f"Newsletter {'published' if newsletter.is_published else 'unpublished'} successfully"
    }


@router.get("/forum/posts/flagged")
async def get_flagged_posts(
    admin: User = Depends(get_admin_user), db: Session = Depends(get_db)
):
    """Get all flagged forum posts"""
    posts = db.query(ForumPost).filter(ForumPost.is_flagged).all()

    return [
        {
            "id": post.id,
            "title": post.title,
            "content": post.content,
            "category": post.category,
            "flagged_reason": post.flagged_reason,
            "created_at": post.created_at,
            "like_count": post.like_count,
            "reply_count": post.reply_count,
        }
        for post in posts
    ]


@router.post("/forum/moderate/{post_id}")
async def moderate_post_v2(
    post_id: int,
    action: str,  # approve, remove
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    """Moderate a forum post"""
    post = db.query(ForumPost).filter(ForumPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    if action == "approve":
        post.is_flagged = False
        post.is_moderated = True
        post.moderated_by = admin.id
        post.moderation_action = "approved"
        db.commit()
        return {"message": "Post approved"}
    elif action == "remove":
        post.is_moderated = True
        post.moderated_by = admin.id
        post.moderation_action = "removed"
        db.commit()
        return {"message": "Post removed"}
    else:
        raise HTTPException(status_code=400, detail="Invalid action")


@router.get("/appointments")
async def get_all_appointments(
    admin: User = Depends(get_admin_user), db: Session = Depends(get_db)
):
    """Get all appointments for admin tracking"""
    appointments = db.query(Booking).all()

    result = []
    for booking in appointments:
        user = db.query(User).filter(User.id == booking.user_id).first()
        counselor = db.query(User).filter(User.id == booking.counselor_id).first()

        result.append(
            {
                "id": booking.id,
                "user_name": user.name if user else "Unknown",
                "user_email": user.email if user else "Unknown",
                "counselor_name": counselor.name if counselor else "Unknown",
                "counselor_specialization": counselor.specialization
                if counselor
                else None,
                "preferred_datetime": booking.preferred_datetime,
                "status": booking.status,
                "issue_description": booking.issue_description,
                "urgency": booking.urgency,
                "created_at": booking.created_at,
            }
        )

    return result


@router.get("/counselor-reports")
async def get_counselor_reports(
    admin: User = Depends(get_admin_user), db: Session = Depends(get_db)
):
    """Get all counselor reports for admin review"""
    reports = (
        db.query(CounselorReport).filter(CounselorReport.status == "submitted").all()
    )

    result = []
    for report in reports:
        counselor = db.query(User).filter(User.id == report.counselor_id).first()
        patient = db.query(User).filter(User.id == report.patient_id).first()

        result.append(
            {
                "id": report.id,
                "title": report.title,
                "counselor_name": counselor.name if counselor else "Unknown",
                "patient_name": patient.name if patient else "Unknown",
                "report_type": report.report_type,
                "priority": report.priority,
                "status": report.status,
                "submitted_at": report.submitted_at,
                "content": report.content,
                "recommendations": report.recommendations,
            }
        )

    return result
