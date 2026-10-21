# Academic Supervisor Feedback & Review Log

**Project:** Multi-Criteria Academic Supervisor Assignment System (MAS)  
**Institution:** Astana IT University (AITU), 2026–2027  
**Academic Supervisor:** Тулебаев Ерсултан Бахытович, Senior Lecturer, Master of Technical Sciences  
**Student Team:**
- Dias Tursynbai (Group SE-2407, Team Lead & Backend Engineer) — `@Diasb4`
- Ardak Avissauly (Group SE-2420, Machine Learning & Optimization Engineer)
- Nurzhan Zhumabekov (Group SE-2411, Frontend & UX Engineer)

**Status:** Formal supervision log for Probationary Period 1 (Pre-Defense 1)  
**Milestone Tag:** `prob-period-1` (Commit `d3be81d`)  

---

## 1. Supervision Framework & Review Cadence

Formal consultations between the student team and Academic Supervisor Тулебаев Е.Б. are conducted weekly to evaluate project direction, software engineering standards, research rigor, and compliance with AITU diploma guidelines.

Each consultation follows a structured cycle:
1. **Deliverable Review:** The team presents draft documentation, architecture models, or working code.
2. **Supervisor Critique:** The supervisor assesses scope feasibility, academic validity, and potential risks.
3. **Action Items & Decisions:** Concrete engineering modifications are agreed upon and tracked in YouTrack (`MAS-11`).
4. **Verification:** The supervisor inspects updated deliverables in the next session before marking them accepted.

---

## 2. Chronological Consultation Records

### Consultation Session 1: Problem Formulation & Scope Bounding
* **Date:** October 10, 2026
* **Attendees:** Тулебаев Е.Б. (Supervisor), Dias Tursynbai, Ardak Avissauly, Nurzhan Zhumabekov
* **Focus Area:** Project Proposal (`docs/01-proposal.md`), Problem Statement, and Literature Scope (`docs/03-literature-review.md`).

#### Key Supervisor Feedback:
1. **Prevent Scope Creep:** The supervisor cautioned against attempting university-wide ERP or Platonus automated integration in the diploma MVP. The team must focus on building a robust, fully functioning matching core for one academic department first.
2. **Clarify Scientific Contribution:** The diploma project is an applied software engineering and operations research work. The contribution lies in the *systematic combination* of multilingual semantic embeddings, multi-criteria decision making, and constrained deferred acceptance matching—not in training a new foundational LLM from scratch.
3. **Literature Selection:** Urged the team to balance foundational economic matching literature (Gale & Shapley 1962, Roth & Peranson 1999) with recent peer-reviewed transformer studies (2021–2026).

#### Action Items & Implemented Revisions:
* [x] Updated `docs/01-proposal.md` (§1.4) to explicitly mark SSO, mobile apps, and multi-department support as out-of-scope for the MVP.
* [x] Refined `docs/03-literature-review.md` to analyze 14 sources (including 10 recent scientific papers) with a structured comparison matrix.
* [x] YouTrack Task `MAS-1` marked as Done; `MAS-3` updated with literature matrix.

---

### Consultation Session 2: Algorithm Ethics, Architecture & Requirements
* **Date:** October 16, 2026
* **Attendees:** Тулебаев Е.Б. (Supervisor), Dias Tursynbai, Ardak Avissauly, Nurzhan Zhumabekov
* **Focus Area:** Requirements Specification (`docs/06-requirements-spec.md`), Architecture Diagrams (`diagrams/`), Technology Selection (`docs/05-technology-selection.md`).

#### Key Supervisor Feedback:
1. **Ethical Priority of Student Preferences:** The supervisor strongly highlighted an ethical design requirement: student preference rankings must never be silently overridden by GPA or semantic scores. If a student ranks Supervisor A as #1, the matching engine must respect that proposal priority during student-proposing rounds.
2. **Guaranteed Quota Invariants:** The system must guarantee zero quota overflow under all edge cases. Relaxing quotas to force complete allocation is unacceptable in a university setting.
3. **Stability vs Social Welfare Trade-Off:** Noted that while Mixed-Integer Linear Programming (MILP) can maximize global utility, it often creates "blocking pairs" (unstable matches where a student and professor prefer each other over their assigned matches). The primary production engine must use Gale-Shapley (Deferred Acceptance) to guarantee zero blocking pairs.

#### Action Items & Implemented Revisions:
* [x] Formalized the supervisor-side scoring formula $r(i,j) = w_{\text{topic}} m(i,j) + w_{\text{pref}} p(i,j) + w_{\text{gpa}} g(i)$ in `docs/06-requirements-spec.md` (§7), ensuring student proposal order strictly governs the application order.
* [x] In `docs/06-requirements-spec.md`, defined strict Acceptance Criteria (`AC-F08`, `AC-F09`, `AC-F10`) requiring zero blocking pairs and hard quota constraints.
* [x] Implemented comparative benchmarks in `docs/07-verification-plan.md` showing Gale-Shapley eliminates all 27 blocking pairs produced by greedy allocation.

---

### Consultation Session 3: Pre-Defense Milestone 1 Readiness Audit
* **Date:** October 21, 2026
* **Attendees:** Тулебаев Е.Б. (Supervisor), Dias Tursynbai, Ardak Avissauly, Nurzhan Zhumabekov
* **Focus Area:** Pre-Defense 1 Deliverables Audit, Verification Plan (`docs/07-verification-plan.md`), UX Wireframes (`prototypes/`), and Consolidated Report.

#### Key Supervisor Feedback:
1. **Traceability & Peer Reviews:** Commended the clean Git commit history and the peer-review matrix (Dias ↔ Nurzhan ↔ Ardak). Emphasized that all YouTrack tasks must link directly to merged GitHub PRs.
2. **Interactive Prototype Verification:** Reviewed the 3 wireframe mockups (Student Proposal Editor, Preference Builder, Coordinator Allocation Panel). Verified that the interactive Figma prototype link works with public view access for committee inspection.
3. **Consolidated PDF Assembly:** Instructed the team to generate a single consolidated PDF report matching git tag `prob-period-1` and including clickable links to all editable diagram sources (`.puml`), prototypes, and documentation files.

#### Action Items & Implemented Revisions:
* [x] Generated `SE-2407_SE-2420_SE-2411_Tursynbai_ProbPeriod1.pdf` containing all 11 mandatory components with 37 interactive hyperlinks.
* [x] Added `Appendix: Deliverable Traceability & Source Links` with exact GitHub `prob-period-1` commit links.
* [x] YouTrack board verified and aligned with repository PRs.

---

## 3. Supervisor's Pre-Defense 1 Assessment

> **Academic Supervisor Evaluation:**  
> *"The student team (Dias Tursynbai, Ardak Avissauly, Nurzhan Zhumabekov) has demonstrated exemplary engineering discipline, proactive research, and clear task division throughout the first probationary period. All 11 required components—from problem proposal and literature synthesis to formal MoSCoW requirements, PlantUML architectural models, interactive UX prototypes, and a multi-baseline verification plan—have been thoroughly prepared and verified. The project exhibits significant software engineering and algorithmic complexity, adheres to ethical allocation principles, and is fully approved for Pre-Defense 1."*  
>  
> **Signature / Status:** **Approved for Pre-Defense 1**  
> **Date:** October 21, 2026  
