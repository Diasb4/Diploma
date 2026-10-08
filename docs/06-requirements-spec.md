# Requirements Specification

**Task:** MAS-8 (user-provided identifier)  
**Due:** October 14, 2026  
**Project:** Multi-Criteria Academic Supervisor Assignment System (MAS)  
**Status:** Proposed requirements baseline for peer and supervisor review

## 1. Purpose and source of scope

MAS supports thesis-supervisor assignment at Astana IT University. Students submit proposals and ranked preferences, supervisors maintain research profiles and capacities, and department coordinators configure and review allocations.

This specification derives from [README](../README.md) and [Pre-Defense Plan](../PRE_DEFENSE_PLAN.md). The plan assigns requirements to MAS-6 and UX prototypes to MAS-8; this document retains the task identifier requested by the user. The task identifier, owner, and reviewer must be reconciled in YouTrack before a PR is opened. The plan pairs MAS-6 with Dias as author and Nurzhan as reviewer, and MAS-8 with Nurzhan as author and Ardak as reviewer.

The acceptance criteria below describe required future behavior, not completed implementation or verified stakeholder findings. Numeric thresholds and policy choices are proposed design targets pending supervisor review.

## 2. Actors and release boundaries

| Actor | Responsibilities |
|---|---|
| Student | Maintain own proposal, inspect recommendations, submit ordered preferences, view published result. |
| Supervisor | Maintain own research profile, propose capacity, inspect own published assignments. |
| Department Coordinator | Manage cycles, approve capacities and ranking policy, run and review allocation, publish results, export records. |

The MVP covers one department and one allocation cycle at a time, with role-based accounts, proposal text, semantic recommendations, preferences, GPA as an optional configured ranking criterion, hard supervisor capacities, and coordinator-controlled publication. Native mobile applications and HR/payroll integration are excluded. Identity-provider selection and final model/solver selection belong to subsequent architecture and technology decisions.

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
| FR-07 | Must | A coordinator shall configure and version the supervisor-side candidate ranking policy using semantic match and optional GPA; student preference order shall remain the student-side ordering. | AC-F07 |
| FR-08 | Must | The system shall execute capacity-constrained batch matching on frozen inputs, assigning at most one supervisor per student and recording explicit unmatched outcomes. | AC-F08 |
| FR-09 | Must | A coordinator shall inspect draft assignments, unmatched students, quota usage, and first-choice satisfaction before publishing an allocation. | AC-F09 |
| FR-10 | Must | A coordinator shall publish a validated allocation atomically; students and supervisors shall view only their authorized published results. | AC-F10 |
| FR-11 | Must | A coordinator shall export the published allocation as CSV, including unmatched outcomes and cycle/run identifiers. | AC-F11 |
| FR-12 | Must | The system shall record attributable audit events for policy, capacity, preference, allocation, and publication changes. | AC-F12 |
| FR-13 | Should | A coordinator shall create a revised draft with a reasoned manual reassignment, subject to eligibility, single-assignment, and capacity checks; manual revisions shall trigger a new stability check and require explicit review before publication. | Integration tests of valid and invalid overrides; manual coordination is the fallback. |
| FR-14 | Should | The system shall notify participants when results are published and display notification delivery failures to the coordinator. | Delivery test with a simulated failed channel; in-app result access is the fallback. |
| FR-15 | Should | A coordinator shall compare semantic ranking against TF-IDF and evaluate allocations against historical manual, first-come, and seeded random baselines on the same eligible dataset. | Reproducible evaluation report with metric definitions and input versions; offline analysis is the fallback. |
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

## 6. Acceptance criteria for every Must-Have

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
2. A run cannot start without approved capacities, an approved ranking policy, and a frozen input snapshot. Enrollment, capacity, policy, and accepted student inputs are included in that snapshot.
3. Students without a valid submitted proposal and preferences are reported as ineligible with a reason rather than silently assigned.
4. Deadline enforcement uses server time and an inclusive closing rule: submissions at or after the deadline are rejected.

### AC-F05 — Semantic recommendations

1. With a submitted proposal and at least five eligible supervisors having usable research text, a request returns five distinct supervisors in descending semantic-score order; ties use ascending stable supervisor ID.
2. With fewer than five eligible profiles, all eligible profiles are returned; with none, an explicit no-candidates state is shown.
3. Each recommendation identifies the supervisor, current capacity, score in the documented range [0, 1], and model version. The score is labeled a similarity score, not a probability of acceptance.
4. A semantic-service failure returns a retryable error and does not present fabricated recommendations or change submitted preferences.

### AC-F06 — Ranked preferences

1. Before the deadline, a student can submit one to five distinct eligible supervisor IDs and retrieve them in exactly the submitted order.
2. Duplicate IDs, an empty list, more than five IDs, or ineligible IDs are rejected atomically with an actionable validation error.
3. A valid resubmission replaces the prior list. At or after the deadline or freeze, replacement is rejected and the accepted list is retained.

