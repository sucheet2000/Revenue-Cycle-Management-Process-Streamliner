"""
ORM Models for RCM Prior Authorization System

This module defines the database schema using SQLAlchemy ORM with proper
relationships, indexes, and security considerations for Health-Tech applications.

Key Features:
- Normalized schema with proper foreign key relationships
- Explicit index naming conventions
- Timestamp auditing (created_at, updated_at)
- Data masking placeholders for sensitive fields
- PostgreSQL-optimized data types
"""

from sqlalchemy import (
    Column, String, Integer, DateTime, Date, Boolean, Text,
    ForeignKey, Index, CheckConstraint, UniqueConstraint,
    Enum as SQLEnum
)
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
from enum import Enum
import uuid

# ============================================================================
# Naming Conventions for Indexes and Constraints
# ============================================================================

# Explicit naming convention for PostgreSQL
# This ensures consistent, predictable names for database objects
POSTGRES_INDEXES_NAMING_CONVENTION = {
    "ix": "ix_%(table_name)s_%(column_0_name)s",  # Index
    "uq": "uq_%(table_name)s_%(column_0_name)s",  # Unique constraint
    "ck": "ck_%(table_name)s_%(constraint_name)s",  # Check constraint
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",  # Foreign key
    "pk": "pk_%(table_name)s"  # Primary key
}

# Create declarative base with naming convention
Base = declarative_base()
Base.metadata.naming_convention = POSTGRES_INDEXES_NAMING_CONVENTION

# ============================================================================
# Enums
# ============================================================================

class ClaimStatus(str, Enum):
    """Claim processing status"""
    SUBMITTED = "submitted"
    PENDING_REVIEW = "pending_review"
    APPROVED = "approved"
    DENIED = "denied"
    REQUIRES_INFO = "requires_info"

class ProcedureCodeEnum(str, Enum):
    """Medical procedure codes"""
    A876 = "A876"
    B901 = "B901"
    C102 = "C102"
    D203 = "D203"

# ============================================================================
# Base Mixin for Timestamps
# ============================================================================

class TimestampMixin:
    """
    Mixin to add created_at and updated_at timestamps to models.
    Provides automatic auditing of record creation and modification.
    """
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        comment="Timestamp when record was created"
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
        comment="Timestamp when record was last updated"
    )

# ============================================================================
# ORM Models
# ============================================================================

class Patient(Base, TimestampMixin):
    """
    Patient table - stores sensitive patient information.
    
    Security Considerations:
    - patient_id uses UUID for non-sequential identifiers
    - date_of_birth is sensitive PHI (Protected Health Information)
    - Future: Apply data masking for non-production environments
    """
    __tablename__ = "patient"
    
    # Primary Key
    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        comment="Internal patient record ID"
    )
    
    # Patient Identifier (UUID for security)
    patient_id = Column(
        PGUUID(as_uuid=True),
        unique=True,
        nullable=False,
        default=uuid.uuid4,
        comment="Unique patient identifier (UUID)"
    )
    
    # Sensitive Patient Data
    date_of_birth = Column(
        Date,
        nullable=False,
        comment="Patient date of birth (PHI)"
    )
    
    # Relationships
    claims = relationship(
        "Claim",
        back_populates="patient",
        cascade="all, delete-orphan",
        lazy="selectin"  # Eager loading for better async performance
    )
    
    # Indexes for performance
    __table_args__ = (
        Index("ix_patient_patient_id", "patient_id"),
        Index("ix_patient_date_of_birth", "date_of_birth"),
        {"comment": "Patient demographic information"}
    )
    
    def __repr__(self):
        return f"<Patient(id={self.id}, patient_id={self.patient_id})>"
    
    # DATA MASKING PLACEHOLDER
    @property
    def masked_patient_id(self) -> str:
        """
        Placeholder for data masking function.
        In production, implement masking logic here for non-production environments.
        Example: Return 'XXXX-XXXX-XXXX-1234' instead of full UUID
        """
        # TODO: Implement data masking based on environment
        return str(self.patient_id)


