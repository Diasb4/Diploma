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

The project follows the method proposed in the MAS-3 literature review: multilingual sentence embeddings measure topic similarity, a weighted sum combines topic fit, student preference rank, and approved GPA data, and one-to-many Gale-Shapley matching assigns students under hard supervisor capacities. Students propose in their submitted preference order; the combined score determines supervisor-side candidate rankings. The system records the inputs and policy used for each run so that an assignment can be explained and reproduced.

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

1. How do multilingual sentence embeddings compare with TF-IDF and an embeddings API on AITU proposal and profile text, including retrieval of supervisors recorded in the previous year's assignments?
2. How do Gale-Shapley, ILP, and greedy allocation compare in coverage, first-choice satisfaction, topic fit, and workload balance under the same capacities and eligibility rules, and how do these outcomes change with scoring weights?
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
| O3. Implement and assess topic-based recommendations. | A versioned multilingual embedding pipeline; comparison with TF-IDF and an embeddings API; Top-k Recall against authorized past assignments, supplemented by topic-relevance assessment where labels are available. |
| O4. Implement configurable candidate ranking and capacity-constrained matching. | A weighted-sum policy for topic fit, preference rank, and approved GPA; deterministic Gale-Shapley matching; ILP and greedy comparisons; weight-sensitivity analysis; independent constraint and stability checks. |
| O5. Deliver the complete role-based allocation workflow. | Working proposal and preference submission, coordinator review and publication, authorized result views, CSV export, and audit records. |
| O6. Evaluate quality, performance, usability, and reproducibility. | Repeatable experiments, baseline comparisons, workflow tests, measured results, and documented limitations. |

## 6. Project scope

### 6.1 Mandatory MVP

The MVP supports a single department's allocation cycle, with enrolled students and supervisors, a submission deadline, and a frozen input snapshot. Authentication uses authorized MAS test accounts; MAS manages sessions, role assignments, and record ownership. University SSO is excluded from the MVP. Its mandatory capabilities are:

- Authentication and authorization for Student, Supervisor, and Coordinator roles, including ownership checks on proposals and results.
- One student proposal per cycle, containing title, abstract, and keywords, with validation and submission before the deadline.
- Supervisor research profiles and optional publication text, with coordinator-approved non-negative integer capacities.
- Topic-based recommendations of up to five eligible supervisors, displaying a documented similarity score and model version.
- Student submission and reordering of one to five distinct eligible supervisor preferences before input freeze.
- A versioned supervisor-side candidate ranking policy combining topic similarity, student preference rank, and, only if approved, normalized GPA, with documented weights and tie-breaking.
- Batch matching on frozen inputs with at most one supervisor per student, hard capacity limits, and explicit unmatched or ineligible outcomes.
- Coordinator review of assignments, capacity usage, unmatched cases, and validation results before publication.
- Atomic publication, role-appropriate result views, coordinator CSV export, and attributable audit records.
- Reproducible evaluation scripts and automated checks for the mandatory workflow and allocation invariants.

The recommendation experiment will evaluate a multilingual sentence-embedding model on AITU proposal and profile text in English, Russian, and Kazakh where authorized examples are available. Results will be reported separately by language and for cross-language pairs represented in the dataset. A language without sufficient evaluation evidence will be recorded as unverified; multilingual model availability alone does not establish usable recommendation quality.

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

The NLP pipeline will combine a student's title, abstract, and keywords into a documented text representation and compare it with supervisor research interests and available publication text. A pretrained multilingual Sentence-Transformers model will encode the text; cosine similarity will provide a reproducible topic score. The [MAS-3 literature review](03-literature-review.md), sections 4.2 and 5, motivates the use of sentence embeddings and evaluation on AITU data, since the reviewed studies do not establish recommendation quality for Russian or Kazakh proposals.

Technology selection will compare TF-IDF, a multilingual SBERT model, and the OpenAI embeddings API on the same authorized AITU corpus. The README's `all-MiniLM-L6-v2` remains an earlier stack suggestion; the multilingual candidate and its version will be selected through this comparison. Each candidate's input limits, long-text processing, language coverage, runtime, cost, and data-handling conditions will be documented. The pipeline must record truncation or use a documented chunking and aggregation procedure. Local inference is the planned deployment; an API candidate will be evaluated only with text authorized for external processing.

