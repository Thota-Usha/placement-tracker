from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base, SessionLocal
from .models import CompanyDrive, User
from .auth import hash_password
from .routers import auth_router, drives_router, apps_router

# Create all database tables
Base.metadata.create_all(bind=engine)

def seed_initial_data():
    """Populate sample campus drives and demo student on first run"""
    db = SessionLocal()
    try:
        # Check if drives exist
        if db.query(CompanyDrive).count() == 0:
            sample_drives = [
                CompanyDrive(
                    company_name="Google",
                    role_title="Software Engineering Intern",
                    package_lpa=25.0,
                    min_cgpa=8.0,
                    location="Hyderabad / Bangalore",
                    deadline="2026-11-15",
                    oa_date="2026-11-20",
                    description="Summer SDE Internship role focusing on backend systems, algorithms, and distributed computing."
                ),
                CompanyDrive(
                    company_name="Microsoft",
                    role_title="SDE Intern",
                    package_lpa=22.0,
                    min_cgpa=7.5,
                    location="Hyderabad",
                    deadline="2026-11-10",
                    oa_date="2026-11-18",
                    description="Full-stack and cloud infrastructure development using C#, Python, and Azure services."
                ),
                CompanyDrive(
                    company_name="Amazon",
                    role_title="Software Development Engineer Intern",
                    package_lpa=20.0,
                    min_cgpa=7.0,
                    location="Bangalore",
                    deadline="2026-11-25",
                    oa_date="2026-11-30",
                    description="Building customer-facing services with low latency and high availability."
                ),
                CompanyDrive(
                    company_name="Oracle",
                    role_title="Associate Software Engineer",
                    package_lpa=16.5,
                    min_cgpa=7.0,
                    location="Bangalore",
                    deadline="2026-12-05",
                    oa_date="2026-12-10",
                    description="Database internal tools, cloud infrastructure, and modern microservices."
                ),
                CompanyDrive(
                    company_name="JPMorgan Chase",
                    role_title="Software Analyst",
                    package_lpa=18.0,
                    min_cgpa=7.5,
                    location="Mumbai / Bangalore",
                    deadline="2026-11-28",
                    oa_date="2026-12-02",
                    description="Fintech engineering, high-throughput transaction processing, and security."
                )
            ]
            db.add_all(sample_drives)
            db.commit()

        # Check if demo student exists
        if db.query(User).filter(User.email == "demo@student.edu").first() is None:
            demo_user = User(
                name="Demo Student",
                email="demo@student.edu",
                hashed_password=hash_password("password123"),
                branch="CSE",
                cgpa=8.2
            )
            db.add(demo_user)
            db.commit()
    finally:
        db.close()

# Seed database immediately
seed_initial_data()

@asynccontextmanager
async def lifespan(app: FastAPI):
    seed_initial_data()
    yield

app = FastAPI(
    title="Campus Placement & Internship Tracker API",
    description="Production-grade RESTful API for tracking campus recruitment drives, student eligibility, and interview statuses.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import os
from fastapi.staticfiles import StaticFiles

# Include API Routers
app.include_router(auth_router.router)
app.include_router(drives_router.router)
app.include_router(apps_router.router)

# Mount frontend directory for full-stack single-port serving
frontend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend"))
if os.path.exists(frontend_path):
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")
else:
    @app.get("/")
    def health_check():
        return {
            "status": "healthy",
            "service": "Campus Placement Tracker API",
            "docs_url": "/docs"
        }
