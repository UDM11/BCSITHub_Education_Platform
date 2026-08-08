from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PaperCreate(BaseModel):
    title: str
    subject: str
    semester: int
    exam_type: str
    college: str
    file_url: str
    session: Optional[str] = None

class PaperResponse(BaseModel):
    id: str
    title: str
    subject: str
    semester: int
    exam_type: str
    college: str
    file_url: str
    session: Optional[str] = None
    uploaded_by: Optional[str] = None
    uploader_name: Optional[str] = None
    uploader_role: Optional[str] = None
    approved: bool
    downloads: int
    created_at: datetime

    class Config:
        from_attributes = True
