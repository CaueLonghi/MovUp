@echo off
echo Starting MovUp Video Analysis API...

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Python is not installed. Please install Python first.
    pause
    exit /b 1
)

REM Navigate to AI directory
cd /d "%~dp0AI"

REM Check if virtual environment exists, create if not
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt

REM Start the FastAPI server
echo Starting FastAPI server on http://127.0.0.1:8000
echo API Documentation available at: http://127.0.0.1:8000/docs
echo Press Ctrl+C to stop the server
python root.py

pause
