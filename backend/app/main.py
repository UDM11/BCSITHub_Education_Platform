import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse
from app.routers import auth, papers, notices, quiz, compiler, ai, support, pomodoro, newsletter
from app.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Python API Backend for BCSITHub student portal using Supabase integration."
)

# Configure CORS so that the React frontend can talk to the backend
# Whitelist only the production frontend URL and local development URL
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://bcsithub.lovestoblog.com",
        "http://localhost:5173",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router, prefix="/api")
app.include_router(papers.router, prefix="/api")
app.include_router(notices.router, prefix="/api")
app.include_router(quiz.router, prefix="/api")
app.include_router(compiler.router, prefix="/api")
app.include_router(ai.router, prefix="/api")
app.include_router(support.router, prefix="/api")
app.include_router(pomodoro.router, prefix="/api")
app.include_router(newsletter.router, prefix="/api")

# Mount the static directory for the React frontend
STATIC_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "static")

if os.path.exists(STATIC_DIR):
    app.mount("/assets", StaticFiles(directory=os.path.join(STATIC_DIR, "assets")), name="assets")

from fastapi import Response
import xml.etree.ElementTree as ET
import re
from datetime import datetime
from urllib.parse import unquote

def slugify(text: str) -> str:
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

# ── Reusable SSR Meta Injection Helper ───────────────────────────────────────
BASE_URL = "https://bcsithub.lovestoblog.com"

def inject_seo_meta(
    title: str,
    description: str,
    url: str,
    keywords: str = "",
    image: str = f"{BASE_URL}/logo.png",
    robots: str = "index, follow"
) -> HTMLResponse:
    """
    Reads the static index.html and injects SEO meta tags server-side.
    This ensures Google/Bing see unique metadata for each page even without
    executing JavaScript.
    """
    if not os.path.exists(STATIC_DIR):
        return HTMLResponse(content="<h1>Site not deployed</h1>", status_code=500)
    
    index_path = os.path.join(STATIC_DIR, "index.html")
    if not os.path.exists(index_path):
        return HTMLResponse(content="<h1>Index not found</h1>", status_code=500)

    with open(index_path, "r", encoding="utf-8") as f:
        html = f.read()

    # 1. Replace <title>
    html = re.sub(r"<title>.*?</title>", f"<title>{title}</title>", html)

    # 2. Replace meta description
    html = re.sub(
        r'<meta name="description" content=".*?"\s*/>',
        f'<meta name="description" content="{description}" />',
        html
    )

    # 3. Replace meta keywords
    if keywords:
        html = re.sub(
            r'<meta name="keywords" content=".*?"\s*/>',
            f'<meta name="keywords" content="{keywords}" />',
            html
        )

    # 4. Replace meta robots
    html = re.sub(
        r'<meta name="robots" content=".*?"\s*/>',
        f'<meta name="robots" content="{robots}" />',
        html
    )

    # 5. Replace canonical URL - use both direct placeholder replace and regex to guarantee replacement
    html = html.replace(
        'href="https://bcsithub.lovestoblog.com/CANONICAL_PLACEHOLDER"',
        f'href="{url}"'
    )
    html = re.sub(
        r'<link rel="canonical" href=".*?"\s*/>',
        f'<link rel="canonical" href="{url}" />',
        html
    )

    # 6. Replace Open Graph meta tags
    html = re.sub(r'<meta property="og:title" content=".*?"\s*/?>', f'<meta property="og:title" content="{title}" />', html)
    html = re.sub(r'<meta property="og:description" content=".*?"\s*/?>', f'<meta property="og:description" content="{description}" />', html)
    html = re.sub(r'<meta property="og:url" content=".*?"\s*/?>', f'<meta property="og:url" content="{url}" />', html)
    html = re.sub(r'<meta property="og:image" content=".*?"\s*/?>', f'<meta property="og:image" content="{image}" />', html)

    # 7. Replace Twitter Card meta tags
    html = re.sub(r'<meta name="twitter:title" content=".*?"\s*/?>', f'<meta name="twitter:title" content="{title}" />', html)
    html = re.sub(r'<meta name="twitter:description" content=".*?"\s*/?>', f'<meta name="twitter:description" content="{description}" />', html)
    html = re.sub(r'<meta name="twitter:image" content=".*?"\s*/?>', f'<meta name="twitter:image" content="{image}" />', html)

    return HTMLResponse(content=html)


