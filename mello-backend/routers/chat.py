import os
from datetime import datetime

import google.generativeai as genai
from database import get_db
from fastapi import APIRouter, Depends, HTTPException
from models import ChatbotLog, User
from schemas import ChatMessage, ChatResponse
from sqlalchemy.orm import Session

router = APIRouter()

# Configure Gemini AI
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-1.5-flash")


def categorize_message(message: str) -> str:
    """Categorize the user message into predefined categories"""
    message_lower = message.lower()

    if any(
        word in message_lower
        for word in ["stress", "stressed", "pressure", "overwhelm"]
    ):
        return "stress"
    elif any(
        word in message_lower for word in ["sleep", "insomnia", "tired", "exhausted"]
    ):
        return "sleep"
    elif any(
        word in message_lower
        for word in ["anxiety", "anxious", "worry", "nervous", "exam"]
    ):
        return "anxiety"
    elif any(word in message_lower for word in ["sad", "depressed", "lonely", "down"]):
        return "depression"
    else:
        return "general"


def should_escalate(message: str, response: str) -> bool:
    """Determine if the conversation should be escalated to a counselor"""
    escalation_keywords = [
        "suicide",
        "kill myself",
        "end it all",
        "not worth living",
        "severe depression",
        "can't cope",
        "emergency",
        "crisis",
    ]

    message_lower = message.lower()
    return any(keyword in message_lower for keyword in escalation_keywords)


@router.post("/", response_model=ChatResponse)
async def chat_with_bot(chat_message: ChatMessage, db: Session = Depends(get_db)):
    try:
        # Create system prompt for psychological support
        system_prompt = """You are Mello, a supportive AI assistant for college students' mental health. 
        Provide empathetic, helpful responses for stress, anxiety, sleep issues, and academic pressure.
        Keep responses concise (2-3 sentences) and answer in same language of the user,be supportive, and include practical coping strategies.
        If someone mentions severe issues like suicide, recommend seeking professional help immediately.
        Always maintain a warm, understanding tone."""

        # Generate response using Gemini
        full_prompt = f"{system_prompt}\n\nStudent: {chat_message.message}\n\nMello:"
        response = model.generate_content(full_prompt)
        bot_response = response.text

        # Categorize the message
        category = categorize_message(chat_message.message)

        # Check if escalation is needed
        escalate = should_escalate(chat_message.message, bot_response)

        if escalate:
            bot_response += "\n\nI'm concerned about what you're sharing. Please consider booking a session with one of our counselors who can provide professional support."

        # Save to database if student_id is provided
        if chat_message.student_id:
            # Check if user exists, create if not
            user = (
                db.query(User)
                .filter(User.firebase_uid == chat_message.student_id)
                .first()
            )
            if not user:
                user = User(
                    firebase_uid=chat_message.student_id,
                    name=f"Student_{chat_message.student_id}",
                    email=f"{chat_message.student_id}@college.edu",
                )
                db.add(user)
                db.commit()
                db.refresh(user)

            # Log the conversation
            chat_log = ChatbotLog(
                user_id=user.id,
                message=chat_message.message,
                response=bot_response,
                category=category,
                timestamp=datetime.utcnow(),
            )
            db.add(chat_log)
            db.commit()

        return ChatResponse(
            response=bot_response, category=category, escalate_to_counselor=escalate
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing chat: {str(e)}")


@router.get("/history/{student_id}")
async def get_chat_history(student_id: str, db: Session = Depends(get_db)):
    """Get chat history for a student"""
    # Find user by firebase_uid
    user = db.query(User).filter(User.firebase_uid == student_id).first()
    if not user:
        return []

    logs = (
        db.query(ChatbotLog)
        .filter(ChatbotLog.user_id == user.id)
        .order_by(ChatbotLog.timestamp.desc())
        .limit(20)
        .all()
    )

    return [
        {
            "message": log.message,
            "response": log.response,
            "category": log.category,
            "timestamp": log.timestamp,
        }
        for log in logs
    ]
