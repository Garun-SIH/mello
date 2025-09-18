from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from enum import Enum

class CounselorStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

# Chat schemas
class ChatMessage(BaseModel):
    message: str
    student_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    category: str
    escalate_to_counselor: bool = False

# User schemas
class UserCreate(BaseModel):
    student_id: str
    name: str
    email: str
    preferred_language: str = "en"

class UserResponse(BaseModel):
    id: int
    student_id: str
    name: str
    email: str
    preferred_language: str
    
    class Config:
        from_attributes = True

# Booking schemas
class BookingCreate(BaseModel):
    student_id: str
    counselor_id: int
    slot: datetime
    notes: Optional[str] = None

class BookingResponse(BaseModel):
    id: int
    student_id: str
    counselor_id: int
    slot: datetime
    status: str
    notes: Optional[str]
    counselor_name: str
    
    class Config:
        from_attributes = True

class CounselorResponse(BaseModel):
    id: int
    name: str
    specialization: str
    available_slots: str
    
    class Config:
        from_attributes = True

# Forum schemas
class PostCreate(BaseModel):
    alias: str
    content: str
    category: Optional[str] = "general"

class PostResponse(BaseModel):
    id: int
    alias: str
    content: str
    moderated: bool
    timestamp: datetime
    likes: int
    category: str
    
    class Config:
        from_attributes = True

# Resource schemas
class ResourceResponse(BaseModel):
    id: int
    title: str
    type: str
    language: str
    url: str
    description: Optional[str]
    category: str
    duration: Optional[str]
    
    class Config:
        from_attributes = True

# Analytics schemas
class AnalyticsResponse(BaseModel):
    total_interactions: int
    category_breakdown: dict
    total_bookings: int
    booking_status_breakdown: dict
    total_posts: int
    popular_resources: List[dict]

# Assessment schemas
class AssessmentSubmission(BaseModel):
    student_id: str
    assessment_type: str  # phq9, gad7, ghq
    responses: List[int]

class AssessmentResponse(BaseModel):
    id: int
    student_id: str
    assessment_type: str
    total_score: int
    severity_level: str
    recommendations: str
    completed_at: datetime
    
    class Config:
        from_attributes = True

class AssessmentHistory(BaseModel):
    assessments: List[AssessmentResponse]
    latest_scores: dict
