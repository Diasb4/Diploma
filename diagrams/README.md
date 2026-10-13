# MAS-7a: System context and component diagrams

Presentation submission: October 15, 2026. These diagrams describe the proposed MVP architecture derived from README.md, the project proposal, and the requirements specification; application services are not yet implemented.

## Diagram sources

- [System context](src/system-context.puml): Student, Supervisor and Department Coordinator interactions; MAS ownership and the authenticated public API boundary.
- [Component diagram](src/component-diagram.puml): web client, gateway and identity/access component; private profile/cycle, recommendation, NLP and allocation microservices; solver and audit components; PostgreSQL/pgvector and local model files.

## Architecture decisions and assumptions

The public REST interface belongs to the FastAPI gateway. Browser requests never access private services or PostgreSQL directly. The MVP uses authorized MAS test accounts. The internal Identity and Access component authenticates these accounts, manages sessions, and enforces MAS roles and record ownership. Direct university SSO integration is excluded from the MVP in proposal section 6.3. Adding an external identity provider would require a separately reviewed scope and architecture decision.

Profile/cycle data, embeddings, allocation snapshots/results and identity records have separate schema owners within a shared MVP database. Services read other domains through private authenticated APIs. The audit writer is an internal library/component participating in the calling service's transaction, not an independently committed remote audit service. Its insert-only permissions prevent application-level event mutation.

The recommendation service calls a locally hosted, versioned NLP engine and stores embeddings in pgvector. Allocation consumes frozen, versioned inputs and runs capacity-constrained matching followed by independent hard-constraint and stability validation. Only a coordinator can publish a validated result. Insufficient capacity leaves explicit unmatched students. Final algorithm/model choices follow the technology-selection document (docs/05-technology-selection.md).

Microservice boxes define the proposed API and ownership boundaries. This design does not assert independent production deployments already exist. A simpler deployment may co-locate services while preserving those boundaries. An asynchronous queue, external AI API, publication harvesting, and HR/payroll integration are not assumed dependencies.

## Rendering

Sources are self-contained PlantUML with rectangular nodes, square corners and orthogonal connectors. Rendering uses Graphviz (a local installation or the renderer's bundled Windows executable); no remote includes are used. With Java and a local PlantUML JAR:

~~~powershell
java -jar C:\tools\plantuml.jar -tsvg -o ../rendered diagrams/src/system-context.puml diagrams/src/component-diagram.puml
~~~

Run from the repository root. Generated previews belong in diagrams/rendered. Editable .puml files remain the source of truth.

## Review and delivery

Verify that all three actors are outside MAS; authentication and session handling belong to the internal Identity and Access component; public versus private API boundaries are explicit; profile, recommendation, NLP, allocation and persistence responsibilities are visible; draft review and publication remain coordinator-controlled.

Use branch MAS-7a-system-diagrams and commit prefix MAS-7a:. Per the pre-defense plan, Dias's MAS-7a PR requires Nurzhan's review and approval. Link the merged PR to YouTrack before marking the task Done; do not push directly to main.

## Rendered previews

- [System context SVG](rendered/system-context.svg)
- [Component diagram SVG](rendered/component-diagram.svg)

Validated and rendered with PlantUML 1.2026.2 on Java 21. SVG previews and PNG copies are included for review.

## System context connections

| No. | From | To | Interaction |
|---|---|---|---|
| 1 | student | mas | Submit proposal and ranked preferences;; view recommendations and own published result; [HTTPS web UI / authenticated REST API] |
| 2 | supervisor | mas | Maintain research profile and capacity;; view own published assignments; [HTTPS web UI / authenticated REST API] |
| 3 | coordinator | mas | Configure cycles and quotas; run, review,; publish and export allocations; [HTTPS web UI / authenticated REST API] |

## Component diagram connections

| No. | From | To | Interaction |
|---|---|---|---|
| 1 | users | web | Browser [HTTPS] |
| 2 | web | api | REST requests / responses [HTTPS, session] |
| 3 | api | auth | Authenticate MAS test account; validate session, role and ownership |
| 4 | auth | db | SQL: MAS accounts and role mapping |
| 5 | api | profiles | Private authenticated HTTP / JSON |
| 6 | api | recommend | Private authenticated HTTP / JSON |
| 7 | api | allocation | Private authenticated HTTP / JSON |
| 8 | profiles | db | SQL: own schema read/write |
| 9 | recommend | profiles | Read authorized proposal / research text [private HTTP / JSON] |
| 10 | recommend | nlp | Embed text [private HTTP / JSON]; return vector and model version |
| 11 | nlp | weights | Load pinned model version |
| 12 | recommend | db | SQL / vector search: own embeddings schema |
| 13 | allocation | profiles | Obtain cycle inputs and approved quotas [private HTTP / JSON] |
| 14 | allocation | recommend | Obtain versioned semantic scores [private HTTP / JSON] |
| 15 | allocation | solver | Frozen rankings, preferences and capacities; return assignments and validation report |
| 16 | allocation | db | SQL: immutable snapshots and runs; transactional result publication |
| 17 | profiles | audit | Record accepted input changes |
| 18 | allocation | audit | Record run and publication changes |
| 19 | api | audit | Record coordinator policy changes |
| 20 | audit | db | SQL: insert audit events only |
