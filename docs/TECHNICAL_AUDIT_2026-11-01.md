# Технический аудит MAS — 1 ноября 2026 года

Проект: **Development of a Multi-Criteria System for Selecting and Assigning Academic Supervisors Based on Machine Learning Methods**.

**Вывод:** в репозитории есть работающее вычислительное ядро, небольшой набор unit-тестов, самостоятельный синтетический эксперимент и подробный проект будущей системы. Завершённой веб-платформы и достаточного подтверждения качества рекомендаций или пользы для AITU в проверенной рабочей копии нет. Более того, поведение основного matching pipeline расходится с зафиксированными требованиями: алгоритм меняет порядок предпочтений и допускает назначения вне поданного списка. Исправление этой семантики и измерений должно предшествовать новым заявлениям о качестве.

## 1. Границы проверки и сохранность исходников

Проверены исходники `src/`, все три файла тестов, оба файла зависимостей, эксперимент, README, план предзащиты, документы требований/исследования/технологий/оценивания/управления/консультаций, API-контракты, спецификации прототипа, исходные архитектурные схемы и генератор сводного отчёта. Поведение ключевых функций дополнительно проверено на примерах в памяти.

Исходники, конфигурации и тесты при аудите не редактировались. Добавлен только этот отчёт. Не устанавливались библиотеки, не скачивались модели, не запускался генератор PDF, не менялись Git-теги и не выполнялись операции с удалёнными сервисами.

- Проверенная версия HEAD: `6ed762be18b504bfe3e305b4031afa95f363788a`.
- Локальный `prob-period-1` указывает на тот же commit. В нескольких документах вместо него указан `d3be81d`; это подтверждённое расхождение локального тега и документации, а не заключение о состоянии remote.
- До аудита уже были изменения в 21 текстовом файле и удаление `SE-2407_SE-2420_SE-2411_Tursynbai_ProbPeriod1.pdf`. В текстовом diff добавлены завершающие пустые строки. Эти изменения не принадлежат аудиту и не отменялись.
- Семь пар документов с нумерованными и описательными именами побайтно одинаковы. В начале аудита деревья `prototype/` и `prototypes/` также были побайтно одинаковы. При завершающей проверке `prototype/` уже отсутствовал, а Git показывал удаление его восьми файлов; аудит не выполнял этого удаления. Ссылки ниже ведут на сохранившийся `prototypes/`, проверенные тексты совпадают с прочитанными копиями. Ссылки README на удалённый каталог требуют актуализации. Причина параллельного изменения рабочей копии не установлена.
- Выводы об отсутствии реализации относятся к этой рабочей копии. Другие ветки, remote, действующая доска YouTrack, внешний Figma-файл и возможные университетские развёртывания не проверялись. Отсутствие в репозитории не доказывает отсутствие у команды любых внешних материалов.
- Внешние утверждения обзора литературы и сравнения продуктов не проходили отдельную библиографическую проверку. Проверены их согласованность с остальными материалами и связь с реализацией.

## 2. Фактическая архитектура

| Слой | Что обнаружено | Оценка |
|---|---|---|
| Домен | Pydantic-модели студентов, руководителей, весов, score и результата | Реализованы для вычислительного прототипа; недостаточны для заявленного жизненного цикла |
| NLP | Sentence-Transformers adapter, TF-IDF, preprocessing, cosine similarity | Реализовано частично; по умолчанию используется TF-IDF |
| Scoring | Четыре критерия, объяснение вкладов, отдельная функция TOPSIS | Работает, но соответствует другой политике, чем требования |
| Matching | Gale–Shapley, SciPy MILP, GPA-priority greedy | Работают; допустимость пар и порядок студента расходятся с требованиями |
| Evaluation | Utility, rank, top-1/top-3, заполненность, Gini, blocking pairs | Реализовано частично; определения нескольких метрик ошибочны относительно спецификации |
| Эксперимент | Отдельные GS/ILP/greedy на синтетической числовой similarity matrix | Есть; основной код `src/` не используется |
| API и хранение | Не найдены FastAPI application/router, ORM, migrations, схема PostgreSQL, persistence | Отсутствуют в проверенной реализации |
| Frontend | SVG/PNG wireframes, текстовые спецификации и ссылка на Figma | Есть проект интерфейса; runnable React/Next.js приложения и `package.json` нет |
| Авторизация и цикл | Нет реализации accounts/sessions/RBAC, enrollment, deadline, freeze, publish, audit и CSV | Описаны в требованиях, не реализованы |
| Автоматизация | Девять pytest unit-тестов | Нет найденной CI-конфигурации, integration/E2E/load suites и lock-файла основного окружения |

Фасад — [src/engine.py](../src/engine.py), строки 26–45, 47–125. Проектная архитектура — [component-diagram.puml](../diagrams/src/component-diagram.puml), строки 13–28. [diagrams/README.md](../diagrams/README.md), строки 3 и 18, прямо предупреждает, что сервисы ещё не реализованы, а отдельные deployment не обязательны.

Практическое предложение для трёх человек: реализовать модульный FastAPI backend с одной PostgreSQL и отдельным web client; сохранить логические границы NLP, scoring, matching и публикации. Разносить их по отдельным микросервисам сейчас не требуется существующим proposal и увеличит объём интеграции. Это рекомендация, а не обнаруженный дефект.

## 3. Семь замечаний комиссии

### 3.1. Стабильность есть, качество рекомендаций не доказано

**Реализовано:** deferred acceptance с верхними квотами; тесты уникальности, квот и нуля blocking pairs; самостоятельный сравнительный синтетический эксперимент. Фрагменты GS и greedy из этого эксперимента воспроизведены на пяти seeds во всех трёх сценариях.

