from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Interview, Application, Candidate, Notification
from ..schemas import InterviewCreate, InterviewResponse

router = APIRouter(prefix="/api/v1/interviews", tags=["Interviews"])

@router.get("", response_model=List[InterviewResponse])
def get_interviews(db: Session = Depends(get_db)):
    return db.query(Interview).order_by(Interview.scheduled_at.asc()).all()

@router.post("", response_model=InterviewResponse, status_code=status.HTTP_201_CREATED)
def create_interview(inv_in: InterviewCreate, db: Session = Depends(get_db)):
    app = db.query(Application).filter(Application.id == inv_in.application_id).first()
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

    # Notify
    db.add(Notification(
        title="Interview Scheduled",
        message=f"Scheduled {new_inv.interview_type} with {app.candidate.full_name} for {new_inv.scheduled_at.strftime('%b %d, %Y')}.",
        notification_type="info"
    ))
    db.commit()

    return new_inv

@router.patch("/{interview_id}/cancel")
def cancel_interview(interview_id: int, db: Session = Depends(get_db)):
    inv = db.query(Interview).filter(Interview.id == interview_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Interview not found")
    inv.status = "cancelled"
    db.commit()
    return {"message": "Interview cancelled successfully"}
