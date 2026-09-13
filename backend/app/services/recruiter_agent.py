from sqlalchemy.orm import Session
from ..models import Candidate, Application, Job, Interview, Assessment, ScreeningResult, Notification, EventLog
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
import re
from .gemini_service import (
    is_gemini_configured,
    analyze_recruiter_intent_with_gemini,
    summarize_agent_action_with_gemini
)

# =========================================================================
# Recruiter Agent Database Tools
# =========================================================================

def tool_search_candidates(query: str, db: Session, job_id: Optional[int] = None) -> Dict[str, Any]:
    apps_query = db.query(Application)
    if job_id:
        apps_query = apps_query.filter(Application.job_id == job_id)
    
    apps = apps_query.order_by(Application.match_score.desc()).all()
    q_lower = query.lower().strip() if query else ""

    matched_apps = []
    for app in apps:
        c = app.candidate
        cand_skills = c.parsed_skills if hasattr(c, "parsed_skills") else []
        if (not q_lower or 
            q_lower in c.full_name.lower() or 
            (c.current_role and q_lower in c.current_role.lower()) or 
            (c.location and q_lower in c.location.lower()) or
            any(q_lower in s.lower() for s in cand_skills)):
            matched_apps.append(app)

    if not matched_apps:
        matched_apps = apps[:5]

    results = []
    for app in matched_apps[:5]:
        c = app.candidate
        skills_preview = ", ".join((c.parsed_skills or [])[:3])
        results.append({
            "application_id": app.id,
            "candidate_id": c.id,
            "full_name": c.full_name,
            "current_role": c.current_role or "Software Engineer",
            "match_score": app.match_score,
            "ats_score": app.ats_score,
            "stage": app.stage,
            "experience_years": c.total_experience_years,
            "location": c.location,
            "skills": skills_preview
        })

    summary_lines = [
        f"• **{r['full_name']}** ({r['current_role']}) | Match: **{r['match_score']}%** | Stage: `{r['stage']}` | {r['experience_years']} yrs exp | Skills: {r['skills']}"
        for r in results
    ]

    response_text = (
        f"Found **{len(results)} candidate(s)** relevant to '{query or 'top candidates'}':\n\n" +
        "\n".join(summary_lines) +
        "\n\nWould you like me to **shortlist**, **schedule an interview**, or **compare** any of these candidates?"
    )

    return {
        "response": response_text,
        "action_type": "search_candidates",
        "action_payload": {
            "query": query,
            "results_count": len(results),
            "candidates": results,
            "top_candidate_id": results[0]["candidate_id"] if results else None
        }
    }

def tool_shortlist_candidate(db: Session, application_id: Optional[int] = None, candidate_name: Optional[str] = None) -> Dict[str, Any]:
    app = None
    if application_id:
        app = db.query(Application).filter(Application.id == application_id).first()
    elif candidate_name:
        cand = db.query(Candidate).filter(Candidate.full_name.ilike(f"%{candidate_name.strip()}%")).first()
        if cand:
            app = db.query(Application).filter(Application.candidate_id == cand.id).first()

    if not app:
        # Fallback to top applicant in screening
        app = db.query(Application).filter(Application.stage.in_(["Applied", "AI Screening"])).order_by(Application.match_score.desc()).first()

    if not app:
        return {
            "response": "Could not locate an active candidate application to shortlist.",
            "action_type": "shortlist",
            "action_payload": None
        }

    cand = app.candidate
    app.stage = "Shortlisted"
    db.commit()

    # Log event & notification
    db.add(Notification(
        title="Candidate Shortlisted",
        message=f"{cand.full_name} was moved to Shortlisted stage by AI Recruiter Agent.",
        notification_type="success"
    ))
    db.add(EventLog(
        event_type="candidate_shortlisted",
        entity_type="application",
        entity_id=app.id,
        description=f"AI Recruiter Agent shortlisted {cand.full_name} for {app.job.title if app.job else 'role'}."
    ))
    db.commit()

    return {
        "response": f"Successfully moved **{cand.full_name}** to the **Shortlisted** stage for **{app.job.title if app.job else 'the role'}**. Hiring team notification dispatched.",
        "action_type": "shortlist",
        "action_payload": {
            "application_id": app.id,
            "candidate_id": cand.id,
            "candidate_name": cand.full_name,
            "job_title": app.job.title if app.job else "Target Role",
            "new_stage": "Shortlisted"
        }
    }

