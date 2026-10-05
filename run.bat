@echo off
title Campus Placement Tracker - Starting Server...
echo ========================================================
echo   Campus Placement & SDE Intern Tracker - Full Stack
echo ========================================================
echo.
cd /d "%~dp0backend"
echo [1/2] Activating Python Virtual Environment...
call venv\Scripts\activate.bat
echo [2/2] Starting FastAPI Server on http://127.0.0.1:8080 ...
echo.
echo 👉 Open in your browser: http://127.0.0.1:8080
echo 👉 Swagger API Docs:     http://127.0.0.1:8080/docs
echo.
start http://127.0.0.1:8080
uvicorn app.main:app --reload --host 127.0.0.1 --port 8080
pause
