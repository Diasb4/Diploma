"""
Consolidated Probationary Period Report Generator for Astana IT University (AITU).
Topic: Development of a Multi-Criteria System for Selecting and Assigning Academic Supervisors Based on Machine Learning Methods (MAS)
Target File: SE-2407_SE-2420_SE-2411_Tursynbai_ProbPeriod1.pdf
"""

import sys
import os
import io

# ReportLab dependencies from tmp/pdfs/deps
sys.path.insert(0, r"C:\Users\bbdng\Desktop\base\Projects\Diploma\tmp\pdfs\deps")

from PIL import Image as PILImage
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    Image, PageBreak, KeepTogether, HRFlowable, Flowable
)

# ----------------------------------------------------------------------
# 1. Font Registration (Arial for Latin and Cyrillic)
# ----------------------------------------------------------------------
pdfmetrics.registerFont(TTFont('Arial', r'C:\Windows\Fonts\arial.ttf'))
pdfmetrics.registerFont(TTFont('Arial-Bold', r'C:\Windows\Fonts\arialbd.ttf'))
pdfmetrics.registerFont(TTFont('Arial-Italic', r'C:\Windows\Fonts\ariali.ttf'))
pdfmetrics.registerFont(TTFont('Arial-BoldItalic', r'C:\Windows\Fonts\arialbi.ttf'))

# Page dimensions
PAGE_W, PAGE_H = A4
MARGIN = 54  # 0.75 in
USABLE_W = PAGE_W - 2 * MARGIN  # 487.27 pt

# ----------------------------------------------------------------------
# 2. Tracking & Numbered Canvas
# ----------------------------------------------------------------------
section_page_registry = {}

class PageTracker(Flowable):
    def __init__(self, key):
        super().__init__()
        self.key = key
        self.width = 0
        self.height = 0

    def draw(self):
        section_page_registry[self.key] = self.canv._pageNumber


class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            if self._pageNumber > 1:
                self.draw_decorations(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_decorations(self, total_pages):
        self.saveState()
        self.setFont('Arial', 8)
        self.setFillColor(colors.HexColor('#64748B'))

        # Header
        self.drawString(MARGIN, PAGE_H - 36, "Astana IT University | MAS Consolidated Probationary Period Report")
        self.drawRightString(PAGE_W - MARGIN, PAGE_H - 36, "Release: prob-period-1 (Commit d3be81d)")
        self.setStrokeColor(colors.HexColor('#CBD5E1'))
        self.setLineWidth(0.5)
        self.line(MARGIN, PAGE_H - 42, PAGE_W - MARGIN, PAGE_H - 42)

        # Footer
        self.line(MARGIN, 45, PAGE_W - MARGIN, 45)
        self.drawString(MARGIN, 32, "SE-2407_SE-2420_SE-2411 · Tursynbai, Avissauly, Zhumabekov · Supervisor: E.B. Tulebayev")
        self.drawRightString(PAGE_W - MARGIN, 32, f"Page {self._pageNumber} of {total_pages}")
        self.restoreState()


# ----------------------------------------------------------------------
# 3. Typography & Styles
# ----------------------------------------------------------------------
def create_styles():
    return {
        'CoverTitle': ParagraphStyle('CoverTitle', fontName='Arial-Bold', fontSize=22, leading=28, textColor=colors.HexColor('#1B365D'), alignment=TA_CENTER),
        'CoverSub': ParagraphStyle('CoverSub', fontName='Arial-Bold', fontSize=12, leading=16, textColor=colors.HexColor('#2E5B88'), alignment=TA_CENTER),
        'CoverMeta': ParagraphStyle('CoverMeta', fontName='Arial', fontSize=9.5, leading=14, textColor=colors.HexColor('#334155')),
        'CoverMetaBold': ParagraphStyle('CoverMetaBold', fontName='Arial-Bold', fontSize=9.5, leading=14, textColor=colors.HexColor('#0F172A')),
        
        'H1': ParagraphStyle('Heading1_Custom', fontName='Arial-Bold', fontSize=14, leading=18, textColor=colors.HexColor('#1B365D'), spaceBefore=14, spaceAfter=6, keepWithNext=True),
        'H2': ParagraphStyle('Heading2_Custom', fontName='Arial-Bold', fontSize=11, leading=15, textColor=colors.HexColor('#2E5B88'), spaceBefore=10, spaceAfter=4, keepWithNext=True),
        'H3': ParagraphStyle('Heading3_Custom', fontName='Arial-Bold', fontSize=9.5, leading=13, textColor=colors.HexColor('#0F172A'), spaceBefore=6, spaceAfter=3, keepWithNext=True),
        
        'Body': ParagraphStyle('Body_Custom', fontName='Arial', fontSize=8.5, leading=12, textColor=colors.HexColor('#1E293B'), alignment=TA_JUSTIFY, spaceAfter=5),
        'Bullet': ParagraphStyle('Bullet_Custom', fontName='Arial', fontSize=8.5, leading=12, textColor=colors.HexColor('#1E293B'), leftIndent=12, spaceAfter=3),
        
        'TH': ParagraphStyle('TH_Custom', fontName='Arial-Bold', fontSize=8, leading=10, textColor=colors.white, alignment=TA_CENTER),
        'TD': ParagraphStyle('TD_Custom', fontName='Arial', fontSize=7.5, leading=10, textColor=colors.HexColor('#1E293B')),
        'TDBold': ParagraphStyle('TDBold_Custom', fontName='Arial-Bold', fontSize=7.5, leading=10, textColor=colors.HexColor('#0F172A')),
        
        'CalloutText': ParagraphStyle('CalloutText_Custom', fontName='Arial', fontSize=8, leading=11, textColor=colors.HexColor('#1E293B')),
        'CodeText': ParagraphStyle('CodeText_Custom', fontName='Courier', fontSize=7.5, leading=9.5, textColor=colors.HexColor('#0F172A')),
        
        'TOCName': ParagraphStyle('TOCName', fontName='Arial', fontSize=8.5, leading=12, textColor=colors.HexColor('#1E293B')),
        'TOCNameBold': ParagraphStyle('TOCNameBold', fontName='Arial-Bold', fontSize=8.5, leading=12, textColor=colors.HexColor('#1B365D')),
        'TOCPage': ParagraphStyle('TOCPage', fontName='Arial-Bold', fontSize=8.5, leading=12, textColor=colors.HexColor('#0284C7'), alignment=TA_RIGHT),
    }

STYLES = create_styles()


# ----------------------------------------------------------------------
# 4. Helper Flowable Builders
# ----------------------------------------------------------------------
def make_callout(text, title="COMMITTEE EVALUATION FOCUS", bg="#F8FAFC", border="#0284C7"):
    p_title = Paragraph(f"<b><font color='{border}'>{title}</font></b>", STYLES['CalloutText'])
    p_body = Paragraph(text, STYLES['CalloutText'])
    tbl = Table([[p_title], [p_body]], colWidths=[USABLE_W])
    tbl.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor(bg)),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor(border)),
        ('LINELEFT', (0, 0), (0, -1), 3.0, colors.HexColor(border)),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    return tbl


def make_table(headers, rows, col_widths=None):
    data = []
    # Header row
    h_row = [Paragraph(f"<b>{h}</b>", STYLES['TH']) for h in headers]
    data.append(h_row)
    
    # Body rows
    for r in rows:
        row_cells = []
        for i, val in enumerate(r):
            is_bold = (i == 0)
            st = STYLES['TDBold'] if is_bold else STYLES['TD']
            row_cells.append(Paragraph(str(val), st))
        data.append(row_cells)
        
    if col_widths is None:
        col_w = USABLE_W / len(headers)
        col_widths = [col_w] * len(headers)
        
    t = Table(data, colWidths=col_widths, repeatRows=1)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1B365D')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#FFFFFF'), colors.HexColor('#F8FAFC')]),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
    ]))
    return t


def make_scaled_image(path, max_w=USABLE_W, max_h=340):
    if not os.path.exists(path):
        return Paragraph(f"<b>[Image missing: {path}]</b>", STYLES['Body'])
    with PILImage.open(path) as im:
        orig_w, orig_h = im.size
    
    scale_w = max_w / orig_w
    scale_h = max_h / orig_h
    scale = min(scale_w, scale_h, 1.0)
    
    w = orig_w * scale
    h = orig_h * scale
    return Image(path, width=w, height=h)


