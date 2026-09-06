from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..models import Candidate, Job, Application, Interview, Assessment

router = APIRouter(prefix="/api/v1/analytics", tags=["Analytics"])

@router.get("/dashboard")
def get_dashboard_analytics(db: Session = Depends(get_db)):
    active_jobs_count = db.query(Job).filter(Job.status == "active").count()
    total_candidates_count = db.query(Candidate).count()
    scheduled_interviews_count = db.query(Interview).filter(Interview.status == "scheduled").count()

    # Stage funnel counts in 1 single grouped query instead of 9 individual count queries
    stage_counts = dict(
        db.query(Application.stage, func.count(Application.id))
        .group_by(Application.stage)
        .all()
    )
    stages = ["Applied", "AI Screening", "Shortlisted", "Assessment", "Interview", "Offer", "Hired", "Rejected"]
    funnel = [{"stage": st, "count": stage_counts.get(st, 0)} for st in stages]
    screening_queue_count = stage_counts.get("AI Screening", 0)

    return {
        "active_jobs": active_jobs_count,
        "candidates_screened": total_candidates_count,
        "avg_time_to_hire_days": 18.4,
        "offer_acceptance_rate_pct": 91.5,
        "scheduled_interviews": scheduled_interviews_count,
        "process_bottleneck": {
            "detected": screening_queue_count > 0,
            "stage": "AI Screening",
            "count": screening_queue_count,
            "message": "AI Screening queue has candidates awaiting evaluation."
        },
        "hiring_funnel": funnel,
        "recent_activity": [
            {
                "id": 1,
                "title": "Candidate Screened",
                "description": "Alexander Chen scored 94% match for Senior Frontend Engineer.",
                "time": "10 mins ago",
                "badge": "High Match"
            },
            {
                "id": 2,
                "title": "Interview Scheduled",
                "description": "Technical interview booked for Elena Rostova with Dr. Aris Thorne.",
                "time": "1 hour ago",
                "badge": "Interview"
            },
            {
                "id": 3,
                "title": "Assessment Completed",
                "description": "Alex Mercer scored 92/100 on Frontend Architecture test.",
                "time": "3 hours ago",
                "badge": "Completed"
            }
        ]
    }
