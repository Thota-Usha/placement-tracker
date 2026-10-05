import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# If running in Vercel serverless environment, use /tmp for SQLite
if os.getenv("VERCEL"):
    default_db = "sqlite:////tmp/placement_tracker.db"
else:
    default_db = "sqlite:///./placement_tracker.db"

DATABASE_URL = os.getenv("DATABASE_URL", default_db)

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
