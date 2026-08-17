# TalentOS — Enterprise Recruiter AI Platform

> Fully functional, production-quality AI Recruitment Assistant and ATS operating system reproducing the **Stitch UI Design System**.

TalentOS automates candidate screening, resume parsing, candidate matching, 7-stage pipeline management, interview scheduling, technical assessments, and hiring analytics with an integrated **AI Recruiter Agent**.

---

## 🚀 Key Features

### 1. 🤖 AI Recruiter Agent (Tool-Calling Assistant)
- Conversational recruitment agent capable of taking direct database actions.
- Natural language tools:
  - *"Find best Python candidates"*
  - *"Shortlist Alexander Chen for Senior Frontend Engineer"*
  - *"Schedule technical interview for Elena Rostova"*
  - *"Analyze hiring funnel bottlenecks"*

### 2. 📊 Recruiter Dashboard (`/` — Stitch Screen `8109cbcf31...`)
- **Hero Welcome Banner:** Live greeting with quick actions and daily status pills.
- **KPI Metrics:** Active Jobs, Candidates Screened, Avg Time to Hire, Offer Acceptance Rate.
- **Bottleneck Diagnostics:** Automatic detection of screening queues with instant action links.
- **Hiring Pipeline Overview & Activity Stream:** Real-time event updates.

### 3. 🎯 Candidate Pipeline (`/pipeline` — Stitch Screen `9995afa052...`)
- **7-Stage Interactive Kanban:** Applied → AI Screening → Shortlisted → Assessment → Interview → Offer → Hired / Rejected.
- **Candidate Cards:** Match rating badge (`94% Match`), ATS parser score (`92%`), candidate skills, notice period, and quick stage mover.
- **Requisition Filtering:** Filter pipeline board by active job openings.

### 4. 👤 Candidate Profile & AI Screening (`/candidates/[id]` — Stitch Screen `b097ccc464...`)
- **AI Screening Summary:** `check_circle` Key Technical Strengths, `warning` Missing Skills, and AI Match Rationale.
- **Interactive Document Viewer:** Parsed PDF/DOCX resume text viewer.
- **Work History & Recruiter Notes:** Complete work timeline and private recruiter feedback logs.

### 5. ⚡ AI Candidate Matcher (`/matcher` — Stitch Screen `9f1255a70f...`)
- **Multi-Criteria Comparison:** Evaluate any candidate against target job requisitions.
- **Requirement Alignment Table:** Side-by-side comparison of required skills, experience level, notice period, and match status badges.
- **Logistical Compatibility:** Salary expectations vs budget max, start date availability, location/work model fit.

### 6. 💼 Job Management, Interviews & Analytics
- **Job Requisitions (`/jobs`):** Create and manage job openings, salary bands, and skill requirements.
- **Interview Scheduling (`/interviews`):** Schedule technical/behavioral interviews with video meeting link generation.
- **Assessments (`/assessments`):** Technical and behavioral test assignment tracking and score cards.
- **Real Hiring Analytics (`/analytics`):** Computed time-to-hire, offer acceptance rate, and stage conversion metrics.

---

## 🛠️ Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Stitch-derived styling, Material Symbols.
- **Backend:** Python 3.14, FastAPI, SQLAlchemy ORM, SQLite / PostgreSQL.
- **AI Engine:** Google Gemini API, structured JSON parsing, tool-calling agent framework.
- **Resume Parsing:** `pypdf`, `python-docx` for automated text and skill extraction.

---

## 📦 Project Structure

```
recruiter ai/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application entrypoint & CORS
│   │   ├── database.py          # SQLAlchemy SQLite DB engine & seed populator
│   │   ├── models.py            # ORM Database Schema (Jobs, Candidates, Applications...)
│   │   ├── schemas.py           # Pydantic v2 validation models
│   │   ├── routers/             # REST API Endpoints (jobs, candidates, pipeline, matching...)
│   │   └── services/            # AI Screening, Resume Parsing & Recruiter Agent
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/          # 260px Stitch Sidebar, Header
│   │   │   ├── dashboard/       # Recruiter Dashboard View (Stitch Screen 1)
│   │   │   ├── pipeline/        # Candidate Pipeline Kanban (Stitch Screen 2)
│   │   │   ├── profile/         # Candidate Profile & Screening (Stitch Screen 3)
│   │   │   ├── matcher/         # AI Candidate Matcher View (Stitch Screen 4)
│   │   │   ├── jobs/            # Job Requisition Management
│   │   │   ├── scheduling/      # Interview Scheduling
│   │   │   ├── assessments/     # Assessments Tracking
│   │   │   ├── analytics/       # Hiring Analytics View
│   │   │   └── assistant/       # AI Recruiter Agent Side Drawer
│   │   ├── services/            # API client service calls
│   │   ├── types/               # TypeScript interfaces
│   │   ├── App.tsx              # Main application shell & router
│   │   └── index.css            # Stitch design tokens & Tailwind CSS
│   └── vite.config.ts
└── README.md
```

---

## ⚡ Quickstart & Local Setup

### 1. Start FastAPI Backend (Port 8000)

```bash
# Navigate to project root
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
```
- API Base Endpoint: `http://127.0.0.1:8000`
- Interactive Swagger Docs: `http://127.0.0.1:8000/docs`

### 2. Start Vite React Frontend (Port 3000)

```bash
cd frontend
npm install
npm run dev
```
- Application Web Dashboard: `http://localhost:3000`

---

## 📡 API Endpoint Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/jobs` | List active job requisitions |
| `POST` | `/api/v1/jobs` | Create new job requisition |
| `GET` | `/api/v1/candidates` | List active candidates |
| `POST` | `/api/v1/candidates/upload_resume` | Upload PDF/DOCX resume & execute AI parsing |
| `GET` | `/api/v1/pipeline` | List candidate applications in 7-stage Kanban |
| `PATCH`| `/api/v1/pipeline/{id}/stage` | Move candidate to new stage (e.g. Shortlisted) |
| `GET` | `/api/v1/screening/{candidate_id}` | Fetch AI screening score, strengths, and missing skills |
| `POST` | `/api/v1/matching/compare` | Evaluate candidate vs job match breakdown matrix |
| `GET/POST`| `/api/v1/interviews` | Schedule and list interviews |
| `GET/POST`| `/api/v1/assessments` | Assign and view technical assessment results |
| `GET` | `/api/v1/analytics/dashboard` | Fetch computed hiring analytics & bottleneck status |
| `POST` | `/api/v1/assistant/chat` | Send query to AI Recruiter Agent |

---

## 🔐 Privacy & Bias Control
- Candidate ranking is based strictly on verified technical skills, relevant experience years, notice period, and salary expectations.
- Demographic attributes are excluded from match evaluation algorithms.
"# Recruiter-AI-Agent" 
