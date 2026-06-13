@echo off
setlocal enabledelayedexpansion
title Aimura AI - Share with friends
cd /d "%~dp0"

REM ============================================================
REM  Aimura AI - Share with friends (Windows)
REM  Double-click this file. It starts Aimura AI and opens a
REM  temporary PUBLIC link your friends can open in any browser,
REM  on any device - no install or account needed.
REM  Keep this window open while they test. Press Ctrl+C to stop.
REM ============================================================

set "PORT=3000"

where npm >nul 2>nul
if errorlevel 1 (
  echo Node.js is required. Install the LTS version from https://nodejs.org and try again.
  pause
  exit /b 1
)

if not exist "node_modules\.bin\next.cmd" (
  echo First run / fixing dependencies for Windows. This can take a few minutes...
  if exist "node_modules" rmdir /s /q node_modules >nul 2>nul
  call npm install
  if errorlevel 1 ( echo Install failed - check your internet connection. & pause & exit /b 1 )
)

echo Starting Aimura AI on http://localhost:%PORT% ...
start "Aimura AI server" /min cmd /c "npm run dev -- --hostname 0.0.0.0 --port %PORT%"

echo Waiting a few seconds for the app to boot...
powershell -NoProfile -Command "Start-Sleep -Seconds 10" >nul 2>nul

echo.
echo ============================================================
echo   Creating a public link your friends can open...
echo   Share the https://... link that appears below.
echo   KEEP THIS WINDOW OPEN. Press Ctrl+C when you're done.
echo ============================================================
echo.

where cloudflared >nul 2>nul
if errorlevel 1 (
  echo (Using a no-install tunnel via npx localtunnel.)
  echo.
  call npx -y localtunnel --port %PORT%
) else (
  cloudflared tunnel --url "http://localhost:%PORT%"
)

pause
endlocal
