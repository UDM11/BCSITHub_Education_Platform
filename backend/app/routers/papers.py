from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from app.client import supabase_client
from app.schemas.papers import PaperResponse
from app.dependencies import get_current_user, get_admin_user, get_teacher_or_admin_user, get_optional_current_user
from typing import List, Optional
import uuid
import httpx

router = APIRouter(prefix="/papers", tags=["papers"])

@router.get("", response_model=List[PaperResponse])
async def list_papers(
    semester: Optional[int] = None,
    exam_type: Optional[str] = None,
    college: Optional[str] = None,
    search: Optional[str] = None,
    approved_only: bool = True,
    current_user: Optional[dict] = Depends(get_optional_current_user)
):
    try:
        # Start constructing query
        query = supabase_client.table("past_papers").select("*, users!uploaded_by(name, role)")
        
        # Filtering parameters
        if semester:
            query = query.eq("semester", semester)
        if exam_type:
            query = query.eq("exam_type", exam_type)
        if college:
            query = query.eq("college", college)
            
        # By default, students can only see approved papers OR their own uploads.
        # Admins or teachers can see all.
        is_staff = current_user and current_user.get("role") in ("admin", "teacher")
        
        if approved_only and not is_staff:
            if current_user:
                # approved = true OR uploaded_by = current_user
                # In supabase, or filter can be applied:
                query = query.or_(f"approved.eq.true,uploaded_by.eq.{current_user['id']}")
            else:
                query = query.eq("approved", True)
                
        res = query.order("created_at", desc=True).execute()
        
        papers_data = res.data or []
        for p in papers_data:
            user_info = p.get("users") or {}
            p["uploader_name"] = user_info.get("name")
            p["uploader_role"] = user_info.get("role")
        
        # If search query is present, do a client-side filter for simplicity
        if search:
            s = search.lower()
            papers_data = [
                p for p in papers_data 
                if s in p["title"].lower() or s in p["subject"].lower() or s in p["college"].lower()
            ]
            
        return papers_data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to fetch past papers: {str(e)}"
        )

@router.post("/upload", response_model=PaperResponse)
async def upload_paper(
    title: str = Form(...),
    subject: str = Form(...),
    semester: int = Form(...),
    exam_type: str = Form(...),
    college: str = Form(...),
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    try:
        file_bytes = await file.read()
        file_ext = file.filename.split(".")[-1] if "." in file.filename else "pdf"
        safe_filename = f"{uuid.uuid4()}.{file_ext}"
        path_on_bucket = f"Semester_{semester}/{safe_filename}"
        
        # Upload file to Supabase Storage bucket 'past-papers'
        # Note: Bucket must exist and be configured as public
        storage_resp = supabase_client.storage.from_("past-papers").upload(
            path=path_on_bucket,
            file=file_bytes,
            file_options={"content-type": file.content_type or "application/pdf"}
        )
        
        # Get public URL
        file_url = supabase_client.storage.from_("past-papers").get_public_url(path_on_bucket)
        
        # Auto-approve if uploaded by admin or teacher
        is_approved = current_user.get("role") in ("admin", "teacher")
        
        # Insert paper details in database
        paper_payload = {
            "title": title,
            "subject": subject,
            "semester": semester,
            "exam_type": exam_type,
            "college": college,
            "file_url": file_url,
            "uploaded_by": current_user["id"],
            "approved": is_approved,
            "downloads": 0
        }
        
        db_resp = supabase_client.table("past_papers").insert(paper_payload).execute()
        if not db_resp.data:
            raise Exception("Failed to insert record into past_papers table.")
            
        paper = db_resp.data[0]
        user_info = supabase_client.table("users").select("name, role").eq("id", current_user["id"]).execute()
        if user_info.data:
            paper["uploader_name"] = user_info.data[0]["name"]
            paper["uploader_role"] = user_info.data[0]["role"]
        return paper
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Upload failed: {str(e)}"
        )

