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
