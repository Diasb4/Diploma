from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field


class StudentProfile(BaseModel):
    """
    Student profile model for thesis supervisor assignment.
    """
    id: str = Field(..., description="Unique student identifier")
    name: str = Field(..., description="Student full name")
    gpa: float = Field(..., ge=2.0, le=5.0, description="Grade point average (scale 2.0 to 5.0)")
    math_grade: float = Field(default=4.0, ge=2.0, le=5.0, description="Grade in mathematics / algorithms")
    programming_grade: float = Field(default=4.0, ge=2.0, le=5.0, description="Grade in software engineering")
    skills: List[str] = Field(default_factory=list, description="List of technical skills and competencies")
    interests_text: str = Field(..., description="Thesis proposal text, research interests, keywords")
    preferred_supervisor_ids: List[str] = Field(
        default_factory=list,
        description="Strictly ordered list of preferred supervisor IDs (1 to 5)"
    )
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Metadata (group, department)")


class SupervisorProfile(BaseModel):
    """
    Academic supervisor profile model.
    """
    id: str = Field(..., description="Unique supervisor identifier")
    name: str = Field(..., description="Supervisor full name")
    academic_title: str = Field(default="Senior Lecturer", description="Academic title / degree")
    department: str = Field(default="Software Engineering", description="Department / School")
    quota: int = Field(..., ge=1, description="Approved supervision capacity (quota)")
    min_quota: int = Field(default=0, ge=0, description="Minimum workload target")
    required_skills: List[str] = Field(default_factory=list, description="Desired technical skills")
    research_topics: List[str] = Field(default_factory=list, description="Key research topics")
    publications_text: str = Field(..., description="Publication abstracts and grant project text")
    min_gpa: float = Field(default=3.0, ge=2.0, le=5.0, description="Minimum GPA threshold")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Metadata")


class CriteriaWeights(BaseModel):
    """
    Weights for multi-criteria scoring policy (normalized to sum to 1.0).
    """
    semantic_similarity: float = Field(default=0.40, ge=0.0)
    skills_match: float = Field(default=0.25, ge=0.0)
    academic_performance: float = Field(default=0.20, ge=0.0)
    student_preference: float = Field(default=0.15, ge=0.0)

    def normalized(self) -> "CriteriaWeights":
        total = (
            self.semantic_similarity
            + self.skills_match
            + self.academic_performance
            + self.student_preference
        )
        if total <= 0:
            return CriteriaWeights(
                semantic_similarity=0.25,
                skills_match=0.25,
                academic_performance=0.25,
                student_preference=0.25,
            )
        return CriteriaWeights(
            semantic_similarity=self.semantic_similarity / total,
            skills_match=self.skills_match / total,
            academic_performance=self.academic_performance / total,
            student_preference=self.student_preference / total,
        )


class PairwiseScore(BaseModel):
    """
    Multi-criteria score for a specific (student, supervisor) pair.
    """
    student_id: str
    supervisor_id: str
    semantic_score: float = Field(..., ge=0.0, le=1.0)
    skills_score: float = Field(..., ge=0.0, le=1.0)
    academic_score: float = Field(..., ge=0.0, le=1.0)
    preference_score: float = Field(..., ge=0.0, le=1.0)
    total_score: float = Field(..., ge=0.0, le=1.0, description="Aggregated utility U_ij")
    explanation: Dict[str, Any] = Field(default_factory=dict)


class AllocationPair(BaseModel):
    """
    Assigned student-supervisor match outcome.
    """
    student_id: str
    student_name: str
    supervisor_id: str
    supervisor_name: str
    match_score: float
    student_rank_of_supervisor: Optional[int] = None
    supervisor_rank_of_student: Optional[int] = None


class AllocationMetrics(BaseModel):
    """
    Academic quantitative evaluation metrics.
    """
    algorithm_name: str
    total_students: int
    assigned_students: int
    unassigned_students: int
    assignment_rate: float
    total_utility: float
    mean_utility: float
    avg_student_rank: float
    top1_choice_percentage: float
    top3_choice_percentage: float
    quota_utilization_rate: float
    gini_coefficient: float
    blocking_pairs_count: int
    execution_time_ms: float


class AllocationResult(BaseModel):
    """
    Final output of an allocation solver run.
    """
    algorithm: str
    pairs: List[AllocationPair]
    unassigned_student_ids: List[str]
    supervisor_remaining_quotas: Dict[str, int]
    metrics: AllocationMetrics
