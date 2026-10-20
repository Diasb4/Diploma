# Actor scenarios

This file gives the step-by-step scenarios behind the use case diagrams in [`src/use-case.puml`](src/use-case.puml). Each scenario names the use cases it covers and the requirement and acceptance criteria it follows in [`docs/06-requirements-spec.md`](../docs/06-requirements-spec.md). The mapping of every use case to its requirement is in [use-case-traceability.md](use-case-traceability.md).

The scenarios follow the requirements draft. If a requirement changes, the matching scenario changes with it. Values such as limits and error behavior are copied from the acceptance criteria, not chosen here.

## Student

### S-1 Submit a proposal and view recommendations

Use cases: UC-01, UC-02, UC-23, UC-03, UC-24. Requirements: FR-01, FR-02, FR-05. Criteria: AC-F01, AC-F02, AC-F05.

Precondition: the student is enrolled in the cycle and the preference deadline has not passed.

Main flow:
1. The student logs in.
2. The student enters a title, an abstract and keywords, and saves a draft.
3. The student submits the proposal. The system checks the limits (title 5 to 200 characters, abstract 100 to 5,000 characters, 1 to 10 non-empty keywords) and the deadline, and stores the proposal with a submission time.
4. The system compares the proposal text with the research text of eligible supervisors and shows up to five supervisors in descending order of score, with their capacity and the model version.
5. The student reads the list. The score is a similarity score, not a probability of acceptance.

Alternative flows:
- A field is empty or out of range. The system shows an error for that field and keeps the last valid proposal.
- The deadline or the input freeze has passed. Editing and submission are rejected, and the last accepted proposal stays.
- Fewer than five supervisors are eligible. The system shows all of them. If none is eligible, it shows an explicit message instead of a list.
- The similarity service fails. The system returns a retryable error and shows no made-up recommendations. The submitted preferences do not change.
- The proposal text is outside the language or length scope declared for the model. The system returns an explicit unsupported-input response.

Result: a stored proposal and a ranked list of recommended supervisors.

### S-2 Submit the preference list

Use cases: UC-05, UC-23. Requirement: FR-06. Criteria: AC-F06, AC-F04.

Precondition: the student is enrolled in the cycle and the preference deadline has not passed.

Main flow:
1. The student opens the list of eligible supervisors. The recommended ones come first.
2. The student picks one to five distinct supervisors and puts them in order of preference.
3. The student submits the list. The system checks that every supervisor is eligible and that there are no duplicates, then stores the list in exactly the submitted order with a server-recorded acceptance time.
4. The student may reorder and submit again before the deadline. A valid resubmission replaces the earlier list and records a new acceptance time.

Alternative flows:
- The list is empty, has more than five entries, repeats a supervisor or holds an ineligible supervisor. The system rejects the whole list with an error that says what to fix. The previous list and its time stay unchanged.
- The deadline or the freeze has passed. Replacement is rejected and the accepted list stays.

Result: an ordered preference list that is later saved in the input snapshot.

### S-3 View the published result

Use case: UC-06. Requirement: FR-10. Criteria: AC-F10, AC-F01.

Precondition: the coordinator has published the allocation.

Main flow:
1. The student logs in and opens the result.
2. The system shows the assigned supervisor, or an explicit unmatched outcome.

Alternative flows:
- The allocation is not published yet. The student cannot see any draft result.
- The student requests another student's result through a direct request. The system denies access without showing that record.

Result: the student knows the outcome.

## Supervisor

### P-1 Maintain the profile and propose a capacity

Use cases: UC-01, UC-07, UC-08. Requirement: FR-03. Criteria: AC-F03, AC-F01.

Main flow:
1. The supervisor logs in.
2. The supervisor saves non-empty research interests and, optionally, publication text.
3. The supervisor proposes a capacity, a non-negative whole number of students.
4. The coordinator approves the effective capacity (C-1, step 4). Only the approved capacity affects matching.

Alternative flows:
- The capacity is negative, fractional or not a number. The system rejects it and keeps the approved capacity.
- The approved capacity is zero. The supervisor does not appear in recommendations or in the list of supervisors a student can choose from for that cycle.
- The profile changes after the input freeze. The snapshot of an existing run does not change.

Result: a profile used for recommendations and a proposed capacity waiting for approval.

### P-2 View own published assignments

Use case: UC-09. Requirement: FR-10. Criteria: AC-F10, AC-F01.

Precondition: the coordinator has published the allocation.

Main flow:
1. The supervisor logs in and opens the assignments.
2. The system shows only the students assigned to this supervisor.

Alternative flows:
- The allocation is not published yet. The supervisor cannot see the draft.

Result: the supervisor knows which students were assigned.

## Department coordinator

### C-1 Set up the cycle

Use cases: UC-10, UC-11, UC-12, UC-13. Requirements: FR-03, FR-04, FR-07. Criteria: AC-F03, AC-F04, AC-F07.

