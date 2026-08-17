from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models import Application, Candidate, Job, ScreeningResult
from ..schemas import ApplicationResponse, PipelineStageUpdate

router = APIRouter(prefix="/api/v1/pipeline", tags=["Pipeline"])

@router.get("", response_model=List[ApplicationResponse])
def get_pipeline(job_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(Application)
    if job_id:
        query = query.filter(Application.job_id == job_id)
    apps = query.order_by(Application.match_score.desc()).all()

    res = []
    for app in apps:
        app_dict = ApplicationResponse(
            id=app.id,
            job_id=app.job_id,
            candidate_id=app.candidate_id,
            stage=app.stage,
            match_score=app.match_score,
            ats_score=app.ats_score,
            applied_at=app.applied_at,
            candidate=app.candidate,
            job_title=app.job.title if app.job else "Target Role"
        )
        res.append(app_dict)
    return res

@router.patch("/{application_id}/stage", response_model=ApplicationResponse)
def update_application_stage(
    application_id: int,
    stage_in: PipelineStageUpdate,
    db: Session = Depends(get_db)
):
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    valid_stages = ["Applied", "AI Screening", "Shortlisted", "Assessment", "Interview", "Offer", "Hired", "Rejected"]
    if stage_in.stage not in valid_stages:
        raise HTTPException(status_code=400, detail=f"Invalid pipeline stage: {stage_in.stage}")

    app.stage = stage_in.stage
    db.commit()
    db.refresh(app)

    return ApplicationResponse(
        id=app.id,
        job_id=app.job_id,
        candidate_id=app.candidate_id,
        stage=app.stage,
        match_score=app.match_score,
        ats_score=app.ats_score,
        applied_at=app.applied_at,
        candidate=app.candidate,
        job_title=app.job.title if app.job else "Target Role"
    )
