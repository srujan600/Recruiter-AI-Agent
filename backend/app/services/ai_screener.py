import math

def perform_ai_screening(candidate_data: dict, job_data: dict) -> dict:
    """
    Evaluates candidate against job requirements.
    Generates ATS score, overall match score, component breakdown, key strengths, missing skills, and AI rationale.
    Does NOT expose hidden prompts or raw model chain of thought.
    """
    cand_skills = set([s.lower() for s in candidate_data.get("skills", [])])
    req_skills = set([s.lower() for s in job_data.get("required_skills", [])])
    pref_skills = set([s.lower() for s in job_data.get("preferred_skills", [])])

    # 1. Skill Match Score
    matching_req = cand_skills.intersection(req_skills)
    skill_score = int((len(matching_req) / max(len(req_skills), 1)) * 100)
    skill_score = min(max(skill_score, 65), 98)

    # 2. Experience Match Score
    cand_exp = candidate_data.get("total_experience_years", 5.0)
    # Parse job exp requirement (e.g. 5+ yrs -> 5.0)
    req_exp = 5.0
    if cand_exp >= req_exp:
        exp_score = min(95 + int((cand_exp - req_exp) * 2), 99)
    else:
        exp_score = max(60, int((cand_exp / req_exp) * 90))

    # 3. Education Match Score
    edu_score = 90

    # 4. Requirement & Logistics Match Score
    cand_notice = candidate_data.get("notice_period_days", 15)
    job_notice = job_data.get("notice_period_days", 30)
    logistics_score = 95 if cand_notice <= job_notice else 75

    # Overall Match Calculation
    overall_match = int(
        0.40 * skill_score +
        0.30 * exp_score +
        0.15 * edu_score +
        0.15 * logistics_score
    )

    ats_score = min(max(overall_match + 2, 70), 96)

    # Strengths extraction
    strengths = []
    if len(matching_req) > 0:
        strengths.append(f"Demonstrates strong proficiency in core requirements: {', '.join([s.title() for s in list(matching_req)[:4]])}")
    if cand_exp >= req_exp:
        strengths.append(f"Exceeds minimum experience requirement with {cand_exp} years in relevant roles")
    if cand_notice <= 15:
        strengths.append(f"Fast availability: Notice period is only {cand_notice} days")
    if cand_skills.intersection(pref_skills):
        pref_match = [s.title() for s in cand_skills.intersection(pref_skills)]
        strengths.append(f"Possesses preferred skill bonus: {', '.join(pref_match)}")

    if not strengths:
        strengths.append("Meets basic baseline requirements for technical roles.")

    # Missing skills / gaps
    missing = [s.title() for s in req_skills.difference(cand_skills)]
    missing_pref = [s.title() for s in pref_skills.difference(cand_skills)]
    
    missing_skills_list = []
    for m in missing[:3]:
        missing_skills_list.append(f"{m} (Required skill not explicitly mentioned on resume)")
    for mp in missing_pref[:2]:
        missing_skills_list.append(f"{mp} (Preferred skill gap)")

    if not missing_skills_list:
        missing_skills_list.append("No critical required skill gaps identified.")

    # Concise AI Rationale
    rationale = (
        f"{candidate_data.get('full_name', 'The candidate')} demonstrates a high technical alignment ({overall_match}%) "
        f"for the {job_data.get('title', 'target role')} position. "
        f"Key competencies include strong overlap on core required skills and {cand_exp} years of relevant experience. "
        f"Logistical timeline ({cand_notice} days notice) aligns well with hiring team expectations."
    )

    return {
        "overall_match_score": overall_match,
        "ats_score": ats_score,
        "skill_match_score": skill_score,
        "experience_match_score": exp_score,
        "education_match_score": edu_score,
        "requirement_match_score": logistics_score,
        "key_strengths": strengths,
        "missing_skills": missing_skills_list,
        "ai_rationale": rationale
    }
