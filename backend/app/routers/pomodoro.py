from fastapi import APIRouter, Depends, HTTPException, status
from app.dependencies import get_current_user
from app.client import supabase_client
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta

router = APIRouter(prefix="/pomodoro", tags=["pomodoro"])

class SessionCreate(BaseModel):
    type: str # work, shortBreak, longBreak
    duration: int # in seconds

class SessionResponse(BaseModel):
    id: str
    user_id: str
    type: str
    duration: int
    completed_at: str

class PomodoroStatsResponse(BaseModel):
    totalSessions: int
    totalFocusTime: int
    todaySessions: int
    weekSessions: int
    streak: int
    history: List[SessionResponse]

@router.post("/session", response_model=SessionResponse)
async def record_session(session: SessionCreate, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    new_session = {
        "user_id": user_id,
        "type": session.type,
        "duration": session.duration
    }
    try:
        res = supabase_client.table("pomodoro_sessions").insert(new_session).execute()
        if not res.data:
            raise HTTPException(status_code=400, detail="Failed to save Pomodoro session to database")
        return res.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Database error: {str(e)}")

@router.get("/stats", response_model=PomodoroStatsResponse)
async def get_stats(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    try:
        # Fetch all user sessions
        res = supabase_client.table("pomodoro_sessions").select("*").eq("user_id", user_id).order("completed_at", desc=True).execute()
        user_sessions = res.data or []
        
        # Calculate stats
        total_sessions = len(user_sessions)
        total_focus_time = sum(s["duration"] for s in user_sessions if s["type"] == "work")
        
        # Date boundaries
        now = datetime.utcnow()
        today_start = datetime(now.year, now.month, now.day)
        one_week_ago = now - timedelta(days=7)
        
        today_sessions = 0
        week_sessions = 0
        
        for s in user_sessions:
            try:
                # Handle ISO completed_at parsing
                completed_str = s["completed_at"].replace("Z", "+00:00")
                completed_dt = datetime.fromisoformat(completed_str).replace(tzinfo=None)
                
                if completed_dt >= today_start:
                    today_sessions += 1
                if completed_dt >= one_week_ago:
                    week_sessions += 1
            except Exception as e:
                print("Failed to parse date:", e)
                
        # Real consecutive days streak calculation
        unique_dates = set()
        for s in user_sessions:
            try:
                completed_str = s["completed_at"].replace("Z", "+00:00")
                completed_dt = datetime.fromisoformat(completed_str).replace(tzinfo=None)
                unique_dates.add(completed_dt.date())
            except Exception as e:
                print("Failed to parse date for streak:", e)
                
        streak = 0
        if unique_dates:
            today = datetime.utcnow().date()
            yesterday = today - timedelta(days=1)
            if today in unique_dates or yesterday in unique_dates:
                current_date = today if today in unique_dates else yesterday
                while current_date in unique_dates:
                    streak += 1
                    current_date -= timedelta(days=1)
        
        # Map last 10 sessions for history
        history = []
        for s in user_sessions[:10]:
            history.append(SessionResponse(
                id=str(s["id"]),
                user_id=str(s["user_id"]),
                type=s["type"],
                duration=s["duration"],
                completed_at=s["completed_at"]
            ))
            
        return PomodoroStatsResponse(
            totalSessions=total_sessions,
            totalFocusTime=total_focus_time,
            todaySessions=today_sessions,
            weekSessions=week_sessions,
            streak=streak,
            history=history
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Database error: {str(e)}")
