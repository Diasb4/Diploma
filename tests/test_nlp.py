import pytest
import numpy as np
from src.nlp.embedder import SemanticEmbedder


def test_preprocess_text():
    raw = "  Natural Language Processing (NLP) & Multi-Criteria Analysis! \n\n "
    cleaned = SemanticEmbedder.preprocess_text(raw)
    assert "natural language processing" in cleaned
    assert "nlp" in cleaned
    assert "!" not in cleaned


def test_tfidf_similarity_matrix():
    embedder = SemanticEmbedder(use_neural=False)
    students = [
        "Deep learning, computer vision, convolutional neural networks, image segmentation",
        "Cybersecurity, penetration testing, cryptography, network intrusion detection",
    ]
    supervisors = [
        "Computer vision, deep learning architectures, object detection, image classification",
        "Cryptography protocols, network security, reverse engineering, vulnerability analysis",
    ]

    sim = embedder.compute_similarity_matrix(students, supervisors)
    assert sim.shape == (2, 2)
    assert np.all(sim >= 0.0) and np.all(sim <= 1.0)
    assert sim[0, 0] > sim[0, 1]
    assert sim[1, 1] > sim[1, 0]


def test_keyword_extraction():
    text_a = "Deep learning and natural language processing for academic recommendations"
    text_b = "Evaluating deep learning transformer architectures for text mining"
    common = SemanticEmbedder.extract_common_keywords(text_a, text_b)
    assert "deep" in common or "learning" in common
