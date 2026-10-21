# Multi-Criteria Academic Supervisor Assignment System (MAS)

> **Bachelor Diploma Project (2026–2027)**  
> **Topic:** Development of a Multi-Criteria System for Selecting and Assigning Academic Supervisors Based on Machine Learning Methods  
> **Institution:** Astana IT University (AITU), Department of Computer Science & Software Engineering  
> **Student Groups:** `SE-2407_SE-2420_SE-2411`  
> **Milestone Tag:** [`prob-period-1`](https://github.com/Diasb4/Diploma/tree/prob-period-1) (Pre-Defense Milestone 1)  

---

## 📌 Project Overview

**MAS** is an automated web platform designed to solve the thesis-supervisor allocation problem at Astana IT University.

Instead of handling applications through scattered Google Forms, manual spreadsheets, and ad-hoc chat requests, the platform combines:
1. **NLP-Based Topic Recommendation:** Multilingual contextual sentence embeddings (Sentence-Transformers) analyze student thesis proposals (title, abstract, keywords) against faculty research profiles and recent publications to recommend the top-5 best-aligned supervisors.
2. **Constrained Matching Optimization:** An extended **Gale-Shapley (Deferred Acceptance)** algorithm distributes students according to their submitted ranked preferences while strictly enforcing faculty supervision quotas (capacities) and guaranteeing weak Pareto stability (zero blocking pairs).
3. **Multi-Criteria Governance:** The department coordinator configures and approves candidate ranking weights (semantic match, student preference rank, and optional GPA weighting) with full auditability and immutable snapshot freezes.

---

## 🎯 Problem Statement, Target Users & Outcomes

### The Problem
Every academic year, thesis allocation runs into recurring systemic bottlenecks:
* **Topic Mismatch:** Students frequently end up with supervisors whose current research has little to do with the student's project idea.
* **Faculty Workload Imbalance:** Highly visible professors receive 20–30 applications against quotas of 3–5 students, while others remain under-subscribed, impairing advising quality.
* **Manual Coordination Overhead:** Department coordinators spend 2 to 3 weeks manually resolving conflicts, reassigning rejected students, and tracking quotas in spreadsheets.

### Target Users
* **Students:** Explore faculty research areas, get automated topic-similarity recommendations, rank 1–5 preferred supervisors, and inspect published results.
* **Supervisors:** Maintain research interests and publication text, propose annual student capacities, and review assigned candidates.
* **Department Coordinators:** Manage allocation cycles, approve quotas and ranking policies, freeze input snapshots, execute batch matching, inspect draft metrics, and export sanitized CSV records.

### Expected Outcomes
* A fully integrated web application with dedicated, role-scoped views for Students, Supervisors, and Coordinators.
* An automated matching service that produces fair, stable allocations with **zero quota violations** and **zero blocking pairs**.
* Significant reduction in allocation time from weeks to minutes, with over **90% of students receiving a top-3 choice**.

---

## 👥 Team Members, Roles & Supervision

| Full Name | Student Group | Engineering Role | GitHub Account |
|---|:---:|---|:---:|
| **Dias Tursynbai** | SE-2407 | **Team Lead / Backend Engineer**<br/>FastAPI backend architecture, PostgreSQL schema, cycle lifecycle, RBAC authorization, Gale-Shapley integration | [@Diasb4](https://github.com/Diasb4) |
| **Ardak Avissauly** | SE-2420 | **Machine Learning & Optimization Engineer**<br/>NLP embeddings (Sentence-Transformers), similarity scoring, MCDM policies, solver benchmarking (MILP vs Gale-Shapley) | Contributor |
| **Nurzhan Zhumabekov** | SE-2411 | **Frontend & UX Engineer**<br/>React / Next.js client, preference ranking UI, coordinator dashboards, PlantUML diagrams, interactive Figma prototypes | [@Nurzhan-Zhumabekov](https://github.com/Nurzhan-Zhumabekov) |

### Academic Supervisor
* **Тулебаев Ерсултан Бахытович**  
  Senior Lecturer, Master of Technical Sciences  
  Astana IT University (AITU)

---

## 🚀 Scope Boundaries & Development Status

### Scope Boundaries
* **In-Scope for Diploma MVP:**
  * Single academic department (Software Engineering at AITU).
  * Single active allocation cycle at a time with immutable frozen snapshots.
  * Role-based access control (Student, Supervisor, Coordinator) using pre-provisioned MAS test accounts.
  * Thesis proposal submission (title, abstract 100–5000 characters, keywords).
  * Multilingual semantic text similarity (Russian, English, Kazakh terminology).
  * Configurable supervisor-side candidate ranking ($w_{\text{topic}} + w_{\text{pref}} + w_{\text{gpa}} = 1.0$).
  * One-to-many student-proposing Gale-Shapley solver with hard capacity constraints.
  * Web interface supporting desktop (1440px) and mobile (360px) viewports without horizontal scroll.
  * Formula-injection-safe CSV export and audit event logging.
* **Explicitly Out-of-Scope (Future Releases):**
  * Direct enterprise SSO / Active Directory integration (deferred to production deployment).
  * Automated synchronization with university ERP / Platonus / 1C / Payroll.
  * Native iOS / Android mobile applications.

### Current Development Status (Pre-Defense 1 Milestone: October 22, 2026)
All 11 mandatory components for Pre-Defense 1 have been completed, verified, and tagged under [`prob-period-1`](https://github.com/Diasb4/Diploma/tree/prob-period-1):

- [x] **Project Proposal & Scope:** Defined problem statement, users, and boundaries ([`docs/01-proposal.md`](docs/01-proposal.md) / [`docs/project-proposal.md`](docs/project-proposal.md))
- [x] **Evidence of Relevance:** Conducted student survey ($N=12$, mean rating 4.1/5 for system), interview guide ([`docs/02-relevance-interviews.md`](docs/02-relevance-interviews.md) / [`docs/relevance-interviews.md`](docs/relevance-interviews.md))
- [x] **Systematic Literature Review:** Analyzed 14 sources (10 scientific from 2021–2026) covering SBERT and Gale-Shapley ([`docs/03-literature-review.md`](docs/03-literature-review.md) / [`docs/literature-review.md`](docs/literature-review.md))
- [x] **Existing Systems Comparison:** Evaluated Google Sheets, Moodle, ProjectAlloc, and MentorCliq across 8 criteria ([`docs/04-existing-systems.md`](docs/04-existing-systems.md) / [`docs/existing-systems.md`](docs/existing-systems.md))
- [x] **Technology Selection & Trade-Offs:** Documented ADRs for NLP models, solvers, and storage ([`docs/05-technology-selection.md`](docs/05-technology-selection.md) / [`docs/technology-comparison.md`](docs/technology-comparison.md))
- [x] **Requirements Specification:** 17 Functional (MoSCoW) and 8 Non-Functional requirements with formal Acceptance Criteria ([`docs/06-requirements-spec.md`](docs/06-requirements-spec.md) / [`docs/requirements.md`](docs/requirements.md))
- [x] **Architecture Diagrams:** System Context (Level 1), Component Diagram (Level 2), and Use Case Diagram ([`diagrams/`](diagrams/))
- [x] **UX Wireframes & Prototype:** Screen mockups (SVG/PNG), API contracts, interactive Figma link ([`prototype/`](prototype/) / [`prototypes/`](prototypes/))
- [x] **Verification & Evaluation Plan:** Testing levels, metrics ($S_1$, $S_3$, Gini, $N_{BP}$), and synthetic benchmark ([`docs/07-verification-plan.md`](docs/07-verification-plan.md) / [`docs/evaluation-plan.md`](docs/evaluation-plan.md))
- [x] **Project Management & Risks:** Execution plan, peer review pairing, milestone schedule ([`PRE_DEFENSE_PLAN.md`](PRE_DEFENSE_PLAN.md) / [`docs/youtrack-management.md`](docs/youtrack-management.md))
- [x] **Supervisor Feedback Log:** 3 formal consultation sessions with Тулебаев Е.Б. documented ([`docs/supervisor-feedback.md`](docs/supervisor-feedback.md))
- [x] **Consolidated Report PDF:** Single 18-page PDF report matching `prob-period-1` ([`SE-2407_SE-2420_SE-2411_Tursynbai_ProbPeriod1.pdf`](SE-2407_SE-2420_SE-2411_Tursynbai_ProbPeriod1.pdf))

---

## 🛠 Selected Technology Stack

* **Backend & API Layer:** Python 3.11+, FastAPI (async Starlette engine), Pydantic V2, SQLAlchemy
* **Database & Persistence:** PostgreSQL 16 with `pgvector` extension for high-performance vector indexing
* **Machine Learning / NLP:** Sentence-Transformers (`paraphrase-multilingual-MiniLM-L12-v2`, `cointegrated/rubert-tiny2`), PyTorch, Scikit-learn (TF-IDF fallback)
* **Optimization & Solvers:** One-to-many Extended Gale-Shapley (Deferred Acceptance with Quotas), SciPy MILP / PuLP (HiGHS solver) for benchmark comparisons
* **Frontend Client:** React, Next.js (TypeScript), Tailwind CSS
* **Design & Wireframes:** Figma Interactive Prototype, PlantUML
* **Testing & Quality:** Pytest, PyMuPDF, ReportLab
* **Project Tracking:** YouTrack (Cloud), Git & GitHub

---

## 📂 Repository Directory Layout

```text
Diploma/
├── README.md                                    # Main project documentation and quickstart
├── PRE_DEFENSE_PLAN.md                          # Master pre-defense execution plan & risk matrix
├── requirements.txt                             # Python dependencies for ML core and reporting
├── SE-2407_SE-2420_SE-2411_Tursynbai_ProbPeriod1.pdf # Consolidated Pre-Defense 1 PDF report
├── build_consolidated_report.py                 # Automated two-pass PDF generator
├── docs/                                        # Project documentation (all 11 mandatory sections)
│   ├── project-proposal.md                      # (01-proposal.md) Project Proposal & Scope
│   ├── relevance-interviews.md                  # (02-relevance-interviews.md) User Research & Survey
│   ├── literature-review.md                     # (03-literature-review.md) Literature Review Matrix
│   ├── existing-systems.md                      # (04-existing-systems.md) Benchmark of 4 Existing Systems
│   ├── technology-comparison.md                 # (05-technology-selection.md) Architecture Decision Records
│   ├── requirements.md                          # (06-requirements-spec.md) 17 FRs, 8 NFRs, Acceptance Criteria
│   ├── evaluation-plan.md                       # (07-verification-plan.md) Testing & Metrics Plan
│   ├── supervisor-feedback.md                   # Formal review records with Тулебаев Е.Б.
│   └── youtrack-management.md                   # YouTrack board structure, tasks, and traceability
├── diagrams/                                    # Architectural diagrams (PlantUML & rendered graphics)
│   ├── README.md                                # Architecture description and traceability
│   ├── src/                                     # PlantUML editable source files (.puml)
│   │   ├── system-context.puml                  # C4 Level 1 System Context Diagram
│   │   ├── component-diagram.puml               # C4 Level 2 Component Architecture Diagram
│   │   └── use-case.puml                        # Actor Use Case Diagram
│   ├── rendered/                                # High-resolution PNG and SVG diagram exports
│   └── exports/                                 # Role-specific use case exports (Student, Supervisor, Coordinator)
├── prototype/                                   # UX Prototypes, wireframes, and API contracts
│   ├── README.md                                # Screen specifications and interactive Figma link
│   ├── api-contracts.md                         # Sample REST API request/response JSON schemas
│   └── wireframes/                              # High-resolution wireframe mockups (SVG and PNG)
│       ├── 01-student-proposal.png              # Screen 1: Student Proposal Editor & Live Recommendations
│       ├── 02-student-preferences.png           # Screen 2: Student Preference List Reordering
│       └── 03-coordinator-allocation.png        # Screen 3: Coordinator Allocation & Review Panel
├── src/                                         # Production ML & Optimization Source Code
│   ├── models/                                  # Domain Pydantic models (Student, Supervisor, Quota, Allocation)
│   ├── nlp/                                     # Semantic vectorization engine (SBERT / TF-IDF)
│   ├── scoring/                                 # Multi-criteria evaluation (MCDM / TOPSIS / Soft Taxonomy)
│   ├── matching/                                # Allocation solvers (Gale-Shapley, MILP, Greedy)
│   ├── evaluation/                              # Scientific metrics (Satisfaction, Gini, Blocking pairs)
│   ├── generator/                               # Synthetic university dataset generator
│   └── engine.py                                # High-level MatchingEngine facade
├── tests/                                       # Automated pytest verification test suite
│   ├── test_nlp.py                              # Text cleaning and cosine similarity unit tests
│   ├── test_scoring.py                          # Multi-criteria scoring and TOPSIS property tests
│   └── test_matching.py                         # Invariant checks, stability, and quota enforcement
└── experiments/                                 # Empirical benchmarking scripts
    ├── allocation_comparison.py                 # Multi-scenario solver simulation (200 students, 25 supervisors)
    └── requirements.txt                         # Solver benchmark dependencies
```

---

## 🔗 Project Tracking & External Links

* **YouTrack Board:** [diploma-aitu-2027.youtrack.cloud/projects/MAS](https://diploma-aitu-2027.youtrack.cloud/projects/MAS) (Project Key: `MAS`)
* **Interactive Figma Prototype:** [Figma MAS Workspace](https://www.figma.com/design/9CgkSjXyeDTuWuDcsW6W8A) (Public view access enabled for committee)
* **GitHub Repository:** [https://github.com/Diasb4/Diploma](https://github.com/Diasb4/Diploma)
* **Verified Milestone Tag:** [`prob-period-1`](https://github.com/Diasb4/Diploma/tree/prob-period-1)

---

## 💻 Local Setup & Testing Instructions

### 1. Prerequisites
* Python 3.11, 3.12, 3.13, or 3.14
* Git

### 2. Environment Setup
```bash
# Clone the repository
git clone https://github.com/Diasb4/Diploma.git
cd Diploma

# Create and activate virtual environment
python -m venv .venv

# On Linux / macOS:
source .venv/bin/activate
# On Windows (PowerShell):
.venv\Scripts\Activate.ps1

# Install core dependencies
pip install -r requirements.txt
```

### 3. Running Automated Tests
Run the automated pytest test suite to verify matching invariants, text similarity bounds, and multi-criteria scoring:
```bash
python -m pytest tests/ -v
```
*Expected Result:* All 9 tests pass in <4 seconds.

### 4. Running the Matching Simulation Benchmark
Execute the multi-scenario allocation benchmark comparing Gale-Shapley against MILP and Greedy baselines:
```bash
python experiments/allocation_comparison.py
```

### 5. Re-generating the Consolidated Pre-Defense PDF Report
To rebuild the official 18-page PDF report matching `prob-period-1`:
```bash
python build_consolidated_report.py
```
Output generated: `SE-2407_SE-2420_SE-2411_Tursynbai_ProbPeriod1.pdf`

---

## 📋 Git Workflow & Peer Review Policy

* Direct pushes to `main` are strictly prohibited.
* Features and documentation are developed in dedicated branches: `MAS-<id>-<description>`.
* Every Pull Request requires mandatory review and approval before merging:
  * **Dias's PRs** ➔ Reviewed & Approved by **Nurzhan**
  * **Nurzhan's PRs** ➔ Reviewed & Approved by **Ardak**
  * **Ardak's PRs** ➔ Reviewed & Approved by **Dias**
* All commits follow the format: `MAS-<id>: <Imperative summary of work>`.
* Merged PRs are linked directly to the corresponding YouTrack issue before closing.
