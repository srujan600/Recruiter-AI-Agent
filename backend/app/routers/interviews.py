from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from ..database import get_db
from ..models import Interview, Application, Candidate, Notification, EventLog
from ..schemas import InterviewCreate, InterviewResponse, InterviewStatusUpdate

router = APIRouter(prefix="/api/v1/interviews", tags=["Interviews"])

@router.get("", response_model=List[InterviewResponse])
def get_interviews(db: Session = Depends(get_db)):
    return (
        db.query(Interview)
        .options(
            joinedload(Interview.application).joinedload(Application.candidate),
            joinedload(Interview.application).joinedload(Application.job)
        )
        .order_by(Interview.scheduled_at.asc())
        .all()
    )

@router.post("", response_model=InterviewResponse, status_code=status.HTTP_201_CREATED)
def create_interview(inv_in: InterviewCreate, db: Session = Depends(get_db)):
    app = (
        db.query(Application)
        .options(joinedload(Application.candidate), joinedload(Application.job))
        .filter(Application.id == inv_in.application_id)
        .first()
    )
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    new_inv = Interview(
        **inv_in.dict(),
        status="scheduled"
    )
    # Move stage to Interview
    app.stage = "Interview"
    
    db.add(new_inv)
    db.commit()
    db.refresh(new_inv)

    cand_name = app.candidate.full_name if app.candidate else "Candidate"
    job_title = app.job.title if app.job else "Requisition"

    # Notify
    db.add(Notification(
        title="Interview Scheduled",
        message=f"Scheduled {new_inv.interview_type} with {cand_name} for {new_inv.scheduled_at.strftime('%b %d, %Y')}.",
        notification_type="info"
    ))
    db.add(EventLog(
        event_type="interview_scheduled",
        entity_type="interview",
        entity_id=new_inv.id,
        description=f"Interview scheduled for {cand_name} ({job_title}) with {new_inv.interviewer_name}."
    ))
    db.commit()

    return new_inv

@router.patch("/{interview_id}/status", response_model=InterviewResponse)
def update_interview_status(
    interview_id: int,
    status_in: InterviewStatusUpdate,
    db: Session = Depends(get_db)
):
    inv = (
        db.query(Interview)
        .options(joinedload(Interview.application).joinedload(Application.candidate))
        .filter(Interview.id == interview_id)
        .first()
    )
    if not inv:
        raise HTTPException(status_code=404, detail="Interview not found")

    inv.status = status_in.status
    if status_in.notes:
        inv.notes = status_in.notes
    db.commit()
    db.refresh(inv)

    cand_name = inv.application.candidate.full_name if inv.application and inv.application.candidate else "Candidate"
    db.add(EventLog(
        event_type=f"interview_{status_in.status.lower()}",
        entity_type="interview",
        entity_id=inv.id,
        description=f"Interview for {cand_name} marked as {status_in.status}."
    ))
    db.commit()

    return inv

@router.patch("/{interview_id}/cancel")
def cancel_interview(interview_id: int, db: Session = Depends(get_db)):
    inv = (
        db.query(Interview)
        .options(joinedload(Interview.application).joinedload(Application.candidate))
        .filter(Interview.id == interview_id)
        .first()
    )
    if not inv:
        raise HTTPException(status_code=404, detail="Interview not found")
    inv.status = "cancelled"
    db.commit()

    cand_name = inv.application.candidate.full_name if inv.application and inv.application.candidate else "Candidate"
    db.add(EventLog(
        event_type="interview_cancelled",
        entity_type="interview",
        entity_id=inv.id,
        description=f"Interview for {cand_name} was cancelled."
    ))
    db.commit()

    return {"message": "Interview cancelled successfully", "interview_id": interview_id, "status": "cancelled"}

@router.patch("/{interview_id}/complete")
def complete_interview(interview_id: int, db: Session = Depends(get_db)):
    inv = (
        db.query(Interview)
        .options(joinedload(Interview.application).joinedload(Application.candidate))
        .filter(Interview.id == interview_id)
        .first()
    )
    if not inv:
        raise HTTPException(status_code=404, detail="Interview not found")
    inv.status = "completed"
    db.commit()

    cand_name = inv.application.candidate.full_name if inv.application and inv.application.candidate else "Candidate"
    db.add(EventLog(
        event_type="interview_completed",
        entity_type="interview",
        entity_id=inv.id,
        description=f"Technical interview for {cand_name} successfully completed."
    ))
    db.commit()

    return {"message": "Interview marked as completed", "interview_id": interview_id, "status": "completed"}
