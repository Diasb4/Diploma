# Literature Review: Student-Supervisor Matching, Text Similarity and Multi-Criteria Decision Making

Project: Multi-Criteria Academic Supervisor Assignment System (MAS)

Authors: Ardak Avissauly, Nurzhan Zhumabekov, Dias Tursynbai

Astana IT University, October 2026

Task: MAS-3, Systematic Literature Review

## 1. Introduction

MAS has three main parts. First, it compares a student's thesis proposal with the research profiles of supervisors using text similarity. For this it uses sentence embeddings: numeric vectors that represent the meaning of a text, so that texts with similar meaning get similar vectors. Second, it combines several criteria (topic fit, the student's own ranking of supervisors, GPA) into one score, which is a multi-criteria decision making (MCDM) task. Third, it assigns students to supervisors with a stable matching algorithm that respects supervisor quotas.

This review answers three questions:

1. Which algorithms can assign students to supervisors under quotas, and what do they guarantee?
2. How can we measure how well a student's topic fits a supervisor?
3. How can several criteria be combined into one score, and is this connected to the assignment step?

## 2. How the Sources Were Selected

We searched Google Scholar, ACL Anthology, arXiv, ScienceDirect, SpringerLink, IOPscience, DOAJ and the repository of SDU University (Kazakhstan). The main keywords were "student-project allocation", "stable matching", "Gale-Shapley", "reviewer assignment", "thesis supervisor recommendation", "sentence embeddings", "SBERT", "MCDM", "AHP" and "TOPSIS".

A paper was selected if:

- it is a peer-reviewed journal or conference paper;
- it deals with assigning students to supervisors, projects or reviewers, with text similarity for expertise matching, or with MCDM for supervisor selection;
- it was published in 2021-2026, or it is an older paper that is the original source of a method we use or describes a known problem of such a method;
- its full text is available and written in English.

The searches returned 114 unique records. After reading titles and abstracts, 33 of them were relevant and could be verified. From these we kept the 15 papers that are most reliable and most useful for MAS: 10 papers from 2021-2026 and 5 older foundational papers. All numbers quoted below were checked against the full texts of the papers.

## 3. Comparative Matrix

| # | Authors (year) | Topic | Methods | Pros | Cons |
|---|---|---|---|---|---|
| [1] | Gale & Shapley (1962) | Stable matching with quotas (college admissions) | One side proposes in order of preference, and the other side keeps only the best offers received so far (deferred acceptance) | Always finds a stable matching; the result is the best possible for the side that makes the proposals | Both sides need full preference lists; a stable result is not necessarily a good topic fit |
| [2] | Abraham, Irving & Manlove (2007) | Student-project allocation (SPA) with lecturer capacities | Two fast stable matching algorithms | Fast; one version is best for all students, the other for all lecturers | Lecturers must rank students; no ties allowed |
| [3] | Manlove, Milne & Olaosebikan (2022) | SPA where lecturers rank projects | Exact optimisation model (integer programming) compared with faster algorithms that give approximate results | Exact model; solved instances with 2,500 students in about 13 seconds; the approximation results were very close to optimal | In general there is no fast way to find the largest stable matching |
| [4] | Olaosebikan & Manlove (2022) | SPA with ties in preferences | Fast algorithm for a matching that stays stable even when some options have equal rank | Works with ties | Such a matching often does not exist when the students' lists contain ties |
| [5] | Serek & Zhaparov (2023) | Student-supervisor matching (SDU University, Kazakhstan) | One-to-many Gale-Shapley compared with K-Means | More even workload: at most 6 students per supervisor against 15 with K-Means | Small questionnaire data (130 answers); the preference satisfaction metric is described inconsistently; thesis topics are not used |
| [6] | Liu, Yue, Hu & Tao (2025) | Matching of graduate students and supervisors | MCDM methods (TOPSIS and others) turn both sides' evaluations into satisfaction scores; an optimisation model then finds a stable matching | The only paper we found that combines MCDM with stable matching | Needs manual evaluations from both sides; tested only on 8 students and 4 supervisors |
| [7] | Stelmakh, Shah & Singh (2021) | Assigning reviewers to conference papers | Similarity scores and an algorithm that gives the best possible reviewers to the paper that is worst off | Proven guarantees for fairness and accuracy | One-sided (papers do not rank reviewers); no stability |
| [8] | Carpenter, Corvillón & Shah (2025) | Assigning reviewers at the ALMA observatory | Topic modelling (finding the main topics of texts) and the assignment algorithm of [7] | Used in practice: median topic-expertise similarity up by 51 percentage points, 3-5 days of manual work saved | Uses topic models, not sentence embeddings; astronomy domain |
| [9] | Reimers & Gurevych (2019) | Semantic similarity of sentences | Sentence-BERT (SBERT) | Finding the most similar pair among 10,000 sentences takes about 5 seconds instead of 65 hours with plain BERT | Quality depends on the training domain |
| [10] | Muennighoff et al. (2023) | Benchmark of text embedding models (MTEB) | 58 datasets, 8 task types, 112 languages | Common way to compare models | No model is the best on all tasks |
| [11] | Wang et al. (2025) | Advisor recommendation | BERT model further trained to produce sentence embeddings (SimCSE) | Better than TF-IDF (hit rate in the top 10: 0.51 against 0.41), other word-based methods and large language models used without extra training | Chinese texts only; no capacity limits |
| [12] | Damayanti, Purwani & Kadafi (2025) | Supervisor recommendation | TF-IDF, K-means clustering, cosine similarity | Simple and transparent web system | Only 21 lecturers; accuracy is not measured; ignores supervisor capacity and student preferences |
| [13] | Taherdoost & Madanchian (2023) | Overview of MCDM | Review of AHP, TOPSIS and other methods | Clear classification of methods | General overview, not about matching |
| [14] | Hasan & Schwartz (2019) | PhD supervisor selection | Criteria weights from a student survey (fuzzy AHP) and keyword-based text search (TF-IDF, BM25) | Combines MCDM with text search; topic relevance received the largest weight (0.54) | Word-based search; ranks for one student at a time, without capacity |
| [15] | García-Cascales & Lamata (2012) | Ranking changes in TOPSIS (rank reversal) | Analysis of the problem and a modified TOPSIS | Explains when TOPSIS rankings change order | Not about supervisor selection |

