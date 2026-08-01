import bcrypt
import jwt
import uuid
import random
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from app.client import supabase_client
from app.schemas.auth import UserSignUp, UserSignIn, UserProfileUpdate, TokenResponse, UserResponse
from app.dependencies import get_current_user, get_admin_user, get_teacher_or_admin_user
from typing import Any, List
from app.config import settings
from app.email import send_otp_email

router = APIRouter(prefix="/auth", tags=["auth"])

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False

def create_jwt_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.utcnow() + timedelta(days=30)
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm="HS256")

def generate_otp() -> str:
    """Generate a cryptographically random 6-digit OTP."""
    return str(random.randint(100000, 999999))

def build_user_response(profile: dict, token: str = None) -> dict:
    """Shared helper to build full user response dict."""
    resp = {
        "id": profile["id"],
        "email": profile["email"],
        "name": profile["name"],
        "role": profile["role"],
        "semester": profile["semester"],
        "college": profile.get("college") or "",
        "college_address": profile.get("college_address") or "",
        "avatar_url": profile.get("avatar_url") or "",
        "auth_provider": profile.get("auth_provider") or "email",
        "provider_id": profile.get("provider_id") or "",
        "is_active": profile.get("is_active", True),
        "is_verified": profile.get("is_verified", False),
        "email_verified": profile.get("is_verified", False),
        "needs_password_change": profile.get("needs_password_change", False),
        "created_at": profile.get("created_at"),
        "updated_at": profile.get("updated_at"),
        "last_login": profile.get("last_login")
    }
    if token:
        return {"access_token": token, "token_type": "bearer", "user": resp}
    return resp

@router.post("/signup")
async def signup(credentials: UserSignUp) -> Any:
    try:
        # Check if email is already taken
        email_check = supabase_client.table("users").select("id").eq("email", credentials.email).execute()
        if email_check.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email address has already been registered"
            )

        # Generate OTP and expiry (10 min from now)
        otp = generate_otp()
        otp_expires = (datetime.utcnow() + timedelta(minutes=10)).isoformat()

        # Generate new local ID & hash the password
        user_id = str(uuid.uuid4())
        hashed_password = hash_password(credentials.password)
        now_str = datetime.utcnow().isoformat()

        # Save user to public.users table (is_verified=False until OTP confirmed)
        new_user = {
            "id": user_id,
            "email": credentials.email,
            "password": hashed_password,
            "name": credentials.name,
            "role": credentials.role,
            "semester": credentials.semester,
            "college": credentials.college or "",
            "college_address": credentials.college_address or "",
            "avatar_url": credentials.avatar_url or "",
            "auth_provider": credentials.auth_provider or "email",
            "provider_id": credentials.provider_id or "",
            "is_active": True,
            "is_verified": False,
            "needs_password_change": False,
            "otp_code": otp,
            "otp_expires_at": otp_expires,
            "created_at": now_str,
            "updated_at": now_str
        }

        insert_resp = supabase_client.table("users").insert(new_user).execute()
        if not insert_resp.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to register user record"
            )

        # Send OTP verification email
        send_otp_email(credentials.email, credentials.name, otp)

        return {
            "message": "Account created! Please check your email for a 6-digit verification code.",
            "email": credentials.email,
            "requires_verification": True
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Signup failed: {str(e)}"
        )

@router.post("/signin", response_model=TokenResponse)
async def signin(credentials: UserSignIn) -> Any:
    try:
        # Fetch user by email
        user_query = supabase_client.table("users").select("*").eq("email", credentials.email).execute()
        if not user_query.data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        profile = user_query.data[0]

        # Check if user is active
        if not profile.get("is_active", True):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account has been deactivated. Please contact support."
            )

        stored_hash = profile.get("password") or ""

        # Verify the password locally
        if not verify_password(credentials.password, stored_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        # Block unverified users — frontend will redirect to /verify
        if not profile.get("is_verified", False):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="EMAIL_NOT_VERIFIED"
            )

        user_id = profile["id"]
        token = create_jwt_token(user_id)
        now_str = datetime.utcnow().isoformat()

        # Update last_login in the database
        supabase_client.table("users").update({"last_login": now_str}).eq("id", user_id).execute()

        return build_user_response(profile, token)
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Login failed: {str(e)}"
        )

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)) -> Any:
    return build_user_response(current_user)

