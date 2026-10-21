import pytest
from src.generator.dataset_generator import UniversityDataGenerator
from src.engine import MatchingEngine
from src.models.entities import CriteriaWeights


@pytest.fixture
def sample_data():
    students, supervisors = UniversityDataGenerator.generate_dataset(
        num_students=25,
        num_supervisors=8,
        seed=123,
    )
    return students, supervisors


def test_gale_shapley_invariants(sample_data):
    students, supervisors = sample_data
    engine = MatchingEngine(use_neural_embeddings=False)

    result = engine.allocate(students, supervisors, algorithm="gale_shapley")

    # Invariant 1: Single assignment
    assigned_ids = [p.student_id for p in result.pairs]
    assert len(assigned_ids) == len(set(assigned_ids)), "Student must not be assigned twice"

    # Invariant 2: Hard quotas respected
    quota_map = {s.id: s.quota for s in supervisors}
    sup_counts = {}
    for p in result.pairs:
        sup_counts[p.supervisor_id] = sup_counts.get(p.supervisor_id, 0) + 1

    for sup_id, count in sup_counts.items():
        assert count <= quota_map[sup_id], f"Quota for {sup_id} exceeded"

    # Invariant 3: Zero blocking pairs (weak stability)
    assert result.metrics.blocking_pairs_count == 0, "Gale-Shapley must guarantee 0 blocking pairs"


def test_milp_social_welfare_optimality(sample_data):
    students, supervisors = sample_data
    engine = MatchingEngine(use_neural_embeddings=False)

    score_matrix = engine.compute_pairwise_scores(students, supervisors)
    res_milp = engine.allocate(students, supervisors, algorithm="milp", score_matrix=score_matrix)
    res_greedy = engine.allocate(students, supervisors, algorithm="greedy", score_matrix=score_matrix)

    # MILP maximizes global welfare; utility must be >= greedy
    assert res_milp.metrics.total_utility >= res_greedy.metrics.total_utility - 1e-3


def test_capacity_overflow_handling():
    students, supervisors = UniversityDataGenerator.generate_dataset(
        num_students=30,
        num_supervisors=4,
        seed=999,
    )
    total_quota = sum(s.quota for s in supervisors)
    assert len(students) > total_quota

    engine = MatchingEngine(use_neural_embeddings=False)
    result = engine.allocate(students, supervisors, algorithm="gale_shapley")

    assert len(result.pairs) == total_quota
    assert len(result.unassigned_student_ids) == len(students) - total_quota