Main flow:
1. The coordinator creates a cycle and sets the preference deadline with an explicit time zone.
2. The coordinator enrolls the eligible students and supervisors.
3. The coordinator reviews the capacities that supervisors proposed.
4. The coordinator approves the capacity of each supervisor for the cycle.
5. The coordinator configures the ranking policy: weights for topic match, student preference rank and, if approved, GPA. The weights are non-negative and add up to 1. The system saves the policy as a new version.

Alternative flows:
- A participant is enrolled twice. The system rejects the duplicate.
- The weights do not add up to 1 or one of them is invalid. The system rejects the policy.
- GPA is not approved or not enabled. Its weight must stay zero and the system skips GPA in tie-breaking.

Result: a cycle with a deadline, enrolled participants, approved capacities and an approved ranking policy. Each change is recorded in the audit log (FR-12).

### C-2 Freeze the input snapshot

Use cases: UC-14, UC-25, UC-24. Requirements: FR-04, FR-07. Criteria: AC-F04, AC-F07.

Precondition: capacities are approved and a ranking policy is approved, because the snapshot saves both.

Main flow:
1. The coordinator starts the freeze.
2. The system builds the supervisor-side ranking of the students who listed each supervisor, using the semantic scores and the policy.
3. The system saves the snapshot: the eligible rosters and pair eligibility, approved capacities, the policy version with its weights, normalization rules, GPA setting, numeric precision and tie-breaking order, accepted proposals, ordered preferences with their acceptance times, supervisor research text, the semantic scores, the preference scores, the combined scores, the derived supervisor-side rankings, and the model and text-preprocessing versions that produced them. When GPA is enabled, the snapshot also saves the GPA values with their approved source and normalization scale.
4. The system reports the students that have no valid proposal or preference list as ineligible, with a reason. It does not assign them silently.

Alternative flows:
- GPA is enabled and a value is missing or out of range. The system blocks the freeze, because the rankings need the values, and names the affected records.
- Inputs change after the freeze. The saved snapshot stays as it is. Allocation on changed inputs needs a new snapshot with a new identifier.

Result: an immutable snapshot that the run uses.

### C-3 Run the allocation and review the draft

Use cases: UC-15, UC-26, UC-16, UC-27, and UC-17 when manual reassignment is implemented. Requirements: FR-08, FR-09, FR-13. Criteria: AC-F08, AC-F09, AC-F10.

Precondition: a frozen snapshot exists.

Main flow:
1. The coordinator starts a run on the snapshot. The run cannot start without approved capacities, an approved policy and the snapshot.
2. The system runs student-proposing Gale-Shapley matching under the hard capacities. Every student gets one supervisor or an explicit unmatched outcome.
3. The system validates the result for capacity, eligibility, single assignment and stability.
4. The coordinator reviews the draft: all assignments and unmatched students, the assigned count against the capacity of each supervisor, the validation results and first-choice satisfaction.
5. Optional (Should): the coordinator creates a revised draft with a manual reassignment and a written reason. The system applies the same checks.

Alternative flows:
- Total capacity is below demand. The run still completes and lists the unmatched students. It never raises a capacity.
- GPA is enabled and a value is missing or out of range. The system blocks the run and names the affected records.
- The run fails. The system shows a failed status and no partial result.
- A revised draft breaks eligibility, single assignment or capacity, or creates a blocking pair. The system rejects the revision or refuses to publish it, even after review.
- Students and supervisors cannot see the draft in the interface or through direct requests.

Result: a draft allocation that passed the checks, or a clear list of what failed.

### C-4 Publish, export and audit

Use cases: UC-18, UC-27, UC-28, UC-19, UC-20. Requirements: FR-10, FR-11, FR-12, FR-14. Criteria: AC-F10, AC-F11, AC-F12.

Precondition: a draft has passed all checks.

Main flow:
1. The coordinator publishes the draft. Publication needs passing checks for capacity, eligibility, single assignment and stability. If all pass, the full version becomes visible at once and the system records who published it, when, and the run ID.
2. The system notifies the participants (Should). Delivery failures are shown to the coordinator, and the result stays available in the application.
3. The coordinator exports the published allocation as CSV: one row per enrolled student with the supervisor or an empty value, the outcome, the cycle ID and the published run ID.
4. The coordinator opens the audit log to trace the result to its snapshot and policy and model versions.

Alternative flows:
- A check is missing or failed. Publication is rejected and the published version stays unchanged.
- The same version is published again. The request is idempotent. Publishing a replacement keeps the earlier version for audit.
- Export before publication returns an explicit unavailable response.
- A student or supervisor asks for the export or the audit log. The system denies access.

Result: a published allocation, a CSV file and an audit trail.

## Use cases without a scenario here

- UC-04 View supervisor profile has no requirement yet. See the open points in the traceability table.
- UC-21 Evaluation reports and UC-22 Scenario comparison are coordinator features with lower priority (Should and Could). Their scenarios are defined by AC-F15 and the scenario isolation test, and they are not repeated here.