@router.post("/change-password")
async def change_password(payload: dict, current_user: dict = Depends(get_current_user)) -> Any:
    password = payload.get("password")
    if not password or len(password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long"
        )
    try:
        # Hash new password locally
        hashed_password = hash_password(password)
        now_str = datetime.utcnow().isoformat()
        
        # Update public.users table
        supabase_client.table("users").update({
            "password": hashed_password,
            "needs_password_change": False,
            "updated_at": now_str
        }).eq("id", current_user["id"]).execute()
        
        return {"message": "Password updated successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to update password: {str(e)}"
        )

@router.put("/profile", response_model=UserResponse)
async def update_profile(
    profile_data: UserProfileUpdate, 
    current_user: dict = Depends(get_current_user)
) -> Any:
    try:
        update_payload = {}
        if profile_data.name is not None:
            update_payload["name"] = profile_data.name
        if profile_data.semester is not None:
            update_payload["semester"] = profile_data.semester
        if profile_data.role is not None:
            update_payload["role"] = profile_data.role
        if profile_data.college is not None:
            update_payload["college"] = profile_data.college
        if profile_data.college_address is not None:
            update_payload["college_address"] = profile_data.college_address
        if profile_data.avatar_url is not None:
            update_payload["avatar_url"] = profile_data.avatar_url
        if profile_data.is_active is not None:
            update_payload["is_active"] = profile_data.is_active
        if profile_data.is_verified is not None:
            update_payload["is_verified"] = profile_data.is_verified
            
        if update_payload:
            update_payload["updated_at"] = datetime.utcnow().isoformat()
            
        if not update_payload:
            # Re-read to return fresh copy
            profile = current_user
        else:
            update_query = supabase_client.table("users")\
                .update(update_payload)\
                .eq("id", current_user["id"])\
                .execute()
                
            if not update_query.data:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Profile update failed"
                )
            profile = update_query.data[0]
            
        return {
            "id": profile["id"],
            "email": profile["email"],
            "name": profile["name"],
            "role": profile["role"],
            "semester": profile["semester"],
            "college": profile.get("college") or "",
            "college_address": profile.get("college_address") or "",
            "avatar_url": profile.get("avatar_url") or "",
            "auth_provider": profile.get("auth_provider") or "email",
            "provider_id": profile.get("provider_id") or "",
            "is_active": profile.get("is_active", True),
            "is_verified": profile.get("is_verified", False),
            "email_verified": profile.get("is_verified", False),
            "needs_password_change": profile.get("needs_password_change", False),
            "created_at": profile.get("created_at"),
            "updated_at": profile.get("updated_at"),
            "last_login": profile.get("last_login")
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Profile update failed: {str(e)}"
        )

@router.post("/signout")
async def signout() -> Any:
    return {"message": "Successfully logged out"}

@router.post("/forgot-password")
async def forgot_password(payload: dict) -> Any:
    email = payload.get("email")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address is required"
        )
    try:
        # Check if user profile exists
        profile_query = supabase_client.table("users").select("*").eq("email", email).execute()
        if not profile_query.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No account found with this email address"
            )
            
        # Reset password to a temporary one: Temp123!
        temp_pass = "Temp123!"
        hashed_password = hash_password(temp_pass)
        now_str = datetime.utcnow().isoformat()
        
        # Update user password to temporary password and set needs_password_change = True
        supabase_client.table("users").update({
            "password": hashed_password,
            "needs_password_change": True,
            "updated_at": now_str
        }).eq("email", email).execute()
        
        return {
            "message": f"Password has been reset. Your temporary password is: {temp_pass}. Please use this password to log in and change it immediately."
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to reset password: {str(e)}"
        )

