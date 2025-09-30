import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = os.getenv('SUPABASE_URL')
if not SQLALCHEMY_DATABASE_URL:
    raise ValueError("SUPABASE_URL environment variable is required. Set it to your Supabase PostgreSQL connection string (e.g., postgresql://[user]:[password]@[host]:[port]/[dbname]?sslmode=require)")

engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
