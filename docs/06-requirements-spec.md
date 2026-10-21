# Requirements Specification

**Project:** Multi-Criteria Academic Supervisor Assignment System (MAS)  
**Task:** MAS-8 - Requirements Specification  
**Authors:** Dias Tursynbai, Ardak Avissauly, Nurzhan Zhumabekov  
**Version date:** 22 October 2026  
**Status:** Draft for team and academic supervisor review

## 1. Purpose and sources

This specification defines the first MAS release and the conditions used to accept it. Requirement identifiers preserve the references already used by the diagrams, prototype and verification plan.

The baseline is derived from the [project proposal](01-proposal.md), [literature review](03-literature-review.md), [technology selection](05-technology-selection.md), [use-case traceability](../diagrams/use-case-traceability.md), [prototype](../prototypes/README.md), [draft API contracts](../prototypes/api-contracts.md) and [verification plan](07-verification-plan.md). These are design sources; they do not establish completed stakeholder interviews, supervisor approval or passed implementation tests.

## 2. Scope, actors and terminology

The MVP supports one department and one allocation cycle at a time through a web interface. Its actors are Student, Supervisor and Department Coordinator. MAS authenticates authorized test accounts and checks roles and record ownership at the API boundary. University SSO, HR and payroll integration are excluded.

- **Eligible student:** enrolled in the cycle, with a valid submitted proposal and an accepted preference list at input freeze.
- **Eligible supervisor:** enrolled in the cycle, with usable research-profile text and a coordinator-approved capacity greater than zero.
- **Preference list:** the student's strict order of one to five distinct eligible supervisors. Recommendations do not automatically become preferences.
- **Snapshot:** an immutable, versioned copy of the roster, eligibility, submissions, capacities, profile texts, scoring inputs and ranking policy needed to replay a run.
- **Draft allocation:** coordinator-only results awaiting validation and publication.
- **Blocking pair:** an acceptable student-supervisor pair not assigned together where the student prefers that supervisor to their current result (including being unmatched), and the supervisor has spare capacity or prefers that student to an assigned student.

Student proposal text is processed locally in the running system. External embedding services may be used only in a separate evaluation on explicitly authorized texts. Real names, grades, unpublished proposals and private allocation records must remain outside the public repository.

## 3. Prioritization

MoSCoW priorities apply to the first application release:

| Priority | Meaning |
|---|---|
| Must | Required for release acceptance; every associated acceptance criterion must pass. |
| Should | Valuable after the mandatory workflow; omission must be documented. |
| Could | Optional if time and dependencies permit. |
| Won't this release | Explicitly excluded from the MVP. |

The application-release priorities do not remove the diploma obligation to evaluate the methods. FR-15 prioritizes an in-product evaluation-report feature; reproducible experiments and the evaluation plan remain diploma deliverables.

## 4. Functional requirements

| ID | Requirement | Priority | Acceptance criteria |
|---|---|---|---|
| FR-01 | The system shall authenticate MAS accounts and enforce Student, Supervisor and Coordinator roles and record ownership on every protected request. | Must | AC-F01 |
| FR-02 | A student shall save, edit and submit one thesis proposal per cycle, containing a title, abstract and keywords, before the deadline and input freeze. | Must | AC-F02 |
| FR-03 | A supervisor shall maintain their research interests and optional publication text and propose capacity; only the coordinator shall approve the capacity used in a cycle. | Must | AC-F03 |
| FR-04 | The coordinator shall create a cycle, enroll participants, set its deadline and time zone, and freeze validated allocation inputs into an immutable snapshot. | Must | AC-F04 |
| FR-05 | The system shall recommend up to five eligible supervisors for a submitted proposal using local semantic similarity, showing scores and model version. | Must | AC-F05 |
| FR-06 | A student shall submit and reorder one to five distinct eligible supervisors, including eligible supervisors outside the recommendation list, before the deadline and freeze. | Must | AC-F06 |
| FR-07 | The coordinator shall configure and approve a versioned weighted ranking policy for supervisor-side candidates using topic fit, preference rank and optional approved GPA. | Must | AC-F07 |
| FR-08 | The system shall run student-proposing, many-to-one Gale-Shapley matching on a frozen snapshot, enforcing eligibility, one supervisor per student and hard supervisor capacities. | Must | AC-F08 |
| FR-09 | The coordinator shall inspect the draft assignments, unmatched cases, quota usage, outcome metrics and independent constraint and stability checks. | Must | AC-F09 |
| FR-10 | Only the coordinator shall publish a fully validated allocation atomically; students and supervisors shall then see only their authorized published results. | Must | AC-F10 |
| FR-11 | The coordinator shall export the published cycle result as a UTF-8 CSV with one row per enrolled student. | Must | AC-F11 |
| FR-12 | The system shall record attributable, append-only audit events for accepted preference lists, capacity and policy decisions, snapshots, runs, revisions and publication. | Must | AC-F12 |
| FR-13 | The coordinator should create a revised draft through manual reassignment with a recorded reason and renewed validation. | Should | AC-F13 |
| FR-14 | The system should notify participants after publication and show delivery failures to the coordinator. | Should | AC-F14 |
| FR-15 | The coordinator should view reproducible recommendation, allocation and weight-sensitivity evaluation reports without altering production results. | Should | AC-F15 |
| FR-16 | The coordinator could compare isolated draft scenarios built from the same frozen input. | Could | AC-F16 |
| FR-17 | The release shall exclude native mobile apps, university SSO, HR/payroll integration, automatic publication harvesting, cross-department allocation and multiple supervisors per student. | Won't this release | Scope review against section 2 and the proposal. |

