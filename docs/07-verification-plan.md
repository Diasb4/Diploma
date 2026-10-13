# Verification and Evaluation Plan

Project: Multi-Criteria Academic Supervisor Assignment System (MAS)

Authors: Ardak Avissauly, Nurzhan Zhumabekov, Dias Tursynbai

Astana IT University, October 2026

Task: MAS-5, Verification and Evaluation Plan

## 1. Purpose

This plan describes how we will check that MAS works correctly and how we will measure whether its recommendations and allocations are useful. It has two parts:

- Verification: tests that show the system meets the requirements in [06-requirements-spec.md](06-requirements-spec.md).
- Evaluation: experiments that measure the quality of recommendations and allocations and compare MAS with simpler ways of assigning supervisors.

Requirement IDs such as FR-08 or AC-F07 refer to the requirements specification. The metrics and comparisons follow the literature review ([03-literature-review.md](03-literature-review.md), sections 4 and 5) and the project proposal ([01-proposal.md](01-proposal.md), section 8).

## 2. Testing Levels

We use four levels of testing. Each Must requirement is covered by at least one level.

| Level | What is tested | Main requirements | Planned tool |
|---|---|---|---|
| Unit | Single functions without a database or network: scoring formula and normalization, tie-breaking order, Gale-Shapley matching, the blocking-pair checker, metric calculations, input validation | FR-05 to FR-09, AC-F02, AC-F03, AC-F06, AC-F07, AC-F08 | pytest |
| Integration | The API together with PostgreSQL and the embedding service: access control, input freeze, allocation runs, publication, CSV export, audit records, replay of saved runs | FR-01, FR-04, FR-10 to FR-12, NFR-01, NFR-02, NFR-05 | pytest with a test database |
| End-to-end (E2E) | Complete user workflows in a browser: student proposal and preferences, coordinator run and publication, result viewing, keyboard-only use | FR-02, FR-06, FR-09, FR-10, NFR-04, NFR-07 | Playwright |
| Load | Response times and allocation time under the reference load | NFR-03 | Locust |

These are planned tools. pytest and Locust are Python tools that fit the FastAPI backend, and Playwright can run the same browser tests in Chrome, Firefox and Edge.

### 2.1 Unit tests

Unit tests use small hand-made fixtures with known answers. The most important cases are:

- Scoring: for a fixture with known similarity scores and weights, the combined score equals the value calculated by hand (AC-F07).
- Tie-breaking: each step of the order in AC-F07 has its own fixture, and in each fixture all earlier values are equal:
  1. two candidates whose exact scores differ but look the same after rounding (the exact score decides);
  2. equal exact scores and different GPA, with GPA enabled (the higher GPA wins);
  3. equal scores and equal GPA, different submission times of the preference lists (the earlier list wins);
  4. all earlier values equal (the lower student ID wins).

  A separate fixture with GPA disabled checks that GPA is skipped and the order goes straight from score to submission time.
- Matching: every student gets at most one supervisor from their own list, and no supervisor gets more students than their capacity (AC-F08).
- Stability: an independent checker finds zero blocking pairs in the Gale-Shapley result. A blocking pair is a student and a supervisor who are not matched together, although the student prefers this supervisor to their result and the supervisor has a free place or prefers this student to one of its assigned students (AC-F08).
- Shortage: when total capacity is lower than the number of students, the run finishes and lists the unmatched students instead of raising quotas.
- Metrics: the fixtures from the requirements give the expected values. For example, 6 first-choice assignments out of 10 eligible students give a first-choice satisfaction of 0.60 (AC-F09), and workloads of 4, 0 and 6 students give a maximum workload of 6 (AC-F15).

### 2.2 Integration tests

Integration tests run the backend API with a real test database and the embedding model. They check:

- an authorization matrix: every protected endpoint is called without a session, with the wrong role, with the wrong owner and with the correct user (AC-F01, AC-N01);
- that a frozen snapshot does not change when live data changes, and that replaying it gives the same allocation (AC-F04, AC-N05);
- that publication is atomic and that two parallel publication requests cannot create two published versions (AC-F10, AC-N02);
- that a failure injected in the middle of an allocation or publication leaves no partial records (AC-N02);
- CSV export content and access rules (AC-F11) and audit events (AC-F12).

