import pytest
import numpy as np
from src.models.entities import StudentProfile, SupervisorProfile, CriteriaWeights
from src.scoring.criteria import MultiCriteriaScorer


def test_skills_matching_with_taxonomy():
    scorer = MultiCriteriaScorer()
    student_skills = ["PyTorch", "Python", "Deep Learning"]
    supervisor_skills = ["Machine Learning", "Python"]

    score, matched = scorer.calculate_skills_score(student_skills, supervisor_skills)
    assert score > 0.7
    assert "python" in matched


def test_academic_scoring_with_threshold():
    scorer = MultiCriteriaScorer()
    sup_strict = SupervisorProfile(
        id="sup_1",
        name="Prof. Strict",
        quota=2,
        required_skills=[],
        research_topics=[],
        publications_text="",
        min_gpa=4.5,
    )

    st_high = StudentProfile(
        id="st_1",
        name="Honors Student",
        gpa=4.9,
        math_grade=5.0,
        programming_grade=5.0,
        interests_text="Data science",
    )
    st_low = StudentProfile(
        id="st_2",
        name="Average Student",
        gpa=3.2,
        math_grade=3.0,
        programming_grade=3.0,
        interests_text="Data science",
    )

    score_high = scorer.calculate_academic_score(st_high, sup_strict)
    score_low = scorer.calculate_academic_score(st_low, sup_strict)

    assert score_high > 0.8
    assert score_low < score_high
    assert 0.0 <= score_low <= 1.0


def test_topsis_properties():
    scorer = MultiCriteriaScorer()
    decision_matrix = np.array([
        [0.9, 0.95, 0.9, 0.85],
        [0.5, 0.5, 0.5, 0.5],
        [0.1, 0.15, 0.2, 0.1],
    ], dtype=np.float32)

    closeness = scorer.apply_topsis(decision_matrix)
    assert len(closeness) == 3
    assert closeness[0] > closeness[1] > closeness[2]
    assert np.all(closeness >= 0.0) and np.all(closeness <= 1.0)
