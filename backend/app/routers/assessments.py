from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Assessment, Application
from ..schemas import AssessmentCreate, AssessmentResponse

router = APIRouter(prefix="/api/v1/assessments", tags=["Assessments"])

@router.get("", response_model=List[AssessmentResponse])
def get_assessments(db: Session = Depends(get_db)):
    return db.query(Assessment).order_by(Assessment.created_at.desc()).all()

@router.post("", response_model=AssessmentResponse, status_code=status.HTTP_201_CREATED)
def create_assessment(ass_in: AssessmentCreate, db: Session = Depends(get_db)):
    app = db.query(Application).filter(Application.id == ass_in.application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    new_ass = Assessment(
        **ass_in.dict(),
        status="pending"
    )
    app.stage = "Assessment"
    db.add(new_ass)
    db.commit()
    db.refresh(new_ass)
    return new_ass
