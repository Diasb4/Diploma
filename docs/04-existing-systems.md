# Existing System Comparison

This document compares the tools and approaches that universities use today to assign students to thesis supervisors. It checks each one against the same eight criteria and shows where the evidence for each rating comes from. The result feeds the case for building MAS, so the document also says what it does not prove.

Research date: 7 October 2026. Sources older than 2022 are marked as such.

## Method

### Criteria

| ID | Criterion | What it asks |
|---|---|---|
| C1 | Semantic topic matching | Does the system compare a student's topic text with supervisor profiles or publications (keywords, NLP, embeddings)? |
| C2 | Student preferences | Can students submit a ranked list (1st, 2nd, 3rd choice)? |
| C3 | Supervisor capacity | Is a per-supervisor quota enforced by the system? |
| C4 | Allocation algorithm | How is the allocation made (manual, first come first served, optimisation, stable matching), and is a fairness or stability property documented? |
| C5 | Multi-criteria scoring | Can several factors (topic similarity, preference rank, GPA) be combined with configurable weights? |
| C6 | Role-based workflow | Are there separate student, supervisor and coordinator roles, with supervisor profile and publication management? |
| C7 | Transparency and control | Are there result statistics, manual override, export (PDF or Excel), an audit trail or an appeal path? |
| C8 | Deployment and fit | Cost, licence, hosting, integration with university systems, language support (Russian, Kazakh, English). |

### Ratings

- **Yes**: the capability is documented and works as the criterion describes, without custom programming.
- **Partial**: it exists only as a workaround, an add-on, a model the user builds, or for part of the criterion.
- **No**: the documentation, code or schema that was examined does not contain it.
- **Not documented**: the sources read say nothing. This is not the same as No, because the feature may exist behind a login or in material that was not found.

### Evidence marks

Each rating carries a mark that shows how it was obtained.

| Mark | Meaning |
|---|---|
| R | Read directly in official documentation, source code or a repository |
| V | Vendor claim, read on the vendor's own pages. The wording is verified, the claim is not |
| S | Search-tool extract. The page itself could not be opened from the research environment, so a person must re-check it |
| W | Weak source: blog, forum answer, marketplace listing |

Several large sites (docs.moodle.org, Google Help, Utrecht University pages) were blocked in the research environment. Ratings that rest on them carry the mark S.

## Systems compared

| System | Kind | Why it is included |
|---|---|---|
| Google Forms and Sheets, Microsoft Forms and Excel | General office tools | The workflow most departments use today for collecting choices and allocating by hand |
| Moodle with the Fair Allocation plugin (`mod_ratingallocate`) | LMS plugin, open source | The most widely documented allocation tool that runs inside an LMS |
| MentorcliQ | Commercial mentoring SaaS | Named in the project plan as an example of matching software sold as a product |
| Cambridge PDN project allocation tool | Open-source optimiser | A university department's own allocation tool with ranked preferences, quotas and an optimiser |
| Koolen thesis-supervision pipeline | Open-source script | The only verified tool that matches topic text to supervisor profiles |

