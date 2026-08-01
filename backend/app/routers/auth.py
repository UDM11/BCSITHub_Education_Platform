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


@router.patch("/users/{user_id}/role")
async def update_user_role(
    user_id: str,
    payload: dict,
    current_user: dict = Depends(get_admin_user)
) -> Any:
    role = payload.get("role")
    if role not in ["student", "teacher", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role. Must be 'student', 'teacher', or 'admin'."
        )
    try:
        res = supabase_client.table("users")\
            .update({"role": role, "updated_at": datetime.utcnow().isoformat()})\
            .eq("id", user_id)\
            .execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="User not found")
        return build_user_response(res.data[0])
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    current_user: dict = Depends(get_admin_user)
) -> Any:
    try:
        res = supabase_client.table("users").delete().eq("id", user_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="User not found")
        return {"message": "User deleted successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


# ═════════════════════════════════════════════════════════════════════════
#  OAUTH SOCIAL SIGN-IN ENDPOINTS (GOOGLE, GITHUB, MICROSOFT)
# ═════════════════════════════════════════════════════════════════════════

from fastapi.responses import RedirectResponse
import urllib.parse
import json
import httpx

async def handle_social_login(email: str, name: str, provider: str, provider_id: str, avatar_url: str = "") -> RedirectResponse:
    """Helper to handle database lookup/creation and redirect back to frontend."""
    try:
        email = email.lower().strip()
        
        # Check if user already exists
        query = supabase_client.table("users").select("*").eq("email", email).execute()
        now_str = datetime.utcnow().isoformat()
        
        if query.data:
            profile = query.data[0]
            if not profile.get("is_active", True):
                # Redirect to login page on frontend with error query parameter
                err_msg = urllib.parse.quote("Your account has been deactivated. Please contact support.")
                return RedirectResponse(url=f"{settings.FRONTEND_URL}/signin?error={err_msg}")
            
            # Update user profile with OAuth provider metadata
            update_payload = {
                "auth_provider": provider,
                "provider_id": provider_id,
                "last_login": now_str,
                "is_verified": True # Social accounts are verified
            }
            if not profile.get("avatar_url") and avatar_url:
                update_payload["avatar_url"] = avatar_url
                
            supabase_client.table("users").update(update_payload).eq("id", profile["id"]).execute()
            
            # Refresh profile data
            profile.update(update_payload)
            profile["email_verified"] = True
            profile["is_verified"] = True
        else:
            # Create a new verified user for this OAuth identity
            user_id = str(uuid.uuid4())
            new_user = {
                "id": user_id,
                "email": email,
                "password": None, # OAuth user has no local password hash
                "name": name or email.split("@")[0],
                "role": "student", # Default signup role
                "semester": 1,
                "college": "",
                "college_address": "",
                "avatar_url": avatar_url,
                "auth_provider": provider,
                "provider_id": provider_id,
                "is_active": True,
                "is_verified": True,
                "needs_password_change": False,
                "created_at": now_str,
                "updated_at": now_str,
                "last_login": now_str
            }
            
            insert_resp = supabase_client.table("users").insert(new_user).execute()
            if not insert_resp.data:
                err_msg = urllib.parse.quote("Failed to register OAuth user profile.")
                return RedirectResponse(url=f"{settings.FRONTEND_URL}/signin?error={err_msg}")
            
            profile = insert_resp.data[0]
            profile["email_verified"] = True
            profile["is_verified"] = True
            profile["_is_new_oauth_user"] = True

        # Generate JWT session token
        token = create_jwt_token(profile["id"])
        
        # Build user payload to return to frontend
        user_data = build_user_response(profile)
        is_new = profile.pop("_is_new_oauth_user", False)
        user_json = json.dumps(user_data)
        
        # Redirect back to frontend OAuth callback route
        redirect_url = (
            f"{settings.FRONTEND_URL}/auth/callback"
            f"?token={urllib.parse.quote(token)}"
            f"&user={urllib.parse.quote(user_json)}"
            f"&new_user={'true' if is_new else 'false'}"
        )
        return RedirectResponse(url=redirect_url)
        
    except Exception as e:
        err_msg = urllib.parse.quote(f"Authentication failed: {str(e)}")
        return RedirectResponse(url=f"{settings.FRONTEND_URL}/signin?error={err_msg}")


# --- 1. GOOGLE OAUTH ---

@router.get("/google/login")
async def google_login() -> Any:
    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google OAuth is not configured on this server."
        )
    
    redirect_uri = f"{settings.BACKEND_URL}/api/auth/google/callback"
    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "select_account"
    }
    google_auth_url = "https://accounts.google.com/o/oauth2/v2/auth?" + urllib.parse.urlencode(params)
    return RedirectResponse(url=google_auth_url)


