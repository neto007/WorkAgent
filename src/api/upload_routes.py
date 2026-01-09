import shutil
import uuid
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile, status

router = APIRouter(
    prefix="/uploads",
    tags=["uploads"],
    responses={404: {"description": "Not found"}},
)

UPLOAD_DIR = Path("static/uploads/avatars")
MAX_FILE_SIZE = 20 * 1024 * 1024  # 20MB
ALLOWED_CONTENT_TYPES = ["image/jpeg", "image/png", "image/gif", "image/svg+xml"]

# Ensure directory exists
if not UPLOAD_DIR.exists():
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@router.post("/avatar", status_code=status.HTTP_201_CREATED)
async def upload_avatar(file: UploadFile = File(...)):
    """
    Upload an avatar image.
    Returns the URL of the uploaded image.
    """
    # Validate content type
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed types: {', '.join(ALLOWED_CONTENT_TYPES)}",
        )

    # Generate unique filename
    file_extension = Path(file.filename).suffix
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = UPLOAD_DIR / unique_filename

    try:
        # Save file
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Check file size (approximate)
        if file_path.stat().st_size > MAX_FILE_SIZE:
            file_path.unlink()  # Delete file
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File too large. Maximum size is {MAX_FILE_SIZE/1024/1024}MB",
            )

        # Return URL
        # Assuming static files are mounted at /static
        # TODO: Use environment variable for base URL if needed, currently relative
        return {"url": f"/static/uploads/avatars/{unique_filename}"}

    except Exception as e:
        if file_path.exists():
            file_path.unlink()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not save file: {str(e)}",
        )
