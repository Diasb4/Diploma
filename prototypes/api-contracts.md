# REST API contracts (draft)

Proposed request and response examples for the three screens described in [README.md](README.md). The frontend wrote them so that the backend (Dias) and the ML service (Ardak) can confirm or change them. This is not an agreed API: paths, field names and status codes stay open until the backend reviews them. All values are sample data.

Requirement IDs such as FR-05 or AC-F06 refer to [`docs/06-requirements-spec.md`](../docs/06-requirements-spec.md).

## Conventions

- Base path is `/api/v1`. Bodies are JSON in UTF-8, field names use snake_case, identifiers are opaque strings.
- The `Authorization: Bearer <token>` header carries the session (FR-01, NFR-01). A missing or invalid token returns 401. A valid token with the wrong role returns 403.
- Instants use ISO 8601 in UTC with a `Z` suffix. A deadline also carries the time zone name for display (AC-F04).
- The server clock decides every deadline. A change at or after the deadline returns 409 `deadline_passed`, and the last accepted data stays unchanged (AC-F02, AC-F06).
- Validation problems return 422 and list every problem at once in `fields`.
- Every error has the same shape. `retryable` is true only when repeating the same request can succeed (AC-F05).

```json
{
  "error": {
    "code": "deadline_passed",
    "message": "The deadline has passed. Your last accepted list is unchanged.",
    "retryable": false,
    "fields": []
  }
}
```

## Cycle (all roles)

`GET /cycles/current`

```json
{
  "id": "cyc-2026-27",
  "name": "Cycle 2026-27",
  "status": "open",
  "preference_deadline": "2026-11-15T12:00:00Z",
  "time_zone": "Asia/Almaty",
  "inputs_frozen": false,
  "inputs_frozen_at": null
}
```

`status` is `open`, `frozen` or `published`. The student screens use `preference_deadline` and `inputs_frozen` to switch to the read-only state.

## Screen 1: proposal and recommendations (student)

### Read the proposal

`GET /cycles/{cycle_id}/proposal/me` returns 200 with the proposal, or 404 `proposal_not_found` when the student has not started one.

```json
{
  "cycle_id": "cyc-2026-27",
  "title": "Semantic search for support tickets",
  "abstract": "The project builds a web service that matches incoming support tickets with similar solved tickets using sentence embeddings. It compares three embedding models on a labeled sample of 2,000 tickets.",
  "keywords": ["semantic search", "embeddings", "support tickets"],
  "status": "draft",
  "updated_at": "2026-10-18T08:30:12Z",
  "submitted_at": null
}
```

### Save a draft

`PUT /cycles/{cycle_id}/proposal/me` stores the fields without submitting. The response has the same shape as above.

```json
{
  "title": "Semantic search for support tickets",
  "abstract": "The project builds a web service that matches incoming support tickets with similar solved tickets using sentence embeddings. It compares three embedding models on a labeled sample of 2,000 tickets.",
  "keywords": ["semantic search", "embeddings", "support tickets"]
}
```

### Submit

`POST /cycles/{cycle_id}/proposal/me/submit` has no body. It checks the stored fields and submits the one proposal allowed per cycle. The response is the proposal with `"status": "submitted"` and a `submitted_at` value.

Limits from AC-F02: title 5 to 200 characters, abstract 100 to 5,000 characters, 1 to 10 non-empty keywords. A rejected submit returns 422 and the last valid proposal stays saved:

```json
{
  "error": {
    "code": "validation_failed",
    "message": "The proposal was not submitted. Fix the marked fields.",
    "retryable": false,
    "fields": [
      {"field": "abstract", "code": "too_short", "message": "The abstract has 62 characters. It needs at least 100."},
      {"field": "keywords", "code": "empty", "message": "Add at least one keyword."}
    ]
  }
}
```

### Recommendations

`GET /cycles/{cycle_id}/recommendations/me` returns up to five eligible supervisors in descending score order, ties by ascending supervisor id (FR-05, AC-F05).

```json
{
  "cycle_id": "cyc-2026-27",
  "state": "ok",
  "model_version": "sample-v1",
  "score_note": "Similarity score, not a probability of acceptance.",
  "items": [
    {
      "rank": 1,
      "score": 0.94,
      "capacity": 5,
      "supervisor": {"id": "sup-0003", "name": "Supervisor A", "research_areas": ["NLP", "information retrieval"]}
    },
    {
      "rank": 2,
      "score": 0.87,
      "capacity": 4,
      "supervisor": {"id": "sup-0005", "name": "Supervisor B", "research_areas": ["machine learning", "recommender systems"]}
    }
  ]
}
```