## 4. Critical Synthesis

### 4.1 Gale-Shapley and stable matching

Gale-Shapley and its SPA versions [1], [2] always give a stable result that respects quotas. Stable means that no student and supervisor would both prefer each other to their current assignment, which makes the result easy to justify. A study from Kazakhstan [5] also showed that Gale-Shapley spreads the workload more evenly than clustering, although its data set is small.

Gaps:

1. Preferences come from outside. All matching papers [1]-[5] take preference lists as input or build them from questionnaires, never from the thesis topics. A stable result can therefore still be a poor topic fit.
2. Supervisors do not rank students in practice. The SPA model [2] needs every lecturer to rank students, and [6] needs manual evaluations from both sides. MAS can build the supervisor-side ranking automatically from topic similarity and GPA.
3. Ties cause problems. When several options have the same rank, there is in general no fast way to find the largest stable matching [3], and a matching that stays stable for every way of breaking the ties often does not exist [4]. Such a matching exists much more often when ties appear only on the lecturers' side (74% of random instances with 1,000 students) [4]. In MAS students give a strict ranking, and we will add a fixed tie-breaking rule for supervisors: exact score, then GPA, then submission time.
4. Stability is only one kind of fairness. The reviewer assignment method [7] instead tries to give the best possible result to the paper that is worst off. We will therefore compare Gale-Shapley with an exact optimisation model (integer linear programming, ILP) and a simple greedy assignment.

### 4.2 SBERT and semantic matching

SBERT [9] makes it fast to compare many texts by meaning. The clearest evidence for this approach is [11]: a BERT model specially trained for sentence similarity gave better recommendations than TF-IDF and other word-based methods. Large language models used without such training did even worse than TF-IDF.

Gaps:

1. Most supervisor recommenders still use word overlap. Both [12] and [14] use keyword-based methods (TF-IDF or BM25), which only count shared words and miss synonyms and paraphrases.
2. Evaluation is weak. [12] does not measure accuracy at all, and in [11] the ground truth is the list of advisors the students wanted. The reviewer assignment system [8] compared its results with the previous cycle, when assignments were based on keywords and mismatches were fixed by hand. We want to evaluate MAS in the same way, against the previous year's assignments.
3. Our languages are not tested. No reviewed study used Russian or Kazakh texts, and according to MTEB [10] no model is the best on every task. The model therefore has to be tested on AITU data.
4. Recommenders do not assign. [11], [12] and [14] give each student a list of supervisors but do not consider supervisor capacity.

### 4.3 MCDM

AHP and TOPSIS are among the most widely used MCDM methods [13], and AHP has also been applied to supervisor selection [14]. In [14] topic relevance was the most important criterion for students.

Gaps:

1. MCDM ranks but does not assign. [14] ranks supervisors for each student separately, so nothing stops all students from choosing the same supervisor. Only [6] adds a stability constraint, but it relies on manual evaluations.
2. Weights are fixed and subjective. In [14] the weights come from a survey of 28 students, but the students were more satisfied when they could choose the criteria themselves. The effect of the weights on the result therefore has to be checked.
3. TOPSIS can change its ranking when an alternative is added or removed [15], for example when a supervisor joins or leaves. A simple weighted sum does not have this problem and is easier to explain.
4. Topic fit is measured with word search [14]. Sentence embeddings can measure it more precisely [11].

### 4.4 Summary

| Gap | Evidence | How MAS addresses it |
|---|---|---|
| Stable matching ignores thesis topics | [1]-[5] | Topic similarity is part of the score used for ranking |
| Supervisors do not rank students by hand | [2], [6] | Supervisor-side ranking is computed automatically |
| Recommenders ignore supervisor capacity | [11], [12], [14] | Gale-Shapley assignment with fixed quotas |
| Word-based text matching | [12], [14] | Multilingual sentence embeddings |
| Fixed weights; TOPSIS rankings change when a supervisor is added or removed | [14], [15] | Simple weighted sum with sensitivity analysis |

