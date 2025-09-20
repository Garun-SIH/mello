from typing import List, Optional

from database import get_db
from fastapi import APIRouter, Depends, HTTPException
from models import Resource
from schemas import ResourceResponse
from sqlalchemy.orm import Session

router = APIRouter()


@router.get("/resources", response_model=List[ResourceResponse])
async def get_resources(
    category: Optional[str] = None,
    language: Optional[str] = None,
    resource_type: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """Get psychoeducational resources with optional filtering"""
    query = db.query(Resource)

    if category:
        query = query.filter(Resource.category == category)
    if language:
        query = query.filter(Resource.language == language)
    if resource_type:
        query = query.filter(Resource.type == resource_type)

    resources = query.all()
    return resources


@router.get("/resources/categories")
async def get_resource_categories(db: Session = Depends(get_db)):
    """Get all available resource categories"""
    categories = db.query(Resource.category).distinct().all()
    return {"categories": [cat[0] for cat in categories]}


@router.get("/resources/{resource_id}", response_model=ResourceResponse)
async def get_resource(resource_id: int, db: Session = Depends(get_db)):
    """Get a specific resource by ID"""
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    return resource
