# Campus Placement & SDE Intern Tracker

[![Live Demo](https://img.shields.io/badge/Live_Demo-Online-success?style=for-the-badge&logo=railway)](https://placement-tracker-production-2c01.up.railway.app)
[![API Docs](https://img.shields.io/badge/API_Docs-Swagger-009688?style=for-the-badge&logo=fastapi)](https://placement-tracker-production-2c01.up.railway.app/docs)
[![Database](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)
[![GitHub](https://img.shields.io/badge/GitHub-Thota--Usha-181717?style=for-the-badge&logo=github)](https://github.com/Thota-Usha/placement-tracker)

> 🚀 **Live Deployed Website:** [https://placement-tracker-production-2c01.up.railway.app](https://placement-tracker-production-2c01.up.railway.app)  
> 📖 **Interactive Swagger API Docs:** [https://placement-tracker-production-2c01.up.railway.app/docs](https://placement-tracker-production-2c01.up.railway.app/docs)  
> 🗄️ **Cloud Database:** Hosted on Supabase (PostgreSQL 17)

---

## 📌 Project Overview

A production-grade full-stack web application designed for engineering students and campus placement cells to manage recruitment drives, verify CGPA eligibility cutoffs, schedule online assessments, and visualize real-time interview round progressions.

### 🌟 Key Highlights
* **Live Supabase PostgreSQL Database:** Real-time cloud persistence hosting student profiles, active placement drives, and application tracking records.
* **Registered Students Directory:** Transparent campus placement board displaying live student registrations, branches, and CGPA stats.
* **Automated Eligibility Checking:** Compares student CGPA against company minimum cutoffs before allowing application submission.
* **Stateless JWT Authentication:** Secure login and registration with bcrypt password hashing and token-based protected endpoints.
* **Relational Database Design:** Normalized schemas with foreign keys linking `placement_users` -> `company_drives` -> `applications`.
* **Dynamic Pipeline State Machine:** Real-time progression through `Applied` → `OA Scheduled` → `Interview Shortlisted` → `Offered 🎉` / `Rejected`.
* **Interactive Dashboard:** Responsive UI built with Tailwind CSS, live search & package filters, dynamic pipeline metrics, and preparation notes.

---

## 🛠️ Tech Stack

* **Backend:** Python 3.13, FastAPI, Uvicorn, Pydantic v2
* **Cloud Database & ORM:** Supabase Cloud PostgreSQL, SQLAlchemy 2.0 ORM, Psycopg2
* **Authentication:** JSON Web Tokens (PyJWT), Bcrypt password encryption
* **Frontend:** HTML5, Tailwind CSS, FontAwesome, JavaScript (Fetch API)
* **Cloud Deployment:** Railway (Continuous Deployment synced to GitHub)

---

## 📁 Project Structure

```
placement-tracker/
├── api/                     # Cloud serverless entrypoint
│   └── index.py
├── backend/                 # Python FastAPI Backend
│   ├── app/
│   │   ├── auth.py          # Password hashing (bcrypt) & JWT token handling
│   │   ├── database.py      # Database engine (Supabase PostgreSQL / SQLite fallback)
│   │   ├── models.py        # SQLAlchemy relational entities (placement_users, etc.)
│   │   ├── schemas.py       # Pydantic validation schemas
│   │   ├── main.py          # FastAPI application & pre-seeded company drives
│   │   └── routers/
│   │       ├── auth_router.py   # Signup, Login, Registered Students directory
│   │       ├── drives_router.py # Browse & search recruitment drives
│   │       └── apps_router.py   # Application tracking & metrics
│   ├── requirements.txt
│   └── venv/
├── frontend/                # Interactive Web Dashboard
│   ├── index.html           # Responsive client dashboard
│   └── app.js               # Client application logic & API integration
├── .vscode/                 # VS Code launch & settings
├── requirements.txt         # Root deployment dependencies
├── run.bat                  # One-click Windows desktop launcher
└── README.md
```

---

## 💻 How to Run Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Thota-Usha/placement-tracker.git
   cd placement-tracker
   ```

2. **One-Click Run (Windows):**
   Simply double-click the `run.bat` file in the project folder.

3. **Or run manually via terminal:**
   ```powershell
   cd backend
   .\venv\Scripts\Activate.ps1
   uvicorn app.main:app --reload --port 8080
   ```

4. **Open in your browser:**
   * Dashboard: `http://127.0.0.1:8080`
   * Swagger Docs: `http://127.0.0.1:8080/docs`

### 🔑 Demo Credentials Pre-Loaded:
* **Email:** `demo@student.edu`
* **Password:** `password123`
* Pre-seeded with recruitment drives from **Google, Microsoft, Amazon, Oracle, and JPMorgan Chase**.

---

## 👩‍💻 Author
* **Ushasree Thota**  
* GitHub: [@Thota-Usha](https://github.com/Thota-Usha)
