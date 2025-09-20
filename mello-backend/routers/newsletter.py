from datetime import datetime

from auth import get_current_user
from database import get_db
from fastapi import APIRouter, Depends, HTTPException
from models import Newsletter, User
from sqlalchemy.orm import Session

router = APIRouter()


@router.get("/")
async def get_published_newsletters(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 20,
    offset: int = 0,
):
    """Get published newsletters for users"""
    newsletters = (
        db.query(Newsletter)
        .filter(Newsletter.is_published)
        .order_by(Newsletter.published_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    return [
        {
            "id": newsletter.id,
            "title": newsletter.title,
            "content": newsletter.content,
            "published_at": newsletter.published_at,
            "author_name": db.query(User)
            .filter(User.id == newsletter.author_id)
            .first()
            .name,
        }
        for newsletter in newsletters
    ]


@router.get("/{newsletter_id}")
async def get_newsletter_by_id(
    newsletter_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a specific newsletter by ID"""
    newsletter = (
        db.query(Newsletter)
        .filter(Newsletter.id == newsletter_id, Newsletter.is_published)
        .first()
    )

    if not newsletter:
        raise HTTPException(status_code=404, detail="Newsletter not found")

    author = db.query(User).filter(User.id == newsletter.author_id).first()

    return {
        "id": newsletter.id,
        "title": newsletter.title,
        "content": newsletter.content,
        "published_at": newsletter.published_at,
        "author_name": author.name if author else "Unknown",
    }


@router.get("/latest/count")
async def get_latest_newsletters_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    days: int = 7,
):
    """Get count of newsletters published in the last N days"""
    from datetime import timedelta

    start_date = datetime.now() - timedelta(days=days)
    count = (
        db.query(Newsletter)
        .filter(Newsletter.is_published, Newsletter.published_at >= start_date)
        .count()
    )

    return {"count": count, "days": days}
