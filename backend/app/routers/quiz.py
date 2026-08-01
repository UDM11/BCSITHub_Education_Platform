from fastapi import APIRouter, HTTPException, Query, status
from app.config import settings
from typing import Optional
import urllib.request
import urllib.parse
import json
import html
import random

router = APIRouter(prefix="/quiz", tags=["quiz"])

# ── Subject-code → quiz source routing ───────────────────────────────────────
#
# QuizAPI.io categories: Linux, DevOps, Networking, Programming, Cloud, Docker,
#                        Kubernetes, Database, CyberSecurity, Code
#
# OpenTDB categories:
#   9  = General Knowledge
#   17 = Science & Nature
#   18 = Computer Science
#   19 = Science & Mathematics
#   24 = Politics
# ─────────────────────────────────────────────────────────────────────────────

# Map course code → (source, category_or_opentdb_id)
SUBJECT_ROUTE_MAP: dict[str, tuple[str, str | int]] = {
    # Semester I
    "ENG 111": ("opentdb", 9),          # English → General Knowledge
    "MTH 113": ("opentdb", 19),         # Mathematics I → Science & Math
    "CMP 173": ("quizapi", "Programming"),  # Internet Technology I
    "CMP 171": ("quizapi", "Code"),         # Fundamentals of Computer Systems
    "CMP 172": ("quizapi", "Programming"),  # Programming Language

    # Semester II
    "ENG 112": ("opentdb", 9),          # Business Communication
    "MTH 114": ("opentdb", 19),         # Mathematics II
    "CMP 174": ("quizapi", "Code"),         # Digital Systems
    "CMP 175": ("quizapi", "Programming"),  # OO Language (Java)
    "CMP 176": ("quizapi", "Code"),         # Data Structure & Algorithm
    "PRJ 181": ("quizapi", "Programming"),  # Project I

    # Semester III
    "STT 220": ("opentdb", 19),         # Linear Algebra & Probability
    "CMP 271": ("quizapi", "Database"),     # Database Management System
    "CMP 272": ("quizapi", "Programming"),  # OO Analysis & Design
    "CMP 273": ("quizapi", "Programming"),  # Internet Technology II
    "MGT 222": ("opentdb", 9),          # Principles of Management

    # Semester IV
    "CMP 275": ("quizapi", "Linux"),        # Computer Architecture & Microprocessor
    "CMP 274": ("opentdb", 19),         # Numerical Methods
    "CMP 276": ("quizapi", "DevOps"),       # Software Engineering & PM
    "CMP 277": ("quizapi", "Networking"),   # Data Communication & Networks
    "FIN 222": ("opentdb", 9),          # Financial Management
    "PRI 281": ("quizapi", "Programming"),  # Project II

    # Semester V
    "MKT 351": ("opentdb", 9),          # Digital Marketing
    "CMP 381": ("quizapi", "Linux"),        # Operating Systems
    "MGT 322": ("opentdb", 9),          # Organizational Behavior
    "CMP 471": ("quizapi", "Code"),         # Artificial Intelligence

    # Semester VI
    "CMP 384": ("quizapi", "Code"),         # Computer Graphics
    "RCH 322": ("opentdb", 9),          # Research Methods
    "CMP 382": ("quizapi", "Cloud"),        # Cloud Computing
    "ECO 322": ("opentdb", 9),          # Applied Economics

    # Semester VII
    "MGT 422": ("opentdb", 9),          # Strategic Management
    "MGT 423": ("opentdb", 9),          # Human Resources Management
    "CMP 383": ("opentdb", 9),          # Digital Economy
    "CMP 472": ("quizapi", "CyberSecurity"),# Information System Security
    "PRI 481": ("quizapi", "Programming"),  # Major Project

    # Semester VIII
    "LAW 422": ("opentdb", 24),         # Legal Aspects of Business & Technology
    "MGT 424": ("opentdb", 9),          # Innovation & Entrepreneurship
    "INT 494": ("quizapi", "Programming"), # Internship
}


