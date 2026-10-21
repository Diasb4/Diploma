import random
from typing import List, Tuple
from src.models.entities import StudentProfile, SupervisorProfile


class UniversityDataGenerator:
    """
    Synthetic dataset generator for university department benchmarking.
    """

    DOMAINS = [
        {
            "cluster": "NLP & Large Language Models",
            "keywords": ["NLP", "Transformers", "BERT", "LLM", "Text Generation", "Information Retrieval", "PyTorch"],
            "topics": [
                "Multilingual Question-Answering for Technical Academic Repositories",
                "Factuality Evaluation and Hallucination Detection in Generative LLMs",
                "Model Quantization and Knowledge Distillation for Edge NLP",
            ],
            "publications": (
                "Parameter-efficient fine-tuning with LoRA and QLoRA for domain-specific models. "
                "Semantic similarity retrieval over large-scale academic corpora using multilingual BERT. "
                "Contextual embedding models for text summarization."
            ),
        },
        {
            "cluster": "Computer Vision & Autonomous Systems",
            "keywords": ["Computer Vision", "CV", "OpenCV", "PyTorch", "YOLO", "Image Processing", "Object Detection"],
            "topics": [
                "Object Detection and Low-Light Scene Segmentation for Autonomous Mobile Platforms",
                "Video Pavement Defect Segmentation with Lightweight Neural Networks",
                "Real-Time Gesture Recognition for Human-Robot Collaboration",
            ],
            "publications": (
                "Deep convolutional architectures for small object detection. "
                "Self-supervised representation learning in computer vision. "
                "Semantic scene segmentation for robotics."
            ),
        },
        {
            "cluster": "Software Engineering & Distributed Systems",
            "keywords": ["Backend", "Python", "FastAPI", "Go", "Docker", "Kubernetes", "PostgreSQL", "Kafka", "Microservices"],
            "topics": [
                "High-Throughput Distributed Message Brokers for IoT Platforms",
                "Dynamic Container Orchestration and Autoscaling in Cloud Microservices",
                "Low-Latency Transaction Caching Service Architecture",
            ],
            "publications": (
                "High-availability distributed architectures with strict consistency guarantees. "
                "Performance bottleneck tracing in microservices using OpenTelemetry. "
                "Reliability engineering in cloud native backend systems."
            ),
        },
        {
            "cluster": "Cybersecurity & Network Defense",
            "keywords": ["Cybersecurity", "Network Security", "Cryptography", "Penetration Testing", "C++", "Reverse Engineering", "Linux"],
            "topics": [
                "Network Anomaly Detection and Distributed Attack Mitigation with Graph Neural Networks",
                "Automated Vulnerability Identification in Smart Contracts via Symbolic Execution",
                "Secure Multi-Party Computation Protocols for Educational Systems",
            ],
            "publications": (
                "Heuristic intrusion detection systems for enterprise perimeters. "
                "Post-quantum cryptography protocols for distributed ledgers. "
                "Binary analysis for malware identification."
            ),
        },
        {
            "cluster": "Data Science & Financial Analytics",
            "keywords": ["Data Science", "Pandas", "Scikit-learn", "Machine Learning", "SQL", "Statistics", "Time Series"],
            "topics": [
                "Volatility Forecasting in Financial Time Series via Hybrid ARIMA-LSTM Architectures",
                "Credit Risk Scoring on Imbalanced Financial Portfolios with Explainable AI",
                "Customer Churn Prediction and Intervention Recommender Systems",
            ],
            "publications": (
                "Machine learning methods for non-stationary financial time series. "
                "Interpretable credit scoring models using gradient boosted ensembles. "
                "High-dimensional statistical clustering."
            ),
        },
    ]

    FIRST_NAMES_M = ["Alexander", "Dmitry", "Maxim", "Sergey", "Andrey", "Alexey", "Ivan", "Mikhail", "Nikita", "Artem"]
    FIRST_NAMES_F = ["Anna", "Maria", "Elena", "Daria", "Anastasia", "Polina", "Ekaterina", "Sofia", "Olga", "Victoria"]
    LAST_NAMES = ["Tursynbai", "Zhumabekov", "Avissauly", "Smirnov", "Kuznetsov", "Popov", "Vasiliev", "Petrov", "Sokolov", "Mikhailov"]

    SUPERVISOR_TITLES = [
        ("Professor, Dr.Sci.", 4),
        ("Associate Professor, Ph.D.", 3),
        ("Senior Lecturer, M.Sc.", 3),
        ("Lead Researcher, Ph.D.", 4),
    ]

    @classmethod
    def _generate_name(cls) -> str:
        first = random.choice(cls.FIRST_NAMES_M + cls.FIRST_NAMES_F)
        last = random.choice(cls.LAST_NAMES)
        return f"{last} {first}"

    @classmethod
    def generate_dataset(
        cls,
        num_students: int = 40,
        num_supervisors: int = 12,
        seed: int = 42,
    ) -> Tuple[List[StudentProfile], List[SupervisorProfile]]:
        random.seed(seed)

        supervisors: List[SupervisorProfile] = []
        for i in range(num_supervisors):
            domain = cls.DOMAINS[i % len(cls.DOMAINS)]
            title, base_quota = random.choice(cls.SUPERVISOR_TITLES)
            quota = max(2, base_quota + random.randint(-1, 1))
            min_gpa = round(random.choice([3.0, 3.2, 3.5, 3.8]), 1)

            req_skills = random.sample(domain["keywords"], min(random.randint(3, 4), len(domain["keywords"])))

            sup = SupervisorProfile(
                id=f"sup_{i+1:02d}",
                name=f"{cls._generate_name()}",
                academic_title=title,
                department="Department of Software Engineering",
                quota=quota,
                min_quota=1,
                required_skills=req_skills,
                research_topics=domain["topics"],
                publications_text=domain["publications"],
                min_gpa=min_gpa,
                metadata={"cluster": domain["cluster"]},
            )
            supervisors.append(sup)

        students: List[StudentProfile] = []
        for i in range(num_students):
            target_domain = random.choice(cls.DOMAINS)
            gpa = round(min(5.0, max(3.0, random.gauss(4.2, 0.45))), 2)
            math_grade = round(min(5.0, max(3.0, random.gauss(gpa, 0.3))), 1)
            prog_grade = round(min(5.0, max(3.0, random.gauss(gpa, 0.3))), 1)

            student_skills = random.sample(
                target_domain["keywords"],
                min(random.randint(2, 4), len(target_domain["keywords"]))
            )

            chosen_topic = random.choice(target_domain["topics"])
            statement = (
                f"Thesis Proposal: '{chosen_topic}'. "
                f"Core research area: {target_domain['cluster']}. "
                f"Technical stack: {', '.join(student_skills)}."
            )

            compatible_sups = [
                s.id for s in supervisors
                if s.metadata.get("cluster") == target_domain["cluster"]
            ]
            other_sups = [s.id for s in supervisors if s.id not in compatible_sups]
            random.shuffle(compatible_sups)
            random.shuffle(other_sups)

            preferred = (compatible_sups + other_sups)[:random.randint(3, 5)]

            student = StudentProfile(
                id=f"stud_{i+1:03d}",
                name=f"{cls._generate_name()}",
                gpa=gpa,
                math_grade=math_grade,
                programming_grade=prog_grade,
                skills=student_skills,
                interests_text=statement,
                preferred_supervisor_ids=preferred,
                metadata={"target_cluster": target_domain["cluster"]},
            )
            students.append(student)

        return students, supervisors
