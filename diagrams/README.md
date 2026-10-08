# MAS-7a: System context and component diagrams

Due: October 17, 2026. These diagrams describe the proposed architecture derived from README.md and PRE_DEFENSE_PLAN.md; application services are not yet implemented.

## Diagram sources

- [System context](src/system-context.puml): Student, Supervisor and Department Coordinator interactions; external university identity provider; MAS ownership and public API/SSO boundaries.
- [Component diagram](src/component-diagram.puml): web client, gateway and identity/access component; private profile/cycle, recommendation, NLP and allocation microservices; solver and audit components; PostgreSQL/pgvector and local model files.

## Architecture decisions and assumptions

The public REST interface belongs to the FastAPI gateway. Browser requests never access private services or PostgreSQL directly. SSO authenticates identity, while MAS controls role assignments and record ownership. OIDC authorization-code flow with PKCE is proposed; university provider availability, registration and claims are pending confirmation. No working SSO integration is claimed.

Profile/cycle data, embeddings, allocation snapshots/results and identity records have separate schema owners within a shared MVP database. Services read other domains through private authenticated APIs. The audit writer is an internal library/component participating in the calling service's transaction, not an independently committed remote audit service. Its insert-only permissions prevent application-level event mutation.

The recommendation service calls a locally hosted, versioned NLP engine and stores embeddings in pgvector. Allocation consumes frozen, versioned inputs and runs capacity-constrained matching followed by independent hard-constraint and stability validation. Only a coordinator can publish a validated result. Insufficient capacity leaves explicit unmatched students. Final algorithm/model choices remain subject to MAS-5.

Microservice boxes define the proposed API and ownership boundaries. This design does not assert independent production deployments already exist. A simpler deployment may co-locate services while preserving those boundaries. An asynchronous queue, external AI API, publication harvesting, and HR/payroll integration are not assumed dependencies.

## Rendering

Sources are self-contained PlantUML with rectangular nodes, square corners and orthogonal connectors. Rendering uses Graphviz (a local installation or the renderer's bundled Windows executable); no remote includes are used. With Java and a local PlantUML JAR:

~~~powershell
java -jar C:\tools\plantuml.jar -tsvg -o ../rendered diagrams/src/system-context.puml diagrams/src/component-diagram.puml
~~~

Run from the repository root. Generated previews belong in diagrams/rendered. Editable .puml files remain the source of truth.

## Review and delivery

Verify that all three actors are outside MAS; the identity provider is external; public versus private API boundaries are explicit; profile, recommendation, NLP, allocation and persistence responsibilities are visible; draft review and publication remain coordinator-controlled.

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
| 4 | mas | idp | Browser SSO redirects; exchange authorization code; obtain identity;; retrieve signing keys [OIDC over HTTPS] |

## Component diagram connections

| No. | From | To | Interaction |
|---|---|---|---|
| 1 | users | web | Browser [HTTPS] |
| 2 | web | idp | Authorization redirect [HTTPS / OIDC + PKCE] |
| 3 | web | api | REST requests / responses [HTTPS, session] |
| 4 | api | auth | Authenticate and authorize request |
| 5 | auth | idp | Code exchange / signing-key discovery [HTTPS] |
| 6 | auth | db | SQL: MAS accounts and role mapping |
| 7 | api | profiles | Private authenticated HTTP / JSON |
| 8 | api | recommend | Private authenticated HTTP / JSON |
| 9 | api | allocation | Private authenticated HTTP / JSON |
| 10 | profiles | db | SQL: own schema read/write |
| 11 | recommend | profiles | Read authorized proposal / research text; [private HTTP / JSON] |
| 12 | recommend | nlp | Embed text [private HTTP / JSON]; Return vector and model version |
| 13 | nlp | weights | Load pinned model version |
| 14 | recommend | db | SQL / vector search:; own embeddings schema |
| 15 | allocation | profiles | Obtain cycle inputs and approved quotas; [private HTTP / JSON] |
| 16 | allocation | recommend | Obtain versioned semantic scores; [private HTTP / JSON] |
| 17 | allocation | solver | Frozen rankings, preferences and capacities; Return assignments and validation report |
| 18 | allocation | db | SQL: immutable snapshots and runs;; transactional result publication |
| 19 | profiles | audit | Record accepted input changes |
| 20 | allocation | audit | Record run and publication changes |
| 21 | api | audit | Record coordinator policy changes |
| 22 | audit | db | SQL: insert audit events only |
