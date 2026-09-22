@echo off
setlocal
cd /d "%~dp0"

echo ========================================================
echo          AMR Game Space - Automated Startup
echo ========================================================
echo.

echo [1/3] Running: npm run install:all
call npm run install:all
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Failed to install dependencies!
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/3] Running: npm run build
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Build failed!
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [3/3] Running: npm run dev
call npm run dev

pause
