from typing import List, Dict, Tuple, Optional
import numpy as np

from src.models.entities import (
    StudentProfile,
    SupervisorProfile,
    PairwiseScore,
    AllocationPair,
    AllocationMetrics,
)


class MetricsCalculator:
    """
    Calculates academic evaluation metrics:
    - Social Welfare (Total Utility)
    - Student Satisfaction (Average Rank, % Top-1, % Top-3)
    - Quota Utilization Rate
    - Gini Inequality Coefficient
    - Stability Violation Rate (Blocking Pairs)
    """

    @classmethod
    def calculate_gini(cls, values: List[float]) -> float:
        if not values or len(values) < 2:
            return 0.0

        array = np.sort(np.asarray(values, dtype=np.float64))
        n = len(array)
        total = np.sum(array)
        if total <= 0:
            return 0.0

        index = np.arange(1, n + 1)
        gini = (2.0 * np.sum(index * array) - (n + 1) * total) / (n * total)
        return float(np.clip(gini, 0.0, 1.0))

    @classmethod
    def find_blocking_pairs(
        cls,
        pairs: List[AllocationPair],
        students: List[StudentProfile],
        supervisors: List[SupervisorProfile],
        score_matrix: Dict[Tuple[str, str], PairwiseScore],
    ) -> List[Tuple[str, str]]:
        student_match: Dict[str, str] = {p.student_id: p.supervisor_id for p in pairs}
        sup_matches: Dict[str, List[str]] = {s.id: [] for s in supervisors}
        for p in pairs:
            sup_matches[p.supervisor_id].append(p.student_id)

        blocking: List[Tuple[str, str]] = []

        for student in students:
            curr_sup_id = student_match.get(student.id)
            curr_utility = (
                score_matrix[(student.id, curr_sup_id)].total_score
                if curr_sup_id and (student.id, curr_sup_id) in score_matrix
                else 0.0
            )

            for supervisor in supervisors:
                if supervisor.id == curr_sup_id:
                    continue

                pair_key = (student.id, supervisor.id)
                if pair_key not in score_matrix:
                    continue

                potential_utility = score_matrix[pair_key].total_score

                if potential_utility > curr_utility + 1e-4:
                    assigned_to_sup = sup_matches[supervisor.id]

                    if len(assigned_to_sup) < supervisor.quota:
                        blocking.append((student.id, supervisor.id))
                        continue

                    worst_assigned_score = min(
                        score_matrix[(s_id, supervisor.id)].total_score
                        for s_id in assigned_to_sup
                    )

                    if potential_utility > worst_assigned_score + 1e-4:
                        blocking.append((student.id, supervisor.id))

        return blocking

    @classmethod
    def calculate_all(
        cls,
        algorithm_name: str,
        pairs: List[AllocationPair],
        students: List[StudentProfile],
        supervisors: List[SupervisorProfile],
        score_matrix: Dict[Tuple[str, str], PairwiseScore],
        unassigned_ids: List[str],
        execution_time_ms: float = 0.0,
    ) -> AllocationMetrics:
        total_students = len(students)
        assigned_students = len(pairs)
        assignment_rate = (
            (assigned_students / total_students * 100.0) if total_students > 0 else 0.0
        )

        utilities = [p.match_score for p in pairs]
        total_utility = float(np.sum(utilities)) if utilities else 0.0
        mean_utility = float(np.mean(utilities)) if utilities else 0.0

        ranks = [p.student_rank_of_supervisor for p in pairs if p.student_rank_of_supervisor is not None]
        avg_student_rank = float(np.mean(ranks)) if ranks else 0.0

        top1_count = sum(1 for r in ranks if r == 1)
        top3_count = sum(1 for r in ranks if r <= 3)

        top1_pct = (top1_count / assigned_students * 100.0) if assigned_students > 0 else 0.0
        top3_pct = (top3_count / assigned_students * 100.0) if assigned_students > 0 else 0.0

        total_quota = sum(s.quota for s in supervisors)
        quota_util_rate = (assigned_students / total_quota * 100.0) if total_quota > 0 else 0.0

        gini = cls.calculate_gini(utilities)
        blocking_pairs = cls.find_blocking_pairs(pairs, students, supervisors, score_matrix)

        return AllocationMetrics(
            algorithm_name=algorithm_name,
            total_students=total_students,
            assigned_students=assigned_students,
            unassigned_students=len(unassigned_ids),
            assignment_rate=round(assignment_rate, 2),
            total_utility=round(total_utility, 4),
            mean_utility=round(mean_utility, 4),
            avg_student_rank=round(avg_student_rank, 2),
            top1_choice_percentage=round(top1_pct, 2),
            top3_choice_percentage=round(top3_pct, 2),
            quota_utilization_rate=round(quota_util_rate, 2),
            gini_coefficient=round(gini, 4),
            blocking_pairs_count=len(blocking_pairs),
            execution_time_ms=round(execution_time_ms, 2),
        )
