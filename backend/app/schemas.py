from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr

# --- Auth & User Schemas ---
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    branch: Optional[str] = "CSE"
    cgpa: Optional[float] = 7.5

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    branch: str
    cgpa: float
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut


# --- Company Drive Schemas ---
class DriveBase(BaseModel):
    company_name: str
    role_title: str
    package_lpa: float
    min_cgpa: float = 6.0
    location: str = "Bangalore / Hyderabad"
    deadline: str
    oa_date: Optional[str] = None
    description: Optional[str] = None

class DriveCreate(DriveBase):
    pass

class DriveOut(DriveBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# --- Application Schemas ---
class ApplicationCreate(BaseModel):
    drive_id: int
    notes: Optional[str] = ""

class ApplicationUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None

class ApplicationOut(BaseModel):
    id: int
    user_id: int
    drive_id: int
    status: str
    notes: Optional[str]
    applied_at: datetime
    updated_at: datetime
    drive: Optional[DriveOut] = None

    class Config:
        from_attributes = True

class ApplicationStats(BaseModel):
    total_applied: int
    oa_scheduled: int
    interview_shortlisted: int
    offered: int
    rejected: int