### 2.3 End-to-end tests

E2E tests run the web client against the backend with the synthetic dataset from section 5. The scenarios are:

1. A student writes a proposal, sees five recommended supervisors and submits a ranked list.
2. A coordinator freezes the inputs, runs the allocation, reviews the draft and publishes it.
3. A student and a supervisor see only their own published results.
4. The student workflow is completed with the keyboard only, and an automated accessibility check reports no critical or serious issues (AC-N04).

The scenarios run in Chrome, Firefox and Edge at screen widths of 360 and 1440 pixels (NFR-07).

### 2.4 Load tests

Load tests follow NFR-03 and AC-N03. They run on a server with at least 4 CPU cores and 8 GB of RAM and use the synthetic dataset with 200 proposals of 100 to 5,000 characters and 25 supervisor profiles. The test runs in this order:

1. Start the backend and measure how long the embedding model takes to load. This cold-start time is reported separately and is not part of the p95 values.
2. Warm up the model with a few recommendation requests. These requests are not measured.
3. Simulate 20 concurrent users for 10 minutes, with at least 100 requests in each measured category: normal reads, writes and recommendations.
4. Run the batch allocation five times in a row. Each run uses a new frozen snapshot of the same dataset, and each result must pass the allocation checks in AC-F08.

| Measurement | Target |
|---|---|
| Normal reads (for example, opening a profile or a result) | p95 response time of at most 2 seconds |
| Writes (for example, saving a proposal or a preference list) | p95 response time of at most 2 seconds |
| Recommendation request | p95 response time of at most 5 seconds |
| Unexpected errors | Less than 1% of all requests |
| Batch allocation | Each of the 5 runs finishes within 60 seconds |
| Cold model load | Reported, no target |

The p95 response time is the time within which 95% of requests are answered. It is calculated separately for reads, writes and recommendations. Errors that the test expects, such as a rejected invalid preference list, are not counted as unexpected errors. The hardware, database contents, software versions, model version and test scripts are recorded with every result.

## 3. Evaluation Metrics

### 3.1 Top-k Recall

Top-k Recall measures whether the recommender places the right supervisor near the top of its list. For each test proposal we take the supervisor who actually supervised that thesis in the previous year and check whether this supervisor is among the first k recommendations.

```text
Top-k Recall = (number of proposals whose recorded supervisor is in the top k) / (number of proposals tested)
```

We report k = 1, 3 and 5. For example, if the recorded supervisor appears in the top 5 for 6 of 10 proposals, Top-5 Recall is 0.60 (AC-F15). Proposals without a recorded supervisor, or whose supervisor is not in the current list of eligible supervisors, are excluded and counted separately. If no proposals are left after this, Top-k Recall is shown as N/A.

This metric shows agreement with past decisions, not proof that a topic fit is good. If supervisors or experts label relevant supervisors for some proposals, Recall against these labels is reported separately.

### 3.2 First-Choice Satisfaction

First-choice satisfaction is the share of students who received the supervisor they ranked first.

```text
First-choice satisfaction = (students assigned to their first choice) / (all eligible students who submitted a preference list)
```

Unmatched students stay in the denominator, so a method cannot look better by leaving difficult students without a supervisor.

### 3.3 Supporting metrics

The two main metrics are always reported together with these supporting metrics:

| Metric | Meaning |
|---|---|
| Coverage | Share of eligible students who received a supervisor |
| Mean preference rank | Average position of the assigned supervisor in the student's list (1 is best), among assigned students |
| Mean topic score | Average similarity between the proposal and the assigned supervisor's profile |
| Maximum workload | Largest number of students assigned to one supervisor |
| Capacity utilization | Assigned students divided by capacity, for each supervisor |
| Blocking pairs | Number of blocking pairs as defined in section 2.1 (0 means the result is stable) |
| Constraint violations | Number of capacity, eligibility and duplicate-assignment violations |

Pass rules for blocking pairs and constraint violations are given in section 6.

### 3.4 Empty denominators

If a metric would divide by zero, it is shown as N/A, not as 0. This happens in these cases:

