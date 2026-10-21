from typing import List, Dict, Tuple, Set
import numpy as np
from scipy.optimize import milp, LinearConstraint, Bounds
from scipy.sparse import dok_matrix

from src.matching.base import BaseAllocator
from src.models.entities import (
    StudentProfile,
    SupervisorProfile,
    PairwiseScore,
    AllocationPair,
)


class MILPAllocator(BaseAllocator):
    """
    Mixed-Integer Linear Programming (MILP) solver maximizing Social Welfare.
    """

    def __init__(self, name: str = "MILP (Global Welfare Maximization)"):
        super().__init__(name=name)

    def _run_allocation(
        self,
        students: List[StudentProfile],
        supervisors: List[SupervisorProfile],
        score_matrix: Dict[Tuple[str, str], PairwiseScore],
    ) -> Tuple[List[AllocationPair], List[str], Dict[str, int]]:
        n = len(students)
        m = len(supervisors)

        if n == 0 or m == 0:
            return [], [s.id for s in students], {sup.id: sup.quota for sup in supervisors}

        student_map = {s.id: s for s in students}
        supervisor_map = {s.id: s for s in supervisors}

        num_vars = n * m
        c = np.zeros(num_vars, dtype=np.float64)

        for i, st in enumerate(students):
            for j, sup in enumerate(supervisors):
                var_idx = i * m + j
                utility = score_matrix[(st.id, sup.id)].total_score
                c[var_idx] = -utility

        integrality = np.ones(num_vars, dtype=np.int32)
        bounds = Bounds(lb=np.zeros(num_vars), ub=np.ones(num_vars))

        num_constraints = n + m
        A = dok_matrix((num_constraints, num_vars), dtype=np.float64)
        b_l = np.zeros(num_constraints, dtype=np.float64)
        b_u = np.zeros(num_constraints, dtype=np.float64)

        for i in range(n):
            for j in range(m):
                A[i, i * m + j] = 1.0
            b_l[i] = 0.0
            b_u[i] = 1.0

        for j, sup in enumerate(supervisors):
            row_idx = n + j
            for i in range(n):
                A[row_idx, i * m + j] = 1.0
            b_l[row_idx] = 0.0
            b_u[row_idx] = float(sup.quota)

        constraints = LinearConstraint(A.tocsc(), b_l, b_u)
        res = milp(c=c, integrality=integrality, bounds=bounds, constraints=constraints)

        pairs: List[AllocationPair] = []
        assigned_students: Set[str] = set()
        supervisor_assigned_count: Dict[str, int] = {sup.id: 0 for sup in supervisors}

        if res.success:
            x_sol = res.x.round().astype(int)
            for i, st in enumerate(students):
                for j, sup in enumerate(supervisors):
                    var_idx = i * m + j
                    if x_sol[var_idx] == 1:
                        score_obj = score_matrix[(st.id, sup.id)]
                        st_rank = None
                        if sup.id in st.preferred_supervisor_ids:
                            st_rank = st.preferred_supervisor_ids.index(sup.id) + 1

                        pairs.append(
                            AllocationPair(
                                student_id=st.id,
                                student_name=st.name,
                                supervisor_id=sup.id,
                                supervisor_name=sup.name,
                                match_score=score_obj.total_score,
                                student_rank_of_supervisor=st_rank,
                                supervisor_rank_of_student=None,
                            )
                        )
                        assigned_students.add(st.id)
                        supervisor_assigned_count[sup.id] += 1

        unassigned_ids = [s.id for s in students if s.id not in assigned_students]
        remaining_quotas = {
            sup.id: sup.quota - supervisor_assigned_count[sup.id]
            for sup in supervisors
        }

        return pairs, unassigned_ids, remaining_quotas
