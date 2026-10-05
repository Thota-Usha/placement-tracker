from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from ..database import get_db
from ..models import Application, CompanyDrive, User
from ..schemas import ApplicationCreate, ApplicationUpdate, ApplicationOut, ApplicationStats
from ..auth import get_current_user

router = APIRouter(prefix="/api/applications", tags=["Applications"])

@router.get("", response_model=List[ApplicationOut])
def get_user_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Fetch user's applications eagerly loading the related company drive
    applications = (
        db.query(Application)
        .options(joinedload(Application.drive))
        .filter(Application.user_id == current_user.id)
        .order_by(Application.updated_at.desc())
        .all()
    )
    return applications

@router.post("", response_model=ApplicationOut, status_code=status.HTTP_201_CREATED)
def apply_to_drive(
    app_data: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if drive exists
    drive = db.query(CompanyDrive).filter(CompanyDrive.id == app_data.drive_id).first()
    if not drive:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recruitment drive not found."
        )

    # Check eligibility (CGPA check)
    if current_user.cgpa < drive.min_cgpa:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ineligible: Your CGPA ({current_user.cgpa}) is below the required cutoff ({drive.min_cgpa})."
        )

    # Check if already applied
    existing_app = (
        db.query(Application)
        .filter(Application.user_id == current_user.id, Application.drive_id == app_data.drive_id)
        .first()
    )
    if existing_app:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already applied for this company drive."
        )

    new_app = Application(
        user_id=current_user.id,
        drive_id=app_data.drive_id,
        status="Applied",
        notes=app_data.notes or ""
    )
    db.add(new_app)
    db.commit()
    db.refresh(new_app)
    new_app.drive = drive
    return new_app

@router.put("/{app_id}", response_model=ApplicationOut)
def update_application(
    app_id: int,
    app_update: ApplicationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    application = (
        db.query(Application)
        .options(joinedload(Application.drive))
        .filter(Application.id == app_id, Application.user_id == current_user.id)
        .first()
    )
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found or unauthorized."
        )

    if app_update.status is not None:
        valid_statuses = ["Applied", "OA_Scheduled", "Interview_Shortlisted", "Offered", "Rejected"]
        if app_update.status not in valid_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
            )
        application.status = app_update.status

    if app_update.notes is not None:
        application.notes = app_update.notes

    db.commit()
    db.refresh(application)
    return application

@router.delete("/{app_id}", status_code=status.HTTP_204_NO_CONTENT)
def withdraw_application(
    app_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    application = (
        db.query(Application)
        .filter(Application.id == app_id, Application.user_id == current_user.id)
        .first()
    )
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found or unauthorized."
        )

    db.delete(application)
    db.commit()
    return None

@router.get("/stats", response_model=ApplicationStats)
def get_user_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    apps = db.query(Application).filter(Application.user_id == current_user.id).all()
    stats = {
        "total_applied": len(apps),
        "oa_scheduled": sum(1 for a in apps if a.status == "OA_Scheduled"),
        "interview_shortlisted": sum(1 for a in apps if a.status == "Interview_Shortlisted"),
        "offered": sum(1 for a in apps if a.status == "Offered"),
        "rejected": sum(1 for a in apps if a.status == "Rejected"),
    }
    return stats
