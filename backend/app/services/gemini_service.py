import os
import json
import re
import logging
from typing import Optional, Dict, Any, List

logger = logging.getLogger("gemini_service")

def get_gemini_api_key() -> Optional[str]:
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    return api_key if api_key and api_key != "your_gemini_api_key_here" else None

def is_gemini_configured() -> bool:
    return get_gemini_api_key() is not None

def get_genai_client():
    api_key = get_gemini_api_key()
    if not api_key:
        return None
    try:
        from google import genai
        return genai.Client(api_key=api_key)
    except Exception as e:
        logger.warning(f"Failed to initialize google.genai Client: {e}")
        return None

def clean_json_response(raw_text: str) -> str:
    """Strip markdown code fence blocks like ```json ... ```."""
    text = raw_text.strip()
    if text.startswith("```"):
        lines = text.splitlines()
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].startswith("```"):
            lines = lines[:-1]
        text = "\n".join(lines).strip()
    return text

def parse_resume_with_gemini(raw_text: str) -> Optional[Dict[str, Any]]:
    """
    Sends raw extracted resume text to Gemini to produce structured JSON matching:
    full_name, email, phone, location, total_experience_years, skills, work_experience, education.
    """
    client = get_genai_client()
    if not client:
        return None

    prompt = f"""
You are an expert AI Resume Parser. Extract accurate, structured candidate information from the resume text provided below.

Strictly output valid JSON matching this schema:
{{
  "full_name": "string (Candidate's real full name. Do not invent. If not found, use 'Candidate (Pending Review)')",
  "email": "string (Email address. If not found, use '')",
  "phone": "string (Phone number. If not found, use '')",
  "location": "string (e.g. 'San Francisco, CA' or City, Country)",
  "total_experience_years": float (Estimated total years of professional experience, e.g. 6.5),
  "skills": ["string", "string"] (Comprehensive list of technical and professional skills extracted directly from resume),
  "work_experience": [
    {{
      "title": "Job Title",
      "company": "Company Name",
      "duration": "Duration / Years (e.g. 2021 - Present)",
      "description": "Short summary of responsibilities and achievements"
    }}
  ],
  "education": [
    {{
      "degree": "Degree and Major",
      "institution": "University / College",
      "year": "Graduation Year"
    }}
  ]
}}

RESUME TEXT:
\"\"\"{raw_text[:12000]}\"\"\"
"""

    models_to_try = ["gemini-2.5-flash", "gemini-1.5-flash"]
    for model_name in models_to_try:
        try:
            from google.genai import types
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.1
                )
            )
            if response and response.text:
                cleaned = clean_json_response(response.text)
                data = json.loads(cleaned)
                return data
        except Exception as e:
            logger.warning(f"Gemini resume parse failed with model {model_name}: {e}")
            continue

    return None

def screen_candidate_with_gemini(candidate_data: Dict[str, Any], job_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Evaluates candidate's real profile and resume against job requirements using Gemini.
    """
    client = get_genai_client()
    if not client:
        return None

    prompt = f"""
You are an advanced AI Talent Evaluator and ATS Screening System for TalentOS.
Evaluate the following candidate against the specified job requisition requirements dynamically.

CANDIDATE DATA:
{json.dumps(candidate_data, indent=2)}

JOB REQUISITION DATA:
{json.dumps(job_data, indent=2)}

Strictly output valid JSON matching this schema:
{{
  "overall_match_score": integer (0 to 100, holistic alignment),
  "ats_score": integer (0 to 100, keyword/skills alignment),
  "skill_match_score": integer (0 to 100),
  "experience_match_score": integer (0 to 100),
  "education_match_score": integer (0 to 100),
  "requirement_match_score": integer (0 to 100),
  "key_strengths": ["string", "string"] (3-5 specific, evidence-backed strengths based on their real skills & experience),
  "missing_skills": ["string", "string"] (1-3 genuine missing skills or experience gaps relative to the job requirements),
  "ai_rationale": "string (A concise, professional 2-3 sentence recruiter synthesis explaining the fit, rationale, and potential trade-offs)"
}}
"""

    models_to_try = ["gemini-2.5-flash", "gemini-1.5-flash"]
    for model_name in models_to_try:
        try:
            from google.genai import types
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.2
                )
            )
            if response and response.text:
                cleaned = clean_json_response(response.text)
                data = json.loads(cleaned)
                return data
        except Exception as e:
            logger.warning(f"Gemini screening failed with model {model_name}: {e}")
            continue

    return None

def analyze_recruiter_intent_with_gemini(message: str, candidate_names: List[str], job_titles: List[str]) -> Optional[Dict[str, Any]]:
    """
    Uses Gemini to classify recruiter intent and extract tool call parameters from natural language.
    """
    client = get_genai_client()
    if not client:
        return None

    prompt = f"""
You are an AI Recruiter Agent routing coordinator.
A recruiter sent the following command:
"{message}"

Available Candidates in Database: {candidate_names}
Available Jobs in Database: {job_titles}

Available Actions:
1. "search_candidates": user wants to search, find, list, or filter candidates.
   payload: {{"query": "string", "job_id": null or number}}
2. "shortlist_candidate": user wants to shortlist, move to shortlist, or advance a candidate.
   payload: {{"candidate_name": "string", "job_id": null or number}}
3. "schedule_interview": user wants to schedule, book, or set up an interview.
   payload: {{"candidate_name": "string", "interview_type": "Technical Interview", "datetime_str": "string", "interviewer": "Sarah Jenkins"}}
4. "compare_candidates": user wants to compare two or more candidates.
   payload: {{"candidate1_name": "string", "candidate2_name": "string", "job_id": null or number}}
5. "get_hiring_funnel": user asks about funnel, bottlenecks, pipeline metrics, or analytics.
   payload: {{}}

Return valid JSON:
{{
  "action_type": "search_candidates" | "shortlist_candidate" | "schedule_interview" | "compare_candidates" | "get_hiring_funnel",
  "action_payload": {{ ... }}
}}
"""

    models_to_try = ["gemini-2.5-flash", "gemini-1.5-flash"]
    for model_name in models_to_try:
        try:
            from google.genai import types
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.1
                )
            )
            if response and response.text:
                cleaned = clean_json_response(response.text)
                return json.loads(cleaned)
        except Exception as e:
            logger.warning(f"Gemini intent analysis failed with model {model_name}: {e}")
            continue

    return None

def summarize_agent_action_with_gemini(action_type: str, action_result: Dict[str, Any], user_message: str) -> Optional[str]:
    """
    Synthesizes a friendly, polished executive recruiter response using Gemini.
    """
    client = get_genai_client()
    if not client:
        return None

    prompt = f"""
You are TalentOS AI Recruiter Assistant, an intelligent pair recruiter.
The user said: "{user_message}"
The system executed action '{action_type}' and returned this data:
{json.dumps(action_result, default=str)}

Write a concise, polished, executive recruiter summary in markdown (bullet points, bold text for key metrics/names).
Be helpful, proactive, and recommend next logical actions.
"""
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        if response and response.text:
            return response.text.strip()
    except Exception as e:
        logger.warning(f"Gemini agent summarization error: {e}")

    return None
