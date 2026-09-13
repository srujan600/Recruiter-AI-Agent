from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import shutil
import uuid
import re
from ..database import get_db
from ..models import Candidate, Resume, Application, Job, ScreeningResult, CandidateNote, EventLog
from ..schemas import (
    CandidateResponse,
    CandidateCreate,
    ApplicationResponse,
    CandidateNoteResponse,
    CandidateNoteCreate
)
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

    # Log event
    db.add(EventLog(
        event_type="candidate_created",
        entity_type="candidate",
        entity_id=new_cand.id,
        description=f"Candidate {new_cand.full_name} profile created."
    ))
    db.commit()

    return new_cand

@router.post("/upload_resume")
def upload_resume(
    file: UploadFile = File(...),
    job_id: Optional[int] = Form(None),
    db: Session = Depends(get_db)
):
    if not file.filename.lower().endswith(('.pdf', '.docx', '.doc', '.txt')):
        raise HTTPException(status_code=400, detail="Unsupported file format. Please upload PDF, DOCX, or TXT resume.")

    # Sanitize uploaded filename using UUID to prevent overwrite and traversal
    clean_filename = re.sub(r"[^a-zA-Z0-9_\.-]", "_", file.filename)
    unique_filename = f"{uuid.uuid4()}_{clean_filename}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_ext = file.filename.split('.')[-1]
    parsed_text = extract_text_from_file(file_path, file_ext)
    parsed_data = parse_resume_content(parsed_text)

    # Real name extracted from parsed resume (never from filename!)
    cand_name = parsed_data.get("full_name") or "Candidate (Pending Review)"
    if cand_name in ["Resume", "Curriculum Vitae", "Cv"]:
        cand_name = "Candidate (Pending Review)"

    # Fallback to unique email placeholder if none found
    email = parsed_data.get("email")
    if not email or "@" not in email:
        email = f"unspecified_{uuid.uuid4().hex[:8]}@recruiter.internal"

    # Check if candidate already exists by email
    cand = db.query(Candidate).filter(Candidate.email == email).first()
    if not cand:
        cand = Candidate(
            full_name=cand_name,
            email=email,
            phone=parsed_data.get("phone") or "",
            total_experience_years=float(parsed_data.get("total_experience_years") or 5.0),
            location=parsed_data.get("location") or "San Francisco, CA",
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
        parsed_skills=parsed_data.get("skills", []),
        parsed_experience=parsed_data.get("parsed_experience", []),
        parsed_education=parsed_data.get("parsed_education", [])
    )
    db.add(new_resume)
    db.commit()

    # Link application to target job
    target_job = None
    if job_id:
        target_job = db.query(Job).filter(Job.id == job_id).first()
    if not target_job:
        target_job = db.query(Job).filter(Job.status == "active").first() or db.query(Job).first()

    if target_job:
        app = db.query(Application).filter(Application.candidate_id == cand.id, Application.job_id == target_job.id).first()
        if not app:
            screening = perform_ai_screening(
                candidate_data={
                    "full_name": cand.full_name,
                    "skills": parsed_data.get("skills", []),
                    "total_experience_years": parsed_data.get("total_experience_years", 5.0),
                    "notice_period_days": cand.notice_period_days
                },
                job_data={
                    "title": target_job.title,
                    "required_skills": target_job.required_skills,
                    "preferred_skills": target_job.preferred_skills,
                    "notice_period_days": target_job.notice_period_days,
                    "experience_level": target_job.experience_level
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

    # Write EventLog
    db.add(EventLog(
        event_type="resume_uploaded",
        entity_type="candidate",
        entity_id=cand.id,
        description=f"Uploaded and parsed resume for {cand.full_name} ({target_job.title if target_job else 'Target Requisition'})."
    ))
    db.commit()

    return {
        "message": "Resume uploaded and parsed successfully",
        "candidate_id": cand.id,
        "candidate_name": cand.full_name,
        "extracted_skills": parsed_data.get("skills", []),
        "target_job_id": target_job.id if target_job else None
    }

# ==============================
# Candidate Notes Endpoints
# ==============================
@router.get("/{candidate_id}/notes", response_model=List[CandidateNoteResponse])
def get_candidate_notes(candidate_id: int, db: Session = Depends(get_db)):
    cand = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not cand:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return db.query(CandidateNote).filter(CandidateNote.candidate_id == candidate_id).order_by(CandidateNote.created_at.desc()).all()

@router.post("/{candidate_id}/notes", response_model=CandidateNoteResponse, status_code=status.HTTP_201_CREATED)
def add_candidate_note(candidate_id: int, note_in: CandidateNoteCreate, db: Session = Depends(get_db)):
    cand = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not cand:
        raise HTTPException(status_code=404, detail="Candidate not found")

    new_note = CandidateNote(
        candidate_id=candidate_id,
        author_name=note_in.author_name or "Sarah Jenkins",
        note_text=note_in.note_text
    )
    db.add(new_note)
    db.commit()
    db.refresh(new_note)
    return new_note