### AC-F01 - Authentication and authorization

1. An authorized test account can log in and log out. An absent, invalid, expired or logged-out session receives HTTP 401 on protected requests.
2. An authenticated user requesting a forbidden role action or another user's private record is denied without disclosing that record. Forbidden role actions return HTTP 403.
3. An authorization matrix tests unauthenticated, wrong-role, wrong-owner and authorized requests for every protected endpoint. Students and supervisors cannot run matching, inspect drafts, publish results, export the cycle or read the audit log.

### AC-F02 - Proposal submission

1. Submission accepts a trimmed title of 5-200 characters, abstract of 100-5,000 characters and 1-10 non-empty trimmed keywords. Tests cover each limit and values immediately outside it.
2. Invalid submissions identify the affected fields and preserve the last accepted proposal. Saving an incomplete draft does not mark it submitted; maximum lengths and field types still apply.
3. Saving or submitting affects only the authenticated student's proposal in that cycle. A second submission updates that record rather than creating a second proposal.
4. The server rejects changes at or after the deadline, or after input freeze, and leaves the accepted record unchanged. Read access remains available.

### AC-F03 - Profiles and capacity

1. A supervisor can update only their own research-profile and publication text. Empty or unusable research text is identified before the supervisor can participate in a scored allocation.
2. Capacity accepts non-negative integers; negative, fractional and non-numeric values are rejected. A proposal does not change approved capacity until coordinator approval is recorded.
3. A supervisor with zero approved capacity is excluded from recommendations and accepted preference submissions and receives no assignments.
4. A capacity approval records the coordinator, time, cycle and value. Changes to live profiles or capacities do not mutate an existing snapshot.

### AC-F04 - Cycle and input freeze

1. The coordinator can create a cycle with a unique ID, enroll students and supervisors, and configure a deadline instant and display time zone. The server clock decides whether submissions are open.
2. Allocation cannot start until capacities and a valid ranking-policy version are approved and the input snapshot is frozen. Missing prerequisites are listed.
3. Freeze records each enrolled student's eligibility or exclusion reason. Missing proposals or preference lists produce explicit ineligible records; the coordinator can inspect them.
4. The snapshot has a unique identifier and contains or references immutable copies of all matching inputs and versions. Live changes after freeze leave its contents and hash unchanged.
5. Changed inputs require a new snapshot identifier; earlier snapshots remain available for replay and audit. Freeze and concurrent submissions are tested to ensure a submission is wholly included or wholly excluded.

### AC-F05 - Recommendations

1. A valid submitted proposal returns at most five eligible supervisors ordered by descending semantic score, with supervisor IDs, scores in [0, 1] and model version. A fixed supervisor-ID order breaks equal scores.
2. Fewer than five eligible supervisors returns all available ones; none returns an explicit empty result. An unsubmitted proposal is rejected with a clear prerequisite message.
3. Scores use the documented text representation and normalization in section 7. The interface states that similarity is not a probability of acceptance.
4. An unavailable NLP service returns a retryable error without invented recommendations or changes to accepted preferences.
5. The initial pipeline is tested on English text. Russian, Kazakh and cross-language quality are reported separately only where authorized evaluation examples exist; untested language groups are marked unverified. Text truncation or chunking and model revisions are recorded.

### AC-F06 - Preference submission