# ── Subject Name Lookup ──────────────────────────────────────────────────────

SUBJECT_MAP = {
    "ENG 111": "English I",
    "MTH 113": "Mathematics I",
    "CMP 173": "Internet Technology I",
    "CMP 171": "Fundamentals of Computer Systems",
    "CMP 172": "Programming Language",
    "ENG 112": "Business Communication",
    "MTH 114": "Mathematics II",
    "CMP 174": "Digital Systems",
    "CMP 175": "Object-Oriented Language (Java)",
    "CMP 176": "Data Structure and Algorithm",
    "PRJ 181": "Project I",
    "STT 220": "Linear Algebra and Probability",
    "CMP 271": "Database Management System",
    "CMP 272": "Object-Oriented Analysis and Design",
    "CMP 273": "Internet Technology II (Programming)",
    "MGT 222": "Principles of Management",
    "CMP 275": "Computer Architecture and Microprocessor",
    "CMP 274": "Numerical Methods",
    "CMP 276": "Software Engineering and Project Management",
    "CMP 277": "Data Communication and Networks",
    "FIN 222": "Fundamentals of Financial Management",
    "PRI 281": "Project II",
    "MKT 351": "Digital Marketing",
    "CMP 381": "Operating Systems",
    "MGT 322": "Organizational Behavior",
    "CMP 471": "Artificial Intelligence",
    "CMP 384": "Computer Graphics",
    "RCH 322": "Research Methods",
    "CMP 382": "Cloud Computing",
    "ECO 322": "Applied Economics",
    "MGT 422": "Strategic Management",
    "MGT 423": "Management of Human Resources",
    "CMP 383": "Digital Economy",
    "CMP 472": "Information System Security",
    "PRI 481": "Major Project"
}

SEMESTER_NAMES = {
    "1": "1st Semester",
    "2": "2nd Semester",
    "3": "3rd Semester",
    "4": "4th Semester",
    "5": "5th Semester",
    "6": "6th Semester",
    "7": "7th Semester",
    "8": "8th Semester",
}


# ══════════════════════════════════════════════════════════════════════════════
#  SITEMAP
# ══════════════════════════════════════════════════════════════════════════════

@app.get("/sitemap.xml")
async def serve_dynamic_sitemap():
    # Base sitemap structure
    xml_ns = "http://www.sitemaps.org/schemas/sitemap/0.9"
    ET.register_namespace('', xml_ns)
    
    sitemap_path = os.path.join(STATIC_DIR, "sitemap.xml")
    
    if os.path.exists(sitemap_path):
        try:
            tree = ET.parse(sitemap_path)
            root = tree.getroot()
        except Exception:
            root = ET.Element(f"{{{xml_ns}}}urlset")
    else:
        root = ET.Element(f"{{{xml_ns}}}urlset")
        # Add basic homepage url if static sitemap is missing
        url_el = ET.SubElement(root, f"{{{xml_ns}}}url")
        loc_el = ET.SubElement(url_el, f"{{{xml_ns}}}loc")
        loc_el.text = f"{BASE_URL}/"
        priority_el = ET.SubElement(url_el, f"{{{xml_ns}}}priority")
        priority_el.text = "1.0"
        
    # Fetch approved papers from Supabase
    try:
        from app.client import supabase_client
        res = supabase_client.table("past_papers").select("title, created_at").eq("approved", True).execute()
        papers = res.data or []
    except Exception as e:
        print("Sitemap Supabase fetch failed:", e)
        papers = []

    # Check already present URLs to avoid duplicates
    existing_locs = {loc.text.strip() for loc in root.findall(f".//{{{xml_ns}}}loc") if loc.text}
    
    for paper in papers:
        slug = slugify(paper.get("title", ""))
        paper_url = f"{BASE_URL}/past-papers/{slug}"
        
        if paper_url not in existing_locs:
            url_el = ET.SubElement(root, f"{{{xml_ns}}}url")
            loc_el = ET.SubElement(url_el, f"{{{xml_ns}}}loc")
            loc_el.text = paper_url
            
            created_at = paper.get("created_at")
            lastmod_val = ""
            if created_at:
                try:
                    lastmod_val = created_at.split("T")[0]
                except Exception:
                    pass
            if not lastmod_val:
                lastmod_val = datetime.utcnow().strftime("%Y-%m-%d")
                
            lastmod_el = ET.SubElement(url_el, f"{{{xml_ns}}}lastmod")
            lastmod_el.text = lastmod_val
            
            changefreq_el = ET.SubElement(url_el, f"{{{xml_ns}}}changefreq")
            changefreq_el.text = "weekly"
            
            priority_el = ET.SubElement(url_el, f"{{{xml_ns}}}priority")
            priority_el.text = "0.6"
            
    # Serialize to string
    xml_str = ET.tostring(root, encoding="utf-8", method="xml")
    xml_header = b'<?xml version="1.0" encoding="utf-8"?>\n'
    
    return Response(content=xml_header + xml_str, media_type="application/xml")


