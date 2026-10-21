"""
MAS Core Software Package
Multi-Criteria Academic Supervisor Assignment System
"""

from src.models.entities import (
    StudentProfile,
    SupervisorProfile,
    CriteriaWeights,
    PairwiseScore,
    AllocationPair,
    AllocationMetrics,
    AllocationResult,
)
from src.engine import MatchingEngine
from src.generator.dataset_generator import UniversityDataGenerator

__version__ = "0.1.0"

__all__ = [
    "StudentProfile",
    "SupervisorProfile",
    "CriteriaWeights",
    "PairwiseScore",
    "AllocationPair",
    "AllocationMetrics",
    "AllocationResult",
    "MatchingEngine",
    "UniversityDataGenerator",
]