**Частично:** основное ядро считает score и метрики, но проверяет другую задачу, чем требования. В [gale_shapley.py](../src/matching/gale_shapley.py), строки 30–40, порядок студента заново строится по `total_score` среди всех руководителей. В строках 101–115 этот вычисленный порядок записывается как student rank. Поданный `preferred_supervisor_ids` не является предложенным порядком обхода и не ограничивает множество допустимых пар. Это противоречит AC-F07/F08 и разделу 7 [спецификации](06-requirements-spec.md), строки 119–130, 211–213.

[metrics.py](../src/evaluation/metrics.py), строки 53–84, также определяет предпочтения обеих сторон через `total_score`, без поданных списков и полного tie-breaking. Поэтому ноль blocking pairs в текущем unit-тесте не подтверждает стабильность относительно требуемых предпочтений.

**Не найдено:** evaluation runner рекомендаций, размеченный целевой корпус, фактические Recall@k/nDCG, сравнение embedding-моделей на одинаковом held-out наборе, независимая экспертная оценка, completed sensitivity study.

**Что менять:** `src/matching/gale_shapley.py`, `base.py`, `greedy.py`, `milp_optimizer.py`; `src/evaluation/metrics.py`; `src/engine.py`; `tests/test_matching.py`; добавить отдельные тесты метрик и воспроизводимый recommendation evaluation runner. Матрица допустимых пар и строгие порядки должны быть общими входами всех методов и независимого checker. Нельзя исправить доказательность простым увеличением числа synthetic seeds.

### 3.2. Практическая польза университету не подтверждена

**Реализовано как исследовательский материал:** документированы 12 ответов от 13 октября: 11 третьекурсников и один выпускник, неслучайная выборка; 11 из 12 договаривались с руководителем самостоятельно. Оценка полезности идеи — 4,1/5 по 11 ответам, 8 оценок 4 или 5. Исходные ответы в репозитории не находятся: документ говорит, что они остаются у команды. Основание — [relevance-interviews.md](02-relevance-interviews.md), строки 107–145.

**Частично:** есть явная матрица H1–H6 и ограничения. H1 не подтверждена выборкой; H2/H3 не проверены; H4–H6 подтверждены лишь частично. Это хороший фундамент для дальнейшей проверки, но не измеренный эффект работающей системы.

**Не найдено:** наблюдение реального процесса координатора, фактические трудозатраты до/после, завершённый пилот, измерение ошибок/ручных исправлений, подтверждение принятия системы кафедрой.

README, строки 25–38, утверждает перегрузку, 2–3 недели ручной работы и ожидаемые >90% top-3 увереннее, чем позволяют эти данные. Proposal, напротив, корректно называет проблему гипотезой и требует измеренного baseline: [01-proposal.md](01-proposal.md), строки 35–49, 175–185.

**Что менять:** README, разделы пользы в proposal, исследовательский документ, evaluation plan и сводный отчёт. Нужны реальные интервью/наблюдения и сопоставимый пилот. Код может измерять длительность операций, но не заменит baseline и решение кафедры использовать такой процесс.

### 3.3. Интервью с руководителями и координаторами не завершены

**Реализовано:** guide, роли P1/C1, 11 вопросов об организационной политике, правила анонимизации и шаблон фиксации выводов.

**Частично:** опрос студентов состоялся согласно исследовательскому документу. Отдельно есть журнал трёх консультаций с научным руководителем диплома, [supervisor-feedback.md](supervisor-feedback.md), строки 30–87. Это зафиксированные в репозитории консультации, а не автоматически проведённые discovery-интервью с представителями процесса.

**Не завершено по прямому указанию документа:** [02-relevance-interviews.md](02-relevance-interviews.md), строки 81–101, содержит `Not asked yet` и `not conducted yet` для P1/C1. Журнал консультаций этого не устраняет.

**Что менять после реальных встреч:** интервью records, validation matrix, policy decision register, requirements, prototype и план измерения пользы. Нельзя закрывать замечание вымышленными цитатами, переносом статуса Done с опроса или повторной генерацией текста.

### 3.4. Веса, GPA и tie-breaking не утверждены и реализованы иначе

**Реализовано:** настраиваемые четыре веса и их нормализация, academic composite, preference score; их поведение проверяется несколькими unit-тестами.

**Частично:** требования достаточно подробно описывают предлагаемую политику, но прямо помечают её как неутверждённую: [06-requirements-spec.md](06-requirements-spec.md), строки 8–16, 199–217. Нет записанного окончательного решения P1/C1.

| Аспект | Требования | Код |
|---|---|---|
| Критерии | topic, reciprocal preference rank, optional GPA | semantic 0,40; skills 0,25; academic 0,20; preference 0,15 — `entities.py:44–47` |
| Сумма весов | Неправильная сумма отклоняется с tolerance 1e-6 | Автонормализация; все нули заменяются четырьмя весами 0,25 — `entities.py:49–68` |
| Preference | `1 / rank`, только допустимые пары | `exp(-0.2*(rank-1))`; вне списка 0,15; пустой список 0,5 — `criteria.py:85–98` |
| GPA | Не требуется и не используется до approved/enabled | Обязательное поле 2–5; нет approval/enablement — `entities.py:11` |
| Шкала | Фиксированная утверждённая шкала | `(gpa-2)/3`, плюс math/programming и min-GPA penalty — `criteria.py:65–82`; simulation plan предлагает GPA 2–4 |
| Порядок студента | Поданный список сохраняется | Сортировка по общему score |
| Ties | exact score; enabled GPA; server accepted time; stable ID | Сортировка по округлённому score, затем фактически исходный порядок коллекции |
| Версии | Неизменяемая policy и snapshot | Полей/хранилища policy version, accepted timestamp и snapshot нет |