`score` is in the range 0 to 1. `state` is `ok` or `no_candidates`. With no eligible supervisors `items` is empty and the screen shows the explicit message.

Errors:

- 409 `proposal_not_submitted` when the student has no submitted proposal.
- 422 `unsupported_input` with `"retryable": false` when the proposal text is outside the scope declared for the model and preprocessing versions (AC-F05). The response carries no recommendations, and the stored proposal and the submitted preferences stay unchanged:

```json
{
  "error": {
    "code": "unsupported_input",
    "message": "The abstract is outside the supported scope of the recommendation model, so no supervisors are suggested. Edit the text and submit again.",
    "retryable": false,
    "fields": [
      {"field": "abstract", "code": "language_not_supported", "message": "The abstract language is not supported."}
    ]
  }
}
```

  The field code names the reason. `language_not_supported` is the one example here, and the full list of codes depends on the scope that the model declaration sets.
- 503 `semantic_service_unavailable` with `"retryable": true`. The response carries no recommendations, and the submitted preferences stay unchanged (AC-F05).

## Screen 2: preference list (student)

### Eligible supervisors

`GET /cycles/{cycle_id}/supervisors` lists supervisors with an approved capacity above zero, recommended ones first (AC-F03). `score` is set only for recommended supervisors (FR-05).

```json
{
  "items": [
    {"id": "sup-0003", "name": "Supervisor A", "capacity": 5, "recommended": true, "score": 0.94},
    {"id": "sup-0005", "name": "Supervisor B", "capacity": 4, "recommended": true, "score": 0.87},
    {"id": "sup-0011", "name": "Supervisor F", "capacity": 3, "recommended": false, "score": null}
  ]
}
```

### Read the accepted list

`GET /cycles/{cycle_id}/preferences/me` returns the ids in exactly the submitted order (AC-F06). Before the first submission the list is empty.

```json
{
  "supervisor_ids": ["sup-0005", "sup-0003", "sup-0009"],
  "accepted_at": "2026-10-18T09:12:40Z"
}
```

`accepted_at` is the server-recorded acceptance time of the list. The server also uses it as a tie-breaker in the supervisor-side ranking (AC-F07), so a client cannot send or change it.

### Submit the list

`PUT /cycles/{cycle_id}/preferences/me` replaces the previous list. A valid list has one to five distinct eligible supervisor ids (FR-06).

```json
{
  "supervisor_ids": ["sup-0005", "sup-0003", "sup-0009"]
}
```

The response has the same shape as the read. A valid resubmission replaces the list and records a new acceptance time. An invalid list is rejected as a whole, and the last accepted list and its time stay unchanged (AC-F06). Possible field codes: `list_empty`, `too_many_entries`, `duplicate_supervisor`, `supervisor_not_eligible`.

```json
{
  "error": {
    "code": "validation_failed",
    "message": "The preference list was rejected. The previous list is unchanged.",
    "retryable": false,
    "fields": [
      {"field": "supervisor_ids[2]", "code": "supervisor_not_eligible", "message": "Supervisor D can no longer be selected. Remove it and submit again."}
    ]
  }
}
```

## Screen 3: allocation panel (coordinator)

All requests below return 403 for students and supervisors (FR-01, AC-F09).

### Readiness

`GET /cycles/{cycle_id}/readiness` feeds the three check cards and the state of Run allocation (AC-F04).

```json
{
  "cycle_id": "cyc-2026-27",
  "can_run": true,
  "capacities": {"ok": true, "approved": 25, "total": 25},
  "ranking_policy": {"ok": true, "version": "v3"},
  "snapshot": {
    "ok": true,
    "id": "snap-0007",
    "frozen_at": "2026-11-15T12:00:01Z",
    "eligible_students": 38,
    "ineligible_students": 2
  }
}
```

`GET /cycles/{cycle_id}/ineligible-students` lists the students left out of the run with a reason for each, so nobody is dropped silently (AC-F04).

