from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import shutil
from ..database import get_db
from ..models import Candidate, Resume, Application, Job, ScreeningResult
from ..schemas import CandidateResponse, CandidateCreate, ApplicationResponse
from ..services.resume_parser import extract_text_from_file, parse_resume_content
from ..services.ai_screener import perform_ai_screening

router = APIRouter(prefix="/api/v1/candidates", tags=["Candidates"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "scratch", "uploaded_resumes")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("", response_model=List[CandidateResponse])
def get_candidates(
    q: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    query = db.query(Candidate)
    if q:
        search_filter = f"%{q.strip()}%"
        query = query.filter(
            (Candidate.full_name.ilike(search_filter)) |
            (Candidate.current_role.ilike(search_filter)) |
            (Candidate.location.ilike(search_filter)) |
            (Candidate.email.ilike(search_filter))
        )
    return query.order_by(Candidate.created_at.desc()).offset(offset).limit(limit).all()

@router.get("/{candidate_id}", response_model=CandidateResponse)
def get_candidate(candidate_id: int, db: Session = Depends(get_db)):
    cand = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not cand:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return cand

@router.post("", response_model=CandidateResponse, status_code=status.HTTP_201_CREATED)
def create_candidate(cand_in: CandidateCreate, db: Session = Depends(get_db)):
    new_cand = Candidate(**cand_in.dict())
    db.add(new_cand)
    db.commit()
    db.refresh(new_cand)

    # Automatically create application for default active job
    active_job = db.query(Job).filter(Job.status == "active").first()
    if active_job:
        app = Application(
            job_id=active_job.id,
            candidate_id=new_cand.id,
            stage="Applied",
            match_score=85,
            ats_score=88
        )
        db.add(app)
        db.commit()
        db.refresh(app)

        # Generate default screening result
        screening = perform_ai_screening(
            candidate_data=cand_in.dict(),
            job_data={
                "title": active_job.title,
                "required_skills": active_job.required_skills,
                "preferred_skills": active_job.preferred_skills,
                "notice_period_days": active_job.notice_period_days
            }
        )
        sr = ScreeningResult(
            application_id=app.id,
            overall_match_score=screening["overall_match_score"],
            ats_score=screening["ats_score"],
            skill_match_score=screening["skill_match_score"],
            experience_match_score=screening["experience_match_score"],
            education_match_score=screening["education_match_score"],
            requirement_match_score=screening["requirement_match_score"],
            key_strengths=screening["key_strengths"],
            missing_skills=screening["missing_skills"],
            ai_rationale=screening["ai_rationale"]
        )
        db.add(sr)
        db.commit()

    return new_cand

@router.post("/upload_resume")
def upload_resume(
    file: UploadFile = File(...),
    job_id: Optional[int] = Form(None),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith(('.pdf', '.docx', '.doc', '.txt')):
        raise HTTPException(status_code=400, detail="Unsupported file format. Please upload PDF or DOCX resume.")

    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_ext = file.filename.split('.')[-1]
    parsed_text = extract_text_from_file(file_path, file_ext)
    parsed_data = parse_resume_content(parsed_text)

    cand_name = os.path.splitext(file.filename)[0].replace('_', ' ').replace('-', ' ').title()
    
    # Check if candidate already exists by email
    cand = db.query(Candidate).filter(Candidate.email == parsed_data["email"]).first()
    if not cand:
        cand = Candidate(
            full_name=cand_name,
            email=parsed_data["email"],
            phone=parsed_data["phone"],
            total_experience_years=parsed_data["total_experience_years"],
            location="San Francisco, CA",
            avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
        )
        db.add(cand)
        db.commit()
        db.refresh(cand)

    new_resume = Resume(
        candidate_id=cand.id,
        filename=file.filename,
        file_path=file_path,
        file_type=file_ext,
        parsed_text=parsed_text,
        parsed_skills=parsed_data["skills"],
        parsed_experience=parsed_data["parsed_experience"],
        parsed_education=parsed_data["parsed_education"]
    )
    db.add(new_resume)
    db.commit()

    # Link application
    target_job = db.query(Job).filter(Job.id == job_id).first() if job_id else db.query(Job).first()
    if target_job:
        app = db.query(Application).filter(Application.candidate_id == cand.id, Application.job_id == target_job.id).first()
        if not app:
            screening = perform_ai_screening(
                candidate_data={
                    "full_name": cand.full_name,
                    "skills": parsed_data["skills"],
                    "total_experience_years": parsed_data["total_experience_years"],
                    "notice_period_days": cand.notice_period_days
                },
                job_data={
                    "title": target_job.title,
                    "required_skills": target_job.required_skills,
                    "preferred_skills": target_job.preferred_skills,
                    "notice_period_days": target_job.notice_period_days
                }
            )
            app = Application(
                job_id=target_job.id,
                candidate_id=cand.id,
                stage="AI Screening",
                match_score=screening["overall_match_score"],
                ats_score=screening["ats_score"]
            )
            db.add(app)
            db.commit()
            db.refresh(app)

            sr = ScreeningResult(
                application_id=app.id,
                overall_match_score=screening["overall_match_score"],
                ats_score=screening["ats_score"],
                skill_match_score=screening["skill_match_score"],
                experience_match_score=screening["experience_match_score"],
                education_match_score=screening["education_match_score"],
                requirement_match_score=screening["requirement_match_score"],
                key_strengths=screening["key_strengths"],
                missing_skills=screening["missing_skills"],
                ai_rationale=screening["ai_rationale"]
            )
            db.add(sr)
            db.commit()

    return {
        "message": "Resume uploaded and parsed successfully",
        "candidate_id": cand.id,
        "candidate_name": cand.full_name,
        "extracted_skills": parsed_data["skills"]
    }
