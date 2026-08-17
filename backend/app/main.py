from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import init_db
from .routers import jobs, candidates, pipeline, screening, matching, interviews, assessments, analytics, assistant, notifications

app = FastAPI(
    title="TalentOS - Recruiter AI Platform API",
    description="Backend API powering candidate screening, recruitment workflows, AI matching, scheduling, and hiring analytics.",
    version="1.0.0"
)

# CORS middleware for React / Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database schema and seed data on startup
@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/")
def root():
    return {
        "status": "online",
        "platform": "TalentOS Recruiter AI Platform API",
        "version": "1.0.0",
        "docs": "/docs"
    }

# Include routers
app.include_router(jobs.router)
app.include_router(candidates.router)
app.include_router(pipeline.router)
app.include_router(screening.router)
app.include_router(matching.router)
app.include_router(interviews.router)
app.include_router(assessments.router)
app.include_router(analytics.router)
app.include_router(assistant.router)
app.include_router(notifications.router)
