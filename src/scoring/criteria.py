from typing import List, Dict, Tuple, Optional, Any
import numpy as np

from src.models.entities import (
    StudentProfile,
    SupervisorProfile,
    CriteriaWeights,
    PairwiseScore,
)


class MultiCriteriaScorer:
    """
    Multi-Criteria Decision Making (MCDM) scoring calculator.
    Implements weighted sum model and TOPSIS.
    """

    SKILL_TAXONOMY = {
        "machine learning": {"deep learning", "pytorch", "tensorflow", "scikit-learn", "nlp", "computer vision", "cv"},
        "deep learning": {"pytorch", "tensorflow", "keras", "neural networks", "cv", "nlp"},
        "nlp": {"natural language processing", "bert", "transformers", "llm", "text mining"},
        "computer vision": {"cv", "opencv", "yolo", "image processing", "object detection"},
        "backend": {"python", "fastapi", "django", "flask", "postgresql", "docker", "api"},
        "data science": {"pandas", "numpy", "matplotlib", "sql", "analysis", "statistics"},
        "frontend": {"javascript", "typescript", "react", "vue", "html", "css"},
        "cybersecurity": {"cryptography", "network security", "penetration testing", "reverse engineering"},
        "devops": {"docker", "kubernetes", "ci/cd", "linux", "ansible"},
    }

    def __init__(self, weights: Optional[CriteriaWeights] = None):
        self.weights = (weights or CriteriaWeights()).normalized()

    def calculate_skills_score(
        self,
        student_skills: List[str],
        supervisor_skills: List[str]
    ) -> Tuple[float, List[str]]:
        if not supervisor_skills:
            return 0.85, []

        s_skills = {s.lower().strip() for s in student_skills}
        t_skills = {t.lower().strip() for t in supervisor_skills}

        if not s_skills:
            return 0.1, []

        direct_matches = s_skills & t_skills
        matched_count = float(len(direct_matches))

        soft_matches = set()
        for t_skill in (t_skills - direct_matches):
            for parent_concept, children in self.SKILL_TAXONOMY.items():
                if (t_skill == parent_concept or t_skill in children) and (
                    any(s in children or s == parent_concept for s in s_skills)
                ):
                    matched_count += 0.5
                    soft_matches.add(t_skill)
                    break

        coverage = matched_count / max(len(t_skills), 1)
        score = min(max(coverage, 0.0), 1.0)
        all_matched = sorted(list(direct_matches | soft_matches))
        return float(score), all_matched

    @staticmethod
    def calculate_academic_score(
        student: StudentProfile,
        supervisor: SupervisorProfile
    ) -> float:
        normalized_gpa = (student.gpa - 2.0) / 3.0
        normalized_gpa = max(0.0, min(1.0, normalized_gpa))

        norm_math = max(0.0, min(1.0, (student.math_grade - 2.0) / 3.0))
        norm_prog = max(0.0, min(1.0, (student.programming_grade - 2.0) / 3.0))

        composite_academic = 0.5 * normalized_gpa + 0.25 * norm_math + 0.25 * norm_prog

        if student.gpa < supervisor.min_gpa:
            penalty = (supervisor.min_gpa - student.gpa) * 0.25
            composite_academic = max(0.05, composite_academic - penalty)

        return float(np.clip(composite_academic, 0.0, 1.0))

    @staticmethod
    def calculate_preference_score(
        student: StudentProfile,
        supervisor_id: str,
        total_supervisors: int
    ) -> Tuple[float, Optional[int]]:
        if not student.preferred_supervisor_ids:
            return 0.5, None

        try:
            rank = student.preferred_supervisor_ids.index(supervisor_id) + 1
            score = np.exp(-0.2 * (rank - 1))
            return float(np.clip(score, 0.1, 1.0)), rank
        except ValueError:
            return 0.15, None

    def evaluate_pair(
        self,
        student: StudentProfile,
        supervisor: SupervisorProfile,
        semantic_sim: float,
        total_supervisors_count: int = 10,
    ) -> PairwiseScore:
        c_semantic = float(np.clip(semantic_sim, 0.0, 1.0))
        c_skills, matched_skills = self.calculate_skills_score(
            student.skills, supervisor.required_skills
        )
        c_academic = self.calculate_academic_score(student, supervisor)
        c_pref, pref_rank = self.calculate_preference_score(
            student, supervisor.id, total_supervisors_count
        )

        w = self.weights
        total = (
            w.semantic_similarity * c_semantic
            + w.skills_match * c_skills
            + w.academic_performance * c_academic
            + w.student_preference * c_pref
        )
        total = float(np.clip(total, 0.0, 1.0))

        explanation = {
            "matched_skills": matched_skills,
            "pref_rank": pref_rank,
            "weights_used": w.model_dump(),
            "contributions": {
                "semantic": round(w.semantic_similarity * c_semantic, 4),
                "skills": round(w.skills_match * c_skills, 4),
                "academic": round(w.academic_performance * c_academic, 4),
                "preference": round(w.student_preference * c_pref, 4),
            },
        }

        return PairwiseScore(
            student_id=student.id,
            supervisor_id=supervisor.id,
            semantic_score=round(c_semantic, 4),
            skills_score=round(c_skills, 4),
            academic_score=round(c_academic, 4),
            preference_score=round(c_pref, 4),
            total_score=round(total, 4),
            explanation=explanation,
        )

    def apply_topsis(
        self,
        decision_matrix: np.ndarray,
        weights: Optional[np.ndarray] = None,
        is_benefit: Optional[List[bool]] = None,
    ) -> np.ndarray:
        if decision_matrix.size == 0:
            return np.array([])

        m, k = decision_matrix.shape
        if m == 1:
            return np.array([1.0], dtype=np.float32)

        norm_denom = np.sqrt(np.sum(decision_matrix ** 2, axis=0))
        norm_denom[norm_denom == 0] = 1.0
        r_matrix = decision_matrix / norm_denom

        if weights is None:
            w = np.array([
                self.weights.semantic_similarity,
                self.weights.skills_match,
                self.weights.academic_performance,
                self.weights.student_preference,
            ], dtype=np.float32)
        else:
            w = np.asarray(weights, dtype=np.float32)
        w = w / np.sum(w)

        v_matrix = r_matrix * w

        if is_benefit is None:
            is_benefit = [True] * k

        ideal_best = np.zeros(k, dtype=np.float32)
        ideal_worst = np.zeros(k, dtype=np.float32)

        for col in range(k):
            if is_benefit[col]:
                ideal_best[col] = np.max(v_matrix[:, col])
                ideal_worst[col] = np.min(v_matrix[:, col])
            else:
                ideal_best[col] = np.min(v_matrix[:, col])
                ideal_worst[col] = np.max(v_matrix[:, col])

        dist_best = np.sqrt(np.sum((v_matrix - ideal_best) ** 2, axis=1))
        dist_worst = np.sqrt(np.sum((v_matrix - ideal_worst) ** 2, axis=1))

        denom = dist_best + dist_worst
        denom[denom == 0] = 1.0
        closeness = dist_worst / denom
        return np.clip(closeness, 0.0, 1.0)
