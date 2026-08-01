from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, papers, notices, quiz, compiler
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
        "https://bcsithub.web.app",
        "https://bcsithub.firebaseapp.com",
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

@app.get("/")
async def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME}",
        "version": settings.VERSION,
        "docs_url": "/docs"
    }
