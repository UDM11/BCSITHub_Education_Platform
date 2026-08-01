from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class NoticeCreate(BaseModel):
    title: str
    category: str
    file_url: Optional[str] = None
    file_name: Optional[str] = None
    file_size: Optional[str] = None
    content: Optional[str] = None

class NoticeResponse(BaseModel):
    id: str
    title: str
    date: datetime
    category: str
    file_url: Optional[str] = None
    file_name: Optional[str] = None
    file_size: Optional[str] = None
    content: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
