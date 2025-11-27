"""
Database Configuration Module for RCM Prior Authorization System

This module provides asynchronous database connection management using SQLAlchemy
with PostgreSQL. It implements connection pooling, async session management, and
follows security best practices for Health-Tech applications.

Key Features:
- Asynchronous SQLAlchemy engine (asyncpg driver)
- Connection pooling for high throughput
- Proper session lifecycle management
- Environment-based configuration
"""

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import NullPool, QueuePool
from typing import AsyncGenerator
import os

# ============================================================================
# Database Configuration
# ============================================================================

# Database URL - In production, load from environment variables
# Format: postgresql+asyncpg://user:password@host:port/database
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://rcm_user:secure_password@localhost:5432/rcm_database"
)

# Connection Pool Configuration
# These settings optimize for high-concurrency RCM workloads
POOL_SIZE = int(os.getenv("DB_POOL_SIZE", "20"))  # Base pool size
MAX_OVERFLOW = int(os.getenv("DB_MAX_OVERFLOW", "10"))  # Additional connections when pool is full
POOL_TIMEOUT = int(os.getenv("DB_POOL_TIMEOUT", "30"))  # Seconds to wait for connection
POOL_RECYCLE = int(os.getenv("DB_POOL_RECYCLE", "3600"))  # Recycle connections after 1 hour

# ============================================================================
# Asynchronous Engine Setup
# ============================================================================

# Create async engine with connection pooling
# asyncpg is the recommended async PostgreSQL driver for SQLAlchemy
async_engine = create_async_engine(
    DATABASE_URL,
    echo=os.getenv("DB_ECHO", "false").lower() == "true",  # SQL logging for debugging
    future=True,  # Use SQLAlchemy 2.0 style
    pool_pre_ping=True,  # Verify connections before using (prevents stale connections)
    pool_size=POOL_SIZE,
    max_overflow=MAX_OVERFLOW,
    pool_timeout=POOL_TIMEOUT,
    pool_recycle=POOL_RECYCLE,
    poolclass=QueuePool,  # Use QueuePool for production (default)
    # For testing environments, you might use NullPool to avoid connection pooling
    # poolclass=NullPool if os.getenv("ENVIRONMENT") == "test" else QueuePool,
)

# ============================================================================
# Session Factory
# ============================================================================

# Create async session factory
# This is used to create new database sessions for each request
AsyncSessionLocal = async_sessionmaker(
    async_engine,
    class_=AsyncSession,
    expire_on_commit=False,  # Prevent lazy-loading issues after commit
    autocommit=False,  # Explicit transaction control
    autoflush=False,  # Manual flush control for better performance
)

# ============================================================================
# Dependency Injection for FastAPI
# ============================================================================

async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency that provides a database session.
    
    This function yields an async session and ensures proper cleanup
    even if an exception occurs during request processing.
    
    Usage in FastAPI:
        @app.get("/endpoint")
        async def endpoint(session: AsyncSession = Depends(get_async_session)):
            # Use session here
            pass
    
    Yields:
        AsyncSession: Database session for the current request
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            # Commit is handled explicitly in route handlers
            # This allows for better error handling and rollback control
        except Exception:
            # Rollback on any exception
            await session.rollback()
            raise
        finally:
            # Session is automatically closed by the context manager
            await session.close()

# ============================================================================
# Database Lifecycle Management
# ============================================================================

async def init_db():
    """
    Initialize database tables.
    
    This function creates all tables defined in the ORM models.
    Should be called during application startup.
    
    Note: In production, use Alembic migrations instead of create_all()
    """
    from .models import Base
    
    async with async_engine.begin() as conn:
        # Create all tables
        await conn.run_sync(Base.metadata.create_all)

async def close_db():
    """
    Close database connections.
    
    This function should be called during application shutdown
    to properly close all database connections and clean up resources.
    """
    await async_engine.dispose()

# ============================================================================
# Health Check Utility
# ============================================================================

async def check_db_health() -> bool:
    """
    Check database connectivity.
    
    Returns:
        bool: True if database is accessible, False otherwise
    """
    try:
        async with AsyncSessionLocal() as session:
            # Execute a simple query to verify connection
            await session.execute("SELECT 1")
            return True
    except Exception as e:
        print(f"Database health check failed: {e}")
        return False