Связанные файлы: [entities.py](../src/models/entities.py), [criteria.py](../src/scoring/criteria.py), [engine.py](../src/engine.py), matching-модули, API-contracts и tests.

**Важно:** нельзя объявлять шкалу 2–5 ошибкой относительно реального регламента AITU: такой регламент аудитом не установлен. Обнаружено внутреннее расхождение со шкалой в simulation plan и отсутствие утверждённого источника. До решения разумно следовать уже предложенному GPA-disabled режиму; это всё равно должно быть явно записано как пилотная политика.

Отдельный вопрос для университета: использование времени подачи как tie-breaker может создавать стимул подавать список раньше, а новая подача теряет прежний timestamp. Разработчики могут реализовать правило, но его приемлемость и последствия должен подтвердить владелец процесса.

### 3.5. Embedding-модель не согласована

**Реализовано:** возможность передать имя модели и использовать SentenceTransformer; lexical fallback.

**Обнаружены три разных состояния:**

- [05-technology-selection.md](05-technology-selection.md), строки 44–57: основная модель `BAAI/bge-m3`, MiniLM как fallback.
- [embedder.py](../src/nlp/embedder.py), строки 17–26, и [engine.py](../src/engine.py), строки 26–38: default neural model — `paraphrase-multilingual-MiniLM-L12-v2`; neural mode по умолчанию выключен, фактически применяется TF-IDF.
- [allocation_comparison.py](../experiments/allocation_comparison.py), строки 53–61: embedding-модель вообще не запускается; similarity генерируется численно по совпадению research area и шуму. В этом эксперименте нет сравнения BGE с MiniLM.

**Частично:** альтернативную модель технически можно передать в конструктор. Это не доказывает, что BGE запускалась, оценивалась или была выбрана по результатам сравнения.

**Не найдено:** единая runtime-конфигурация выбранной модели, pinned revision весов, возвращаемые model/preprocessing versions, сохранение фактически использованного backend, результаты model comparison. При ошибке загрузки neural model код переключается на TF-IDF с warning, а `model_name` остаётся neural; в результате allocation вообще не содержит provenance модели. Это расходится с traceability и описанным API-поведением.

**Что менять:** `embedder.py`, `engine.py`, модели результатов/конфигурации, experiment runner, root dependencies, README и technology/evaluation docs. Утвердить один manifest: backend, model ID, revision, preprocessing version, cosine mapping, long-text policy, verified languages. Fallback не должен незаметно превращаться в эксперимент с другой моделью.

### 3.6. Валидация на целевых языках отсутствует

**Реализовано:** preprocessing сохраняет Unicode через `\w`; это не доказательство семантического качества. English-only toy TF-IDF test проверяет две пары текстов: [test_nlp.py](../tests/test_nlp.py), строки 14–29.

**Частично:** документы задают отдельные языковые и cross-language группы, запрет объявлять непроверенный язык поддержанным и unsupported-input response: [06-requirements-spec.md](06-requirements-spec.md), строки 103–109; [07-verification-plan.md](07-verification-plan.md), строки 153–161.

**Не найдено:** целевой English/Russian/Kazakh корпус с relevance labels, оценки по языковым группам, cross-language тесты, проверка neural inference, объявленная и проверяемая long-text стратегия, runtime проверка unsupported cases. Даже качество English neural-рекомендаций существующими тестами не подтверждается.

Вспомогательный keyword extractor использует `[a-zA-Zа-яА-ЯёЁ]`, поэтому не покрывает специфические казахские буквы полностью; выдача также берётся из неотсортированного set: `embedder.py:110–121`. Это ограничение вспомогательной функции, а не доказанная потеря казахских букв основным embedding preprocessing.

**Что менять:** NLP adapter, declaration/configuration поддерживаемых случаев, тесты, новый evaluation runner, разрешённый набор данных и отчёт по группам. Непредставленная в данных группа должна быть `unverified/N/A`, а не автоматически supported.

### 3.7. API и просмотр профилей не завершены

**Реализовано как проект:** три экрана в SVG/PNG, текстовые состояния и JSON-примеры. [prototypes/api-contracts.md](../prototypes/api-contracts.md), строки 1–3, прямо говорит, что это несогласованный draft, а не API implementation.

**Частично:** существуют доменные profile models и Python-метод recommendations. Они не являются HTTP CRUD, хранилищем профилей или web profile page. [prototypes/README.md](../prototypes/README.md), строка 71: содержание `View profile` ещё не определено.

**Не найдено:** runnable API/backend entrypoint, authentication, profile detail/list/edit endpoints, approval quotas, cycle/snapshot workflow, frontend pages и integration tests. Замечание шире нескольких недописанных endpoint: в этой копии application layer отсутствует целиком.

В draft есть proposal/preferences/recommendations/run/publish/export/audit examples, но нет полного контракта authentication, редактирования supervisor profile, управления enrollment/capacity approvals и role-specific published-result views. Для snapshot scores/rankings отсутствие readback endpoint отмечено самим draft, строка 445.

**Что менять/добавить:** согласовать `prototypes/api-contracts.md` и содержание profile page; добавить backend app, routes, application services, repositories, DB migrations и web client. Названия будущих директорий, например `src/api/`, `src/persistence/`, `frontend/`, являются предложением, а не уже обнаруженными модулями.

## 4. Дополнительные подтверждённые дефекты и ограничения