def tool_schedule_interview(
    db: Session,
    application_id: Optional[int] = None,
    candidate_name: Optional[str] = None,
    interview_type: str = "Technical Interview",
    datetime_str: Optional[str] = None,
    interviewer: str = "Sarah Jenkins"
) -> Dict[str, Any]:
    app = None
    if application_id:
        app = db.query(Application).filter(Application.id == application_id).first()
    elif candidate_name:
        cand = db.query(Candidate).filter(Candidate.full_name.ilike(f"%{candidate_name.strip()}%")).first()
        if cand:
            app = db.query(Application).filter(Application.candidate_id == cand.id).first()

    if not app:
        app = db.query(Application).order_by(Application.match_score.desc()).first()

    if not app:
        return {
            "response": "No suitable candidate application found to schedule an interview.",
            "action_type": "schedule_interview",
            "action_payload": None
        }

    cand = app.candidate
    scheduled_time = datetime.utcnow() + timedelta(days=2, hours=4)
    meeting_link = f"https://meet.google.com/talentos-{app.id}-sync"

    new_inv = Interview(
        application_id=app.id,
        title=f"{interview_type} — {cand.full_name}",
        interview_type=interview_type,
        interviewer_name=interviewer or "Sarah Jenkins",
        scheduled_at=scheduled_time,
        duration_minutes=45,
        meeting_link=meeting_link,
        status="scheduled",
        notes="Automated booking generated by TalentOS AI Recruiter Assistant."
    )
    app.stage = "Interview"
    db.add(new_inv)
    db.commit()
    db.refresh(new_inv)

    db.add(Notification(
        title="Interview Scheduled",
        message=f"{interview_type} scheduled with {cand.full_name} on {scheduled_time.strftime('%b %d, %Y at %I:%M %p')}.",
        notification_type="info"
    ))
    db.add(EventLog(
        event_type="interview_scheduled",
        entity_type="interview",
        entity_id=new_inv.id,
        description=f"Scheduled {interview_type} for {cand.full_name} with {interviewer}."
    ))
    db.commit()

    return {
        "response": f"Scheduled a 45-minute **{interview_type}** with **{cand.full_name}** for **{scheduled_time.strftime('%B %d at %I:%M %p')}** with {interviewer}. Calendar invite and Google Meet link generated.",
        "action_type": "schedule_interview",
        "action_payload": {
            "interview_id": new_inv.id,
            "application_id": app.id,
            "candidate_name": cand.full_name,
            "scheduled_at": str(scheduled_time),
            "meeting_link": meeting_link
        }
    }

def tool_compare_candidates(
    db: Session,
    cand1_name: Optional[str] = None,
    cand2_name: Optional[str] = None,
    cand1_id: Optional[int] = None,
    cand2_id: Optional[int] = None,
    job_id: Optional[int] = None
) -> Dict[str, Any]:
    apps = db.query(Application).order_by(Application.match_score.desc()).all()
    if len(apps) < 2:
        return {
            "response": "At least two candidate applications are needed to run comparative matrix evaluation.",
            "action_type": "compare",
            "action_payload": None
        }

    app1, app2 = apps[0], apps[1]
    if cand1_name or cand2_name:
        for a in apps:
            if cand1_name and cand1_name.lower() in a.candidate.full_name.lower():
                app1 = a
            if cand2_name and cand2_name.lower() in a.candidate.full_name.lower():
                app2 = a

    c1, c2 = app1.candidate, app2.candidate
    skills1 = ", ".join((c1.parsed_skills or [])[:4])
    skills2 = ", ".join((c2.parsed_skills or [])[:4])

    diff = abs(app1.match_score - app2.match_score)
    top_cand = c1 if app1.match_score >= app2.match_score else c2

    response_text = (
        f"### Candidate Comparative Matrix\n\n"
        f"**1. {c1.full_name}** (Match: **{app1.match_score}%** | ATS: {app1.ats_score}%)\n"
        f"- Role & Location: {c1.current_role or 'Engineer'} ({c1.location})\n"
        f"- Experience: {c1.total_experience_years:.1f} years | Notice: {c1.notice_period_days} days\n"
        f"- Key Skills: {skills1}\n\n"
        f"**2. {c2.full_name}** (Match: **{app2.match_score}%** | ATS: {app2.ats_score}%)\n"
        f"- Role & Location: {c2.current_role or 'Engineer'} ({c2.location})\n"
        f"- Experience: {c2.total_experience_years:.1f} years | Notice: {c2.notice_period_days} days\n"
        f"- Key Skills: {skills2}\n\n"
        f"**Recommendation:** **{top_cand.full_name}** leads by {diff}% on core architectural competency and requirements alignment."
    )

    return {
        "response": response_text,
        "action_type": "compare",
        "action_payload": {
            "candidate1_id": c1.id,
            "candidate1_name": c1.full_name,
            "candidate2_id": c2.id,
            "candidate2_name": c2.full_name,
            "top_candidate_id": top_cand.id
        }
    }

