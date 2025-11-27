"""
Database Initialization Script for RCM System

This script initializes the database schema and can be used for:
- Creating tables in development
- Seeding test data
- Verifying database connectivity

Usage:
    python -m backend.init_db
"""

import asyncio
from backend.database import async_engine, init_db, check_db_health
from backend.db_models import Base, Patient, Provider, Claim, ClaimStatus, ProcedureCodeEnum
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import date
import uuid

async def create_sample_data(session: AsyncSession):
    """
    Create sample data for testing purposes.
    
    This function demonstrates how to create related records
    with proper foreign key relationships.
    """
    print("Creating sample data...")
    
    # Create sample patient
    patient = Patient(
        patient_id=uuid.uuid4(),
        date_of_birth=date(1980, 1, 15)
    )
    session.add(patient)
    await session.flush()  # Get the patient.id
    
    # Create sample provider
    provider = Provider(
        npi_number="1234567890",
        physician_name="Dr. Jane Smith"
    )
    session.add(provider)
    await session.flush()  # Get the provider.id
    
    # Create sample claim
    claim = Claim(
        claim_reference=uuid.uuid4(),
        patient_id=patient.id,
        provider_id=provider.id,
        procedure_code=ProcedureCodeEnum.A876,
        service_start_date=date(2024, 1, 1),
        service_end_date=date(2024, 1, 15),
        supporting_notes_attached=True,
        status=ClaimStatus.SUBMITTED
    )
    session.add(claim)
    
    await session.commit()
    print(f"✓ Created sample patient: {patient.patient_id}")
    print(f"✓ Created sample provider: {provider.npi_number}")
    print(f"✓ Created sample claim: {claim.claim_reference}")

async def verify_data(session: AsyncSession):
    """Verify that data was created successfully"""
    print("\nVerifying data...")
    
    # Count records
    patient_count = await session.scalar(select(func.count(Patient.id)))
    provider_count = await session.scalar(select(func.count(Provider.id)))
    claim_count = await session.scalar(select(func.count(Claim.id)))
    
    print(f"✓ Patients: {patient_count}")
    print(f"✓ Providers: {provider_count}")
    print(f"✓ Claims: {claim_count}")

async def main():
    """Main initialization function"""
    print("=" * 60)
    print("RCM Database Initialization")
    print("=" * 60)
    
    # Check database connectivity
    print("\n1. Checking database connectivity...")
    is_healthy = await check_db_health()
    if not is_healthy:
        print("✗ Database connection failed!")
        print("Please ensure PostgreSQL is running and DATABASE_URL is correct.")
        return
    print("✓ Database connection successful")
    
    # Create tables
    print("\n2. Creating database tables...")
    await init_db()
    print("✓ Tables created successfully")
    
    # Create sample data (optional)
    print("\n3. Creating sample data...")
    from backend.database import AsyncSessionLocal
    async with AsyncSessionLocal() as session:
        await create_sample_data(session)
    
    # Verify
    async with AsyncSessionLocal() as session:
        await verify_data(session)
    
    print("\n" + "=" * 60)
    print("Database initialization complete!")
    print("=" * 60)

if __name__ == "__main__":
    # Import func for count query
    from sqlalchemy import func
    
    # Run the initialization
    asyncio.run(main())