@router.get("/google/callback")
async def google_callback(code: str = None, error: str = None) -> Any:
    if error:
        err_msg = urllib.parse.quote(f"Google login failed: {error}")
        return RedirectResponse(url=f"{settings.FRONTEND_URL}/signin?error={err_msg}")
    if not code:
        raise HTTPException(status_code=400, detail="Missing authorization code")
        
    try:
        redirect_uri = f"{settings.BACKEND_URL}/api/auth/google/callback"
        token_url = "https://oauth2.googleapis.com/token"
        token_data = {
            "code": code,
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uri": redirect_uri,
            "grant_type": "authorization_code"
        }
        
        async with httpx.AsyncClient() as client:
            # Exchange Auth Code for Access Token
            token_resp = await client.post(token_url, data=token_data)
            if token_resp.status_code != 200:
                raise Exception("Failed to retrieve Google token")
                
            token_json = token_resp.json()
            access_token = token_json.get("access_token")
            
            # Fetch User Profile
            profile_url = "https://www.googleapis.com/oauth2/v3/userinfo"
            profile_headers = {"Authorization": f"Bearer {access_token}"}
            profile_resp = await client.get(profile_url, headers=profile_headers)
            if profile_resp.status_code != 200:
                raise Exception("Failed to retrieve Google user profile")
                
            profile_json = profile_resp.json()
            
        email = profile_json.get("email")
        name = profile_json.get("name", "")
        provider_id = profile_json.get("sub")
        avatar_url = profile_json.get("picture", "")
        
        if not email:
            raise Exception("No email address associated with your Google account")
            
        return await handle_social_login(email, name, "google", provider_id, avatar_url)
        
    except Exception as e:
        err_msg = urllib.parse.quote(str(e))
        return RedirectResponse(url=f"{settings.FRONTEND_URL}/signin?error={err_msg}")


# --- 3. FACEBOOK OAUTH ---

@router.get("/facebook/login")
async def facebook_login() -> Any:
    if not settings.FACEBOOK_CLIENT_ID or not settings.FACEBOOK_CLIENT_SECRET:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Facebook OAuth is not configured on this server."
        )

    redirect_uri = f"{settings.BACKEND_URL}/api/auth/facebook/callback"
    params = {
        "client_id": settings.FACEBOOK_CLIENT_ID,
        "redirect_uri": redirect_uri,
        "scope": "email,public_profile",
        "response_type": "code"
    }
    facebook_auth_url = "https://www.facebook.com/dialog/oauth?" + urllib.parse.urlencode(params)
    return RedirectResponse(url=facebook_auth_url)