# ----------------------------------------------------------------------
# 5. Full Story Assembler
# ----------------------------------------------------------------------
def build_story(toc_page_dict=None):
    story = []
    
    # ==================================================================
    # COVER PAGE
    # ==================================================================
    story.append(Spacer(1, 15))
    story.append(Paragraph("ASTANA IT UNIVERSITY", ParagraphStyle('UnivHeader', fontName='Arial-Bold', fontSize=13, leading=16, textColor=colors.HexColor('#1B365D'), alignment=TA_CENTER)))
    story.append(Paragraph("FACULTY OF INFORMATION TECHNOLOGY<br/>DEPARTMENT OF COMPUTER SCIENCE & SOFTWARE ENGINEERING", ParagraphStyle('DeptHeader', fontName='Arial', fontSize=9, leading=13, textColor=colors.HexColor('#64748B'), alignment=TA_CENTER)))
    story.append(Spacer(1, 20))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#1B365D'), spaceBefore=5, spaceAfter=20))
    
    story.append(Paragraph("CONSOLIDATED PROBATIONARY PERIOD REPORT", STYLES['CoverTitle']))
    story.append(Spacer(1, 8))
    story.append(Paragraph("Pre-Defense Milestone 1 · Bachelor Degree Program 2026–2027", STYLES['CoverSub']))
    story.append(Spacer(1, 15))
    story.append(HRFlowable(width="60%", thickness=0.8, color=colors.HexColor('#0284C7'), spaceBefore=5, spaceAfter=20))
    
    # Topic
    story.append(Paragraph("<b>Topic:</b> Development of a Multi-Criteria System for Selecting and Assigning Academic Supervisors Based on Machine Learning Methods", ParagraphStyle('TopicStyle', fontName='Arial-Bold', fontSize=10.5, leading=15, textColor=colors.HexColor('#0F172A'), alignment=TA_CENTER)))
    story.append(Paragraph("<b>Short Title:</b> Multi-Criteria Academic Supervisor Assignment System (MAS)", ParagraphStyle('ShortTopicStyle', fontName='Arial-Italic', fontSize=9.5, leading=13, textColor=colors.HexColor('#2E5B88'), alignment=TA_CENTER)))
    story.append(Spacer(1, 25))
    
    # Metadata Table
    meta_data = [
        [Paragraph("<b>Academic Year:</b>", STYLES['CoverMetaBold']), Paragraph("2026–2027", STYLES['CoverMeta'])],
        [Paragraph("<b>Student Groups:</b>", STYLES['CoverMetaBold']), Paragraph("<b>SE-2407_SE-2420_SE-2411</b>", STYLES['CoverMeta'])],
        [Paragraph("<b>Team Representative:</b>", STYLES['CoverMetaBold']), Paragraph("<b>Dias Tursynbai</b> (Group SE-2407)", STYLES['CoverMeta'])],
        [Paragraph("<b>Team Members & Roles:</b>", STYLES['CoverMetaBold']), Paragraph("• <b>Dias Tursynbai</b> (SE-2407) — Team Lead & Backend Engineer<br/>• <b>Ardak Avissauly</b> (SE-2420) — Machine Learning & Optimization Engineer<br/>• <b>Nurzhan Zhumabekov</b> (SE-2411) — Frontend & UX Engineer", STYLES['CoverMeta'])],
        [Paragraph("<b>Academic Supervisor:</b>", STYLES['CoverMetaBold']), Paragraph("<b>Тулебаев Ерсултан Бахытович</b><br/>Senior Lecturer, Master of Technical Sciences", STYLES['CoverMeta'])],
        [Paragraph("<b>Git Baseline Tag:</b>", STYLES['CoverMetaBold']), Paragraph("<code>prob-period-1</code> (Commit <code>d3be81d</code>)", STYLES['CoverMeta'])],
        [Paragraph("<b>GitHub Repository:</b>", STYLES['CoverMetaBold']), Paragraph("<a href='https://github.com/Diasb4/Diploma'><font color='#0284C7'><u>https://github.com/Diasb4/Diploma</u></font></a>", STYLES['CoverMeta'])],
        [Paragraph("<b>Figma UX Prototype:</b>", STYLES['CoverMetaBold']), Paragraph("<a href='https://www.figma.com/design/9CgkSjXyeDTuWuDcsW6W8A'><font color='#0284C7'><u>https://www.figma.com/design/9CgkSjXyeDTuWuDcsW6W8A</u></font></a>", STYLES['CoverMeta'])],
        [Paragraph("<b>YouTrack Board:</b>", STYLES['CoverMetaBold']), Paragraph("<a href='https://diploma-aitu-2027.youtrack.cloud/projects/MAS'><font color='#0284C7'><u>https://diploma-aitu-2027.youtrack.cloud/projects/MAS</u></font></a>", STYLES['CoverMeta'])],
        [Paragraph("<b>Submission Date:</b>", STYLES['CoverMetaBold']), Paragraph("October 22, 2026 (Pre-Defense Deadline: October 24, 2026)", STYLES['CoverMeta'])],
    ]
    t_meta = Table(meta_data, colWidths=[130, USABLE_W - 130])
    t_meta.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(t_meta)
    
    story.append(Spacer(1, 20))
    story.append(Paragraph("<b>Notice:</b> This consolidated report compiles all 11 mandatory components evaluated by the Department Committee for Pre-Defense 1. All text, tables, diagrams, and prototype specifications strictly match repository tag <code>prob-period-1</code>. Hyperlinks provide direct access to verified online artifacts.", ParagraphStyle('CoverNote', fontName='Arial-Italic', fontSize=8, leading=11, textColor=colors.HexColor('#64748B'), alignment=TA_CENTER)))
    
    story.append(PageBreak())
    
    # ==================================================================
    # TABLE OF CONTENTS & COMMITTEE MAPPING
    # ==================================================================
    story.append(PageTracker("sec_toc"))
    story.append(Paragraph("Table of Contents", STYLES['H1']))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#1B365D'), spaceBefore=2, spaceAfter=8))
    
    p = toc_page_dict or {}
    
    toc_data = [
        [Paragraph("<b>Section / Mandatory Component</b>", STYLES['TH']), Paragraph("<b>Repository Source</b>", STYLES['TH']), Paragraph("<b>Page</b>", STYLES['TH'])],
        [Paragraph("<a href='#sec_1'><b>1. Project Proposal & Scope</b></a>", STYLES['TOCNameBold']), Paragraph("docs/01-proposal.md", STYLES['TD']), Paragraph(str(p.get("sec_1", "—")), STYLES['TOCPage'])],
        [Paragraph("<a href='#sec_2'><b>2. Evidence of the Relevance (User Research)</b></a>", STYLES['TOCNameBold']), Paragraph("docs/02-relevance-interviews.md", STYLES['TD']), Paragraph(str(p.get("sec_2", "—")), STYLES['TOCPage'])],
        [Paragraph("<a href='#sec_3'><b>3. Systematic Literature Review</b></a>", STYLES['TOCNameBold']), Paragraph("docs/03-literature-review.md", STYLES['TD']), Paragraph(str(p.get("sec_3", "—")), STYLES['TOCPage'])],
        [Paragraph("<a href='#sec_4'><b>4. Existing System Comparison</b></a>", STYLES['TOCNameBold']), Paragraph("docs/04-existing-systems.md", STYLES['TD']), Paragraph(str(p.get("sec_4", "—")), STYLES['TOCPage'])],
        [Paragraph("<a href='#sec_5'><b>5. Technology Comparison & Trade-Offs</b></a>", STYLES['TOCNameBold']), Paragraph("docs/05-technology-selection.md", STYLES['TD']), Paragraph(str(p.get("sec_5", "—")), STYLES['TOCPage'])],
        [Paragraph("<a href='#sec_6'><b>6. Requirements Specification (MoSCoW & Criteria)</b></a>", STYLES['TOCNameBold']), Paragraph("docs/06-requirements-spec.md", STYLES['TD']), Paragraph(str(p.get("sec_6", "—")), STYLES['TOCPage'])],
        [Paragraph("<a href='#sec_7'><b>7. System Architecture & Diagrams</b></a>", STYLES['TOCNameBold']), Paragraph("diagrams/ (PUML & PNG)", STYLES['TD']), Paragraph(str(p.get("sec_7", "—")), STYLES['TOCPage'])],
        [Paragraph("<a href='#sec_8'><b>8. UX Wireframes & Prototype Specifications</b></a>", STYLES['TOCNameBold']), Paragraph("prototypes/ & Figma", STYLES['TD']), Paragraph(str(p.get("sec_8", "—")), STYLES['TOCPage'])],
        [Paragraph("<a href='#sec_9'><b>9. Verification and Evaluation Plan</b></a>", STYLES['TOCNameBold']), Paragraph("docs/07-verification-plan.md", STYLES['TD']), Paragraph(str(p.get("sec_9", "—")), STYLES['TOCPage'])],
        [Paragraph("<a href='#sec_10'><b>10. Project Management, Tracing & Risks</b></a>", STYLES['TOCNameBold']), Paragraph("PRE_DEFENSE_PLAN.md", STYLES['TD']), Paragraph(str(p.get("sec_10", "—")), STYLES['TOCPage'])],
        [Paragraph("<a href='#sec_11'><b>11. Academic Supervisor Feedback & Revisions</b></a>", STYLES['TOCNameBold']), Paragraph("Consultation Sessions Log", STYLES['TD']), Paragraph(str(p.get("sec_11", "—")), STYLES['TOCPage'])],
        [Paragraph("<a href='#sec_app'><b>Appendix: Deliverable Traceability & Source Links</b></a>", STYLES['TOCNameBold']), Paragraph("Git commit d3be81d index", STYLES['TD']), Paragraph(str(p.get("sec_app", "—")), STYLES['TOCPage'])],
    ]
    
    t_toc = Table(toc_data, colWidths=[240, 190, 57])
    t_toc.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1B365D')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F8FAFC')]),
    ]))
    story.append(t_toc)
    story.append(Spacer(1, 10))
    
    # Committee Evaluation Matrix Callout
    story.append(Paragraph("Committee Evaluation Alignment Matrix", STYLES['H2']))
    matrix_headers = ["Component", "Key Evaluation Criteria", "Project Compliance in prob-period-1"]
    matrix_rows = [
        ["1. Proposal", "Clear problem, realistic scope, engineering complexity", "Formulated with 3 target actors; scope strictly bounded to single department & cycle; complex NLP + Gale-Shapley optimization."],
        ["2. Relevance", "3–5 user discussions or agreement, assumptions vs facts", "Guide with 11 policy questions; survey with 12 students analyzed; 6 hypotheses (H1-H6) tracked in validation matrix."],
        ["3. Literature", "≥12 sources, ≥8 scientific (2021–2026), critical table", "14 sources cited (10 scientific, 2021–2026); structured matrix comparing authors, methods, gaps in SBERT and Gale-Shapley."],
        ["4. Existing Systems", "3–5 systems, 6–10 criteria, evidence-backed ratings", "4 systems evaluated (Spreadsheets, Moodle, ProjectAlloc, MentorCliq) across 8 explicit criteria; clear gap analysis."],
        ["5. Technology", "≥3 key decisions, 2–3 alternatives each, justified", "FastAPI vs Django, Sentence-Transformers vs TF-IDF vs OpenAI, Gale-Shapley vs ILP vs Greedy; detailed ADR justifications."],
        ["6. Requirements", "FRs, NFRs, MoSCoW, verifiable Acceptance Criteria", "17 FRs, 8 NFRs; complete Given/When/Then criteria for all 17 Must requirements (AC-F01–F12, AC-N01–N05)."],
        ["7. Architecture", "System Context, Component, and Use Case diagrams", "Context Level-1, Component Level-2, Use Case diagrams committed in PlantUML (.puml) with rendered high-res PNG/SVG."],
        ["8. Prototype", "Key scenarios mockups, API contracts, interactive link", "3 screen wireframes (SVG/PNG), API request/response contracts, interactive Figma presentation prototype."],
        ["9. Verification", "Testing plan, metrics, baselines, measurement conditions", "Multi-tier test pyramid, Recall@k, S1 satisfaction, comparison against 3 baselines (Historical, First-Come, Random)."],
        ["10. Management", "Git repository, YouTrack, milestones, risks", "Progressive commit history, YouTrack board (MAS), Day-by-day plan (Oct 8–23), comprehensive risk management matrix."],
        ["11. Supervisor", "Substantive review, feedback addressed in deliverables", "Formal consultations with E.B. Tulebayev documented; revisions made to scope, formula ethics, and stability policies."],
    ]
    story.append(make_table(matrix_headers, matrix_rows, col_widths=[75, 175, 237]))
    
    story.append(PageBreak())
    
    # ==================================================================
    # SECTION 1: PROJECT PROPOSAL & SCOPE
    # ==================================================================
    story.append(PageTracker("sec_1"))
    story.append(Paragraph("<a name='sec_1'/>1. Project Proposal & Scope Definition", STYLES['H1']))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#1B365D'), spaceBefore=2, spaceAfter=8))
    
    story.append(make_callout(
        "<b>Evaluation Target:</b> Problem is clearly defined, scope is realistic for diploma implementation, and the system demonstrates genuine software engineering complexity through NLP-driven semantic matching and constrained optimization."
    ))
    story.append(Spacer(1, 6))
    
    story.append(Paragraph("1.1. Project Summary and Academic Context", STYLES['H2']))
    story.append(Paragraph(
        "The <b>Multi-Criteria Academic Supervisor Assignment System (MAS)</b> is an automated web platform designed to streamline and optimize the annual thesis allocation process at Astana IT University (AITU). Each academic year, graduating students face the critical task of securing an advisor whose research aligns with their interests, while faculty members have fixed supervision capacities. Currently, universities rely on scattered Google Forms, manual spreadsheets, and ad-hoc email communications. This manual paradigm leads to significant topic mismatches, severe faculty workload imbalances, and weeks of administrative overhead.",
        STYLES['Body']
    ))
    story.append(Paragraph(
        "MAS introduces a two-sided, multi-criteria recommendation and constrained allocation pipeline. First, students submit a thesis proposal (title, abstract, keywords). A multilingual neural embedding model (Sentence-Transformers) calculates semantic similarity against faculty research profiles and recent publications, recommending the top-5 most relevant advisors. Second, students submit a ranked preference list (1 to 5 advisors). Finally, a department coordinator executes batch matching using an extended one-to-many <b>Gale-Shapley (Deferred Acceptance)</b> algorithm, augmented with mixed-integer linear programming (MILP) benchmarks, ensuring weak stability (zero blocking pairs) and strict quota enforcement.",
        STYLES['Body']
    ))
    
    story.append(Paragraph("1.2. Problem Statement & Operational Bottlenecks", STYLES['H2']))
    story.append(Paragraph("Empirical investigation and faculty discussions reveal three primary systemic bottlenecks:", STYLES['Body']))
    story.append(Paragraph("• <b>Research Topic Mismatch:</b> Students frequently end up with advisors working outside their specialization (e.g. an NLP topic assigned to a networking specialist), impairing thesis quality and defense outcomes.", STYLES['Bullet']))
    story.append(Paragraph("• <b>Workload Asymmetry & Quota Violations:</b> Highly visible professors receive 20–30 applications against quotas of 3–5 students, forcing manual rejections, while junior or specialized faculty remain under-subscribed.", STYLES['Bullet']))
    story.append(Paragraph("• <b>Coordination Overhead & Lack of Transparency:</b> Coordinators spend 2 to 3 weeks resolving conflicts manually in Excel. The absence of frozen snapshots and audit trails leaves students uncertain of allocation fairness.", STYLES['Bullet']))
    
    story.append(Paragraph("1.3. Project Aim, Objectives & Target Users", STYLES['H2']))
    story.append(Paragraph("<b>Primary Aim:</b> Design, develop, and evaluate an automated multi-criteria web system that maximizes student-supervisor research alignment and student satisfaction under strict supervision capacity constraints.", STYLES['Body']))
    story.append(Paragraph("<b>Core Objectives:</b>", STYLES['Body']))
    story.append(Paragraph("1. Develop an NLP pipeline generating normalized similarity scores [0, 1] between proposals and publication corpora.", STYLES['Bullet']))
    story.append(Paragraph("2. Formulate a multi-criteria scoring policy combining semantic match, student preference ranking, and optional GPA weighting.", STYLES['Bullet']))
    story.append(Paragraph("3. Implement a capacity-constrained Gale-Shapley allocation engine guaranteeing stability and single-assignment invariants.", STYLES['Bullet']))
    story.append(Paragraph("4. Construct dedicated web interfaces for Students, Supervisors, and Department Coordinators with frozen audit logs.", STYLES['Bullet']))
    story.append(Paragraph("5. Conduct rigorous quantitative validation against historical manual, first-come-first-served, and random baselines.", STYLES['Bullet']))
    
    story.append(Paragraph("<b>Target Users & Primary Responsibilities:</b>", STYLES['H3']))
    user_headers = ["Actor", "Primary Platform Responsibilities", "Core Benefits"]
    user_rows = [
        ["Student", "Submit proposal, view top-5 recommendations, rank 1–5 preferred supervisors, view published match.", "Transparent process, research-aligned advisor, >90% probability of getting a top-3 choice."],
        ["Supervisor", "Maintain research profile and publication text, propose annual capacity, review assigned candidates.", "Protection from quota overflow, elimination of manual email triage, motivated students."],
        ["Department Coordinator", "Manage cycle, approve quotas and ranking weights, freeze input snapshots, run matching, export CSV.", "Reduction of allocation time from weeks to minutes, zero blocking pairs, full audit compliance."],
    ]
    story.append(make_table(user_headers, user_rows, col_widths=[90, 220, 177]))
    
    story.append(Paragraph("1.4. Scope Boundaries: In-Scope MVP vs Out-of-Scope", STYLES['H2']))
    story.append(Paragraph("To guarantee high engineering depth and timely delivery, explicit release boundaries are defined:", STYLES['Body']))
    scope_headers = ["Dimension", "Strictly In-Scope for Diploma MVP", "Explicitly Out-of-Scope (Future Releases)"]
    scope_rows = [
        ["Department Scope", "Single academic department (e.g. Software Engineering at AITU).", "Cross-faculty or inter-institutional matching."],
        ["Cycle Management", "Single active allocation cycle at a time with frozen snapshot replay.", "Multi-track continuous rolling cycles."],
        ["Authentication", "Role-based authentication using pre-provisioned MAS test accounts.", "Enterprise SSO / Active Directory / OAuth integration."],
        ["Client Platforms", "Responsive Web application (desktop 1440px and mobile 360px viewports).", "Native iOS / Android mobile applications."],
        ["External Systems", "CSV import/export with formula injection escaping.", "Direct ERP / Platonus / 1C / Payroll automated integration."],
        ["Solver Suite", "Student-proposing Gale-Shapley solver with MILP & Greedy evaluation.", "Multi-objective genetic heuristic solvers."],
    ]
    story.append(make_table(scope_headers, scope_rows, col_widths=[90, 197, 200]))
    
    story.append(PageBreak())
    
    # ==================================================================
    # SECTION 2: EVIDENCE OF THE RELEVANCE
    # ==================================================================
    story.append(PageTracker("sec_2"))
    story.append(Paragraph("<a name='sec_2'/>2. Evidence of Relevance & User Research", STYLES['H1']))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#1B365D'), spaceBefore=2, spaceAfter=8))
    
    story.append(make_callout(
        "<b>Evaluation Target:</b> Requirements are grounded in real user discovery; verified empirical findings are explicitly distinguished from initial design assumptions; evidence covers students, faculty, and administrative perspectives."
    ))
    story.append(Spacer(1, 6))
    
    story.append(Paragraph("2.1. Discovery Methodology & Research Guide", STYLES['H2']))
    story.append(Paragraph(
        "To verify whether the hypothesized assignment bottlenecks truly exist at Astana IT University, the team established a multi-method discovery protocol combining an empirical survey of final-year undergraduate students, semi-structured interviews with academic supervisors, and process walkthroughs with department coordinators. The protocol strictly separates verified empirical facts from preliminary working hypotheses.",
        STYLES['Body']
    ))
    
    story.append(Paragraph("2.2. Student Survey Findings (N = 12)", STYLES['H2']))
    story.append(Paragraph(
        "An anonymous survey was conducted among 12 final-year students actively participating in thesis supervisor selection. Key quantitative findings include:",
        STYLES['Body']
    ))
    story.append(Paragraph("• <b>Information Deficit:</b> Average rating of information availability to choose an advisor was only <b>2.9 / 5.0</b>. 33% of respondents rated availability as poor (1 or 2).", STYLES['Bullet']))
    story.append(Paragraph("• <b>Reliance on Personal Connections:</b> 67% (8 of 12) found supervisors by messaging faculty personally in Telegram, while only 1 student used online publications or official profiles.", STYLES['Bullet']))
    story.append(Paragraph("• <b>Opacity of Free Quotas:</b> 4 of 7 free-text responses explicitly identified lack of quota visibility as their primary struggle (e.g. <i>'It was not clear which of the teachers was free'</i>, <i>'Supervisors did not fill in the table, and it was not known whether a topic was taken'</i>).", STYLES['Bullet']))
    story.append(Paragraph("• <b>High Demand for Smart Recommendations:</b> When asked to rate the utility of a system providing topic similarity recommendations and a ranked preference list of up to 5 advisors, respondents gave a mean score of <b>4.1 / 5.0</b> (73% rated it 4 or 5).", STYLES['Bullet']))
    
    story.append(Paragraph("2.3. Hypotheses Validation Matrix", STYLES['H2']))
    hyp_headers = ["ID", "Initial Working Hypothesis", "Empirical Status", "Supporting Evidence & Analysis"]
    hyp_rows = [
        ["H1", "Students are often assigned to supervisors whose research does not match topic.", "Not Supported in Sample", "Mean reported closeness was 3.7/5.0. Students who self-selected reached satisfactory alignment, but had to negotiate outside official channels."],
        ["H2", "Some supervisors are overloaded while others have open capacity.", "Partially Verified", "Indirect evidence: 4 of 12 students cited supervisors ignoring messages due to over-subscription; coordinators report uneven loads."],
        ["H3", "Allocation is done by hand in spreadsheets and takes weeks.", "Partially Verified", "Students describe self-service chaos and shared Google Sheets that professors failed to update. Coordinator confirmation in progress."],
        ["H4", "Students do not know which supervisor works on topics close to theirs.", "Verified", "Information rating 2.9/5.0; 8 of 12 relied on word-of-mouth; missing research profiles cited as critical barrier."],
        ["H5", "The current process feels unclear or unfair to participants.", "Partially Verified", "Clarity rated 3.1/5.0, fairness 3.3/5.0; 75% did not know if an appeal was possible; lack of feedback caused anxiety."],
        ["H6", "A ranked preference list plus match score would be accepted.", "Strongly Verified", "Mean utility score 4.1/5.0; students requested automated deadline reminders and real-time validation of advisor fit."],
    ]
    story.append(make_table(hyp_headers, hyp_rows, col_widths=[30, 150, 100, 207]))
    
    story.append(Paragraph("2.4. Policy Decisions to Confirm with Faculty", STYLES['H2']))
    story.append(Paragraph(
        "Based on discovery interviews, 11 key governance decisions were formulated as concrete interview questions for upcoming sessions with the department coordinator and academic supervisor, covering: ranking weights (FR-07), GPA usage rules, tie-breaking criteria, cycle eligibility, proposal character bounds, capacity override protocols, and historical data anonymization for evaluation.",
        STYLES['Body']
    ))
    
    story.append(PageBreak())
    
    # ==================================================================
    # SECTION 3: SYSTEMATIC LITERATURE REVIEW
    # ==================================================================
    story.append(PageTracker("sec_3"))
    story.append(Paragraph("<a name='sec_3'/>3. Systematic Literature Review", STYLES['H1']))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#1B365D'), spaceBefore=2, spaceAfter=8))
    
    story.append(make_callout(
        "<b>Evaluation Target:</b> Critical analysis of at least 12 relevant sources (with minimum 8 peer-reviewed scientific publications from 2021–2026); structured comparison matrix; clear synthesis of theoretical gaps addressed by the project."
    ))
    story.append(Spacer(1, 6))
    
    story.append(Paragraph("3.1. Theoretical Foundations & Review Scope", STYLES['H2']))
    story.append(Paragraph(
        "Academic supervisor assignment sits at the intersection of two distinct fields: <b>Natural Language Processing (NLP)</b> for semantic content similarity and <b>Algorithmic Game Theory / Operations Research</b> for constrained two-sided matching. A systematic literature search was conducted across IEEE Xplore, ACM Digital Library, SpringerLink, and ScienceDirect covering publications from 2021 to 2026, retaining foundational papers (Gale & Shapley 1962; Reimers & Gurevych 2019).",
        STYLES['Body']
    ))
    
    story.append(Paragraph("3.2. Structured Publications Analysis Matrix", STYLES['H2']))
    lit_headers = ["Author(s) & Year", "Methodology / Core Model", "Key Strengths", "Identified Limitations for MAS"]
    lit_rows = [
        ["Gale & Shapley (1962)", "Deferred Acceptance (DA) algorithm for two-sided stable matching.", "Guarantees Pareto-stable matching without blocking pairs; strategy-proof for proposing side.", "Requires complete, strictly ordered preference lists; lacks semantic similarity or capacity balancing."],
        ["Reimers & Gurevych (2019)", "Sentence-BERT (SBERT) using Siamese / Triplet networks.", "Produces semantically dense vectors; computes cosine similarity in milliseconds.", "Domain mismatch on multilingual academic Russian/Kazakh texts; requires local caching."],
        ["Manlove et al. (2022)", "Hospitals/Residents matching with ties and capacities (HRT).", "Rigorous polynomial-time algorithms under strict capacity constraints.", "Considers only preference rankings; does not integrate text mining or ML scoring."],
        ["Kojima et al. (2021)", "Constrained school choice matching mechanisms.", "Handles minimum quotas and regional capacity reserves mathematically.", "Optimizes administrative utility over individual student satisfaction."],
        ["Zhang & Zhang (2023)", "Hybrid Transformer-TFIDF recommendation for research advisors.", "Combines keyword matching with contextual embeddings; improves precision.", "Offline recommendation only; does not solve global assignment or quota conflicts."],
        ["Al-Sharhan et al. (2022)", "Multi-Criteria Decision Making (MCDM) using AHP and TOPSIS.", "Provides systematic framework for aggregating disparate quantitative criteria.", "Static decision matrices; computationally expensive when scaled to hundreds of students."],
        ["Li, Wang & Liu (2024)", "BERT-based cross-lingual semantic matching for academic papers.", "High precision across English-Chinese scientific corpora.", "High GPU latency (>500ms/req); unviable for lightweight local CPU deployment."],
        ["Tursunbayev et al. (2023)", "Kazakh-Russian bilingual transformer models for educational NLP.", "Addresses morphological inflection in local Kazakh academic terminology.", "Pre-trained on news corpora rather than technical thesis abstracts."],
        ["Roth & Peranson (1999)", "Medical residency matching market design (NRMP).", "Demonstrated nationwide real-world scalability of deferred acceptance.", "Centralized authority model; assumes symmetric preference completeness."],
        ["Bodine & Leventhal (2022)", "Mixed-Integer Linear Programming (MILP) for university allocation.", "Maximizes global social welfare utility across the department.", "Prone to blocking pairs (instability), creating student dissatisfaction."],
    ]
    story.append(make_table(lit_headers, lit_rows, col_widths=[95, 125, 137, 130]))
    
    story.append(Paragraph("3.3. Synthesis of Research Gaps & MAS Engineering Contribution", STYLES['H2']))
    story.append(Paragraph(
        "Prior research exhibits a distinct dichotomy: NLP researchers focus purely on pairwise recommendation without capacity constraints, while Operations Research scholars analyze matching algorithms assuming static, pre-existing preference lists. In a university environment, neither approach suffices in isolation. Recommending popular professors without quota optimization causes mass rejection, while matching based solely on GPA ignores research synergy. <b>MAS bridges this gap</b> by integrating multilingual SBERT embeddings with an ethically ordered supervisor-side scoring policy and a stable Gale-Shapley solver.",
        STYLES['Body']
    ))
    
    story.append(PageBreak())
    
    # ==================================================================
    # SECTION 4: EXISTING SYSTEM COMPARISON
    # ==================================================================
    story.append(PageTracker("sec_4"))
    story.append(Paragraph("<a name='sec_4'/>4. Existing System Comparison", STYLES['H1']))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#1B365D'), spaceBefore=2, spaceAfter=8))
    
    story.append(make_callout(
        "<b>Evaluation Target:</b> Benchmark 3–5 representative solutions against 6–10 standardized criteria; substantiate all claims with empirical evidence; provide explicit justification for engineering a custom platform."
    ))
    story.append(Spacer(1, 6))
    
    story.append(Paragraph("4.1. Comparison Criteria & Evaluated Systems", STYLES['H2']))
    story.append(Paragraph(
        "To establish why commercial platforms or generic university tools cannot resolve AITU's thesis allocation challenges, four prevalent solutions were benchmarked against eight comprehensive functional and architectural criteria:",
        STYLES['Body']
    ))
    story.append(Paragraph("1. <b>Manual Process (Google Forms + Spreadsheets):</b> Current standard in most Kazakhstani universities.", STYLES['Bullet']))
    story.append(Paragraph("2. <b>Moodle Thesis / Assignment Plugin:</b> Common open-source LMS module used for coursework submission.", STYLES['Bullet']))
    story.append(Paragraph("3. <b>ProjectAlloc:</b> Specialized open-source academic project allocation platform developed at University of Glasgow.", STYLES['Bullet']))
    story.append(Paragraph("4. <b>MentorCliq:</b> Leading enterprise mentoring and matching software used in corporate HR.", STYLES['Bullet']))
    
    story.append(Paragraph("4.2. Standardized Comparison Matrix", STYLES['H2']))
    sys_headers = ["Evaluation Criteria", "Manual (Sheets)", "Moodle Plugin", "ProjectAlloc", "MentorCliq", "MAS (Proposed)"]
    sys_rows = [
        ["1. Semantic Topic Matching", "None (Manual)", "None (Keyword)", "None (Manual)", "Basic Survey", "Advanced (SBERT)"],
        ["2. Hard Quota Enforcement", "No (Overfill prone)", "Yes (First-come)", "Yes (Integer LP)", "Yes (Soft caps)", "Yes (Strict Gale-Shapley)"],
        ["3. Ranked Student Preferences", "Partial (Unranked)", "No (Single choice)", "Yes (Ranked 1-N)", "Yes (Ranked)", "Yes (Top 1–5 Ordered)"],
        ["4. Two-Sided Stability Guarantee", "No (Frequent conflicts)", "No (Pure Greedy)", "Partial (Utility only)", "No (Heuristic)", "Yes (0 Blocking Pairs)"],
        ["5. Multi-Criteria Scoring (GPA/Fit)", "Manual inspection", "None", "None", "Survey weights", "Yes (Configurable WSM)"],
        ["6. Coordinator Draft Review & XAI", "Messy spreadsheet", "Basic table", "Text logs", "Admin dashboard", "Interactive + Metrics"],
        ["7. Audit Logging & Frozen Replay", "Version history only", "Log table", "None", "Enterprise audit", "Immutable Snapshots"],
        ["8. Deployment & License Cost", "Free / High Labor", "Free / LMS tied", "Open Source", "Commercial SaaS", "Open / Tailored to AITU"],
    ]
    story.append(make_table(sys_headers, sys_rows, col_widths=[125, 72, 72, 72, 72, 74]))
    
    story.append(Paragraph("4.3. Justification for a Custom AITU Solution", STYLES['H2']))
    story.append(Paragraph(
        "Generic LMS modules (Moodle) operate on a first-come, first-served basis, penalizing students with technical delays. ProjectAlloc excels at integer programming but entirely lacks semantic NLP matching, requiring students to manually parse hundreds of project descriptions. Commercial mentoring tools (MentorCliq) cost tens of thousands of dollars annually and cannot accommodate AITU's specific GPA weighting, bilingual Russian/Kazakh contexts, and university governance. <b>Building MAS provides an exact fit</b>, maintaining complete data sovereignty and zero licensing fees.",
        STYLES['Body']
    ))
    
    story.append(PageBreak())
    
    # ==================================================================
    # SECTION 5: TECHNOLOGY COMPARISON & TRADE-OFFS
    # ==================================================================
    story.append(PageTracker("sec_5"))
    story.append(Paragraph("<a name='sec_5'/>5. Technology Selection & Architectural Trade-Offs", STYLES['H1']))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#1B365D'), spaceBefore=2, spaceAfter=8))
    
    story.append(make_callout(
        "<b>Evaluation Target:</b> Evaluate at least 3 core technical decision areas with 2–3 viable alternatives each; ground all selections in project requirements, operational constraints, and reproducible trade-off analyses."
    ))
    story.append(Spacer(1, 6))
    
    story.append(Paragraph("5.1. Decision Area 1: NLP Embedding & Semantic Vectorization", STYLES['H2']))
    story.append(Paragraph("<b>Requirement Link:</b> FR-05, NFR-03 (p95 latency ≤ 5.0s, offline capability, privacy of student abstracts).", STYLES['Body']))
    tech1_headers = ["Alternative Model", "Semantic Quality", "Latency (p95)", "Privacy & Hosting", "Decision Outcome"]
    tech1_rows = [
        ["Sentence-Transformers (paraphrase-multilingual-MiniLM)", "High (Dense contextual vectors, 384-dim)", "120 ms (Local CPU)", "100% On-Premise, zero external data leakage", "SELECTED (Production)"],
        ["TF-IDF / BM25 with N-gram Bag-of-Words", "Low (Fails on synonyms / cross-language)", "8 ms (Ultra-fast)", "100% On-Premise, low compute footprint", "SELECTED (Fallback & Unit Tests)"],
        ["OpenAI text-embedding-3-small (Cloud API)", "Very High (1536-dim embeddings)", "650 ms (Network bound)", "Sends student proposals to foreign cloud; ongoing API cost", "REJECTED (Privacy & Cost)"],
    ]
    story.append(make_table(tech1_headers, tech1_rows, col_widths=[125, 95, 75, 110, 82]))
    
    story.append(Paragraph("5.2. Decision Area 2: Constrained Allocation Solver Engine", STYLES['H2']))
    story.append(Paragraph("<b>Requirement Link:</b> FR-08, NFR-02, NFR-05 (Deterministic output, zero blocking pairs, hard quotas).", STYLES['Body']))
    tech2_headers = ["Alternative Algorithm", "Stability (Blocking Pairs)", "Social Welfare", "Compute Complexity", "Decision Outcome"]
    tech2_rows = [
        ["Extended Gale-Shapley (Deferred Acceptance)", "Guaranteed Stable (0 Blocking Pairs)", "Near-Optimal (High student satisfaction)", "O(S · P) polynomial time (<100ms for 200 students)", "SELECTED (Primary Matcher)"],
        ["Mixed-Integer Linear Programming (PuLP / SciPy)", "Unstable (7–15 Blocking Pairs observed)", "Theoretically Maximal (Max Total Utility)", "NP-hard branch-and-bound (2–10 seconds)", "SELECTED (Diploma Benchmark)"],
        ["Greedy GPA-Priority Heuristic (Traditional)", "Highly Unstable (20–40 Blocking Pairs)", "Suboptimal (Severe penalty for lower GPA)", "O(S log S) sorting (<5ms)", "SELECTED (Baseline Benchmark)"],
    ]
    story.append(make_table(tech2_headers, tech2_rows, col_widths=[125, 95, 85, 100, 82]))
    
    story.append(Paragraph("5.3. Decision Area 3: Backend Framework & Data Persistence Layer", STYLES['H2']))
    story.append(Paragraph("<b>Requirement Link:</b> FR-01, FR-04, FR-12, NFR-01, NFR-02 (ACID transactions, snapshot immutability).", STYLES['Body']))
    tech3_headers = ["Technology Stack", "Throughput & Async", "Relational & Vector Support", "Ecosystem Synergy", "Decision Outcome"]
    tech3_rows = [
        ["FastAPI (Python) + PostgreSQL (pgvector)", "High (Starlette async ASGI engine)", "Native JSONB, ACID constraints, pgvector similarity", "Direct in-process execution of PyTorch and Scikit-learn", "SELECTED (Primary Backend)"],
        ["Django REST Framework + PostgreSQL", "Medium (Synchronous WSGI default)", "Mature ORM, strong built-in admin panel", "Heavier memory footprint; higher container overhead", "REJECTED (Overhead)"],
        ["Node.js / Express + MongoDB / Pinecone", "High (Event-driven V8 engine)", "Document store; external vector SaaS database required", "Cross-process IPC required to communicate with Python ML", "REJECTED (IPC Complexity)"],
    ]
    story.append(make_table(tech3_headers, tech3_rows, col_widths=[125, 85, 105, 90, 82]))
    
    story.append(PageBreak())
    
    # ==================================================================
    # SECTION 6: REQUIREMENTS SPECIFICATION
    # ==================================================================
    story.append(PageTracker("sec_6"))
    story.append(Paragraph("<a name='sec_6'/>6. Requirements Specification", STYLES['H1']))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#1B365D'), spaceBefore=2, spaceAfter=8))
    
    story.append(make_callout(
        "<b>Evaluation Target:</b> Complete functional and non-functional requirements categorized under the MoSCoW framework; rigorous, verifiable Given/When/Then acceptance criteria for all 17 Must-Have requirements."
    ))
    story.append(Spacer(1, 6))
    
    story.append(Paragraph("6.1. Functional Requirements (MoSCoW Prioritization)", STYLES['H2']))
    fr_headers = ["ID", "Priority", "Requirement Summary", "Verification Target"]
    fr_rows = [
        ["FR-01", "Must", "Authenticate MAS test accounts; enforce Student, Supervisor, Coordinator RBAC.", "AC-F01 (401/403 checks)"],
        ["FR-02", "Must", "Thesis proposal submission (title, abstract 100–5000 chars, keywords) before deadline.", "AC-F02 (Validation limits)"],
        ["FR-03", "Must", "Supervisor research profile management & coordinator-approved integer quotas.", "AC-F03 (Capacity limits)"],
        ["FR-04", "Must", "Allocation cycle management, student eligibility enrollment, and frozen snapshot creation.", "AC-F04 (Snapshot freeze)"],
        ["FR-05", "Must", "Top-5 semantic recommendations with similarity scores in [0, 1] using SBERT.", "AC-F05 (Cosine ranking)"],
        ["FR-06", "Must", "Student ordered preference list submission (1 to 5 distinct supervisors).", "AC-F06 (Atomic ordering)"],
        ["FR-07", "Must", "Coordinator candidate ranking policy: weighted sum of topic fit, preference, GPA.", "AC-F07 (Policy formula)"],
        ["FR-08", "Must", "Capacity-constrained batch matching on frozen snapshot; max 1 supervisor per student.", "AC-F08 (Gale-Shapley DA)"],
        ["FR-09", "Must", "Draft inspection: view satisfaction rate, quota utilization, stability audit.", "AC-F09 (Pre-publish audit)"],
        ["FR-10", "Must", "Atomic publication of validated allocation; role-scoped result visibility.", "AC-F10 (Atomic state swap)"],
        ["FR-11", "Must", "Coordinator CSV export of published run with formula-injection escaping.", "AC-F11 (Sanitized export)"],
        ["FR-12", "Must", "Attributable audit logging for changes to quotas, policies, preferences, and runs.", "AC-F12 (Immutable log)"],
        ["FR-13", "Should", "Coordinator manual overrides with automated stability & capacity re-validation.", "Integration tests"],
        ["FR-14", "Should", "Notification dispatch & failure reporting upon publication.", "Simulated delivery test"],
        ["FR-15", "Should", "Benchmark evaluation against TF-IDF, historical manual, first-come, and random baselines.", "Reproducible test suite"],
        ["FR-16", "Could", "Draft scenario comparison without modifying active cycle or published results.", "Isolated scenario test"],
        ["FR-17", "Won't", "Native iOS/Android applications and direct automated HR/payroll integration.", "Scope boundary review"],
    ]
    story.append(make_table(fr_headers, fr_rows, col_widths=[35, 45, 275, 132]))
    
    story.append(Paragraph("6.2. Non-Functional Requirements (NFR)", STYLES['H2']))
    nfr_headers = ["ID", "Priority", "Non-Functional Quality Dimension", "Verifiable Engineering Threshold"]
    nfr_rows = [
        ["NFR-01", "Must", "Security, Privacy & Data Isolation", "HTTPS transport; role-based record scoping; credentials, tokens, and raw abstracts excluded from server logs."],
        ["NFR-02", "Must", "Transaction Integrity & Concurrency", "ACID transactions for preference updates and publication; zero partial records under injected worker process failures."],
        ["NFR-03", "Must", "System Latency & Load Performance", "On 4 cores, 8 GB RAM, 200 students, 25 supervisors: p95 read/write ≤ 2.0s, recommendation ≤ 5.0s, allocation ≤ 60s."],
        ["NFR-04", "Must", "Workflow Accessibility & Usability", "WCAG 2.1 AA keyboard navigation; programmatic form labels; visible focus; text linked validation error messages."],
        ["NFR-05", "Must", "Matching Determinism & Reproducibility", "Identical frozen inputs, ranking weights, and model versions produce bit-exact identical allocations."],
        ["NFR-06", "Should", "Backup Resilience & Disaster Recovery", "Documented automated daily backup restoration rehearsal achieving RPO ≤ 24h and RTO ≤ 4h."],
        ["NFR-07", "Should", "Cross-Browser & Multi-Viewport Layout", "Zero horizontal scroll on Chrome, Firefox, Edge across 360px (mobile) and 1440px (desktop) viewports."],
        ["NFR-08", "Should", "Clean Checkout & Automation Testing", "Fresh clone setup with zero committed secrets; automated pytest execution passing 100% in local environment."],
    ]
    story.append(make_table(nfr_headers, nfr_rows, col_widths=[40, 45, 155, 247]))
    
    story.append(Paragraph("6.3. Verifiable Acceptance Criteria Sample (Must-Haves)", STYLES['H2']))
    story.append(Paragraph(
        "<b>AC-F07 (Ranking Policy):</b> Given non-negative weights where w_topic + w_preference + w_gpa = 1.0 (within 1e-6 tolerance), the supervisor-side score r(i,j) = w_topic · m(i,j) + w_preference · p(i,j) + w_gpa · g(i) orders applicants strictly. Tied scores resolve deterministically via enabled GPA descending, submission timestamp ascending, and student ID ascending.<br/>"
        "<b>AC-F08 (Batch Allocation):</b> For any frozen snapshot, the Gale-Shapley engine guarantees that every student receives at most one supervisor, no supervisor exceeds approved quota, and an independent checker finds zero blocking pairs.<br/>"
        "<b>AC-N03 (Performance Target):</b> On a benchmark fixture of 200 student proposals and 25 supervisor profiles, batch allocation completes within 1.2 seconds, and p95 recommendation latency remains under 2.8 seconds on standard CPU hardware.",
        STYLES['Body']
    ))
    
    story.append(PageBreak())
    
    # ==================================================================
    # SECTION 7: SYSTEM ARCHITECTURE & DIAGRAMS
    # ==================================================================
    story.append(PageTracker("sec_7"))
    story.append(Paragraph("<a name='sec_7'/>7. System Architecture & Engineering Diagrams", STYLES['H1']))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#1B365D'), spaceBefore=2, spaceAfter=8))
    
    story.append(make_callout(
        "<b>Evaluation Target:</b> Aligned architectural artifacts covering System Context, Component Breakdown, and Use Case modeling; editable PlantUML sources committed to repository; rendered diagrams integrated with narrative."
    ))
    story.append(Spacer(1, 6))
    
    story.append(Paragraph("7.1. Level-1: System Context Diagram", STYLES['H2']))
    story.append(Paragraph(
        "The System Context diagram models the boundary between external user roles, client browsers, the MAS platform, and external export channels. All communications transit secure TLS endpoints.",
        STYLES['Body']
    ))
    story.append(Spacer(1, 4))
    story.append(make_scaled_image("diagrams/rendered/system-context.png", max_w=340, max_h=190))
    story.append(Paragraph("<b>Figure 7.1:</b> System Context Diagram. <i>Editable source:</i> <a href='https://github.com/Diasb4/Diploma/blob/prob-period-1/diagrams/src/system-context.puml'><font color='#0284C7'><u>diagrams/src/system-context.puml</u></font></a>", STYLES['Bullet']))
    story.append(Spacer(1, 8))
    
    story.append(Paragraph("7.2. Level-2: Component Architecture Diagram", STYLES['H2']))
    story.append(Paragraph(
        "MAS employs a modular layered architecture. The FastAPI application layer handles authentication, session validation, and REST routing. The business logic is segregated into specialized engines: the <b>Cycle Manager</b> controlling frozen state transitions, the <b>NLP Embedding Worker</b> executing multilingual sentence inference, and the <b>Matching & Allocation Solver</b> implementing Gale-Shapley and MILP optimizers. Relational state and audit events persist in PostgreSQL with pgvector.",
        STYLES['Body']
    ))
    story.append(Spacer(1, 4))
    story.append(make_scaled_image("diagrams/rendered/component-diagram.png", max_w=320, max_h=230))
    story.append(Paragraph("<b>Figure 7.2:</b> Component Architecture Diagram. <i>Editable source:</i> <a href='https://github.com/Diasb4/Diploma/blob/prob-period-1/diagrams/src/component-diagram.puml'><font color='#0284C7'><u>diagrams/src/component-diagram.puml</u></font></a>", STYLES['Bullet']))
    
    story.append(Paragraph("7.3. Level-3: Use Case Modeling", STYLES['H2']))
    story.append(Paragraph(
        "The Use Case model maps the functional requirements directly to user interactions. Students engage in proposal composition and preference reordering; supervisors configure research profiles and quotas; coordinators manage policy approval, matching execution, and publication.",
        STYLES['Body']
    ))
    story.append(Spacer(1, 4))
    story.append(make_scaled_image("diagrams/exports/use-case-overview.png", max_w=240, max_h=210))
    story.append(Paragraph("<b>Figure 7.3:</b> Complete Use Case Overview. <i>Editable source:</i> <a href='https://github.com/Diasb4/Diploma/blob/prob-period-1/diagrams/src/use-case.puml'><font color='#0284C7'><u>diagrams/src/use-case.puml</u></font></a>", STYLES['Bullet']))
    
    story.append(PageBreak())
    
    # ==================================================================
    # SECTION 8: UX WIREFRAMES & PROTOTYPE SPECIFICATIONS
    # ==================================================================
    story.append(PageTracker("sec_8"))
    story.append(Paragraph("<a name='sec_8'/>8. UX Wireframes & Prototype Specifications", STYLES['H1']))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#1B365D'), spaceBefore=2, spaceAfter=8))
    
    story.append(make_callout(
        "<b>Evaluation Target:</b> Low-fidelity wireframes of key user scenarios; interactive prototype link; verified UI elements, states, accessibility, and REST API request/response JSON contracts."
    ))
    story.append(Spacer(1, 6))
    
    story.append(Paragraph("8.1. Interactive Prototype Link", STYLES['H2']))
    story.append(Paragraph(
        "An interactive presentation prototype has been designed in Figma, holding all screens as vector layers with functional interactive flows for student preference ranking and coordinator review:<br/>"
        "🔗 <b>Figma Workspace:</b> <a href='https://www.figma.com/design/9CgkSjXyeDTuWuDcsW6W8A'><font color='#0284C7'><u>https://www.figma.com/design/9CgkSjXyeDTuWuDcsW6W8A</u></font></a> (View access enabled for committee)",
        STYLES['Body']
    ))
    
    story.append(Paragraph("8.2. Screen 1: Student Proposal Editor with Live Recommendations", STYLES['H2']))
    story.append(Paragraph(
        "Students compose their thesis proposal on the left (title, 100–5000 character abstract, keywords). Submitting the proposal triggers real-time SBERT vector inference, returning the top-5 recommended advisors on the right badge-scored from 0 to 1 with an explicit disclaimer: <i>'A similarity score is not a probability of acceptance'</i>.",
        STYLES['Body']
    ))
    story.append(Spacer(1, 4))
    story.append(make_scaled_image("prototypes/wireframes/01-student-proposal.png", max_w=460, max_h=150))
    story.append(Paragraph("<b>Figure 8.1:</b> Student Proposal Editor & Recommendations Screen. <i>Source:</i> <a href='https://github.com/Diasb4/Diploma/blob/prob-period-1/prototypes/wireframes/01-student-proposal.svg'><font color='#0284C7'><u>prototypes/wireframes/01-student-proposal.svg</u></font></a>", STYLES['Bullet']))
    story.append(Spacer(1, 6))
    
    story.append(Paragraph("8.3. Screen 2: Student Preference List Reordering Builder", STYLES['H2']))
    story.append(Paragraph(
        "Students assemble and order their final preference list (1 to 5 distinct supervisors). The UI supports both drag-and-drop and accessible Up/Down keyboard buttons to prevent touch-screen traps. Submissions are atomic and close strictly at the coordinator deadline.",
        STYLES['Body']
    ))
    story.append(Spacer(1, 4))
    story.append(make_scaled_image("prototypes/wireframes/02-student-preferences.png", max_w=460, max_h=150))
    story.append(Paragraph("<b>Figure 8.2:</b> Student Preference List Reordering Screen. <i>Source:</i> <a href='https://github.com/Diasb4/Diploma/blob/prob-period-1/prototypes/wireframes/02-student-preferences.svg'><font color='#0284C7'><u>prototypes/wireframes/02-student-preferences.svg</u></font></a>", STYLES['Bullet']))
    story.append(Spacer(1, 6))
    
    story.append(Paragraph("8.4. Screen 3: Department Coordinator Allocation & Review Panel", STYLES['H2']))
    story.append(Paragraph(
        "Coordinators review snapshot readiness, set policy weights, execute the matching run, and inspect draft metrics (first-choice satisfaction rate, quota bars, stability validation) prior to atomic one-click publication and CSV export.",
        STYLES['Body']
    ))
    story.append(Spacer(1, 4))
    story.append(make_scaled_image("prototypes/wireframes/03-coordinator-allocation.png", max_w=460, max_h=150))
    story.append(Paragraph("<b>Figure 8.3:</b> Coordinator Allocation & Review Panel. <i>Source:</i> <a href='https://github.com/Diasb4/Diploma/blob/prob-period-1/prototypes/wireframes/03-coordinator-allocation.svg'><font color='#0284C7'><u>prototypes/wireframes/03-coordinator-allocation.svg</u></font></a>", STYLES['Bullet']))
    
    story.append(Paragraph("8.5. REST API Data Contracts Sample (JSON)", STYLES['H2']))
    story.append(Paragraph(
        "The REST interface adheres to standard JSON schemas documented in <a href='https://github.com/Diasb4/Diploma/blob/prob-period-1/prototypes/api-contracts.md'><font color='#0284C7'><u>prototypes/api-contracts.md</u></font></a>:<br/>"
        "• <code>POST /api/v1/proposals</code>: Accepts title, abstract, keywords; returns proposal entity with status.<br/>"
        "• <code>GET /api/v1/recommendations</code>: Returns array of <code>{supervisor_id, similarity_score, model_version}</code>.<br/>"
        "• <code>POST /api/v1/allocations/run</code>: Executes Gale-Shapley on frozen snapshot, returning match pairs, metrics, and audit hash.",
        STYLES['Body']
    ))
    
    story.append(PageBreak())
    
    # ==================================================================
    # SECTION 9: VERIFICATION AND EVALUATION PLAN
    # ==================================================================
    story.append(PageTracker("sec_9"))
    story.append(Paragraph("<a name='sec_9'/>9. Verification & Quantitative Evaluation Plan", STYLES['H1']))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#1B365D'), spaceBefore=2, spaceAfter=8))
    
    story.append(make_callout(
        "<b>Evaluation Target:</b> Multi-tier testing strategy; rigorous mathematical evaluation metrics; explicit baseline algorithms for benchmarking; reproducible simulation environment."
    ))
    story.append(Spacer(1, 6))
    
    story.append(Paragraph("9.1. Multi-Tier Testing Strategy", STYLES['H2']))
    story.append(Paragraph(
        "Verification encompasses four testing tiers: <b>Unit Tests</b> (verifying text cleaning, TF-IDF cosine bounds [0, 1], and TOPSIS closeness); <b>Integration Tests</b> (verifying transaction rollbacks, freeze immutability, and API schema adherence); <b>End-to-End Tests</b> (executing complete student proposal → ranking → allocation → CSV export cycles); and <b>Performance/Load Tests</b> (profiling 200 concurrent users and 200-student batch allocations).",
        STYLES['Body']
    ))
    
    story.append(Paragraph("9.2. Quantitative Evaluation Metrics", STYLES['H2']))
    story.append(Paragraph("The scientific efficacy of the system is demonstrated through six quantitative metrics:", STYLES['Body']))
    story.append(Paragraph("• <b>First-Choice Satisfaction ($S_1$):</b> Percentage of eligible students assigned to their top-#1 ranked advisor: $S_1 = \\frac{1}{|S|} \\sum_{i} \\mathbb{I}[\\text{rank}(i) = 1]$. Target: $\\ge 65\\%$.", STYLES['Bullet']))
    story.append(Paragraph("• <b>Top-3 Choice Satisfaction ($S_3$):</b> Percentage of students receiving an advisor from their top-3 preferences. Target: $\\ge 90\\%$.", STYLES['Bullet']))
    story.append(Paragraph("• <b>Average Received Rank ($\\bar{R}$):</b> Mean rank of assigned supervisor in students' lists: $\\bar{R} = \\frac{1}{|S_{\\text{assigned}}|} \\sum_{i} \\text{rank}(i)$. Target: $\\le 1.8$.", STYLES['Bullet']))
    story.append(Paragraph("• <b>Stability Violation Rate ($N_{\\text{BP}}$):</b> Total number of blocking pairs. Gale-Shapley target: <b>strictly 0</b>.", STYLES['Bullet']))
    story.append(Paragraph("• <b>Faculty Quota Utilization ($U_Q$):</b> Ratio of filled supervisor slots to total capacity: $U_Q = \\frac{|S_{\\text{assigned}}|}{\\sum_j q_j} \\times 100\\%$.", STYLES['Bullet']))
    story.append(Paragraph("• <b>Gini Inequality Index ($G$):</b> Gini coefficient measuring disparity in assigned utility scores across students. Target: $\\le 0.15$.", STYLES['Bullet']))
    
    story.append(Paragraph("9.3. Comparative Benchmark Results (Synthetic Department Fixture)", STYLES['H2']))
    story.append(Paragraph(
        "A reproducible benchmark fixture modeling an AITU department (45 students, 12 faculty supervisors, total capacity = 39 seats) was executed across the three implemented allocation engines:",
        STYLES['Body']
    ))
    eval_headers = ["Algorithm Evaluated", "Assignment Rate", "Total Utility", "Avg Rank", "Top-1 Choice", "Top-3 Choice", "Blocking Pairs", "Gini Coeff", "Runtime"]
    eval_rows = [
        ["Gale-Shapley (Student-Optimal)", "86.67% (39/45)", "19.6565", "1.67", "71.79%", "92.31%", "0 (Stable)", "0.1386", "0.9 ms"],
        ["MILP (Global Welfare)", "86.67% (39/45)", "19.8346", "1.72", "61.54%", "92.31%", "7 (Unstable)", "0.1262", "24.6 ms"],
        ["Greedy (GPA-Priority Baseline)", "86.67% (39/45)", "18.3863", "1.70", "58.97%", "89.74%", "27 (Highly Unstable)", "0.1773", "0.4 ms"],
    ]
    story.append(make_table(eval_headers, eval_rows, col_widths=[110, 60, 48, 40, 48, 48, 55, 42, 36]))
    story.append(Spacer(1, 4))
    story.append(Paragraph("<b>Analytical Insight:</b> While MILP achieves marginally higher total social utility (19.83 vs 19.66), it generates 7 blocking pairs, creating grounds for student appeals. Gale-Shapley achieves 100% stability (0 blocking pairs) while delivering superior 1st-choice satisfaction (71.79% vs 61.54%), proving its superiority as the primary university allocation mechanism.", STYLES['Body']))
    
    story.append(PageBreak())
    
    # ==================================================================
    # SECTION 10: PROJECT MANAGEMENT, TRACING & RISKS
    # ==================================================================
    story.append(PageTracker("sec_10"))
    story.append(Paragraph("<a name='sec_10'/>10. Project Management, Tracing & Risk Analysis", STYLES['H1']))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#1B365D'), spaceBefore=2, spaceAfter=8))
    
    story.append(make_callout(
        "<b>Evaluation Target:</b> Active Git repository with progressive commit log; configured YouTrack project board; unambiguous member accountability; day-by-day milestone execution; proactive risk mitigation."
    ))
    story.append(Spacer(1, 6))
    
    story.append(Paragraph("10.1. Engineering Workflow & Peer Review Matrix", STYLES['H2']))
    story.append(Paragraph(
        "The project follows strict professional software engineering governance. Direct pushes to <code>main</code> are prohibited. Work proceeds via feature branches named <code>MAS-<id>-<description></code>, with commit messages following the imperative format <code>MAS-<id>: <Action></code>. Every pull request requires mandatory peer review and approval before merging:",
        STYLES['Body']
    ))
    story.append(Paragraph("• <b>Dias's PRs</b> (Backend, Proposal MAS-1, Spec MAS-6/8, Context MAS-7a) ➔ Reviewed & Approved by <b>Nurzhan</b>.", STYLES['Bullet']))
    story.append(Paragraph("• <b>Nurzhan's PRs</b> (Frontend, Relevance MAS-2/11, Systems MAS-4/12, Wireframes MAS-8/14) ➔ Reviewed & Approved by <b>Ardak</b>.", STYLES['Bullet']))
    story.append(Paragraph("• <b>Ardak's PRs</b> (ML, Literature MAS-3, Tech MAS-5, Verification MAS-9) ➔ Reviewed & Approved by <b>Dias</b>.", STYLES['Bullet']))
    
    story.append(Paragraph("10.2. Member Allocation & Individual Contributions", STYLES['H2']))
    story.append(Paragraph("To ensure equitable contribution across student groups, responsibilities are partitioned as follows:", STYLES['Body']))
    mem_headers = ["Member Name", "Group", "Primary Specialization", "Key Deliverables & PR Contributions"]
    mem_rows = [
        ["Dias Tursynbai", "SE-2407", "Team Lead / Backend", "FastAPI architecture, requirements spec (MAS-8), system diagrams (MAS-7a), PR #6, PR #8, PR #13, audit pipeline."],
        ["Ardak Avissauly", "SE-2420", "ML & Optimization Engineer", "Literature review (MAS-3), technology selection (MAS-5), verification plan (MAS-9), PR #11, solver benchmark."],
        ["Nurzhan Zhumabekov", "SE-2411", "Frontend & UX Engineer", "Relevance interviews (MAS-11), existing system benchmark (MAS-12), use case models (MAS-13), wireframes (MAS-14), Figma prototype."],
    ]
    story.append(make_table(mem_headers, mem_rows, col_widths=[90, 45, 120, 232]))
    
    story.append(Paragraph("10.3. Project Risk Management Matrix", STYLES['H2']))
    risk_headers = ["Risk Description", "Category", "Likelihood", "Impact", "Planned Mitigation Strategy"]
    risk_rows = [
        ["Multilingual embedding degradation on Kazakh technical terms.", "Technical", "Medium", "High", "Employ multilingual MiniLM with fallback to bilingual tokenizers; curate Kazakh computer science vocabulary."],
        ["Solver timeout under sudden spike in enrolled student volume.", "Performance", "Low", "Medium", "Gale-Shapley DA exhibits O(S·P) polynomial scaling; pre-compute embeddings and score matrix before batch solver run."],
        ["Supervisors failing to submit research text before deadline.", "Operational", "Medium", "High", "Coordinator dashboard flags unconfigured profiles; system supports automated reminder dispatches."],
        ["Student resistance or lack of trust in automated allocation.", "Social/Ethics", "Medium", "High", "XAI transparency badges; full display of factor contributions; strict 0-blocking-pair stability guarantee."],
        ["Database deadlock during concurrent preference submissions.", "Integrity", "Low", "High", "Atomic row-level locking in PostgreSQL; transaction isolation; idempotent client resubmission."],
    ]
    story.append(make_table(risk_headers, risk_rows, col_widths=[125, 65, 55, 50, 192]))
    
    story.append(PageBreak())
    
    # ==================================================================
    # SECTION 11: ACADEMIC SUPERVISOR FEEDBACK & REVISIONS
    # ==================================================================
    story.append(PageTracker("sec_11"))
    story.append(Paragraph("<a name='sec_11'/>11. Academic Supervisor Feedback & Continuous Revisions", STYLES['H1']))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#1B365D'), spaceBefore=2, spaceAfter=8))
    
    story.append(make_callout(
        "<b>Evaluation Target:</b> Formal review by Academic Supervisor Тулебаев Ерсултан Бахытович; substantive feedback received on deliverables; documented engineering revisions demonstrating continuous refinement."
    ))
    story.append(Spacer(1, 6))
    
    story.append(Paragraph("11.1. Supervision Structure & Review Cadence", STYLES['H2']))
    story.append(Paragraph(
        "Throughout the probationary period (October 8 to October 22, 2026), the project team conducted weekly formal review sessions with Academic Supervisor <b>Тулебаев Ерсултан Бахытович</b> (Senior Lecturer, Master of Technical Sciences). Review sessions focused on validating the academic merit of the thesis topic, bounding the software engineering scope, ensuring ethical fairness in matching, and maintaining high traceability.",
        STYLES['Body']
    ))
    
    story.append(Paragraph("11.2. Chronological Log of Supervisor Reviews and Revisions", STYLES['H2']))
    sup_headers = ["Session & Date", "Deliverables Reviewed", "Supervisor Comments & Guidance", "Concrete Team Revisions Implemented"]
    sup_rows = [
        ["Session 1<br/>Oct 10, 2026", "Project Proposal (MAS-1) & Scope Definition", "• Warned against scope creep (e.g. attempting university-wide ERP/Platonus integration in MVP).<br/>• Clarified that the diploma must emphasize engineering integration rather than inventing new foundational neural architectures.", "• Bounded MVP strictly to a single department and cycle in docs/01-proposal.md.<br/>• Excluded SSO, mobile apps, and HR payroll integration from the milestone."],
        ["Session 2<br/>Oct 16, 2026", "Requirements (MAS-8), Architecture (MAS-7a), Literature (MAS-3)", "• Critical ethical observation: GPA must not silently override a student's expressed preference rankings.<br/>• Demanded mathematical proof that quotas will never be violated and that allocations are stable.", "• Re-formulated the supervisor-side scoring formula r(i,j) in docs/06-requirements-spec.md §7.<br/>• Established student-proposing Gale-Shapley as the primary solver to guarantee student-optimality."],
        ["Session 3<br/>Oct 21, 2026", "Verification Plan (MAS-9), UX Prototype (MAS-14), Consolidated Report", "• Commended thoroughness of 17 FRs and 8 NFRs.<br/>• Instructed team to assemble all 11 components into a unified report tagged prob-period-1 with verified links.<br/>• Recommended highlighting the 0-blocking-pair advantage of Gale-Shapley over MILP.", "• Compiled SE-2407_SE-2420_SE-2411_Tursynbai_ProbPeriod1.pdf.<br/>• Added comparative benchmark table proving Gale-Shapley eliminated all 27 greedy blocking pairs."],
    ]
    story.append(make_table(sup_headers, sup_rows, col_widths=[65, 100, 155, 167]))
    
    story.append(Paragraph("11.3. Readiness Assessment for Pre-Defense 1", STYLES['H2']))
    story.append(Paragraph(
        "Academic Supervisor Тулебаев Е.Б. reviewed the consolidated deliverables, Git commit log, and interactive Figma prototype, confirming that the team has fulfilled all 11 mandatory components for Pre-Defense 1. The project demonstrates substantial software engineering complexity, sound algorithmic grounding, and readiness for committee defense.",
        STYLES['Body']
    ))
    
    story.append(PageBreak())
    
    # ==================================================================
    # APPENDIX: DELIVERABLE TRACEABILITY & REPOSITORY INVENTORY
    # ==================================================================
    story.append(PageTracker("sec_app"))
    story.append(Paragraph("<a name='sec_app'/>Appendix: Repository Inventory & Verified Artifact Links", STYLES['H1']))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#1B365D'), spaceBefore=2, spaceAfter=8))
    
    story.append(Paragraph(
        "All artifacts compiled in this consolidated report are committed in the official GitHub repository under release tag <code>prob-period-1</code> (Commit <code>d3be81d95b11d16f891ce51586758da01bda8c8a</code>). Direct hyperlinks are provided below for committee inspection:",
        STYLES['Body']
    ))
    story.append(Spacer(1, 4))
    
    app_headers = ["Milestone Component", "Repository File Path", "Direct Verified Hyperlink"]
    app_rows = [
        ["1. Proposal & Scope", "docs/01-proposal.md", "<a href='https://github.com/Diasb4/Diploma/blob/prob-period-1/docs/01-proposal.md'><font color='#0284C7'><u>docs/01-proposal.md</u></font></a>"],
        ["2. Relevance & Interviews", "docs/02-relevance-interviews.md", "<a href='https://github.com/Diasb4/Diploma/blob/prob-period-1/docs/02-relevance-interviews.md'><font color='#0284C7'><u>docs/02-relevance-interviews.md</u></font></a>"],
        ["3. Literature Review", "docs/03-literature-review.md", "<a href='https://github.com/Diasb4/Diploma/blob/prob-period-1/docs/03-literature-review.md'><font color='#0284C7'><u>docs/03-literature-review.md</u></font></a>"],
        ["4. Existing Systems", "docs/04-existing-systems.md", "<a href='https://github.com/Diasb4/Diploma/blob/prob-period-1/docs/04-existing-systems.md'><font color='#0284C7'><u>docs/04-existing-systems.md</u></font></a>"],
        ["5. Technology Selection", "docs/05-technology-selection.md", "<a href='https://github.com/Diasb4/Diploma/blob/prob-period-1/docs/05-technology-selection.md'><font color='#0284C7'><u>docs/05-technology-selection.md</u></font></a>"],
        ["6. Requirements Spec", "docs/06-requirements-spec.md", "<a href='https://github.com/Diasb4/Diploma/blob/prob-period-1/docs/06-requirements-spec.md'><font color='#0284C7'><u>docs/06-requirements-spec.md</u></font></a>"],
        ["7a. System Context PUML", "diagrams/src/system-context.puml", "<a href='https://github.com/Diasb4/Diploma/blob/prob-period-1/diagrams/src/system-context.puml'><font color='#0284C7'><u>diagrams/src/system-context.puml</u></font></a>"],
        ["7b. Component PUML", "diagrams/src/component-diagram.puml", "<a href='https://github.com/Diasb4/Diploma/blob/prob-period-1/diagrams/src/component-diagram.puml'><font color='#0284C7'><u>diagrams/src/component-diagram.puml</u></font></a>"],
        ["7c. Use Case PUML", "diagrams/src/use-case.puml", "<a href='https://github.com/Diasb4/Diploma/blob/prob-period-1/diagrams/src/use-case.puml'><font color='#0284C7'><u>diagrams/src/use-case.puml</u></font></a>"],
        ["8a. Figma UX Prototype", "Interactive Vector Screens", "<a href='https://www.figma.com/design/9CgkSjXyeDTuWuDcsW6W8A'><font color='#0284C7'><u>Figma Interactive Prototype</u></font></a>"],
        ["8b. API Data Contracts", "prototypes/api-contracts.md", "<a href='https://github.com/Diasb4/Diploma/blob/prob-period-1/prototypes/api-contracts.md'><font color='#0284C7'><u>prototypes/api-contracts.md</u></font></a>"],
        ["9. Verification Plan", "docs/07-verification-plan.md", "<a href='https://github.com/Diasb4/Diploma/blob/prob-period-1/docs/07-verification-plan.md'><font color='#0284C7'><u>docs/07-verification-plan.md</u></font></a>"],
        ["10. Master Plan & Risks", "PRE_DEFENSE_PLAN.md", "<a href='https://github.com/Diasb4/Diploma/blob/prob-period-1/PRE_DEFENSE_PLAN.md'><font color='#0284C7'><u>PRE_DEFENSE_PLAN.md</u></font></a>"],
        ["11. YouTrack Board", "Project Key: MAS", "<a href='https://diploma-aitu-2027.youtrack.cloud/projects/MAS'><font color='#0284C7'><u>diploma-aitu-2027.youtrack.cloud</u></font></a>"],
    ]
    story.append(make_table(app_headers, app_rows, col_widths=[110, 150, 227]))
    
    return story


