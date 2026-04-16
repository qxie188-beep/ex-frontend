@echo off
chcp 65001 >nul
title 逝爱 - 正在启动...

echo.
echo ========================================
echo           逝爱 - 启动中
echo ========================================
echo.

REM 检查是否安装了依赖
if not exist "node_modules" (
    echo [1/3] 正在安装前端依赖...
    call npm install
    if errorlevel 1 (
        echo.
        echo ❌ 前端依赖安装失败！
        echo 请确保已安装 Node.js
        pause
        exit /b 1
    )
    echo ✓ 前端依赖安装完成
    echo.
)

if not exist "backend\venv" (
    echo [2/3] 正在创建Python虚拟环境...
    cd backend
    python -m venv venv
    call venv\Scripts\activate.bat
    echo 正在安装后端依赖...
    pip install -r requirements.txt
    cd ..
    if errorlevel 1 (
        echo.
        echo ❌ 后端依赖安装失败！
        echo 请确保已安装 Python 3.10+
        pause
        exit /b 1
    )
    echo ✓ 后端依赖安装完成
    echo.
)

echo [3/3] 正在启动逝爱...
echo.
echo ========================================
echo   ✓ 前端: http://localhost:5173
echo   ✓ 后端: http://localhost:18000
echo ========================================
echo.
echo 提示：按 Ctrl+C 停止服务
echo.

call npm run dev

pause
