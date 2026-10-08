# UX wireframes and prototype specifications

Low-fidelity wireframes for the three key screens of MAS: the student proposal editor, the preference builder and the coordinator panel. Each screen has a wireframe and a short specification of its elements, states and the data it needs from the API.

The SVG files are the editable sources. The PNG files are exports at 2x size.

## Status

| # | Screen | Role | Wireframe | Status |
|---|---|---|---|---|
| 1 | Proposal editor with compatibility preview | Student | [SVG](wireframes/01-student-proposal.svg), [PNG](wireframes/01-student-proposal.png) | Done |
| 2 | Preference builder (ranked list) | Student | | Planned |
| 3 | Assignment control panel | Coordinator | | Planned |

The interactive Figma prototype and the REST API request and response examples are still to be added.

## Screen 1: proposal editor with compatibility preview

A student describes the thesis topic on the left. After pressing Analyze compatibility, the right side shows the supervisors whose research profiles are closest to the topic.

![Wireframe of the student proposal editor](wireframes/01-student-proposal.png)

### Elements

| # | Element | Behavior |
|---|---|---|
| 1 | Title | Single-line text field. Required to analyze. |
| 2 | Abstract | Multi-line text field with a character counter. The text is the main input for the topic similarity. |
| 3 | Keywords | Tag input. Enter adds a keyword, the cross removes it. A second tag input below it takes the optional preferred tech stack. |
| 4 | Analyze compatibility | Saves the proposal, sends it for analysis and fills the preview. Save draft stores the proposal without analysis. |
| 5 | Match score | Percentage of topic similarity between the proposal and the supervisor's research profile. It is shown as a circular badge next to the supervisor's name, research areas and free slots. |
| 6 | Add to preferences | Adds the supervisor to the student's ranked list, which is edited on screen 2. |

The supervisor names, scores and slot counts in the wireframe are sample data.

### States to design

- **Empty:** nothing analyzed yet. The preview shows a short hint instead of cards.
- **Loading:** the button is disabled and the preview shows placeholders.
- **Error:** the analysis failed. The proposal stays saved and the student can retry.
- **Closed:** the submission deadline has passed. The form is read-only.

### Data the screen needs

- The student's proposal: title, abstract, keywords, preferred tech stack.
- For each suggested supervisor: name, research areas, match score, free slots out of the quota.

### Open questions

These depend on the requirements specification and are settled there:

- the minimum and maximum abstract length;
- how many suggestions the preview shows;
- whether a proposal can still be edited after the student has submitted preferences.
