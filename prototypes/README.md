# UX wireframes and prototype specifications

Low-fidelity wireframes for the three key screens of MAS: the student proposal editor, the preference builder and the coordinator panel. Each screen has a wireframe and a short specification of its elements, states and the data it needs from the API.

The wireframes follow the requirements in [`docs/06-requirements-spec.md`](../docs/06-requirements-spec.md). Requirement IDs such as FR-05 or AC-F02 refer to that document.

The SVG files are the editable sources. The PNG files are exports at 2x size.

## Status

| # | Screen | Role | Wireframe | Status |
|---|---|---|---|---|
| 1 | Proposal editor with recommendations | Student | [SVG](wireframes/01-student-proposal.svg), [PNG](wireframes/01-student-proposal.png) | Done |
| 2 | Preference list (ordered) | Student | [SVG](wireframes/02-student-preferences.svg), [PNG](wireframes/02-student-preferences.png) | Done |
| 3 | Allocation control panel | Coordinator | | Planned |

The interactive Figma prototype and the REST API request and response examples are still to be added.

## Screen 1: proposal editor with recommendations

A student writes the thesis proposal on the left. After submitting it, the right side lists up to five supervisors whose research profiles are most similar to the proposal text.

![Wireframe of the student proposal editor](wireframes/01-student-proposal.png)

### Elements

| # | Element | Behavior |
|---|---|---|
| 1 | Title | Single-line text field, 5 to 200 characters (FR-02, AC-F02). |
| 2 | Abstract | Multi-line text field, 100 to 5,000 characters, with a live counter. This text is the main input for the similarity score. |
| 3 | Keywords | Tag input for 1 to 10 non-empty keywords. Enter adds a keyword, the cross removes it. |
| 4 | Save draft and Submit proposal | Save draft stores the fields without submitting. Submit proposal checks all fields, then submits the one proposal allowed per cycle. |
| 5 | Similarity score | A number from 0 to 1 in a circular badge, in descending order down the list (FR-05, AC-F05). The panel carries the line "A similarity score is not a probability of acceptance." and names the model version. |
| 6 | Add to my list | Adds the supervisor to the student's ordered preference list of one to five supervisors (FR-06). The list is edited on screen 2. |
| 7 | Deadline | Submission deadline with its time zone, taken from the cycle settings (FR-04). The server clock decides whether the deadline has passed. |
| 8 | Validation message | Plain text next to the field and linked to it. The last valid proposal stays saved (AC-F02, NFR-04). |

Each recommendation card shows the supervisor's name, research areas and approved capacity. Capacity is the figure the coordinator approved for the cycle (FR-03). Allocation runs as one batch after the deadline, so the screen has no live count of free places.

The supervisor names, scores, capacities and the model name in the wireframe are sample data.

### States to design

- **Draft:** as drawn. The form is editable and the right panel shows a hint to submit the proposal.
- **Loading:** the submit button is disabled and the panel shows placeholders.
- **Recommendations:** up to five cards in descending order of score.
- **Fewer than five eligible supervisors:** all eligible supervisors are shown (AC-F05).
- **No eligible supervisors:** an explicit message instead of cards.
- **Service error:** a retryable message. No recommendations are made up and the submitted preferences stay unchanged (AC-F05).
- **Closed:** the deadline has passed or the inputs are frozen. The form is read-only and shows the last accepted proposal with its submission time (AC-F02).

### Accessibility

Every field has a visible label. Errors appear as text linked to the field, focus stays visible, and a keyboard-only user can complete the form and add supervisors to the list (NFR-04, AC-N04).

### Data the screen needs

- The proposal: title, abstract, keywords, status and submission time.
- The cycle: deadline with time zone, and whether inputs are frozen.
- For each recommended supervisor: id, name, research areas, approved capacity, similarity score, rank and the model version.

### Open questions

- The project overview lists a preferred tech stack as a proposal field. FR-02 has only title, abstract and keywords, so the wireframe leaves the tech stack out until the requirements decide.
- FR-05 ties recommendations to a submitted proposal. Whether a student may preview recommendations for a draft needs a decision.
- It is open whether a student can edit and resubmit after seeing the recommendations, and whether the list then refreshes.
- The content of the View profile page is not defined yet.

## Screen 2: preference list

A student orders one to five supervisors. The list on the left is the one that gets submitted. The list on the right shows every eligible supervisor, with the recommended ones first.

![Wireframe of the student preference list](wireframes/02-student-preferences.png)

### Elements

| # | Element | Behavior |
|---|---|---|
| 1 | Rank badge and drag handle | The badge shows the position in the list. Dragging a row changes the order. The submitted order is the student's ranking (FR-06). |
| 2 | Up and Down | Move a row by one place. They give a keyboard and pointer alternative to dragging (NFR-04). Up is disabled on the first row and Down on the last. |
| 3 | Remove | Takes the supervisor out of the list and frees the slot. |
| 4 | Empty slot | A free position. The list has five positions in total. |
| 5 | Submit preferences | Checks the whole list and replaces the previous one. A valid list has one to five distinct eligible supervisors. An invalid list is rejected as a whole (AC-F06). |
| 6 | Add | Puts the supervisor in the first free slot. The button reads Added for supervisors already in the list, and every Add button is disabled when five are chosen. |
| 7 | Deadline | Preference deadline with its time zone, taken from the cycle settings (FR-04). The server clock decides. |
| 8 | Validation message | Plain text above the list and linked to the row it concerns. It covers an empty list, a duplicate, more than five entries and an ineligible supervisor. The last accepted list stays unchanged. |

The right-hand list starts with the supervisors recommended for the student's proposal (FR-05), followed by the other eligible supervisors. A supervisor with an approved capacity of zero is not listed (AC-F03). The supervisor names, scores and capacities in the wireframe are sample data.

### States to design

- **No supervisor chosen:** all five slots are empty and Submit preferences is disabled with a short hint.
- **Unsubmitted changes:** the status chip reads Not submitted and the list differs from the last accepted one.
- **Submitted:** the status chip shows the submission time.
- **Full list:** five supervisors are chosen and every Add button is disabled with a hint to remove one first.
- **Rejected:** the validation message is shown and the last accepted list is kept (AC-F06).
- **Closed:** the deadline has passed or the inputs are frozen. The list is read-only and shows the accepted order (AC-F06).
- **No proposal submitted yet:** the right-hand list shows eligible supervisors without scores and suggests submitting the proposal first.

### Data the screen needs

- The student's accepted list: ordered supervisor ids and the submission time.
- The eligible supervisors: id, name, approved capacity, and the similarity score for the recommended ones.
- The cycle: preference deadline with time zone, and whether inputs are frozen.

### Open questions

- FR-06 speaks of submitting a list. Whether a student can save an unsubmitted draft of the list is open. The wireframe treats every submission as a replacement.
- Whether Add to my list on screen 1 changes the submitted list at once or only the draft shown on this screen.
- FR-05 returns scores for up to five supervisors. Whether scores are shown for the other eligible supervisors needs a decision. The wireframe shows capacity only.