def _fetch_opentdb(limit: int, category_id: int, difficulty: Optional[str]) -> list:
    """Fetch from Open Trivia Database and normalize to frontend schema."""
    params: dict = {
        "amount": str(limit),
        "category": str(category_id),
        "type": "multiple",
    }
    if difficulty and difficulty.lower() not in ("all", ""):
        params["difficulty"] = difficulty.lower()

    def _do_request(url: str) -> list:
        req = urllib.request.Request(url, headers={"User-Agent": "BCSITHub/1.0"})
        with urllib.request.urlopen(req, timeout=8) as resp:
            data = json.loads(resp.read().decode())
        return data.get("results", [])

    url = f"https://opentdb.com/api.php?{urllib.parse.urlencode(params)}"
    results = _do_request(url)

    # If difficulty filter returns nothing, retry without it
    if not results and "difficulty" in params:
        params.pop("difficulty")
        url = f"https://opentdb.com/api.php?{urllib.parse.urlencode(params)}"
        results = _do_request(url)

    mapped = []
    for idx, item in enumerate(results):
        q_text = html.unescape(item.get("question", ""))
        correct = html.unescape(item.get("correct_answer", ""))
        incorrects = [html.unescape(a) for a in item.get("incorrect_answers", [])]

        answers = [{"text": correct, "isCorrect": True}]
        for inc in incorrects:
            answers.append({"text": inc, "isCorrect": False})
        random.shuffle(answers)

        diff_raw = item.get("difficulty", "medium").capitalize()
        mapped.append({
            "id": f"opentdb-{idx}-{random.randint(1000, 9999)}",
            "text": q_text,
            "difficulty": diff_raw,
            "explanation": f"The correct answer is: {correct}",
            "category": item.get("category", "General"),
            "answers": answers,
        })
    return mapped


def _fetch_quizapi(limit: int, category: str, difficulty: Optional[str], api_key: str) -> list:
    """Fetch from QuizAPI.io and return raw list (already in frontend schema)."""
    params: dict = {"limit": str(limit), "category": category}
    if difficulty and difficulty.lower() not in ("all", ""):
        params["difficulty"] = difficulty.lower()

    url = f"https://quizapi.io/api/v1/questions?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url, headers={
        "Authorization": f"Bearer {api_key}",
        "User-Agent": "BCSITHub/1.0",
    })
    with urllib.request.urlopen(req, timeout=8) as resp:
        data = json.loads(resp.read().decode())

    if isinstance(data, dict) and "data" in data:
        return data["data"]
    return data if isinstance(data, list) else []


@router.get("")
async def get_quiz(
    category: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
    limit: int = Query(10),
    subject_code: Optional[str] = Query(None),
):
    code = (subject_code or "").strip().upper()

    # ── 1. Look up subject in our routing table ──────────────────────────────
    route = SUBJECT_ROUTE_MAP.get(code)

    if route:
        source, target = route
        try:
            if source == "opentdb":
                results = _fetch_opentdb(limit, int(target), difficulty)
                if results:
                    return results
                # Fallback to QuizAPI Programming if OpenTDB returns nothing
                api_key = settings.QUIZ_API_KEY
                if api_key:
                    return _fetch_quizapi(limit, "Programming", difficulty, api_key)
            else:
                # source == "quizapi"
                api_key = settings.QUIZ_API_KEY
                if not api_key:
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail="Quiz API Key not configured on server",
                    )
                results = _fetch_quizapi(limit, str(target), difficulty, api_key)
                if results:
                    return results
                # Fallback: retry without difficulty filter
                results = _fetch_quizapi(limit, str(target), None, api_key)
                if results:
                    return results
                # Final fallback: Programming category
                return _fetch_quizapi(limit, "Programming", None, api_key)
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to fetch questions for {code}: {str(e)}",
            )

    # ── 2. Generic category-based fallback (no specific subject_code) ────────
    api_key = settings.QUIZ_API_KEY
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Quiz API Key not configured on server",
        )

    quizapi_category = category or "Programming"

    try:
        results = _fetch_quizapi(limit, quizapi_category, difficulty, api_key)
        if results:
            return results
        # Fallback without difficulty
        results = _fetch_quizapi(limit, quizapi_category, None, api_key)
        if results:
            return results
        # Final fallback
        return _fetch_quizapi(limit, "Programming", None, api_key)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to fetch quiz questions: {str(e)}",
        )