1. The server accepts lists of 1-5 distinct eligible supervisor IDs and stores their order exactly. Lists of 0 or 6 entries, duplicates and ineligible IDs are rejected as a whole.
2. A student can select any eligible supervisor, including one outside their top-five recommendations. The server exposes the eligible supervisor list.
3. A valid resubmission atomically replaces the prior list and records a new server acceptance time. An invalid request preserves both the prior list and its acceptance time.
4. At or after the deadline, or after input freeze, submissions are rejected and the last accepted list remains readable.

### AC-F07 - Ranking policy

1. The policy uses the formula and ordering in section 7. Weights are finite and non-negative, and their sum differs from 1 by no more than 0.000001. Invalid weights create no policy version.
2. GPA is disabled until its use, source and normalization scale are approved. When disabled, its weight is zero and its tie-breaking step is skipped. When enabled, a missing, invalid or out-of-scale GPA blocks the affected run and identifies the affected records; no GPA is imputed.
3. Saving a changed policy creates an immutable version. Approval records the approving coordinator, time and version; saving alone does not imply approval. Runs retain their original policy version.
4. Unit fixtures verify the score by hand and isolate every tie-breaking step: unequal exact scores that round to the same display value; equal scores with different enabled GPA; equal preceding values with different accepted submission times; and equality of all preceding values with different student IDs.
5. The supervisor-side score never reorders a student's preference list or makes an unlisted supervisor acceptable.

### AC-F08 - Batch matching

1. Given a ready frozen snapshot, a run records its ID, snapshot ID, algorithm version, model/preprocessing version and policy version and produces a draft result.
2. Every eligible student has exactly one outcome: assigned to one eligible supervisor in their submitted list, or explicitly unmatched. No supervisor exceeds approved capacity.
3. An independent checker finds zero capacity, eligibility and duplicate-assignment violations and zero blocking pairs against the frozen strict rankings.
4. Insufficient total capacity and exhausted preference lists finish with explicit unmatched outcomes without raising quotas or adding unlisted choices.
5. Repeated requests for the same run identity return the existing run without duplicate assignments. An interrupted or failed run has a failed status and no partial successful result; corrected inputs require a new snapshot.

### AC-F09 - Draft review and metrics

1. Coordinator-only review shows every eligible student's outcome, assigned supervisor and preference rank where applicable, unmatched reasons, and assigned count versus approved capacity for every supervisor.
2. It displays separate capacity, eligibility, uniqueness and stability check results, including failed or incomplete states and affected records.
3. Coverage is assigned / eligible submitted students. First-choice satisfaction uses that same denominator, including eligible unmatched students. A fixture with 6 first-choice assignments among 10 eligible students displays 0.60.
4. Mean assigned preference rank and mean topic score use assigned students only and are displayed with coverage. A zero denominator is represented as N/A, including utilization for zero capacity.

### AC-F10 - Publication and result access

1. Publication is denied if any required validation failed or is incomplete. The prior published version remains unchanged, and the response names the blocking checks.
2. A validated result is published in one transaction, recording its run, version, coordinator and publication time. Repeating publication of that same version returns the existing publication.
3. Concurrent publication requests cannot create two active published versions for the cycle. Injecting a failure mid-publication leaves no partially visible result.
4. A student sees only their own published assignment or outcome. A supervisor sees only their own published assignments. Neither role can access draft data through the UI or direct API calls.
5. A manually revised draft requires an explicit coordinator review record and zero blocking pairs against the same frozen rankings. A reason does not waive failed validation.

### AC-F11 - CSV export

1. Export is available only to the coordinator after publication; before publication it returns a result-not-published error. Students and supervisors are denied.
2. The file is UTF-8 CSV with the columns `student_id,supervisor_id,outcome,reason,cycle_id,run_id`, one row per enrolled student and values matching the published run.
3. Unmatched and ineligible students remain in the export with an empty supervisor and an explicit outcome/reason. CSV quoting handles commas, quotes and line breaks; formula-leading cells are escaped.

### AC-F12 - Audit trail

1. Each successfully committed preference acceptance, capacity approval, policy change/approval, snapshot freeze, run transition, revision and publication records actor ID, action, UTC time, entity ID and relevant version or run ID.
2. A failed transactional mutation leaves neither a successful domain change nor a successful audit event. The event and its domain mutation commit together.
3. Application permissions prevent audit-event updates and deletion. The coordinator has read-only, paginated access; students and supervisors are denied.
4. Audit payloads contain no credentials, session tokens or full proposal text. A fixture inspects stored event fields and checks the required metadata.

### Acceptance criteria for optional features

