from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from app.client import supabase_client
from app.email import send_newsletter_otp_email
import random
from datetime import datetime, timedelta, timezone

router = APIRouter(prefix="/newsletter", tags=["newsletter"])

class SubscribeRequest(BaseModel):
    email: EmailStr

class VerifyRequest(BaseModel):
    email: EmailStr
    otp: str

def generate_otp() -> str:
    return str(random.randint(100000, 999999))

@router.post("/subscribe")
async def subscribe_newsletter(req: SubscribeRequest):
    email = req.email.strip().lower()
    otp = generate_otp()
    expires_at = (datetime.now(timezone.utc) + timedelta(minutes=10)).isoformat()
    
    # Save/update subscriber details in Supabase
    subscriber_data = {
        "email": email,
        "otp_code": otp,
        "otp_expires_at": expires_at,
        "verified": False
    }
    
    try:
        # Check if already verified
        check_res = supabase_client.table("newsletter_subscribers").select("verified").eq("email", email).execute()
        if check_res.data and check_res.data[0]["verified"]:
            return {"message": "Email is already verified and subscribed!", "already_subscribed": True}
            
        # Upsert subscriber data (update if email already exists, else insert)
        # PostgREST allows upsert using on_conflict
        res = supabase_client.table("newsletter_subscribers").upsert(subscriber_data, on_conflict="email").execute()
        if not res.data:
            raise HTTPException(status_code=400, detail="Failed to save subscription record")
            
        # Send OTP verification email
        email_sent = send_newsletter_otp_email(email, otp)
        if not email_sent:
            raise HTTPException(status_code=500, detail="Failed to send verification email. Please check your address.")
            
        return {"message": "Verification code sent! Please check your inbox.", "requires_verification": True}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Subscription error: {str(e)}")

@router.post("/verify")
async def verify_subscription(req: VerifyRequest):
    email = req.email.strip().lower()
    otp = req.otp.strip()
    
    try:
        res = supabase_client.table("newsletter_subscribers").select("*").eq("email", email).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Subscription request not found.")
            
        record = res.data[0]
        
        # Verify OTP
        if record["otp_code"] != otp:
            raise HTTPException(status_code=400, detail="Invalid verification code. Please try again.")
            
        # Verify expiration
        expires_str = record["otp_expires_at"].replace("Z", "+00:00")
        expires_at = datetime.fromisoformat(expires_str)
        if datetime.now(timezone.utc) > expires_at:
            raise HTTPException(status_code=400, detail="Verification code has expired. Please request a new code.")
            
        # Update verified status
        update_res = supabase_client.table("newsletter_subscribers").update({"verified": True, "otp_code": None, "otp_expires_at": None}).eq("email", email).execute()
        if not update_res.data:
            raise HTTPException(status_code=400, detail="Failed to complete subscription activation.")
            
        return {"message": "Subscription activated successfully! You are now subscribed to PU notices.", "verified": True}
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Verification error: {str(e)}")