```json
{
  "items": [
    {"student_id": "S-017", "reason": "no_submitted_proposal"},
    {"student_id": "S-031", "reason": "no_submitted_preferences"}
  ]
}
```

### Ranking policy

`GET /cycles/{cycle_id}/ranking-policy` returns the active version. The three weights are topic fit (semantic match), student preference rank and optional GPA (FR-07, section 7 of the requirements).

```json
{
  "version": "v3",
  "topic_weight": 0.5,
  "preference_weight": 0.3,
  "gpa_weight": 0.2,
  "gpa_approved": true,
  "gpa_enabled": true,
  "tie_breaking": ["combined_score", "gpa", "list_accepted_at", "student_id"],
  "approved": true
}
```

`tie_breaking` is read-only and lists the order from AC-F07. The `gpa` step applies only when GPA is enabled.

`POST /cycles/{cycle_id}/ranking-policy` creates a new immutable version (FR-07, AC-F07). Weights are 0 or more and add up to 1 within 0.000001. Until GPA use is approved and enabled, `gpa_weight` must be 0.

```json
{
  "topic_weight": 0.6,
  "preference_weight": 0.4,
  "gpa_weight": 0.0,
  "gpa_enabled": false
}
```

The response is the new version, for example `"version": "v4"`. A bad sum returns 422 with the field code `weights_sum_invalid`. A positive `gpa_weight` while GPA is not enabled returns 422 with `gpa_not_enabled`.

### Freeze a snapshot

`POST /cycles/{cycle_id}/snapshots` has no body. It freezes the eligible rosters, approved capacities, ranking policy version, accepted proposals, preferences with their acceptance times, and the data used for scoring (FR-04, AC-F04). It answers 201.

```json
{
  "snapshot_id": "snap-0008",
  "frozen_at": "2026-11-16T06:00:01Z",
  "eligible_students": 38,
  "ineligible_students": 2,
  "policy_version": "v3"
}
```

A frozen snapshot is never modified. Changed inputs need a new snapshot identifier, and earlier snapshots stay available for replay and audit (AC-F04).

### Run the matching

`POST /cycles/{cycle_id}/runs` starts the batch matching on a frozen snapshot (FR-08) and answers 202. The body is optional. Without it the run uses the latest frozen snapshot.

```json
{
  "snapshot_id": "snap-0007"
}
```

Repeating the request for the same snapshot returns the existing run, so no duplicate assignments appear (AC-F08). If a readiness check fails, the answer is 409 `not_ready` with the failed checks in `fields`. If GPA is enabled and a record has a missing or out-of-range GPA, the answer is 409 `gpa_data_invalid` with the affected students in `fields` (AC-F07). The run saves the algorithm version of the student-proposing Gale-Shapley solver (AC-F08).

```json
{
  "run_id": "R-0042",
  "status": "running",
  "policy_version": "v3",
  "algorithm_version": "gale-shapley-sp-v1",
  "model_version": "sample-v1",
  "snapshot_id": "snap-0007"
}
```

`GET /cycles/{cycle_id}/runs/{run_id}` returns the run and the figures for the summary tiles and the validation chips (FR-09, AC-F09). `status` is `running`, `failed`, `draft` or `published`. A failed run carries `failure_reason` and no result (AC-F08).

```json
{
  "run_id": "R-0042",
  "status": "draft",
  "policy_version": "v3",
  "algorithm_version": "gale-shapley-sp-v1",
  "model_version": "sample-v1",
  "snapshot_id": "snap-0007",
  "summary": {
    "eligible_students": 38,
    "assigned": 33,
    "unmatched": 5,
    "first_choice_satisfaction": {"value": 0.61, "numerator": 23, "denominator": 38},
    "quota_used": {"used": 33, "capacity": 40}
  },
  "validations": [
    {"check": "capacity", "passed": true},
    {"check": "eligibility", "passed": true},
    {"check": "uniqueness", "passed": true},
    {"check": "stability", "passed": true}
  ]
}
```

`first_choice_satisfaction.value` is `null` when the denominator is 0, and the screen shows N/A (AC-F09).

### Draft details

`GET /cycles/{cycle_id}/runs/{run_id}/assignments?page=1&page_size=5` fills the table. Unmatched students are rows with `"outcome": "unmatched"`.

