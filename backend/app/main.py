import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse
from app.routers import auth, papers, notices, quiz, compiler, ai
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

# Mount the static directory for the React frontend
STATIC_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "static")

if os.path.exists(STATIC_DIR):
    app.mount("/assets", StaticFiles(directory=os.path.join(STATIC_DIR, "assets")), name="assets")

from fastapi import Response
import xml.etree.ElementTree as ET
import re
from datetime import datetime

def slugify(text: str) -> str:
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

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
        loc_el.text = "https://bcsithub.umeshdarlami.com.np/"
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
        paper_url = f"https://bcsithub.umeshdarlami.com.np/past-papers/{slug}"
        
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

@app.get("/notes/semester/{semester_id}/subject/{subject_id}/chapter/{chapter_id}")
async def serve_notes_chapter_page(semester_id: str, subject_id: str, chapter_id: str):
    subject_name = SUBJECT_MAP.get(subject_id.upper(), subject_id)
    chapter_name = chapter_id.replace("-", " ").title()
    
    title = f"{chapter_name} - {subject_name} Lecture Notes | BCSITHub"
    description = f"Download and read Pokhara University BCSIT Semester {semester_id} {subject_name} ({subject_id}) {chapter_name} lecture notes, outline, and academic reference handouts on BCSITHub."
    keywords = f"bcsit notes, {subject_name} notes, {subject_id} {chapter_id}, pu bcsit notes"
    url = f"https://bcsithub.umeshdarlami.com.np/notes/semester/{semester_id}/subject/{subject_id}/chapter/{chapter_id}"
    
    if os.path.exists(STATIC_DIR):
        index_path = os.path.join(STATIC_DIR, "index.html")
        if os.path.exists(index_path):
            with open(index_path, "r", encoding="utf-8") as f:
                html_content = f.read()
                
            # Replace Title
            html_content = re.sub(r"<title>.*?</title>", f"<title>{title}</title>", html_content)
            
            # Replace Description Meta
            html_content = re.sub(
                r'<meta name="description" content=".*?"\s*/?>',
                f'<meta name="description" content="{description}" />',
                html_content
            )
            
            # Replace Keywords Meta
            html_content = re.sub(
                r'<meta name="keywords" content=".*?"\s*/?>',
                f'<meta name="keywords" content="{keywords}" />',
                html_content
            )
            
            # Replace Open Graph elements
            html_content = re.sub(r'<meta property="og:title" content=".*?"\s*/?>', f'<meta property="og:title" content="{title}" />', html_content)
            html_content = re.sub(r'<meta property="og:description" content=".*?"\s*/?>', f'<meta property="og:description" content="{description}" />', html_content)
            html_content = re.sub(r'<meta property="og:url" content=".*?"\s*/?>', f'<meta property="og:url" content="{url}" />', html_content)
            
            # Twitter Cards
            html_content = re.sub(r'<meta name="twitter:title" content=".*?"\s*/?>', f'<meta name="twitter:title" content="{title}" />', html_content)
            html_content = re.sub(r'<meta name="twitter:description" content=".*?"\s*/?>', f'<meta name="twitter:description" content="{description}" />', html_content)
            
            return HTMLResponse(content=html_content)
            
    return FileResponse(os.path.join(STATIC_DIR, "index.html"))

