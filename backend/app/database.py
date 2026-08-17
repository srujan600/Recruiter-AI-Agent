from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .models import Base, Job, Candidate, Application, ScreeningResult, Assessment, Interview, CandidateNote, Notification, User
from datetime import datetime, timedelta
import os

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "recruiter_ai.db")
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Seed default user if empty
        if db.query(User).count() == 0:
            default_user = User(
                email="sarah.jenkins@talentos.ai",
                full_name="Sarah Jenkins",
                hashed_password="demo_password_hash",
                role="recruiter",
                avatar_url="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150"
            )
            db.add(default_user)

        # Seed default jobs if empty
        if db.query(Job).count() == 0:
            job1 = Job(
                title="Senior Frontend Engineer",
                department="Engineering",
                location="San Francisco, CA (Hybrid)",
                job_type="Full-time",
                experience_level="Senior (5+ yrs)",
                min_salary=140000,
                max_salary=180000,
                notice_period_days=30,
                status="active",
                description="We are seeking an exceptional Senior Frontend Engineer to lead UI architecture, React/TypeScript design systems, and responsive web apps.",
                required_skills=["React", "TypeScript", "Tailwind CSS", "Next.js", "State Management", "REST APIs"],
                preferred_skills=["GraphQL", "WebSockets", "Vite", "Performance Optimization"],
                hiring_manager_name="David Miller",
                recruiter_name="Sarah Jenkins"
            )
            job2 = Job(
                title="Staff AI / LangGraph Architect",
                department="AI Research",
                location="Remote",
                job_type="Full-time",
                experience_level="Staff (7+ yrs)",
                min_salary=170000,
                max_salary=220000,
                notice_period_days=15,
                status="active",
                description="Lead the design and deployment of autonomous agent workflows, LLM orchestration with LangGraph, and RAG pipelines.",
                required_skills=["Python", "LangGraph", "FastAPI", "Gemini API", "Vector DBs", "AsyncIO"],
                preferred_skills=["Redis", "PostgreSQL", "Docker", "Kubernetes"],
                hiring_manager_name="Dr. Aris Thorne",
                recruiter_name="Sarah Jenkins"
            )
            job3 = Job(
                title="DevOps & Cloud Infrastructure Lead",
                department="Infrastructure",
                location="Austin, TX",
                job_type="Full-time",
                experience_level="Lead (6+ yrs)",
                min_salary=145000,
                max_salary=175000,
                notice_period_days=30,
                status="active",
                description="Manage cloud infrastructure, CI/CD automation pipelines, Kubernetes clusters, and security policies.",
                required_skills=["AWS", "Terraform", "Kubernetes", "Docker", "CI/CD", "Python"],
                preferred_skills=["Prometheus", "Grafana", "Ansible"],
                hiring_manager_name="Marcus Vance",
                recruiter_name="Sarah Jenkins"
            )
            db.add_all([job1, job2, job3])
            db.commit()
            db.refresh(job1)
            db.refresh(job2)

        # Seed candidates and applications if empty
        if db.query(Candidate).count() == 0:
            c1 = Candidate(
                full_name="Alexander Chen",
                email="alexander.chen@example.com",
                phone="+1 (555) 234-5678",
                location="San Francisco, CA",
                current_company="TechFlow Systems",
                current_role="Senior Frontend Developer",
                total_experience_years=6.5,
                notice_period_days=15,
                expected_salary=155000,
                current_salary=140000,
                avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
            )
            c2 = Candidate(
                full_name="Elena Rostova",
                email="elena.rostova@example.com",
                phone="+1 (555) 876-5432",
                location="Seattle, WA",
                current_company="NeuralScale AI",
                current_role="Senior AI Engineer",
                total_experience_years=7.0,
                notice_period_days=14,
                expected_salary=190000,
                current_salary=170000,
                avatar_url="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150"
            )
            c3 = Candidate(
                full_name="Michael Chang",
                email="michael.chang@example.com",
                phone="+1 (555) 345-6789",
                location="San Jose, CA",
                current_company="CloudCore Data",
                current_role="Full Stack Architect",
                total_experience_years=8.0,
                notice_period_days=30,
                expected_salary=165000,
                current_salary=150000,
                avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150"
            )
            c4 = Candidate(
                full_name="David Okafor",
                email="david.okafor@example.com",
                phone="+1 (555) 987-6543",
                location="Austin, TX",
                current_company="Apex Security",
                current_role="Senior Cloud Engineer",
                total_experience_years=5.5,
                notice_period_days=30,
                expected_salary=150000,
                current_salary=135000,
                avatar_url="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150"
            )
            c5 = Candidate(
                full_name="Alex Mercer",
                email="alex.mercer@example.com",
                phone="+1 (555) 456-7890",
                location="New York, NY",
                current_company="Vanguard Labs",
                current_role="Staff UI Engineer",
                total_experience_years=9.0,
                notice_period_days=30,
                expected_salary=175000,
                current_salary=160000,
                avatar_url="https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=150"
            )
            db.add_all([c1, c2, c3, c4, c5])
            db.commit()

            job1 = db.query(Job).first()
            job2 = db.query(Job).offset(1).first()

            # Create Applications
            app1 = Application(
                job_id=job1.id,
                candidate_id=c1.id,
                stage="AI Screening",
                match_score=94,
                ats_score=92
            )
            app2 = Application(
                job_id=job2.id,
                candidate_id=c2.id,
                stage="Shortlisted",
                match_score=96,
                ats_score=95
            )
            app3 = Application(
                job_id=job1.id,
                candidate_id=c3.id,
                stage="Applied",
                match_score=88,
                ats_score=85
            )
            app4 = Application(
                job_id=job1.id,
                candidate_id=c5.id,
                stage="Assessment",
                match_score=95,
                ats_score=91
            )
            db.add_all([app1, app2, app3, app4])
            db.commit()

            # Screening Results
            sr1 = ScreeningResult(
                application_id=app1.id,
                overall_match_score=94,
                ats_score=92,
                skill_match_score=96,
                experience_match_score=92,
                education_match_score=90,
                requirement_match_score=94,
                key_strengths=[
                    "6.5+ years of production React & TypeScript experience",
                    "Extensive design system engineering and component libraries",
                    "Proven state management optimization (Redux Toolkit, Zustand)",
                    "Strong background in performance metrics (Core Web Vitals)"
                ],
                missing_skills=[
                    "GraphQL experience is limited (preferred requirement)",
                    "No direct WebSockets production usage listed on resume"
                ],
                ai_rationale="Alexander Chen exceeds the core experience requirement of 5 years with 6.5 years of hands-on frontend engineering. Strong alignment on TypeScript and React architecture."
            )
            db.add_all([sr1])
            db.commit()

            # Assessments
            ass1 = Assessment(
                application_id=app4.id,
                title="Frontend Architecture & React Performance",
                assessment_type="technical",
                status="completed",
                score=92,
                max_score=100,
                completed_at=datetime.utcnow() - timedelta(days=2),
                summary="Demonstrated exceptional knowledge of virtual DOM diffing, custom React hooks, and render tree optimizations."
            )
            db.add_all([ass1])

            # Interviews
            inv1 = Interview(
                application_id=app2.id,
                title="Technical System Design Interview",
                interview_type="Technical Interview",
                interviewer_name="Dr. Aris Thorne",
                scheduled_at=datetime.utcnow() + timedelta(days=1, hours=4),
                duration_minutes=60,
                meeting_link="https://meet.google.com/talentos-tech-interview",
                status="scheduled",
                notes="Focus on multi-agent synchronization and memory management."
            )
            db.add_all([inv1])

            # Notifications
            n1 = Notification(
                title="New Candidate Match",
                message="Alexander Chen scored a 94% match for Senior Frontend Engineer.",
                notification_type="info",
                is_read=False
            )
            n2 = Notification(
                title="Assessment Completed",
                message="Alex Mercer completed Frontend Architecture assessment with score 92/100.",
                notification_type="success",
                is_read=False
            )
            db.add_all([n1, n2])
            db.commit()
    finally:
        db.close()