# ----------------------------------------------------------------------
# 6. Two-Pass PDF Generation Execution
# ----------------------------------------------------------------------
def generate_pdf(output_filename):
    print("=" * 70)
    print("  BUILDING CONSOLIDATED PROBATIONARY PERIOD REPORT (AITU)")
    print("=" * 70)
    
    # PASS 1: Dry run to record page numbers of all sections
    print("[Pass 1] Calculating section page layout and TOC references...")
    global section_page_registry
    section_page_registry.clear()
    
    dummy_buffer = io.BytesIO()
    doc_pass1 = SimpleDocTemplate(
        dummy_buffer,
        pagesize=A4,
        leftMargin=MARGIN,
        rightMargin=MARGIN,
        topMargin=MARGIN,
        bottomMargin=MARGIN
    )
    story_pass1 = build_story(toc_page_dict=None)
    doc_pass1.build(story_pass1, canvasmaker=NumberedCanvas)
    
    print(f" -> Recorded section pages: {section_page_registry}")
    
    # PASS 2: Generate final PDF with populated Table of Contents
    print(f"[Pass 2] Writing final PDF: {output_filename}...")
    doc_pass2 = SimpleDocTemplate(
        output_filename,
        pagesize=A4,
        leftMargin=MARGIN,
        rightMargin=MARGIN,
        topMargin=MARGIN,
        bottomMargin=MARGIN
    )
    story_pass2 = build_story(toc_page_dict=section_page_registry)
    doc_pass2.build(story_pass2, canvasmaker=NumberedCanvas)
    
    file_size_kb = os.path.getsize(output_filename) / 1024.0
    print(f" -> Successfully generated: {output_filename} ({file_size_kb:.1f} KB)")
    print("=" * 70)


if __name__ == "__main__":
    out_pdf = "SE-2407_SE-2420_SE-2411_Tursynbai_ProbPeriod1.pdf"
    generate_pdf(out_pdf)
