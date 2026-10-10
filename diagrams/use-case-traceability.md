# Use case traceability

This table links every use case in `src/use-case.puml` to the requirement and the acceptance criteria in [`docs/06-requirements-spec.md`](../docs/06-requirements-spec.md). It lets a reviewer check that scenarios and requirements describe the same system.

Rendered diagrams are in `exports/`: one overview and one view per actor.

## Use cases and requirements

| Use case | Actor | Requirement | Acceptance criteria | Priority |
|---|---|---|---|---|
| UC-01 Log in | All | FR-01 | AC-F01 | Must |
| UC-02 Create, edit and submit thesis proposal | Student | FR-02 | AC-F02 | Must |
| UC-03 View recommended supervisors | Student | FR-05 | AC-F05 | Must |
| UC-04 View supervisor profile | Student | None yet | None | Proposed |
| UC-05 Submit and reorder preference list | Student | FR-06 | AC-F06 | Must |
| UC-06 View published result | Student | FR-10 | AC-F10 | Must |
| UC-07 Maintain research interests and publication text | Supervisor | FR-03 | AC-F03 | Must |
| UC-08 Propose capacity | Supervisor | FR-03 | AC-F03 | Must |
| UC-09 View own published assignments | Supervisor | FR-10 | AC-F10 | Must |
| UC-10 Create cycle and set deadline | Coordinator | FR-04 | AC-F04 | Must |
| UC-11 Enroll eligible participants | Coordinator | FR-04 | AC-F04 | Must |
| UC-12 Approve supervisor capacity | Coordinator | FR-03 | AC-F03 | Must |
| UC-13 Configure ranking policy | Coordinator | FR-07 | AC-F07 | Must |
| UC-14 Freeze input snapshot | Coordinator, included by UC-15 | FR-04 | AC-F04 | Must |
| UC-15 Run batch allocation | Coordinator | FR-08 | AC-F08 | Must |
| UC-16 Review draft allocation | Coordinator | FR-09 | AC-F09 | Must |
| UC-17 Revise draft with manual reassignment | Coordinator | FR-13 | Integration tests of valid and invalid overrides | Should |
| UC-18 Publish allocation | Coordinator | FR-10 | AC-F10 | Must |
| UC-19 Export allocation as CSV | Coordinator | FR-11 | AC-F11 | Must |
| UC-20 View audit log | Coordinator | FR-12 | AC-F12 | Must |
| UC-21 Compare with baselines | Coordinator | FR-15 | Reproducible evaluation report | Should |
| UC-22 Compare draft scenarios | Coordinator | FR-16 | Scenario isolation integration test | Could |
| UC-23 Validate deadline and eligibility | System, included by UC-02 and UC-05 | FR-02, FR-04, FR-06 | AC-F02, AC-F04, AC-F06 | Must |
| UC-24 Compute semantic similarity | System, included by UC-03 and UC-25 | FR-05, FR-07 | AC-F05, AC-F07 | Must |
| UC-25 Build supervisor-side ranking | System, included by UC-15 | FR-07 | AC-F07 | Must |
| UC-26 Solve capacity-constrained matching | System, included by UC-15 | FR-08 | AC-F08 | Must |
| UC-27 Validate allocation | System, included by UC-16, UC-17 and UC-18 | FR-08, FR-09, FR-10, FR-13 | AC-F08, AC-F09, AC-F10 | Must |
| UC-28 Notify participants | System, extends UC-18 | FR-14 | Delivery test with a simulated failed channel | Should |

FR-12 applies to every use case that changes capacity, the ranking policy, preferences, allocation runs or publication. Each of them records an audit event, so the diagrams do not repeat that relation. FR-17 is a release exclusion and has no use case. The non-functional requirements apply across use cases and are not drawn.

## What changed from the first version

The first version followed the project overview. After the requirements draft appeared, these parts were changed:

- The student no longer fills in an academic profile. FR-02 has only the proposal, and the source of the GPA is still an open decision in section 7 of the requirements.
- The compatibility check before submission was removed. FR-05 gives recommendations for a submitted proposal.
- Catalog browsing and search were removed. No requirement describes them.
- The preference list holds one to five supervisors (FR-06), not three.
- The supervisor no longer proposes diploma topics, reviews applicants or marks priority applicants. FR-03 limits the supervisor to the profile, a proposed capacity and the supervisor's own published assignments. The supervisor-side order comes from the ranking policy (FR-07).
- Capacity is proposed by the supervisor and approved by the coordinator (FR-03), instead of being set directly.
- The scoring weights became a ranking policy with a semantic weight and an optional GPA weight. Student preference order is not a weight (section 7 of the requirements).
- Export is CSV only (FR-11). The first version had PDF and Excel.
- Added from the requirements: freezing the input snapshot, validating and publishing an allocation, the audit log, notifications, baseline comparison and scenario comparison.

## Open points for the team

- UC-04 View supervisor profile is shown in the proposal wireframe but has no requirement. Either add a requirement or remove the button and the use case.
- FR-01 does not fix the login method, so the diagrams say only "Log in". The choice of identity provider belongs to the architecture decisions.
- The GPA source and who supplies it are still undecided. UC-11 covers enrollment only.
