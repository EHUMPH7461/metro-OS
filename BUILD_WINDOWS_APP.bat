@echo off
setlocal
cd /d "%~dp0"
title Build Metro OS Windows App

echo ========================================
echo   Metro OS Windows Application Builder
echo ========================================
echo.

where node >nul 2>nul || (
  echo Node.js was not found. Install Node.js 22 LTS first.
  pause
  exit /b 1
)

echo Installing a clean set of project packages...
if exist package-lock.json (
  call npm ci
) else (
  call npm install
)
if errorlevel 1 goto :error

echo.
echo Running Metro OS checks...
call npm run verify
if errorlevel 1 goto :error

echo.
echo Building Metro OS installer and portable app...
call npm run dist:win
if errorlevel 1 goto :error

echo.
echo Build complete.
echo The RELEASE folder contains the installer and portable application.
start "" "%~dp0release"
pause
exit /b 0

:error
echo.
echo The build did not finish. Copy the error shown above and send it to ChatGPT.
pause
exit /b 1
