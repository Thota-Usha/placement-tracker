import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Supabase PostgreSQL Connection String (IPv4 Pooler)
SUPABASE_DB_URL = "postgresql+psycopg2://postgres.gkvxiyuduccsaqrwyhfv:Ushasree%4016@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres"

DATABASE_URL = os.getenv("DATABASE_URL", SUPABASE_DB_URL)

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
