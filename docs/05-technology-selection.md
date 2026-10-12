# Technology Selection and Trade-Offs

Project: Multi-Criteria Academic Supervisor Assignment System (MAS)

Authors: Ardak Avissauly, Nurzhan Zhumabekov, Dias Tursynbai

Astana IT University, October 2026

Task: MAS-4, Technology Selection and Trade-Offs

## 1. Purpose and Selection Criteria

This document compares the options for three parts of MAS and explains which tool we chose for each:

1. the NLP model that measures how well a thesis proposal fits a supervisor's research;
2. the algorithm that assigns students to supervisors;
3. the database that stores the data and the text embeddings.

The options are judged against the requirements in [06-requirements-spec.md](06-requirements-spec.md) and the findings of the literature review ([03-literature-review.md](03-literature-review.md)):

| Criterion | Source |
|---|---|
| Student proposals are processed locally, not by an external service | Requirements, section 2; AC-F15 |
| Recommendations within 5 seconds and an allocation within 60 seconds on 4 CPU cores and 8 GB RAM | NFR-03 |
| No duplicate assignments or capacity violations, and atomic publication | NFR-02, AC-N02 |
| The same input always gives the same result | NFR-05 |
| Stable allocation (no blocking pairs) | FR-08, AC-F08 |
| Texts may be in English, Russian or Kazakh; the scope of the first experiment is set in the proposal | AC-F05, proposal |
| Free, open-source tools that the team can run and maintain | Project constraints |

## 2. NLP Models

### 2.1 Options

| Option | How it works | Pros | Cons |
|---|---|---|---|
| TF-IDF (scikit-learn) | Represents a text by its words, weighted by how rare they are, and compares texts by shared words | Very fast; no model to download; easy to explain | Misses synonyms and paraphrases; texts in different languages share no words. For example, the English and Russian versions of "machine learning for medical images" get a similarity of 0.0 |
| Sentence-Transformers, paraphrase-multilingual-MiniLM-L12-v2 | A small neural model that turns a text into a 384-number vector that represents its meaning | Runs locally and quickly on a CPU; trained on more than 50 languages, including English and Russian | Kazakh is not in its training languages; it reads at most 128 tokens and cuts off the rest, so long abstracts are shortened |
| Sentence-Transformers, BAAI/bge-m3 | A larger multilingual model that produces 1024-number vectors | Supports more than 100 languages; reads up to 8,192 tokens, which covers a full abstract; runs locally | Larger and slower than MiniLM; its quality on Kazakh texts has not been measured by us yet |
| OpenAI embeddings API (text-embedding-3-small) | A cloud service that returns a 1536-number vector for a text | No model to host; reads up to 8,191 tokens; low price ($0.02 per million tokens, so 200 proposals of 2,000 tokens cost less than $0.01) | Proposals leave the university and are stored by OpenAI for up to 30 days for abuse monitoring; needs internet access and an API key; the model can change outside our control |

### 2.2 Decision

We use the Sentence-Transformers library with the BAAI/bge-m3 model as the main model. It replaces all-MiniLM-L6-v2, which the README listed as an early suggestion.

- Local processing. The model runs on our own server, so student proposals are not sent to an external service, as the requirements demand.
- Long texts. An abstract can have up to 5,000 characters (AC-F02). bge-m3 reads up to 8,192 tokens, while MiniLM stops after 128 tokens and would ignore most of a long abstract.
- Languages. bge-m3 supports more than 100 languages, so the same model works for English now and can be tested on Russian and Kazakh later. MiniLM was not trained on Kazakh.
- Evidence. In the literature review, sentence embeddings trained for similarity gave better supervisor recommendations than TF-IDF and than general large language models used as text encoders (review, section 4.2).
- Fallback. If bge-m3 is too slow on the reference hardware (NFR-03), we switch to paraphrase-multilingual-MiniLM-L12-v2 and record this decision. The model version is saved with every run (NFR-05), so the switch is traceable.

The other options keep a role:

- TF-IDF is the baseline in every recommendation experiment. In the study described in the literature review it did better than the other word-based methods and than large language models used without extra training, so a new model has to beat it to be worth using.
- The OpenAI API is included only in the offline comparison and only for texts that are authorized for external processing (AC-F15). It is not used in the running system.

The final choice between bge-m3 and MiniLM is confirmed by the Top-k Recall comparison described in the verification plan ([07-verification-plan.md](07-verification-plan.md)).

## 3. Allocation Algorithms

### 3.1 Options

| Option | How it works | Pros | Cons |
|---|---|---|---|
| Gale-Shapley (student-proposing) | Students apply to supervisors in the order of their lists; each supervisor keeps the best applicants up to capacity and rejects the rest | Always stable; gives every student the best result possible among stable allocations; simple and fast | Does not directly maximize any overall score |
| ILP with PuLP | Describes the allocation as an optimization problem (for example, maximize total satisfaction under capacity limits) and solves it with a solver | Can optimize any linear goal; supervisors' preferences and stability can be added as extra constraints [Manlove et al., 2022] | Slower and more complex than Gale-Shapley; needs a separate solver; a model without stability constraints can produce unstable results |
| Greedy heuristic | Takes student-supervisor pairs from the highest topic score down and assigns them while capacity is left | Very simple and fastest | No stability and no optimality guarantee |

