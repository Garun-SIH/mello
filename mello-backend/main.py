from database import engine
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from firebase_config import initialize_firebase
from models import Base
from routers import (
    admin,
    analytics,
    assessments,
    auth,
    booking,
    chat,
    counselor,
    feedback,
    forum,
    mood,
    newsletter,
    resources,
    user,
)

# Load environment variables
load_dotenv()

# Initialize Firebase with error handling
try:
    firebase_initialized = initialize_firebase()
    if not firebase_initialized:
        print(
            "Warning: Firebase initialization failed. Authentication features may not work."
        )
except Exception as e:
    print(
        f"Warning: Firebase initialization error: {str(e)}. Continuing without Firebase."
    )

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Mello - Digital Psychological Intervention System",
    description="MVP for Smart India Hackathon - Mental Health Support for College Students",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(booking.router, prefix="/api/booking", tags=["Booking"])
app.include_router(resources.router, prefix="/api/resources", tags=["Resources"])
app.include_router(forum.router, prefix="/api/forum", tags=["Forum"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(assessments.router, prefix="/api/assessments", tags=["Assessments"])
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(counselor.router, prefix="/api/counselor", tags=["Counselor"])
app.include_router(user.router, prefix="/api/user", tags=["User"])
app.include_router(mood.router, prefix="/api/mood", tags=["Mood Tracking"])
app.include_router(newsletter.router, prefix="/api/newsletter", tags=["Newsletter"])
app.include_router(feedback.router, prefix="/api/feedback", tags=["Feedback"])


@app.get("/")
async def root():
    return {"message": "Welcome to Mello - Digital Psychological Intervention System"}


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "mello-backend"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
