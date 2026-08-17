from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import ScreeningResult, Application, Candidate, Job
from ..schemas import ScreeningResultResponse
from ..services.ai_screener import perform_ai_screening

router = APIRouter(prefix="/api/v1/screening", tags=["AI Screening"])

@router.get("/{candidate_id}", response_model=ScreeningResultResponse)
def get_candidate_screening(candidate_id: int, db: Session = Depends(get_db)):
    app = db.query(Application).filter(Application.candidate_id == candidate_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application for candidate not found")
    
    sr = db.query(ScreeningResult).filter(ScreeningResult.application_id == app.id).first()
    if not sr:
        # Generate on the fly
        cand = app.candidate
        job = app.job
        res = perform_ai_screening(
            candidate_data={
                "full_name": cand.full_name,
                "skills": ["React", "TypeScript", "Tailwind CSS", "Next.js", "Node.js"],
                "total_experience_years": cand.total_experience_years,
                "notice_period_days": cand.notice_period_days
            },
            job_data={
                "title": job.title if job else "Senior Frontend Engineer",
                "required_skills": job.required_skills if job else ["React", "TypeScript", "Tailwind CSS"],
                "preferred_skills": job.preferred_skills if job else ["GraphQL", "Vite"],
                "notice_period_days": job.notice_period_days if job else 30
            }
        )
        sr = ScreeningResult(
            application_id=app.id,
            overall_match_score=res["overall_match_score"],
            ats_score=res["ats_score"],
            skill_match_score=res["skill_match_score"],
            experience_match_score=res["experience_match_score"],
            education_match_score=res["education_match_score"],
            requirement_match_score=res["requirement_match_score"],
            key_strengths=res["key_strengths"],
            missing_skills=res["missing_skills"],
            ai_rationale=res["ai_rationale"]
        )
        db.add(sr)
        db.commit()
        db.refresh(sr)

    return sr
