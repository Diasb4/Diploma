from typing import List, Dict, Tuple, Set
from src.matching.base import BaseAllocator
from src.models.entities import (
    StudentProfile,
    SupervisorProfile,
    PairwiseScore,
    AllocationPair,
)


class GreedyAllocator(BaseAllocator):
    """
    Greedy GPA-Priority allocation baseline for diploma benchmark.
    """

    def __init__(self, name: str = "Greedy (GPA-Priority Baseline)"):
        super().__init__(name=name)

    def _run_allocation(
        self,
        students: List[StudentProfile],
        supervisors: List[SupervisorProfile],
        score_matrix: Dict[Tuple[str, str], PairwiseScore],
    ) -> Tuple[List[AllocationPair], List[str], Dict[str, int]]:
        student_map = {s.id: s for s in students}
        supervisor_map = {s.id: s for s in supervisors}
        remaining_quotas = {s.id: s.quota for s in supervisors}

        sorted_students = sorted(students, key=lambda s: (s.gpa, s.math_grade), reverse=True)

        pairs: List[AllocationPair] = []
        assigned_students: Set[str] = set()

        for st in sorted_students:
            desired_sups = sorted(
                supervisors,
                key=lambda sup: score_matrix[(st.id, sup.id)].total_score,
                reverse=True,
            )

            chosen_sup = None
            for sup in desired_sups:
                if remaining_quotas[sup.id] > 0:
                    chosen_sup = sup
                    break

            if chosen_sup is not None:
                remaining_quotas[chosen_sup.id] -= 1
                assigned_students.add(st.id)

                st_rank = None
                if chosen_sup.id in st.preferred_supervisor_ids:
                    st_rank = st.preferred_supervisor_ids.index(chosen_sup.id) + 1

                score_obj = score_matrix[(st.id, chosen_sup.id)]
                pairs.append(
                    AllocationPair(
                        student_id=st.id,
                        student_name=st.name,
                        supervisor_id=chosen_sup.id,
                        supervisor_name=chosen_sup.name,
                        match_score=score_obj.total_score,
                        student_rank_of_supervisor=st_rank,
                        supervisor_rank_of_student=None,
                    )
                )

        unassigned_ids = [s.id for s in students if s.id not in assigned_students]
        return pairs, unassigned_ids, remaining_quotas