| ID | Приоритет | Факт и последствие | Место |
|---|---|---|---|
| F01 | P0 | Student order меняется, допускаются пары вне списка; `student_rank` у GS описывает score order. Сравнение satisfaction между GS и другими методами становится несопоставимым | `gale_shapley.py:30–40,101–115`; `greedy.py:51–53`; `milp_optimizer.py:82–84` |
| F02 | P0 | Checker проверяет общий score, а не strict submitted/supervisor rankings; tolerance 1e-4 также не равен сравнению готовых strict orders | `metrics.py:39–86` |
| F03 | P0 | Top-1/top-3 делятся на assigned, хотя требования включают unmatched. Средние при пустом наборе возвращают 0 вместо N/A | `metrics.py:99–119`; AC-F09 и evaluation plan |
| F04 | P0 | Neural cosine преобразуется в `(sim+1)/2` только если где-либо в batch есть отрицательный score. Значение уже существующей пары меняется при добавлении другого профиля | `embedder.py:97` |
| F05 | P0 | Combined score округляется до четырёх знаков до сортировки, теряя различия; ties зависят от порядка входа | `criteria.py:140–144`; sorting в matching и engine |
| F06 | P0 | Recommendation сортируется по mixed total_score, а AC-F05 требует semantic-score order с tie по supervisor ID | `engine.py:80–98` |
| F07 | P1 | `quota=0` запрещена моделью, хотя AC-F03 и тестовый план требуют её принимать и исключать такого руководителя | `entities.py:31`; AC-F03 |
| F08 | P1 | Модель принимает duplicate preferences, >5 IDs и пустые списки; GPA обязателен; нет принятой proposal структуры title/abstract/keywords | `entities.py:5–20`; внешний validation layer в коде не найден |
| F09 | P1 | Base validation проверяет только duplicate assignments и верхнюю квоту, не accepted-list membership, pair eligibility, согласованность assigned/unassigned roster или completeness входных scores | `base.py:65–82` |
| F10 | P1 | MILP/greedy рассматривают всех руководителей, а не общее допустимое множество; при неуспехе MILP возвращается результат с unmatched без явного solver-failure status | `milp_optimizer.py:38–69,75–106`; `greedy.py:34–45` |
| F11 | P1 | Время в `execution_time_ms` измеряет `_run_allocation`, исключая embedding, scoring, validation и metrics; оно не подтверждает end-to-end NFR | `base.py:34–54`; `engine.py:110–114` |
| F12 | P1 | `gini_coefficient` считается по assigned pair utilities, а не по загрузке руководителей; per-supervisor normalized loads и max workload отсутствуют в metrics DTO | `metrics.py:105,121`; `entities.py:98–115` |
| F13 | P1 | Для пустых/нетокенизируемых текстов TF-IDF выбрасывает `empty vocabulary`; нет предметной проверки usable text до вычисления | `embedder.py:99–101`; permissive text fields в entities |
| F14 | P2 | `use_topsis` сохраняется, но не меняет pipeline; `min_quota` объявлена, но не применяется allocator-ами | `engine.py:30,34`; `criteria.py:148–198`; `entities.py:32` |

F14 не означает, что необходимо реализовать TOPSIS или нижние квоты. Текущие требования выбирают weighted sum и верхние квоты; полезнее убрать вводящие в заблуждение возможности или документировать их экспериментальный статус.

### Риск недостоверного сводного отчёта

Генератор [build_consolidated_report.py](../build_consolidated_report.py) содержит отдельные жёстко записанные тексты и числовые таблицы. Он не является автоматическим достоверным объединением текущих Markdown и результатов experiments.

- Строки 390–406: все респонденты названы final-year; H2/H3 указаны partly verified, H6 strongly verified. Исследовательский документ содержит 11 третьекурсников и выпускника; H2/H3 — not tested, H6 — partly verified. Генератор дополнительно ссылается на сообщения координаторов, которых исследовательские records не содержат.
- Строки 479–498: ProjectAlloc описан как специализированная система из Glasgow. Текущий [existing-systems.md](04-existing-systems.md), строка 52, прямо исключает его как неподтверждённый и рассматривает другие инструменты. Аудитом установлено противоречие документов, а не проведена независимая проверка происхождения продукта.
- Строки 737–748: зашита другая таблица для 45 студентов/12 руководителей с 27 blocking pairs greedy и выводом о превосходстве GS. Активный эксперимент использует 200/25 и другую политику. Источник/seed этой таблицы не указан в данном блоке, и её значения не подтверждены этим аудитом.
- Строки 81, 227, 839: зашит `d3be81d`, не совпадающий с текущим локальным release tag.
- Строки 12, 30–33: жёсткие пути к пользовательскому каталогу и Windows fonts; переносимость PDF build на другую машину не обеспечена самим скриптом.

К текущему PDF нет файла для просмотра в рабочей копии: Git фиксирует его ранее существовавшее удаление. Генератор не запускался, PDF не восстанавливался. Выявленные проблемы относятся к исходнику генератора и текстовым материалам. Перед новой сдачей этот канал публикации необходимо синхронизировать с проверяемыми источниками и результатами.

## 5. Что проверено исполнением

Окружение: Windows 11, Python 3.14.7; NumPy 2.5.1, SciPy 1.18.1, scikit-learn 1.9.1, Pydantic 2.13.4, pytest 9.1.1; установлены Sentence-Transformers 6.1.0 и Torch 2.14.0. Neural weights не загружались и inference реальной embedding-модели не выполнялся. PuLP и highspy в текущем interpreter отсутствуют. Это окружение аудита, не воспроизведённое reference environment из документации.

1. `rtk proxy python -B -X utf8 -m pytest tests -q -p no:cacheprovider` — **9 passed in 16.29s**. README ожидает <4 s, но различие среды не позволяет считать это доказанным нарушением NFR. Эти девять unit-тестов не покрывают application acceptance.
2. `rtk proxy python -B -X utf8 experiments/allocation_comparison.py` — остановка на `ModuleNotFoundError: No module named 'pulp'`. Это ограничение текущего окружения; оно не доказывает дефект PuLP-кода или фиктивность ранее записанных ILP-результатов.
3. GS и greedy из experiment выполнены отдельно: PuLP import исключён только из AST в памяти, исходный файл не изменён; ILP не запускался. Средние по seeds 1–5 совпадают с округлёнными таблицами technology selection:

