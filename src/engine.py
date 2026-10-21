import logging
from typing import List, Dict, Tuple, Optional
import numpy as np

from src.models.entities import (
    StudentProfile,
    SupervisorProfile,
    CriteriaWeights,
    PairwiseScore,
    AllocationResult,
)
from src.nlp.embedder import SemanticEmbedder
from src.scoring.criteria import MultiCriteriaScorer
from src.matching.gale_shapley import GaleShapleyAllocator
from src.matching.milp_optimizer import MILPAllocator
from src.matching.greedy import GreedyAllocator

logger = logging.getLogger(__name__)


class MatchingEngine:
    """
    Main orchestration facade for MAS matching and allocation pipeline.
    """

    def __init__(
        self,
        weights: Optional[CriteriaWeights] = None,
        use_neural_embeddings: bool = False,
        use_topsis: bool = False,
        embedding_model_name: Optional[str] = None,
    ):
        self.weights = (weights or CriteriaWeights()).normalized()
        self.use_topsis = use_topsis
        self.embedder = SemanticEmbedder(
            model_name=embedding_model_name,
            use_neural=use_neural_embeddings,
        )
        self.scorer = MultiCriteriaScorer(weights=self.weights)

        self.allocators = {
            "gale_shapley": GaleShapleyAllocator(),
            "milp": MILPAllocator(),
            "greedy": GreedyAllocator(),
        }

    def compute_pairwise_scores(
        self,
        students: List[StudentProfile],
        supervisors: List[SupervisorProfile],
    ) -> Dict[Tuple[str, str], PairwiseScore]:
        if not students or not supervisors:
            return {}

        student_texts = [
            f"{s.interests_text} Skills: {' '.join(s.skills)}"
            for s in students
        ]
        supervisor_texts = [
            f"{' '.join(sup.research_topics)} {sup.publications_text} Requirements: {' '.join(sup.required_skills)}"
            for sup in supervisors
        ]

        sim_matrix = self.embedder.compute_similarity_matrix(student_texts, supervisor_texts)
        score_dict: Dict[Tuple[str, str], PairwiseScore] = {}

        for i, st in enumerate(students):
            for j, sup in enumerate(supervisors):
                c_sem = float(sim_matrix[i, j])
                score_obj = self.scorer.evaluate_pair(
                    student=st,
                    supervisor=sup,
                    semantic_sim=c_sem,
                    total_supervisors_count=len(supervisors),
                )
                score_dict[(st.id, sup.id)] = score_obj

        return score_dict

    def recommend_supervisors_for_student(
        self,
        student: StudentProfile,
        supervisors: List[SupervisorProfile],
        top_k: int = 5,
        score_matrix: Optional[Dict[Tuple[str, str], PairwiseScore]] = None,
    ) -> List[Tuple[SupervisorProfile, PairwiseScore]]:
        if score_matrix is None:
            score_matrix = self.compute_pairwise_scores([student], supervisors)

        sup_map = {s.id: s for s in supervisors}
        scored_pairs = [
            (sup_map[sup.id], score_matrix[(student.id, sup.id)])
            for sup in supervisors
            if (student.id, sup.id) in score_matrix
        ]

        scored_pairs.sort(key=lambda item: item[1].total_score, reverse=True)
        return scored_pairs[:top_k]

    def allocate(
        self,
        students: List[StudentProfile],
        supervisors: List[SupervisorProfile],
        algorithm: str = "gale_shapley",
        score_matrix: Optional[Dict[Tuple[str, str], PairwiseScore]] = None,
    ) -> AllocationResult:
        if algorithm not in self.allocators:
            raise ValueError(f"Unknown algorithm: '{algorithm}'. Available: {list(self.allocators.keys())}")

        if score_matrix is None:
            score_matrix = self.compute_pairwise_scores(students, supervisors)

        allocator = self.allocators[algorithm]
        return allocator.allocate(students, supervisors, score_matrix)

    def compare_all(
        self,
        students: List[StudentProfile],
        supervisors: List[SupervisorProfile],
    ) -> Dict[str, AllocationResult]:
        score_matrix = self.compute_pairwise_scores(students, supervisors)
        results = {}
        for algo_key, allocator in self.allocators.items():
            results[algo_key] = allocator.allocate(students, supervisors, score_matrix)
        return results