None of the reviewed papers combines all three parts: text similarity, a multi-criteria score and stable matching with quotas. This is the gap that MAS addresses.

## 5. Next Steps

- Technology selection (MAS-4): compare TF-IDF, a multilingual SBERT model and the OpenAI embeddings API on AITU data; use Gale-Shapley as the main algorithm and ILP (PuLP) and greedy assignment for comparison; use a weighted sum instead of TOPSIS.
- Evaluation plan (MAS-5): measure Top-k Recall against past assignments, first-choice satisfaction and workload balance (maximum number of students per supervisor), and check how the results change with different weights.

## 6. Limitations

We did not search Scopus or Web of Science directly, so some papers may be missing. Two papers from 2025 that may be close to our work (on supervisor allocation with LLMs and linear programming, and on SBERT combined with Gale-Shapley) were excluded because we could not confirm their authors or method. One included paper [12] uses a small dataset, so we use it only as an example of the typical TF-IDF approach.

## References

[1] Gale, D., & Shapley, L. S. (1962). College admissions and the stability of marriage. *The American Mathematical Monthly*, 69(1), 9-15.

[2] Abraham, D. J., Irving, R. W., & Manlove, D. F. (2007). Two algorithms for the Student-Project Allocation problem. *Journal of Discrete Algorithms*, 5(1), 73-90. https://doi.org/10.1016/j.jda.2006.03.006

[3] Manlove, D., Milne, D., & Olaosebikan, S. (2022). Student-project allocation with preferences over projects: Algorithmic and experimental results. *Discrete Applied Mathematics*, 308, 220-234.

[4] Olaosebikan, S., & Manlove, D. (2022). Super-stability in the student-project allocation problem with ties. *Journal of Combinatorial Optimization*, 43(5), 1203-1239. https://doi.org/10.1007/s10878-020-00632-x

[5] Serek, A., & Zhaparov, M. (2023). Algorithm comparison for student-supervisor matching in supervisorship system development: K-Means vs. one-to-many Gale-Shapley. *Information Sciences Letters*, 12(12), 2417-2425. https://doi.org/10.18576/isl/121205

[6] Liu, X., Yue, Q., Hu, B., & Tao, Y. (2025). Graduate students and supervisors matching decision-making considering stability-based fairness based on TOPSIS and grey correlation degrees. *Scientific Reports*, 15, 22902. https://doi.org/10.1038/s41598-025-00388-6

[7] Stelmakh, I., Shah, N. B., & Singh, A. (2021). PeerReview4All: Fair and accurate reviewer assignment in peer review. *Journal of Machine Learning Research*, 22(163), 1-66.

[8] Carpenter, J. M., Corvillón, A., & Shah, N. B. (2025). Enhancing peer review in astronomy: A machine learning and optimization approach to reviewer assignments for ALMA. *Publications of the Astronomical Society of the Pacific*, 137, 034501. https://doi.org/10.1088/1538-3873/adb5c1

[9] Reimers, N., & Gurevych, I. (2019). Sentence-BERT: Sentence embeddings using Siamese BERT-networks. In *Proceedings of EMNLP-IJCNLP 2019* (pp. 3982-3992).

[10] Muennighoff, N., Tazi, N., Magne, L., & Reimers, N. (2023). MTEB: Massive Text Embedding Benchmark. In *Proceedings of EACL 2023* (pp. 2014-2037). https://doi.org/10.18653/v1/2023.eacl-main.148

[11] Wang, X., Zhou, J., Jian, L., Yin, Y., & Li, L. (2025). Empowering college students to select ideal advisors: A text-based recommendation model. *Frontiers in Education*, 10, 1673956. https://doi.org/10.3389/feduc.2025.1673956

[12] Damayanti, A., Purwani, F., & Kadafi, M. (2025). A content-based thesis supervisor recommendation system based on research interest clustering and cosine similarity. *JUSIFO: Jurnal Sistem Informasi*, 11(2), 111-120. https://doi.org/10.19109/jusifo.v11i2.27605

[13] Taherdoost, H., & Madanchian, M. (2023). Multi-criteria decision making (MCDM) methods and concepts. *Encyclopedia*, 3(1), 77-87. https://doi.org/10.3390/encyclopedia3010006

[14] Hasan, M. A., & Schwartz, D. G. (2019). A multi-criteria decision support system for Ph.D. supervisor selection: A hybrid approach. In *Proceedings of the 52nd Hawaii International Conference on System Sciences* (pp. 1823-1832). https://doi.org/10.24251/HICSS.2019.220

[15] García-Cascales, M. S., & Lamata, M. T. (2012). On rank reversal and TOPSIS method. *Mathematical and Computer Modelling*, 56(5-6), 123-132. https://doi.org/10.1016/j.mcm.2011.12.022
