from abc import ABC, abstractmethod
from typing import List, Dict, Tuple, Optional
import time

from src.models.entities import (
    StudentProfile,
    SupervisorProfile,
    PairwiseScore,
    AllocationPair,
    AllocationResult,
)
from src.evaluation.metrics import MetricsCalculator


class BaseAllocator(ABC):
    def __init__(self, name: str):
        self.name = name

    @abstractmethod
    def _run_allocation(
        self,
        students: List[StudentProfile],
        supervisors: List[SupervisorProfile],
        score_matrix: Dict[Tuple[str, str], PairwiseScore],
    ) -> Tuple[List[AllocationPair], List[str], Dict[str, int]]:
        pass

    def allocate(
        self,
        students: List[StudentProfile],
        supervisors: List[SupervisorProfile],
        score_matrix: Dict[Tuple[str, str], PairwiseScore],
    ) -> AllocationResult:
        start_time = time.perf_counter()

        pairs, unassigned_ids, remaining_quotas = self._run_allocation(
            students=students,
            supervisors=supervisors,
            score_matrix=score_matrix,
        )

        elapsed_ms = (time.perf_counter() - start_time) * 1000.0

        self.validate(pairs, students, supervisors)

        metrics = MetricsCalculator.calculate_all(
            algorithm_name=self.name,
            pairs=pairs,
            students=students,
            supervisors=supervisors,
            score_matrix=score_matrix,
            unassigned_ids=unassigned_ids,
            execution_time_ms=elapsed_ms,
        )

        return AllocationResult(
            algorithm=self.name,
            pairs=pairs,
            unassigned_student_ids=unassigned_ids,
            supervisor_remaining_quotas=remaining_quotas,
            metrics=metrics,
        )

    @staticmethod
    def validate(
        pairs: List[AllocationPair],
        students: List[StudentProfile],
        supervisors: List[SupervisorProfile],
    ) -> None:
        assigned_students = [p.student_id for p in pairs]
        if len(assigned_students) != len(set(assigned_students)):
            raise ValueError("Invariant violated: student assigned multiple times.")

        supervisor_counts: Dict[str, int] = {}
        for p in pairs:
            supervisor_counts[p.supervisor_id] = supervisor_counts.get(p.supervisor_id, 0) + 1

        quota_map = {s.id: s.quota for s in supervisors}
        for sup_id, count in supervisor_counts.items():
            max_q = quota_map.get(sup_id, 0)
            if count > max_q:
                raise ValueError(f"Invariant violated: quota for {sup_id} exceeded ({count} > {max_q}).")
