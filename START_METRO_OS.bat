@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found. Install Node.js 22 LTS, then run this file again.
  pause
  exit /b 1
)
if not exist node_modules (
  echo Installing Metro OS dependencies...
  call npm install
  if errorlevel 1 (
    echo Installation failed. Copy the error shown above and send it to support.
    pause
    exit /b 1
  )
)
echo Starting Metro OS...
call npm run dev
pause