| Сценарий | Метод | Coverage | First choice | Blocking pairs | Constraint violations |
|---|---|---:|---:|---:|---:|
| Main | GS | 0.908 | 0.542 | 0 | 0 |
| Main | Topic greedy | 0.909 | 0.337 | 85.2 | 0 |
| Shortage | GS | 0.830 | 0.451 | 0 | 0 |
| Shortage | Topic greedy | 0.830 | 0.310 | 57.8 | 0 |
| Popular | GS | 0.911 | 0.337 | 0 | 0 |
| Popular | Topic greedy | 0.913 | 0.204 | 83.8 | 0 |

Эти результаты подтверждают поведение отдельного синтетического алгоритмического эксперимента. Его `violations` проверяет квоты и принадлежность списку; не является полной проверкой всех правил будущей системы. Он не измеряет качество рекомендаций AITU, embedding inference или время web workflow.

4. Основное ядро на существующем generator: 25 студентов, 8 руководителей, seed 123, TF-IDF. GS назначил 25 студентов, из них одного вне поданного списка; показал top-1 72%, тогда как по исходным спискам top-1 — 56% от тех же 25. Reported blocking pairs — 0. Для greedy также обнаружено одно назначение вне списка. MILP на этом конкретном dataset не выдал вне-списочных назначений; код не запрещает их в общем случае.

### Малые диагностические примеры

| Условие | Результат текущего кода | Значение |
|---|---|---|
| Один студент с порядком A,B; `total(A)=0.2`, `total(B)=0.9`, обе квоты свободны | Назначен B, rank=1, top-1=100%, BP=0 | Относительно поданного списка A был первым; пара студент–A блокирует это назначение при свободном месте |
| Тот же студент указал только A | Назначен B | Нарушение допустимости пары |
| Два студента z,a с равными scores и одной квотой; изменить только порядок входного массива | Победитель меняется с z на a | Stable-ID tie-breaking не реализован |
| 10 студентов; 6 назначены своим первым выбором, 4 unmatched | top-1=100% | Требуется 60%, или 0.60 в долях |
| Semantic scores A=0.9,B=0.2; total scores A=0.2,B=0.9 | Recommendation B,A | Не semantic ranking по AC-F05 |
| Различные exact scores 0.80001 и 0.80002 при semantic weight 1 | Оба сохраняются как 0.8 | Потеря точности до ранжирования |
| Neural adapter со stub unit vectors: cosine пары +0.2; добавить вторую пару −0.2 | Score первой пары меняется с 0.2 на 0.6 | Batch-dependent normalization; stub проверяет преобразование, не качество модели |
| Все четыре веса 0 | Приняты и заменены на 0.25 каждый | Вместо отказа применяется другая политика |
| `quota=0`; студент без GPA | Pydantic ValidationError | Нельзя выразить требуемые zero-capacity и GPA-disabled случаи |
| Повторные предпочтения A,A; список из шести IDs | Модели принимают оба | Ограничения списка не enforced |
| Пустые student/profile texts | TF-IDF `empty vocabulary` | Нет предметной ошибки usable input |

Минимальное воспроизведение главного нарушения, без записи файлов:

```python
from src.engine import MatchingEngine
from src.models.entities import StudentProfile, SupervisorProfile, PairwiseScore

student = StudentProfile(id="s", name="S", gpa=4, interests_text="topic",
                         preferred_supervisor_ids=["A"])
supervisors = [SupervisorProfile(id=x, name=x, quota=1, publications_text="topic")
               for x in ["A", "B"]]
scores = {
    ("s", x): PairwiseScore(student_id="s", supervisor_id=x,
                            semantic_score=u, skills_score=0,
                            academic_score=0, preference_score=0, total_score=u)
    for x, u in [("A", 0.2), ("B", 0.9)]
}
result = MatchingEngine().allocate([student], supervisors, score_matrix=scores)
print([(p.student_id, p.supervisor_id) for p in result.pairs])
# Текущий результат: [('s', 'B')], хотя список содержит только A.
```

## 6. Проверка качества: рекомендуемый протокол

Это предлагаемый план экспериментов, а не уже полученные результаты. Зафиксированные в репозитории NFR сохраняются; новые проценты улучшения или даты защиты не назначаются.

### 6.1. Рекомендации и пригодность topic fit

1. Получить разрешённые proposal/profile texts и provenance. Для исторического сравнения нужны профили на соответствующий момент, а не обновлённые публикации из будущего. Разделить development и held-out test; связанные темы/переводы держать в одном split.
2. Сравнить TF-IDF, выбранную neural model и MiniLM на одинаковых queries, text fields, candidate sets и preprocessing policy. API comparison выполнять только при разрешённой внешней обработке; иначе явно unavailable, как допускает AC-F15.
3. Historical Hit/Recall@1,3,5 считать как совпадение с прошлым руководителем, отдельно от независимой релевантности. Историческое решение могло зависеть от доступности и личной договорённости, поэтому это не gold label качества topic fit.
4. Для независимой оценки два предметных эксперта вслепую оценивают пары proposal–supervisor по шкале 0–3: от нерелевантного до сильного соответствия. Не показывать им название модели и score. Фиксировать разногласия и weighted kappa/ordinal agreement; финальные adjudicated labels хранить отдельно от первоначальных.
5. Метрики: nDCG@5 по graded labels; Precision@5 по заранее зафиксированному порогу relevance; доля запросов хотя бы с одним релевантным кандидатом в top-5; Recall@5 — только при достаточной полноте релевантных labels. При оценке лишь pooled top results нельзя выдавать полноту внутри пула за recall по всем руководителям. Указать долю judged candidates и queries без релевантных labels.
6. Отчёт по EN→EN, RU→RU, KK→KK и представленным cross-language случаям, например RU→EN/KK→EN. Для каждой группы — число уникальных тем, тип текстов, метрики и неопределённость. Переводы полезны для consistency check, но отдельно маркируются и не заменяют native AITU data.
7. Отдельные проверки: короткие/длинные abstracts, paraphrases с малым word overlap, ложные keyword matches, пустые profiles и смешанный язык. Проверять как pure semantic ranking, так и конечный MCDM pipeline, не смешивая их метрики.

