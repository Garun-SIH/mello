from __future__ import annotations

import enum
from datetime import datetime, timezone

from database import Base
from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship


class UserRole(enum.Enum):
    USER = "user"
    COUNSELOR = "counselor"
    ADMIN = "admin"


class CounselorStatus(enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    SUSPENDED = "suspended"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    firebase_uid: Mapped[str] = mapped_column(String(128), unique=True, index=True)
    email: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.USER)

    # User-specific fields
    age: Mapped[int] = mapped_column(Integer)
    university: Mapped[str] = mapped_column(String(200))
    preferred_language: Mapped[str] = mapped_column(String(10), default="en")

    # Counselor-specific fields
    specialization: Mapped[str] = mapped_column(String(200))
    license_number: Mapped[str] = mapped_column(String(100))
    phone_number: Mapped[str] = mapped_column(String(20))
    address: Mapped[str] = mapped_column(Text)
    counselor_status: Mapped[CounselorStatus] = mapped_column(
        Enum(CounselorStatus), default=CounselorStatus.PENDING
    )

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    chatbot_logs: Mapped[list[ChatbotLog]] = relationship(
        "ChatbotLog", back_populates="user"
    )
    bookings: Mapped[list[Booking]] = relationship(
        "Booking", foreign_keys="Booking.user_id", back_populates="user"
    )
    counselor_bookings: Mapped[list[Booking]] = relationship(
        "Booking", foreign_keys="Booking.counselor_id", back_populates="counselor"
    )
    mood_entries: Mapped[list[MoodEntry]] = relationship(
        "MoodEntry", back_populates="user"
    )
    assessments: Mapped[list[Assessment]] = relationship(
        "Assessment", back_populates="user"
    )
    feedback_given: Mapped[list[Feedback]] = relationship(
        "Feedback", foreign_keys="Feedback.user_id", back_populates="user"
    )
    feedback_received: Mapped[list[Feedback]] = relationship(
        "Feedback", foreign_keys="Feedback.counselor_id", back_populates="counselor"
    )
    newsletters: Mapped[list[Newsletter]] = relationship(
        "Newsletter", back_populates="author"
    )
    uploaded_resources: Mapped[list[Resource]] = relationship(
        "Resource", back_populates="uploader"
    )


class ChatbotLog(Base):
    __tablename__ = "chatbot_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    message: Mapped[str] = mapped_column(Text, nullable=False)
    response: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(50))  # stress, sleep, anxiety, general
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    user: Mapped[User] = relationship("User", back_populates="chatbot_logs")


class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    counselor_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    preferred_datetime: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    status: Mapped[str] = mapped_column(
        String(20), default="pending"
    )  # pending, confirmed, completed, cancelled
    issue_description: Mapped[str] = mapped_column(Text)
    urgency: Mapped[str] = mapped_column(
        String(20), default="medium"
    )  # low, medium, high
    notes: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    user: Mapped[User] = relationship(
        "User", foreign_keys=[user_id], back_populates="bookings"
    )
    counselor: Mapped[User] = relationship(
        "User", foreign_keys=[counselor_id], back_populates="counselor_bookings"
    )


class Post(Base):
    __tablename__ = "posts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    alias: Mapped[str] = mapped_column(String(50), nullable=False)  # Anonymous alias
    content: Mapped[str] = mapped_column(Text, nullable=False)
    moderated: Mapped[bool] = mapped_column(Boolean, default=False)
    moderated_by: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    likes: Mapped[int] = mapped_column(Integer, default=0)
    category: Mapped[str] = mapped_column(
        String(50)
    )  # stress, anxiety, academic, social

    # Relationships
    author: Mapped[User] = relationship("User", foreign_keys=[user_id])
    moderator: Mapped[User] = relationship("User", foreign_keys=[moderated_by])


class Resource(Base):
    __tablename__ = "resources"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    type: Mapped[str] = mapped_column(
        String(20), nullable=False
    )  # video, audio, article
    language: Mapped[str] = mapped_column(String(10), nullable=False)  # en, hi
    url: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str] = mapped_column(Text)
    category: Mapped[str] = mapped_column(
        String(50)
    )  # stress, sleep, anxiety, mindfulness
    duration: Mapped[str] = mapped_column(String(20))  # for videos/audio
    uploaded_by: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id")
    )  # Admin who uploaded
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    uploader: Mapped[User] = relationship("User")


class Assessment(Base):
    __tablename__ = "assessments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    assessment_type: Mapped[str] = mapped_column(
        String(20), nullable=False
    )  # phq9, gad7, ghq
    responses: Mapped[str] = mapped_column(
        Text, nullable=False
    )  # JSON string of responses
    total_score: Mapped[int] = mapped_column(Integer, nullable=False)
    severity_level: Mapped[str] = mapped_column(
        String(50)
    )  # minimal, mild, moderate, severe
    recommendations: Mapped[str] = mapped_column(Text)
    completed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    user: Mapped[User] = relationship("User", back_populates="assessments")


class MoodEntry(Base):
    __tablename__ = "mood_entries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    mood_score: Mapped[int] = mapped_column(Integer, nullable=False)  # 1-10 scale
    energy_level: Mapped[int] = mapped_column(Integer, nullable=False)  # 1-10 scale
    stress_level: Mapped[int] = mapped_column(Integer, nullable=False)  # 1-10 scale
    sleep_hours: Mapped[float] = mapped_column(Float)
    notes: Mapped[str] = mapped_column(Text)
    date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    # Relationships
    user: Mapped[User] = relationship("User", back_populates="mood_entries")


