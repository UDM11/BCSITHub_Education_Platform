from pydantic import BaseModel
from datetime import datetime

class NoticeCreate(BaseModel):
    title: str
    file_url: str
    file_name: str
    file_size: str
    category: str

class NoticeResponse(BaseModel):
    id: str
    title: str
    date: datetime
    file_url: str
    file_name: str
    file_size: str
    category: str
    created_at: datetime

    class Config:
        from_attributes = True
