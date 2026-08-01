from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserSignUp(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str = "student"
    semester: int = 1
    college: Optional[str] = ""
    college_address: Optional[str] = ""
    avatar_url: Optional[str] = ""
    auth_provider: Optional[str] = "email"
    provider_id: Optional[str] = ""

class UserSignIn(BaseModel):
    email: EmailStr
    password: str

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    semester: Optional[int] = None
    role: Optional[str] = None
    college: Optional[str] = None
    college_address: Optional[str] = None
    avatar_url: Optional[str] = None
    auth_provider: Optional[str] = None
    provider_id: Optional[str] = None
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    semester: int
    college: Optional[str] = ""
    college_address: Optional[str] = ""
    avatar_url: Optional[str] = ""
    auth_provider: Optional[str] = "email"
    provider_id: Optional[str] = ""
    is_active: bool = True
    is_verified: bool = False
    email_verified: bool = False
    needs_password_change: bool = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
