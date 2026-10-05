from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import CompanyDrive, User
from ..schemas import DriveCreate, DriveOut
from ..auth import get_current_user

router = APIRouter(prefix="/api/drives", tags=["Company Drives"])

@router.get("", response_model=List[DriveOut])
def list_drives(
    search: Optional[str] = Query(None, description="Search by company or role"),
    min_package: Optional[float] = Query(None, description="Filter by minimum LPA"),
    db: Session = Depends(get_db)
):
    query = db.query(CompanyDrive)
    if search:
        query = query.filter(
            CompanyDrive.company_name.ilike(f"%{search}%") | 
            CompanyDrive.role_title.ilike(f"%{search}%")
        )
    if min_package:
        query = query.filter(CompanyDrive.package_lpa >= min_package)
    return query.order_by(CompanyDrive.created_at.desc()).all()

@router.post("", response_model=DriveOut, status_code=status.HTTP_201_CREATED)
def create_drive(
    drive_data: DriveCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_drive = CompanyDrive(**drive_data.model_dump())
    db.add(new_drive)
    db.commit()
    db.refresh(new_drive)
    return new_drive

@router.get("/{drive_id}", response_model=DriveOut)
def get_drive(drive_id: int, db: Session = Depends(get_db)):
    drive = db.query(CompanyDrive).filter(CompanyDrive.id == drive_id).first()
    if not drive:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Drive with ID {drive_id} not found."
        )
    return drive
