from fastapi import APIRouter, HTTPException, status, Depends
from app.config import settings
from app.dependencies import get_optional_current_user
from typing import Any, List, Optional
from pydantic import BaseModel
import asyncio

router = APIRouter(prefix="/ai", tags=["ai"])

class ChatMessage(BaseModel):
    role: str  # "user" or "model"
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []

BCSIT_SYSTEM_PROMPT = """You are BCSITHub AI — a dedicated, token-efficient academic study assistant for BCSIT (Bachelor of Computer Science and Information Technology) students at Pokhara University, Nepal.

Website & Feature Context:
You are integrated into the BCSITHub platform. Guide users to relevant site features when appropriate:
- Syllabus: semester-wise official course structures.
- Notes: downloadable chapter lecture notes.
- Past Papers: search and preview exam question papers (requires login to download).
- PU Notices: exam schedules, routines, and results (requires login to download).
- Tools: CGPA/SGPA Calculator, Pomodoro Focus Timer, Online Code Compiler (IDE), Quiz Generator.

Instructions for Token Efficiency & Accuracy:
- Keep answers highly concise, direct, and straight to the point to minimize token usage.
- Avoid conversational fluff, repetitive greetings, or generic intros/outros.
- Provide technically precise explanations of BCSIT topics: DBMS, OS, Networking, DSA, OOP, etc.
- For code snippets, write compact code with minimal comments. Always specify language in markdown blocks."""

@router.post("/chat")
async def chat_with_ai(
    request: ChatRequest,
    current_user: Optional[dict] = Depends(get_optional_current_user)
) -> Any:
    if not settings.GEMINI_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service is not configured. Please add GEMINI_API_KEY to the backend environment."
        )
    
    # Priority handling: unauthenticated users get a lower priority delay
    if not current_user:
        await asyncio.sleep(1.5)
        
    try:
        import google.generativeai as genai
        
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel(
            model_name="models/gemini-2.0-flash-lite",
            system_instruction=BCSIT_SYSTEM_PROMPT
        )
        
        # Build chat history for context
        history = []
        for msg in (request.history or []):
            history.append({
                "role": msg.role,
                "parts": [msg.content]
            })
        
        # Start chat session with history
        chat = model.start_chat(history=history)
        
        # Send the new message
        response = chat.send_message(request.message)
        
        return {
            "response": response.text,
            "model": "gemini-2.0-flash-lite"
        }
        
    except Exception as e:
        error_msg = str(e)
        if "API_KEY_INVALID" in error_msg or "API key" in error_msg:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Gemini API key. Please check your GEMINI_API_KEY configuration."
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI service error: {error_msg}"
        )


@router.get("/health")
async def ai_health() -> Any:
    """Check if AI service is configured."""
    return {
        "configured": bool(settings.GEMINI_API_KEY),
        "model": "gemini-1.5-flash"
    }