These criteria apply when the corresponding feature is included.

- **AC-F13:** An authorized reassignment with a non-empty reason creates a new draft linked to its parent and preserves the original run. Invalid eligibility, duplicate assignment or excess capacity rejects the whole revision. A successful revision is rechecked for stability and cannot be published without AC-F10 review and validation.
- **AC-F14:** Only published results trigger notifications to authorized recipients. A simulated failed delivery is visible to the coordinator, can be retried, and does not roll back publication or disclose another participant's result.
- **AC-F15:** Evaluation uses the same frozen instance across compared methods and records dataset provenance, seeds, software/model/policy versions, hardware and exclusions. Reports compare bge-m3, the MiniLM fallback, TF-IDF and an external embeddings API only on authorized text; historical Top-k Recall is reported for k = 1, 3 and 5, separately from expert-label relevance. Gale-Shapley, ILP, greedy, first-come and 30-seed random baselines report coverage, first-choice satisfaction, mean rank/topic score, maximum workload, per-supervisor utilization, blocking pairs and constraint violations; workloads of 4, 0 and 6 have maximum 6. Weight sensitivity rebuilds rankings for each valid weight setting. Historical manual comparisons use comparable authorized records; unavailable comparisons are marked unavailable. Synthetic and real results remain separate, and experimental allocations never overwrite or bypass production publication checks.
- **AC-F16:** Comparing two policies creates separately identified drafts with identical base snapshot data. Each draft retains its policy and validation results; creating or deleting a scenario leaves the base snapshot and published result unchanged.

## 5. Non-functional requirements

| ID | Requirement | Priority | Acceptance criteria |
|---|---|---|---|
| NFR-01 | The system shall protect private records through API authorization, local production text processing and controlled handling of personal data and secrets. | Must | AC-N01 |
| NFR-02 | The system shall preserve assignment integrity and atomic run/publication writes under invalid requests, concurrent writes and failures. | Must | AC-N02 |
| NFR-03 | The system shall meet the specified latency and error targets on the reference dataset and hardware. | Must | AC-N03 |
| NFR-04 | Mandatory workflows shall be keyboard-accessible, use visible labels and focus, and present understandable text errors and statuses. | Must | AC-N04 |
| NFR-05 | The same frozen inputs and recorded software, model and policy versions shall reproduce identical assignments and unmatched outcomes. | Must | AC-N05 |
| NFR-06 | The project should provide documented configuration, module boundaries and reproducible commands for setup, tests and experiments. | Should | AC-N06 |
| NFR-07 | The web interface shall support the mandatory workflows in Chrome, Firefox and Edge at mobile and desktop viewport widths. | Must | AC-N07 |

### AC-N01 - Privacy and access

1. The authorization matrix in AC-F01 passes for every protected endpoint, including direct API requests with guessed record IDs.
2. Captured production NLP requests use only the local inference boundary; no student proposal text is sent to an external embeddings service.
3. Public source, fixtures, logs and exports contain no real private student records, credentials or session tokens. Published examples use synthetic or reviewed anonymized data.

### AC-N02 - Integrity and transactions

1. Invalid and concurrent assignment writes cannot produce duplicate student assignments, assignments outside accepted eligibility/preferences or capacity excesses. Tests include two writes competing for the last supervisor place.
2. Failures injected during allocation persistence and publication leave no partial successful result or partially visible publication. Successful change events commit with their domain mutation.
3. Repeated or concurrent requests satisfy AC-F08 and AC-F10 idempotency and leave at most one active published version per cycle.

### AC-N03 - Performance

1. Measure on recorded hardware with at least 4 CPU cores and 8 GB RAM, using 200 student proposals of 100-5,000 characters and 25 supervisor profiles. Record software/model versions and measure cold model loading separately.
2. After warm-up, simulate 20 concurrent users for 10 minutes with at least 100 measured requests in each category. Each category separately meets p95 <= 2 seconds for normal reads, p95 <= 2 seconds for writes and p95 <= 5 seconds for recommendations.
3. Unexpected errors are below 1% of measured requests; deliberately invalid requests with expected rejection responses are excluded from that error numerator.
4. Each of five batch allocations finishes within 60 seconds on a new frozen snapshot of the same dataset and passes the allocation invariants.

### AC-N04 - Accessibility and usability

1. A keyboard-only user can submit a proposal, add/remove/reorder preferences and submit the list without a drag operation. Focus remains visible and controls have accessible names.
2. Validation errors are textually associated with affected fields. Statuses, scores and quota usage are understandable without color alone; tables have headers.
3. An automated accessibility scan of the mandatory screens reports zero critical or serious issues, followed by manual keyboard verification of the full student workflow.

