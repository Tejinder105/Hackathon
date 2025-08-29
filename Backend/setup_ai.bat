@echo off
REM BlueGuard AI Service Setup Script for Windows

echo Setting up BlueGuard AI Service...

REM Create virtual environment
python -m venv ml_service\venv

REM Activate virtual environment
call ml_service\venv\Scripts\activate.bat

REM Install Python dependencies
echo Installing Python dependencies...
pip install -r ml_service\requirements.txt

REM Train initial models
echo Training initial AI models...
cd ml_service
python train_models.py

REM Start AI service
echo Starting AI service...
start python ai_service.py

echo BlueGuard AI Service setup complete!
echo AI Service running on http://localhost:5001
echo Backend can now use AI predictions
pause
