from fastapi import FastAPI, HTTPException, status, Depends, Header, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .schemas import ClaimSubmission, ClaimResponse, User, UserRole
from datetime import datetime
from typing import Optional
import uuid
import asyncio
import os
from pathlib import Path

# Initialize FastAPI application
app = FastAPI(
    title="RCM Prior Authorization API",
    description="Secure API for Revenue Cycle Management Prior Authorization Claims",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware Configuration for secure cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Restrict to development frontend
    allow_credentials=True,
    allow_methods=["POST", "GET", "OPTIONS"],  # Limit to necessary methods
    allow_headers=["Content-Type", "Authorization"],  # Restrict headers
    max_age=3600,  # Cache preflight requests for 1 hour
)

# In-memory storage for demonstration (use database in production)
# Using dictionary for O(1) lookup performance
claim_registry: dict[str, ClaimSubmission] = {}

# ============================================================================
# SECURITY: RBAC Implementation
# ============================================================================

async def authenticate_user(authorization: Optional[str] = Header(None)) -> User:
    """
    Dependency function for Role-Based Access Control (RBAC).
    Simulates authentication and authorization logic.
    
    In production:
    - Verify JWT token from Authorization header
    - Validate token signature and expiration
    - Extract user claims and roles
    - Query user database for permissions
    """
    # Mock authentication - replace with actual JWT validation
    if not authorization:
        # For demo purposes, allow unauthenticated access with default user role
        return User(username="demo_user", role=UserRole.USER)
    
    # Simulate token validation
    if authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "")
        # In production: validate JWT, extract claims
        # For now, simulate admin access with specific token
        if token == "admin_token":
            return User(username="admin", role=UserRole.ADMIN)
        elif token == "user_token":
            return User(username="standard_user", role=UserRole.USER)
    
    # Default to user role for demo
    return User(username="demo_user", role=UserRole.USER)

def require_role(required_role: UserRole):
    """
    Dependency factory for role-based endpoint protection.
    Usage: Depends(require_role(UserRole.ADMIN))
    """
    async def role_checker(user: User = Depends(authenticate_user)) -> User:
        if user.role != required_role and user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. Required role: {required_role.value}"
            )
        return user
    return role_checker

# ============================================================================
# API Endpoints
# ============================================================================

@app.get("/", tags=["Health Check"])
async def root():
    """Health check endpoint"""
    return {
        "status": "operational",
        "service": "RCM Prior Authorization API",
        "version": "1.0.0"
    }

@app.post(
    "/api/v1/claims/prior_auth",
    response_model=ClaimResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Claims"],
    summary="Submit Prior Authorization Request",
    description="Submit a new prior authorization claim with strict validation and security checks"
)
async def submit_prior_auth(
    claim: ClaimSubmission,
    current_user: User = Depends(authenticate_user)
) -> ClaimResponse:
    """
    Submit a prior authorization claim with the following security and validation:
    
    - Input validation via Pydantic schemas
    - Business rule validation (date logic)
    - RBAC authentication
    - Async processing for high performance
    - Structured error responses
    """
    
    # Simulate async I/O operation (database write, external API call)
    await asyncio.sleep(0.5)
    
    # ========================================================================
    # Business Rule Validation
    # ========================================================================
    
    if claim.service_start_date > claim.service_end_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error": "Invalid date range",
                "message": "Service start date cannot be after service end date",
                "field": "service_start_date"
            }
        )
    
    # Additional business rule: Check for duplicate submissions (using O(1) lookup)
    claim_key = f"{claim.patient_id}_{claim.service_start_date}"
    if claim_key in claim_registry:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "error": "Duplicate claim",
                "message": "A claim for this patient and service date already exists",
                "existing_claim_id": str(claim_registry[claim_key].patient_id)
            }
        )
    
    # Store claim in registry (O(1) insertion)
    claim_registry[claim_key] = claim
    
    # Generate unique claim reference
    claim_ref = uuid.uuid4()
    
    # Return structured response
    return ClaimResponse(
        status="submitted",
        claim_reference=claim_ref,
        timestamp=datetime.now(),
        message=f"Claim submitted successfully by {current_user.username}"
    )

# File upload configuration
UPLOAD_DIR = Path("uploads/clinical_notes")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

@app.post(
    "/api/v1/upload/clinical_notes",
    tags=["File Upload"],
    summary="Upload Clinical Notes",
    description="Upload clinical documentation (PDF, DOC, DOCX only, max 10MB)"
)
async def upload_clinical_notes(
    file: UploadFile = File(...),
    current_user: User = Depends(authenticate_user)
):
    """
    Securely upload clinical notes with validation:
    - File type validation (PDF, DOC, DOCX only)
    - File size limit (10MB)
    - Unique filename generation
    - Secure storage
    """
    
    # Validate file extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error": "Invalid file type",
                "message": f"Only {', '.join(ALLOWED_EXTENSIONS)} files are allowed",
                "allowed_types": list(ALLOWED_EXTENSIONS)
            }
        )
    
    # Read file content and validate size
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail={
                "error": "File too large",
                "message": f"File size exceeds {MAX_FILE_SIZE / (1024*1024)}MB limit",
                "max_size_mb": MAX_FILE_SIZE / (1024*1024)
            }
        )
    
    # Generate unique filename to prevent collisions
    unique_filename = f"{uuid.uuid4().hex}_{file.filename}"
    file_path = UPLOAD_DIR / unique_filename
    
    # Save file securely
    try:
        with open(file_path, "wb") as f:
            f.write(content)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "File upload failed",
                "message": "An error occurred while saving the file"
            }
        )
    
    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content={
            "status": "success",
            "filename": unique_filename,
            "original_filename": file.filename,
            "file_size_bytes": len(content),
            "uploaded_by": current_user.username,
            "message": "Clinical notes uploaded successfully"
        }
    )

@app.get(
    "/api/v1/claims/stats",
    tags=["Claims"],
    summary="Get Claim Statistics (Admin Only)",
    dependencies=[Depends(require_role(UserRole.ADMIN))]
)
async def get_claim_stats(current_user: User = Depends(authenticate_user)):
    """
    Admin-only endpoint to retrieve claim statistics.
    Demonstrates RBAC implementation.
    """
    return {
        "total_claims": len(claim_registry),
        "accessed_by": current_user.username,
        "role": current_user.role.value
    }

# ============================================================================
# Error Handlers
# ============================================================================

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Custom error handler for consistent error responses"""
    return {
        "status_code": exc.status_code,
        "detail": exc.detail,
        "timestamp": datetime.now().isoformat()
    }
