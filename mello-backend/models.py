from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Enum, Float
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime
import enum

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
    
    id = Column(Integer, primary_key=True, index=True)
    firebase_uid = Column(String(128), unique=True, index=True)
    email = Column(String(100), unique=True, index=True)
    name = Column(String(100), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.USER)
    
    # User-specific fields
    age = Column(Integer)
    university = Column(String(200))
    preferred_language = Column(String(10), default="en")
    
    # Counselor-specific fields
    specialization = Column(String(200))
    license_number = Column(String(100))
    phone_number = Column(String(20))
    address = Column(Text)
    counselor_status = Column(Enum(CounselorStatus), default=CounselorStatus.PENDING)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    chatbot_logs = relationship("ChatbotLog", back_populates="user")
    bookings = relationship("Booking", foreign_keys="Booking.user_id", back_populates="user")
    counselor_bookings = relationship("Booking", foreign_keys="Booking.counselor_id", back_populates="counselor")
    mood_entries = relationship("MoodEntry", back_populates="user")
    assessments = relationship("Assessment", back_populates="user")
    feedback_given = relationship("Feedback", foreign_keys="Feedback.user_id", back_populates="user")
    feedback_received = relationship("Feedback", foreign_keys="Feedback.counselor_id", back_populates="counselor")
    newsletters = relationship("Newsletter", back_populates="author")
    uploaded_resources = relationship("Resource", back_populates="uploader")

class ChatbotLog(Base):
    __tablename__ = "chatbot_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    message = Column(Text, nullable=False)
    response = Column(Text, nullable=False)
    category = Column(String(50))  # stress, sleep, anxiety, general
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="chatbot_logs")

class Booking(Base):
    __tablename__ = "bookings"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    counselor_id = Column(Integer, ForeignKey("users.id"))
    preferred_datetime = Column(DateTime, nullable=False)
    status = Column(String(20), default="pending")  # pending, confirmed, completed, cancelled
    issue_description = Column(Text)
    urgency = Column(String(20), default="medium")  # low, medium, high
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id], back_populates="bookings")
    counselor = relationship("User", foreign_keys=[counselor_id], back_populates="counselor_bookings")

class Post(Base):
    __tablename__ = "posts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    alias = Column(String(50), nullable=False)  # Anonymous alias
    content = Column(Text, nullable=False)
    moderated = Column(Boolean, default=False)
    moderated_by = Column(Integer, ForeignKey("users.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    likes = Column(Integer, default=0)
    category = Column(String(50))  # stress, anxiety, academic, social
    
    # Relationships
    author = relationship("User", foreign_keys=[user_id])
    moderator = relationship("User", foreign_keys=[moderated_by])

class Resource(Base):
    __tablename__ = "resources"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    type = Column(String(20), nullable=False)  # video, audio, article
    language = Column(String(10), nullable=False)  # en, hi
    url = Column(String(500), nullable=False)
    description = Column(Text)
    category = Column(String(50))  # stress, sleep, anxiety, mindfulness
    duration = Column(String(20))  # for videos/audio
    uploaded_by = Column(Integer, ForeignKey("users.id"))  # Admin who uploaded
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    uploader = relationship("User")

class Assessment(Base):
    __tablename__ = "assessments"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    assessment_type = Column(String(20), nullable=False)  # phq9, gad7, ghq
    responses = Column(Text, nullable=False)  # JSON string of responses
    total_score = Column(Integer, nullable=False)
    severity_level = Column(String(50))  # minimal, mild, moderate, severe
    recommendations = Column(Text)
    completed_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="assessments")

class MoodEntry(Base):
    __tablename__ = "mood_entries"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    mood_score = Column(Integer, nullable=False)  # 1-10 scale
    energy_level = Column(Integer, nullable=False)  # 1-10 scale
    stress_level = Column(Integer, nullable=False)  # 1-10 scale
    sleep_hours = Column(Float)
    notes = Column(Text)
    date = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="mood_entries")