@app.get("/pu-notices/{notice_slug}")
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
        
    if os.path.exists(STATIC_DIR):
        index_path = os.path.join(STATIC_DIR, "index.html")
        if os.path.exists(index_path):
            with open(index_path, "r", encoding="utf-8") as f:
                html_content = f.read()
                
            if notice_data:
                title = f"{notice_data['title']} - Pokhara University Notice | BCSITHub"
                excerpt = notice_data.get("content") or f"Official Pokhara University notice published on {notice_data.get('date')}."
                description = excerpt[:160] + "..." if len(excerpt) > 160 else excerpt
                keywords = f"pu notice, pokhara university, exam notice, bcsit notice, {notice_data['category']}"
                url = f"https://bcsithub.umeshdarlami.com.np/pu-notices/{notice_slug}"
                
                # Replace Title
                html_content = re.sub(r"<title>.*?</title>", f"<title>{title}</title>", html_content)
                
                # Replace Description Meta
                html_content = re.sub(
                    r'<meta name="description" content=".*?"\s*/?>',
                    f'<meta name="description" content="{description}" />',
                    html_content
                )
                
                # Replace Keywords Meta
                html_content = re.sub(
                    r'<meta name="keywords" content=".*?"\s*/?>',
                    f'<meta name="keywords" content="{keywords}" />',
                    html_content
                )
                
                # Replace Open Graph elements
                html_content = re.sub(r'<meta property="og:title" content=".*?"\s*/?>', f'<meta property="og:title" content="{title}" />', html_content)
                html_content = re.sub(r'<meta property="og:description" content=".*?"\s*/?>', f'<meta property="og:description" content="{description}" />', html_content)
                html_content = re.sub(r'<meta property="og:url" content=".*?"\s*/?>', f'<meta property="og:url" content="{url}" />', html_content)
                
                # Twitter Cards
                html_content = re.sub(r'<meta name="twitter:title" content=".*?"\s*/?>', f'<meta name="twitter:title" content="{title}" />', html_content)
                html_content = re.sub(r'<meta name="twitter:description" content=".*?"\s*/?>', f'<meta name="twitter:description" content="{description}" />', html_content)

            return HTMLResponse(content=html_content)
            
    return FileResponse(os.path.join(STATIC_DIR, "index.html"))

@app.get("/past-papers/{paper_slug}")
async def serve_paper_page(paper_slug: str):
    # Fetch approved papers from Supabase
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
        
    if os.path.exists(STATIC_DIR):
        index_path = os.path.join(STATIC_DIR, "index.html")
        if os.path.exists(index_path):
            with open(index_path, "r", encoding="utf-8") as f:
                html_content = f.read()
                
            if paper_data:
                title = f"{paper_data['title']} | BCSITHub"
                description = f"Download Pokhara University BCSIT past question paper for {paper_data['subject']} ({paper_data['exam_type']}) - Semester {paper_data['semester']} from {paper_data['college']}."
                keywords = f"bcsit past papers, {paper_data['subject']} question paper, pu past papers, {paper_data['college']} exam papers"
                url = f"https://bcsithub.umeshdarlami.com.np/past-papers/{paper_slug}"
                
                # Replace Title
                html_content = re.sub(r"<title>.*?</title>", f"<title>{title}</title>", html_content)
                
                # Replace Description Meta
                html_content = re.sub(
                    r'<meta name="description" content=".*?"\s*/?>',
                    f'<meta name="description" content="{description}" />',
                    html_content
                )
                
                # Replace Keywords Meta
                html_content = re.sub(
                    r'<meta name="keywords" content=".*?"\s*/?>',
                    f'<meta name="keywords" content="{keywords}" />',
                    html_content
                )
                
                # Replace Open Graph elements if present, or inject them
                html_content = re.sub(r'<meta property="og:title" content=".*?"\s*/?>', f'<meta property="og:title" content="{title}" />', html_content)
                html_content = re.sub(r'<meta property="og:description" content=".*?"\s*/?>', f'<meta property="og:description" content="{description}" />', html_content)
                html_content = re.sub(r'<meta property="og:url" content=".*?"\s*/?>', f'<meta property="og:url" content="{url}" />', html_content)
                
                # Twitter Cards
                html_content = re.sub(r'<meta name="twitter:title" content=".*?"\s*/?>', f'<meta name="twitter:title" content="{title}" />', html_content)
                html_content = re.sub(r'<meta name="twitter:description" content=".*?"\s*/?>', f'<meta name="twitter:description" content="{description}" />', html_content)

            return HTMLResponse(content=html_content)
            
    return FileResponse(os.path.join(STATIC_DIR, "index.html"))

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
