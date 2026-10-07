# Development of a Multi-Criteria System for Selecting and Assigning Academic Supervisors Based on Machine Learning Methods

[![Pre-Defense Status](https://img.shields.io/badge/Pre--Defense_1-In_Progress_(Oct_24)-blue.svg)](https://diploma-aitu-2027.youtrack.cloud)
[![YouTrack](https://img.shields.io/badge/YouTrack-Project_MAS-orange.svg)](https://diploma-aitu-2027.youtrack.cloud)
[![Academic Year](https://img.shields.io/badge/Academic_Year-2026--2027-success.svg)](#)

---

## 📌 1. Project Overview & Description

**Topic:** Development of a Multi-Criteria System for Selecting and Assigning Academic Supervisors Based on Machine Learning Methods  
**Domain:** EdTech, Natural Language Processing (NLP), Multi-Criteria Decision Making (MCDM), Stable Matching Optimization.

The project aims to create an intelligent software platform that automates and optimizes the distribution of graduating students among academic supervisors. The system combines modern Natural Language Processing (NLP) techniques for semantic topic-to-competency matching with constrained multi-criteria optimization algorithms to ensure balanced supervisor workloads and high mutual satisfaction.

---

## ❗ 2. Problem Statement, Target Users & Expected Outcomes

### Problem Statement
In higher education institutions, the process of assigning academic supervisors is traditionally performed manually or via basic spreadsheets. This leads to critical drawbacks:
* **Academic Mismatches:** Students are often assigned to supervisors whose research domain diverges from the student's research proposal.
* **Workload Imbalance:** Popular supervisors become overloaded, while others are underutilized, negatively impacting supervision quality.
* **Lack of Transparency & Fairness:** Subjective manual sorting creates dissatisfaction and prolonged administrative delays for academic departments.

### Target Users
1. **Graduating Students:** Search, receive AI-driven supervisor recommendations based on thesis ideas, and submit prioritized preferences.
2. **Academic Supervisors (Faculty Members):** Manage scientific interests, publication records, available quotas, and review matched applicant profiles.
3. **Department Chairs & Thesis Coordinators:** Oversee institutional quotas, configure multi-criteria optimization weights, execute global automated allocation, and generate reports.

### Expected Outcomes
* A centralized web platform automating the supervisor selection lifecycle.
* An NLP-based recommendation service calculating semantic relevance between student research drafts and supervisor publications.
* A constrained multi-criteria assignment engine guaranteeing optimal allocation without quota violations.
* A reduction in department manual coordination time by over 80%.

---

## 👥 3. Team Members, Roles & Academic Supervisor

### Team Composition

| Member | Role | Key Responsibilities | GitHub Profile |
|---|---|---|---|
| **Dias Tursynbai** | **Team Lead & Backend Engineer** | System Architecture, Database Schema, REST API (FastAPI), YouTrack/Git Management, System Integration | [@Diasb4](https://github.com/Diasb4) |
| **Ардак** | **Machine Learning Engineer** | NLP Embeddings Pipeline, Semantic Similarity Engine, MCDM Formulation & Assignment Optimization Algorithm | — |
| **Нуржан** | **Frontend Engineer** | User Experience (UX/UI) Design, Interactive Dashboards, Web Client (React/Next.js), Student/Supervisor Portals | — |

### Academic Supervisor
* **Тулебаев Ерсултан Бахытович**  
  * Должность: Сеньор-лектор  
  * Академическая степень: Магистр технических наук  
  * Кафедра / Организация: Astana IT University (AITU)

---

## 🎯 4. Project Scope & Current Development Status

### Project Scope
* **In Scope (MVP for Diploma Project):**
  * Profile management with supervisor publication/interest embeddings.
  * Semantic matching of student thesis drafts using dense vector representations (`Sentence-Transformers`).
  * Multi-criteria ranking incorporating student preferences, research alignment, and GPA/prerequisites.
  * Constrained global assignment solver (Gale-Shapley / Integer Linear Programming) ensuring strict supervisor capacity limits.
  * Administrator analytics dashboard for distribution results.
* **Out of Scope (Future Work):**
  * Automated synchronization with closed corporate payroll/HR systems.
  * Native iOS/Android mobile applications.

### Current Status
* **Current Milestone:** `Pre-defense 1` (Deadline: October 24, 2026).
* **Completed / In-Progress Activities:**
  * [x] Project Proposal & Scope Formalization
  * [x] YouTrack Project & Workflow Configuration
  * [ ] Evidence of Relevance (User Interviews)
  * [ ] Systematic Literature Review (12 sources, 8 peer-reviewed)
  * [ ] Existing Systems & Technology Comparisons
  * [ ] Architectural Diagrams (Context, Use Case, Component)
  * [ ] UX Prototypes & API Contracts
  * [ ] Verification & Evaluation Plan

---

## 💻 5. Selected Technologies

| Component | Technology | Rationale |
|---|---|---|
| **Backend API** | **Python (FastAPI)** | High asynchronous performance, native compatibility with ML/NLP libraries. |
| **Database & Vector Store** | **PostgreSQL + pgvector** | Robust relational data integrity combined with efficient cosine similarity vector search. |
| **ML & NLP Engine** | **PyTorch, Sentence-Transformers, HuggingFace** | High-quality contextual embeddings for academic text matching. |
| **Optimization Solver** | **PuLP / SciPy / NetworkX** | Mathematically verified solvers for constrained matching and assignment problems. |
| **Frontend Web Client** | **React / Next.js, TypeScript** | Modern component-based UI, strong typing, and rich responsive UX. |
| **Project Tracking** | **YouTrack Cloud & Git/GitHub** | Traceable task lifecycle, code reviews, and milestone governance. |

---

## 🔗 6. Project Management & Documentation Links

* **YouTrack Project Board:** [https://diploma-aitu-2027.youtrack.cloud](https://diploma-aitu-2027.youtrack.cloud)  
  * Project Key: `MAS`
* **Project Documentation (`/docs`):**
  * [`01-proposal.md`](docs/01-proposal.md) — Detailed Project Proposal & Scope
  * [`02-relevance-interviews.md`](docs/02-relevance-interviews.md) — CustDev User Interviews
  * [`03-literature-review.md`](docs/03-literature-review.md) — Literature Review & Comparative Analysis
  * [`04-existing-systems.md`](docs/04-existing-systems.md) — Existing System Comparison
  * [`05-technology-selection.md`](docs/05-technology-selection.md) — Technology Trade-Off Analysis
  * [`06-requirements-spec.md`](docs/06-requirements-spec.md) — FR, NFR, and Acceptance Criteria
  * [`07-verification-plan.md`](docs/07-verification-plan.md) — Test Plan, Metrics, and Evaluation Baselines
  * [`08-supervisor-feedback.md`](docs/08-supervisor-feedback.md) — Supervisor Reviews & Action Items
* **Architectural Diagrams (`/diagrams`):**
  * System Context Diagram
  * Use Case Diagram
  * Component Architecture Diagram (Draft)

---

## 🚀 7. Setup, Execution & Testing Instructions

> **Note on Implementation Phase:**  
> The project is currently at the **Analysis, Architecture & Requirements Design stage** (Pre-Defense 1). Application source code will be iteratively added to `src/` following architectural approval.

### Prerequisites (Target Environment)
* Python 3.11+
* Node.js 20+
* Docker & PostgreSQL 16 (with `pgvector` extension)

### Planned Launch Workflow
```bash
# 1. Clone repository
git clone https://github.com/Diasb4/Diploma.git
cd Diploma

# 2. Environment Configuration
cp .env.example .env

# 3. Running Services via Docker
docker compose up --build
```

*(Full step-by-step execution scripts and automated test suites will be added upon completion of milestone Pre-Defense 2).*
