from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from datetime import datetime
from ..database import get_db
from ..models import Assessment, Application, Candidate, Job, EventLog
from ..schemas import AssessmentCreate, AssessmentResponse, AssessmentStatusUpdate

router = APIRouter(prefix="/api/v1/assessments", tags=["Assessments"])

@router.get("", response_model=List[AssessmentResponse])
def get_assessments(db: Session = Depends(get_db)):
    return (
        db.query(Assessment)
        .options(
            joinedload(Assessment.application).joinedload(Application.candidate),
            joinedload(Assessment.application).joinedload(Application.job)
        )
        .order_by(Assessment.created_at.desc())
        .all()
    )

@router.post("", response_model=AssessmentResponse, status_code=status.HTTP_201_CREATED)
def create_assessment(ass_in: AssessmentCreate, db: Session = Depends(get_db)):
    app = (
        db.query(Application)
        .options(joinedload(Application.candidate), joinedload(Application.job))
        .filter(Application.id == ass_in.application_id)
        .first()
    )
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

    cand_name = app.candidate.full_name if app.candidate else "Candidate"
    db.add(EventLog(
        event_type="assessment_assigned",
        entity_type="assessment",
        entity_id=new_ass.id,
        description=f"Assigned {new_ass.title} assessment to {cand_name}."
    ))
    db.commit()

    return new_ass

@router.patch("/{assessment_id}/status", response_model=AssessmentResponse)
def update_assessment_status(
    assessment_id: int,
    status_in: AssessmentStatusUpdate,
    db: Session = Depends(get_db)
):
    ass = (
        db.query(Assessment)
        .options(joinedload(Assessment.application).joinedload(Application.candidate))
        .filter(Assessment.id == assessment_id)
        .first()
    )
    if not ass:
        raise HTTPException(status_code=404, detail="Assessment not found")

    ass.status = status_in.status
    if status_in.score is not None:
        ass.score = status_in.score
    if status_in.summary:
        ass.summary = status_in.summary
    if status_in.status == "completed" and not ass.completed_at:
        ass.completed_at = datetime.utcnow()

    db.commit()
    db.refresh(ass)

    cand_name = ass.application.candidate.full_name if ass.application and ass.application.candidate else "Candidate"
    db.add(EventLog(
        event_type="assessment_completed" if status_in.status == "completed" else "assessment_updated",
        entity_type="assessment",
        entity_id=ass.id,
        description=f"{ass.title} for {cand_name} updated to {status_in.status} (Score: {ass.score or 'N/A'}/{ass.max_score})."
    ))
    db.commit()

    return ass

@router.patch("/{assessment_id}/complete", response_model=AssessmentResponse)
def complete_assessment(assessment_id: int, db: Session = Depends(get_db)):
    ass = (
        db.query(Assessment)
        .options(joinedload(Assessment.application).joinedload(Application.candidate))
        .filter(Assessment.id == assessment_id)
        .first()
    )
    if not ass:
        raise HTTPException(status_code=404, detail="Assessment not found")

    ass.status = "completed"
    if ass.score is None:
        ass.score = 90
    ass.completed_at = datetime.utcnow()
    if not ass.summary:
        ass.summary = "Candidate completed technical evaluation with high proficiency."

    db.commit()
    db.refresh(ass)

    cand_name = ass.application.candidate.full_name if ass.application and ass.application.candidate else "Candidate"
    db.add(EventLog(
        event_type="assessment_completed",
        entity_type="assessment",
        entity_id=ass.id,
        description=f"{cand_name} completed {ass.title} with score {ass.score}/{ass.max_score}."
    ))
    db.commit()

    return ass
