from datetime import datetime, timedelta
from typing import Optional

from auth import get_current_user
from database import get_db
from fastapi import APIRouter, Depends, HTTPException
from models import MoodEntry, User
from pydantic import BaseModel
from sqlalchemy import and_, func
from sqlalchemy.orm import Session

router = APIRouter()


class MoodEntryCreate(BaseModel):
    mood_score: int  # 1-10 scale
    energy_level: int  # 1-10 scale
    stress_level: int  # 1-10 scale
    sleep_hours: Optional[float] = None
    notes: Optional[str] = None


class MoodEntryUpdate(BaseModel):
    mood_score: Optional[int] = None
    energy_level: Optional[int] = None
    stress_level: Optional[int] = None
    sleep_hours: Optional[float] = None
    notes: Optional[str] = None


@router.post("/")
async def create_mood_entry(
    mood_data: MoodEntryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new mood entry"""
    # Check if user already has an entry for today
    today = datetime.now().date()
    existing_entry = (
        db.query(MoodEntry)
        .filter(
            and_(
                MoodEntry.user_id == current_user.id, func.date(MoodEntry.date) == today
            )
        )
        .first()
    )

    if existing_entry:
        raise HTTPException(
            status_code=400,
            detail="Mood entry for today already exists. Use PUT to update.",
        )

    new_entry = MoodEntry(
        user_id=current_user.id,
        date=datetime.now(),
        mood_score=mood_data.mood_score,
        energy_level=mood_data.energy_level,
        stress_level=mood_data.stress_level,
        sleep_hours=mood_data.sleep_hours,
        notes=mood_data.notes,
    )

    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)

    return {"message": "Mood entry created successfully", "entry_id": new_entry.id}


@router.get("/")
async def get_mood_entries(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    days: int = 30,
):
    """Get user's mood entries for the last N days"""
    start_date = datetime.now() - timedelta(days=days)

    entries = (
        db.query(MoodEntry)
        .filter(
            and_(MoodEntry.user_id == current_user.id, MoodEntry.date >= start_date)
        )
        .order_by(MoodEntry.date.desc())
        .all()
    )

    return [
        {
            "id": entry.id,
            "date": entry.date.strftime("%Y-%m-%d"),
            "mood_score": entry.mood_score,
            "energy_level": entry.energy_level,
            "stress_level": entry.stress_level,
            "sleep_hours": entry.sleep_hours,
            "notes": entry.notes,
        }
        for entry in entries
    ]


@router.get("/today")
async def get_today_mood_entry(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """Get today's mood entry if it exists"""
    today = datetime.now().date()
    entry = (
        db.query(MoodEntry)
        .filter(
            and_(
                MoodEntry.user_id == current_user.id, func.date(MoodEntry.date) == today
            )
        )
        .first()
    )

    if not entry:
        return {"entry": None}

    return {
        "entry": {
            "id": entry.id,
            "date": entry.date.strftime("%Y-%m-%d"),
            "mood_score": entry.mood_score,
            "energy_level": entry.energy_level,
            "stress_level": entry.stress_level,
            "sleep_hours": entry.sleep_hours,
            "notes": entry.notes,
        }
    }


@router.put("/{entry_id}")
async def update_mood_entry(
    entry_id: int,
    mood_data: MoodEntryUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update a mood entry"""
    entry = (
        db.query(MoodEntry)
        .filter(and_(MoodEntry.id == entry_id, MoodEntry.user_id == current_user.id))
        .first()
    )

    if not entry:
        raise HTTPException(status_code=404, detail="Mood entry not found")

    # Update only provided fields
    if mood_data.mood_score is not None:
        entry.mood_score = mood_data.mood_score
    if mood_data.energy_level is not None:
        entry.energy_level = mood_data.energy_level
    if mood_data.stress_level is not None:
        entry.stress_level = mood_data.stress_level
    if mood_data.sleep_hours is not None:
        entry.sleep_hours = mood_data.sleep_hours
    if mood_data.notes is not None:
        entry.notes = mood_data.notes

    db.commit()
    return {"message": "Mood entry updated successfully"}


@router.get("/analytics")
async def get_mood_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    days: int = 30,
):
    """Get mood analytics for the user"""
    start_date = datetime.now() - timedelta(days=days)

    entries = (
        db.query(MoodEntry)
        .filter(
            and_(MoodEntry.user_id == current_user.id, MoodEntry.date >= start_date)
        )
        .all()
    )

    if not entries:
        return {"total_entries": 0, "averages": {}, "trends": []}

    # Calculate averages
    total_mood = sum(entry.mood_score for entry in entries)
    total_energy = sum(entry.energy_level for entry in entries)
    total_stress = sum(entry.stress_level for entry in entries)
    total_sleep = sum(entry.sleep_hours for entry in entries if entry.sleep_hours)
    sleep_entries = len([e for e in entries if e.sleep_hours])

    count = len(entries)

    averages = {
        "mood": round(total_mood / count, 2),
        "energy": round(total_energy / count, 2),
        "stress": round(total_stress / count, 2),
        "sleep": round(total_sleep / sleep_entries, 2) if sleep_entries > 0 else 0,
    }

    # Weekly trends
    weekly_data = (
        db.query(
            func.date_trunc("week", MoodEntry.date).label("week"),
            func.avg(MoodEntry.mood_score).label("avg_mood"),
            func.avg(MoodEntry.energy_level).label("avg_energy"),
            func.avg(MoodEntry.stress_level).label("avg_stress"),
        )
        .filter(
            and_(MoodEntry.user_id == current_user.id, MoodEntry.date >= start_date)
        )
        .group_by(func.date_trunc("week", MoodEntry.date))
        .order_by("week")
        .all()
    )

    trends = [
        {
            "week": str(week.week),
            "avg_mood": round(float(week.avg_mood), 2),
            "avg_energy": round(float(week.avg_energy), 2),
            "avg_stress": round(float(week.avg_stress), 2),
        }
        for week in weekly_data
    ]

    return {"total_entries": count, "averages": averages, "trends": trends}


@router.delete("/{entry_id}")
async def delete_mood_entry(
    entry_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a mood entry"""
    entry = (
        db.query(MoodEntry)
        .filter(and_(MoodEntry.id == entry_id, MoodEntry.user_id == current_user.id))
        .first()
    )

    if not entry:
        raise HTTPException(status_code=404, detail="Mood entry not found")

    db.delete(entry)
    db.commit()
    return {"message": "Mood entry deleted successfully"}
