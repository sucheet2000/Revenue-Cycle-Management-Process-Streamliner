from enum import Enum
from uuid import UUID
from datetime import date, datetime
from pydantic import BaseModel, Field

class ProcedureCode(str, Enum):
    A876 = "A876"
    B901 = "B901"
    C102 = "C102"
    D203 = "D203"

class ClaimSubmission(BaseModel):
    patient_id: UUID
    date_of_birth: date
    physician_name: str = Field(..., min_length=2, max_length=100)
    npi_number: str = Field(..., pattern=r"^\d{10}$", description="10-digit National Provider Identifier")
    procedure_code: ProcedureCode
    service_start_date: date
    service_end_date: date
    supporting_notes_attached: bool

class ClaimResponse(BaseModel):
    status: str
    claim_reference: str
    timestamp: datetime