- first-choice satisfaction and coverage when there are no eligible students;
- mean preference rank and mean topic score when no student is assigned;
- capacity utilization for a supervisor with capacity 0;
- Top-k Recall when no proposals are included (section 3.1).

## 4. Comparisons and Baselines

### 4.1 Recommendation models

Following AC-F15, we compare these models for supervisor recommendations:

| Model | Role |
|---|---|
| BAAI/bge-m3 | Main model ([05-technology-selection.md](05-technology-selection.md), section 2) |
| paraphrase-multilingual-MiniLM-L12-v2 | Fallback model |
| TF-IDF | Simple baseline based on shared words |
| OpenAI embeddings API (text-embedding-3-small) | Comparison only, and only for texts that are authorized for external processing |

The comparison follows these rules:

- All models use the same held-out set of proposals and supervisor profiles, and for each proposal they rank the same set of eligible supervisors.
- The data is split into a development part and a test part, and no proposal is in both. The development part is used for setup choices, such as how long texts are cut or split into parts. The test part is used once, for the final results.
- For each model we report Top-k Recall for k = 1, 3 and 5 (section 3.1), the time needed to process the texts on the recorded hardware, and the cost of API calls.
- Results are reported separately for each language group that exists in the data, for example English proposals with English profiles, and for cross-language pairs, for example a Russian proposal with an English profile. A language group with no proposals is shown as N/A and is not presented as supported (AC-F05).
- The report records where the data came from, the model and preprocessing versions, the split between development and test data, and the hardware.

If the historical data is not available, or the texts are not authorized for the API, the affected comparison is listed as unavailable in the report rather than replaced with other data.

### 4.2 Allocation baselines

MAS (Gale-Shapley with the weighted score) is compared with three simple ways of assigning supervisors. All methods use the same students, supervisors, capacities, eligibility and preference lists.

| Baseline | How it works | Data needed |
|---|---|---|
| Historical manual | The real assignment made by the department in the previous year | Last year's records, see section 4.3 |
| First-come | Students are processed in the order in which they submitted their lists. Each student gets the highest-ranked supervisor on their list who still has free capacity | Submission times (recorded in MAS or simulated) |
| Random | Students are processed in a random order. Each student gets a random supervisor from their own list who still has free capacity | A random seed; repeated with 30 different seeds |

For each method we report all metrics from section 3. For the random baseline we report the mean and standard deviation over the 30 seeds.

### 4.3 Historical manual baseline

To compare MAS with last year's real assignment, both must work on the same problem. From last year's authorized records we rebuild that year's instance, which needs:

- the list of students and supervisors in that cycle;
- each supervisor's capacity;
- which students could choose which supervisors (eligibility);
- students' ranked preference lists and the times they were submitted;
- the proposals and supervisor profiles as they were at that time;
- the final assignment made by the department.

MAS, first-come and random then run on this rebuilt instance, and their results are compared with the real assignment using the metrics from section 3. If some records are missing, the affected comparisons are marked as unavailable. We do not fill the gaps with guessed values:

| Missing data | Effect on the comparison |
|---|---|
| All records | The historical baseline is unavailable |
| Preference lists | MAS, first-come and random cannot run on the historical instance. Only coverage, workload and topic score of the real assignment are reported |
| Capacities or eligibility | The instance cannot be rebuilt. Only coverage, workload and topic score of the real assignment are reported |
| Submission times | First-come is unavailable. MAS uses the remaining tie-breaking steps, and this is stated in the report |
| Proposal or profile texts | Topic score and historical Top-k Recall are unavailable |

### 4.4 Other comparisons

The requirements (AC-F15) ask for two more comparisons:

- Gale-Shapley against an integer linear programming (ILP) model and a greedy algorithm. This comparison and its first results on the synthetic dataset are described in [05-technology-selection.md](05-technology-selection.md), section 3. The script is [experiments/allocation_comparison.py](../experiments/allocation_comparison.py).
- A weight-sensitivity test. The weights of the supervisor-side score are changed step by step on the main scenario, and the metrics from section 3 are reported for every setting.

## 5. Simulation Dataset

Real data from AITU may be limited or unavailable during development, so most tests use a synthetic dataset. The synthetic dataset checks correctness and speed. It does not prove that recommendations are good for real AITU students.

