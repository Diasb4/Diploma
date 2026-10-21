import re
import logging
from typing import List, Dict, Optional, Tuple
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

logger = logging.getLogger(__name__)


class SemanticEmbedder:
    """
    Semantic text embedding and similarity search engine.
    Supports Sentence-Transformers with fast TF-IDF / BM25 fallback.
    """

    DEFAULT_NEURAL_MODEL = "paraphrase-multilingual-MiniLM-L12-v2"

    def __init__(
        self,
        model_name: Optional[str] = None,
        use_neural: bool = False,
        cache_dir: Optional[str] = None,
    ):
        self.use_neural = use_neural
        self.model_name = model_name or self.DEFAULT_NEURAL_MODEL
        self.cache_dir = cache_dir
        self._neural_model = None
        self._tfidf_vectorizer: Optional[TfidfVectorizer] = None

    def _get_neural_model(self):
        if self._neural_model is None and self.use_neural:
            try:
                from sentence_transformers import SentenceTransformer
                logger.info(f"Loading SentenceTransformer: {self.model_name}")
                self._neural_model = SentenceTransformer(
                    self.model_name,
                    cache_folder=self.cache_dir
                )
            except Exception as e:
                logger.warning(f"Could not load SentenceTransformer ({e}). Falling back to TF-IDF.")
                self.use_neural = False
        return self._neural_model

    @staticmethod
    def preprocess_text(text: str) -> str:
        if not text:
            return ""
        cleaned = text.lower()
        cleaned = re.sub(r"[^\w\s\-\.]", " ", cleaned)
        cleaned = re.sub(r"\s+", " ", cleaned).strip()
        return cleaned

    def encode_texts(self, texts: List[str]) -> np.ndarray:
        cleaned_texts = [self.preprocess_text(t) for t in texts]

        if self.use_neural:
            model = self._get_neural_model()
            if model is not None:
                embeddings = model.encode(
                    cleaned_texts,
                    convert_to_numpy=True,
                    normalize_embeddings=True,
                    show_progress_bar=False,
                )
                return np.asarray(embeddings, dtype=np.float32)

        if self._tfidf_vectorizer is None:
            self._tfidf_vectorizer = TfidfVectorizer(
                ngram_range=(1, 2),
                max_features=5000,
                sublinear_tf=True,
            )
            tfidf_matrix = self._tfidf_vectorizer.fit_transform(cleaned_texts)
        else:
            tfidf_matrix = self._tfidf_vectorizer.transform(cleaned_texts)

        dense = tfidf_matrix.toarray().astype(np.float32)
        norms = np.linalg.norm(dense, axis=1, keepdims=True)
        norms[norms == 0] = 1.0
        return dense / norms

    def compute_similarity_matrix(
        self,
        student_texts: List[str],
        supervisor_texts: List[str]
    ) -> np.ndarray:
        if not student_texts or not supervisor_texts:
            return np.zeros((len(student_texts), len(supervisor_texts)), dtype=np.float32)

        if self.use_neural:
            model = self._get_neural_model()
            if model is not None:
                s_emb = self.encode_texts(student_texts)
                t_emb = self.encode_texts(supervisor_texts)
                sim = np.dot(s_emb, t_emb.T)
                return np.clip((sim + 1.0) / 2.0 if np.any(sim < 0) else sim, 0.0, 1.0)

        all_texts = [self.preprocess_text(t) for t in student_texts + supervisor_texts]
        vec = TfidfVectorizer(ngram_range=(1, 2), sublinear_tf=True)
        all_matrix = vec.fit_transform(all_texts)

        n_s = len(student_texts)
        s_matrix = all_matrix[:n_s]
        t_matrix = all_matrix[n_s:]

        sim = cosine_similarity(s_matrix, t_matrix)
        return np.clip(sim.astype(np.float32), 0.0, 1.0)

    @staticmethod
    def extract_common_keywords(text_a: str, text_b: str, top_k: int = 5) -> List[str]:
        words_a = set(re.findall(r"\b[a-zA-Zа-яА-ЯёЁ]{3,}\b", text_a.lower()))
        words_b = set(re.findall(r"\b[a-zA-Zа-яА-ЯёЁ]{3,}\b", text_b.lower()))

        stopwords = {
            "для", "как", "так", "что", "это", "или", "при", "все", "его", "они",
            "под", "над", "тем", "раз", "научный", "исследование", "тема", "работа",
            "the", "and", "for", "with", "from", "that", "this", "using", "based"
        }
        common = [w for w in (words_a & words_b) if w not in stopwords]
        return common[:top_k]
