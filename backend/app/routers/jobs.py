from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from ..database import get_db
from ..models import Job, Application, EventLog
from ..schemas import JobCreate, JobResponse, JobStatusUpdate

router = APIRouter(prefix="/api/v1/jobs", tags=["Jobs"])

@router.get("", response_model=List[JobResponse])
def get_jobs(db: Session = Depends(get_db)):
    jobs = db.query(Job).order_by(Job.created_at.desc()).all()
    app_counts = dict(
        db.query(Application.job_id, func.count(Application.id))
        .group_by(Application.job_id)
        .all()
    )
    res = []
    for j in jobs:
        j_dict = JobResponse.from_orm(j)
        j_dict.applicant_count = app_counts.get(j.id, 0)
        res.append(j_dict)
    return res

@router.get("/{job_id}", response_model=JobResponse)
def get_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    count = db.query(func.count(Application.id)).filter(Application.job_id == job_id).scalar() or 0
    j_dict = JobResponse.from_orm(job)
    j_dict.applicant_count = count
    return j_dict

@router.post("", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
def create_job(job_in: JobCreate, db: Session = Depends(get_db)):
    new_job = Job(**job_in.dict())
    db.add(new_job)
    db.commit()
    db.refresh(new_job)

    db.add(EventLog(
        event_type="job_created",
        entity_type="job",
        entity_id=new_job.id,
        description=f"Job opening created: {new_job.title} in {new_job.department}."
    ))
    db.commit()

    j_dict = JobResponse.from_orm(new_job)
    j_dict.applicant_count = 0
    return j_dict

@router.put("/{job_id}", response_model=JobResponse)
def update_job(job_id: int, job_in: JobCreate, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    for field, val in job_in.dict().items():
        setattr(job, field, val)
    db.commit()
    db.refresh(job)
    count = db.query(Application).filter(Application.job_id == job_id).count()
    j_dict = JobResponse.from_orm(job)
    j_dict.applicant_count = count
    return j_dict

@router.patch("/{job_id}/status", response_model=JobResponse)
def update_job_status(job_id: int, status_in: JobStatusUpdate, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    old_status = job.status
    job.status = status_in.status
    db.commit()
    db.refresh(job)

    db.add(EventLog(
        event_type="job_status_changed",
        entity_type="job",
        entity_id=job.id,
        description=f"Job {job.title} status changed from {old_status} to {job.status}."
    ))
    db.commit()

    count = db.query(Application).filter(Application.job_id == job_id).count()
    j_dict = JobResponse.from_orm(job)
    j_dict.applicant_count = count
    return j_dict

@router.delete("/{job_id}")
def delete_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    title = job.title
    db.delete(job)
    db.commit()

    db.add(EventLog(
        event_type="job_deleted",
        entity_type="job",
        entity_id=job_id,
        description=f"Job {title} was removed."
    ))
    db.commit()

    return {"message": "Job deleted successfully"}
