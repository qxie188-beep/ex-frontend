@echo off
echo Starting Backend...
cd backend
python -m uvicorn app:app --host 0.0.0.0 --port 18000 --reload
pause