@router.post("/{paper_id}/approve", response_model=PaperResponse)
async def approve_paper(
    paper_id: str,
    current_user: dict = Depends(get_teacher_or_admin_user)
):
    try:
        update_resp = supabase_client.table("past_papers")\
            .update({"approved": True})\
            .eq("id", paper_id)\
            .execute()
            
        if not update_resp.data:
            raise HTTPException(
                status_code=status.HTTP_444_NOT_FOUND,
                detail="Paper not found or approval failed"
            )
            
        paper = update_resp.data[0]
        if paper.get("uploaded_by"):
            user_info = supabase_client.table("users").select("name, role").eq("id", paper["uploaded_by"]).execute()
            if user_info.data:
                paper["uploader_name"] = user_info.data[0]["name"]
                paper["uploader_role"] = user_info.data[0]["role"]
        return paper
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Approval failed: {str(e)}"
        )

@router.post("/{paper_id}/download")
async def increment_download(paper_id: str):
    try:
        # Fetch current downloads count
        fetch_resp = supabase_client.table("past_papers").select("downloads").eq("id", paper_id).execute()
        if not fetch_resp.data:
            raise HTTPException(status_code=404, detail="Paper not found")
            
        new_downloads = fetch_resp.data[0]["downloads"] + 1
        
        # Update download count
        update_resp = supabase_client.table("past_papers")\
            .update({"downloads": new_downloads})\
            .eq("id", paper_id)\
            .execute()
            
        return {"success": True, "downloads": new_downloads}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Increment download failed: {str(e)}"
        )

@router.delete("/{paper_id}")
async def delete_paper(
    paper_id: str,
    current_user: dict = Depends(get_current_user)
):
    try:
        # Check ownership or admin status
        paper_resp = supabase_client.table("past_papers").select("*").eq("id", paper_id).execute()
        if not paper_resp.data:
            raise HTTPException(status_code=404, detail="Paper not found")
            
        paper = paper_resp.data[0]
        is_owner = paper["uploaded_by"] == current_user["id"]
        is_admin = current_user.get("role") == "admin"
        
        if not (is_owner or is_admin):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to delete this paper"
            )
            
        # Delete paper record
        delete_resp = supabase_client.table("past_papers").delete().eq("id", paper_id).execute()
        
        # Optional: Attempt to delete file from Supabase storage as well
        try:
            # Extract bucket path from file_url
            # E.g. file_url: https://.../storage/v1/object/public/past-papers/Semester_1/safe-name.pdf
            url_parts = paper["file_url"].split("/past-papers/")
            if len(url_parts) > 1:
                bucket_path = url_parts[1]
                supabase_client.storage.from_("past-papers").remove([bucket_path])
        except Exception as st_err:
            print(f"Warning: Storage file deletion failed: {st_err}")
            
        return {"message": "Paper deleted successfully"}
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Deletion failed: {str(e)}"
        )


@router.patch("/{paper_id}", response_model=PaperResponse)
async def update_paper(
    paper_id: str,
    payload: dict,
    current_user: dict = Depends(get_admin_user)
):
    try:
        update_payload = {}
        for key in ["title", "subject", "semester", "exam_type", "college", "approved"]:
            if key in payload:
                update_payload[key] = payload[key]
                
        if not update_payload:
            raise HTTPException(status_code=400, detail="No fields to update")
            
        update_resp = supabase_client.table("past_papers")\
            .update(update_payload)\
            .eq("id", paper_id)\
            .execute()
            
        if not update_resp.data:
            raise HTTPException(status_code=404, detail="Paper not found")
            
        paper = update_resp.data[0]
        if paper.get("uploaded_by"):
            user_info = supabase_client.table("users").select("name, role").eq("id", paper["uploaded_by"]).execute()
            if user_info.data:
                paper["uploader_name"] = user_info.data[0]["name"]
                paper["uploader_role"] = user_info.data[0]["role"]
        return paper
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Update failed: {str(e)}"
        )


@router.get("/{paper_id}/pdf")
async def get_paper_pdf(paper_id: str):
    try:
        # Fetch paper details
        res = supabase_client.table("past_papers").select("file_url").eq("id", paper_id).execute()
        if not res.data or not res.data[0].get("file_url"):
            raise HTTPException(status_code=404, detail="Paper PDF not found")
        file_url = res.data[0]["file_url"]
        
        async def stream_file():
            async with httpx.AsyncClient() as client:
                async with client.stream("GET", file_url) as r:
                    async for chunk in r.aiter_bytes():
                        yield chunk
                        
        return StreamingResponse(stream_file(), media_type="application/pdf")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to stream paper PDF: {str(e)}"
        )
