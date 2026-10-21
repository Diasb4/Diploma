from typing import List, Dict, Tuple, Set
from src.matching.base import BaseAllocator
from src.models.entities import (
    StudentProfile,
    SupervisorProfile,
    PairwiseScore,
    AllocationPair,
)


class GaleShapleyAllocator(BaseAllocator):
    """
    Student-Proposing Deferred Acceptance algorithm with Quotas.
    Guarantees weak stability (zero blocking pairs) and student optimality.
    """

    def __init__(self, name: str = "Gale-Shapley (Student-Optimal)"):
        super().__init__(name=name)

    def _run_allocation(
        self,
        students: List[StudentProfile],
        supervisors: List[SupervisorProfile],
        score_matrix: Dict[Tuple[str, str], PairwiseScore],
    ) -> Tuple[List[AllocationPair], List[str], Dict[str, int]]:
        student_map = {s.id: s for s in students}
        supervisor_map = {s.id: s for s in supervisors}
        quotas = {s.id: s.quota for s in supervisors}

        student_preferences: Dict[str, List[str]] = {}
        for s in students:
            sorted_sups = sorted(
                supervisors,
                key=lambda sup: score_matrix[(s.id, sup.id)].total_score,
                reverse=True,
            )
            student_preferences[s.id] = [
                sup.id for sup in sorted_sups
                if score_matrix[(s.id, sup.id)].total_score > 0.0
            ]

        supervisor_preferences: Dict[str, List[str]] = {}
        supervisor_rank_lookup: Dict[str, Dict[str, int]] = {}
        for sup in supervisors:
            sorted_students = sorted(
                students,
                key=lambda st: score_matrix[(st.id, sup.id)].total_score,
                reverse=True,
            )
            supervisor_preferences[sup.id] = [
                st.id for st in sorted_students
                if score_matrix[(st.id, sup.id)].total_score > 0.0
            ]
            supervisor_rank_lookup[sup.id] = {
                st_id: rank + 1
                for rank, st_id in enumerate(supervisor_preferences[sup.id])
            }

        tentative_assignments: Dict[str, List[str]] = {sup.id: [] for sup in supervisors}
        next_proposal_idx: Dict[str, int] = {s.id: 0 for s in students}
        free_students: List[str] = [s.id for s in students]

        while free_students:
            s_id = free_students.pop(0)
            prefs = student_preferences[s_id]
            idx = next_proposal_idx[s_id]

            if idx >= len(prefs):
                continue

            target_sup_id = prefs[idx]
            next_proposal_idx[s_id] += 1

            current_pool = tentative_assignments[target_sup_id] + [s_id]
            sup_rank_map = supervisor_rank_lookup[target_sup_id]

            current_pool.sort(key=lambda st: sup_rank_map.get(st, 999999))

            capacity = quotas[target_sup_id]
            accepted = current_pool[:capacity]
            rejected = current_pool[capacity:]

            tentative_assignments[target_sup_id] = accepted

            for rej_id in rejected:
                if next_proposal_idx[rej_id] < len(student_preferences[rej_id]):
                    free_students.append(rej_id)

        pairs: List[AllocationPair] = []
        assigned_student_ids: Set[str] = set()
        remaining_quotas: Dict[str, int] = {}

        for sup_id, assigned_list in tentative_assignments.items():
            remaining_quotas[sup_id] = quotas[sup_id] - len(assigned_list)
            for s_id in assigned_list:
                assigned_student_ids.add(s_id)
                st_obj = student_map[s_id]
                sup_obj = supervisor_map[sup_id]
                score_obj = score_matrix[(s_id, sup_id)]

                st_rank = None
                if sup_id in student_preferences[s_id]:
                    st_rank = student_preferences[s_id].index(sup_id) + 1

                sup_rank = supervisor_rank_lookup[sup_id].get(s_id)

                pairs.append(
                    AllocationPair(
                        student_id=s_id,
                        student_name=st_obj.name,
                        supervisor_id=sup_id,
                        supervisor_name=sup_obj.name,
                        match_score=score_obj.total_score,
                        student_rank_of_supervisor=st_rank,
                        supervisor_rank_of_student=sup_rank,
                    )
                )

        unassigned_ids = [s.id for s in students if s.id not in assigned_student_ids]
        return pairs, unassigned_ids, remaining_quotas
