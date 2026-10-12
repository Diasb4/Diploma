"""Compare Gale-Shapley, an ILP without stability constraints and greedy allocation on synthetic data.

The dataset follows section 5 of docs/07-verification-plan.md: 200 students,
25 supervisors in 5 research areas, capacities from 6 to 10, and preference
lists of 1 to 5 supervisors. The data are synthetic and only show how the
algorithms behave; they say nothing about real AITU students.

This is a simplified scenario with its own ranking policy, not the policy of
AC-F07 in docs/06-requirements-spec.md. Supervisors rank students by topic
similarity only: there is no preference-rank term, GPA is not used and no
submission times are simulated. Equal scores are broken by the lower student ID.

The experiment needs Python 3.12 or newer, so it uses its own environment and
not the Python 3.11 environment of the backend:
    python3.13 -m venv experiments/.venv
    experiments/.venv/bin/pip install -r experiments/requirements.txt
    experiments/.venv/bin/python experiments/allocation_comparison.py
"""

import time

import numpy as np
import pulp

N_STUDENTS = 200
N_AREAS = 5
SUPERVISORS_PER_AREA = 5
N_SUPERVISORS = N_AREAS * SUPERVISORS_PER_AREA
STUDENTS_PER_AREA = [60, 45, 40, 35, 20]
POPULAR = [0, 5, 10]  # three well-known supervisors
SEEDS = [1, 2, 3, 4, 5]
SCENARIOS = {
    "main": {"total_capacity": 220, "popular_share": 0.30},
    "shortage": {"total_capacity": 180, "popular_share": 0.30},
    "popular": {"total_capacity": 220, "popular_share": 0.60},
}


def make_capacities(rng, total):
    """Random capacities from 6 to 10 whose sum is close to `total`."""
    caps = rng.integers(6, 11, size=N_SUPERVISORS)
    while caps.sum() != total:
        j = rng.integers(N_SUPERVISORS)
        if caps.sum() < total and caps[j] < 10:
            caps[j] += 1
        elif caps.sum() > total and caps[j] > 6:
            caps[j] -= 1
        elif not (6 * N_SUPERVISORS <= total <= 10 * N_SUPERVISORS):
            break
    return caps


def make_dataset(seed, total_capacity, popular_share):
    rng = np.random.default_rng(seed)
    student_area = np.repeat(np.arange(N_AREAS), STUDENTS_PER_AREA)
    supervisor_area = np.repeat(np.arange(N_AREAS), SUPERVISORS_PER_AREA)

    # Topic similarity: high inside the student's area, low outside it.
    same_area = student_area[:, None] == supervisor_area[None, :]
    similarity = np.where(same_area, 0.75, 0.30) + rng.normal(0, 0.08, (N_STUDENTS, N_SUPERVISORS))
    similarity = np.clip(similarity, 0, 1)

    preferences = []
    for i in range(N_STUDENTS):
        noisy = similarity[i] + rng.normal(0, 0.10, N_SUPERVISORS)
        order = list(np.argsort(-noisy))
        if rng.random() < popular_share:
            star = int(rng.choice(POPULAR))
            order.remove(star)
            order.insert(0, star)
        length = 5 if rng.random() < 0.9 else int(rng.integers(1, 5))
        preferences.append([int(j) for j in order[:length]])

    capacities = make_capacities(rng, total_capacity)
    return similarity, preferences, capacities


def supervisor_ranking(similarity):
    """For each supervisor: student -> position (0 is best). Ties go to the lower ID."""
    ranking = []
    for j in range(N_SUPERVISORS):
        order = sorted(range(N_STUDENTS), key=lambda i: (-similarity[i, j], i))
        ranking.append({i: pos for pos, i in enumerate(order)})
    return ranking


def gale_shapley(similarity, preferences, capacities):
    """Student-proposing deferred acceptance with supervisor capacities."""
    ranking = supervisor_ranking(similarity)
    next_choice = [0] * N_STUDENTS
    held = {j: [] for j in range(N_SUPERVISORS)}
    free = list(range(N_STUDENTS))
    while free:
        i = free.pop()
        if next_choice[i] >= len(preferences[i]):
            continue  # list exhausted, student stays unmatched
        j = preferences[i][next_choice[i]]
        next_choice[i] += 1
        held[j].append(i)
        if len(held[j]) > capacities[j]:
            held[j].sort(key=lambda s: ranking[j][s])
            free.append(held[j].pop())
    assignment = [None] * N_STUDENTS
    for j, students in held.items():
        for i in students:
            assignment[i] = j
    return assignment


