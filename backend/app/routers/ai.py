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

BCSIT_SUBJECT_UNITS = """
Here are the syllabus units/chapters for registered courses (Semester I to IV):

- ENG 111 English:
  * Unit 1: Introduction to Language Skills
  * Unit 2: Listening Skills
  * Unit 3: Speaking Skills
  * Unit 4: English Grammar for Accuracy
  * Unit 5: Reading Skills
  * Unit 6: Basic Research Skills
  * Unit 7: Writing Skills
- MTH 113 Mathematics I:
  * Unit 1: Basic Concept
  * Unit 2: Functions, Limit, and Continuity
  * Unit 3: Derivative
  * Unit 4: Application of Derivatives
  * Unit 5: Integrals
  * Unit 6: Matrices and Determinants
  * Unit 7: Permutations and Combinations
- CMP 173 Internet Technology I:
  * Unit 1: Introduction to Web Technology
  * Unit 2: Hyper Text Markup Language (HTML)
  * Unit 3: HTML5
  * Unit 4: Cascading Style Sheets (CSS)
  * Unit 5: Advanced CSS
  * Unit 6: Client-Side Scripting with JavaScript
  * Unit 7: Advanced JavaScript
- CMP 171 Fundamentals of Computer Systems:
  * Unit 1: Introduction to Computer
  * Unit 2: Computer Hardware
  * Unit 3: Computer Software
  * Unit 4: Operating System
  * Unit 5: Data Communication and Computer Network
  * Unit 6: Internet and Internet Services
  * Unit 7: Database Management System
  * Unit 8: Multimedia
  * Unit 9: Computer Security and Privacy
  * Unit 10: Current Trends in Computing
- CMP 172 Programming Language:
  * Unit 1: Problem Solving with Computer
  * Unit 2: Elements of C
  * Unit 3: Input and Output
  * Unit 4: Operators and Expressions
  * Unit 5: Control Statements
  * Unit 6: Arrays and Strings
  * Unit 7: Functions
  * Unit 8: Pointers
  * Unit 9: Structures and Unions
  * Unit 10: File Handling
- ENG 112 Business Communication:
  * Unit 1: Foundation of Business Communication
  * Unit 2: Written Business Communication
  * Unit 3: Oral Business Communication
  * Unit 4: Non-verbal and Intercultural Business Communication
  * Unit 5: Visual Communication
  * Unit 6: Employment Communication and Presentation (Practicum)
- MTH 114 Mathematics II:
  * Unit 1: Complex Numbers
  * Unit 2: Infinite Sequence and Series
  * Unit 3: Application of Antiderivative
  * Unit 4: Optimization: Functions of Several Variables
  * Unit 5: Ordinary Differential Equation
  * Unit 6: Integers and Division
  * Unit 7: Fourier Series and Integrals
- CMP 174 Digital Systems:
  * Unit 1: Binary Foundation and Digital Representation
  * Unit 2: Boolean Building Blocks
  * Unit 3: Simplification of Boolean Functions
  * Unit 4: Combinational Logic
  * Unit 5: Sequential Logic
  * Unit 6: Registers and Counters
  * Unit 7: Digital Systems Design
- CMP 175 Object-Oriented Language (Java):
  * Unit 1: Introduction to Object-Oriented Programming
  * Unit 2: Basic Java
  * Unit 3: Object-Oriented Programming
  * Unit 4: Inheritance and Polymorphism
  * Unit 5: Exception Handling
  * Unit 6: Stream in JAVA
  * Unit 7: GUI Programming with Swing
  * Unit 8: Generics
- CMP 176 Data Structure and Algorithm:
  * Unit 1: Introduction to Data Structure
  * Unit 2: Recursion
  * Unit 3: Stacks
  * Unit 4: Queue
  * Unit 5: Linked List
  * Unit 6: Trees
  * Unit 7: Sorting
  * Unit 8: Searching
  * Unit 9: Graph
  * Unit 10: Growth Functions
- PRJ 181 Project I:
  * Phase 1: Conceptual Framework and Proposal
  * Phase 2: Progress Report & System Design
  * Phase 3: Final Presentation and Defense
- CMP 272 Object-Oriented Analysis and Design:
  * Unit 1: Introduction to Object-Oriented
  * Unit 2: Requirement Elicitation and Analysis
  * Unit 3: Object oriented analysis
  * Unit 4: Object-Oriented Modeling Using UML Notation
  * Unit 5: Object Oriented Design principles
  * Unit 6: Applying GOF Design Patterns
  * Unit 7: Case Study and Project
- CMP 271 Database Management System:
  * Unit 1: Introduction
  * Unit 2: Data Models
  * Unit 3: Normalization
  * Unit 4: Relational Language
  * Unit 5: Query Processing
  * Unit 6: File organization and indexing
  * Unit 7: Security
  * Unit 8: Transaction and Concurrency Control
  * Unit 9: Backup and Recovery
  * Unit 10: Object oriented Database
- CMP 273 Internet Technology II (Programming):
  * Unit 1: Introduction
  * Unit 2: Control Structures and Loop
  * Unit 3: Array and Function
  * Unit 4: Form Handling and Data Validation
  * Unit 5: File Handling, Sessions, and Error Handling
  * Unit 6: Working with Database
  * Unit 7: Advanced PHP Concepts
  * Unit 8: PHP Framework
- MGT 222 Principles of Management:
  * Unit I: Introduction to Management
  * Unit II: The Evolution of Management Thoughts
  * Unit III: Decision Making
  * Unit IV: Planning and Organizing
  * Unit V: Leadership
  * Unit VI: Motivation
  * Unit VII: Controlling
  * Unit VIII: IT for Management
- STT 220 Linear Algebra and Probability:
  * Unit 1: Introduction
  * Unit 2: Summarization and Analysis of Data
  * Unit 3: Basic Probability
  * Unit 4: Correlation and Regression Analysis
  * Unit 5: Probability Distribution
  * Unit 6: Theory of Estimation
  * Unit 7: Hypothesis Testing
- CMP 275 Computer Architecture and Microprocessor:
  * Unit 1: Introduction to Microprocessor
  * Unit 2: Intel 8085
  * Unit 3: Computer Architecture Basics
  * Unit 4: Micro Operations
  * Unit 5: Control Unit and Central Processing Unit
  * Unit 6: Fixed Point Computer Arithmetic
  * Unit 7: Input and Output Organization
  * Unit 8: Memory Organization
  * Unit 9: Pipelining
- CMP 274 Numerical Methods:
  * Unit I: Introduction
  * Unit II: Solution of non-linear equations
  * Unit III: Interpolation & Approximation
  * Unit IV: Numerical Differentiation & Integration
  * Unit V: Solution of Ordinary Differential Equations
  * Unit VI: Solution of Linear algebraic equations
  * Unit VII: Solution Of Partial Differential Equations
- CMP 276 Software Engineering and Project Management:
  * Unit 1: Software and software engineering
  * Unit 2: Software process models
  * Unit 3: Software requirement specification and modeling
  * Unit 4: Design Concepts
  * Unit 5: Software measurement and metrics
  * Unit 6: Software testing and quality assurance
  * Unit 7: Configuration management and software maintenance
  * Unit 8: Software project management
  * Unit 9: Project Scheduling
  * Unit 10: Risk Management
  * Unit 11: Concept of software re-engineering
  * Unit 12: Emerging trends in software engineering
- CMP 277 Data Communication and Networks:
  * Unit 1: Introduction to Data Communication
  * Unit 2: Introduction to Computer Networks
  * Unit 3: Physical Layer and its Design Issues
  * Unit 4: Data Link Layer
  * Unit 5: Network Layer
  * Unit 6: Transport Layer
  * Unit 7: Application Layers
  * Unit 8: Network Management and Network Security
- FIN 222 Fundamentals of Financial Management:
  * Unit 1: Introduction to Financial Management
  * Unit 2: Financial Statement Analysis
  * Unit 3: Time Value of Money
  * Unit 4: Fundamentals of Risk and Return
  * Unit 5: Capital Structure and Financing Decision
  * Unit 6: Basics of Capital Budgeting Decisions
- PRI 281 Project II:
  * Phase 1: Conceptual Framework and Proposal
  * Phase 2: Progress Report & System Design
  * Phase 3: Final Presentation and Defense
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

DATABASE CONTEXT (Use this exact data to answer any queries about syllabus, college availability, past papers, PU notices, and subject units/chapters on BCSITHub. If a subject, college, paper, notice, or chapter unit is NOT listed below, clearly state that it is not available or registered on the BCSITHub website):

### 1. Affiliated Colleges List:
{BCSIT_COLLEGES}

### 2. Official Pokhara University BCSIT Syllabus:
{BCSIT_SYLLABUS}

### 3. Subject Units and Chapters:
{BCSIT_SUBJECT_UNITS}

### 4. Active Approved Past Papers on BCSITHub:
{papers_context}

### 5. Active PU Notices on BCSITHub:
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