**ProjectAlloc.** The project plan lists a system called "ProjectAlloc". No product, university tool, paper or company with this name could be verified. The only two GitHub repositories with this name are from 2019. One is empty. The other is a small Django scaffold with no README, licence or allocation code ([repository](https://github.com/sherifsiyanbola/projectAlloc), [models.py](https://github.com/sherifsiyanbola/projectAlloc/blob/master/alloc/models.py)). PyPI and npm have no package with the name. It is therefore not compared here. The Cambridge tool and the Koolen pipeline take its place as examples of dedicated allocation software.

**Reviewed but not in the matrix.** The following were checked and left out so the matrix stays at five systems.

- Moodle core Choice activity: a per-option limit filled first come first served, with no ranking in its database schema (R).
- Morey's SPA-student implementation: stable matching from Abraham, Irving and Manlove (2007), with student and lecturer rankings and capacities, run as a browser app on plain-text files. No roles and no text matching (R) ([README](https://github.com/richarddmorey/studentProjectAllocation)).
- KonJoin (Utrecht University): used for bachelor thesis matching in the Faculty of Science. Everything known about it comes from search extracts (S), so no rating is given.
- Mentorloop and Chronus: other mentoring platforms. Mentorloop documents rule weights from "low priority" to "required" and AI comparison of free-text profile fields, both as vendor claims for mentoring programmes. Most Chronus sources date from before 2022.

## Comparison matrix

| Criterion | Forms, Sheets, Excel | Moodle Fair Allocation | MentorcliQ | Cambridge PDN tool | Koolen pipeline |
|---|---|---|---|---|---|
| C1 Semantic topic matching | No (S) | No (R) | Not documented (V) | No (R) | **Yes** (R) |
| C2 Student preferences | Yes with Microsoft Forms (R); Partial with Google Forms alone (S) | Yes (R) | Partial (V) | Yes (R) | Yes (R) |
| C3 Supervisor capacity | Partial (S, W) | Partial (R) | Not documented (V) | Yes (R) | Yes (R) |
| C4 Allocation algorithm | Partial (R, S) | Yes (R) | Partial (V) | Yes (R) | Partial (R) |
| C5 Multi-criteria scoring | Partial (R) | No (R) | Partial (V) | Partial (R) | Partial (R) |
| C6 Role-based workflow | Partial (S) | Partial (R) | Partial (V) | No (R) | No (R) |
| C7 Transparency and control | Partial (S) | Partial (R) † | Partial (V) | Partial (R) | Partial (R) |
| C8 Deployment and fit | Partial (S, R) | Partial (R) † | Partial (V) | Partial (R) | Partial (R) |

† A reading of the plugin's code rated C7 and C8 Yes. A second reading, based on documentation extracts, rated both Partial. The matrix uses Partial because the plugin has no appeal path, does not log what a manual change altered, has a PDF export reported as unusable for wide tables (C7), ships English strings only and requires Moodle 4.5 or later (C8).

## Evidence by system

### Google Forms and Sheets, Microsoft Forms and Excel

Microsoft Forms has a native Ranking question ([Microsoft Support](https://support.microsoft.com/en-us/office/create-a-form-with-microsoft-forms-4ffb64cc-7d5d-402f-b82e-b1d49418fd9d), R). Google Forms lists no ranking type ([Google Help](https://support.google.com/docs/answer/7322334?hl=en), S), though a grid limited to one response per column can capture first, second and third choices (S).

On capacity, Google announced in January 2026 that a form can close after a set number of responses. The count is for the whole form, not per answer option ([Workspace Updates](https://workspaceupdates.googleblog.com/2026/01/forms-stop-collecting-responses.html), S). Per-supervisor caps need third-party add-ons (W).

Neither product has an allocation function. Excel's Solver add-in is the only built-in optimiser. It needs desktop Excel and allows 200 variable cells ([Microsoft Support](https://support.microsoft.com/en-us/office/define-and-solve-a-problem-by-using-solver-5d1a388f-079d-43ac-a7eb-f63e45925040), R), which is 20 students with 10 candidate supervisors each.

The published cases pair a form with custom code or an optimiser: a Google Apps Script tool at Maranatha Christian University (2021, R) ([README](https://github.com/FerdiantJoshua/student-to-supervisor-thesis-assigner)), a Reading Psychology system for up to 350 students with a bespoke R algorithm (S) ([Reading](https://sites.reading.ac.uk/t-and-l-exchange/?p=7763)), and a 2022 integer-programming study built with OpenSolver (S) ([RePEc](https://ideas.repec.org/a/hin/jjopti/9415210.html)). The Maranatha README describes the conventional first-come process as having "unfair 'races'" with fully booked supervisors "still flooded by student requests" (R, 2021). Utrecht's guidance calls first-come sign-up sheets "inequitable and stressful" (S) ([Utrecht University](https://www.uu.nl/en/education/centre-for-academic-teaching-and-learning/matching-students-to-thesis-projects)). No source gave measured hours or error rates for manual allocation.

### Moodle Fair Allocation

Fair Allocation is a community plugin, not part of Moodle core. Students rate or rank choices under six strategies, including Rank Choices. The README states that a modified Edmonds-Karp algorithm solves a minimum-cost flow problem, and that distributing 500 users to 21 choices takes about 11 seconds (R) ([README](https://github.com/learnweb/moodle-mod_ratingallocate)). No stability or fairness guarantee is documented, and an open question about which fairness notion the plugin uses has had no reply since October 2025 ([issue 331](https://github.com/learnweb/moodle-mod_ratingallocate/issues/331)).

Choices have a title, a maximum size and a group restriction but no owner. A supervisor can only be modelled as one choice, with no shared quota across several topics and no profile (R) ([install.xml](https://github.com/learnweb/moodle-mod_ratingallocate/blob/1b6b3cba3f0aa8ae6860b45c7a849a6864df481f/db/install.xml)). The quota is enforced in the automatic run only; a manual allocation does not check it. A search of the repository found no similarity or weight terms, and a request for additional allocation criteria has been open since May 2018 ([issue 158](https://github.com/learnweb/moodle-mod_ratingallocate/issues/158)).

The plugin documents allocation statistics, manual override after the run, Moodle events, and export to CSV, XLSX, ODS, JSON and HTML (R). It is licensed GPL v3 or later in its file headers. Release 5.0.0 (25 February 2026) needs Moodle 4.5 or later. No peer-reviewed or university evaluation of the plugin was found. The plugin's page on moodle.org and its pages on docs.moodle.org could not be opened (S).

### MentorcliQ

MentorcliQ sells enterprise mentoring software to HR and learning teams. Its home page is headed "Enterprise Mentoring Software & ERG Management" ([home](https://www.mentorcliq.com/), V). The vendor's sitemap contains no higher-education product page. Students appear only through America Mentors, a free programme run by the vendor's non-profit arm ([America Mentors](https://americamentors.org/)), and one university uses the product for its own faculty mentoring ([Ohio State College of Medicine](https://u.osu.edu/comfame/faculty-mentoring-program/)).

The vendor describes four matching modes: SMART Match, Suggested Match, Self Match and Admin Match. SMART Match is "built using the scientific framework established in the Nobel Prize-winning Gale-Shapley algorithm", and an administrator can adjust each run, see percentage scores and reject suggested matches ([vendor blog](https://www.mentorcliq.com/blog/which-mentor-matching-option-is-right-for-you), V). The vendor does not say that participants submit ranked lists, and it states no stability guarantee. No per-mentor capacity setting is documented; group mentoring is described with 6 to 10 mentees as guidance ([blog](https://www.mentorcliq.com/blog/what-is-group-mentoring-definitions-and-strategies), V).

The public price is one entry tier, CliQ Start from $9,900 per year for "100 Employees per Year". The higher tiers are quote-only and no academic pricing is published ([pricing](https://www.mentorcliq.com/pricing), V). The platform is hosted on Google Cloud ([security page](https://www.mentorcliq.com/security-compliance), V). Russian and Kazakh interfaces are not confirmed. No public help centre was found, so settings that exist only behind a customer login, including any capacity setting, were not checked.

### Cambridge PDN project allocation tool

The tool allocates projects for the Department of Physiology, Development, and Neuroscience at the University of Cambridge ([README](https://github.com/RudolfCardinal/pdn_project_allocation), R). It uses mixed-integer linear programming to minimise total dissatisfaction, with optional stability constraints. The README reports that Gale-Shapley "failed completely" on the department's real data. Students rank projects, supervisors may rank students, project capacities are absolute, and per-supervisor limits on students and projects can be set. The administrator sets how much student preferences count against supervisor preferences (the README's example is 70% to 30%). Topic similarity, grades and prerequisites are not documented as scored factors.

It runs locally on Excel files, with no login, roles or web views. The Excel output contains summary statistics, dissatisfaction scores, rank distributions, a stability analysis and the students who did not get a project they asked for. Manual override, an audit trail, an appeal path and PDF export are not documented. The README names GNU GPL v3. The repository was last pushed on 6 October 2026.

### Koolen thesis-supervision pipeline

The pipeline "allocates thesis topics, daily supervisors, and promotors" ([README](https://github.com/christofkoolen/computational-allocation-of-thesis-supervision), R). It compares each topic description with a researcher's profile description and publication list, using the multilingual `BAAI/bge-m3` embedding model or an offline TF-IDF backend. It reads three ranked topic preferences, treats topic capacity and researcher maximum capacity as hard limits, and combines its objectives in a fixed seven-step priority order. The solver and any stability or fairness property are not stated, and weights are not configurable. It runs as a Colab notebook or from the command line and writes Excel and JSON files with audit and manual-review flags.

The package is version 0.1.0, created in July 2026, with one author, no declared licence and no published evaluation. The README names no institution or deployment. It shows that topic-to-profile matching is feasible in an allocation tool, and it is weak evidence for anything beyond that.

## What the comparison shows

**Each requirement is covered somewhere, but not in one system.** Ranked preferences, quotas and an optimising algorithm (C2 to C4) are documented in the open-source tools, mainly from README files and code. Semantic topic matching (C1) is documented in one verified tool, the Koolen pipeline. Configurable weights (C5) appear only in Cambridge's student-versus-supervisor weight and in Mentorloop's vendor-described rule weights. No system in the matrix rates Yes on role-based workflow (C6).

**The tools split into groups that each miss something.**

- Collection tools (Forms, Sheets) gather choices and leave allocation to manual work, Solver or custom code.
- Optimisers (Cambridge, Koolen) handle preferences and quotas but are command-line or notebook tools without roles or web views.
- A workflow tool (Moodle Fair Allocation) has statistics, override and export but no supervisor concept, no text matching and no weights.
- Mentoring software (MentorcliQ) has matching modes and admin controls, but its public pages document no per-mentor quota, no ranked lists and no topic matching, and it targets employee programmes.

**Outcome evidence is missing.** None of the Cambridge, Morey, Moodle or Koolen pages read publishes an evaluation of results, such as the share of students who received their first choice. A new system that states its fairness notion, explains its choice between stability and total satisfaction, and reports such outcomes would add something these tools do not publish.

### Design implications for MAS

- Topic-to-profile similarity should feed the same objective as preference rank, quota and other attributes, with weights the coordinator can change.
- Coordinators, supervisors and students need separate web views, and manual changes need a logged reason.
- The fairness notion and the outcome metrics should be stated and measured, such as the share of students who get their first choice. This belongs in the verification plan.
- Interface language support for Russian, Kazakh and English has to be confirmed with users. No verified tool documents it.

### Limits of this comparison

- "Not documented" and "No" record what the sources say. They do not prove a feature is absent. For MentorcliQ in particular, settings behind a customer login were not visible.
- None of the tools was installed or run for this document. Ratings come from documentation, code and vendor pages.
- The comparison does not describe the current process at Astana IT University. The interviews in `02-relevance-interviews.md` test that separately.
- The wording "none of the verified tools documents" is deliberate. A 2026 paper and several student prototypes also describe text matching, and none of them is verified as a maintained tool.

## Conclusion

The sources read support a narrower claim than "no tool does this". Among the verified tools, none documents semantic matching of topic text to supervisor profiles, ranked preferences, hard supervisor quotas, configurable weights and a role-separated coordinator workflow with reviewable changes in one system. The Koolen pipeline comes closest on matching, the Cambridge tool on optimisation, and Moodle Fair Allocation on workflow and deployment inside an LMS. That combination is the gap MAS targets.

This does not mean the existing tools have nothing to offer. The Cambridge tool's choice of optimisation with an optional stability constraint, and the min-cost-flow approach in Moodle, are directly relevant to the solver design and should be cited there. Extending the Moodle plugin instead of building a new system would mean adding a supervisor model, text matching and weights to a PHP plugin, and whether Astana IT University runs Moodle for this process was not established here.

## Open items

**Conflicts between sources**

- The Moodle plugin's release 5.0.0 is dated 25 February 2026 in `version.php`, its changelog and its tag. A fetch of the GitHub Releases page read "February 25, 2025". Open the Releases page to settle it.
- A search summary of the Moodle plugin directory still names version 4.5-r1 (February 2025) as the latest, which conflicts with GitHub.
- MentorcliQ states "11+" supported languages on its security page and "over 30" in an October 2025 article. No official page lists them.
- Licence metadata: GitHub's licence detector shows none for the Cambridge tool or the Moodle plugin, while their README and file headers state GPL. Check the files before citing a licence.

**Pages a person should open before the committee relies on them**

- Moodle: [plugin directory](https://moodle.org/plugins/mod_ratingallocate), [documentation page](https://docs.moodle.org/501/en/Ratingallocate), [language packs](https://lang.moodle.org/)
- Google: [question types](https://support.google.com/docs/answer/7322334?hl=en), [response limit announcement](https://workspaceupdates.googleblog.com/2026/01/forms-stop-collecting-responses.html), [Apps Script quotas](https://developers.google.com/apps-script/guides/services/quotas)
- Utrecht University: [thesis matching guidance](https://www.uu.nl/en/education/centre-for-academic-teaching-and-learning/matching-students-to-thesis-projects), [KonJoin tool page](https://educate-it.uu.nl/en/tool/konjoin/)
- Reading: [supervisor allocation post](https://sites.reading.ac.uk/t-and-l-exchange/?p=7763)
- GitHub pages of the Cambridge, Morey and Koolen tools, to compare quoted README text and dates with the raw pages

**Questions only the vendors can answer**

- Can MentorcliQ enforce a hard per-mentor cap in every match mode, and accept ordered preference lists?
- Does either platform offer Russian and Kazakh interfaces, and price students as participants?
