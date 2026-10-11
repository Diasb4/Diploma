# Project Proposal and Scope

**Project title:** Development of a Multi-Criteria System for Selecting and Assigning Academic Supervisors Based on Machine Learning Methods

**Short name:** Multi-Criteria Academic Supervisor Assignment System (MAS)

**Institution:** Astana IT University (AITU)

**Academic year:** 2026–2027

**Academic supervisor:** Тулебаев Ерсултан Бахытович, Senior Lecturer, Master of Technical Sciences

**Version date:** 12 October 2026

**Status:** Proposed scope for team and academic supervisor review

## 1. Project summary

MAS is a proposed web application for assigning final-year students to thesis supervisors. Students submit a thesis title, abstract, and keywords, inspect topic-based supervisor recommendations, and submit an ordered list of preferred supervisors. Supervisors maintain research profiles and propose supervision capacities. A department coordinator approves the allocation policy and capacities, runs batch matching, reviews the draft, and publishes the result.

The project combines pretrained text embeddings with capacity-constrained matching. Topic similarity supports discovery and supervisor-side candidate ranking; student preferences determine the order in which students seek assignments. Capacity limits remain hard constraints. The system records the inputs and policy used for each run so that an assignment can be explained and reproduced.

The first release covers one department and one allocation cycle at a time. The diploma contribution is the implementation and evaluation of this integrated workflow, including its data model, ranking policy, matching algorithm, role-based interface, and verification tools. It does not claim a new language model or a new matching theorem.

## 2. Team and responsibilities

| Team member | Role | Engineering responsibility |
|---|---|---|
| Dias Tursynbai | Team Lead / Backend Engineer | Backend API, database and cycle lifecycle, authorization, pipeline integration, allocation publication, and audit records. |
| Ardak | ML Engineer | Text preparation and embeddings, ranking policy, matching implementation, algorithm analysis, and reproducible quantitative evaluation. |
| Nurzhan | Frontend Engineer | User research, student and supervisor interfaces, preference ordering, coordinator views, prototypes, and interface verification. |

