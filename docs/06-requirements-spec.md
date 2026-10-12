# Requirements Specification

**Task:** [MAS-8](https://diploma-aitu-2027.youtrack.cloud/issue/MAS-8)  
**Author:** Dias Tursynbai ([@Diasb4](https://github.com/Diasb4))  
**Peer reviewer:** Nurzhan ([@Nurzhan-Zhumabekov](https://github.com/Nurzhan-Zhumabekov))  
**Due:** October 14, 2026  
**Project:** Multi-Criteria Academic Supervisor Assignment System (MAS)  
**Status:** Proposed requirements baseline for peer and supervisor review

## 1. Purpose and source of scope

MAS supports thesis-supervisor assignment at Astana IT University. Students submit proposals and ranked preferences, supervisors maintain research profiles and capacities, and department coordinators configure and review allocations.

This specification derives from the [README](../README.md), the [MAS-3 literature review](03-literature-review.md), and the revised [project proposal](01-proposal.md) submitted in [PR #8](https://github.com/Diasb4/Diploma/pull/8). It adopts MAS-3's multilingual embedding evaluation, weighted-sum ranking, score/GPA/submission-time tie-breaking, and Gale-Shapley comparison with ILP and greedy allocation. It defines the proposed requirements for YouTrack task MAS-8. The assigned author is Dias Tursynbai and the peer reviewer is Nurzhan.

The acceptance criteria below describe required future behavior, not completed implementation or verified stakeholder findings. Numeric thresholds and policy choices are proposed design targets pending supervisor review.

## 2. Actors and release boundaries

| Actor | Responsibilities |
|---|---|
| Student | Maintain own proposal, inspect recommendations, submit ordered preferences, view published result. |
| Supervisor | Maintain own research profile, propose capacity, inspect own published assignments. |
| Department Coordinator | Manage cycles, approve capacities and ranking policy, run and review allocation, publish results, export records. |

The MVP covers one department and one allocation cycle at a time, with role-based accounts, proposal text, semantic recommendations, a weighted-sum policy combining topic fit and student preference rank, GPA as an optional approved score and tie-breaking criterion, hard supervisor capacities, and coordinator-controlled publication. The planned recommendation model is multilingual and locally executed; release language support depends on evaluation of available English, Russian, Kazakh, and cross-language examples. Native mobile applications and HR/payroll integration are excluded. Identity-provider selection and the final model version belong to subsequent architecture and technology decisions. Student-proposing one-to-many Gale-Shapley is the main solver; ILP and greedy methods are evaluation alternatives.

## 3. Prioritization

- **Must:** Required for a complete, safe MVP allocation workflow. All linked acceptance criteria must pass before release.
- **Should:** Valuable for the diploma release; the workflow remains usable with a documented manual workaround.
- **Could:** Optional improvement after Must and Should requirements.
- **Won't this release:** Explicitly excluded from the MVP.

## 4. Functional requirements

| ID | Priority | Requirement | Acceptance criteria |
|---|---|---|---|
| FR-01 | Must | The system shall authenticate users and enforce Student, Supervisor, and Coordinator permissions on every protected operation. | AC-F01 |
| FR-02 | Must | A student shall create, edit, and submit one thesis proposal per cycle containing title, abstract, and keywords before the deadline. | AC-F02 |
| FR-03 | Must | A supervisor shall maintain research interests and publication text and propose a non-negative integer capacity; a coordinator shall approve the effective capacity for the cycle. | AC-F03 |
| FR-04 | Must | A coordinator shall create an allocation cycle, enroll eligible participants, set a preference deadline, and freeze the input snapshot used for allocation. | AC-F04 |
| FR-05 | Must | The system shall recommend up to five eligible supervisors using semantic similarity between proposal text and supervisor research text, showing scores and ranking information. | AC-F05 |
| FR-06 | Must | A student shall submit and reorder a preference list of one to five distinct eligible supervisors before the deadline. | AC-F06 |
| FR-07 | Must | A coordinator shall configure and version a weighted-sum supervisor-side ranking policy using semantic match, student preference rank, and optional approved GPA, with score/GPA/submission-time tie-breaking; student preference order shall remain the student-side ordering. | AC-F07 |
| FR-08 | Must | The system shall execute student-proposing one-to-many Gale-Shapley matching on frozen inputs, assigning at most one supervisor per student and recording explicit unmatched outcomes under hard capacities. | AC-F08 |
| FR-09 | Must | A coordinator shall inspect draft assignments, unmatched students, quota usage, and first-choice satisfaction before publishing an allocation. | AC-F09 |
| FR-10 | Must | A coordinator shall publish a validated allocation atomically; students and supervisors shall view only their authorized published results. | AC-F10 |
| FR-11 | Must | A coordinator shall export the published allocation as CSV, including unmatched outcomes and cycle/run identifiers. | AC-F11 |
| FR-12 | Must | The system shall record attributable audit events for policy, capacity, preference, allocation, and publication changes. | AC-F12 |
| FR-13 | Should | A coordinator shall create a revised draft with a reasoned manual reassignment, subject to eligibility, single-assignment, capacity, and stability checks. Publication shall require explicit coordinator review and zero blocking pairs against the same frozen rankings; a recorded reason shall not waive these checks. | Integration tests of valid and invalid revisions, including the publication checks in AC-F10; manual coordination is the fallback. |
| FR-14 | Should | The system shall notify participants when results are published and display notification delivery failures to the coordinator. | Delivery test with a simulated failed channel; in-app result access is the fallback. |
| FR-15 | Should | A coordinator shall access model comparisons (multilingual SBERT, TF-IDF, and an embeddings API), Gale-Shapley/ILP/greedy comparisons, historical Top-k Recall, workload metrics, and weight-sensitivity results, with additional historical manual, first-come, and seeded random baselines where data permit. | AC-F15; an offline evaluation report is the fallback for the coordinator interface. |
| FR-16 | Could | A coordinator shall compare draft allocation scenarios without modifying the active cycle or published results. | Scenario isolation integration test. |
| FR-17 | Won't this release | The system shall not provide native mobile apps or direct HR/payroll integration in the MVP. | Scope review. |

## 5. Non-functional requirements

| ID | Priority | Requirement | Acceptance criteria / verification |
|---|---|---|---|
| NFR-01 | Must | Protected data shall be isolated by role and ownership; deployed traffic shall use HTTPS, and credentials, session tokens, and full proposal text shall be excluded from application logs. | AC-N01 |
| NFR-02 | Must | Allocation, publication, and preference submission shall preserve transaction integrity under invalid requests, concurrent writes, and process failure. | AC-N02 |
| NFR-03 | Must | On a recorded reference environment of at least 4 CPU cores and 8 GB RAM, with 200 students, 25 supervisors, and 20 concurrent users, normal reads/writes shall have p95 response time at most 2 seconds; a recommendation request at most 5 seconds; and a batch allocation at most 60 seconds. | AC-N03 |
| NFR-04 | Must | Core proposal, preference, and result workflows shall support keyboard-only operation, labeled controls, visible focus, and text explanations of validation errors. | AC-N04 |
| NFR-05 | Must | Repeated allocation of identical frozen inputs and policy/model versions shall produce identical assignments, with traceable input and output versions. | AC-N05 |
| NFR-06 | Should | Backup restoration shall recover the most recent daily backup within 4 hours in a documented rehearsal (proposed RPO: 24 hours). | Restore test recording backup age, elapsed time, and record counts. |
| NFR-07 | Should | Core workflows shall work in current stable Chrome, Firefox, and Edge at verification time and at viewport widths of 360 and 1440 CSS pixels without horizontal page scrolling. | Browser and viewport test matrix. |
| NFR-08 | Should | A clean checkout shall support documented local setup and automated execution of unit and integration checks without committed secrets. | Fresh-environment setup rehearsal and secret scan. |

## 6. Acceptance criteria

Criteria below cover every Must requirement and the Should evaluation feature FR-15.

### AC-F01 — Authentication and authorization

1. Given an authenticated account in each role, authorized operations succeed and operations reserved for another role return HTTP 403 without changing data.
2. Given no valid session, protected endpoints return HTTP 401.
3. Given student A requesting or changing student B's proposal, preferences, or result through a direct API request, access is denied without exposing B's records. Equivalent ownership checks apply to supervisors.

### AC-F02 — Proposal submission

1. Given an enrolled student before the deadline, a title of 5–200 characters, an abstract of 100–5,000 characters, and 1–10 non-empty keywords can be saved, submitted, and retrieved unchanged.
2. Empty or out-of-range fields produce field-specific validation errors and do not replace the last valid proposal.
3. After the deadline or input freeze, editing and submission are rejected. The system retains the last accepted proposal and submission timestamp.

### AC-F03 — Supervisor profile and capacity

1. A supervisor can save non-empty research interests and optional publication text, and retrieve the saved values.
2. Negative, fractional, and non-numeric capacities are rejected without changing the approved capacity.
3. A proposed capacity affects matching only after coordinator approval. An approved capacity of zero excludes that supervisor from recommendations and preference submission for that cycle.
4. Changes after input freeze do not alter the snapshot of an existing run.

### AC-F04 — Cycle configuration and freeze

1. A coordinator can enroll students and supervisors and save a deadline with an explicit timezone; duplicate enrollment is rejected.
2. A run cannot start without approved capacities, an approved ranking policy, and a frozen input snapshot. The snapshot preserves the eligible rosters and pair eligibility, approved capacities, ranking-policy version, accepted proposals, ordered preferences and their server-recorded acceptance timestamps, and supervisor research text used for scoring. The policy records topic/preference/GPA weights, normalization rules, GPA enablement, numeric precision, and the complete tie-breaking order. When GPA is enabled for scoring or tie-breaking, its values, approved source, and normalization scale are included even if its score weight is zero. The snapshot also preserves semantic scores, reciprocal-rank preference scores, combined candidate scores, and derived strict supervisor-side rankings, with the model and text-preprocessing versions that produced them. Matching uses these saved values rather than reading current profiles, preferences, timestamps, or grades.
3. Students without a valid submitted proposal and preferences are reported as ineligible with a reason rather than silently assigned.
4. Deadline enforcement uses server time and an inclusive closing rule: submissions at or after the deadline are rejected.
5. Once frozen, a snapshot cannot be modified. Changes to live profiles, GPA, preference order or acceptance timestamps, eligibility, capacities, or ranking policy do not change its saved inputs, scores, rankings, or results. An allocation using changed inputs requires a new snapshot identifier; previous snapshots remain available for authorized replay and audit.

### AC-F05 — Semantic recommendations

1. With a submitted proposal and at least five eligible supervisors having usable research text, a request returns five distinct supervisors in descending semantic-score order; ties use ascending stable supervisor ID.
2. With fewer than five eligible profiles, all eligible profiles are returned; with none, an explicit no-candidates state is shown.
3. Each recommendation identifies the supervisor, current capacity, score in the documented range [0, 1], and model version. The score is labeled a similarity score, not a probability of acceptance.
4. A semantic-service failure returns a retryable error and does not present fabricated recommendations or change submitted preferences.
5. The selected model and preprocessing versions define the supported language and cross-language cases and the long-text truncation or chunking procedure. Inputs outside that declared scope return an explicit unsupported-input response. Supported cases are backed by the language-specific evaluation in AC-F15; untested Russian or Kazakh cases are not presented as verified support.

### AC-F06 — Ranked preferences

1. Before the deadline, a student can submit one to five distinct eligible supervisor IDs and retrieve them in exactly the submitted order, with the server-recorded acceptance timestamp of that list.
2. Duplicate IDs, an empty list, more than five IDs, or ineligible IDs are rejected atomically with an actionable validation error.
3. A valid resubmission atomically replaces the prior list and records its new server acceptance timestamp; a rejected request changes neither the accepted list nor its timestamp. At or after the deadline or freeze, replacement is rejected and the accepted list is retained. Clients cannot supply or override the timestamp used for tie-breaking.

### AC-F07 — Ranking policy

1. The coordinator can save non-negative weights for semantic match, preference rank, and optional GPA whose sum is 1; a sum outside a tolerance of 0.000001 or an invalid weight is rejected. The policy records whether GPA use is approved and enabled. Until enabled, the GPA weight must be zero and GPA is skipped in tie-breaking.
2. The saved policy uses the formula and fixed normalization rules in section 7. Candidates are ordered by exact combined score descending, then normalized GPA descending when enabled, then accepted preference-list timestamp ascending, and finally stable student ID ascending when all preceding values are equal. Display rounding cannot affect ordering. If GPA is enabled for scoring or tie-breaking, missing or out-of-range GPA blocks the run and identifies affected records, including when its score weight is zero. With GPA disabled, no grade is required and its scoring contribution is zero.
3. A fixture with differing preference ranks produces the expected reciprocal-rank scores and combined scores. Additional cases independently verify each ordering step: different exact scores despite identical displayed rounded scores; equal scores with different enabled GPA values; equal scores and GPA with different timestamps; and equality of all preceding values resolved by ID. A GPA-disabled fixture skips GPA comparison. Student-side order equals the submitted preferences under every weight setting, and no pair outside an accepted list enters matching.
4. Each run references an immutable policy version. Changing the active policy cannot change an existing run.

### AC-F08 — Batch allocation

1. For a frozen fixture, every student has zero or one assignment, every assigned supervisor is on that student's accepted list, and no supervisor exceeds approved capacity.
2. With total capacity below demand, the run completes and explicitly records unmatched students; it never increases quotas to force a complete allocation.
3. With strict candidate rankings and student preferences, an independent checker finds zero blocking pairs: a mutually eligible pair on the student's accepted list that is not assigned together, where the student prefers that supervisor to their result and the supervisor has room or prefers that student to an assigned student. The checker uses the same frozen preferences, supervisor-side rankings, and capacities as the run.
4. Multiple requests for the same run do not create duplicate assignments. A failed run exposes a failed status and no partially completed result.
5. A reference fixture confirms student-proposing deferred acceptance: each unassigned student approaches the next supervisor in their accepted order, each supervisor retains the highest-ranked candidates up to capacity, and rejected students continue until assigned or their list is exhausted. The saved algorithm version identifies this solver; experimental ILP or greedy results remain separate from the production run.

### AC-F09 — Draft review

1. Before publication, the coordinator sees all assignments and unmatched outcomes, per-supervisor assigned count and capacity, and validation results for capacity, eligibility, uniqueness, and stability.
2. On a fixture with 10 eligible submitted students and 6 first-choice assignments, first-choice satisfaction is 0.60. The denominator includes eligible unmatched students; an empty denominator displays N/A.
3. Students and supervisors cannot view the draft through either the UI or direct API requests.

### AC-F10 — Publication and result visibility

1. Publication requires completed, passing checks for capacity, eligibility, single assignment, and stability (zero blocking pairs under AC-F08). A missing or failed check rejects publication without changing the currently published version.
2. Publishing a valid draft makes the complete version visible atomically and records the coordinator, timestamp, and run ID.
3. A student sees their assigned supervisor or an explicit unmatched outcome. A supervisor sees only students assigned to them. Neither actor can retrieve another actor's restricted result.
4. Repeated publication of the same version is idempotent. Publishing a replacement preserves the earlier version for coordinator audit.
5. If manual reassignment is implemented, publication of a revised draft additionally requires a recorded reason and explicit coordinator review. A fixture that preserves capacity, eligibility, and single assignment but introduces a blocking pair is rejected even after that review. A revised draft with zero blocking pairs and all other checks passing can be published after the required review.

### AC-F11 — CSV export

1. A coordinator export contains one row per enrolled student with student ID, supervisor ID or an empty value, outcome/reason, cycle ID, and published run ID; the row count matches the published cycle roster.
2. Non-ASCII names and commas/quotes round-trip through a standard CSV parser without corruption. User-controlled cells beginning with spreadsheet formula markers are escaped for safe spreadsheet import.
3. Unauthenticated users receive HTTP 401 and other roles receive HTTP 403. Export before publication returns an explicit unavailable-result response.

### AC-F12 — Audit records

1. Successful changes to capacities, ranking policy, submitted preferences, run state, and publication create an event containing actor ID, action, UTC timestamp, entity ID, and applicable version/run ID.
2. A reviewer can trace a published result to its frozen snapshot and policy/model versions. Sensitive proposal text, credentials, and session tokens are absent from event payloads.
3. Students and supervisors cannot read the coordinator audit log; no application role can edit or delete audit events through the public API.

### AC-F15 — Evaluation evidence (Should interface feature)

1. A versioned report compares multilingual SBERT and TF-IDF on the same held-out proposal/profile corpus and includes an embeddings API comparison when text is authorized for external processing. It records dataset provenance, eligible candidate sets, model and preprocessing versions, development/evaluation separation, language and cross-language groups, and runtime and cost conditions. Unavailable data or unauthorized API input are reported as unavailable comparisons.
2. Historical Recall@k, including k = 5, uses the previous year's recorded supervisor as the reference for each held-out proposal: `|Top_k(i) intersect H(i)| / |H(i)|`, averaged over proposals with a recorded supervisor eligible for that evaluation. A fixture with one historical supervisor per proposal, retrieved in the top five for 6 of 10 included proposals, reports Recall@5 = 0.60. Missing assignments/profiles and ineligible reference supervisors are counted as excluded cases. Historical agreement is identified as agreement with earlier decisions; independent expert topic-relevance results, if available, are reported separately. An empty included cohort displays N/A.
3. Gale-Shapley, PuLP ILP, and greedy allocations are compared on identical frozen rosters, capacities, eligibility, preferences, scores, and candidate rankings. The report records each method's objective, processing order, version, and any stability constraints, and independently measures capacity, eligibility, uniqueness violations, and blocking pairs. Unstable experimental outputs cannot be published through the production workflow.
4. Allocation metrics include coverage, first-choice satisfaction with eligible unmatched students in the denominator, mean assigned preference rank, mean topic score, per-supervisor counts and capacity utilization, and maximum assigned students per supervisor. With counts 4, 0, and 6, the maximum workload is 6. Means among assigned students are accompanied by coverage; empty denominators display N/A.
5. A documented sensitivity grid varies topic, preference, and approved GPA weights while preserving their sum of 1. Dataset, normalization, and tie-breaking rules remain fixed; scores and supervisor-side rankings are rebuilt and versioned for each policy. The report records changed assignments and the resulting satisfaction, topic-fit, and workload metrics. GPA-disabled experiments keep its weight zero and omit GPA tie-breaking.
6. Additional first-come, seeded random, and historical manual comparisons use the same hard constraints and comparable recorded data where available. Recorded arrival orders, seeds, and unavailable historical fields are disclosed. Synthetic correctness and scale tests are identified separately from evidence of AITU recommendation quality or user benefit.
7. If the coordinator evaluation interface is implemented, only a coordinator can retrieve these reports. Otherwise, the offline report and reproduction instructions provide the evidence required by the diploma evaluation plan; the UI remains a Should feature.

### AC-N01 — Privacy and transport security

1. An API authorization matrix covers every protected endpoint with unauthenticated, wrong-role, wrong-owner, and authorized requests; all forbidden requests disclose no protected record content.
2. In the deployed test environment, HTTP requests redirect to HTTPS or are refused, and session cookies are Secure and HttpOnly if cookie-based sessions are used.
3. Captured logs from successful and failed authentication, proposal submission, and recommendation requests contain no raw passwords, session tokens, or full abstract text.

### AC-N02 — Integrity and failure handling

1. Injecting a failure during preference replacement, allocation persistence, and publication leaves either the complete previous state or the complete committed new state, with no partial records.
2. Concurrent requests to publish different versions cannot create two active published versions for one cycle; the losing request receives an explicit conflict or already-published result.
3. Database constraints or transactional validation reject duplicate student assignments and capacity violations even when requests bypass the UI.

### AC-N03 — Performance

1. Record hardware, model version, database contents, runtime versions, and test scripts. Use 200 student proposals of 100–5,000 characters, 25 research profiles, and 20 concurrent users.
2. After model warm-up, run a 10-minute test with at least 100 requests per measured category. Report p95 separately for normal reads, writes, and recommendations; each meets its stated threshold and unexpected errors remain below 1%.
3. Five successive allocation runs on distinct snapshots of the same dataset each complete within 60 seconds and satisfy AC-F08. Cold model-load time is reported separately.

### AC-N04 — Core workflow accessibility

1. A keyboard-only tester completes proposal submission, preference reordering, and published-result viewing without a pointer or keyboard trap.
2. Every interactive form control has a programmatic accessible name, focus remains visible, and failed submissions identify invalid fields with text linked to those controls.
3. Automated accessibility checks on the three workflows report zero critical or serious issues; manual results are recorded alongside automated findings.

### AC-N05 — Reproducibility

1. Five runs using the same frozen input, ranking policy, model version, and algorithm version return identical student-supervisor pairs and unmatched outcomes.
2. Each run stores a snapshot identifier or hash, policy version, model identifier/version, algorithm version, and any random seed used.
3. A fresh test environment with the recorded versions can replay a saved fixture and reproduce its allocation exactly.
4. After freezing a fixture, changes to live research text, GPA, preference order or acceptance timestamps, or active weights do not change an allocation replayed from that snapshot. The run references the saved scores, tie-breaking inputs, and rankings and produces the same pairs and unmatched outcomes. A new snapshot records changed inputs without overwriting the earlier one.

## 7. Domain rules and open decisions

The proposed supervisor-side score follows the revised proposal and MAS-3's weighted-sum approach:

```text
m(i, j) = (1 + cosine(i, j)) / 2
p(i, j) = 1 / rank_P(i)(j)
r(i, j) = w_topic * m(i, j) + w_preference * p(i, j) + w_gpa * g(i)
w_topic >= 0; w_preference >= 0; w_gpa >= 0
w_topic + w_preference + w_gpa = 1
```

`rank_P(i)(j)` is the one-based position of supervisor `j` in student `i`'s accepted list, and `g(i)` is GPA normalized using the approved fixed scale. Cosine normalization applies to non-zero embeddings; unusable research text or embeddings must be corrected before participating in scored allocation. With GPA disabled, `w_gpa = 0`, the scoring value `g(i) = 0` is a placeholder rather than an inferred grade, and GPA is skipped in tie-breaking. Enabling GPA requires approved data even if its score weight is zero, since it then breaks equal-score ties.

Student preference rank contributes to supervisor-side scoring while the submitted list remains the student's strict proposal order. The score cannot reorder that list or make a supervisor outside it acceptable. Only mutually eligible pairs are considered; coordinators approve cycle eligibility before freezing inputs. The strict supervisor order is combined score descending, enabled GPA descending, server acceptance timestamp ascending, then stable ID ascending as the final fallback. Stability is evaluated against that frozen instance and does not imply that all students receive their first choice or that workloads are equal.

MAS-3 motivates multilingual sentence embeddings and comparison of Gale-Shapley with ILP and greedy allocation, historical Top-k Recall, workload measurement, and weight sensitivity. The diploma evaluation must document those comparisons or explicitly identify unavailable data; FR-15's coordinator interface is a Should feature with an offline report as its fallback. Historical assignments provide an agreement reference, and expert topic-relevance labels, if obtained, are evaluated separately. Release language support follows the evidence rather than the model's multilingual label.

Supervisor review must confirm preference-score normalization and weights, GPA policy and source, submission-time tie-breaking and the effect of resubmission, enrollment eligibility, proposal limits, deadlines, privacy/retention policy, historical data access, supported language cases, and performance targets. These are proposed policies, not established university regulations. The selected model, main Gale-Shapley solver, and experimental ILP/greedy objectives will be justified in docs/05-technology-selection.md; any replacement production solver must still satisfy the matching invariants and stability criterion or trigger an explicit requirements revision. Manual reassignment is a Should feature. A revised draft is checked against the original frozen preferences, rankings, and capacities, and it cannot be published if it introduces a blocking pair. Coordinator review and a recorded reason do not override this rule. Changing the allocation inputs or the stability policy requires a separately reviewed decision rather than editing an existing snapshot.

## 8. Verification and delivery traceability

Each acceptance group links directly to its requirement ID. Future automated cases should use identifiers such as F07-preference-score, F07-gpa-timestamp-ties, F08-capacity, F15-historical-recall, F15-weight-sensitivity, and N02-publication-race; manual checks should record fixture, environment, expected result, actual result, and evidence location. The planned verification document is docs/07-verification-plan.md; it does not yet exist in this checkout.

This specification contains 17 functional requirements (including one release exclusion), 8 non-functional requirements, and explicit criteria for all 17 Must requirements: FR-01–FR-12 and NFR-01–NFR-05. Acceptance of this document requires completeness and peer review; application acceptance requires executing the criteria against the implementation.

Deliver changes through the MAS-8-Requirements-Specification branch and [PR #6](https://github.com/Diasb4/Diploma/pull/6), referencing YouTrack task MAS-8 in commit messages. Nurzhan reviews the updated requirements before merging. Do not push directly to main or merge without the required peer approval. Link the merged PR to MAS-8 and mark the task Done only after its acceptance criteria have been met.
