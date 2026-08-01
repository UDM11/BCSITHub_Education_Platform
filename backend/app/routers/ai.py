from fastapi import APIRouter, HTTPException, status, Depends
from app.config import settings
from app.dependencies import get_current_user
from typing import Any, List, Optional
from pydantic import BaseModel

router = APIRouter(prefix="/ai", tags=["ai"])

class ChatMessage(BaseModel):
    role: str  # "user" or "model"
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []

BCSIT_SYSTEM_PROMPT = """You are BCSITHub AI — a dedicated academic study assistant for BCSIT (Bachelor of Computer Science and Information Technology) students at Pokhara University, Nepal.

Your core responsibilities:
- Answer questions about BCSIT subjects: Programming (C, Java, Python), Data Structures, DBMS, Networking, OS, Software Engineering, AI, Web Technologies, Mathematics, etc.
- Explain concepts clearly with examples, code snippets when relevant
- Help students understand past exam questions and patterns
- Guide students on Pokhara University syllabus topics
- Assist with assignments, project ideas, and study strategies
- Explain algorithms step by step when asked
- Provide code examples in languages taught in BCSIT (C, Java, Python, JavaScript, PHP)

Your personality:
- Friendly, encouraging, and student-focused
- Concise but thorough — avoid unnecessary fluff
- Use simple language, avoid overly academic jargon
- When explaining code, always include comments
- If you don't know something specific to PU, be honest but still help as much as possible

Important constraints:
- Stay focused on academic/educational topics
- Do not help with cheating in live exams — but explaining concepts and past papers is fine
- If asked off-topic questions (movies, gossip, politics), gently redirect to academic topics
- Always be respectful and encouraging to students

Format:
- Use markdown formatting (bold, code blocks, lists) when it improves clarity
- Keep responses focused and well-structured
- For code examples, always use proper code blocks with language specified"""

@router.post("/chat")
async def chat_with_ai(
    request: ChatRequest,
    current_user: dict = Depends(get_current_user)
) -> Any:
    if not settings.GEMINI_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service is not configured. Please add GEMINI_API_KEY to the backend environment."
        )
    
    try:
        import google.generativeai as genai
        
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel(
            model_name="models/gemini-2.0-flash",
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
            "model": "gemini-1.5-flash"
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