def ilp(similarity, preferences, capacities):
    """Maximize preference satisfaction: rank 1 gives 5 points, rank 5 gives 1 point."""
    pairs = [(i, j) for i in range(N_STUDENTS) for j in preferences[i]]
    prob = pulp.LpProblem("allocation", pulp.LpMaximize)
    x = {p: prob.add_variable(f"x_{p[0]}_{p[1]}", cat="Binary") for p in pairs}
    prob += pulp.lpSum((5 - preferences[i].index(j)) * x[i, j] for i, j in pairs)
    for i in range(N_STUDENTS):
        prob += pulp.lpSum(x[i, j] for j in preferences[i]) <= 1
    for j in range(N_SUPERVISORS):
        prob += pulp.lpSum(x[i, jj] for i, jj in pairs if jj == j) <= int(capacities[j])
    result = prob.solve(pulp.HiGHS(msg=False))
    assert result.status == pulp.LpSolveStatus.Optimal, result.status
    assignment = [None] * N_STUDENTS
    for (i, j), var in x.items():
        if var.value() is not None and var.value() > 0.5:
            assignment[i] = j
    return assignment


def greedy(similarity, preferences, capacities):
    """Take acceptable pairs in order of topic similarity and assign while possible."""
    pairs = [(i, j) for i in range(N_STUDENTS) for j in preferences[i]]
    pairs.sort(key=lambda p: (-similarity[p], p[0]))
    left = capacities.copy()
    assignment = [None] * N_STUDENTS
    for i, j in pairs:
        if assignment[i] is None and left[j] > 0:
            assignment[i] = j
            left[j] -= 1
    return assignment


def blocking_pairs(assignment, similarity, preferences, capacities):
    ranking = supervisor_ranking(similarity)
    assigned = {j: [i for i in range(N_STUDENTS) if assignment[i] == j] for j in range(N_SUPERVISORS)}
    count = 0
    for i in range(N_STUDENTS):
        current = assignment[i]
        current_rank = preferences[i].index(current) if current is not None else len(preferences[i])
        for j in preferences[i][:current_rank]:
            if len(assigned[j]) < capacities[j]:
                count += 1
            elif any(ranking[j][i] < ranking[j][s] for s in assigned[j]):
                count += 1
    return count


def metrics(assignment, similarity, preferences, capacities):
    matched = [i for i in range(N_STUDENTS) if assignment[i] is not None]
    loads = np.bincount([assignment[i] for i in matched], minlength=N_SUPERVISORS)
    violations = int((loads > capacities).sum()) + sum(
        1 for i in matched if assignment[i] not in preferences[i]
    )
    return {
        "coverage": len(matched) / N_STUDENTS,
        "first_choice": sum(1 for i in matched if preferences[i][0] == assignment[i]) / N_STUDENTS,
        "mean_rank": float(np.mean([preferences[i].index(assignment[i]) + 1 for i in matched])),
        "mean_topic": float(np.mean([similarity[i, assignment[i]] for i in matched])),
        "max_load": int(loads.max()),
        "blocking_pairs": blocking_pairs(assignment, similarity, preferences, capacities),
        "violations": violations,
    }


METHODS = {
    "Gale-Shapley": gale_shapley,
    "ILP without stability constraints": ilp,
    "Greedy by topic score": greedy,
}


def main():
    columns = ["coverage", "first_choice", "mean_rank", "mean_topic", "max_load", "blocking_pairs", "violations", "seconds"]
    for scenario, params in SCENARIOS.items():
        print(f"\nScenario: {scenario} (capacity {params['total_capacity']}, "
              f"popular share {params['popular_share']:.0%}), mean over {len(SEEDS)} seeds")
        print("| Method | Coverage | First choice | Mean rank | Mean topic score | Max load | Blocking pairs | Violations | Time, s |")
        print("|---|---|---|---|---|---|---|---|---|")
        for name, method in METHODS.items():
            rows = []
            for seed in SEEDS:
                similarity, preferences, capacities = make_dataset(seed, **params)
                start = time.perf_counter()
                assignment = method(similarity, preferences, capacities)
                seconds = time.perf_counter() - start
                rows.append({**metrics(assignment, similarity, preferences, capacities), "seconds": seconds})
            mean = {c: float(np.mean([r[c] for r in rows])) for c in columns}
            print(f"| {name} | {mean['coverage']:.2f} | {mean['first_choice']:.2f} | {mean['mean_rank']:.2f} "
                  f"| {mean['mean_topic']:.2f} | {mean['max_load']:.1f} | {mean['blocking_pairs']:.1f} "
                  f"| {mean['violations']:.0f} | {mean['seconds']:.3f} |")


if __name__ == "__main__":
    main()