# ══════════════════════════════════════════════════════════════════════════════
#  301 REDIRECTS: Old sitemap URLs → New route format
#  These redirect /notes/{sem}/{code}/{chapter} → /notes/semester/{sem}/subject/{code}/chapter/{chapter}
#  to help Google re-index using the correct canonical URLs.
# ══════════════════════════════════════════════════════════════════════════════

from fastapi.responses import RedirectResponse

@app.get("/notes/{semester_id}/{subject_code}/{chapter_id}")
async def redirect_old_chapter_url(semester_id: str, subject_code: str, chapter_id: str):
    """301 redirect from old /notes/1/CMP 171/Unit 1 format to new /notes/semester/1/subject/CMP 171/chapter/Unit 1"""
    new_url = f"/notes/semester/{semester_id}/subject/{subject_code}/chapter/{chapter_id}"
    return RedirectResponse(url=new_url, status_code=301)

@app.get("/notes/{semester_id}/{subject_code}")
async def redirect_old_subject_url(semester_id: str, subject_code: str):
    """301 redirect from old /notes/1/CMP 171 format to new /notes/semester/1/subject/CMP 171"""
    new_url = f"/notes/semester/{semester_id}/subject/{subject_code}"
    return RedirectResponse(url=new_url, status_code=301)

@app.get("/notes/{semester_id}")
async def redirect_old_semester_url(semester_id: str):
    """301 redirect from old /notes/1 format to new /notes/semester/1"""
    # Only redirect if it looks like a semester number (1-8)
    if semester_id.isdigit() and 1 <= int(semester_id) <= 8:
        new_url = f"/notes/semester/{semester_id}"
        return RedirectResponse(url=new_url, status_code=301)
    # Otherwise fall through to the SPA catch-all
    return FileResponse(os.path.join(STATIC_DIR, "index.html"))


# ══════════════════════════════════════════════════════════════════════════════
#  SSR META INJECTION: Public routes with unique per-page SEO metadata
# ══════════════════════════════════════════════════════════════════════════════

# ── Homepage ──
@app.get("/", response_class=HTMLResponse)
async def serve_homepage():
    return inject_seo_meta(
        title="BCSITHub - Pokhara University BCSIT Portal",
        description="Access Pokhara University BCSIT notes, past exam papers, syllabus guidelines, CGPA calculators, and code compilers.",
        url=f"{BASE_URL}/",
        keywords="bcsit, bcsithub, pokhara university, bcsit notes, pu notes, pu past papers, bcsit question papers, cgpa calculator, code compiler",
    )

# ── Notes Landing Page ──
@app.get("/notes", response_class=HTMLResponse)
async def serve_notes_page():
    return inject_seo_meta(
        title="BCSIT Chapter Notes - All Semesters | BCSITHub",
        description="Access comprehensive Pokhara University BCSIT lecture notes for all 8 semesters. Download chapter-wise study materials, syllabus outlines, and exam preparation resources.",
        url=f"{BASE_URL}/notes",
        keywords="bcsit notes, pokhara university bcsit notes, pu computer science lecture notes, bcsithub study resources, download bcsit chapter notes",
    )