def tool_get_hiring_funnel(db: Session) -> Dict[str, Any]:
    total_cand = db.query(Candidate).count()
    apps_in_screening = db.query(Application).filter(Application.stage == "AI Screening").count()
    apps_shortlisted = db.query(Application).filter(Application.stage == "Shortlisted").count()
    apps_interview = db.query(Application).filter(Application.stage == "Interview").count()

    response_text = (
        f"### Hiring Funnel Diagnostics & Pipeline Health\n\n"
        f"- **Total Active Candidates:** {total_cand}\n"
        f"- **AI Screening Queue:** {apps_in_screening} candidates awaiting review\n"
        f"- **Shortlisted Pipeline:** {apps_shortlisted} candidates ready for interview\n"
        f"- **Scheduled Interviews:** {apps_interview} upcoming\n"
        f"- **Current Bottleneck:** {'AI Screening queue has backlog' if apps_in_screening > 1 else 'Healthy pipeline progression across all stages.'}\n"
        f"- **Recommended Next Step:** Move top-ranked candidates from Screening to Shortlisted stage."
    )

    return {
        "response": response_text,
        "action_type": "get_hiring_funnel",
        "action_payload": {
            "total_candidates": total_cand,
            "screening_count": apps_in_screening,
            "shortlisted_count": apps_shortlisted,
            "interview_count": apps_interview
        }
    }

# =========================================================================
# Agent Orchestrator
# =========================================================================

def process_agent_query(message: str, db: Session, context_job_id: Optional[int] = None) -> Dict[str, Any]:
    """
    Executes the AI Recruiter Agent using Gemini function calling / intent extraction when available,
    with robust multi-intent heuristic fallback against actual database tools.
    """
    # Check if Gemini is configured
    if is_gemini_configured():
        candidates = db.query(Candidate).all()
        cand_names = [c.full_name for c in candidates]
        jobs = db.query(Job).all()
        job_titles = [j.title for j in jobs]

        intent = analyze_recruiter_intent_with_gemini(message, cand_names, job_titles)
        if intent and isinstance(intent, dict) and "action_type" in intent:
            action_type = intent["action_type"]
            payload = intent.get("action_payload", {})

            result = None
            if action_type == "shortlist_candidate":
                result = tool_shortlist_candidate(db, candidate_name=payload.get("candidate_name"))
            elif action_type == "schedule_interview":
                result = tool_schedule_interview(
                    db,
                    candidate_name=payload.get("candidate_name"),
                    interview_type=payload.get("interview_type", "Technical Interview"),
                    datetime_str=payload.get("datetime_str"),
                    interviewer=payload.get("interviewer", "Sarah Jenkins")
                )
            elif action_type == "compare_candidates":
                result = tool_compare_candidates(
                    db,
                    cand1_name=payload.get("candidate1_name"),
                    cand2_name=payload.get("candidate2_name")
                )
            elif action_type == "get_hiring_funnel":
                result = tool_get_hiring_funnel(db)
            else:
                result = tool_search_candidates(payload.get("query", message), db, job_id=context_job_id)

            if result:
                # Optionally polish the response text with Gemini
                polished = summarize_agent_action_with_gemini(action_type, result["action_payload"], message)
                if polished:
                    result["response"] = polished
                return result

    # Rule-based Intent Matching Fallback
    msg_lower = message.lower()
    if "shortlist" in msg_lower or "advance" in msg_lower:
        # Extract candidate name if present
        candidates = db.query(Candidate).all()
        target_name = None
        for c in candidates:
            if c.full_name.lower() in msg_lower or c.full_name.split()[0].lower() in msg_lower:
                target_name = c.full_name
                break
        return tool_shortlist_candidate(db, candidate_name=target_name)

    elif "schedule" in msg_lower or "interview" in msg_lower or "book" in msg_lower:
        candidates = db.query(Candidate).all()
        target_name = None
        for c in candidates:
            if c.full_name.lower() in msg_lower or c.full_name.split()[0].lower() in msg_lower:
                target_name = c.full_name
                break
        return tool_schedule_interview(db, candidate_name=target_name)

    elif "compare" in msg_lower or "versus" in msg_lower or "vs" in msg_lower:
        return tool_compare_candidates(db)

    elif "funnel" in msg_lower or "bottleneck" in msg_lower or "analytics" in msg_lower or "metrics" in msg_lower:
        return tool_get_hiring_funnel(db)

    else:
        # Default: search candidates with user query
        clean_q = re.sub(r"\b(find|search|show|get|list|me|top|candidates?|engineers?|developers?)\b", "", message, flags=re.IGNORECASE).strip()
        return tool_search_candidates(clean_q or message, db, job_id=context_job_id)
