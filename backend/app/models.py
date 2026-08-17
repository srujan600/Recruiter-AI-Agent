from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime

Base = declarative_base()

class Organization(Base):
    __tablename__ = 'organizations'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    domain = Column(String(255), nullable=True)
    plan = Column(String(50), default='Enterprise')
    created_at = Column(DateTime, default=datetime.utcnow)

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default='recruiter') # recruiter, hiring_manager, hr_admin
    avatar_url = Column(String(500), nullable=True)
    organization_id = Column(Integer, ForeignKey('organizations.id'), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Job(Base):
    __tablename__ = 'jobs'

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    department = Column(String(100), nullable=False)
    location = Column(String(100), nullable=False)
    job_type = Column(String(50), default='Full-time')
    experience_level = Column(String(50), default='Senior')
    min_salary = Column(Integer, default=120000)
    max_salary = Column(Integer, default=160000)
    notice_period_days = Column(Integer, default=30)
    status = Column(String(50), default='active') # active, draft, closed, archived
    description = Column(Text, nullable=True)
    required_skills = Column(JSON, default=list)
    preferred_skills = Column(JSON, default=list)
    hiring_manager_name = Column(String(255), default='David Miller')
    recruiter_name = Column(String(255), default='Sarah Jenkins')
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    applications = relationship("Application", back_populates="job", cascade="all, delete-orphan")

class Candidate(Base):
    __tablename__ = 'candidates'

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(50), nullable=True)
    location = Column(String(100), default='San Francisco, CA')
    current_company = Column(String(255), nullable=True)
    current_role = Column(String(255), nullable=True)
    total_experience_years = Column(Float, default=5.0)
    notice_period_days = Column(Integer, default=15)
    expected_salary = Column(Integer, default=145000)
    current_salary = Column(Integer, default=130000)
    avatar_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    resumes = relationship("Resume", back_populates="candidate", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="candidate", cascade="all, delete-orphan")
    notes = relationship("CandidateNote", back_populates="candidate", cascade="all, delete-orphan")

class Resume(Base):
    __tablename__ = 'resumes'

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey('candidates.id'), nullable=False)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_type = Column(String(50), default='pdf')
    parsed_text = Column(Text, nullable=True)
    parsed_skills = Column(JSON, default=list)
    parsed_experience = Column(JSON, default=list)
    parsed_education = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

    candidate = relationship("Candidate", back_populates="resumes")

class Application(Base):
    __tablename__ = 'applications'

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey('jobs.id'), nullable=False)
    candidate_id = Column(Integer, ForeignKey('candidates.id'), nullable=False)
    stage = Column(String(50), default='Applied') # Applied, AI Screening, Shortlisted, Assessment, Interview, Offer, Hired, Rejected
    match_score = Column(Integer, default=85)
    ats_score = Column(Integer, default=88)
    applied_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    job = relationship("Job", back_populates="applications")
    candidate = relationship("Candidate", back_populates="applications")
    screening_result = relationship("ScreeningResult", back_populates="application", uselist=False, cascade="all, delete-orphan")
    assessments = relationship("Assessment", back_populates="application", cascade="all, delete-orphan")
    interviews = relationship("Interview", back_populates="application", cascade="all, delete-orphan")

class ScreeningResult(Base):
    __tablename__ = 'screening_results'

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey('applications.id'), nullable=False)
    overall_match_score = Column(Integer, default=90)
    ats_score = Column(Integer, default=92)
    skill_match_score = Column(Integer, default=95)
    experience_match_score = Column(Integer, default=88)
    education_match_score = Column(Integer, default=90)
    requirement_match_score = Column(Integer, default=87)
    key_strengths = Column(JSON, default=list)
    missing_skills = Column(JSON, default=list)
    ai_rationale = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    application = relationship("Application", back_populates="screening_result")

class Assessment(Base):
    __tablename__ = 'assessments'

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey('applications.id'), nullable=False)
    title = Column(String(255), nullable=False)
    assessment_type = Column(String(50), default='technical') # technical, behavioral
    status = Column(String(50), default='pending') # pending, in_progress, completed
    score = Column(Integer, nullable=True)
    max_score = Column(Integer, default=100)
    completed_at = Column(DateTime, nullable=True)
    summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    application = relationship("Application", back_populates="assessments")

class Interview(Base):
    __tablename__ = 'interviews'

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey('applications.id'), nullable=False)
    title = Column(String(255), nullable=False)
    interview_type = Column(String(50), default='Technical Interview')
    interviewer_name = Column(String(255), default='Sarah Jenkins')
    scheduled_at = Column(DateTime, nullable=False)
    duration_minutes = Column(Integer, default=45)
    meeting_link = Column(String(500), nullable=True)
    status = Column(String(50), default='scheduled') # scheduled, completed, cancelled, rescheduled
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    application = relationship("Application", back_populates="interviews")

class CandidateNote(Base):
    __tablename__ = 'candidate_notes'

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey('candidates.id'), nullable=False)
    author_name = Column(String(255), default='Sarah Jenkins')
    note_text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    candidate = relationship("Candidate", back_populates="notes")

class Notification(Base):
    __tablename__ = 'notifications'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), default='info') # info, warning, success
    is_read = Column(Boolean, default=False)
    action_link = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class EventLog(Base):
    __tablename__ = 'event_logs'

    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String(100), nullable=False)
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(Integer, nullable=False)
    description = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