### AC-N05 - Reproducibility

1. Five replays with the same snapshot and recorded model, preprocessing, numeric precision, ranking-policy and algorithm versions produce identical student-supervisor pairs and unmatched outcomes.
2. Each run retains its snapshot identifier/hash and all versions needed for replay. Live profile, capacity or policy changes leave the earlier run and its snapshot unchanged.
3. Experiment seeds and data-generation/configuration versions are recorded; randomized baselines report their seed set and variability.

### AC-N06 - Maintainability (Should)

A team member following the repository instructions can configure the application and run its documented tests and experiments in a clean environment. Required variables, dependency versions and separate experiment-runtime requirements are documented; no secret is hard-coded.

### AC-N07 - Browser and responsive compatibility

The proposal-to-preferences workflow, coordinator run/review/publication workflow and authorized published-result views pass browser tests in Chrome, Firefox and Edge at widths of 360 and 1440 pixels. Form controls, navigation and submission actions remain reachable; wide tables may scroll within their own region without breaking page navigation. Browser versions are recorded.

## 6. Verification and traceability

The [verification plan](07-verification-plan.md) supplies fixtures, measurement procedures and baselines. These checks are planned acceptance conditions, not claims that the application already passes them.

| Requirement group | Main verification | Existing related artifacts |
|---|---|---|
| FR-01; NFR-01 | API role/ownership matrix; private-data and inference-boundary inspection | UC-01; gateway and identity components |
| FR-02, FR-05, FR-06; NFR-04, NFR-07 | Validation boundaries and browser E2E tests | UC-02/03/05/23/24; student proposal and preference wireframes |
| FR-03, FR-04 | Capacity, deadline, concurrent freeze and snapshot integration tests | UC-07/08/10/11/12/14; profile/cycle service |
| FR-07, FR-08; NFR-05 | Hand-calculated scoring fixtures, tie-breaking, invariant/stability checks and replay | UC-13/15/25/26; allocation service and matching component |
| FR-09, FR-10; NFR-02 | Metric fixtures, validation failures, concurrent publication and failure injection | UC-16/18/27; coordinator wireframe |
| FR-11, FR-12 | CSV content/security checks and transactional audit inspection | UC-19/20; API contracts and audit component |
| NFR-03 | Recorded load test and five timed allocations | Verification plan, section 2.4 |
| FR-13 to FR-16; NFR-06 | Conditional revision/notification/report/scenario tests and clean setup review | UC-17/21/22/28; experiment scripts |

## 7. Ranking rules and decisions awaiting review

For an acceptable, mutually eligible student-supervisor pair `(i, j)`:

```text
m(i, j) = (1 + cosine(embedding_i, embedding_j)) / 2
p(i, j) = 1 / rank_in_student_list(i, j)
r(i, j) = w_topic*m(i, j) + w_preference*p(i, j) + w_gpa*g(i)
```

Embeddings must be non-zero. Invalid text or embeddings block the affected scored input and identify it. GPA normalization uses a fixed approved scale with lower and upper bounds; when enabled, `g(i) = (GPA(i) - lower) / (upper - lower)`. The bounds must satisfy `upper > lower`, and out-of-scale values are rejected. Normalization is independent of the cohort composition.

Supervisor-side order is exact combined score descending, then approved GPA descending when enabled, then accepted preference-submission time ascending, then stable student ID ascending. Stored scores use recorded numeric precision and are compared before display rounding. The student's own strict list remains the proposal order for Gale-Shapley.

The following points require team and supervisor review; they are not claimed as established university policy:

- Confirm the scoring weights, reciprocal-rank normalization, submission-time tie-break and the effect of resubmission on tie priority. GPA remains disabled until its use, approved source and normalization scale are agreed.
- Confirm the local allocation process, eligibility rules and user needs through stakeholder evidence. Revise this draft when findings change assumptions.
- Decide whether the proposed supervisor-profile page (UC-04) is needed; it currently has no accepted requirement. Also decide whether drafts need recommendation preview or whether preferences need a separate draft-saving feature.
- Confirm languages and historical-data access for evaluation. A multilingual model does not establish tested quality for Russian or Kazakh.

Policy approval must identify the immutable version approved. Any agreed change to these rules requires a revised specification, aligned diagrams/prototype and a new policy/snapshot where it affects a run. No interview, academic-supervisor sign-off or completed verification is implied by this draft.
