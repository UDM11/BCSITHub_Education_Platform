from fastapi import APIRouter, HTTPException, status, Depends
from app.config import settings
from app.dependencies import get_optional_current_user
from app.client import supabase_client
from typing import Any, List, Optional
from pydantic import BaseModel
import asyncio
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai", tags=["ai"])

class ChatMessage(BaseModel):
    role: str  # "user" or "model"
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []

BCSIT_SYLLABUS = """
Semester I:
- ENG 111 English (3 credits)
- MTH 113 Mathematics I (3 credits)
- CMP 173 Internet Technology I (3 credits)
- CMP 171 Fundamentals of Computer Systems (3 credits)
- CMP 172 Programming Language (C) (3 credits)

Semester II:
- ENG 112 Business Communication (3 credits)
- MTH 114 Mathematics II (3 credits)
- CMP 174 Digital Systems (3 credits)
- CMP 175 Object-Oriented Language (Java) (3 credits)
- CMP 176 Data Structure and Algorithm (3 credits)
- PRJ 181 Project I (2 credits)

Semester III:
- STT 220 Linear Algebra and Probability (3 credits)
- CMP 271 Database Management System (3 credits)
- CMP 272 Object-Oriented Analysis and Design (3 credits)
- CMP 273 Internet Technology II (Programming) (3 credits)
- MGT 222 Principles of Management (3 credits)

Semester IV:
- CMP 275 Computer Architecture and Microprocessor (3 credits)
- CMP 274 Numerical Methods (3 credits)
- CMP 276 Software Engineering and Project Management (3 credits)
- CMP 277 Data Communication and Networks (3 credits)
- FIN 222 Fundamentals of Financial Management (3 credits)
- PRI 281 Project II (2 credits)

Semester V:
- MKT 351 Digital Marketing (3 credits)
- CMP 381 Operating Systems (3 credits)
- MGT 322 Organizational Behavior (3 credits)
- CMP 471 Artificial Intelligence (3 credits)
- SPEC Specialization Course (3 credits)

Semester VI:
- CMP 384 Computer Graphics (3 credits)
- RCH 322 Research Methods (3 credits)
- CMP 382 Cloud Computing (3 credits)
- ECO 322 Applied Economics (3 credits)
- CONC Concentration II (3 credits)

Semester VII:
- MGT 422 Strategic Management (3 credits)
- MGT 423 Management of Human Resources (3 credits)
- CMP 383 Digital Economy (3 credits)
- CMP 472 Information System Security (3 credits)
- PRI 481 Major Project (4 credits)
- CONC Concentration III (3 credits)

Semester VIII:
- LAW 422 Legal Aspects of Business and Technology (3 credits)
- MGT 424 Innovation and Entrepreneurship (3 credits)
- INT 494 Internship (5 credits)
- CONC Concentration IV (3 credits)
"""

BCSIT_COLLEGES = """
- SAIM College
- Apollo International College
- Quest International College
- Shubhashree College of Management
- Liberty College
- Uniglobe College
- Medhavi College
- Crimson College of Technology
- Rajdhani Model College
- Excel Business College
- Malpi International College
- Nobel College
- Boston International College
- Pokhara College of Management
- Apex College
"""

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
        
        # Query dynamic past papers from database
        papers_context = "No past papers registered on the website yet."
        try:
            papers_res = supabase_client.table("past_papers").select("semester, subject, exam_type, college, title").eq("approved", True).limit(50).execute()
            if papers_res.data:
                papers_list = [f"- {p['title']} (Subject: {p['subject']}, Semester: {p['semester']}, College: {p['college']}, Exam Type: {p['exam_type']})" for p in papers_res.data]
                papers_context = "\n".join(papers_list)
        except Exception as ex:
            logger.error(f"Failed to fetch past papers for AI context: {ex}")

        # Query dynamic notices from database
        notices_context = "No PU notices registered on the website yet."
        try:
            notices_res = supabase_client.table("pu_notices").select("title, category, date").order("date", desc=True).limit(20).execute()
            if notices_res.data:
                notices_list = [f"- {n['title']} (Category: {n['category']}, Date: {n['date']})" for n in notices_res.data]
                notices_context = "\n".join(notices_list)
        except Exception as ex:
            logger.error(f"Failed to fetch PU notices for AI context: {ex}")

        # Inject context into system instructions
        dynamic_instruction = f"""{BCSIT_SYSTEM_PROMPT}

DATABASE CONTEXT (Use this exact data to answer any queries about syllabus, college availability, past papers, and PU notices on BCSITHub. If a subject, college, paper, or notice is NOT listed below, clearly state that it is not available or registered on the BCSITHub website):

### 1. Affiliated Colleges List:
{BCSIT_COLLEGES}

### 2. Official Pokhara University BCSIT Syllabus:
{BCSIT_SYLLABUS}

### 3. Active Approved Past Papers on BCSITHub:
{papers_context}

### 4. Active PU Notices on BCSITHub:
{notices_context}
"""

        genai.configure(api_key=settings.GEMINI_API_KEY)
        model_name = settings.GEMINI_MODEL_NAME if settings.GEMINI_MODEL_NAME.startswith("models/") else f"models/{settings.GEMINI_MODEL_NAME}"
        model = genai.GenerativeModel(
            model_name=model_name,
            system_instruction=dynamic_instruction
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
            "model": settings.GEMINI_MODEL_NAME
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
