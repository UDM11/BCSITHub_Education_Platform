import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
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