Responsibilities follow the current [project README](../README.md). Work items and document ownership are maintained in [YouTrack](https://diploma-aitu-2027.youtrack.cloud), with review by another team member before merging. Each student contributes through their own identifiable account. The academic supervisor reviews the problem, scope, policy assumptions, and evaluation design; review decisions will be recorded in `docs/08-supervisor-feedback.md`.

## 3. Problem statement and evidence boundary

Thesis-supervisor assignment must reconcile a student's research topic and preferences with faculty expertise and limited supervision capacity. A locally attractive recommendation may be impossible to honor when many students choose the same supervisor. An allocation that respects quotas may still be unsuitable if topic relevance and expressed preferences are ignored. Coordinators also need to identify students who cannot be allocated and explain the published result.

The proposed problem at AITU is that information about thesis topics, research interests, preferences, and capacities may be collected separately, leaving conflicts and final allocation to manual coordination. The team will investigate whether this produces topic mismatches, uneven demand, or avoidable coordination effort. These are working hypotheses, not findings established by this proposal.

At the time of writing, the available interview document contains a guide and hypotheses, but no completed interview records. No measured local processing time, mismatch rate, or stakeholder endorsement is claimed. The relevance study must establish the current process through 3–5 discussions with representatives of the user groups, or a substantive agreement with an actual client, as permitted by the committee requirements. Findings and their implications for scope will be recorded in `docs/02-relevance-interviews.md`.

The initial research questions are:

1. Can pretrained semantic embeddings retrieve supervisors judged relevant to a thesis proposal more effectively than a TF-IDF text baseline?
2. How does the proposed allocation policy affect assignment coverage, student preference satisfaction, and topic relevance compared with simple allocation baselines under the same capacities and eligibility rules?
3. Can a coordinator complete and inspect the allocation workflow with reproducible results, enforced quotas, and an understandable account of unmatched cases?

The intended benefit is better supported selection and less manual reconciliation. Its magnitude must be measured; no percentage improvement is promised in advance.

## 4. Target users and main scenarios

| User | Need | Main scenario |
|---|---|---|
| Final-year student | Find supervisors whose research fits a thesis idea and express personal priorities. | Submit a proposal, inspect recommendations, rank eligible supervisors, and view a published assignment or unmatched outcome. |
| Academic supervisor | Provide current expertise information and keep supervision within an approved capacity. | Update research interests and publication text, propose capacity, and inspect assigned students after publication. |
| Department coordinator | Apply a documented policy consistently and resolve incomplete or infeasible cases. | Configure a cycle, approve capacities and policy, freeze inputs, run matching, inspect validation and metrics, publish results, and export a list. |

Students retain control of their submitted preference order. Recommendations do not automatically constitute preferences or guarantee an assignment. The coordinator remains accountable for approving and publishing an allocation.

## 5. Aim and objectives

**Aim:** Design, implement, and evaluate a web-based system that supports topic-informed academic supervisor selection and produces reproducible allocations respecting student preferences, eligibility, and supervisor capacities.

| Objective | Expected evidence |
|---|---|
| O1. Establish the local allocation process and validate user needs. | Anonymized stakeholder records, an assumptions-versus-findings matrix, and requirements derived from the findings. |
| O2. Specify the allocation domain, release boundaries, and acceptance criteria. | Prioritized functional and non-functional requirements, cycle rules, and consistent architecture and UX artifacts. |
| O3. Implement and assess topic-based recommendations. | A versioned text-processing and embedding pipeline, a TF-IDF baseline, and expert-labeled relevance evaluation. |
| O4. Implement configurable candidate ranking and capacity-constrained matching. | A documented scoring policy, deterministic solver, and independent checks of capacity, uniqueness, eligibility, and stability. |
| O5. Deliver the complete role-based allocation workflow. | Working proposal and preference submission, coordinator review and publication, authorized result views, CSV export, and audit records. |
| O6. Evaluate quality, performance, usability, and reproducibility. | Repeatable experiments, baseline comparisons, workflow tests, measured results, and documented limitations. |

## 6. Project scope

### 6.1 Mandatory MVP

The MVP supports a single department's allocation cycle, with enrolled students and supervisors, a submission deadline, and a frozen input snapshot. Its mandatory capabilities are:

- Authentication and authorization for Student, Supervisor, and Coordinator roles, including ownership checks on proposals and results.
- One student proposal per cycle, containing title, abstract, and keywords, with validation and submission before the deadline.
- Supervisor research profiles and optional publication text, with coordinator-approved non-negative integer capacities.
- Topic-based recommendations of up to five eligible supervisors, displaying a documented similarity score and model version.
- Student submission and reordering of one to five distinct eligible supervisor preferences before input freeze.
- A versioned supervisor-side candidate ranking policy based on topic similarity and, only if approved, normalized GPA.
- Batch matching on frozen inputs with at most one supervisor per student, hard capacity limits, and explicit unmatched or ineligible outcomes.
- Coordinator review of assignments, capacity usage, unmatched cases, and validation results before publication.
- Atomic publication, role-appropriate result views, coordinator CSV export, and attributable audit records.
- Reproducible evaluation scripts and automated checks for the mandatory workflow and allocation invariants.

The initial recommendation experiment uses English proposal and profile text. Russian or Kazakh input requires a separately evaluated multilingual model or a documented revision of the language scope. Language support will not be inferred from an English model's availability.

### 6.2 Optional extensions

After the mandatory workflow is verified, the team may add publication notifications, isolated comparison of allocation scenarios, and coordinator reassignment with a recorded reason. A manual change must preserve hard constraints and be checked for its effect on stability before publication. These features are not prerequisites for the first MVP.

### 6.3 Excluded from the MVP

- Native mobile applications; the web interface will support mobile-sized screens.
- Direct HR, payroll, student-information-system, or university SSO integration. Authorized test accounts and approved input data are sufficient for the MVP.
- University-wide allocation across departments, joint supervision, and multiple supervisors per student.
- Automatic scraping of faculty publications or acquisition of private student records.
- Training a foundation language model, predicting thesis grades, or automatically approving a thesis topic.
- A guarantee that every student receives an assignment, their first choice, or an equally loaded supervisor.

Insufficient capacity, incomplete preferences, and eligibility restrictions are valid reasons for unmatched outcomes. Such cases must remain visible for coordinator action rather than being hidden by relaxing quotas.

## 7. Proposed method and engineering complexity

### 7.1 Topic representation and recommendations

The NLP pipeline will combine a student's title, abstract, and keywords into a documented text representation and compare it with supervisor research interests and available publication text. A pretrained Sentence-Transformers model will encode the text; cosine similarity will provide a reproducible topic score. Sentence-BERT supplies the methodological basis for this approach ([Reimers and Gurevych, 2019](https://arxiv.org/abs/1908.10084)).

The README's `all-MiniLM-L6-v2` is an initial candidate. Its model card identifies English input and a default limit of 256 word pieces. The pipeline must record truncation or use a documented chunking and aggregation procedure; it must not silently treat an entire long abstract as encoded ([official model card](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2)). Final model selection will follow the technology comparison and labeled evaluation.

For the proposed ranking policy, semantic similarity is normalized as `m(i, j) = (1 + cosine(i, j)) / 2`, giving a score in `[0, 1]` for non-zero embeddings. The score expresses text similarity, not a probability of successful supervision. Missing or unusable profile text must be reported and corrected before a supervisor participates in a scored allocation. TF-IDF provides a lexical baseline on the same corpus.

### 7.2 Multi-criteria ranking and matching

Let `S` be eligible students and `H` eligible supervisors. Each supervisor `j` has approved capacity `q(j)`. Each student `i` provides a strict ordered list `P(i)` of acceptable supervisors. Only mutually eligible pairs in these lists are considered.

A proposed supervisor-side score is:

```text
r(i, j) = w_topic * m(i, j) + w_gpa * g(i)
w_topic >= 0; w_gpa >= 0; w_topic + w_gpa = 1
```

Here `g(i)` is GPA normalized using an explicitly approved scale. GPA is optional: the initial policy sets `w_gpa = 0` until its use, data source, and weight are approved. With a positive GPA weight, missing or invalid GPA prevents the affected instance from running; no values are invented. Ties are resolved by stable student identifiers to produce strict supervisor-side rankings. The policy is configured and frozen before allocation.

Student preference rank is represented directly by `P(i)`, rather than added to a score that could override the student's chosen order. The proposed solver is the student-proposing, many-to-one deferred-acceptance procedure: each unassigned student approaches their next choice, while each supervisor provisionally retains the highest-ranked candidates up to capacity. This procedure is adapted from established applicant-proposing matching practice ([NRMP algorithm explanation](https://www.nrmp.org/intro-to-the-match/how-matching-algorithm-works/)).

For assignment indicators `x(i, j)`, the implementation must enforce:

```text
x(i, j) is either 0 or 1
sum over supervisors j of x(i, j) <= 1 for every student i
sum over students i of x(i, j) <= q(j) for every supervisor j
x(i, j) = 0 for pairs outside the accepted eligibility and preference lists
```

An independent checker will detect blocking pairs: an acceptable student-supervisor pair where the student prefers that supervisor to their current outcome and the supervisor has spare capacity or prefers that student to an assigned student. Stability is assessed against the frozen strict rankings. It does not establish equal workload, optimal total similarity, or general social fairness. An ILP alternative may be compared, but changing the objective or dropping stability requires an explicit scope and requirements decision.

### 7.3 System implementation

The planned implementation uses a Next.js/React client, a Python/FastAPI backend, PostgreSQL with `pgvector`, and a locally executed embedding pipeline. These are working choices from the README, subject to documented alternatives in the technology comparison. Logical components cover identity and access, profiles and cycles, recommendations, ranking and matching, publication, and audit. Their deployment as separate services is an architecture decision, not a condition of this proposal.

The engineering work includes maintaining consistent model and policy versions, freezing inputs while users submit changes, preserving transactional publication, enforcing access through the API, handling unavailable NLP processing and infeasible allocation, and reproducing results from saved inputs. A database model must represent users, cycle enrollment, proposals, profiles, capacities, preferences, policies, snapshots, allocation runs, outcomes, and audit events. These concerns require implementation and integration beyond wrapping a pretrained model.

## 8. Expected outcomes and evaluation

### 8.1 Deliverables

By the end of the diploma project, the team expects to deliver a working role-based web application; documented source and configuration; a versioned recommendation and matching pipeline; automated tests; a reproducible baseline evaluation; and an account of measured benefits, failures, and limitations.

For the first pre-defense, the outcome is the analysis and design package: this proposal, relevance evidence, literature and system reviews, technology comparison, initial requirements, architecture diagrams with editable sources, prototype materials, verification plan, project management and risk records, and substantive supervisor feedback. A complete application is not required for this stage by the committee.

### 8.2 Success criteria and measurement conditions

The criteria below are proposed project targets, not achieved results or established university policy. The detailed fixtures, measurement procedures, and approved thresholds will be recorded in `docs/07-verification-plan.md`.

| Area | Criterion | Verification evidence |
|---|---|---|
| Allocation correctness | Zero capacity, duplicate-assignment, and eligibility violations; zero blocking pairs for unmodified deferred-acceptance outputs under the frozen strict rankings. | Independent invariant and stability checks on normal, oversubscribed, zero-capacity, tied-score, and incomplete-list fixtures. |
| Reproducibility | Five runs with identical input and model, policy, and algorithm versions produce identical assignments and unmatched outcomes. | Replay report, saved input hashes, and version records. |
| Recommendation relevance | Compare Recall@5 against TF-IDF using expert-labeled eligible supervisors; assess whether embeddings meet or exceed the baseline before selecting them for the release. | Held-out labeled proposals, relevance-label instructions, per-query results, and uncertainty estimates where sample size permits. |
| Allocation quality | Report coverage, first-choice satisfaction, mean assigned preference rank, mean topic score, and capacity utilization for MAS and baseline allocations. | Comparisons on identical rosters, capacities, eligibility, proposals, and submitted preferences; unmatched outcomes reported for every method. |
| Workflow and access | All mandatory requirement acceptance criteria pass; all forbidden role and ownership requests are rejected. | End-to-end workflow records, API authorization matrix, and unit/integration results. |
| Performance | On a recorded environment of at least 4 CPU cores and 8 GB RAM, normal requests have p95 latency at most 2 seconds, recommendations at most 5 seconds, and each batch allocation at most 60 seconds. | Model-warmed tests with 200 students, 25 supervisors, 20 concurrent users, at least 100 requests per category, and five allocation runs; cold-start time reported separately. |
| User benefit | Measure scenario completion and errors; compare coordinator effort with an observed current process where comparable evidence is available. | Consistent task scripts and observation records; no claimed time saving without a measured baseline. |

Coverage is the number of assigned students divided by the eligible submitted cohort. First-choice satisfaction uses the same denominator, including unmatched eligible students. Mean preference rank and mean topic score are calculated among assigned students and always reported alongside coverage; otherwise, leaving difficult students unmatched could make quality appear better. Empty denominators are reported as N/A.

For recommendations, Recall@5 is the fraction of expert-labeled relevant eligible supervisors retrieved in the first five positions, averaged over proposals having at least one such supervisor. Queries with no labeled relevant candidate are reported separately. Experts assess topic suitability rather than infer relevance from historical assignments alone. Evaluation labels are kept separate from model and weight selection.

Allocation baselines are first-come allocation using a recorded arrival order, seeded random allocation respecting the same hard constraints, and historical manual allocation if comparable, authorized records exist. If historical data are unavailable, that comparison will be marked unavailable and a documented manual exercise may be reported separately. Synthetic data will test correctness and scale; it will not establish actual AITU user benefit. Randomized comparisons will use multiple recorded seeds and report variability. No baseline or result is represented as already executed.

## 9. Data, constraints, and principal risks

Development will begin with synthetic students, supervisor profiles, preferences, and capacities. A relevance dataset may use public research text and voluntarily provided or explicitly authorized proposal text, with recorded provenance. Real grades, names, unpublished proposals, interview identities, and private allocation records must remain outside the public repository. Public examples and evaluation exports must use synthetic or reviewed anonymized records.

The main dependencies are stakeholder access, supervisor approval of ranking and eligibility policy, suitable research profiles, labeled examples, and a reference test environment. The risk responses are:

| Risk | Effect on the project | Planned response |
|---|---|---|
| Local process or demand differs from initial assumptions. | The workflow or claimed relevance may be unsuitable. | Validate the current process before fixing requirements; revise the proposal with evidence. |
| Too little authorized or labeled data. | Real recommendation quality and time savings cannot be established. | Separate synthetic correctness tests from real relevance evaluation and disclose the remaining evidence gap. |
| English embeddings perform poorly on local-language or long text. | Recommendations may be misleading. | Enforce a declared language scope, document long-text processing, and compare a multilingual alternative if needed. |
| GPA use or scoring weights are not accepted. | Candidate ranking lacks policy approval. | Start with topic-only supervisor ranking and require explicit approval before enabling GPA. |
| Demand exceeds capacity or preference lists are too narrow. | Some students remain unmatched. | Report infeasibility and unmatched reasons; allow a separately approved revised cycle without changing completed run inputs. |
| Scope grows into institutional integrations or complex supervision rules. | The team cannot complete the core workflow. | Keep the MVP exclusions explicit and approve changes against the remaining schedule. |

These are the proposal's feasibility constraints. The detailed risk register, dependency tracking, milestone owners, and mitigation status belong in `docs/09-project-management.md`.

## 10. Milestones and delivery control

| Milestone | Completion condition |
|---|---|
| First pre-defense submission — 23 October 2026 | Reviewed analysis and design artifacts are merged; YouTrack links identify the work and responsible students; `pre-defense-1` identifies the submitted version; the summary gives the repository link, tag, completed work, limitations, and outstanding tasks. |
| First pre-defense — 24 October 2026 | The committee can inspect the submitted package, progressive individual contributions, review comments, and resulting revisions. |
| Implementation baseline | The mandatory workflow runs end to end on synthetic fixtures and passes hard-constraint and authorization checks. |
| Evaluation baseline | The selected model and solver are evaluated against declared baselines, with reproducible inputs and measured results. |
| Final diploma submission | The application, documentation, tests, evaluation, and supervisor-reviewed limitations form a reproducible release. |

Dates for later milestones will be agreed in YouTrack rather than invented here. Two or more substantive supervisor consultations are planned under the team's execution plan; the committee requires evidence of feedback on key deliverables and decisions addressing that feedback. No consultation or approval is claimed as completed by this proposal.

## 11. Committee coverage and review decisions

The committee's first-pre-defense rubric, provided in `Req.md`, defines Component 1 as the project title, team members, supervisor, problem statement, target users, aim, objectives, expected outcomes, and project scope. This proposal addresses those items as follows:

| Required item or evaluation criterion | Location in this proposal |
|---|---|
| Title and academic supervisor | Opening metadata. |
| Team members and responsibilities | Section 2. |
| Clearly defined problem | Section 3, including the evidence boundary and research questions. |
| Target users | Section 4. |
| Aim and objectives | Section 5. |
| Expected outcomes | Section 8. |
| Realistic project scope | Section 6, supported by constraints and risks in Section 9. |
| Sufficient engineering complexity | Section 7: NLP, policy-driven matching, data consistency, access control, and integration. |

Acceptance of this proposal requires team review and academic supervisor consideration of the local problem, departmental scope, input-language boundary, ranking and GPA policy, data permissions, and evaluation targets. Revisions must record the feedback that caused them. This document covers Component 1 and introduces dependencies on the other components; it does not certify completion of the full first-pre-defense package.