# ── Notes: Semester Subjects ──
@app.get("/notes/semester/{semester_id}", response_class=HTMLResponse)
async def serve_notes_semester_page(semester_id: str):
    sem_name = SEMESTER_NAMES.get(semester_id, f"Semester {semester_id}")
    # Get subjects for this semester for richer description
    sem_subjects = [v for k, v in SUBJECT_MAP.items()]  # We'll improve this below
    
    return inject_seo_meta(
        title=f"BCSIT {sem_name} Subjects & Notes | BCSITHub",
        description=f"Browse all Pokhara University BCSIT {sem_name} subjects. Access lecture notes, chapter guides, and study materials for every course in the {sem_name} curriculum.",
        url=f"{BASE_URL}/notes/semester/{semester_id}",
        keywords=f"bcsit {sem_name} notes, bcsit semester {semester_id} subjects, pokhara university {sem_name}, pu bcsit study materials",
    )

# ── Notes: Subject Chapters ──
@app.get("/notes/semester/{semester_id}/subject/{subject_id}", response_class=HTMLResponse)
async def serve_notes_subject_page(semester_id: str, subject_id: str):
    decoded_subject = unquote(subject_id)
    subject_name = SUBJECT_MAP.get(decoded_subject.upper(), decoded_subject)
    sem_name = SEMESTER_NAMES.get(semester_id, f"Semester {semester_id}")
    
    return inject_seo_meta(
        title=f"{subject_name} ({decoded_subject}) - {sem_name} Notes | BCSITHub",
        description=f"Download Pokhara University BCSIT {sem_name} {subject_name} ({decoded_subject}) chapter notes, lecture outlines, and study reference materials on BCSITHub.",
        url=f"{BASE_URL}/notes/semester/{semester_id}/subject/{subject_id}",
        keywords=f"{subject_name} notes, {decoded_subject} chapters, bcsit {sem_name} {subject_name}, pu {decoded_subject} lecture notes",
    )

# ── Notes: Chapter Notes (existing, now using helper) ──
@app.get("/notes/semester/{semester_id}/subject/{subject_id}/chapter/{chapter_id}", response_class=HTMLResponse)
async def serve_notes_chapter_page(semester_id: str, subject_id: str, chapter_id: str):
    decoded_subject = unquote(subject_id)
    decoded_chapter = unquote(chapter_id)
    subject_name = SUBJECT_MAP.get(decoded_subject.upper(), decoded_subject)
    chapter_name = decoded_chapter.replace("-", " ").title()
    sem_name = SEMESTER_NAMES.get(semester_id, f"Semester {semester_id}")
    
    return inject_seo_meta(
        title=f"{chapter_name} - {subject_name} Lecture Notes | BCSITHub",
        description=f"Download and read Pokhara University BCSIT {sem_name} {subject_name} ({decoded_subject}) {chapter_name} lecture notes, outline, and academic reference handouts on BCSITHub.",
        url=f"{BASE_URL}/notes/semester/{semester_id}/subject/{subject_id}/chapter/{chapter_id}",
        keywords=f"bcsit notes, {subject_name} notes, {decoded_subject} {decoded_chapter}, pu bcsit notes, {chapter_name} lecture notes",
    )

# ── Syllabus ──
@app.get("/syllabus", response_class=HTMLResponse)
async def serve_syllabus_page():
    return inject_seo_meta(
        title="BCSIT Syllabus - Pokhara University Course Structure | BCSITHub",
        description="View the complete Pokhara University BCSIT syllabus, course structure, credit hours, and subject breakdown for all 8 semesters.",
        url=f"{BASE_URL}/syllabus",
        keywords="bcsit syllabus, pokhara university bcsit syllabus, pu bcsit course structure, bcsit subjects list, bcsit credit hours",
    )

# ── Past Papers ──
@app.get("/past-papers", response_class=HTMLResponse)
async def serve_past_papers_page():
    return inject_seo_meta(
        title="BCSIT Past Papers - Pokhara University Question Papers | BCSITHub",
        description="Download Pokhara University BCSIT past exam question papers, model papers, and solved papers for all semesters and subjects.",
        url=f"{BASE_URL}/past-papers",
        keywords="bcsit past papers, pu question papers, pokhara university exam papers, bcsit solved papers, bcsit model papers",
    )