class Provider(Base, TimestampMixin):
    """
    Provider table - stores physician/provider information.
    
    Security Considerations:
    - npi_number is sensitive provider identifier
    - Future: Apply data masking for testing/staging environments
    """
    __tablename__ = "provider"
    
    # Primary Key
    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        comment="Internal provider record ID"
    )
    
    # Provider Identifiers
    npi_number = Column(
        String(10),
        unique=True,
        nullable=False,
        comment="10-digit National Provider Identifier"
    )
    
    physician_name = Column(
        String(100),
        nullable=False,
        comment="Provider full name"
    )
    
    # Relationships
    claims = relationship(
        "Claim",
        back_populates="provider",
        cascade="all, delete-orphan",
        lazy="selectin"
    )
    
    # Indexes and Constraints
    __table_args__ = (
        Index("ix_provider_npi_number", "npi_number"),
        Index("ix_provider_physician_name", "physician_name"),
        CheckConstraint(
            "length(npi_number) = 10",
            name="ck_npi_length"
        ),
        {"comment": "Healthcare provider information"}
    )
    
    def __repr__(self):
        return f"<Provider(id={self.id}, npi={self.npi_number}, name={self.physician_name})>"
    
    # DATA MASKING PLACEHOLDER
    @property
    def masked_npi_number(self) -> str:
        """
        Placeholder for NPI data masking.
        Example: Return 'XXXXXX1234' instead of full NPI
        """
        # TODO: Implement data masking
        return self.npi_number


class Claim(Base, TimestampMixin):
    """
    Claim table - stores prior authorization claim submissions.
    
    This is the central table linking patients and providers with claim details.
    Demonstrates proper foreign key relationships and transactional integrity.
    """
    __tablename__ = "claim"
    
    # Primary Key
    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        comment="Internal claim record ID"
    )
    
    # Claim Identifier
    claim_reference = Column(
        PGUUID(as_uuid=True),
        unique=True,
        nullable=False,
        default=uuid.uuid4,
        comment="Unique claim reference number"
    )
    
    # Foreign Keys
    patient_id = Column(
        Integer,
        ForeignKey("patient.id", ondelete="CASCADE"),
        nullable=False,
        comment="Reference to patient table"
    )
    
    provider_id = Column(
        Integer,
        ForeignKey("provider.id", ondelete="CASCADE"),
        nullable=False,
        comment="Reference to provider table"
    )
    
    # Claim Details
    procedure_code = Column(
        SQLEnum(ProcedureCodeEnum, name="procedure_code_enum"),
        nullable=False,
        comment="Medical procedure code"
    )
    
    service_start_date = Column(
        Date,
        nullable=False,
        comment="Service start date"
    )
    
    service_end_date = Column(
        Date,
        nullable=False,
        comment="Service end date"
    )
    
    clinical_notes_filename = Column(
        String(255),
        nullable=True,
        comment="Filename of uploaded clinical documentation"
    )
    
    supporting_notes_attached = Column(
        Boolean,
        default=False,
        nullable=False,
        comment="Indicates if clinical notes are attached"
    )
    
    # Claim Status
    status = Column(
        SQLEnum(ClaimStatus, name="claim_status_enum"),
        default=ClaimStatus.SUBMITTED,
        nullable=False,
        comment="Current claim processing status"
    )
    
    # Relationships
    patient = relationship(
        "Patient",
        back_populates="claims",
        lazy="selectin"
    )
    
    provider = relationship(
        "Provider",
        back_populates="claims",
        lazy="selectin"
    )
    
    # Indexes and Constraints
    __table_args__ = (
        Index("ix_claim_claim_reference", "claim_reference"),
        Index("ix_claim_patient_id", "patient_id"),
        Index("ix_claim_provider_id", "provider_id"),
        Index("ix_claim_status", "status"),
        Index("ix_claim_service_dates", "service_start_date", "service_end_date"),
        CheckConstraint(
            "service_start_date <= service_end_date",
            name="ck_service_date_range"
        ),
        UniqueConstraint(
            "patient_id", "service_start_date",
            name="uq_patient_service_date"
        ),
        {"comment": "Prior authorization claim submissions"}
    )
    
    def __repr__(self):
        return f"<Claim(id={self.id}, reference={self.claim_reference}, status={self.status})>"

# ============================================================================
# Database Initialization Helper
# ============================================================================

async def create_tables(engine):
    """
    Create all tables in the database.
    
    Note: In production, use Alembic migrations instead.
    This is provided for development/testing purposes.
    """
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def drop_tables(engine):
    """
    Drop all tables from the database.
    
    WARNING: This will delete all data. Use with caution.
    """
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