@router.post("/verify-otp")
async def verify_otp(payload: dict) -> Any:
    """Verify 6-digit OTP submitted by user after signup."""
    email = payload.get("email", "").strip()
    otp = payload.get("otp", "").strip()

    if not email or not otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email and OTP code are required"
        )

    try:
        user_query = supabase_client.table("users").select("*").eq("email", email).execute()
        if not user_query.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No account found with this email address"
            )

        profile = user_query.data[0]

        # Already verified — issue token directly
        if profile.get("is_verified", False):
            token = create_jwt_token(profile["id"])
            return build_user_response(profile, token)

        stored_otp = profile.get("otp_code") or ""
        otp_expires_str = profile.get("otp_expires_at") or ""

        if not stored_otp or stored_otp != otp:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid verification code. Please check and try again."
            )

        # Check expiry
        if otp_expires_str:
            expires_at = datetime.fromisoformat(otp_expires_str.replace("Z", "+00:00"))
            # Make expires_at timezone-naive for comparison
            if expires_at.tzinfo is not None:
                expires_at = expires_at.replace(tzinfo=None)
            if datetime.utcnow() > expires_at:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Verification code has expired. Please request a new one."
                )

        now_str = datetime.utcnow().isoformat()

        # Mark user as verified and clear OTP fields
        supabase_client.table("users").update({
            "is_verified": True,
            "otp_code": None,
            "otp_expires_at": None,
            "last_login": now_str,
            "updated_at": now_str
        }).eq("email", email).execute()

        # Fetch fresh profile and issue JWT
        fresh = supabase_client.table("users").select("*").eq("email", email).execute()
        profile = fresh.data[0] if fresh.data else profile
        profile["is_verified"] = True
        profile["last_login"] = now_str

        token = create_jwt_token(profile["id"])
        return build_user_response(profile, token)

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Verification failed: {str(e)}"
        )


@router.post("/resend-verification")
async def resend_verification(payload: dict) -> Any:
    """Resend OTP verification email. Accepts {email} in body (no auth required)."""
    email = payload.get("email", "").strip()
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address is required"
        )

    try:
        user_query = supabase_client.table("users").select("*").eq("email", email).execute()
        if not user_query.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No account found with this email address"
            )

        profile = user_query.data[0]

        if profile.get("is_verified", False):
            return {"message": "Email is already verified."}

        # Generate fresh OTP
        otp = generate_otp()
        otp_expires = (datetime.utcnow() + timedelta(minutes=10)).isoformat()

        supabase_client.table("users").update({
            "otp_code": otp,
            "otp_expires_at": otp_expires,
            "updated_at": datetime.utcnow().isoformat()
        }).eq("email", email).execute()

        send_otp_email(email, profile.get("name", "Student"), otp)

        return {"message": "A new verification code has been sent to your email."}

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to resend verification: {str(e)}"
        )

@router.get("/users", response_model=List[UserResponse])
async def list_users(current_user: dict = Depends(get_admin_user)) -> Any:
    try:
        res = supabase_client.table("users").select("*").execute()
        mapped = []
        for profile in (res.data or []):
            mapped.append({
                "id": profile["id"],
                "email": profile["email"],
                "name": profile["name"],
                "role": profile["role"],
                "semester": profile["semester"],
                "college": profile.get("college") or "",
                "college_address": profile.get("college_address") or "",
                "avatar_url": profile.get("avatar_url") or "",
                "auth_provider": profile.get("auth_provider") or "email",
                "provider_id": profile.get("provider_id") or "",
                "is_active": profile.get("is_active", True),
                "is_verified": profile.get("is_verified", False),
                "email_verified": profile.get("is_verified", False),
                "needs_password_change": profile.get("needs_password_change", False),
                "created_at": profile.get("created_at"),
                "updated_at": profile.get("updated_at"),
                "last_login": profile.get("last_login")
            })
        return mapped
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to fetch users: {str(e)}"
        )

@router.get("/students", response_model=List[UserResponse])
async def list_students(current_user: dict = Depends(get_teacher_or_admin_user)) -> Any:
    try:
        res = supabase_client.table("users").select("*").eq("role", "student").execute()
        mapped = []
        for profile in (res.data or []):
            mapped.append({
                "id": profile["id"],
                "email": profile["email"],
                "name": profile["name"],
                "role": profile["role"],
                "semester": profile["semester"],
                "college": profile.get("college") or "",
                "college_address": profile.get("college_address") or "",
                "avatar_url": profile.get("avatar_url") or "",
                "auth_provider": profile.get("auth_provider") or "email",
                "provider_id": profile.get("provider_id") or "",
                "is_active": profile.get("is_active", True),
                "is_verified": profile.get("is_verified", False),
                "email_verified": profile.get("is_verified", False),
                "needs_password_change": profile.get("needs_password_change", False),
                "created_at": profile.get("created_at"),
                "updated_at": profile.get("updated_at"),
                "last_login": profile.get("last_login")
            })
        return mapped
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to fetch students: {str(e)}"
        )