### 5.1 Parameters

| Parameter | Value |
|---|---|
| Students | 200 |
| Supervisors | 25 |
| Research areas | 5 areas with 5 supervisors each: machine learning, software engineering, cybersecurity, data science, networks and IoT |
| Student topics by area | Uneven on purpose: 60 machine learning, 45 software engineering, 40 cybersecurity, 35 data science, 20 networks and IoT |
| Supervisor capacity | Whole numbers from 6 to 10; total 220 in the main scenario (10% more places than students) |
| Preference list length | 5 supervisors for 90% of students, 1 to 4 supervisors for 10% (FR-06 allows 1 to 5) |
| Preference order | Mostly by topic area, with random noise. For 30% of students one of 3 popular supervisors is moved to the first place; together with students who choose them by topic, about 40% of students rank a popular supervisor first |
| Proposal text | English, 100 to 5,000 characters (AC-F02), generated from area-specific keyword lists |
| Supervisor profile text | English research interests and sample publication titles for the supervisor's area |
| GPA | Values from 2.0 to 4.0, used only in runs where GPA is enabled |
| Submission times | Random times within a two-week submission window |
| Random seeds | 5 seeds for generating datasets; every seed is recorded |

### 5.2 Scenarios

The same generator produces several scenarios from these parameters:

| Scenario | Change from the main scenario | What it checks |
|---|---|---|
| Main | None | Normal operation and all metrics |
| Shortage | Total capacity 180 | Unmatched students are reported correctly |
| Popular supervisors | One of the 3 popular supervisors is moved to the first place for 60% of students (about 66% rank one first) | Workload balance and stability under pressure |
| Zero capacity | One supervisor has capacity 0 | The supervisor is excluded from recommendations and matching (AC-F03), and their capacity utilization is shown as N/A |
| Equal scores | Groups of students have identical proposal texts, put the same supervisor at the same position in their lists, and have GPA disabled or equal, so their combined scores for that supervisor are exactly equal | The full tie-breaking order from AC-F07 works inside a complete run; each step is also tested on its own by the unit fixtures in section 2.1 |
| Short lists | 30% of students list only 1 or 2 supervisors | Students whose lists run out stay unmatched |

### 5.3 Rules for the data

- The generator and its seeds will be stored in the repository, so every dataset can be produced again. The part that generates preferences and capacities already exists in [experiments/allocation_comparison.py](../experiments/allocation_comparison.py); the text generation for proposals and profiles will be added for the system tests.
- All public datasets are synthetic. Real names, grades, proposals and past assignments are kept outside the public repository.
- On synthetic data, Top-k Recall uses the supervisor intended by the generator. These results are only a check of the pipeline and are not reported as recommendation quality.

## 6. Reporting and Pass Criteria

Verification passes when:

- all unit, integration and E2E tests linked to Must requirements pass;
- the production MAS allocation (Gale-Shapley) has zero constraint violations and zero blocking pairs in every scenario;
- five repeated runs on the same frozen input give identical results (AC-N05);
- the load targets in section 2.4 are met.

The experimental ILP and greedy methods and the baselines in section 4.2 must also have zero constraint violations, because they are built to respect capacities and eligibility. Their blocking pairs are only measured and reported: they show the cost or benefit of each method compared with Gale-Shapley and are not a pass criterion. These experimental results are never published through the production workflow (AC-F15). For the historical manual assignment, constraint violations and blocking pairs are both measured and reported.

For the evaluation there are no fixed pass values. The results are reported in a table for each method and scenario, with the dataset, seeds and software versions. Results on synthetic data and on real AITU data are always reported separately.

## 7. Open Questions

- Access to last year's AITU records is not yet confirmed. Without it, the historical manual baseline (section 4.3), historical Top-k Recall and the model comparison in section 4.1 cannot be measured.
- The supported languages for the first experiment are defined in the proposal and in AC-F05. If Russian or Kazakh texts are added, the synthetic dataset and the evaluation will be extended with them.
- The ranking policy (weights, GPA use and tie-breaking) must be approved before the final evaluation. Until then, the tests use the policy defined in AC-F07.