### AC-F07 — Ranking policy

1. The coordinator can save non-negative weights for semantic match and optional GPA whose sum is 1; a sum outside a tolerance of 0.000001 or an invalid weight is rejected.
2. The saved policy defines score normalization, the GPA scale, and tie-breaking by ascending stable student ID. If GPA has positive weight, missing or out-of-range GPA blocks the run and identifies affected records; GPA is not silently invented.
3. A fixture containing semantic scores, GPA values, and ties produces the expected supervisor-side candidate order under the documented formula. Student-side order equals the submitted preferences regardless of GPA weight.
4. Each run references an immutable policy version. Changing the active policy cannot change an existing run.

### AC-F08 — Batch allocation

1. For a frozen fixture, every student has zero or one assignment, every assigned supervisor is on that student's accepted list, and no supervisor exceeds approved capacity.
2. With total capacity below demand, the run completes and explicitly records unmatched students; it never increases quotas to force a complete allocation.
3. With strict candidate rankings and student preferences, an independent checker finds zero blocking pairs: an unassigned pair where the student prefers that supervisor to their result and the supervisor has room or prefers that student to an assigned student.
4. Multiple requests for the same run do not create duplicate assignments. A failed run exposes a failed status and no partially completed result.

### AC-F09 — Draft review

1. Before publication, the coordinator sees all assignments and unmatched outcomes, per-supervisor assigned count and capacity, and validation results for capacity, eligibility, uniqueness, and stability.
2. On a fixture with 10 eligible submitted students and 6 first-choice assignments, first-choice satisfaction is 0.60. The denominator includes eligible unmatched students; an empty denominator displays N/A.
3. Students and supervisors cannot view the draft through either the UI or direct API requests.

### AC-F10 — Publication and result visibility

1. Publishing a draft with a failed hard-constraint validation is rejected without changing the currently published version.
2. Publishing a valid draft makes the complete version visible atomically and records the coordinator, timestamp, and run ID.
3. A student sees their assigned supervisor or an explicit unmatched outcome. A supervisor sees only students assigned to them. Neither actor can retrieve another actor's restricted result.
4. Repeated publication of the same version is idempotent. Publishing a replacement preserves the earlier version for coordinator audit.

### AC-F11 — CSV export

1. A coordinator export contains one row per enrolled student with student ID, supervisor ID or an empty value, outcome/reason, cycle ID, and published run ID; the row count matches the published cycle roster.
2. Non-ASCII names and commas/quotes round-trip through a standard CSV parser without corruption. User-controlled cells beginning with spreadsheet formula markers are escaped for safe spreadsheet import.
3. Unauthenticated users receive HTTP 401 and other roles receive HTTP 403. Export before publication returns an explicit unavailable-result response.

### AC-F12 — Audit records

1. Successful changes to capacities, ranking policy, submitted preferences, run state, and publication create an event containing actor ID, action, UTC timestamp, entity ID, and applicable version/run ID.
2. A reviewer can trace a published result to its frozen snapshot and policy/model versions. Sensitive proposal text, credentials, and session tokens are absent from event payloads.
3. Students and supervisors cannot read the coordinator audit log; no application role can edit or delete audit events through the public API.

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

## 7. Domain rules and open decisions

The proposed supervisor-side score is a weighted sum of normalized semantic similarity and normalized GPA. Student preference rank is expressed directly through the student-side preference list, avoiding an ambiguous combined score that could override expressed preferences. Only mutually eligible pairs are considered; coordinators approve cycle eligibility before freezing inputs. Stability is evaluated against that frozen instance and does not imply that all students receive their first choice or that workloads are equal.

Supervisor review must confirm GPA policy and source, enrollment eligibility, proposal limits, deadlines, privacy/retention policy, and performance targets. These are proposed policies, not established university regulations. Final model and solver choices remain subject to MAS-5; any replacement solver must still satisfy the matching invariants and stability criterion or trigger an explicit requirements revision. Manual overrides are a Should feature because they can affect stability and require separate review.

## 8. Verification and delivery traceability

Each acceptance group links directly to its requirement ID. Future automated cases should use identifiers such as F08-capacity and N02-publication-race; manual checks should record fixture, environment, expected result, actual result, and evidence location. The planned verification document is docs/07-verification-plan.md; it does not yet exist in this checkout.

This specification contains 17 functional requirements (including one release exclusion), 8 non-functional requirements, and explicit criteria for all 17 Must requirements: FR-01–FR-12 and NFR-01–NFR-05. Acceptance of this document requires completeness and peer review; application acceptance requires executing the criteria against the implementation.

Deliver through a MAS task branch and PR under the naming rules in PRE_DEFENSE_PLAN.md. Resolve the MAS-6/MAS-8 identifier discrepancy before selecting the author/reviewer pairing. Do not push directly to main or merge without the required team approval. Link the merged PR to the corresponding YouTrack task before marking it Done.
