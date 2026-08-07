from fastapi import APIRouter, Depends, HTTPException, status
from app.dependencies import get_admin_user
from app.client import supabase_client
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter(prefix="/support", tags=["support"])

class TicketCreate(BaseModel):
    name: str
    email: str
    subject: str
    message: str
    priority: str = "medium"

class TicketResponse(BaseModel):
    id: str
    name: str
    email: str
    subject: str
    message: str
    priority: str
    resolved: bool
    created_at: str

@router.post("", response_model=TicketResponse)
async def create_ticket(ticket: TicketCreate):
    new_ticket = {
        "name": ticket.name,
        "email": ticket.email,
        "subject": ticket.subject,
        "message": ticket.message,
        "priority": ticket.priority,
        "resolved": False
    }
    try:
        res = supabase_client.table("support_tickets").insert(new_ticket).execute()
        if not res.data:
            raise HTTPException(status_code=400, detail="Failed to save support ticket to database")
        return res.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Database error: {str(e)}")

@router.get("", response_model=List[TicketResponse])
async def list_tickets(current_user: dict = Depends(get_admin_user)):
    try:
        res = supabase_client.table("support_tickets").select("*").order("created_at", desc=True).execute()
        return res.data or []
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Database error: {str(e)}")

@router.patch("/{ticket_id}/resolve", response_model=TicketResponse)
async def resolve_ticket(ticket_id: str, current_user: dict = Depends(get_admin_user)):
    try:
        # Get current resolve status
        ticket_res = supabase_client.table("support_tickets").select("resolved").eq("id", ticket_id).execute()
        if not ticket_res.data:
            raise HTTPException(status_code=404, detail="Ticket not found")
        
        current_resolved = ticket_res.data[0]["resolved"]
        res = supabase_client.table("support_tickets").update({"resolved": not current_resolved}).eq("id", ticket_id).execute()
        return res.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Database error: {str(e)}")

@router.delete("/{ticket_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_ticket(ticket_id: str, current_user: dict = Depends(get_admin_user)):
    try:
        res = supabase_client.table("support_tickets").delete().eq("id", ticket_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Ticket not found")
        return None
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Database error: {str(e)}")
