# YouTrack Project Management & Task Traceability Specification

**Project:** Multi-Criteria Academic Supervisor Assignment System (MAS)  
**Institution:** Astana IT University (AITU), 2026–2027  
**YouTrack Board URL:** [https://diploma-aitu-2027.youtrack.cloud/projects/MAS](https://diploma-aitu-2027.youtrack.cloud/projects/MAS)  
**Project Key:** `MAS`  
**Academic Supervisor:** Тулебаев Ерсултан Бахытович  
**Milestone Deadline:** October 22, 2026 (Pre-Defense 1)  

---

## 1. Team Organization & Role Allocation

The MAS project team in YouTrack comprises all three student engineers and the academic supervisor:

| Member Name | Student Group | YouTrack Username | System Role | Primary Responsibilities |
|---|:---:|---|---|---|
| **Dias Tursynbai** | SE-2407 | `dias.tursynbai` / `@Diasb4` | **Team Lead & Backend Engineer** | Backend API, architecture, requirements spec, cycle lifecycle, database schema, Gale-Shapley solver integration. |
| **Ardak Avissauly** | SE-2420 | `ardak.avissauly` | **ML & Optimization Engineer** | NLP embeddings (SBERT/TF-IDF), literature review, technology selection, verification plan, solver benchmarking. |
| **Nurzhan Zhumabekov** | SE-2411 | `nurzhan.zhumabekov` | **Frontend & UX Engineer** | User research, competitor benchmark, use case modeling, wireframes, interactive Figma prototype. |
| **Тулебаев Ерсултан Бахытович** | Faculty | `ersultan.tulebayev` | **Academic Supervisor** | Review of substance, scope bounding, algorithm ethics, milestone verification. |

---

## 2. Complete YouTrack Issues Registry (Pre-Defense 1 Milestone)

All tasks covering research, requirements, system design, prototyping, implementation, and testing are formally tracked in YouTrack with explicit priorities, deadlines, assignees, acceptance criteria, and direct GitHub links:

| Issue ID | Task Title & Summary | Assignee | Priority | Deadline | Status | Target Deliverables & Verification Criteria | Linked GitHub Branch / PR / Commit |
|:---:|---|:---:|:---:|:---:|:---:|---|:---:|
| **MAS-1** | **Project Proposal & Scope Definition**<br/>Formulate problem statement, target users, aim, objectives, and scope boundaries. | Dias Tursynbai | Major | Oct 10, 2026 | **Done** | [x] Problem statement defined.<br/>[x] 3 user personas.<br/>[x] Scope strictly bounded to 1 department/cycle.<br/>[x] Engineering complexity documented. | Branch: `MAS-1-project-proposal`<br/>PR: [#8](https://github.com/Diasb4/Diploma/pull/8)<br/>File: `docs/01-proposal.md` |
| **MAS-2**<br/>*(MAS-11)* | **Evidence of Relevance: User Research**<br/>Empirical validation of thesis allocation bottlenecks. | Nurzhan Zhumabekov | Major | Oct 11, 2026 | **Done** | [x] Discovery survey of 12 students.<br/>[x] 11 faculty policy questions.<br/>[x] Hypotheses H1–H6 validation matrix.<br/>[x] Pain points & direct quotes analyzed. | Branch: `MAS-11-relevance-interviews`<br/>PR: [#3](https://github.com/Diasb4/Diploma/pull/3)<br/>File: `docs/02-relevance-interviews.md` |
| **MAS-3** | **Systematic Literature Review**<br/>Critical analysis of matching algorithms & NLP models. | Ardak Avissauly | Major | Oct 12, 2026 | **Done** | [x] 14 sources analyzed (10 peer-reviewed 2021–2026).<br/>[x] Structured comparison matrix.<br/>[x] Synthesis of gaps in SBERT and Gale-Shapley. | Branch: `MAS-3-literature-review`<br/>PR: [#7](https://github.com/Diasb4/Diploma/pull/7)<br/>File: `docs/03-literature-review.md` |
| **MAS-4**<br/>*(MAS-12)* | **Existing System Comparison**<br/>Benchmark of 4 existing solutions against 8 criteria. | Nurzhan Zhumabekov | Normal | Oct 13, 2026 | **Done** | [x] Evaluated Sheets, Moodle, ProjectAlloc, MentorCliq.<br/>[x] 8 criteria comparison matrix.<br/>[x] Clear justification for custom MAS solution. | Branch: `MAS-12-existing-system-comparison`<br/>PR: [#4](https://github.com/Diasb4/Diploma/pull/4)<br/>File: `docs/04-existing-systems.md` |
| **MAS-5** | **Technology Selection & Trade-Offs**<br/>Architecture Decision Records (ADRs) for tech stack. | Ardak Avissauly | Major | Oct 15, 2026 | **Done** | [x] Sentence-Transformers vs TF-IDF vs OpenAI API.<br/>[x] Gale-Shapley vs MILP vs Greedy heuristic.<br/>[x] FastAPI + PostgreSQL (pgvector) justification. | Branch: `MAS-4-technology-selection`<br/>PR: [#9](https://github.com/Diasb4/Diploma/pull/9)<br/>File: `docs/05-technology-selection.md` |
| **MAS-6**<br/>*(MAS-8)* | **Requirements Specification**<br/>Formal functional and non-functional requirements. | Dias Tursynbai | Critical | Oct 14, 2026 | **Done** | [x] 17 Functional Requirements (MoSCoW).<br/>[x] 8 Non-Functional Requirements.<br/>[x] Verifiable ACs for all 17 Must-Haves (AC-F01–F12, AC-N01–N05).<br/>[x] Deterministic scoring formula $r(i,j)$. | Branch: `MAS-8-Requirements-Specification`<br/>PR: [#6](https://github.com/Diasb4/Diploma/pull/6)<br/>File: `docs/06-requirements-spec.md` |
| **MAS-7a** | **System Context & Component Diagrams**<br/>C4 Level 1 & Level 2 architectural modeling. | Dias Tursynbai | Major | Oct 17, 2026 | **Done** | [x] System Context diagram (.puml & .png).<br/>[x] Component Architecture diagram (.puml & .png).<br/>[x] Clean layered architecture described. | Branch: `MAS-7a-system-diagrams`<br/>PR: [#5](https://github.com/Diasb4/Diploma/pull/5)<br/>Directory: `diagrams/` |
| **MAS-7b**<br/>*(MAS-13)* | **Use Case Modeling & Scenarios**<br/>Actor interactions for Student, Supervisor, Coordinator. | Nurzhan Zhumabekov | Major | Oct 16, 2026 | **Done** | [x] PlantUML use-case diagrams with include/extend.<br/>[x] Traceability matrix to functional requirements.<br/>[x] High-resolution SVG/PNG exports. | Branch: `MAS-13-use-case-diagram`<br/>PR: [#2](https://github.com/Diasb4/Diploma/pull/2)<br/>File: `diagrams/src/use-case.puml` |
| **MAS-8**<br/>*(MAS-14)* | **UX Wireframes & Prototype Specs**<br/>Key screen mockups and interactive prototype. | Nurzhan Zhumabekov | Critical | Oct 19, 2026 | **Done** | [x] Screen 1: Proposal Editor & Live Recommendations.<br/>[x] Screen 2: Preference List Reordering Builder.<br/>[x] Screen 3: Coordinator Allocation & Review Panel.<br/>[x] Interactive Figma presentation link.<br/>[x] REST API request/response JSON contracts. | Branch: `MAS-14-ux-prototypes`<br/>PR: [#1](https://github.com/Diasb4/Diploma/pull/1)<br/>Directory: `prototype/` |
| **MAS-9** | **Verification and Evaluation Plan**<br/>Multi-tier testing strategy, metrics & baselines. | Ardak Avissauly | Critical | Oct 19, 2026 | **Done** | [x] Testing pyramid (Unit, Integration, E2E, Load).<br/>[x] Formulated $S_1$, $S_3$, $\bar{R}$, Gini, $N_{BP}$ metrics.<br/>[x] Multi-baseline comparison against Historical, First-Come, Random.<br/>[x] 200-student simulation benchmark. | Branch: `MAS-5-verification-plan`<br/>PR: [#11](https://github.com/Diasb4/Diploma/pull/11)<br/>File: `docs/07-verification-plan.md` |
| **MAS-10** | **Repository Setup & Automation**<br/>Repository scaffolding, README, and linters. | Dias Tursynbai | Major | Oct 08, 2026 | **Done** | [x] Repository initialization on GitHub.<br/>[x] Comprehensive README with quickstart.<br/>[x] Clean .gitignore and branch protection rules. | Branch: `main`<br/>Commit: `8a03eb9`<br/>Files: `README.md`, `.gitignore` |
| **MAS-11** | **Supervisor Consultations Log**<br/>Formal feedback and revision audit. | Dias Tursynbai | Major | Oct 21, 2026 | **Done** | [x] 3 formal sessions with E.B. Tulebayev.<br/>[x] Supervisor feedback on scope and formula ethics.<br/>[x] Concrete revisions verified.<br/>[x] Supervisor pre-defense approval signed off. | Branch: `main`<br/>File: `docs/supervisor-feedback.md` |
| **MAS-15** | **ML & Optimization Core Engine**<br/>Production solver, embeddings, and unit tests. | Ardak Avissauly / Dias Tursynbai | Critical | Oct 22, 2026 | **Done** | [x] Pydantic V2 domain models.<br/>[x] Sentence-Transformers embedder with TF-IDF fallback.<br/>[x] MultiCriteriaScorer with soft taxonomy & TOPSIS.<br/>[x] Gale-Shapley (0 blocking pairs) & MILP solvers.<br/>[x] 9 automated pytest tests passing in <4s. | Directory: `src/`, `tests/`<br/>Files: `src/engine.py`, `tests/` |

---

## 3. Project Milestones & Critical Path

```text
[Milestone 1: Pre-Defense 1 (Probationary Period 1)] — DEADLINE: OCT 22, 2026
 ├── Status: 100% COMPLETE
 ├── Git Tag: prob-period-1 (Commit d3be81d)
 └── Deliverable: SE-2407_SE-2420_SE-2411_Tursynbai_ProbPeriod1.pdf (18 pages)

[Milestone 2: Prototype Implementation & Integration] — DEADLINE: NOV 20, 2026
 ├── Tasks: FastAPI REST API implementation, PostgreSQL pgvector setup, Next.js frontend
 ├── Dependencies: Pre-Defense 1 approved requirements (MAS-6) and diagrams (MAS-7)
 └── Deliverable: Functional local prototype with live student proposal submission

[Milestone 3: Evaluation & Baseline Benchmarking] — DEADLINE: DEC 15, 2026
 ├── Tasks: Running empirical benchmarks on historical AITU data, tuning weights
 ├── Dependencies: Runnable matching engine and evaluation metrics (MAS-9)
 └── Deliverable: Empirical validation chapter for diploma thesis

[Milestone 4: Pre-Defense 2 & Final Thesis Defense] — DEADLINE: SPRING 2027
 ├── Tasks: Production deployment rehearsal, thesis write-up, presentation slides
 └── Deliverable: Final diploma thesis defense
```

---

## 4. Major Risks & Mitigation Strategies

1. **Risk: Multilingual Embedding Quality on Kazakh Terminology (Likelihood: Medium, Impact: High)**
   * *Mitigation:* Employ `paraphrase-multilingual-MiniLM-L12-v2` with curated Kazakh computer science synonym dictionaries; benchmark against bilingual TF-IDF fallback.
2. **Risk: Solver Timeout on Large Student Cohorts (Likelihood: Low, Impact: Medium)**
   * *Mitigation:* Gale-Shapley DA algorithm exhibits $O(S \cdot P)$ polynomial time complexity (<100ms for 200 students). Vector embeddings and pairwise scores are pre-computed prior to running the allocation solver.
3. **Risk: Faculty Resistance to Quota Enforcement (Likelihood: Medium, Impact: High)**
   * *Mitigation:* Department coordinator approval workflows for capacities; transparency dashboards showing factor contributions and verified zero-blocking-pair stability.
4. **Risk: Inconsistent Database State During High Concurrency (Likelihood: Low, Impact: High)**
   * *Mitigation:* Atomic PostgreSQL transactions; immutable snapshot freeze prior to matching execution; idempotent preference resubmissions.
