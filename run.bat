@echo off
title Markdown2PDF Kit Startup Script
echo ===================================================================
echo             KHOI DONG MARKDOWN2PDF KIT — SALES KIT GENERATOR
echo ===================================================================
echo.

:: 1. Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [LOI] Khong tim thay Node.js tren may tinh nay!
    echo Vui long tai xuong va cai dat Node.js tai: https://nodejs.org/
    echo.
    pause
    exit /b
)

:: 2. Check and install dependencies
if not exist node_modules (
    echo [THONG BAO] Phat hien chay lan dau.
    echo Dang tien hanh tu dong cai dat cac thu vien phu thuoc (npm install)...
    echo Vui long cho trong giay lat...
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo [LOI] Khong the cai dat cac thu vien! Vui long kiem tra ket noi Internet.
        pause
        exit /b
    )
    echo [OK] Cai dat thu vien thanh cong!
    echo.
)

:: 3. Launch browser and server
echo [OK] Dang khoi dong server tren cong 3000...
echo [OK] Tu dong mo trinh duyet den: http://localhost:3000
echo.

:: Wait 2 seconds and open browser
timeout /t 2 /nobreak >nul
start http://localhost:3000

:: Run node server
npm start

pause