### 3.2 Experiment

To compare the algorithms on equal terms, we ran them on the synthetic dataset from section 5 of the verification plan: 200 students, 25 supervisors in 5 research areas, capacities from 6 to 10, and preference lists of 1 to 5 supervisors. Each scenario was run with 5 random seeds, and the table shows the mean.

The experiment is a simplified scenario with its own ranking policy, not the full policy of AC-F07. Supervisors rank students by topic similarity only: there is no preference-rank term, GPA is not used, and no submission times are simulated. Equal scores are resolved by the lower student ID. The comparison with the full policy belongs to the evaluation in the verification plan.

The ILP in this experiment is an ILP without stability constraints. It maximizes preference satisfaction (5 points for a first choice, down to 1 point for a fifth choice) under the capacity limits and does not include the supervisors' preferences. It shows what happens when stability is not required, not the best that an ILP can do.

The script is [experiments/allocation_comparison.py](../experiments/allocation_comparison.py), and its library versions are pinned in [experiments/requirements.txt](../experiments/requirements.txt). It was run on 4 CPU cores (Intel Xeon, 2.8 GHz) with Python 3.13, PuLP 4.0.0, the HiGHS solver (highspy 1.15.1) and NumPy 2.5.4. Repeated runs gave the same metrics. PuLP 4.0 and NumPy 2.5 need Python 3.12 or newer, while the backend uses Python 3.11 (README). The experiment therefore runs in its own virtual environment, as described at the top of the script.

Main scenario (220 places for 200 students). For 30% of the students the generator moves one of three popular supervisors to the first place; together with students who chose them by topic, about 40% of all students rank a popular supervisor first:

| Method | Coverage | First-choice satisfaction | Mean preference rank | Mean topic score | Blocking pairs | Time |
|---|---|---|---|---|---|---|
| Gale-Shapley | 0.91 | 0.54 | 1.56 | 0.82 | 0 | under 0.01 s |
| ILP without stability constraints | 0.97 | 0.65 | 1.45 | 0.75 | 97 | about 0.1 s |
| Greedy by topic score | 0.91 | 0.34 | 2.18 | 0.84 | 85 | about 0.001 s |

The other scenarios showed the same pattern:

| Scenario | Gale-Shapley (coverage / first choice / blocking pairs) | ILP without stability constraints | Greedy |
|---|---|---|---|
| Shortage: 180 places | 0.83 / 0.45 / 0 | 0.86 / 0.61 / 158 | 0.83 / 0.31 / 58 |
| Popular supervisors: the generator moves a popular supervisor to the first place for 60% of students (about 66% rank one first) | 0.91 / 0.34 / 0 | 0.97 / 0.44 / 144 | 0.91 / 0.20 / 84 |

No method violated a capacity or assigned a supervisor outside a student's list. All methods finished far below the 60-second limit of NFR-03. These results come from synthetic data. They show how the algorithms behave, not how well they would work for real AITU students.

### 3.3 Decision

We use student-proposing Gale-Shapley as the main algorithm.

- Stability. It produced zero blocking pairs in every run. The requirements make stability a condition for publishing an allocation (AC-F08, AC-F10).
- Best stable result for students. Gale and Shapley proved that this algorithm gives every student the best outcome among all stable allocations [Gale and Shapley, 1962]. So no other stable allocation can be better for the students, and a more complex optimization method cannot improve on it without giving up stability.
- Speed and simplicity. It runs in milliseconds and needs no external solver.

The other options keep a role:

- The ILP without stability constraints shows the cost of stability. It reached higher coverage and first-choice satisfaction, but with about 100 to 160 blocking pairs and a lower topic score, because its model does not include the supervisors' preferences. An ILP with stability constraints is possible [Manlove et al., 2022], but by the result of Gale and Shapley it cannot give the students a better stable allocation than Gale-Shapley does. The ILP is therefore used only in the evaluation (AC-F15).
- The greedy heuristic is a simple baseline. It had the lowest first-choice satisfaction and many blocking pairs.

We use PuLP for the ILP because it is a free Python library that fits our Python backend. In PuLP 4.0 a plain installation contains only the modelling layer, and a solver has to be installed separately. We use the open-source HiGHS solver through the highspy package and pin both versions.

## 4. Storage

### 4.1 Options

