from typing import Optional

from auth import get_current_user
from database import get_db
from fastapi import APIRouter, Depends, HTTPException
from models import ForumPost, ForumReply, User
from pydantic import BaseModel
from sqlalchemy import and_
from sqlalchemy.orm import Session

router = APIRouter()


class ForumPostCreate(BaseModel):
    title: str
    content: str
    category: str
    is_anonymous: bool = True


class ForumReplyCreate(BaseModel):
    content: str
    is_anonymous: bool = True


@router.get("/posts")
async def get_posts(
    category: Optional[str] = None,
    limit: int = 20,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get forum posts with optional category filtering"""
    query = db.query(ForumPost).filter(
        and_(ForumPost.is_moderated, ForumPost.moderation_action != "removed")
    )

    if category:
        query = query.filter(ForumPost.category == category)

    posts = (
        query.order_by(ForumPost.created_at.desc()).offset(offset).limit(limit).all()
    )

    return [
        {
            "id": post.id,
            "title": post.title,
            "content": post.content,
            "category": post.category,
            "is_anonymous": post.is_anonymous,
            "author_name": "Anonymous"
            if post.is_anonymous
            else db.query(User).filter(User.id == post.user_id).first().name,
            "created_at": post.created_at,
            "like_count": post.like_count,
            "reply_count": post.reply_count,
        }
        for post in posts
    ]


@router.post("/posts")
async def create_post(
    post: ForumPostCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new forum post"""
    new_post = ForumPost(
        user_id=current_user.id,
        title=post.title,
        content=post.content,
        category=post.category,
        is_anonymous=post.is_anonymous,
        is_moderated=True,  # Requires moderation
        is_flagged=False,
    )

    db.add(new_post)
    db.commit()
    db.refresh(new_post)

    return {"message": "Post created successfully", "post_id": new_post.id}


@router.get("/posts/{post_id}")
async def get_post_with_replies(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a specific post with its replies"""
    post = db.query(ForumPost).filter(ForumPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    replies = (
        db.query(ForumReply)
        .filter(ForumReply.post_id == post_id)
        .order_by(ForumReply.created_at)
        .all()
    )

    post_data = {
        "id": post.id,
        "title": post.title,
        "content": post.content,
        "category": post.category,
        "is_anonymous": post.is_anonymous,
        "author_name": "Anonymous"
        if post.is_anonymous
        else db.query(User).filter(User.id == post.user_id).first().name,
        "created_at": post.created_at,
        "like_count": post.like_count,
        "reply_count": post.reply_count,
    }

    replies_data = [
        {
            "id": reply.id,
            "content": reply.content,
            "is_anonymous": reply.is_anonymous,
            "author_name": "Anonymous"
            if reply.is_anonymous
            else db.query(User).filter(User.id == reply.user_id).first().name,
            "created_at": reply.created_at,
            "like_count": reply.like_count,
        }
        for reply in replies
    ]

    return {"post": post_data, "replies": replies_data}


@router.post("/posts/{post_id}/replies")
async def create_reply(
    post_id: int,
    reply: ForumReplyCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a reply to a forum post"""
    post = db.query(ForumPost).filter(ForumPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    new_reply = ForumReply(
        post_id=post_id,
        user_id=current_user.id,
        content=reply.content,
        is_anonymous=reply.is_anonymous,
    )

    db.add(new_reply)

    # Update reply count
    post.reply_count += 1

    db.commit()
    db.refresh(new_reply)

    return {"message": "Reply created successfully", "reply_id": new_reply.id}


@router.put("/posts/{post_id}/like")
async def like_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Like a forum post"""
    post = db.query(ForumPost).filter(ForumPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    post.like_count += 1
    db.commit()

    return {"message": "Post liked successfully", "likes": post.like_count}


@router.put("/replies/{reply_id}/like")
async def like_reply(
    reply_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Like a forum reply"""
    reply = db.query(ForumReply).filter(ForumReply.id == reply_id).first()
    if not reply:
        raise HTTPException(status_code=404, detail="Reply not found")

    reply.like_count += 1
    db.commit()

    return {"message": "Reply liked successfully", "likes": reply.like_count}


@router.post("/posts/{post_id}/flag")
async def flag_post(
    post_id: int,
    reason: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Flag a post for moderation"""
    post = db.query(ForumPost).filter(ForumPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    post.is_flagged = True
    post.flagged_reason = reason
    db.commit()

    return {"message": "Post flagged for moderation"}


@router.get("/categories")
async def get_categories(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """Get all available post categories"""
    categories = db.query(ForumPost.category).distinct().all()
    return {"categories": [cat[0] for cat in categories if cat[0]]}
