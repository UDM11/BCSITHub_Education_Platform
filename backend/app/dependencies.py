import jwt
from fastapi import Header, HTTPException, Depends, status
from app.client import supabase_client
from app.config import settings

async def get_current_user(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization Header"
        )
        
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header must start with Bearer"
        )
        
    token = authorization.split(" ")[1]
    
    try:
        # Validate the token locally using JWT secret
        try:
            payload = jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
            user_id = payload.get("sub")
        except jwt.PyJWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired access token"
            )
            
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid access token payload"
            )
        
        # Get the corresponding user profile from the public.users database table
        profile_query = supabase_client.table("users").select("*").eq("id", user_id).execute()
        
        if not profile_query.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found in database"
            )
            
        profile = profile_query.data[0]
        # Attach email verification status as true by default for local login
        profile["email_verified"] = True
        return profile
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication error: {str(e)}"
        )

async def get_admin_user(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Requires administrative role permissions"
        )
    return current_user

async def get_teacher_or_admin_user(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") not in ("teacher", "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Requires teacher or administrative role permissions"
        )
    return current_user