For the proposed ranking policy, semantic similarity is normalized as `m(i, j) = (1 + cosine(i, j)) / 2`, giving a score in `[0, 1]` for non-zero embeddings. The score expresses text similarity, not a probability of successful supervision. Missing or unusable profile text must be reported and corrected before a supervisor participates in a scored allocation. TF-IDF provides a lexical baseline on the same corpus.

### 7.2 Multi-criteria ranking and matching

Let `S` be eligible students and `H` eligible supervisors. Each supervisor `j` has approved capacity `q(j)`. Each student `i` provides a strict ordered list `P(i)` of acceptable supervisors. Only mutually eligible pairs in these lists are considered.

Following MAS-3's weighted-sum approach, a proposed supervisor-side score is:

```text
r(i, j) = w_topic * m(i, j) + w_preference * p(i, j) + w_gpa * g(i)
p(i, j) = 1 / rank_P(i)(j)
w_topic >= 0; w_preference >= 0; w_gpa >= 0
w_topic + w_preference + w_gpa = 1
```

Here `rank_P(i)(j)` is the one-based position of supervisor `j` in student `i`'s submitted list. The reciprocal-rank normalization is a proposed implementation choice to be reviewed in the requirements and technology documents; it gives the first choice a score of 1 and lower choices progressively smaller scores. The score is defined only for acceptable, mutually eligible pairs. Fixed normalization scales and weights will be used within each run. A weighted sum is chosen over TOPSIS as recommended in MAS-3, with sensitivity analysis to examine the effect of the weights.

Here `g(i)` is GPA normalized using an explicitly approved scale. GPA is optional: until its use and data source are approved, both its score weight and its tie-breaking role are disabled. With GPA enabled, missing or invalid GPA prevents the affected instance from running; no values are invented. Supervisor-side candidates are ordered by exact combined score descending, then approved GPA descending, then accepted preference-submission time ascending, following MAS-3 section 4.1. Stable student ID is used only when all preceding values are equal. When GPA is disabled, that comparison step is skipped. Scores are not rounded for comparison, and the numeric precision, GPA scale, and server-recorded submission timestamps are frozen with the policy and inputs.

Student preference rank contributes to the supervisor-side score, while `P(i)` remains the student's strict proposal order. The score does not reorder that list or make a supervisor outside it acceptable. The main solver is the student-proposing, many-to-one Gale-Shapley deferred-acceptance procedure: each unassigned student approaches their next choice, while each supervisor provisionally retains the highest-ranked candidates up to capacity. This follows the stable-matching approach discussed in MAS-3 section 4.1.

For assignment indicators `x(i, j)`, the implementation must enforce:

```text
x(i, j) is either 0 or 1
sum over supervisors j of x(i, j) <= 1 for every student i
sum over students i of x(i, j) <= q(j) for every supervisor j
x(i, j) = 0 for pairs outside the accepted eligibility and preference lists
```

An independent checker will detect blocking pairs: an acceptable student-supervisor pair where the student prefers that supervisor to their current outcome and the supervisor has spare capacity or prefers that student to an assigned student. Stability is assessed against the frozen strict rankings. It does not establish equal workload, optimal total similarity, or general social fairness.

The evaluation will compare the main solver with an exact ILP model implemented with PuLP and a simple greedy allocation on the same frozen inputs. Their objectives, processing order, and stability constraints will be documented in the technology and verification plans. Every comparison must preserve capacity, eligibility, and single-assignment constraints; blocking pairs will be measured independently for every method. An experimental result that is unstable cannot replace the stable production allocation without a separately reviewed scope and requirements decision.

### 7.3 System implementation

The planned implementation uses a Next.js/React client, a Python/FastAPI backend, PostgreSQL with `pgvector`, and a locally executed embedding pipeline. These are working choices from the README, subject to documented alternatives in the technology comparison. Logical components cover identity and access, profiles and cycles, recommendations, ranking and matching, publication, and audit. Their deployment as separate services is an architecture decision, not a condition of this proposal.

The engineering work includes maintaining consistent model and policy versions, freezing inputs while users submit changes, preserving transactional publication, enforcing access through the API, handling unavailable NLP processing and infeasible allocation, and reproducing results from saved inputs. A database model must represent users, cycle enrollment, proposals, profiles, capacities, preferences, policies, snapshots, allocation runs, outcomes, and audit events. These concerns require implementation and integration beyond wrapping a pretrained model.

## 8. Expected outcomes and evaluation

