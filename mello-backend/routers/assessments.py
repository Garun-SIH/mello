from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import json
from datetime import datetime

from database import get_db
from models import Assessment, User
from schemas import AssessmentSubmission, AssessmentResponse, AssessmentHistory

router = APIRouter()

# Assessment scoring logic
def calculate_phq9_score(responses):
    """Calculate PHQ-9 depression score and severity"""
    total_score = sum(responses)
    
    if total_score <= 4:
        severity = "Minimal depression"
        recommendations = "Your responses suggest minimal depression symptoms. Continue maintaining good mental health habits."
    elif total_score <= 9:
        severity = "Mild depression"
        recommendations = "Your responses suggest mild depression symptoms. Consider speaking with a counselor or trying stress-reduction techniques."
    elif total_score <= 14:
        severity = "Moderate depression"
        recommendations = "Your responses suggest moderate depression symptoms. We recommend booking a session with one of our counselors for professional support."
    elif total_score <= 19:
        severity = "Moderately severe depression"
        recommendations = "Your responses suggest moderately severe depression symptoms. Please consider booking a counselor session and speaking with a healthcare provider."
    else:
        severity = "Severe depression"
        recommendations = "Your responses suggest severe depression symptoms. Please seek immediate professional help and consider booking an urgent counselor session."
    
    return total_score, severity, recommendations

def calculate_gad7_score(responses):
    """Calculate GAD-7 anxiety score and severity"""
    total_score = sum(responses)
    
    if total_score <= 4:
        severity = "Minimal anxiety"
        recommendations = "Your responses suggest minimal anxiety symptoms. Keep up your current coping strategies."
    elif total_score <= 9:
        severity = "Mild anxiety"
        recommendations = "Your responses suggest mild anxiety symptoms. Try relaxation techniques and consider our wellness resources."
    elif total_score <= 14:
        severity = "Moderate anxiety"
        recommendations = "Your responses suggest moderate anxiety symptoms. We recommend booking a counselor session and exploring our anxiety resources."
    else:
        severity = "Severe anxiety"
        recommendations = "Your responses suggest severe anxiety symptoms. Please book a counselor session and consider speaking with a healthcare provider."
    
    return total_score, severity, recommendations

def calculate_ghq_score(responses):
    """Calculate GHQ-12 general health score and severity"""
    # GHQ uses 0-0-1-1 scoring method
    ghq_responses = []
    for response in responses:
        if response <= 1:
            ghq_responses.append(0)
        else:
            ghq_responses.append(1)
    
    total_score = sum(ghq_responses)
    
    if total_score <= 2:
        severity = "Good mental health"
        recommendations = "Your responses suggest good overall mental health. Continue your current wellness practices."
    elif total_score <= 5:
        severity = "Mild distress"
        recommendations = "Your responses suggest mild psychological distress. Consider our wellness resources and stress management techniques."
    elif total_score <= 8:
        severity = "Moderate distress"
        recommendations = "Your responses suggest moderate psychological distress. We recommend booking a counselor session for support."
    else:
        severity = "Severe distress"
        recommendations = "Your responses suggest significant psychological distress. Please book a counselor session and consider professional help."
    
    return total_score, severity, recommendations

