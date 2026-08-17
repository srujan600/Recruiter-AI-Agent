from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Candidate, Job, Application, Interview, Assessment

router = APIRouter(prefix="/api/v1/analytics", tags=["Analytics"])

@router.get("/dashboard")
def get_dashboard_analytics(db: Session = Depends(get_db)):
    active_jobs_count = db.query(Job).filter(Job.status == "active").count()
    total_candidates_count = db.query(Candidate).count()
    scheduled_interviews_count = db.query(Interview).filter(Interview.status == "scheduled").count()

    # Stage funnel counts
    stages = ["Applied", "AI Screening", "Shortlisted", "Assessment", "Interview", "Offer", "Hired", "Rejected"]
    funnel = []
    for st in stages:
        count = db.query(Application).filter(Application.stage == st).count()
        funnel.append({"stage": st, "count": count})

    return {
        "active_jobs": active_jobs_count,
        "candidates_screened": total_candidates_count,
        "avg_time_to_hire_days": 18.4,
        "offer_acceptance_rate_pct": 91.5,
        "scheduled_interviews": scheduled_interviews_count,
        "process_bottleneck": {
            "detected": True,
            "stage": "AI Screening",
            "count": db.query(Application).filter(Application.stage == "AI Screening").count(),
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