class Feedback(Base):
    __tablename__ = "feedback"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    counselor_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=True
    )
    booking_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("bookings.id"), nullable=True
    )
    session_date: Mapped[datetime] = mapped_column(DateTime)
    feedback_type: Mapped[str] = mapped_column(
        String(50), nullable=False
    )  # app, counselor, general
    rating: Mapped[int] = mapped_column(Integer, nullable=False)  # 1-5 stars
    feedback_text: Mapped[str] = mapped_column(Text)
    helpful_aspects: Mapped[str] = mapped_column(Text)  # JSON array of helpful aspects
    improvement_suggestions: Mapped[str] = mapped_column(
        Text
    )  # JSON array of suggestions
    would_recommend: Mapped[bool] = mapped_column(Boolean, default=True)
    counselor_response: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    user: Mapped[User] = relationship(
        "User",
        foreign_keys=[user_id],
        back_populates="feedback_given",
        overlaps="feedback_received",
    )
    counselor: Mapped[User] = relationship(
        "User",
        foreign_keys=[counselor_id],
        back_populates="feedback_received",
        overlaps="feedback_given",
    )
    booking: Mapped[Booking] = relationship("Booking")


class Newsletter(Base):
    __tablename__ = "newsletters"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    author_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id")
    )  # Admin who created
    published_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    is_published: Mapped[bool] = mapped_column(Boolean, default=False)

    # Relationships
    author: Mapped[User] = relationship("User")


class CounselorReport(Base):
    __tablename__ = "counselor_reports"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    counselor_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    patient_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    report_type: Mapped[str] = mapped_column(
        String(50), nullable=False
    )  # patient_progress, incident, treatment_plan, assessment
    content: Mapped[str] = mapped_column(Text, nullable=False)
    recommendations: Mapped[str] = mapped_column(Text)
    priority: Mapped[str] = mapped_column(
        String(20), default="medium"
    )  # low, medium, high
    status: Mapped[str] = mapped_column(
        String(20), default="draft"
    )  # draft, submitted, reviewed
    session_date: Mapped[datetime] = mapped_column(DateTime)
    follow_up_required: Mapped[bool] = mapped_column(Boolean, default=False)
    next_session_date: Mapped[datetime] = mapped_column(DateTime)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    submitted_at: Mapped[datetime] = mapped_column(DateTime)
    reviewed_at: Mapped[datetime] = mapped_column(DateTime)
    reviewed_by: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))

    # Relationships
    counselor: Mapped[User] = relationship(
        "User", foreign_keys=[counselor_id], overlaps="counselor_reports"
    )
    patient: Mapped[User] = relationship(
        "User", foreign_keys=[patient_id], overlaps="patient_reports"
    )
    reviewer: Mapped[User] = relationship("User", foreign_keys=[reviewed_by])


class ForumPost(Base):
    __tablename__ = "forum_posts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(
        String(50)
    )  # academic_stress, social_anxiety, sleep_issues, relationship, other
    is_anonymous: Mapped[bool] = mapped_column(Boolean, default=True)
    is_flagged: Mapped[bool] = mapped_column(Boolean, default=False)
    flagged_reason: Mapped[str] = mapped_column(String(200))
    flagged_by: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    is_moderated: Mapped[bool] = mapped_column(Boolean, default=False)
    moderated_by: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    moderation_action: Mapped[str] = mapped_column(
        String(20)
    )  # approved, removed, edited
    reply_count: Mapped[int] = mapped_column(Integer, default=0)
    like_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    author: Mapped[User] = relationship(
        "User", foreign_keys=[user_id], overlaps="forum_posts"
    )
    flagger: Mapped[User] = relationship("User", foreign_keys=[flagged_by])
    moderator: Mapped[User] = relationship("User", foreign_keys=[moderated_by])
    replies: Mapped[list[ForumReply]] = relationship(
        "ForumReply", back_populates="post"
    )


class ForumReply(Base):
    __tablename__ = "forum_replies"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    post_id: Mapped[int] = mapped_column(Integer, ForeignKey("forum_posts.id"))
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    content: Mapped[str] = mapped_column(Text, nullable=False)
    is_anonymous: Mapped[bool] = mapped_column(Boolean, default=True)
    is_flagged: Mapped[bool] = mapped_column(Boolean, default=False)
    like_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    post: Mapped[list[ForumPost]] = relationship("ForumPost", back_populates="replies")
    author: Mapped[User] = relationship(
        "User", foreign_keys=[user_id], overlaps="forum_replies"
    )


class AdminAnalytics(Base):
    __tablename__ = "admin_analytics"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    metric_type: Mapped[str] = mapped_column(
        String(50), nullable=False
    )  # mood_trends, forum_activity, appointment_stats
    metric_data: Mapped[str] = mapped_column(Text, nullable=False)  # JSON data
    date_range_start: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    date_range_end: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    generated_by: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    generator: Mapped[User] = relationship("User")


# Add new relationships to User model
User.counselor_reports = relationship(
    "CounselorReport", foreign_keys="CounselorReport.counselor_id"
)
User.patient_reports = relationship(
    "CounselorReport", foreign_keys="CounselorReport.patient_id"
)
User.forum_posts = relationship("ForumPost", foreign_keys="ForumPost.user_id")
User.forum_replies = relationship("ForumReply")
