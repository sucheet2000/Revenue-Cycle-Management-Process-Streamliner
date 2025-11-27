from enum import Enum
from uuid import UUID, uuid4
from datetime import date, datetime
from pydantic import BaseModel, Field, field_validator
from typing import Optional

class ProcedureCode(str, Enum):
    """Enumerated procedure codes for authorization requests"""
    A876 = "A876"
    B901 = "B901"
    C102 = "C102"
    D203 = "D203"

class UserRole(str, Enum):
    """User roles for RBAC implementation"""
    ADMIN = "admin"
    USER = "user"
    READONLY = "readonly"

class ClaimSubmission(BaseModel):
    """
    Pydantic model for Prior Authorization Claim Submission.
    Enforces strict validation for healthcare data integrity.
    """
    patient_id: UUID = Field(..., description="Unique patient identifier in UUID4 format")
    date_of_birth: date = Field(..., description="Patient date of birth")
    physician_name: str = Field(..., min_length=2, max_length=100, description="Requesting physician full name")
    npi_number: str = Field(
        ..., 
        pattern=r"^\d{10}$", 
        description="10-digit National Provider Identifier",
        examples=["1234567890"]
    )
    procedure_code: ProcedureCode = Field(..., description="Medical procedure code")
    service_start_date: date = Field(..., description="Service start date")
    service_end_date: date = Field(..., description="Service end date")
    clinical_notes_filename: Optional[str] = Field(None, description="Filename of uploaded clinical notes")
    supporting_notes_attached: bool = Field(..., description="Confirmation of clinical documentation")
    
    @field_validator('physician_name')
    @classmethod
    def sanitize_physician_name(cls, v: str) -> str:
        """Sanitize physician name to prevent injection attacks"""
        # Remove potentially dangerous characters
        return ''.join(char for char in v if char.isalnum() or char in (' ', '.', '-', "'"))
    
    class Config:
        json_schema_extra = {
            "example": {
                "patient_id": "123e4567-e89b-12d3-a456-426614174000",
                "date_of_birth": "1980-01-15",
                "physician_name": "Dr. Jane Smith",
                "npi_number": "1234567890",
                "procedure_code": "A876",
                "service_start_date": "2024-01-01",
                "service_end_date": "2024-01-15",
                "supporting_notes_attached": True
            }
        }

class ClaimResponse(BaseModel):
    """Response model for successful claim submission"""
    status: str = Field(..., description="Claim processing status")
    claim_reference: UUID = Field(default_factory=uuid4, description="Unique claim reference ID")
    timestamp: datetime = Field(default_factory=datetime.now, description="Submission timestamp")
    message: Optional[str] = Field(None, description="Additional information")
    
    class Config:
        json_schema_extra = {
            "example": {
                "status": "submitted",
                "claim_reference": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
                "timestamp": "2024-01-01T12:00:00",
                "message": "Claim submitted successfully for review"
            }
        }

class User(BaseModel):
    """User model for RBAC authentication"""
    username: str
    role: UserRole
    is_active: bool = True
