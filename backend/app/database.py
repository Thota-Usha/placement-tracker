import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

logger = logging.getLogger(__name__)

# Supabase PostgreSQL Connection String (IPv4 Pooler with SSL)
SUPABASE_DB_URL = "postgresql+psycopg2://postgres.gkvxiyuduccsaqrwyhfv:Ushasree%4016@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres?sslmode=require"

DATABASE_URL = os.environ.get("DATABASE_URL", SUPABASE_DB_URL)

try:
    if DATABASE_URL.startswith("sqlite"):
        engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    else:
        engine = create_engine(DATABASE_URL, pool_pre_ping=True, pool_recycle=300)
    # Test connection on startup
    with engine.connect() as conn:
        pass
    print("Database connected successfully!")
except Exception as e:
    logger.error(f"Failed to connect to primary database: {e}. Falling back to SQLite.")
    print(f"Warning: Primary database connection failed ({e}). Falling back to local SQLite.")
    DATABASE_URL = "sqlite:///./placement_tracker.db"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