@router.get("/facebook/callback")
async def facebook_callback(code: str = None, error: str = None, error_description: str = None) -> Any:
    if error:
        err_msg = urllib.parse.quote(f"Facebook login failed: {error_description or error}")
        return RedirectResponse(url=f"{settings.FRONTEND_URL}/signin?error={err_msg}")
    if not code:
        raise HTTPException(status_code=400, detail="Missing authorization code")

    try:
        redirect_uri = f"{settings.BACKEND_URL}/api/auth/facebook/callback"

        async with httpx.AsyncClient() as client:
            # Exchange code for access token
            token_resp = await client.get(
                "https://graph.facebook.com/oauth/access_token",
                params={
                    "client_id": settings.FACEBOOK_CLIENT_ID,
                    "client_secret": settings.FACEBOOK_CLIENT_SECRET,
                    "redirect_uri": redirect_uri,
                    "code": code
                }
            )
            if token_resp.status_code != 200:
                raise Exception("Failed to retrieve Facebook token")

            access_token = token_resp.json().get("access_token")

            # Fetch user profile
            profile_resp = await client.get(
                "https://graph.facebook.com/me",
                params={
                    "fields": "id,name,email,picture.type(large)",
                    "access_token": access_token
                }
            )
            if profile_resp.status_code != 200:
                raise Exception("Failed to retrieve Facebook user profile")

            profile_json = profile_resp.json()

        email = profile_json.get("email")
        name = profile_json.get("name", "")
        provider_id = profile_json.get("id")
        avatar_url = profile_json.get("picture", {}).get("data", {}).get("url", "")

        if not email:
            raise Exception("No email address associated with your Facebook account. Please ensure your Facebook account has a verified email.")

        return await handle_social_login(email, name, "facebook", provider_id, avatar_url)

    except Exception as e:
        err_msg = urllib.parse.quote(str(e))
        return RedirectResponse(url=f"{settings.FRONTEND_URL}/signin?error={err_msg}")


@router.get("/github/login")
async def github_login() -> Any:
    if not settings.GITHUB_CLIENT_ID or not settings.GITHUB_CLIENT_SECRET:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="GitHub OAuth is not configured on this server."
        )
        
    redirect_uri = f"{settings.BACKEND_URL}/api/auth/github/callback"
    params = {
        "client_id": settings.GITHUB_CLIENT_ID,
        "redirect_uri": redirect_uri,
        "scope": "user:email"
    }
    github_auth_url = "https://github.com/login/oauth/authorize?" + urllib.parse.urlencode(params)
    return RedirectResponse(url=github_auth_url)


@router.get("/github/callback")
async def github_callback(code: str = None, error: str = None) -> Any:
    if error:
        err_msg = urllib.parse.quote(f"GitHub login failed: {error}")
        return RedirectResponse(url=f"{settings.FRONTEND_URL}/signin?error={err_msg}")
    if not code:
        raise HTTPException(status_code=400, detail="Missing authorization code")
        
    try:
        redirect_uri = f"{settings.BACKEND_URL}/api/auth/github/callback"
        token_url = "https://github.com/login/oauth/access_token"
        token_headers = {"Accept": "application/json"}
        token_data = {
            "client_id": settings.GITHUB_CLIENT_ID,
            "client_secret": settings.GITHUB_CLIENT_SECRET,
            "code": code,
            "redirect_uri": redirect_uri
        }
        
        async with httpx.AsyncClient() as client:
            # Exchange Auth Code for Access Token
            token_resp = await client.post(token_url, data=token_data, headers=token_headers)
            if token_resp.status_code != 200:
                raise Exception("Failed to retrieve GitHub token")
                
            token_json = token_resp.json()
            access_token = token_json.get("access_token")
            
            # Fetch User Profile
            profile_url = "https://api.github.com/user"
            profile_headers = {
                "Authorization": f"token {access_token}",
                "User-Agent": "BCSITHub-Backend"
            }
            profile_resp = await client.get(profile_url, headers=profile_headers)
            if profile_resp.status_code != 200:
                raise Exception("Failed to retrieve GitHub user profile")
                
            profile_json = profile_resp.json()
            
            # Fetch Emails (needed if user has email set to private)
            emails_url = "https://api.github.com/user/emails"
            emails_resp = await client.get(emails_url, headers=profile_headers)
            email = None
            if emails_resp.status_code == 200:
                for email_info in emails_resp.json():
                    if email_info.get("primary") and email_info.get("verified"):
                        email = email_info.get("email")
                        break
                        
        if not email:
            email = profile_json.get("email")
            
        name = profile_json.get("name", "") or profile_json.get("login", "")
        provider_id = str(profile_json.get("id"))
        avatar_url = profile_json.get("avatar_url", "")
        
        if not email:
            raise Exception("Could not retrieve a primary verified email address from your GitHub account")
            
        return await handle_social_login(email, name, "github", provider_id, avatar_url)
        
    except Exception as e:
        err_msg = urllib.parse.quote(str(e))
        return RedirectResponse(url=f"{settings.FRONTEND_URL}/signin?error={err_msg}")