# ── Past Paper Detail (existing, now using helper) ──
@app.get("/past-papers/{paper_slug}", response_class=HTMLResponse)
async def serve_paper_page(paper_slug: str):
    paper_data = None
    try:
        from app.client import supabase_client
        res = supabase_client.table("past_papers").select("id, title, subject, semester, exam_type, college, created_at").eq("approved", True).execute()
        papers = res.data or []
        for p in papers:
            if slugify(p.get("title", "")) == paper_slug:
                paper_data = p
                break
    except Exception as e:
        print("Failed to fetch paper for SEO:", e)
        
    if paper_data:
        return inject_seo_meta(
            title=f"{paper_data['title']} | BCSITHub",
            description=f"Download Pokhara University BCSIT past question paper for {paper_data['subject']} ({paper_data['exam_type']}) - Semester {paper_data['semester']} from {paper_data['college']}.",
            url=f"{BASE_URL}/past-papers/{paper_slug}",
            keywords=f"bcsit past papers, {paper_data['subject']} question paper, pu past papers, {paper_data['college']} exam papers",
        )
    
    return inject_seo_meta(
        title="Past Paper | BCSITHub",
        description="Download Pokhara University BCSIT past exam question papers on BCSITHub.",
        url=f"{BASE_URL}/past-papers/{paper_slug}",
        keywords="bcsit past papers, pu question papers",
    )

# ── CGPA Calculator ──
@app.get("/cgpa-calculator", response_class=HTMLResponse)
async def serve_cgpa_page():
    return inject_seo_meta(
        title="SGPA & CGPA Calculator - Pokhara University | BCSITHub",
        description="Calculate your Pokhara University BCSIT SGPA and CGPA instantly. Accurate calculator tailored to the PU grading system with GPA conversion charts.",
        url=f"{BASE_URL}/cgpa-calculator",
        keywords="cgpa calculator, sgpa calculator, pokhara university gpa calculator, bcsit cgpa, pu grading system, gpa conversion",
    )

# ── Code Compiler ──
@app.get("/code-compiler", response_class=HTMLResponse)
async def serve_compiler_page():
    return inject_seo_meta(
        title="Online Code Compiler - Write & Run Code | BCSITHub",
        description="Write, compile, and run code online in multiple programming languages directly from your browser. Free online code editor and compiler for BCSIT students.",
        url=f"{BASE_URL}/code-compiler",
        keywords="online code compiler, code editor, online ide, run code online, python compiler, java compiler, c compiler, bcsit code compiler",
    )

# ── Colleges ──
@app.get("/colleges", response_class=HTMLResponse)
async def serve_colleges_page():
    return inject_seo_meta(
        title="BCSIT Colleges in Nepal - Pokhara University Affiliated | BCSITHub",
        description="Browse a comprehensive list of Pokhara University affiliated colleges offering the BCSIT program across Nepal. Compare locations, fees, and facilities.",
        url=f"{BASE_URL}/colleges",
        keywords="bcsit colleges, pokhara university colleges, bcsit colleges in nepal, pu affiliated colleges, computer science colleges nepal",
    )

# ── Quiz Generator ──
@app.get("/quiz-generator", response_class=HTMLResponse)
async def serve_quiz_page():
    return inject_seo_meta(
        title="AI Quiz Generator - BCSIT Practice Questions | BCSITHub",
        description="Generate AI-powered practice quizzes from your BCSIT study materials. Test your knowledge with automatically generated questions and instant feedback.",
        url=f"{BASE_URL}/quiz-generator",
        keywords="quiz generator, ai quiz, bcsit quiz, practice questions, exam preparation, bcsit test, study quiz",
    )

# ── Pomodoro Timer ──
@app.get("/pomodoro-timer", response_class=HTMLResponse)
async def serve_pomodoro_page():
    return inject_seo_meta(
        title="Pomodoro Timer - Study Focus Timer | BCSITHub",
        description="Boost your study productivity with the BCSITHub Pomodoro Timer. Customizable focus sessions, break reminders, and study tracking for BCSIT students.",
        url=f"{BASE_URL}/pomodoro-timer",
        keywords="pomodoro timer, study timer, focus timer, productivity timer, bcsit study tool, time management",
    )

