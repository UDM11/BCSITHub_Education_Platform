from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from app.client import supabase_client
from app.schemas.notices import NoticeResponse
from app.dependencies import get_admin_user
from typing import List, Optional
import uuid

router = APIRouter(prefix="/notices", tags=["notices"])

@router.get("", response_model=List[NoticeResponse])
async def list_notices(
    category: Optional[str] = None,
    search: Optional[str] = None
):
    try:
        query = supabase_client.table("pu_notices").select("*")
        
        if category:
            query = query.eq("category", category)
            
        res = query.order("date", desc=True).execute()
        notices_data = res.data or []
        
        if search:
            s = search.lower()
            notices_data = [
                n for n in notices_data
                if s in n["title"].lower() 
                or (n.get("file_name") and s in n["file_name"].lower())
                or (n.get("content") and s in n["content"].lower())
            ]
            
        return notices_data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to fetch notices: {str(e)}"
        )

@router.post("/upload", response_model=NoticeResponse)
async def upload_notice(
    title: str = Form(...),
    category: str = Form(...),
    content: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    current_user: dict = Depends(get_admin_user)
):
    try:
        file_url = None
        filename = None
        file_size = None

        if file and file.filename:
            file_bytes = await file.read()
            file_ext = file.filename.split(".")[-1] if "." in file.filename else "pdf"
            safe_filename = f"{uuid.uuid4()}.{file_ext}"
            path_on_bucket = f"Notices/{safe_filename}"
            
            # Upload file to Supabase Storage bucket 'notices'
            supabase_client.storage.from_("notices").upload(
                path=path_on_bucket,
                file=file_bytes,
                file_options={"content-type": file.content_type or "application/pdf"}
            )
            
            # Get public URL
            file_url = supabase_client.storage.from_("notices").get_public_url(path_on_bucket)
            filename = file.filename
            
            # Calculate file size in human readable format
            size_bytes = len(file_bytes)
            if size_bytes < 1024:
                file_size = f"{size_bytes} B"
            elif size_bytes < 1024 * 1024:
                file_size = f"{size_bytes / 1024:.1f} KB"
            else:
                file_size = f"{size_bytes / (1024 * 1024):.1f} MB"
                
        # Save notice details in database
        notice_payload = {
            "title": title,
            "category": category,
            "file_url": file_url,
            "file_name": filename,
            "file_size": file_size,
            "content": content
        }
        
        db_resp = supabase_client.table("pu_notices").insert(notice_payload).execute()
        if not db_resp.data:
            raise Exception("Failed to insert record into pu_notices table.")
            
        return db_resp.data[0]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Notice upload failed: {str(e)}"
        )


@router.patch("/{notice_id}", response_model=NoticeResponse)
async def update_notice(
    notice_id: str,
    payload: dict,
    current_user: dict = Depends(get_admin_user)
):
    try:
        update_payload = {}
        for key in ["title", "category", "content"]:
            if key in payload:
                update_payload[key] = payload[key]
                
        if not update_payload:
            raise HTTPException(status_code=400, detail="No fields to update")
            
        update_resp = supabase_client.table("pu_notices")\
            .update(update_payload)\
            .eq("id", notice_id)\
            .execute()
            
        if not update_resp.data:
            raise HTTPException(status_code=404, detail="Notice not found")
            
        return update_resp.data[0]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Update failed: {str(e)}"
        )


@router.delete("/{notice_id}")
async def delete_notice(
    notice_id: str,
    current_user: dict = Depends(get_admin_user)
):
    try:
        notice_resp = supabase_client.table("pu_notices").select("*").eq("id", notice_id).execute()
        if not notice_resp.data:
            raise HTTPException(status_code=404, detail="Notice not found")
            
        notice = notice_resp.data[0]
        supabase_client.table("pu_notices").delete().eq("id", notice_id).execute()
        
        if notice.get("file_url"):
            try:
                url_parts = notice["file_url"].split("/notices/")
                if len(url_parts) > 1:
                    bucket_path = url_parts[1]
                    supabase_client.storage.from_("notices").remove([bucket_path])
            except Exception as st_err:
                print(f"Warning: Notice Storage file deletion failed: {st_err}")
                
        return {"message": "Notice deleted successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Deletion failed: {str(e)}"
        )