В условиях трёх человек начать с пилотного набора примерно 15–30 разрешённых уникальных тем; это ориентир трудозатрат, не достаточный размер для сильного статистического вывода. Число примеров на язык согласовать с доступностью экспертов. Для маленьких групп публиковать широкие интервалы и ограниченные выводы; размер финального набора выбирать после пилота. Если разметка ограничена, можно использовать объединённый пул top candidates разных моделей и hard negatives, честно сообщая неполноту.

Для сравнения моделей использовать paired differences на одних и тех же queries и bootstrap 95% CI с ресэмплированием по уникальной теме, а не по зависимым переводам/парам. Выбор модели/параметров делать на development части. Не устанавливать задним числом порог качества, который уже прошёл победитель. Критерии достаточности и практически полезного улучшения над TF-IDF согласовать до финальной оценки. Если neural model преимущества не показывает, результат следует честно зафиксировать.

### 6.2. Распределение

| Метрика | Определение / применение |
|---|---|
| Constraint violations | Отдельные counts: capacity, multiple assignment, non-roster IDs, pair eligibility, assignment outside accepted list, assigned/unmatched inconsistency. Для production все 0 |
| Blocking pairs | По frozen submitted lists и strict supervisor rankings; независимый checker; для production 0 |
| Coverage | Assigned / eligible submitted cohort |
| S1, S3 | Получили первый / один из первых трёх в исходном списке, делённое на весь eligible submitted cohort, включая unmatched |
| Assigned mean rank | По исходному списку среди assigned; всегда рядом с coverage. Unmatched не прятать под rank=0 |
| Utility | Total и mean утверждённого MCDM score. Это внутренняя objective, не независимое доказательство качества или общественной пользы |
| Topic quality | Mean semantic score плюс независимая expert relevance, если размечена; similarity собственной модели сама по себе не подтверждает правильность |
| Workload | Counts и count/quota каждого руководителя, max count, распределение заполненности. Gini нагрузки указывать отдельно от Gini utility; разные квоты учитывать явно |
| Sensitivity | Доля изменившихся назначений, S1/S3, coverage, topic fit, workloads по сетке весов с фиксированными inputs |
| Reproducibility | Пять replay одного snapshot дают одинаковые пары и unmatched, с сохранёнными input/policy/model/algorithm versions |
| Runtime | Отдельно cold load, embedding/scoring, solver, validation и end-to-end request/run |

Все методы получают один frozen instance: roster, accepted pairs, quotas, lists, supervisor rankings, scores. ILP objective и отсутствие/наличие stability constraints указывать прямо. Не сравнивать SciPy welfare MILP из `src/` с preference-satisfaction PuLP ILP из `experiments/` как одну и ту же реализацию. Аналогично различать GPA-priority и topic-greedy.

Baselines: GS, согласованный ILP, один явно определённый greedy; затем first-come и random (30 seeds по имеющемуся плану). Historical manual — только на восстановимом сопоставимом instance. Если нет preference lists/capacities/timestamps, не выдумывать их; ограничить соответствующее сравнение.

Сценарии: normal, shortage, популярные руководители, quota=0, короткие списки, пустой cohort, equal exact scores, различие exact при равном display score, каждый tie step, GPA off/on/missing, перестановки входных коллекций, invalid/duplicate IDs, live changes после freeze. Для небольших fixtures checker дополнительно сверять с вручную перечисленными blocking pairs и намеренно нестабильным результатом. Он не должен просто повторять логику allocator.

Отсутствие blocking pairs не является доказательством равных нагрузок, лучшего semantic retrieval или максимальной суммы score. Эти качества требуют отдельных измерений. Дополнительно нужно оценить GPA-enabled решения по группам успеваемости, только если использование таких данных разрешено; отсутствие GPA approval нельзя обходить ради эксперимента.

### 6.3. Польза университету

Начать с process walkthrough последнего реального цикла: кто принимает решение, какие инструменты используются, где возникают очереди/исключения и какие данные уже существуют. Не предполагать, что университет действительно проводит централизованное batch allocation: студенческий опрос описывает преимущественно личные договорённости.

Пилот: координатор выполняет сопоставимый сценарий привычным способом и в MAS; порядок вариантов менять, чтобы снизить learning effect. Разделять активное время работы, elapsed waiting time и миллисекунды solver. Фиксировать task completion, число ошибок, ручных исправлений/контактов, восстановление после неверного ввода, время поиска релевантного руководителя и объяснимость unmatched outcome. При малом числе участников это formative case study, а не доказанный эффект на весь университет.

Показатели пользы: активные минуты координатора на сопоставимый cohort, число исправлений квот/дубликатов, доля успешно завершённых сценариев, число повторных уточнений и субъективная понятность решения. Time saving считать только относительно измеренного baseline. Оценка идеи 4,1/5 и synthetic speed в качестве такого baseline не подходят.

## 7. Что нельзя закрыть только программированием