```json
{
  "page": 1,
  "page_size": 5,
  "total": 38,
  "items": [
    {"student_id": "S-001", "supervisor_id": "sup-0003", "preference_rank": 1, "outcome": "assigned", "reason": null},
    {"student_id": "S-004", "supervisor_id": null, "preference_rank": null, "outcome": "unmatched", "reason": "all_listed_supervisors_full"}
  ]
}
```

`GET /cycles/{cycle_id}/runs/{run_id}/quota-usage` fills the bars (FR-09).

```json
{
  "items": [
    {"supervisor_id": "sup-0003", "name": "Supervisor A", "assigned": 5, "capacity": 5},
    {"supervisor_id": "sup-0005", "name": "Supervisor B", "assigned": 4, "capacity": 4},
    {"supervisor_id": "sup-0009", "name": "Supervisor C", "assigned": 3, "capacity": 6}
  ]
}
```

### Manual reassignment (Should, FR-13)

`POST /cycles/{cycle_id}/runs/{run_id}/revisions` creates a revised draft. A reason is required. The new draft gets new eligibility, capacity, uniqueness and stability checks. Publishing it needs explicit coordinator review and zero blocking pairs against the same frozen rankings, and a recorded reason does not waive a failed check (FR-13, AC-F10).

```json
{
  "student_id": "S-004",
  "supervisor_id": "sup-0009",
  "reason": "The student's second choice has a free place after a withdrawal."
}
```

The response is a run in `draft` status with a new `run_id` and a `revision_of` field set to the original run. A change that breaks eligibility, single assignment or capacity returns 422 and creates nothing.

### Publish

`POST /cycles/{cycle_id}/runs/{run_id}/publish` publishes the whole validated draft in one step (FR-10, AC-F10). The body is needed only for a revised draft, where it carries the explicit review: `{"reviewed": true}`. Without it the answer is 409 `review_required`.

```json
{
  "run_id": "R-0042",
  "status": "published",
  "published_version": 1,
  "published_at": "2026-11-16T07:45:10Z",
  "published_by": "coord-0001"
}
```

A draft with a failed check, or a check that has not completed, returns 409 `validation_failed`, lists those checks in `fields`, and leaves the published version unchanged (AC-F10). Publishing the same version again returns the same response.

### Export

`GET /cycles/{cycle_id}/export.csv` returns `text/csv; charset=utf-8` with one row per enrolled student (FR-11, AC-F11). Cells that begin with a formula marker are escaped. Before publication the answer is 409 `result_not_published`.

```csv
student_id,supervisor_id,outcome,reason,cycle_id,run_id
S-001,sup-0003,assigned,,cyc-2026-27,R-0042
S-004,,unmatched,all_listed_supervisors_full,cyc-2026-27,R-0042
S-017,,ineligible,no_submitted_proposal,cyc-2026-27,R-0042
```

### Audit log

`GET /cycles/{cycle_id}/audit-events?page=1&page_size=20` is read-only (FR-12, AC-F12). Event payloads hold no proposal text, credentials or tokens.

```json
{
  "page": 1,
  "page_size": 20,
  "total": 1,
  "items": [
    {
      "id": "evt-000412",
      "occurred_at": "2026-11-16T07:45:10Z",
      "actor_id": "coord-0001",
      "action": "allocation_published",
      "entity_type": "run",
      "entity_id": "R-0042",
      "version": "1"
    }
  ]
}
```

## Open questions for the backend

- Paths are scoped by cycle id. If the current cycle can be implicit for students, the student paths get shorter.
- FR-06 speaks of submitting a list, so there is no draft endpoint for preferences. Saving an unfinished list would need a separate resource.
- FR-05 ties recommendations to a submitted proposal, so a draft gets 409. A preview for drafts would need a rule.
- The run is assumed to be asynchronous: 202 and polling. If NFR-03 is met with a synchronous call, `POST .../runs` can return the finished run.
- Repeated `POST .../runs` for one snapshot returns the existing run. An `Idempotency-Key` header is the alternative.
- A run takes an optional `snapshot_id` and defaults to the latest frozen snapshot. The explicit review of a revised draft is a `reviewed` flag on publish. Both are proposals.
- The coordinator responses use anonymous student ids. Names and GPA in these responses depend on the privacy policy (NFR-01).
- Pagination uses `page` and `page_size`. Cursor-based paging is the alternative.
