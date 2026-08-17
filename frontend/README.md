# TalentOS Frontend — Recruiter AI Web Application

Production React 19 + TypeScript + Vite frontend application reproducing the **Stitch UI Design System** (`projects/14430195552694083193`).

---

## 🎨 Design System & Stitch Screen Implementations

- **Typography:** `Inter` (Sans-Serif Headlines & Body) + `JetBrains Mono` (Code/Data) + `Material Symbols Outlined` icons.
- **Color System:** Surface (`#f8f9ff`), Text (`#0b1c30`), Primary Container (`#131b2e`), Secondary (`#006c49`), Secondary Container (`#6cf8bb`), Error (`#ba1a1a`).
- **Sidebar:** Fixed `260px` sidebar with logo badge, role selector pill (`Recruiter`, `Hiring Manager`, `HR Admin`), search bar, and notifications.

### Included Screens:
1. **Recruiter Dashboard (`/`)**: Hero greeting, KPI stat cards, Process Bottleneck diagnostic banner, hiring pipeline overview, live activity feed.
2. **Candidate Pipeline (`/pipeline`)**: Interactive 7-Stage Kanban board (Applied → AI Screening → Shortlisted → Assessment → Interview → Offer → Hired / Rejected) with instant stage updates.
3. **Candidate Profile (`/candidates/[id]`)**: Candidate header, match score gauges, `check_circle` Key Strengths, `warning` Missing Skills, AI match rationale, and interactive resume viewer.
4. **AI Candidate Matcher (`/matcher`)**: Side-by-side candidate vs job comparison matrix, requirement breakdown table, logistical compatibility cards.
5. **Job Requisition Management (`/jobs`)**: Job creation modal, salary band sliders, required/preferred skill taggers.
6. **Interview Scheduling (`/interviews`)**: Schedule interviews with Google Meet link integration.
7. **Assessments (`/assessments`)**: Assign technical/behavioral tests and view candidate evaluation scorecards.
8. **Hiring Analytics (`/analytics`)**: Real computed metrics (Time-to-hire, offer acceptance rate, stage conversion chart).
9. **AI Recruiter Agent Side Drawer**: Interactive conversational assistant supporting direct natural language recruitment actions.

---

## ⚡ Quickstart

```bash
# Install dependencies
npm install

# Start Vite dev server on port 3000
npm run dev

# Build for production
npm run build
```