@router.post("/submit", response_model=AssessmentResponse)
async def submit_assessment(assessment: AssessmentSubmission, db: Session = Depends(get_db)):
    """Submit a completed mental health assessment"""
    try:
        # Check if user exists, create if not
        user = db.query(User).filter(User.firebase_uid == assessment.student_id).first()
        if not user:
            user = User(
                firebase_uid=assessment.student_id,
                name=f"Student_{assessment.student_id}",
                email=f"{assessment.student_id}@college.edu"
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        
        # Calculate score based on assessment type
        if assessment.assessment_type == "phq9":
            if len(assessment.responses) != 9:
                raise HTTPException(status_code=400, detail="PHQ-9 requires exactly 9 responses")
            total_score, severity, recommendations = calculate_phq9_score(assessment.responses)
        elif assessment.assessment_type == "gad7":
            if len(assessment.responses) != 7:
                raise HTTPException(status_code=400, detail="GAD-7 requires exactly 7 responses")
            total_score, severity, recommendations = calculate_gad7_score(assessment.responses)
        elif assessment.assessment_type == "ghq":
            if len(assessment.responses) != 12:
                raise HTTPException(status_code=400, detail="GHQ-12 requires exactly 12 responses")
            total_score, severity, recommendations = calculate_ghq_score(assessment.responses)
        else:
            raise HTTPException(status_code=400, detail="Invalid assessment type")
        
        # Save assessment
        new_assessment = Assessment(
            user_id=user.id,
            assessment_type=assessment.assessment_type,
            responses=json.dumps(assessment.responses),
            total_score=total_score,
            severity_level=severity,
            recommendations=recommendations,
            completed_at=datetime.utcnow()
        )
        
        db.add(new_assessment)
        db.commit()
        db.refresh(new_assessment)
        
        return new_assessment
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error submitting assessment: {str(e)}")

@router.get("/history/{student_id}", response_model=AssessmentHistory)
async def get_assessment_history(student_id: str, db: Session = Depends(get_db)):
    """Get assessment history for a student"""
    # Find user by firebase_uid
    user = db.query(User).filter(User.firebase_uid == student_id).first()
    if not user:
        return AssessmentHistory(assessments=[], latest_scores={})
    
    assessments = db.query(Assessment).filter(
        Assessment.user_id == user.id
    ).order_by(Assessment.completed_at.desc()).all()
    
    # Get latest scores for each assessment type
    latest_scores = {}
    for assessment_type in ["phq9", "gad7", "ghq"]:
        latest = db.query(Assessment).filter(
            Assessment.user_id == user.id,
            Assessment.assessment_type == assessment_type
        ).order_by(Assessment.completed_at.desc()).first()
        
        if latest:
            latest_scores[assessment_type] = {
                "score": latest.total_score,
                "severity": latest.severity_level,
                "date": latest.completed_at
            }
    
    return AssessmentHistory(
        assessments=assessments,
        latest_scores=latest_scores
    )

@router.get("/questions/{assessment_type}")
async def get_assessment_questions(assessment_type: str):
    """Get questions for a specific assessment type"""
    
    if assessment_type == "phq9":
        return {
            "title": "PHQ-9 Depression Assessment",
            "description": "Over the last 2 weeks, how often have you been bothered by any of the following problems?",
            "scale": ["Not at all", "Several days", "More than half the days", "Nearly every day"],
            "questions": [
                "Little interest or pleasure in doing things",
                "Feeling down, depressed, or hopeless",
                "Trouble falling or staying asleep, or sleeping too much",
                "Feeling tired or having little energy",
                "Poor appetite or overeating",
                "Feeling bad about yourself or that you are a failure or have let yourself or your family down",
                "Trouble concentrating on things, such as reading the newspaper or watching television",
                "Moving or speaking so slowly that other people could have noticed, or the opposite being so fidgety or restless that you have been moving around a lot more than usual",
                "Thoughts that you would be better off dead, or of hurting yourself"
            ]
        }
    elif assessment_type == "gad7":
        return {
            "title": "GAD-7 Anxiety Assessment",
            "description": "Over the last 2 weeks, how often have you been bothered by the following problems?",
            "scale": ["Not at all", "Several days", "More than half the days", "Nearly every day"],
            "questions": [
                "Feeling nervous, anxious, or on edge",
                "Not being able to stop or control worrying",
                "Worrying too much about different things",
                "Trouble relaxing",
                "Being so restless that it is hard to sit still",
                "Becoming easily annoyed or irritable",
                "Feeling afraid, as if something awful might happen"
            ]
        }
    elif assessment_type == "ghq":
        return {
            "title": "GHQ-12 General Health Questionnaire",
            "description": "Have you recently:",
            "scale": ["Better than usual", "Same as usual", "Less than usual", "Much less than usual"],
            "questions": [
                "Been able to concentrate on whatever you're doing?",
                "Lost much sleep over worry?",
                "Felt that you were playing a useful part in things?",
                "Felt capable of making decisions about things?",
                "Felt constantly under strain?",
                "Felt you couldn't overcome your difficulties?",
                "Been able to enjoy your normal day-to-day activities?",
                "Been able to face up to problems?",
                "Been feeling unhappy or depressed?",
                "Been losing confidence in yourself?",
                "Been thinking of yourself as a worthless person?",
                "Been feeling reasonably happy, all things considered?"
            ]
        }
    else:
        raise HTTPException(status_code=404, detail="Assessment type not found")