| Решение / работа | Кто нужен | Проверяемый выход |
|---|---|---|
| Завершить P1/C1 интервью и подтвердить реальный процесс | Руководитель-пользователь, координатор; организует Nurzhan | Датированные анонимизированные records и пересмотр H1–H6 |
| Утвердить weights, GPA source/scale, tie-breaking и resubmission | Владелец процесса / координатор с научным руководителем | Версия policy decision record с автором решения; временные пилотные правила явно помечены |
| Eligibility, quota authority, deadline, исключения и unmatched workflow | Координатор | Согласованный workflow и роли согласования |
| Разрешить historical data и экспертную разметку | Уполномоченный представитель университета и эксперты | Разрешение, перечень полей/использования, provenance, разметка |
| Privacy/retention и доступ к GPA/профилям | Владелец данных | Правила хранения и доступа; отдельная публичная часть профиля |
| Определить реальные языки и критерии полезности | Пользователи и эксперты | Перечень языковых случаев и заранее согласованные критерии пилота |
| Подтвердить сроки и изменённый объём MVP | Команда, руководитель/координатор | Актуальный milestone plan и явно согласованные исключения |

Сами интервью, endorsements, labels и факт согласования не генерируются кодом. Команда может подготовить материалы и реализовать принятую политику, но не подменять её утверждение своим default config.

## 8. Приоритетный план для трёх человек

Оценки ниже — **человеко-дни активной работы**, а не календарные обещания; ожидание интервью, разрешений и экспертных ответов не включено. D — Dias/backend; A — Ardak/ML; N — Nurzhan/frontend/research. P0 блокирует корректность/доказательность; P1 обязателен для законченного заявленного MVP; P2 допускает сокращение. Числа — оценка аудита, не данные репозитория.

| ID | Приоритет и этап | Работа, файлы | Владелец / усилия | Зависимости | Критерий готовности |
|---|---|---|---|---|---|
| A01 | P0, следующая предзащита | Исправить claims/status, ссылки на release, источники сводного отчёта; README, management, feedback, PDF generator | D+N, 1–1.5 | Нет | В документе различены implemented/planned/measured; таблицы имеют source/seed; локальный release соответствует ссылкам; неподтверждённые выводы не выдаются за результаты |
| A02 | P0, следующая | P1/C1 интервью и policy register; research/requirements/prototype | N+D, 1.5–2.5 + внешнее ожидание | Доступ к респондентам | Есть реальные records и решения по GPA, весам, ties, процессу; нерешённое явно открыто. Без согласования допустима лишь обозначенная пилотная политика |
| A03 | P0, следующая | Общая policy/eligibility модель: entities, scorer, engine | A, 1.5–2.5 | A02 либо явно временная пилотная политика | Три согласованных критерия, reciprocal rank, weights validation, GPA off/on, optional grades, quota=0, valid list rules, exact ordering, versioned policy |
| A04 | P0, следующая | Исправить matching и independent validation; все allocator-ы, base, tests | A, 2–3 | A03 | Только accepted eligible pairs, submitted student order, explicit unmatched; каждый контрпример раздела 5 закрыт; checker обнаруживает заведомо нестабильный fixture |
| A05 | P0, следующая | Исправить metrics и ranks, добавить тесты метрик | A, 1–1.5 | A04 | 6/10 даёт 0.60; единые units/denominators/N/A; per-supervisor loads и max; Gini utility явно отличается от workload |
| A06 | P0, следующая | Один model manifest и score contract; embedder, engine, config, docs | A, 1–2 | Решение по кандидатам; A03 | Batch-invariant normalization; declared long-text policy; реальные backend/revision/preprocessing в provenance; fallback/error поведение явно; semantic recommendation order |
| A07 | P0, следующая: pilot evidence | Разрешённый пилотный corpus, blind labels и первый TF-IDF/neural comparison; новый evaluation runner/report | A+N, 3–5 | Доступ к данным/экспертам; A06 | Dataset manifest, split, per-language counts/метрики, ограничения, reproducible report; пустые группы unverified. Без данных замечание о реальном качестве остаётся открытым |
| A08 | P1, следующая: рабочий vertical slice | Backend: auth/ownership, profiles/proposals/preferences, cycles, approvals, freeze, runs, publish, CSV/audit, migrations; согласовать API | D, 8–12 | A02–A06 для финальной интеграции; schema/contracts можно начать раньше | Один цикл проходит end-to-end на seeded accounts; нет публикации без всех validations; авторизация и транзакционная запись покрыты integration checks |
| A09 | P1, следующая | Web client: proposal/recommendations/preferences, View profile, supervisor edit, coordinator run/review/publish, published result; prototype docs + новый frontend | N, 5–8 | Контракт A08, публичные поля профиля A02 | Рабочие страницы с backend, согласованная detail page, loading/error/no-candidates/closed states; основной студентский путь работает с клавиатуры |
| A10 | P1, следующая | Интеграция vertical slice, acceptance matrix, smoke/E2E/CI, reproducible setup | D+N с review A, 3–4 | A04–A09 | Fresh setup, smoke всех ролей, wrong-owner/role отказ, replay, сценарии из требований; evidence paths привязаны к AC |
| A11 | P1, полный результат до финальной защиты; желательно до следующей | Полный held-out evaluation, общий production-policy benchmark, sensitivity, random/first-come/manual где возможно | A+N, 3–5 | A03–A07, доступ к данным | Версионированные таблицы + raw aggregate outputs, seeds, CI/вариативность, одинаковые hard constraints, ясные unavailable comparisons |
| A12 | P1, pilot до следующей; итог до финальной | Проверить пользу на сопоставимом manual/MAS упражнении | N+D, 2–3 | A02 и рабочий slice A08–A10 | Наблюдаемый baseline, task scripts, time/errors/completion, реальные отзывы; выводы соответствуют масштабу пилота |
| A13 | P1, финальная; базовая integrity обязательна уже для slice | Полные concurrency/failure/replay/load/privacy/backup checks; dependencies and CI | D с A, 3–5 | A08–A10 | AC-N01/N02/N03/N05, версии окружения; 20 users/200 students/25 profiles и заявленные p95; immutable replay; для backup — rehearsal если NFR-06 сохраняется |
| A14 | P1, финальная | Согласованная дипломная глава, limitation register, release и достоверный PDF | Все, 1.5–2.5 | A11–A13 | Каждая цифра трассируется к запуску; каждое claim к evidence; публичные материалы без персональных данных |
| A15 | P2 | Убрать неиспользуемые flags/двойные docs, уточнить min_quota, расширенные UI features | По владельцам, 1–2 | Основной workflow готов | Нет ложных API switches; один источник документации; необязательные функции не задерживают обязательные |

