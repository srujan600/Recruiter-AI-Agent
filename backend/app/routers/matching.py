from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional, Any
from ..database import get_db
from ..models import Candidate, Job, Application, ScreeningResult
from ..services.ai_screener import perform_ai_screening

router = APIRouter(prefix="/api/v1/matching", tags=["AI Matcher"])

class MatchCompareRequest(BaseModel):
    candidate_id: int
    job_id: int

@router.post("/compare")
def compare_candidate_job(req: MatchCompareRequest, db: Session = Depends(get_db)):
    cand = db.query(Candidate).filter(Candidate.id == req.candidate_id).first()
    job = db.query(Job).filter(Job.id == req.job_id).first()
    if not cand or not job:
        raise HTTPException(status_code=404, detail="Candidate or Job not found")

    # Find or create application for this candidate and job
    app = db.query(Application).filter(
        Application.candidate_id == cand.id,
        Application.job_id == job.id
    ).first()

    if not app:
        app = Application(
            job_id=job.id,
            candidate_id=cand.id,
            stage="Applied",
            match_score=85,
            ats_score=88
        )
        db.add(app)
        db.commit()
        db.refresh(app)

    # Resolve candidate real skills from resumes or candidate model
    cand_skills = []
    if cand.resumes and len(cand.resumes) > 0 and cand.resumes[0].parsed_skills:
        cand_skills = cand.resumes[0].parsed_skills
    elif hasattr(cand, "parsed_skills") and cand.parsed_skills:
        cand_skills = cand.parsed_skills
    else:
        cand_skills = ["Software Engineering", "Full Stack Development"]

    res = perform_ai_screening(
        candidate_data={
            "full_name": cand.full_name,
            "skills": cand_skills,
            "total_experience_years": cand.total_experience_years,
            "notice_period_days": cand.notice_period_days,
            "location": cand.location,
            "current_role": cand.current_role
        },
        job_data={
            "title": job.title,
            "required_skills": job.required_skills or [],
            "preferred_skills": job.preferred_skills or [],
            "notice_period_days": job.notice_period_days,
            "experience_level": job.experience_level,
            "location": job.location
        }
    )

    # Sync scores to application
    app.match_score = res["overall_match_score"]
    app.ats_score = res["ats_score"]
    db.commit()

    cand_skills_lower = [s.strip().lower() for s in cand_skills]
    req_table = []
    req_skills = job.required_skills or []
    for skill in req_skills:
        is_matched = skill.strip().lower() in cand_skills_lower
        req_table.append({
            "requirement": f"Required Skill: {skill}",
            "candidate_value": f"Verified ({skill})" if is_matched else "Not explicitly listed",
            "status": "Match" if is_matched else "Gap / Review",
            "is_matched": is_matched
        })

    # Experience requirement row
    req_exp = 7.0 if "staff" in job.experience_level.lower() or "lead" in job.experience_level.lower() else 5.0
    exp_matched = cand.total_experience_years >= req_exp
    req_table.append({
        "requirement": f"Experience: {job.experience_level}",
        "candidate_value": f"{cand.total_experience_years:.1f} Years Total",
        "status": "Match" if exp_matched else "Below Target",
        "is_matched": exp_matched
    })

    # Notice period row
    notice_matched = cand.notice_period_days <= job.notice_period_days
    req_table.append({
        "requirement": f"Notice Period: Max {job.notice_period_days} Days",
        "candidate_value": f"{cand.notice_period_days} Days",
        "status": "Match" if notice_matched else "Exceeds Target",
        "is_matched": notice_matched
    })

    # Location check
    cand_loc = cand.location.lower() if cand.location else ""
    job_loc = job.location.lower() if job.location else ""
    location_matched = "remote" in job_loc or any(part in job_loc for part in cand_loc.split(","))

    return {
        "application_id": app.id,
        "candidate": cand,
        "job": job,
        "overall_match_score": res["overall_match_score"],
        "ats_score": res["ats_score"],
        "skill_match_score": res["skill_match_score"],
        "experience_match_score": res["experience_match_score"],
        "education_match_score": res["education_match_score"],
        "requirement_match_score": res["requirement_match_score"],
        "ai_rationale": res["ai_rationale"],
        "key_strengths": res["key_strengths"],
        "missing_skills": res["missing_skills"],
        "requirement_breakdown_table": req_table,
        "logistics": {
            "expected_salary": cand.expected_salary,
            "budget_max": job.max_salary,
            "salary_match": cand.expected_salary <= job.max_salary,
            "notice_period_days": cand.notice_period_days,
            "target_start_date": "Immediate (Within 2 Weeks)" if cand.notice_period_days <= 15 else f"{cand.notice_period_days} Days",
            "location_status": "Matches Location Requirement" if location_matched else f"Relocation / Remote Review ({cand.location} vs {job.location})"
        }
    }
