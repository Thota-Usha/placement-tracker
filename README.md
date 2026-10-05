# Campus Placement & Job Tracker

A full-stack web application designed for engineering students to track on-campus recruitment drives, eligibility cutoffs, online assessments, and interview round progressions.

---

## Project Structure

```
placement-tracker/
├── .vscode/                 # Pre-configured VS Code settings & F5 debugger
│   ├── launch.json
│   └── settings.json
├── backend/                 # Python FastAPI Backend
│   ├── app/
│   │   ├── auth.py          # JWT Token authentication & password hashing (bcrypt)
│   │   ├── database.py      # SQLAlchemy SQLite/PostgreSQL engine
│   │   ├── models.py        # Database entities (User, CompanyDrive, Application)
│   │   ├── schemas.py       # Pydantic request/response schemas
│   │   ├── main.py          # FastAPI application entrypoint & seed data
│   │   └── routers/
│   │       ├── auth_router.py   # Signup, Login, Profile endpoints
│   │       ├── drives_router.py # Browse & search campus recruitment drives
│   │       └── apps_router.py   # Student application tracking & stats
│   ├── requirements.txt     # Python dependencies
│   └── venv/                # Dedicated virtual environment
├── frontend/                # Interactive Tailwind Dashboard
│   ├── index.html
│   └── app.js
├── run.bat                  # One-click Windows desktop launcher (Port 8080)
└── README.md
```

---

## How to Run the Project (3 Easy Ways)

### Option 1: Double-Click `run.bat` (Easiest)
Simply double-click the **`run.bat`** file on your Desktop. It will start the server and automatically launch your browser!

### Option 2: From VS Code (F5)
1. Open this folder in VS Code (`File -> Open Folder -> Desktop -> placement-tracker`).
2. Press **F5** (or go to Run & Debug tab and click the Green Play button).

### Option 3: From Terminal
```powershell
cd "C:\Users\USHA SREE\Desktop\placement-tracker\backend"
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8080
```

---

## Access the Web App & APIs
* 👉 **Web Dashboard:** [http://127.0.0.1:8080](http://127.0.0.1:8080)
* 👉 **Interactive Swagger Docs:** [http://127.0.0.1:8080/docs](http://127.0.0.1:8080/docs)

### Demo Credentials Pre-Loaded
- **Email:** `demo@student.edu`
- **Password:** `password123`
- Pre-populated with recruitment drives from **Google, Microsoft, Amazon, Oracle, and JPMorgan Chase**.
