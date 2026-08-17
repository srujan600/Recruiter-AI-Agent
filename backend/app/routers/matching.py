from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
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

    res = perform_ai_screening(
        candidate_data={
            "full_name": cand.full_name,
            "skills": ["React", "TypeScript", "Tailwind CSS", "Next.js", "State Management"],
            "total_experience_years": cand.total_experience_years,
            "notice_period_days": cand.notice_period_days
        },
        job_data={
            "title": job.title,
            "required_skills": job.required_skills,
            "preferred_skills": job.preferred_skills,
            "notice_period_days": job.notice_period_days
        }
    )

    req_table = []
    req_skills = job.required_skills or ["React", "TypeScript", "Tailwind CSS"]
    cand_skills = ["React", "TypeScript", "Tailwind CSS", "Next.js"]
    for skill in req_skills:
        req_table.append({
            "requirement": f"Required Skill: {skill}",
            "candidate_value": f"Proficient ({skill})" if skill in cand_skills else "Partial / Mentioned",
            "status": "Match" if skill in cand_skills else "Review Required",
            "is_matched": skill in cand_skills
        })

    req_table.append({
        "requirement": f"Min Experience: {job.experience_level}",
        "candidate_value": f"{cand.total_experience_years} Years Total",
        "status": "Match" if cand.total_experience_years >= 5 else "Review",
        "is_matched": cand.total_experience_years >= 5
    })

    req_table.append({
        "requirement": f"Notice Period: Max {job.notice_period_days} Days",
        "candidate_value": f"{cand.notice_period_days} Days Notice",
        "status": "Match" if cand.notice_period_days <= job.notice_period_days else "Exceeds",
        "is_matched": cand.notice_period_days <= job.notice_period_days
    })

    return {
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
            "target_start_date": "Immediate (Within 2 Weeks)" if cand.notice_period_days <= 15 else "1 Month",
            "location_status": "Matches Requirement (San Francisco / Hybrid)"
        }
    }
