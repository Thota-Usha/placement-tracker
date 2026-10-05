# Campus Placement & SDE Intern Tracker

[![Live Demo](https://img.shields.io/badge/Live_Demo-Online-success?style=for-the-badge&logo=railway)](https://placement-tracker-production-2c01.up.railway.app)
[![API Docs](https://img.shields.io/badge/API_Docs-Swagger-009688?style=for-the-badge&logo=fastapi)](https://placement-tracker-production-2c01.up.railway.app/docs)
[![Database](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)
[![Python](https://img.shields.io/badge/Python-3.13-3776AB?style=for-the-badge&logo=python)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![GitHub](https://img.shields.io/badge/GitHub-Thota--Usha-181717?style=for-the-badge&logo=github)](https://github.com/Thota-Usha/placement-tracker)

> 🚀 **Live Website:** [https://placement-tracker-production-2c01.up.railway.app](https://placement-tracker-production-2c01.up.railway.app)  
> 📖 **Interactive Swagger API Docs:** [https://placement-tracker-production-2c01.up.railway.app/docs](https://placement-tracker-production-2c01.up.railway.app/docs)  
> 🗄️ **Cloud Database:** Hosted on Supabase Cloud (PostgreSQL 17 Transaction Pooler)

---

## 📌 Project Overview

A production-ready full-stack web application engineered for college students and placement cells to manage campus recruitment drives, verify CGPA eligibility cutoffs automatically, schedule online assessments, and visualize real-time recruitment round progressions through an interactive Kanban-style pipeline.

---

## 🌟 Key Highlights & Features

* **☁️ Cloud PostgreSQL Database (Supabase):** Integrated with Supabase Cloud PostgreSQL via IPv4 connection poolers and SQLAlchemy 2.0 ORM for high-throughput ACID persistence.
* **🎓 Live Registered Students Directory:** Transparent placement portal that displays real-time student registrations, graduation years, branches, and CGPA distributions.
* **⚡ Automated Cutoff Validation:** Prevents disqualified applications by automatically validating candidate CGPA against company minimum eligibility cutoffs before submission.
* **🔐 Stateless JWT Authentication:** Production-grade security featuring SHA-256 bcrypt salted password hashing and stateless JSON Web Token (JWT) Bearer authorization.
* **📊 Visual Recruitment Pipeline:** Dynamic state-machine tracking applications across 5 stages: `Applied` → `OA Scheduled` → `Interview Shortlisted` → `Offered 🎉` / `Rejected`.
* **🎨 Modern Responsive UI:** Clean dashboard styled with Tailwind CSS, supporting real-time drive search, salary package filters, status metrics, and company preparation notes.

---

## 🏗️ Architecture & Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                 Client Dashboard (Tailwind CSS)             │
│   • Drive Search & Filters   • CGPA Eligibility Checker    │
│   • Application Pipeline     • Registered Students Board    │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / REST (JSON)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   FastAPI Backend Service                   │
│   • Auth Router (JWT / Bcrypt)    • Drives Management       │
│   • Application Pipeline Engine   • Pydantic Schema Guard   │
└──────────────────────────────┬──────────────────────────────┘
                               │ SQLAlchemy ORM (Psycopg2)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│            Supabase Cloud PostgreSQL Database               │
│   • placement_users       • company_drives   • applications │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Backend** | Python 3.13, FastAPI, Uvicorn, Pydantic v2 |
| **Database & ORM** | Supabase Cloud PostgreSQL 17, SQLAlchemy 2.0, Psycopg2-binary |
| **Security & Auth** | PyJWT (JSON Web Tokens), Passlib / Bcrypt |
| **Frontend** | HTML5, JavaScript (Fetch API), Tailwind CSS, FontAwesome 6 |
| **Deployment & CI/CD** | Railway Cloud (Auto-deploy on GitHub push), Procfile, Nixpacks |

---

## 📡 REST API Documentation

The backend provides fully documented interactive OpenAPI/Swagger endpoints accessible at `/docs`:

| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `POST` | `/api/auth/register` | Register a new student profile | No |
| `POST` | `/api/auth/login` | Authenticate student and obtain Bearer JWT token | No |
| `GET` | `/api/auth/me` | Fetch authenticated student profile | **Yes (Bearer)** |
| `GET` | `/api/applications/registered-students` | Public live directory of all registered students | No |
| `GET` | `/api/drives` | List campus recruitment drives with search and filters | No |
| `GET` | `/api/drives/{drive_id}` | Retrieve specific company drive details | No |
| `POST` | `/api/applications` | Submit application with automated CGPA eligibility check | **Yes (Bearer)** |
| `GET` | `/api/applications` | Retrieve student's application history | **Yes (Bearer)** |
| `GET` | `/api/applications/stats` | Application pipeline metrics (applied, OA, interviews, offers) | **Yes (Bearer)** |
| `PUT` | `/api/applications/{app_id}` | Update application status (`OA_Scheduled`, `Offered`, etc.) | **Yes (Bearer)** |

---

## 📁 Repository Structure

```
placement-tracker/
├── backend/                 # Python FastAPI Backend
│   ├── app/
│   │   ├── auth.py          # Bcrypt hashing & PyJWT token management
│   │   ├── database.py      # Resilient Supabase pooler engine with SQLite fallback
│   │   ├── models.py        # SQLAlchemy models (placement_users, drives, apps)
│   │   ├── schemas.py       # Pydantic validation models
│   │   ├── main.py          # FastAPI application & static route serving
│   │   └── routers/
│   │       ├── auth_router.py   # Auth, user profiles & student directory
│   │       ├── drives_router.py # Recruitment drives catalog & search
│   │       └── apps_router.py   # Applications lifecycle & metrics
│   └── requirements.txt     # Backend dependency manifest
├── frontend/                # Interactive Web Dashboard
│   ├── index.html           # Single-page responsive dashboard
│   └── app.js               # Client application logic & API integration
├── api/                     # Cloud entrypoint
│   └── index.py
├── Procfile                 # Railway process launcher
├── railway.json             # Nixpacks container build definition
├── main.py                  # Root execution entrypoint
├── requirements.txt         # Root deployment dependencies
├── run.bat                  # One-click Windows desktop launcher
└── README.md                # Project documentation
```

---

## 💻 How to Run Locally

### Option 1: One-Click Run (Windows)
Double-click the **`run.bat`** file in the root folder. It activates the virtual environment and starts the server on port `8080`.

### Option 2: Terminal Execution
```powershell
# 1. Clone the repository
git clone https://github.com/Thota-Usha/placement-tracker.git
cd placement-tracker

# 2. Navigate to backend & activate virtual environment
cd backend
.\venv\Scripts\Activate.ps1

# 3. Start Uvicorn server
uvicorn backend.app.main:app --reload --port 8080
```

### Access Ports:
* **Dashboard:** [http://127.0.0.1:8080](http://127.0.0.1:8080)
* **Swagger API Docs:** [http://127.0.0.1:8080/docs](http://127.0.0.1:8080/docs)

### 🔑 Pre-Loaded Demo Credentials:
* **Email:** `demo@student.edu`
* **Password:** `password123`
* *Pre-seeded with recruitment drives from Google, Microsoft, Amazon, Oracle, and JPMorgan Chase.*

---

## 📄 Resume Bullet Points (For SDE / Full-Stack Intern Roles)

```markdown
• Developed and deployed a full-stack Campus Placement Tracking platform using Python (FastAPI), SQLAlchemy, and Supabase Cloud PostgreSQL, serving real-time application pipelines for 5+ top tech recruitment drives.
• Implemented stateless JWT Bearer authentication with bcrypt password hashing and an automated CGPA validation engine to prevent disqualified student submissions.
• Architected a normalized relational database schema with PostgreSQL connection pooling and containerized CI/CD deployment on Railway.
```

---

## 👩‍💻 Author

* **Ushasree Thota**  
* GitHub: [@Thota-Usha](https://github.com/Thota-Usha)  
* B.Tech Computer Science & Engineering (Class of 2026)
