from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta

from database import get_db
from models import ChatbotLog, Booking, Post
from schemas import AnalyticsResponse

router = APIRouter()

@router.get("/analytics", response_model=AnalyticsResponse)
async def get_analytics(db: Session = Depends(get_db)):
    """Get analytics data for admin dashboard"""
    
    # Total chatbot interactions
    total_interactions = db.query(ChatbotLog).count()
    
    # Category breakdown for chatbot interactions
    category_data = db.query(
        ChatbotLog.category,
        func.count(ChatbotLog.id).label('count')
    ).group_by(ChatbotLog.category).all()
    
    category_breakdown = {cat: count for cat, count in category_data}
    
    # Total bookings
    total_bookings = db.query(Booking).count()
    
    # Booking status breakdown
    booking_status_data = db.query(
        Booking.status,
        func.count(Booking.id).label('count')
    ).group_by(Booking.status).all()
    
    booking_status_breakdown = {status: count for status, count in booking_status_data}
    
    # Total posts
    total_posts = db.query(Post).count()
    
    # Popular resources (mock data for MVP)
    popular_resources = [
        {"title": "Stress Management Techniques", "views": 150, "category": "stress"},
        {"title": "Sleep Hygiene Guide", "views": 120, "category": "sleep"},
        {"title": "Exam Anxiety Coping", "views": 100, "category": "anxiety"},
        {"title": "Mindfulness Meditation", "views": 90, "category": "mindfulness"}
    ]
    
    return AnalyticsResponse(
        total_interactions=total_interactions,
        category_breakdown=category_breakdown,
        total_bookings=total_bookings,
        booking_status_breakdown=booking_status_breakdown,
        total_posts=total_posts,
        popular_resources=popular_resources
    )

@router.get("/analytics/trends")
async def get_trends(days: int = 7, db: Session = Depends(get_db)):
    """Get trend data for the last N days"""
    start_date = datetime.now() - timedelta(days=days)
    
    # Daily interaction counts
    daily_interactions = db.query(
        func.date(ChatbotLog.timestamp).label('date'),
        func.count(ChatbotLog.id).label('count')
    ).filter(
        ChatbotLog.timestamp >= start_date
    ).group_by(
        func.date(ChatbotLog.timestamp)
    ).all()
    
    # Daily booking counts
    daily_bookings = db.query(
        func.date(Booking.created_at).label('date'),
        func.count(Booking.id).label('count')
    ).filter(
        Booking.created_at >= start_date
    ).group_by(
        func.date(Booking.created_at)
    ).all()
    
    return {
        "daily_interactions": [{"date": str(date), "count": count} for date, count in daily_interactions],
        "daily_bookings": [{"date": str(date), "count": count} for date, count in daily_bookings]
    }