class Feedback(Base):
    __tablename__ = "feedback"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    counselor_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=True)
    session_date = Column(DateTime)
    feedback_type = Column(String(50), nullable=False)  # app, counselor, general
    rating = Column(Integer, nullable=False)  # 1-5 stars
    feedback_text = Column(Text)
    helpful_aspects = Column(Text)  # JSON array of helpful aspects
    improvement_suggestions = Column(Text)  # JSON array of suggestions
    would_recommend = Column(Boolean, default=True)
    counselor_response = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id], back_populates="feedback_given", overlaps="feedback_received")
    counselor = relationship("User", foreign_keys=[counselor_id], back_populates="feedback_received", overlaps="feedback_given")
    booking = relationship("Booking")

class Newsletter(Base):
    __tablename__ = "newsletters"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"))  # Admin who created
    published_at = Column(DateTime, default=datetime.utcnow)
    is_published = Column(Boolean, default=False)
    
    # Relationships
    author = relationship("User")

class CounselorReport(Base):
    __tablename__ = "counselor_reports"
    
    id = Column(Integer, primary_key=True, index=True)
    counselor_id = Column(Integer, ForeignKey("users.id"))
    patient_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String(200), nullable=False)
    report_type = Column(String(50), nullable=False)  # patient_progress, incident, treatment_plan, assessment
    content = Column(Text, nullable=False)
    recommendations = Column(Text)
    priority = Column(String(20), default="medium")  # low, medium, high
    status = Column(String(20), default="draft")  # draft, submitted, reviewed
    session_date = Column(DateTime)
    follow_up_required = Column(Boolean, default=False)
    next_session_date = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    submitted_at = Column(DateTime)
    reviewed_at = Column(DateTime)
    reviewed_by = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    counselor = relationship("User", foreign_keys=[counselor_id], overlaps="counselor_reports")
    patient = relationship("User", foreign_keys=[patient_id], overlaps="patient_reports")
    reviewer = relationship("User", foreign_keys=[reviewed_by])

class ForumPost(Base):
    __tablename__ = "forum_posts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    category = Column(String(50))  # academic_stress, social_anxiety, sleep_issues, relationship, other
    is_anonymous = Column(Boolean, default=True)
    is_flagged = Column(Boolean, default=False)
    flagged_reason = Column(String(200))
    flagged_by = Column(Integer, ForeignKey("users.id"))
    is_moderated = Column(Boolean, default=False)
    moderated_by = Column(Integer, ForeignKey("users.id"))
    moderation_action = Column(String(20))  # approved, removed, edited
    reply_count = Column(Integer, default=0)
    like_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    author = relationship("User", foreign_keys=[user_id], overlaps="forum_posts")
    flagger = relationship("User", foreign_keys=[flagged_by])
    moderator = relationship("User", foreign_keys=[moderated_by])
    replies = relationship("ForumReply", back_populates="post")

class ForumReply(Base):
    __tablename__ = "forum_replies"
    
    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("forum_posts.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    content = Column(Text, nullable=False)
    is_anonymous = Column(Boolean, default=True)
    is_flagged = Column(Boolean, default=False)
    like_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    post = relationship("ForumPost", back_populates="replies")
    author = relationship("User", foreign_keys=[user_id], overlaps="forum_replies")

class AdminAnalytics(Base):
    __tablename__ = "admin_analytics"
    
    id = Column(Integer, primary_key=True, index=True)
    metric_type = Column(String(50), nullable=False)  # mood_trends, forum_activity, appointment_stats
    metric_data = Column(Text, nullable=False)  # JSON data
    date_range_start = Column(DateTime, nullable=False)
    date_range_end = Column(DateTime, nullable=False)
    generated_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    generator = relationship("User")

# Add new relationships to User model
User.counselor_reports = relationship("CounselorReport", foreign_keys="CounselorReport.counselor_id")
User.patient_reports = relationship("CounselorReport", foreign_keys="CounselorReport.patient_id")
User.forum_posts = relationship("ForumPost", foreign_keys="ForumPost.user_id")
User.forum_replies = relationship("ForumReply")
