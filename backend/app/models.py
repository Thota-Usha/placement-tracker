from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), default="student")  # "student" or "coordinator"
    branch = Column(String(50), default="CSE")
    cgpa = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    applications = relationship("Application", back_populates="student", cascade="all, delete-orphan")


class CompanyDrive(Base):
    __tablename__ = "company_drives"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String(120), nullable=False, index=True)
    role_title = Column(String(120), nullable=False)
    package_lpa = Column(Float, nullable=False)  # e.g., 12.5 (Lakhs Per Annum)
    min_cgpa = Column(Float, default=6.0)
    location = Column(String(100), default="Remote / Hybrid")
    deadline = Column(String(50), nullable=False)  # YYYY-MM-DD
    oa_date = Column(String(50), nullable=True)    # Online Assessment Date
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    applications = relationship("Application", back_populates="drive", cascade="all, delete-orphan")


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    drive_id = Column(Integer, ForeignKey("company_drives.id"), nullable=False)
    status = Column(String(50), default="Applied")  
    # Status options: "Applied", "OA_Scheduled", "Interview_Shortlisted", "Offered", "Rejected"
    notes = Column(Text, default="")
    applied_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    student = relationship("User", back_populates="applications")
    drive = relationship("CompanyDrive", back_populates="applications")