### 8.1 Deliverables

By the end of the diploma project, the team expects to deliver a working role-based web application; documented source and configuration; a versioned multilingual recommendation and weighted-sum matching pipeline; automated tests; reproducible model, solver, and weight-sensitivity evaluations; and an account of measured benefits, failures, and limitations.

For the first pre-defense, the outcome is the analysis and design package: this proposal, relevance evidence, literature and system reviews, technology comparison, initial requirements, architecture diagrams with editable sources, prototype materials, verification plan, project management and risk records, and substantive supervisor feedback. A complete application is not required for this stage by the committee.

### 8.2 Success criteria and measurement conditions

The criteria below are proposed project targets, not achieved results or established university policy. The detailed fixtures, measurement procedures, and approved thresholds will be recorded in `docs/07-verification-plan.md`.

| Area | Criterion | Verification evidence |
|---|---|---|
| Allocation correctness | Zero capacity, duplicate-assignment, and eligibility violations; zero blocking pairs for unmodified deferred-acceptance outputs under the frozen strict rankings. | Independent invariant and stability checks on normal, oversubscribed, zero-capacity, tied-score, and incomplete-list fixtures. |
| Reproducibility | Five runs with identical input and model, policy, and algorithm versions produce identical assignments and unmatched outcomes. | Replay report, saved input hashes, and version records. |
| Recommendation evaluation | Compare Top-k Recall, including k = 5, for multilingual SBERT, TF-IDF, and an embeddings API against the previous year's recorded assignments where authorized data are available. Supplement with expert topic-relevance labels where available. | Held-out historical proposal/profile records, documented reference assignments, language-specific results, and separate expert-label results; unavailable comparisons identified explicitly. |
| Allocation quality and workload | Compare Gale-Shapley, ILP, and greedy allocation in coverage, first-choice satisfaction, mean assigned preference rank, mean topic score, capacity utilization, maximum students per supervisor, and blocking-pair count. | Identical frozen rosters, capacities, eligibility, proposals, preferences, and candidate rankings; unmatched outcomes and solver objectives reported for every method. |
| Weight sensitivity | Measure how assignments, first-choice satisfaction, topic fit, and workload change across documented topic, preference, and approved GPA weight settings. | A reproducible weight grid with weights summing to 1; fixed data and normalization; a rebuilt supervisor ranking for each policy; per-setting metrics and assignment changes. |
| Workflow and access | All mandatory requirement acceptance criteria pass; all forbidden role and ownership requests are rejected. | End-to-end workflow records, API authorization matrix, and unit/integration results. |
| Performance | On a recorded environment of at least 4 CPU cores and 8 GB RAM, normal requests have p95 latency at most 2 seconds, recommendations at most 5 seconds, and each batch allocation at most 60 seconds. | Model-warmed tests with 200 students, 25 supervisors, 20 concurrent users, at least 100 requests per category, and five allocation runs; cold-start time reported separately. |
| User benefit | Measure scenario completion and errors; compare coordinator effort with an observed current process where comparable evidence is available. | Consistent task scripts and observation records; no claimed time saving without a measured baseline. |

Coverage is the number of assigned students divided by the eligible submitted cohort. First-choice satisfaction uses the same denominator, including unmatched eligible students. Mean preference rank and mean topic score are calculated among assigned students and always reported alongside coverage; otherwise, leaving difficult students unmatched could make quality appear better. Workload will include the maximum assigned count per supervisor, as proposed in MAS-3, plus per-supervisor counts and capacity utilization so that different quotas remain visible. Empty denominators are reported as N/A.

For the historical evaluation proposed in MAS-3, let `H(i)` contain the recorded supervisor for a held-out proposal. Recall@k is `|Top_k(i) intersect H(i)| / |H(i)|`, averaged over proposals with a recorded supervisor eligible for that evaluation. With one historical supervisor per proposal, this is the proportion of proposals for which that supervisor is retrieved in the first k positions. Missing assignments or profiles and supervisors outside the reconstructed eligible set are reported as excluded cases. Historical assignment agreement measures reproduction of previous decisions; it does not by itself establish topic suitability.

Where independent expert labels are available, topic-relevance Recall@k will be reported separately using the expert-labeled relevant eligible supervisors as the reference set. Queries with no relevant labels are reported separately. Model and weight selection will use development data; the held-out historical and expert-label evaluation sets will remain separate from that selection. If authorized historical data are unavailable, historical Recall@k will be marked unavailable and any synthetic or expert-label experiment will be identified by its own evidence source.

