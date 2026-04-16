@echo off
chcp 65001 >nul
title 逝爱

echo.
echo ╔════════════════════════════════════════╗
echo ║           逝爱 - 快速启动               ║
echo ╚════════════════════════════════════════╝
echo.

REM 检查Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 未找到 Python！
    echo 请先安装 Python 3.10 或更高版本
    echo 下载地址: https://www.python.org/downloads/
    echo.
    pause
    exit /b 1
)

REM 检查Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 未找到 Node.js！
    echo 请先安装 Node.js 18 或更高版本
    echo 下载地址: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo ✓ 环境检查通过
echo.

REM 一键安装并启动
if not exist "node_modules" (
    echo 正在安装依赖...
    call npm install
    cd backend
    if not exist "venv" (
        python -m venv venv
    )
    call venv\Scripts\activate.bat
    pip install -r requirements.txt -q
    cd ..
    echo.
)

echo 正在启动逝爱...
echo.
echo ┌─────────────────────────────────────────┐
echo │  前端地址: http://localhost:5173       │
echo │  后端地址: http://localhost:18000      │
echo └─────────────────────────────────────────┘
echo.
echo 提示：在浏览器中打开前端地址即可使用
echo.

call npm run dev

pause