# ── PU Notices ──
@app.get("/pu-notices", response_class=HTMLResponse)
async def serve_notices_page():
    return inject_seo_meta(
        title="Pokhara University Notices & Announcements | BCSITHub",
        description="Stay updated with the latest Pokhara University notices, exam schedules, result announcements, and important circulars for BCSIT students.",
        url=f"{BASE_URL}/pu-notices",
        keywords="pu notices, pokhara university notices, exam notice, bcsit notice, pu announcements, exam schedule",
    )

# ── PU Notice Detail (existing, now using helper) ──
@app.get("/pu-notices/{notice_slug}", response_class=HTMLResponse)
async def serve_notice_page(notice_slug: str):
    notice_data = None
    try:
        from app.client import supabase_client
        res = supabase_client.table("pu_notices").select("id, title, category, content, date").execute()
        notices = res.data or []
        for n in notices:
            if slugify(n.get("title", "")) == notice_slug:
                notice_data = n
                break
    except Exception as e:
        print("Failed to fetch notice for SEO:", e)
        
    if notice_data:
        excerpt = notice_data.get("content") or f"Official Pokhara University notice published on {notice_data.get('date')}."
        description = excerpt[:160] + "..." if len(excerpt) > 160 else excerpt
        return inject_seo_meta(
            title=f"{notice_data['title']} - Pokhara University Notice | BCSITHub",
            description=description,
            url=f"{BASE_URL}/pu-notices/{notice_slug}",
            keywords=f"pu notice, pokhara university, exam notice, bcsit notice, {notice_data['category']}",
        )
    
    return inject_seo_meta(
        title="Pokhara University Notice | BCSITHub",
        description="Official Pokhara University notice and announcement on BCSITHub.",
        url=f"{BASE_URL}/pu-notices/{notice_slug}",
        keywords="pu notice, pokhara university notice",
    )

# ── Privacy Policy ──
@app.get("/privacy-policy", response_class=HTMLResponse)
async def serve_privacy_page():
    return inject_seo_meta(
        title="Privacy Policy | BCSITHub",
        description="Read the BCSITHub privacy policy. Learn how we collect, use, and protect your personal information on our educational platform.",
        url=f"{BASE_URL}/privacy-policy",
        keywords="privacy policy, bcsithub privacy, data protection",
    )

# ── Terms of Service ──
@app.get("/terms-of-service", response_class=HTMLResponse)
async def serve_terms_page():
    return inject_seo_meta(
        title="Terms of Service | BCSITHub",
        description="Read the BCSITHub terms of service. Understand the terms and conditions of using our educational platform.",
        url=f"{BASE_URL}/terms-of-service",
        keywords="terms of service, bcsithub terms, user agreement",
    )

# ── Support ──
@app.get("/support", response_class=HTMLResponse)
async def serve_support_page():
    return inject_seo_meta(
        title="Support & Help Center | BCSITHub",
        description="Get help with BCSITHub. Contact our support team, report issues, or submit feedback about the platform.",
        url=f"{BASE_URL}/support",
        keywords="bcsithub support, help center, contact, feedback, report issue",
    )


# ══════════════════════════════════════════════════════════════════════════════
#  SPA CATCH-ALL (must be LAST)
# ══════════════════════════════════════════════════════════════════════════════

@app.get("/{catchall:path}")
async def serve_spa(catchall: str):
    # If the path starts with api/, docs, redoc, or openapi.json, return 404
    if catchall.startswith("api") or catchall.startswith("docs") or catchall.startswith("redoc") or catchall.startswith("openapi.json"):
        return {"detail": "Not Found"}
        
    if os.path.exists(STATIC_DIR):
        file_path = os.path.join(STATIC_DIR, catchall)
        if catchall and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(STATIC_DIR, "index.html"))
        
    return {
        "message": f"Welcome to {settings.PROJECT_NAME}",
        "version": settings.VERSION,
        "docs_url": "/docs"
    }