The required algorithm comparison follows MAS-3: Gale-Shapley against ILP and greedy allocation, including sensitivity to scoring weights. Additional process baselines are first-come allocation using a recorded arrival order, seeded random allocation respecting the same hard constraints, and historical manual allocation if comparable, authorized records exist. Historical workload comparisons require the previous cycle's roster, capacities, and assignment records; missing policy or preference data will be disclosed rather than reconstructed without evidence. If historical data are unavailable, that comparison will be marked unavailable and a documented manual exercise may be reported separately. Synthetic data will test correctness and scale; it will not establish actual AITU user benefit. Randomized comparisons will use multiple recorded seeds and report variability. No baseline or result is represented as already executed.

## 9. Data, constraints, and principal risks

Development will begin with synthetic students, supervisor profiles, preferences, and capacities. The planned historical evaluation requires authorized previous-year proposals, supervisor profiles, and assignment records, with provenance and language labels. Comparisons will use profile text available at the relevant time where it can be recovered. GPA, submission timestamps, and previous-cycle capacities and preferences require approved sources; absent fields will be disclosed and the affected experiment omitted or limited. A supplementary relevance dataset may use public research text and voluntarily provided or explicitly authorized proposal text. Real grades, names, unpublished proposals, interview identities, and private allocation records must remain outside the public repository. Public examples and evaluation exports must use synthetic or reviewed anonymized records.

The main dependencies are stakeholder access, supervisor approval of ranking and eligibility policy, suitable research profiles, labeled examples, and a reference test environment. The risk responses are:

| Risk | Effect on the project | Planned response |
|---|---|---|
| Local process or demand differs from initial assumptions. | The workflow or claimed relevance may be unsuitable. | Validate the current process before fixing requirements; revise the proposal with evidence. |
| Too little authorized or labeled data. | Real recommendation quality and time savings cannot be established. | Separate synthetic correctness tests from real relevance evaluation and disclose the remaining evidence gap. |
| Multilingual embeddings perform poorly on Russian, Kazakh, cross-language, or long text. | Recommendations may be misleading. | Evaluate each represented language and cross-language group, compare against TF-IDF, document long-text processing, and restrict release support to evaluated cases. |
| GPA use, preference weighting, or submission-time tie-breaking is not accepted. | Candidate ranking lacks policy approval. | Review the MAS-3-derived policy with the supervisor, disable GPA until approved, test weight sensitivity, and version any agreed policy revision before allocation. |
| Demand exceeds capacity or preference lists are too narrow. | Some students remain unmatched. | Report infeasibility and unmatched reasons; allow a separately approved revised cycle without changing completed run inputs. |
| Scope grows into institutional integrations or complex supervision rules. | The team cannot complete the core workflow. | Keep the MVP exclusions explicit and approve changes against the remaining schedule. |

These are the proposal's feasibility constraints. The detailed risk register, dependency tracking, milestone owners, and mitigation status belong in `docs/09-project-management.md`.

## 10. Milestones and delivery control

| Milestone | Completion condition |
|---|---|
| Pre-defense preparation - before 15 October 2026 | Reviewed analysis and design materials support one PowerPoint presentation covering all nine assigned tasks, with each team member's contribution identified. |
| Pre-defense presentation submission - 15 October 2026 | Upload only the PowerPoint presentation in the comments under the assignment post. Each team member is ready to explain their contributions; a fully functional application is not required at this stage. |
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

This revision aligns the proposal with MAS-3 sections 4.1–4.4 and 5: multilingual embeddings, weighted-sum ranking, score/GPA/submission-time ordering, Gale-Shapley with ILP and greedy comparisons, historical Top-k Recall, workload measurement, and weight sensitivity. The corresponding requirements baseline must be reviewed to incorporate the preference-score term, enabled GPA tie-breaking, submission timestamps, and historical/model/solver evaluation criteria before downstream implementation. This alignment does not claim that the dependent requirements or prototype branches have already been updated.

Acceptance of this proposal requires team review and academic supervisor consideration of the local problem, departmental scope, language evaluation, ranking and tie-breaking policy, data permissions, and evaluation targets. Revisions must record the feedback that caused them. This document covers Component 1 and introduces dependencies on the other components; it does not certify completion of the full first-pre-defense package.