| Option | How it works | Pros | Cons |
|---|---|---|---|
| PostgreSQL with pgvector | A relational database with an extension that adds a vector column type and similarity search | One database for users, cycles, preferences, snapshots, results, audit records and embeddings; transactions, foreign keys, unique constraints and row locks; cosine distance search; HNSW and IVFFlat indexes for vectors of up to 2,000 dimensions | Vector search is less specialized than in a dedicated vector database, which matters only for millions of vectors |
| ChromaDB | A dedicated open-source vector database (Apache 2.0) that runs embedded or as a server | Easy to start; built for embeddings; metadata filtering | Stores embeddings with their texts and metadata, but not relational data, so a second database is still needed for users, preferences and results; keeping two stores consistent makes input freezing and atomic publication harder |
| MongoDB (NoSQL) | A document database with vector search, available in the Atlas cloud service and, since June 2026, in the self-managed Community Edition | Flexible documents; supports multi-document transactions | Vector search runs in a separate search process (mongot) next to the database; the search component is licensed under the SSPL; rules such as "one supervisor per student" and capacity limits are easier to enforce with relational constraints |

### 4.2 Decision

We use PostgreSQL 16 with the pgvector extension.

- Integrity. Duplicate assignments and capacity violations must be rejected even if a request bypasses the user interface, and publication must be atomic (NFR-02, AC-N02). PostgreSQL handles the two rules in different ways:
  - One supervisor per student is a UNIQUE constraint on the student in each allocation run, so the database itself rejects a second assignment.
  - Capacity cannot be a simple CHECK constraint, because a CHECK constraint only sees the row being written and cannot count the other assignments of the same supervisor. Instead, every write of assignments happens in one transaction that first locks the affected supervisor rows with SELECT ... FOR UPDATE, then counts their assignments and rejects the change if a capacity would be exceeded. The lock makes a second parallel transaction wait until the first one is finished, so two writes cannot both pass the check. The batch allocation and the publication are each written in a single transaction, so a failure leaves no partial result.
- One store. Embeddings, proposals and frozen snapshots live in the same database and the same transaction. This makes it simple to freeze inputs and replay a run with exactly the same data (AC-F04, NFR-05).
- Enough for our size. A cycle has about 25 supervisor profiles and 200 proposals. pgvector can search such a small set exactly without any index, and its indexes support up to 2,000 dimensions, which covers bge-m3 (1024) and the OpenAI model (1536).
- Team familiarity. PostgreSQL is already part of the planned stack in the README, so the team needs to learn only one extension.

ChromaDB or MongoDB would make sense if the system had to search millions of documents or did not need strict relational rules. Neither applies to MAS.

## 5. Summary

| Area | Chosen tool | Role of the other options | Main reason |
|---|---|---|---|
| NLP model | Sentence-Transformers with BAAI/bge-m3 (fallback: paraphrase-multilingual-MiniLM-L12-v2) | TF-IDF as baseline; OpenAI API only in the offline comparison | Local processing, long inputs, multilingual support |
| Allocation | Student-proposing Gale-Shapley | ILP (PuLP with HiGHS) and greedy for comparison in the evaluation | Stable, best stable result for students, fast |
| Storage | PostgreSQL 16 with pgvector | ChromaDB and MongoDB not used | One transactional store for data and embeddings |

## 6. Risks and Checks

- bge-m3 speed. The model is larger than MiniLM. Its recommendation time will be measured in the load test (NFR-03); if it is too slow, we switch to MiniLM.
- Kazakh quality. Support for Kazakh in bge-m3 has not been measured on AITU texts. Language support is claimed only for languages that pass the evaluation (AC-F05).
- Synthetic data. The algorithm comparison uses synthetic data. It will be repeated on real data if the department gives access to past records.
- Library versions. PuLP 4.0 changed its API and solver packaging. All library versions are pinned so that the experiment can be repeated.

## References

- Gale, D., & Shapley, L. S. (1962). College admissions and the stability of marriage. *The American Mathematical Monthly*, 69(1), 9-15.
- Manlove, D., Milne, D., & Olaosebikan, S. (2022). Student-project allocation with preferences over projects: Algorithmic and experimental results. *Discrete Applied Mathematics*, 308, 220-234. (IP model with constraints that exclude blocking pairs, section 5.)
- Chen, J., Xiao, S., Zhang, P., Luo, K., Lian, D., & Liu, Z. (2024). M3-Embedding: Multi-linguality, multi-functionality, multi-granularity text embeddings through self-knowledge distillation. In *Findings of ACL 2024*. https://arxiv.org/abs/2402.03216
- Sentence-Transformers documentation, pretrained models (list of training languages of the multilingual models): https://www.sbert.net/docs/sentence_transformer/pretrained_models.html
- paraphrase-multilingual-MiniLM-L12-v2 model card and configuration: https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
- BAAI/bge-m3 model card: https://huggingface.co/BAAI/bge-m3
- OpenAI, how the API handles data: https://developers.openai.com/api/docs/guides/your-data
- pgvector: https://github.com/pgvector/pgvector
- PostgreSQL documentation, check constraints: https://www.postgresql.org/docs/16/ddl-constraints.html
- PostgreSQL documentation, explicit locking (row-level locks): https://www.postgresql.org/docs/16/explicit-locking.html
- Chroma: https://www.trychroma.com/
- MongoDB, Search and Vector Search for Community Edition: https://www.mongodb.com/products/updates/now-ga-mongodb-search-and-vector-search-for-community-edition/
- PuLP: https://pypi.org/project/PuLP/
- HiGHS: https://highs.dev/
