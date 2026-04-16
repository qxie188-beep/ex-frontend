@echo off
echo Starting Shi-Ai...
echo.

if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)

echo.
echo Please run these commands in separate terminals:
echo.
echo 1. Backend:
echo    cd backend
echo    python -m uvicorn app:app --host 0.0.0.0 --port 18000 --reload
echo.
echo 2. Frontend:
echo    npm run dev:frontend
echo.
echo Or run manually:
echo - Open terminal 1: cd backend ^&^& python -m uvicorn app:app --host 0.0.0.0 --port 18000 --reload
echo - Open terminal 2: npm run dev:frontend
echo.
pause