Суммарная оценка A01–A14: примерно **39–63 человеко-дня**, плюс внешние ожидания; P2 отдельно. Деление этого объёма на трёх участников не даёт календарного обещания: основная цепочка последовательно проходит через ML policy/matching и backend integration, а у каждого направления один основной исполнитель.

Работать тремя потоками: D — схема/API/транзакции; A — policy/matching/metrics/models; N — интервью/контракты профиля/frontend. Сначала совместно зафиксировать контракт входов и правил, затем вести работу независимо и сводить один проверяемый сценарий. На review использовать уже описанную в проекте взаимную проверку. Не создавать сейчас четвёртый поток из микросервисной инфраструктуры.

**Критическая цепочка:** решение по процессу/данным → policy и accepted-pair contract → правильный matching/metrics → frozen persistence и публикация → интеграция → сопоставимые evaluation/pilot. Организационный доступ запускать сразу: он может блокировать доказательность даже при готовом коде.

При дефиците времени сократить manual reassignment, notification delivery, scenario-comparison UI, внешнюю API comparison без разрешений и отдельные deployment сервисов. Offline evaluation report уже разрешён как fallback вместо FR-15 coordinator UI. Нельзя экономить на accepted-list semantics, проверке квот/стабильности, достоверных метриках, access control для персональных данных и честном обозначении unverified languages. Изменение Must scope нужно согласовать и отразить в требованиях, а не молча снять из checklist.

## 9. Известные сроки и разделение по сдачам

На дату аудита — 1 ноября 2026 года — в документации найдены следующие даты:

| Источник | Записанная дата | Как трактовать |
|---|---|---|
| `docs/01-proposal.md:208–209` | 15 октября 2026, presentation submission | Историческая дата; конфликтует с поздними планами |
| `README.md:75`, `docs/youtrack-management.md:50` | 22 октября 2026, first milestone | Историческая дата |
| `PRE_DEFENSE_PLAN.md:1,13` | 24 октября 2026, first pre-defense | Другой исторический deadline; требует сверки |
| `docs/youtrack-management.md:55–58` | **20 ноября 2026** | Документированный внутренний milestone prototype/integration; не дата следующей предзащиты |
| `docs/youtrack-management.md:60–63` | **15 декабря 2026** | Документированный внутренний milestone evaluation/benchmarking |
| `docs/youtrack-management.md:65–67` | **Весна 2027** | Предзащита 2 и финальная защита объединены; точные даты и промежуток не указаны |

`2026-11-15T12:00:00Z` в API-contracts — sample preference deadline, а не подтверждённая дата сдачи проекта. Действующие даты YouTrack не проверялись. Нельзя обещать новую дату следующей предзащиты на основании этих sample values.

**Обязательный пакет к следующей предзащите, предлагаемый по итогам аудита:** A01–A10; пилот A12; предварительные результаты A11 для доступных данных. Он должен включать реальные P1/C1 records или явно незакрытое замечание, согласованную/явно пилотную политику, исправленное ядро и независимые проверки, один рабочий role-based цикл с profile viewing, model manifest, языковой pilot report и первый измеренный процессный baseline. Если качество не проверено или респонденты недоступны, нельзя отмечать соответствующее замечание закрытым.

**К финальной защите:** полный A11–A14, завершённые Must acceptance checks, достаточно обоснованный held-out evaluation на заявленных языках, итоговое исследование пользы, воспроизводимый release и дипломная глава с ограничениями. P2 — только при наличии времени.

Поскольку следующий pre-defense и final в реестре объединены как «Spring 2027», запас времени между ними неизвестен. Поэтому полный evaluation разумно планировать к уже записанному этапу 15 декабря, а не откладывать за следующую предзащиту. Приведённое разделение — порядок минимального доказательства и окончательной готовности; это не новый календарь комиссии.

## 10. Когда семь замечаний можно считать закрытыми

| Замечание | Необходимое подтверждение |
|---|---|
| 1. Recommendation quality | Исправленные matching/metrics + независимые relevance results против TF-IDF; stability отдельно от topic quality |
| 2. Польза AITU | Наблюдённый текущий процесс, сопоставимый pilot и измеренные time/errors/completion; scope выводов соответствует выборке |
| 3. Интервью | Реальные датированные P1/C1 records, обновлённая матрица и решения; консультации не подменяют discovery |
| 4. Policy | Утверждённая или явно временная policy, одинаковая в requirements/code/tests; GPA source/scale и каждый tie step проверены |
| 5. Модель | Один фактически используемый manifest; та же model revision/preprocessing в приложении и model evaluation; backend provenance сохраняется |
| 6. Языки | Метрики и sample counts по заявленным языкам/cross-language cases; непроверенные случаи явно ограничены |
| 7. API/profiles | Рабочий согласованный API и profile detail/edit workflow с авторизацией, persistence и end-to-end проверкой |

Работающий GS, девять зелёных unit-тестов и синтетическая таблица являются полезной основой. Для закрытия замечаний нужно связать согласованную политику, фактическую реализацию, независимые измерения и реальный университетский процесс в один воспроизводимый результат.
