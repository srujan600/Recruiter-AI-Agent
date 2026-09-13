from pydantic import BaseModel
from typing import List, Optional, Any
from datetime import datetime

# ==============================
# Job Schemas
# ==============================
class JobBase(BaseModel):
    title: str
    department: str
    location: str
    job_type: str = "Full-time"
    experience_level: str = "Senior"
    min_salary: int = 120000
    max_salary: int = 160000
    notice_period_days: int = 30
    description: Optional[str] = None
    required_skills: List[str] = []
    preferred_skills: List[str] = []
    hiring_manager_name: str = "David Miller"
    recruiter_name: str = "Sarah Jenkins"

class JobCreate(JobBase):
    pass

class JobResponse(JobBase):
    id: int
    status: str
    created_at: datetime
    applicant_count: Optional[int] = 0

    class Config:
        from_attributes = True

class JobStatusUpdate(BaseModel):
    status: str # active, closed, archived, draft

# ==============================
# Resume Schemas
# ==============================
class ResumeResponse(BaseModel):
    id: int
    candidate_id: int
    filename: str
    file_path: str
    file_type: str
    parsed_text: Optional[str] = None
    parsed_skills: List[str] = []
    parsed_experience: List[Any] = []
    parsed_education: List[Any] = []
    created_at: datetime

    class Config:
        from_attributes = True

# ==============================
# Candidate Note Schemas
# ==============================
class CandidateNoteBase(BaseModel):
    note_text: str
    author_name: str = "Sarah Jenkins"

class CandidateNoteCreate(CandidateNoteBase):
    pass

class CandidateNoteResponse(CandidateNoteBase):
    id: int
    candidate_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# ==============================
# Application Summary Schema (Nested)
# ==============================
class ApplicationSummaryResponse(BaseModel):
    id: int
    job_id: int
    stage: str
    match_score: int
    ats_score: int
    applied_at: datetime
    job_title: Optional[str] = None

    class Config:
        from_attributes = True

# ==============================
# Candidate Schemas
# ==============================
class CandidateBase(BaseModel):
    full_name: str
    email: str
    phone: Optional[str] = None
    location: str = "San Francisco, CA"
    current_company: Optional[str] = None
    current_role: Optional[str] = None
    total_experience_years: float = 5.0
    notice_period_days: int = 15
    expected_salary: int = 145000
    current_salary: int = 130000
    avatar_url: Optional[str] = None

class CandidateCreate(CandidateBase):
    pass

class CandidateResponse(CandidateBase):
    id: int
    created_at: datetime
    resumes: List[ResumeResponse] = []
    parsed_skills: List[str] = []
    applications: List[ApplicationSummaryResponse] = []
    notes: List[CandidateNoteResponse] = []

    class Config:
        from_attributes = True

# ==============================
# Pipeline & Application Schemas
# ==============================
class PipelineStageUpdate(BaseModel):
    stage: str # Applied, AI Screening, Shortlisted, Assessment, Interview, Offer, Hired, Rejected

class ApplicationResponse(BaseModel):
    id: int
    job_id: int
    candidate_id: int
    stage: str
    match_score: int
    ats_score: int
    applied_at: datetime
    candidate: CandidateResponse
    job_title: Optional[str] = None

    class Config:
        from_attributes = True

# ==============================
# Screening Result Schemas
# ==============================
class ScreeningResultResponse(BaseModel):
    id: int
    application_id: int
    overall_match_score: int
    ats_score: int
    skill_match_score: int
    experience_match_score: int
    education_match_score: int
    requirement_match_score: int
    key_strengths: List[str]
    missing_skills: List[str]
    ai_rationale: str
    created_at: datetime

    class Config:
        from_attributes = True

# ==============================
# Interview Schemas
# ==============================
class InterviewCreate(BaseModel):
    application_id: int
    title: str
    interview_type: str = "Technical Interview"
    interviewer_name: str = "Sarah Jenkins"
    scheduled_at: datetime
    duration_minutes: int = 45
    meeting_link: Optional[str] = None
    notes: Optional[str] = None

class InterviewResponse(InterviewCreate):
    id: int
    status: str
    created_at: datetime
    candidate_name: Optional[str] = None
    candidate_avatar: Optional[str] = None
    job_id: Optional[int] = None
    job_title: Optional[str] = None

    class Config:
        from_attributes = True

class InterviewStatusUpdate(BaseModel):
    status: str # scheduled, completed, cancelled, rescheduled
    notes: Optional[str] = None

# ==============================
# Assessment Schemas
# ==============================
class AssessmentCreate(BaseModel):
    application_id: int
    title: str
    assessment_type: str = "technical"
    max_score: int = 100

class AssessmentResponse(AssessmentCreate):
    id: int
    status: str
    score: Optional[int] = None
    completed_at: Optional[datetime] = None
    summary: Optional[str] = None
    candidate_name: Optional[str] = None
    candidate_avatar: Optional[str] = None
    job_id: Optional[int] = None
    job_title: Optional[str] = None

    class Config:
        from_attributes = True

class AssessmentStatusUpdate(BaseModel):
    status: str # pending, in_progress, completed
    score: Optional[int] = None
    summary: Optional[str] = None

# ==============================
# AI Recruiter Assistant Request
# ==============================
class AgentChatRequest(BaseModel):
    message: str
    context_job_id: Optional[int] = None

class AgentChatResponse(BaseModel):
    response: str
    action_type: Optional[str] = None # e.g., shortlist, schedule_interview, search, rank, compare
    action_payload: Optional[dict] = None
