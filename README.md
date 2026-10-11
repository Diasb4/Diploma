# Multi-Criteria Academic Supervisor Assignment System (MAS)

> **Diploma Project**  
> **Topic:** Development of a Multi-Criteria System for Selecting and Assigning Academic Supervisors Based on Machine Learning Methods  
> **Institution:** Astana IT University (AITU), 2026–2027  

---

## Overview

This project is a web platform designed to solve the problem of assigning graduating students to academic supervisors. 

Instead of handling topic applications through scattered Google Forms and spreadsheets, the system combines:
1. **NLP-based topic matching:** analyzing student thesis abstracts against faculty research profiles and publications to suggest suitable advisors.
2. **Constrained matching optimization:** running an extended Gale-Shapley (Hospital-Resident) algorithm to fairly distribute students according to their ranked preferences while strictly respecting supervisor quota limits.

---

## Problem & Objectives

### The Problem
Every academic year, thesis allocation runs into the same bottlenecks:
* **Topic mismatch:** Students frequently end up with supervisors whose current research has little to do with the student's project idea.
* **Uneven faculty workload:** Well-known professors get overwhelmed with applications, while others have open capacity, leading to unbalanced advising quality.
* **Manual coordination overhead:** Departments spend weeks manually resolving conflicts, handling rejections, and reassigning unallocated students in spreadsheets.

### Target Users
* **Students:** Explore faculty research areas, get topic-match recommendations, and submit an ordered list of preferred supervisors.
* **Supervisors:** Maintain research interests and publications, set student capacity quotas for the year, and review assigned candidates.
* **Department Coordinators:** Manage global quotas, review matching metrics, resolve edge cases, and export final allocation lists.

### Expected Results
* A working web application with dedicated views for students, faculty, and administrators.
* An automated matching service that produces fair, stable allocations with zero quota violations.
* Significant reduction in the time required by department staff to coordinate thesis assignments.

---

## Team & Supervision

### Team Members

| Name | Role | Responsibilities | GitHub |
|---|---|---|---|
| **Dias Tursynbai** | Team Lead / Backend | Project architecture, FastAPI backend, database schema, matching pipeline integration | [@Diasb4](https://github.com/Diasb4) |
| **Ardak** | ML Engineer | NLP text embeddings (Sentence-Transformers), similarity scoring, optimization solver | Contributor |
| **Nurzhan** | Frontend Engineer | Next.js / React client, preference ranking UI, dashboards and data visualization | Contributor |

### Academic Supervisor
* **Тулебаев Ерсултан Бахытович**  
  Senior Lecturer, Master of Technical Sciences  
  Astana IT University

---

## Scope & Current Status

### Scope Boundaries
* **In Scope for Diploma:**
  * User profiles and role-based access (Student, Supervisor, Coordinator).
  * Thesis proposal submission (title, abstract, keywords).
  * Text vectorization and similarity search using PostgreSQL `pgvector`.
  * Multi-criteria ranking (semantic match + student preference rank + GPA weight).
  * Batch allocation solver under hard capacity constraints.
  * Web interface for preference submission and results inspection.
* **Out of Scope:**
  * Direct integration with internal university HR/payroll systems.
  * Native mobile apps (the web client is mobile-responsive).

### Current Development Status
* **Milestone:** Pre-Defense 1 (October 24, 2026)
* **Stage:** Analysis, System Design, and Requirements Formalization.
* **Current Tasks:**
  - [x] Initial repository setup and branch conventions
  - [x] Project proposal and scope definition
  - [ ] Problem validation interviews (CustDev)
  - [ ] Literature review of matching algorithms and NLP methods
  - [ ] System comparison and technology selection
  - [ ] Architecture diagrams (System Context, Use Case, Component)
  - [ ] UI wireframes and API specifications
  - [ ] Verification plan and baseline benchmarks

---

## Tech Stack

* **Backend:** Python 3.11, FastAPI, SQLAlchemy, Pydantic
* **Database & Vectors:** PostgreSQL 16 with `pgvector`
* **Machine Learning / NLP:** PyTorch, Sentence-Transformers (`all-MiniLM-L6-v2`)
* **Optimization:** Extended Gale-Shapley algorithm / PuLP (Integer Linear Programming)
* **Frontend:** React, Next.js (TypeScript), Tailwind CSS
* **Project Management:** YouTrack, Git / GitHub

---

## Project Tracking & Documentation

* **YouTrack Board:** [diploma-aitu-2027.youtrack.cloud](https://diploma-aitu-2027.youtrack.cloud) (Project Key: `MAS`)
* **Project Documentation (`/docs`):**
  * `01-proposal.md` — Project proposal, objectives, and scope boundaries
  * `02-relevance-interviews.md` — User research and stakeholder interview notes
  * `03-literature-review.md` — Survey of existing academic papers and methods
  * `04-existing-systems.md` — Comparison of existing allocation systems
  * `05-technology-selection.md` — Technology choices and alternatives
  * `06-requirements-spec.md` — Functional, non-functional requirements, and acceptance criteria
  * `07-verification-plan.md` — Testing strategy, evaluation metrics, and baselines
  * `08-supervisor-feedback.md` — Supervisor consultation log and revision history
* **Architecture Diagrams (`/diagrams`):**
  * System Context Diagram (C4 Level 1)
  * Use Case Diagram
  * Draft Component Diagram (C4 Level 3)

---

## Getting Started

> **Note:** The application code is currently in the design phase. Runnable services will be added during Milestone 2.

### Planned Local Setup (Docker)

```bash
# 1. Clone repository
git clone https://github.com/Diasb4/Diploma.git
cd Diploma

# 2. Configure environment variables
cp .env.example .env

# 3. Start services
docker compose up --build
```

### Git Workflow Rules
* `main` contains stable, reviewed versions only.
* All features and documents are developed in separate task branches (`MAS-<id>-<description>`).
* Changes are merged via Pull Request with review from another team member.
* Each pre-defense submission is marked with a dedicated Git tag (e.g. `pre-defense-1`).
