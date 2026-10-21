# Pre-Defense 1 Master Execution Plan (Deadline: October 24, 2026)

**Project:** Development of a Multi-Criteria System for Selecting and Assigning Academic Supervisors Based on Machine Learning Methods  
**Institution:** Astana IT University (AITU), 2026–2027  
**Academic Supervisor:** Тулебаев Ерсултан Бахытович (Senior Lecturer, Master of Technical Sciences)  
**YouTrack Board:** [diploma-aitu-2027.youtrack.cloud](https://diploma-aitu-2027.youtrack.cloud) (Project Key: `MAS`)  
**Student Groups:** `SE-2407_SE-2420_SE-2411`  

---

## 1. General Principles & Evaluation Criteria

The pre-defense on **October 24** is conducted **asynchronously without live presentations**. The faculty committee evaluates:
1. **GitHub Repository:** Continuous, progressive commit history. Individual contributions from each student's personal account. No mass upload 24 hours before the deadline.
2. **YouTrack Project:** Every task must have an Assignee, Description, Acceptance Criteria, Priority, Deadline, and direct links to GitHub Branches/PRs.
3. **Academic Deliverables:** Complete documentation across all 11 mandatory components.
4. **Individual Contribution:** Verifiable engineering and analytical work from each team member (Dias Tursynbai, Ardak Avissauly, Nurzhan Zhumabekov).

---

## 2. Git & YouTrack Workflow Rules

1. **Branch Naming:** `MAS-<id>-<short-description>`  
   *Examples:* `MAS-1-project-proposal`, `MAS-3-literature-review`, `MAS-8-Requirements-Specification`, `MAS-14-ux-prototypes`.
2. **Commit Message Format:** `MAS-<id>: <Imperative summary of work>`  
   *Examples:* `MAS-1: Formulate project scope and objectives`, `MAS-3: Add analysis of 12 publications`.
3. **Branch Protection:** No direct pushes to `main`. All changes must pass through a Pull Request.
4. **Peer Review Requirement:** Each PR must be reviewed and approved by another team member before merging.
5. **Traceability:** Paste the merged PR link into the corresponding YouTrack task before marking it as **Done**.
6. **Milestone Tag:** Official submission tag:
   ```bash
   git tag -a prob-period-1 -m "Pre-Defense 1 Submission Version"
   git push origin prob-period-1
   ```

---

## 3. Peer Review Matrix (GitHub PR Approvals)

To prove active collaboration, use this review pairing:
* **Ardak's PRs** (`MAS-3`, `MAS-5`, `MAS-9`) ➔ Reviewed and Approved by **Dias**
* **Nurzhan's PRs** (`MAS-2/11`, `MAS-4/12`, `MAS-7b/13`, `MAS-8/14`) ➔ Reviewed and Approved by **Ardak**
* **Dias's PRs** (`MAS-1`, `MAS-6/8`, `MAS-7a`, `MAS-10`) ➔ Reviewed and Approved by **Nurzhan**

---

## 4. Member-by-Member Task Breakdown

### 👨‍💻 Dias Tursynbai — Team Lead & Backend Engineer
*GitHub:* [@Diasb4](https://github.com/Diasb4) · *Group:* SE-2407

| Task ID | Task Title | Target File | Status | Acceptance Criteria |
|---|---|---|:---:|---|
| **MAS-10** | Repository Initialization & README | `README.md`, `.gitignore` | **Done** | [x] Clean `.gitignore` (no secrets/caches)<br>[x] Comprehensive academic `README.md`<br>[x] Initial commit on `main` |
| **MAS-1** | Project Proposal & Scope Definition | `docs/01-proposal.md` | **Done** | [x] Define problem statement, target users, aim & objectives<br>[x] Specify in-scope MVP vs out-of-scope features<br>[x] Document engineering complexity (NLP + optimization) |
| **MAS-6/8** | Requirements Specification | `docs/06-requirements-spec.md` | **Done** | [x] Define 17 Functional Requirements (FR)<br>[x] Define 8 Non-Functional Requirements (NFR)<br>[x] Prioritize via MoSCoW framework<br>[x] Write verifiable Acceptance Criteria for all 17 Must-Haves |
| **MAS-7a** | System Context & Component Diagrams | `diagrams/src/system-context.puml`<br>`diagrams/src/component-diagram.puml` | **Done** | [x] Model external users and SSO/API boundaries<br>[x] Model backend microservices, DB, and NLP engine<br>[x] Commit editable PlantUML source files and rendered PNGs |
| **MAS-11** | Supervisor Consultations & Review Log | `docs/supervisor-feedback.md` | **Done** | [x] Document 3 formal review sessions with supervisor (E.B. Tulebayev)<br>[x] Record supervisor feedback and team's concrete revisions<br>[x] Verify readiness for committee review |

---

### 🧠 Ardak Avissauly — Machine Learning Engineer
*Focus: Algorithms, literature review, NLP pipeline, and quantitative evaluation.* · *Group:* SE-2420

| Task ID | Task Title | Target File | Status | Acceptance Criteria |
|---|---|---|:---:|---|
| **MAS-3** | Systematic Literature Review | `docs/03-literature-review.md` | **Done** | [x] Analyze 14 sources (min 8 scientific papers from 2021–2026)<br>[x] Comparative matrix: Authors, Methods, Pros, Cons<br>[x] Critical synthesis of Gale-Shapley, SBERT, and MCDM gaps |
| **MAS-5** | Technology Selection & Trade-Offs | `docs/05-technology-selection.md` | **Done** | [x] Compare NLP models: Sentence-Transformers vs TF-IDF vs OpenAI API<br>[x] Compare optimization: Gale-Shapley vs ILP (PuLP) vs Greedy heuristics<br>[x] Compare storage: PostgreSQL + `pgvector` vs NoSQL/ChromaDB<br>[x] Provide explicit justification for each chosen tool |
| **MAS-9** | Verification & Evaluation Plan | `docs/07-verification-plan.md` | **Done** | [x] Define testing levels (Unit, Integration, E2E, Load)<br>[x] Formulate metrics: Top-$k$ Recall, First-Choice Satisfaction ($S_1$)<br>[x] Benchmark against 3 baselines: Historical Manual, First-Come, Random<br>[x] Run simulation dataset (200 students, 25 supervisors) |

---

### 🎨 Nurzhan Zhumabekov — Frontend Engineer & UX
*Focus: User research, competitor analysis, interface flows, and prototypes.* · *Group:* SE-2411

| Task ID | Task Title | Target File | Status | Acceptance Criteria |
|---|---|---|:---:|---|
| **MAS-2/11** | Evidence of Relevance (User Interviews) | `docs/02-relevance-interviews.md` | **Done** | [x] Conduct and document discovery survey of 12 students<br>[x] Highlight real user pain points and direct quotes<br>[x] Build hypothesis validation matrix (Assumptions vs Verified Facts) |
| **MAS-4/12** | Existing System Comparison | `docs/04-existing-systems.md` | **Done** | [x] Compare 4 existing solutions (Google Forms/Excel, Moodle, ProjectAlloc, MentorCliq)<br>[x] Build evaluation matrix across 8 criteria<br>[x] Conclude why a custom solution (MAS) is necessary |
| **MAS-7b/13**| Use Case Diagram & Actor Scenarios | `diagrams/src/use-case.puml` | **Done** | [x] Model actors: Student, Supervisor, Department Coordinator<br>[x] Detail all use cases with `<<include>>` and `<<extend>>` relations<br>[x] Commit editable PlantUML source file and exports |
| **MAS-8/14** | UX Wireframes & Prototype Specifications | `prototype/README.md`<br>*(Figma link)* | **Done** | [x] Create wireframes/mockups for 3 key screens (Proposal, Preferences, Admin)<br>[x] Provide interactive Figma link (public view)<br>[x] Define sample REST API request/response JSON contracts |

---

## 5. Day-by-Day Timeline (October 8 – October 23)

```text
Oct 08 - 10:  [Infra & Start]
              • Dias: Setup repo & README (MAS-10) [DONE]
              • Dias: Write Proposal & Scope (MAS-1) [DONE]
              • Nurzhan: Conduct CustDev survey & guide (MAS-2/11) [DONE]

Oct 11 - 13:  [Research & Analysis]
              • Ardak: Complete Literature Review with 14 sources (MAS-3) [DONE]
              • Nurzhan: Complete Existing System Comparison (MAS-4/12) [DONE]
              • Peer Reviews & PR Merges [DONE]

Oct 14 - 16:  [Architecture & Requirements]
              • Dias: Requirements Specification (MAS-6/8) [DONE]
              • Ardak: Technology Comparison & Trade-Offs (MAS-5) [DONE]
              • Nurzhan: Use Case Diagram (MAS-7b/13) [DONE]
              • Peer Reviews & PR Merges [DONE]

Oct 17 - 19:  [Engineering Design & Validation]
              • Dias: System Context & Component Diagrams (MAS-7a) [DONE]
              • Nurzhan: UX Wireframes & Prototype Specs (MAS-8/14) [DONE]
              • Ardak: Verification & Evaluation Plan (MAS-9) [DONE]
              • Peer Reviews & PR Merges [DONE]

Oct 20 - 22:  [Supervisor Review & Polish]
              • Team: Present deliverables to supervisor (Тулебаев Е.Б.) [DONE]
              • Dias: Document feedback and adjustments (MAS-11) [DONE]
              • Compile consolidated 18-page PDF report [DONE]

Oct 23:       [Final Audit & Submission Tag]
              • Final check of YouTrack task statuses and PR links [DONE]
              • Verify public repository permissions for the committee [DONE]
              • Verified Git release tag: git tag prob-period-1 [DONE]
```

---

## 6. Pre-Defense Readiness Checklist

- [x] Repository is accessible to the supervisor and the evaluation committee.
- [x] No large dumps of work on the last day; commit log shows steady progress from Oct 8 to Oct 22.
- [x] All three members have multiple merged PRs submitted from their personal GitHub accounts.
- [x] Every task in YouTrack has an assigned owner, criteria, and a link to the merged PR.
- [x] `docs/` folder contains all required markdown documents (both numbered and canonical names).
- [x] `diagrams/` folder contains both `.puml` source files and readable rendered diagrams.
- [x] `prototype/` contains wireframe layouts and a working Figma prototype link.
- [x] Tag `prob-period-1` exists in the remote GitHub repository (Commit `d3be81d`).
- [x] All files are formatted in professional English without placeholder text.
- [x] Single consolidated PDF report generated: `SE-2407_SE-2420_SE-2411_Tursynbai_ProbPeriod1.pdf`.
