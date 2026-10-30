import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.config import settings

# Look for ASYNC_DATABASE_URL or standard DATABASE_URL, fallback to config file settings
database_url = os.getenv("ASYNC_DATABASE_URL") or os.getenv("DATABASE_URL") or settings.ASYNC_DATABASE_URL

# Automatically patch the driver prefix if it's missing "+asyncpg"
if database_url and database_url.startswith("postgresql://"):
    database_url = database_url.replace("postgresql://", "postgresql+asyncpg://", 1)

# Pass the safe database_url variable to the engine
engine = create_async_engine(
    database_url,
    echo=False,
    pool_size=20,
    max_overflow=10,
    pool_pre_ping=True,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

class Base(DeclarativeBase):
    pass

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

